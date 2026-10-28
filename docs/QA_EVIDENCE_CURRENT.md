# Current QA evidence — 2026-10-27

This is a record of commands actually run in the managed ELSEWHERE workspace. It is not a certification of a public release. Synthetic dialogue and local authored dialogue are clearly distinct from a live Meta inference.

## Baseline and environment

- Baseline repository commit: `f3ef0f0f60abfcb6c43e69a8cb25ae11e97a6cb6` (`main` at the time of check; working branch `codex/elsewhere-completion-20261027`). Remote `main` still resolved to that commit when checked; the working branch had no remote counterpart yet.
- Runtime used: Node `v24.19.0`, npm `11.9.0`, Chromium `154.0.8037.57`, Playwright `1.62.1`. Chromium ran headless with SwiftShader software WebGL. These checks do not measure physical GPU or Quest performance.
- `npm ci --no-audit --no-fund`: **PASS**, fresh dependency tree installed 21 packages from the new npm lockfile.
- `git diff --check`: **PASS**.
- The prior setup checkpoint reported the original `npm test` result as 212/213, failing `tests/meta-causal-exhibit.test.mjs` because the broad `/PRIVATE/` assertion treated the fictional public location `PRIVATE FOUNDRIES` as private player data. The original raw stack trace was not retained in this workspace; no stack is reconstructed here. The assertion now checks explicit synthetic player-data sentinels and still tests actual private-data leakage.

## Fixes reproduced

- **Reduced-motion scene initialization:** Chromium had shown `3D initialization failed: reducedMotion is not defined`. `createExperience` now passes its actual `reduceMotion` value to environment and physics stages. Regression test: `tests/worlds-reduced-motion.test.mjs`.
- **UI click interception:** the UI root itself carries `data-world`; generic `[data-world]` delegation intercepted action clicks. Navigation delegation now selects only `button[data-world]`. Regression test: `tests/ui-event-delegation.test.mjs`.
- **Future fate was missing from the 2087 arrival card:** the story surface only showed a generic altered status. The future card now renders the canonical causal audit's distinct 2087 headline/detail and recorded invention. `tests/causal-proof.test.mjs` verifies gift, patent, and auction plus the Aether Cell label.
- **Mobile resize overflow:** after a 1440→390 resize in Chromium, `innerWidth` was 390 while `documentElement.scrollWidth` and `#app` stayed 1440; the WebGL canvas also stayed 1440. The failing E2E reported the oversized canvas and shell. The shell width now follows its containing block (`100%`). The rerun passed with 390 viewport and 390 document width.
- **Meta contract validation:** structured responses now require exactly `reply`, `cue`, and `focus`, literal allowed enum values, bounded nonempty text, and safe dialogue. Plain text remains a safe reply fallback with `cue:null`/`focus:null`; malformed JSON, extras, oversize replies, HTML/script payloads, prompt override text, explicit resource awards, unsafe medical content, and invalid focus are rejected. The limiter mock was updated to the exact contract, not relaxed.
- **Missing favicon:** initial full E2E logged a 404 for `/favicon.ico`. `index.html` now points to the existing same-origin orbit icon. A separate Chromium startup/guest smoke after this change passed with zero console errors and zero failed requests.

## Executed checks

| Command | Result |
| --- | --- |
| `npm ci --no-audit --no-fund` | PASS — 21 packages installed from lockfile |
| `npm test` | PASS — 216 passed, 0 failed, 0 skipped |
| `npm run meta:check` | PASS — 9 passed, 0 failed |
| `npm run movement:check` | PASS — 8 passed, 0 failed |
| `npm run art:check` | PASS — 15 passed, 0 failed |
| `npm run arena:check` | PASS — 9 passed, 0 failed |
| `npm run submission:check` | PASS — 0 local reported failures; 5 manual gates remain |
| `npm run review:agents` | PASS — 11 PASS, 0 FAIL, 0 WARNING, 6 UNVERIFIED; verdict is correctly NO-GO |
| `npm run build` | PASS — Vite 7.3.7 production bundle built |
| `npm run test:e2e` | PASS — real Chromium 154 / WebGL SwiftShader: guest launch, canvas mount, no guest vault entry, 2046 authored dialogue, 1889 Aether Cell gift, grounded 2046 response to gift, distinct 2087 open-workshops outcome, 1440×900 to 390px responsive check |
| Chromium startup/guest smoke after favicon fix | PASS — canvas present, zero console errors, zero failed requests |

The production build warns that minified app chunks are approximately 1.02 MB and Rapier is approximately 4.34 MB (1.65 MB gzip); code splitting or download profiling remains open. Browser smoke also emitted SwiftShader `ReadPixels` GPU-stall warnings on the earlier run; these are software-renderer diagnostics, not physical-device performance results.

The E2E screenshots are real browser captures from synthetic guest gameplay and are ignored by Git under `review-output/`: `review-output/e2e/gate.png`, `guest-2087.png`, `future-self-dialogue.png`, `future-self-remembers-gift.png`, `future-2087-gift.png`, and `future-2087-mobile.png`. They show the rendered application, not mockups. No video was recorded. No FPS benchmark, physical Quest run, vault unlock flow, physics interaction browser path, or patent/auction browser replay was completed here.

## Explicitly unverified or blocked

- **Meta live/model documentation:** no live call was made; no credential or cost authorization was supplied. Attempt to open the official Meta API documentation at `https://llama.developer.meta.com/docs/api/` was BLOCKED by the managed network proxy (`CONNECT tunnel failed, response 403`; curl exit 56). Existing source targets `https://api.meta.ai/v1/chat/completions` and defaults to `muse-spark-1.3`, but those exact values remain UNVERIFIED against current official docs in this environment. Contract tests use mocked provider responses only.
- **Deployment, public API, submission, and video:** NOT PERFORMED per owner instruction. No live endpoint, preview deployment, public demo URL, or three-minute recording is claimed.
- **Quest and physical device performance:** UNVERIFIED. SwiftShader screenshots cannot establish desktop hardware frame rate or headset comfort.
- **Original work provenance and adult user feedback:** UNVERIFIED; update event-period commit comparison and gather real, consented evidence before submission.

The submission preflight reports NOT ESTABLISHED until its five external/manual gates are verified. Hackathon readiness remains **NO-GO**.

## Follow-up verification — 2026-10-28

This section supersedes the earlier open items where it reports a completed run. It records the 2026-10-28 verification and changes made after the confirmed pushed checkpoint `d3b2dd9776c63e9e942d59c1aba6655671e07e62`.

- `npm ci`: the default npm cache path under `/home/agent/.npm` was unavailable (`ENOENT`), so that attempt failed. A clean retry with `npm_config_cache=/tmp/elsewhere-npm-cache npm ci` **PASS** — 21 packages installed from the lockfile. The lockfile was not changed by the retry.
- `npm test`: **PASS** — 221 passed, 0 failed, 0 skipped.
- `npm run meta:check`: **PASS** — 11 passed, 0 failed.
- `npm run movement:check`: **PASS** — 8 passed, 0 failed.
- `npm run art:check`: **PASS** — 15 passed, 0 failed.
- `npm run arena:check`: **PASS** — 9 passed, 0 failed.
- `npm run submission:check`: **PASS** — 0 local reported failures; 5 manual gates remain.
- `npm run review:agents`: **PASS** — 11 PASS, 0 FAIL, 0 WARNING, 6 UNVERIFIED; the verdict remains NO-GO.
- `npm run build`: **PASS** — Vite 7.3.7 production build. The earlier bundle-size warnings remain: app chunk about 1.02 MB and Rapier about 4.34 MB (1.65 MB gzip).
- `npm run test:e2e`: **PASS** — Chromium 154.0.8037.57 with SwiftShader; guest journey and reloaded guest non-persistence, full gift story, desktop keyboard input, mobile d-pad pointer hold/release, 1440×900 and 390×844, no page/console errors, no HTTP ≥400, and no off-origin requests. The responsive run after the d-pad overlap CSS fix also passed; mobile document width remained 390 px.
- `npm run test:e2e:fates`: **PASS** — separate fresh Chromium contexts for gift, patent, and auction. Each rendered a different causal status (“A city of open workshops,” “A licensed skyline,” and “A city of hidden owners”), recalled the correct ownership choice in future-self dialogue, stayed an unsaved guest, and reported empty page-error, HTTP-error and off-origin request lists.
- `ELSEWHERE_LIFECYCLE=guest-reset npm run test:e2e:lifecycle`: **PASS** — consent reset, truthful guest label, no vault write, zero Meta calls.
- `ELSEWHERE_LIFECYCLE=vault-cloud npm run test:e2e:lifecycle`: **PASS** — AES-GCM save/lock/reload/unlock; a synthetic private letter stayed ciphertext-only and was restored; a quota failure still cleared the active session while preserving the last unlockable ciphertext; offline dialogue made zero Meta requests; one explicit mocked response used only the allowlisted request; malformed mock output fell back; delayed mock requests were aborted on world travel and lock; cancellation content was not stored; cloud consent reset after reload. The provider reply in this test is a **mock**, not a live Meta inference.
- `ELSEWHERE_LIFECYCLE=physics npm run test:e2e:lifecycle`: **UNVERIFIED** — the process session was lost at the environment boundary after `physics-30-interactions.png` appeared. Do not infer completion from the screenshot. The script covers 30 accepted physics impulses, re-entry and another E-triggered impulse, but the final command status was not retained. Rapier/arena unit and scene checks above did pass.
- `npx playwright install chromium`: **BLOCKED** by the network proxy (`cdn.playwright.dev` returned HTTP 403). The installed system Chromium was used for the actual browser tests instead; no browser source/regex check substituted for them.

The code now revokes consent and aborts outstanding optional model requests on opt-out, reset, world transition and lock. Lock attempts to persist first but still clears session state and the vault key when saving fails; the UI reports that the previous encrypted save remains while latest changes may be lost. The local Meta server timeout remains active through upstream response-body parsing. The mobile d-pad is hidden while the story sheet is open, preventing the overlap visible in an earlier screenshot.

Current real synthetic gameplay captures are ignored under `review-output/e2e/`, including the 1440×900 gift journey, 390×844 layout, and 900×650 causal receipts for all three fates (SwiftShader output; not physical hardware evidence). They remain local: this environment has no Library upload capability. No video, live Meta call, preview deployment, Quest run or public submission was performed.

## Latest continuation verification — 2026-10-28

This section records the code and tests after checkpoint `3f614575373c37825023f37a56f4018a169fd880` on `codex/elsewhere-completion-20261027`. The earlier physics status uncertainty is superseded by the command record below.

- `npm_config_cache=/tmp/elsewhere-npm-cache npm ci --no-audit --no-fund`: **PASS**, 21 packages installed. The default cache failure recorded above remains an environment-specific `ENOENT`; the configured `/tmp` cache is reproducible.
- `node --test tests/entry-gate.test.mjs tests/private-vault.test.mjs tests/privacy-contract.test.mjs`: **PASS**, 14 passed, 0 failed, 0 skipped. This includes synchronous key revocation during stalled encryption, preservation of the last committed ciphertext, immediate private UI inaccessibility, and bounded lock behavior checks.
- `npm test`: **PASS**, 222 passed, 0 failed, 0 skipped. An initial rerun found two static source assertions that encoded the old save-then-lock ordering; both were updated to enforce inert UI before a bounded save and synchronous key revocation. The full suite passed after that correction.
- `npm run meta:check`: **PASS**, 11 passed, 0 failed.
- `npm run movement:check`: **PASS**, 8 passed, 0 failed.
- `npm run art:check`: **PASS**, 15 passed, 0 failed.
- `npm run arena:check`: **PASS**, 9 passed, 0 failed.
- `npm run submission:check`: **PASS**, 0 local failures; 5 manual gates remain.
- `npm run build`: **PASS**. Vite 7.3.7 built the production bundle; size warnings remain (app chunk 1.03 MB, Rapier chunk 4.34 MB / 1.65 MB gzip).
- `npm run review:agents`: a first report reflected the earlier full-suite static-assertion failure; after correcting and passing the full suite, the final run was **PASS**, 11 PASS, 0 FAIL, 0 WARNING, 6 UNVERIFIED. Its overall release verdict remains **NO-GO** for live Meta evidence, a public HTTPS deployment, and a real demo video.
- `npm run test:e2e`: **PASS**, real system Chromium 154.0.8037.57 with SwiftShader. It completed the guest → 2046 dialogue → 1889 Aether Cell gift → future-self recall → 2087 open-workshops story at 1440×900 and 390×844, exercised keyboard and mobile d-pad movement, checked document width at 1280×720 and 360×800, and asserted zero guest vault writes, zero page/console errors, zero HTTP responses ≥400, and zero off-origin requests. The latest synthetic screenshots include `future-2087-mobile.png` and `future-2087-360.png`.
- `ELSEWHERE_LIFECYCLE=vault-cloud npm run test:e2e:lifecycle`: **PASS**, six observed mocked `/api/character` calls. A request observer installed before offline play confirmed zero calls with Meta disabled. The browser covered valid and malformed mocked replies, opt-out/reset/world-change/lock cancellation, AES-GCM create/lock/reload/unlock, quota failure recovery, and a deliberately stalled final encryption. During save, the vault gate was busy, its actions disabled, and the app inert; lock completed within the five-second cap. A late encryption could not overwrite the previous ciphertext. The mocked provider is **not live Meta evidence**.
- `ELSEWHERE_LIFECYCLE=physics npm run test:e2e:lifecycle`: **PASS**, confirmed by `/tmp/elsewhere-physics-e2e.status` = `0` and its retained log: 32 accepted E/button impulses, exit/re-entry, and another working E impulse, with no vault write. SwiftShader reported 4 FPS and 456.9 ms P95 at 361 draws/63,124 triangles; these are software-renderer observations, not hardware performance claims.
- `git diff --check`: **PASS**.

The latest screenshot set remains ignored under `review-output/e2e/` and was visually inspected locally. The 360 px capture has clipped decorative edge widgets but no document-level horizontal overflow; the movement pad is separated from the open story sheet. The Library upload connector is not available in this environment, so no remote file IDs or screenshot links are claimed.

## Provenance, licenses, and research submodules — 2026-10-28

- The existing pre-event baseline `5aad4a4725d3af92242428f7865a1fe48a919a80` has Git author/commit time 2026-10-26 23:49:46 Eastern and already includes major game, encrypted-save, XR and Meta-bridge source. The task began from `f3ef0f0f60abfcb6c43e69a8cb25ae11e97a6cb6`.
- `git rev-list --count 5aad4a4..4514f61`: 29 commits. `git diff --shortstat 5aad4a4..4514f61`: 110 files, +5,717/−248 lines. At `cf7fb7d`, the comparison was 23 commits, 84 files, +3,541/−198. `cf7fb7d..4514f61` is 6 commits, 38 files, +2,199/−73. These are Git tree metrics; timestamps and author metadata do not establish eligibility, individual authorship, or when work was performed. Git shows two author identities with different displayed names, “Sai Nitish Reddy” and “Sai Nitish Reddy Kapa”; reconcile whether these identify one or multiple contributors before assigning credit. See the updated comparison in `docs/HACKATHON_NEW_WORK_PROVENANCE.md`.
- A metadata scan of all 71 package-lock entries with package/version fields found no missing `license` field. Production dependencies include Rapier (Apache-2.0), Three.js, three-mesh-bvh and Yuka (MIT); Playwright is Apache-2.0; Vite is MIT. Transitive metadata includes MIT, ISC and BSD-3-Clause licenses. The project is MIT. Locally bundled Lucide icons include their ISC notice and MIT attribution for Feather-derived icons. The Kenney index declares CC0-1.0 but lists no GLB models; the optional companion index says assets are not installed. No third-party GLB is bundled.
- Harness2 is pinned to `1cfe254e8d25b15f37048c3730134686abe60335`, RRSI to `be50316e1db05914068a973f322770ef08ed7ba1`; both upstream projects are Apache-2.0 and remain development-only Git submodules, outside the browser dependency graph. Their nested benchmark runner code retains separate notices. In particular, WorkBuddy Bench has separate Tencent terms and says it is not intended for use within the EU. It was not installed as a benchmark or run; no benchmark assets were copied into ELSEWHERE.
- `UV_CACHE_DIR=/tmp/elsewhere-uv-cache bash tools/research/install-demo.sh`: **PASS**. Harness2 ran its scripted local deterministic `DemoProposer` on two synthetic ledgers: 2 completed, 0 failed, 28 local executions, 32 scripted editor calls, no model service. RRSI `pytest tests`: **PASS**, 8 passed, 0 failed in 0.11 seconds. These are upstream component demos/tests, not ELSEWHERE quality scores or model evaluations. The RRSI developer environment installed its declared Anthropic/Vertex SDK dependency, but no credentials were configured and no model request or optimization was executed. Generated `.venv` folders remain ignored locally; submodule worktrees are clean at their pinned SHAs.
- The Harness2 synthetic `demo.json` is retained locally at ignored `review-output/research/harness2-synthetic-demo/demo.json`; its generated run tree was removed from the submodule. No Library upload or other file-transfer connector is available here. No clip was recorded. `ffmpeg` 7.1.5 and system Chromium are present; the updated `docs/DEMO_3MIN.md` is an exact shot list, not footage, a public demo, or Stage One proof.

Lock-boundary wording clarification: on Lock, consent is revoked, optional requests are aborted, the gate is shown and the app is made inert immediately. The vault key remains available only while the final encrypted save is pending, for at most five seconds. Once that save completes or times out, `vault.lock()` synchronously clears the key; any late encryption cannot commit because the captured key no longer matches. The browser test confirms the bounded timing and preserves the last confirmed ciphertext.
