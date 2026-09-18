// Fail fast, and legibly, when the dev agent channel is not up.
//
// Without this the first real command fails deep inside a flow with a generic
// runScript error, which is exactly the new source of flake a socket introduces
// (typically: the app reloaded and never reconnected). Run it as the first step
// of any flow that uses the agent.
//
// It is deliberately NOT in .maestro/config.yaml's onFlowStart: the shared Pay
// flows are copied into this same directory by CI, and a global hook would
// impose the daemon on flows that neither need nor start it.

var DAEMON = typeof DAEMON_URL !== 'undefined' && DAEMON_URL
  ? DAEMON_URL
  : 'http://localhost:7789';

var res = http.get(DAEMON + '/health');

if (!res.ok && res.status !== 200) {
  throw 'dev agent: no daemon on ' + DAEMON + '. ' +
    'Start it with: node wallets/rn_cli_wallet/scripts/dev-agent-daemon.js';
}

var parsed = json(res.body);

if (!parsed.connected) {
  throw 'dev agent: daemon is up but no app is connected. Check that the build ' +
    'was made with EXPO_PUBLIC_DEV_AGENT=true, that the app is running, and ' +
    '(Android) that it can reach the host at 10.0.2.2:7788.';
}

output.agentReady = true;
