/**
 * Dev agent — an RPC channel into a running build, for E2E flows.
 *
 * JS cannot open a server socket without a native module, so the roles are
 * inverted (the same trick Metro and React DevTools use): the app is the
 * WebSocket *client* and `scripts/dev-agent-daemon.js` is the server. Maestro
 * talks to the daemon over HTTP; the daemon relays.
 *
 * Gated on EXPO_PUBLIC_DEV_AGENT so enabling it is a deliberate, visible build
 * decision rather than a side effect of `__DEV__`. CI already builds an
 * explicit `internal` variant, which is the right place for it.
 *
 * DESIGN RULE: commands go through the same entry points the UI uses —
 * `PairingUtil.handleUriOrPaymentLink` is what the camera, the test-mode paste
 * field, deep links and NFC all call. The agent must not reach past the UI into
 * the stores to fake a state the user could never produce, or the tests stop
 * meaning anything.
 */
import { Platform } from 'react-native';
import { snapshot } from 'valtio';

import { ENV } from '@/utils/env';
import LogStore from '@/store/LogStore';
import ModalStore from '@/store/ModalStore';
import PaymentStore from '@/store/PaymentStore';
import SettingsStore from '@/store/SettingsStore';
import { handleUriOrPaymentLink } from '@/utils/PairingUtil';
import { navigationRef } from '@/utils/navigationRef';
import { queryTestId } from '@/utils/agentQuery';

const PORT = 7788;
const MAX_BACKOFF_MS = 5000;

export function isDevAgentEnabled() {
  return ENV.DEV_AGENT === 'true';
}

/**
 * The Android emulator reaches the host machine at 10.0.2.2; the iOS simulator
 * and web share the host's loopback directly. No `adb reverse` needed — this is
 * the same magic host the CI pipeline already uses to reach a local pay-core.
 */
function daemonUrl() {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `ws://${host}:${PORT}`;
}

/** Strips valtio proxies and `ref()`-wrapped natives down to plain JSON. */
function plain<T>(value: T): unknown {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

type Handler = (args: Record<string, any>) => unknown | Promise<unknown>;

const commands: Record<string, Handler> = {
  ping: () => ({
    ok: true,
    platform: Platform.OS,
    // Lets a flow prove it is driving the build it thinks it is.
    payApiBaseUrl: ENV.PAY_API_BASE_URL ?? null,
    testMode: ENV.TEST_MODE === 'true',
  }),

  /**
   * The whole point of the exercise: assert against the domain rather than a
   * rendered label, so copy changes and render timing stop causing failures.
   */
  state: () => {
    const payment = snapshot(PaymentStore.state);
    const modal = snapshot(ModalStore.state);
    const settings = snapshot(SettingsStore.state);

    return {
      payment: plain({
        step: payment.step,
        previousStep: payment.previousStep,
        resultStatus: payment.resultStatus,
        resultMessage: payment.resultMessage,
        resultErrorType: payment.resultErrorType,
        errorMessage: payment.errorMessage,
        selectedOptionId: (payment.selectedOption as any)?.id ?? null,
        expiresAt: payment.expiresAt,
      }),
      modal: plain({ open: modal.open, view: modal.view }),
      settings: plain({
        eip155Address: settings.eip155Address,
        socketStatus: settings.socketStatus,
        walletReadiness: settings.walletReadiness,
      }),
      nav: plain(navigationRef.isReady() ? navigationRef.getRootState() : null),
    };
  },

  /** Same function the scanner, the paste field, deep links and NFC call. */
  pair: async ({ uri }) => {
    if (!uri) throw new Error('pair requires a "uri" argument');
    await handleUriOrPaymentLink(uri);
    return { paired: true };
  },

  navigate: ({ screen, params }) => {
    if (!screen) throw new Error('navigate requires a "screen" argument');
    if (!navigationRef.isReady())
      throw new Error('navigation is not ready yet');
    (navigationRef.navigate as any)(screen, params);
    return { screen };
  },

  back: () => {
    if (!navigationRef.isReady())
      throw new Error('navigation is not ready yet');
    if (!navigationRef.canGoBack()) throw new Error('nothing to go back to');
    navigationRef.goBack();
    return { wentBack: true };
  },

  closeModal: () => {
    ModalStore.close();
    return { closed: true };
  },

  /**
   * Where the element is, so Maestro can tap that point with a real OS touch
   * instead of dumping the view hierarchy to find it.
   */
  query: ({ testID }) => {
    if (!testID) throw new Error('query requires a "testID" argument');
    return queryTestId(testID);
  },
};

let socket: WebSocket | null = null;
let attempt = 0;
let stopped = false;

function connect() {
  if (stopped) return;

  socket = new WebSocket(daemonUrl());

  socket.onopen = () => {
    attempt = 0;
    LogStore.log(
      `dev agent connected to ${daemonUrl()}`,
      'devAgent',
      'connect',
    );
  };

  socket.onmessage = async event => {
    let request: { id?: string; cmd?: string; args?: Record<string, any> };
    try {
      request = JSON.parse(String(event.data));
    } catch {
      return;
    }

    const { id, cmd, args } = request;
    if (!id || !cmd) return;

    const handler = commands[cmd];
    if (!handler) {
      socket?.send(
        JSON.stringify({
          id,
          ok: false,
          error: `unknown command "${cmd}" (known: ${Object.keys(commands).join(
            ', ',
          )})`,
        }),
      );
      return;
    }

    try {
      const result = await handler(args || {});
      socket?.send(JSON.stringify({ id, ok: true, result }));
    } catch (error: any) {
      socket?.send(
        JSON.stringify({
          id,
          ok: false,
          error: error?.message ?? String(error),
        }),
      );
    }
  };

  const reconnect = () => {
    socket = null;
    if (stopped) return;
    // Backoff caps quickly: a flow waiting on the health check should not sit
    // through a minute of exponential retreat after a reload.
    attempt += 1;
    setTimeout(connect, Math.min(250 * 2 ** (attempt - 1), MAX_BACKOFF_MS));
  };

  socket.onclose = reconnect;
  socket.onerror = () => {
    // The daemon simply may not be running; that is not an app error.
    socket?.close();
  };
}

export function startDevAgent() {
  if (!isDevAgentEnabled() || socket) return;
  stopped = false;
  LogStore.log('dev agent starting', 'devAgent', 'startDevAgent');
  connect();
}

export function stopDevAgent() {
  stopped = true;
  socket?.close();
  socket = null;
}
