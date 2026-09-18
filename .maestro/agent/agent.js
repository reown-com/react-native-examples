// Bridge: Maestro flow -> dev-agent daemon -> the running app.
//
// Maestro's runScript runs in its own JS engine with an http client and an
// `output` object that the rest of the flow can read. That is the whole seam.
//
// Usage from a flow:
//   - runScript:
//       file: agent/agent.js
//       env: { CMD: "pair", ARGS: '{"uri":"https://..."}' }
//   then read ${output.result}
//
// Note: Maestro's JS engine has no setTimeout and no try/catch around http
// failures, so this stays deliberately plain.

var DAEMON = typeof DAEMON_URL !== 'undefined' && DAEMON_URL
  ? DAEMON_URL
  : 'http://localhost:7789';

var body = {
  cmd: CMD,
  args: JSON.parse(typeof ARGS !== 'undefined' && ARGS ? ARGS : '{}'),
};

var res = http.post(DAEMON + '/cmd', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

if (!res.ok && res.status !== 200) {
  // 503 is the daemon saying it could not reach the app — the most common
  // failure by far, so name the likely causes instead of dumping a status code.
  throw 'dev agent: HTTP ' + res.status + ' from daemon for "' + CMD + '". ' +
    'Is the app running with EXPO_PUBLIC_DEV_AGENT=true and connected? ' +
    'Body: ' + res.body;
}

var parsed = json(res.body);

if (!parsed.ok) {
  throw 'dev agent: command "' + CMD + '" failed in the app: ' + parsed.error;
}

output.result = parsed.result;
output.elapsedMs = parsed.elapsedMs;
