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
