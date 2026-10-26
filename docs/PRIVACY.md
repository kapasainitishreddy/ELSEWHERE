# ELSEWHERE privacy model — Chronal Veil 0.3

## Default local-mode design

**Data**: An AES-256-GCM ciphertext envelope in browser localStorage stores the complete game and past/present/future character histories, both parallel branches, stored future-self letters, hours, debts, game credit balances and questions. Salt and IV are public metadata. A PBKDF2-SHA256 key is derived from a user-supplied passphrase with 310,000 iterations; the key itself is not written to storage.

**Flows**: On first unlock, migrate old plaintext saves only after successful ciphertext persistence, then delete the old `syrava.elsewhere.v1` key. Subsequent saves use new random IVs. Import/export exchanges **only** the encrypted backup and its metadata. Users transfer the file manually; no browser-cloud, Google Drive, automatic telemetry or multiplayer account is enabled. The default dialogue engine is authored and local. The separately started optional Ollama process can generate NPC dialogue entirely on the same computer.

**Other storage**: Browser HTTP cache and the production service worker may store publicly served code/assets, not personal saves or API responses. The passphrase and decrypted game data live in active browser memory while playing. Lock clears the JavaScript key reference, but a browser/OS may hold copies until memory is reclaimed. Never promise perfect erasure.

**Where privacy stops**: A website visit creates ordinary hosting/CDN access logs unless the app is hosted locally. A malicious browser add-on, operating-system compromise, injected or updated JavaScript or screen-capture application could read unlocked content. App-source review, HTTPS, strong passphrases, browser hardening and offline local use matter. The HTML shell blocks third-party font and script hosts through a strict first-party Content Security Policy. There is no zero-knowledge network sync because there is no automatic sync at all.

## Optional on-device AI, off by default

An on-device model can be used without Meta or another cloud provider. `npm run dev:local-ai` launches a first-party bridge bound to `127.0.0.1:8788`; Ollama must separately be installed and running at `127.0.0.1:11434`. Player-facing opt-in is required each vault session. The bridge accepts JSON only from the game's known local development origins, uses an extra custom header to deter cross-site requests, rejects oversized inputs, and forwards requests **only** to the hard-coded loopback Ollama endpoint. The configured model name is checked against a simple safe-character allowlist.

Only the selected character's bounded prior memories, three recent dialogue turns, the typed question and an allowlisted fictional summary go to these loopback processes. The private letter, other branches, passphrase, complete vault and other characters' memories are excluded. The first-party bridge writes no personal request logs, has no persistence, responds with `Cache-Control: no-store`, and limits concurrent generations. Model replies are displayed as fiction and saved in the AES vault. No AI response may directly mutate actual game state. If inference fails, authored dialogue remains available.

**Threat boundary:** local plaintext exists in browser RAM and the local Ollama process during inference. If a local Ollama deployment is modified to forward prompts, or if the computer or hosted site is compromised, the game cannot guarantee protection. The game does not inspect or control Ollama's own independent logging or plugins. Local inference is entirely optional and is never the default.

## Optional cloud demonstration, off by default

For Meta hackathon testing only, a separately started `server.mjs` can relay a *user-consented* prompt to Meta Model API. Enabling Meta mode is optional and clearly identified as **NOT private/offline**. The bridge is not started by `npm run dev`. The request contains the immediate typed prompt and a small allowlisted fictional game summary. The bridge deliberately strips any field carrying a private letter, prior conversation, NPC memory, passphrase or full timeline. **The typed prompt and fictional game summary still leave the device** and are subject to the provider's own processing policies, which must be reviewed before actual use. This mode resets to disabled at every unlock/reload.

Meta model use in a demo is not the same as privacy-preserving local inference. No user data is used for training **by the local game code**, but this project cannot make claims about third-party processing once the separate Meta bridge is enabled. Users who require strict local mode should never enable it.

## Safeguards and limitations

| Asset | Current protection | Remaining risk |
| --- | --- | --- |
| Passphrase | Never stored or sent by local gameplay | Weak/reused passphrase or infected client |
| Timeline, economy, choices | AES-256-GCM ciphertext at rest | Compromised browser while unlocked |
| NPC memory, private letters | Included in encrypted vault | Visible in active DOM once unlocked |
| Cross-device transfer | Manually exported ciphertext, imported with passphrase | Accidental disclosure of passphrase/file, no recovery |
| Optional on-device model | Explicit loopback-only bridge, opt-in each session and allowlisted NPC context | Compromised machine, separate model runtime configuration or malicious local software |
| Optional cloud demo | Explicit per-session opt-in; only immediate prompt + allowlisted fiction | The disclosed values leave the device |
| Offline caching | Same-origin public assets only, excludes `/api` and `/private` | Cache/old service worker can serve outdated source |

## Pre-release audit still needed

Static source review and automated tests do **not** constitute an independent security audit. Required before collecting real user content: dependency/advisory scan, browser networking inspection, service-worker update testing, CSP verification, export/import size/fuzz checks, DOM injection audit, key/secret leakage check, and physical device/OS threat-model review. Never enter actual account passwords or financial details into fictional prompts.
