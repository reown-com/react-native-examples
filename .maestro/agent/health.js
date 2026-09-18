// Fail fast, and legibly, when the dev agent channel is not up.
//
// Without this the first real command fails deep inside a flow with a generic
// runScript error, which is exactly the new source of flake a socket introduces.
// Run it as the first step of any flow that uses the agent, AND again after a
// launchApp: `clearState` restarts the app, and its reconnect is asynchronous,
// so the pre-launch check says nothing about the instance the flow will drive.
//
// Two failure modes, deliberately treated differently:
//   - daemon unreachable  -> a setup mistake. Fail now; retrying cannot help.
//   - daemon up, no app   -> a race with the app's reconnect. Worth waiting for.
//
// It is deliberately NOT in .maestro/config.yaml's onFlowStart: the shared Pay
// flows are copied into this same directory by CI, and a global hook would
// impose the daemon on flows that neither need nor start it.

var DAEMON = typeof DAEMON_URL !== 'undefined' && DAEMON_URL
  ? DAEMON_URL
  : 'http://localhost:7789';

// Maestro's JS engine has no setTimeout, so waiting means burning cycles. Keep
// the budget small and bounded — the agent's reconnect backoff caps at 5s.
var ATTEMPTS = 12;
var WAIT_MS = 500;

var connected = false;
var lastBody = '';

for (var i = 0; i < ATTEMPTS; i++) {
  var res = http.get(DAEMON + '/health');

  if (!res.ok && res.status !== 200) {
    throw 'dev agent: no daemon on ' + DAEMON + ' (HTTP ' + res.status + '). ' +
      'Start it with: node wallets/rn_cli_wallet/scripts/dev-agent-daemon.js';
  }

  lastBody = res.body;
  if (json(res.body).connected) {
    connected = true;
    break;
  }

  var until = Date.now() + WAIT_MS;
  while (Date.now() < until) {
    // Busy-wait: no timers available here.
  }
}

if (!connected) {
  throw 'dev agent: daemon is up but no app connected after ' +
    (ATTEMPTS * WAIT_MS / 1000) + 's. Check that the build was made with ' +
    'EXPO_PUBLIC_DEV_AGENT=true, that the app is running, and (Android) that ' +
    'it can reach the host at 10.0.2.2:7788. Last /health: ' + lastBody;
}

output.agentReady = true;
