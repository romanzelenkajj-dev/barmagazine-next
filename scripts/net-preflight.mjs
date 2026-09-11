// Network preflight for the send scripts.
//
// 2026-09-11: wave 3b's launchd firing died on getaddrinfo ENOTFOUND before
// the first send - the Mac's Wi-Fi was not up yet when the job ran. A send
// wave must wait out a sleeping network, not crash on it: resolve the target
// host and retry for up to a few minutes before starting.
//
// Resolves cleanly or throws after the timeout; the caller decides whether
// that aborts the run (it should - better a loud abort than a half-woken DNS).

import { lookup } from 'node:dns/promises';

export async function waitForNetwork(url, { timeoutMs = 300_000, intervalMs = 15_000 } = {}) {
  const hostname = new URL(url).hostname;
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;
  while (true) {
    attempt++;
    try {
      await lookup(hostname);
      if (attempt > 1) console.log(`[preflight] ${hostname} resolved on attempt ${attempt}`);
      return;
    } catch (err) {
      if (Date.now() + intervalMs > deadline) {
        throw new Error(
          `[preflight] ${hostname} still unresolvable after ${Math.round(timeoutMs / 1000)}s (${err.code || err.message}); aborting before any send`
        );
      }
      console.log(`[preflight] ${hostname} not resolvable yet (${err.code || err.message}); retrying in ${intervalMs / 1000}s`);
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }
}
