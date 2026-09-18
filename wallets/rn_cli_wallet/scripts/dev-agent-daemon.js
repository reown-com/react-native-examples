#!/usr/bin/env node
/**
 * Dev-agent daemon — the relay between Maestro and a running app build.
 *
 * The app cannot open a server socket from JS without a native module, so the
 * roles are inverted (same trick Metro and React DevTools use): the app is the
 * WebSocket *client* and this daemon is the server.
 *
 *   app  --WS-->  :7788  (dev-agent channel)
 *   Maestro --HTTP-->  :7789  (POST /cmd, GET /health)
 *
 * Deliberately dependency-free: it speaks just enough of RFC 6455 to talk to a
 * single client over text frames. Adding `ws` as a devDependency would touch
 * yarn.lock, which this repo's AGENTS.md warns against, and `ws` is only a
 * transitive dep here. Zero deps also means `node scripts/dev-agent-daemon.js`
 * works without installing anything.
 */

const http = require('http');
const crypto = require('crypto');

const WS_PORT = Number(process.env.DEV_AGENT_WS_PORT || 7788);
const HTTP_PORT = Number(process.env.DEV_AGENT_HTTP_PORT || 7789);
const REQUEST_TIMEOUT_MS = Number(process.env.DEV_AGENT_TIMEOUT_MS || 15000);
/**
 * A killed or backgrounded app can leave a half-open socket: no FIN arrives, so
 * `close` never fires, /health keeps reporting `connected` and every command
 * hangs until its timeout. Ping the client on this interval and drop it when a
 * pong doesn't come back, so the failure is fast and honest instead of cryptic.
 */
const HEARTBEAT_MS = Number(process.env.DEV_AGENT_HEARTBEAT_MS || 5000);
const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/** The single live app connection. A reconnect (reload) replaces it. */
let client = null;
let requestSequence = 0;
const pending = new Map();

function log(...args) {
  console.log(`[dev-agent ${new Date().toISOString()}]`, ...args);
}

/* ---------------------------------------------------------------- WebSocket */

/** Encodes a text frame. Server->client frames are never masked. */
function encodeTextFrame(text) {
  const payload = Buffer.from(text, 'utf8');
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 127;
    // Payloads never approach 2^32 here, so the high word stays zero.
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(length, 6);
  }
  header[0] = 0x81; // FIN + opcode 0x1 (text)

  return Buffer.concat([header, payload]);
}

/**
 * Pulls whole frames off a growing buffer. Returns the frames it could decode
 * and the remaining bytes, so a split TCP read never loses a partial frame.
 */
function decodeFrames(buffer) {
  const frames = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) === 0x80;
    let length = second & 0x7f;
    let cursor = offset + 2;

    if (length === 126) {
      if (cursor + 2 > buffer.length) break;
      length = buffer.readUInt16BE(cursor);
      cursor += 2;
    } else if (length === 127) {
      if (cursor + 8 > buffer.length) break;
      // Ignore the high word: frames this large don't occur on this channel.
      length = buffer.readUInt32BE(cursor + 4);
      cursor += 8;
    }

    let maskKey = null;
    if (masked) {
      if (cursor + 4 > buffer.length) break;
      maskKey = buffer.subarray(cursor, cursor + 4);
      cursor += 4;
    }

    if (cursor + length > buffer.length) break;

    const payload = Buffer.from(buffer.subarray(cursor, cursor + length));
    if (maskKey) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= maskKey[i % 4];
      }
    }
    cursor += length;

    frames.push({ opcode, payload });
    offset = cursor;
  }

  return { frames, rest: buffer.subarray(offset) };
}

function rejectAllPending(reason) {
  for (const [, entry] of pending) {
    clearTimeout(entry.timeout);
    entry.reject(new Error(reason));
  }
  pending.clear();
}

const wsServer = http.createServer((_req, res) => {
  res.writeHead(426, { 'Content-Type': 'text/plain' });
  res.end('This port speaks WebSocket only. Maestro should use the HTTP port.');
});

wsServer.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash('sha1')
    .update(key + WS_GUID)
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`,
  );
  socket.setNoDelay(true);

  if (client && !client.destroyed) {
    // A reload reconnects; the stale socket would otherwise linger and swallow
    // replies. Drop it so the newest app process owns the channel.
    log('replacing previous app connection (reload?)');
    client.destroy();
    rejectAllPending('app reconnected mid-request');
  }
  client = socket;
  log('app connected');

  // TCP-level keepalive catches a vanished peer; the frame-level ping below
  // catches an app that is still connected but wedged.
  socket.setKeepAlive(true, HEARTBEAT_MS);
  let awaitingPong = false;
  const heartbeat = setInterval(() => {
    if (socket.destroyed) return;
    if (awaitingPong) {
      log('no pong within heartbeat window — dropping stale app connection');
      socket.destroy();
      return;
    }
    awaitingPong = true;
    const ping = Buffer.from([0x89, 0x00]); // FIN + opcode 0x9 (ping), no payload
    socket.write(ping);
  }, HEARTBEAT_MS);

  let buffer = Buffer.alloc(0);

  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    const { frames, rest } = decodeFrames(buffer);
    buffer = rest;

    for (const frame of frames) {
      if (frame.opcode === 0x8) {
        socket.end();
        return;
      }
      if (frame.opcode === 0xa) {
        awaitingPong = false;
        continue;
      }
      if (frame.opcode === 0x9) {
        // Ping -> pong, keeping the opcode-0xA reply unmasked.
        const pong = encodeTextFrame('');
        pong[0] = 0x8a;
        socket.write(pong);
        continue;
      }
      if (frame.opcode !== 0x1) continue;

      let message;
      try {
        message = JSON.parse(frame.payload.toString('utf8'));
      } catch {
        log('ignoring non-JSON frame from app');
        continue;
      }

      const entry = pending.get(message.id);
      if (!entry) continue;
      pending.delete(message.id);
      clearTimeout(entry.timeout);
      entry.resolve(message);
    }
  });

  const drop = () => {
    clearInterval(heartbeat);
    if (client === socket) {
      client = null;
      log('app disconnected');
      rejectAllPending('app disconnected');
    }
  };
  socket.on('close', drop);
  socket.on('error', drop);
});

function sendCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    if (!client || client.destroyed) {
      reject(new Error('no app connected'));
      return;
    }

    requestSequence += 1;
    const id = `req-${requestSequence}`;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(
        new Error(
          `command "${cmd}" timed out after ${REQUEST_TIMEOUT_MS}ms (app connected but did not answer)`,
        ),
      );
    }, REQUEST_TIMEOUT_MS);

    pending.set(id, { resolve, reject, timeout });
    client.write(encodeTextFrame(JSON.stringify({ id, cmd, args: args || {} })));
  });
}

/* --------------------------------------------------------------------- HTTP */

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const httpServer = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, connected: Boolean(client && !client.destroyed) });
    return;
  }

  if (req.method !== 'POST' || req.url !== '/cmd') {
    sendJson(res, 404, { ok: false, error: 'use POST /cmd or GET /health' });
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', async () => {
    let parsed;
    try {
      parsed = JSON.parse(body || '{}');
    } catch {
      sendJson(res, 400, { ok: false, error: 'body is not valid JSON' });
      return;
    }

    if (!parsed.cmd) {
      sendJson(res, 400, { ok: false, error: 'missing "cmd"' });
      return;
    }

    const startedAt = Date.now();
    try {
      const reply = await sendCommand(parsed.cmd, parsed.args);
      const elapsedMs = Date.now() - startedAt;
      log(`${parsed.cmd} -> ${reply.ok ? 'ok' : 'error'} (${elapsedMs}ms)`);
      // 200 even for an in-app error: the relay worked. agent.js decides.
      sendJson(res, 200, { ...reply, elapsedMs });
    } catch (error) {
      log(`${parsed.cmd} -> relay failure: ${error.message}`);
      sendJson(res, 503, { ok: false, error: error.message });
    }
  });
});

wsServer.listen(WS_PORT, () => log(`WS  listening on :${WS_PORT} (app connects here)`));
httpServer.listen(HTTP_PORT, () => log(`HTTP listening on :${HTTP_PORT} (Maestro posts here)`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    log('shutting down');
    if (client) client.destroy();
    wsServer.close();
    httpServer.close();
    process.exit(0);
  });
}
