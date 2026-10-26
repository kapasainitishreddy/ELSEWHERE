# ELSEWHERE privacy model — Chronal Veil 0.3

## Default local-mode design

**Data**: An AES-256-GCM ciphertext envelope in browser localStorage stores the complete game and past/present/future character histories, both parallel branches, stored future-self letters, hours, debts, game credit balances and questions. Salt and IV are public metadata. A PBKDF2-SHA256 key is derived from a user-supplied passphrase with 310,000 iterations; the key itself is not written to storage.

**Flows**: On first unlock, migrate old plaintext saves only after successful ciphertext persistence, then delete the old `syrava.elsewhere.v1` key. Subsequent saves use new random IVs. Import/export exchanges **only** the encrypted backup and its metadata. Users transfer the file manually; no browser-cloud, Google Drive, automatic telemetry or multiplayer account is enabled. The app's actual dialogue engine is authored and local.

**Other storage**: Browser HTTP cache and the production service worker may store publicly served code/assets, not personal saves or API responses. The passphrase and decrypted game data live in active browser memory while playing. Lock clears the JavaScript key reference, but a browser/OS may hold copies until memory is reclaimed. Never promise perfect erasure.

**Where privacy stops**: A website visit creates ordinary hosting/CDN access logs unless the app is hosted locally. A malicious browser add-on, operating-system compromise, injected or updated JavaScript or screen-capture application could read unlocked content. App-source review, HTTPS, strong passphrases, browser hardening and offline local use matter. There is no zero-knowledge network sync because there is no automatic sync at all.

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
| Optional cloud demo | Explicit per-session opt-in; only immediate prompt + allowlisted fiction | The disclosed values leave the device |
| Offline caching | Same-origin public assets only, excludes `/api` and `/private` | Cache/old service worker can serve outdated source |

## Pre-release audit still needed

Static source review and automated tests do **not** constitute an independent security audit. Required before collecting real user content: dependency/advisory scan, browser networking inspection, service-worker update testing, CSP verification, export/import size/fuzz checks, DOM injection audit, key/secret leakage check, and physical device/OS threat-model review. Never enter actual account passwords or financial details into fictional prompts.
