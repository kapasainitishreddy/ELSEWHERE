# Browser performance profile — 2026-10-28

## Result

This is an executed baseline profile, not a target-device benchmark. No game rendering, physics, or quality settings were changed in this checkpoint, so there is no before/after product comparison.

| Phase | App sampler | Draw calls | Triangles | Notes |
| --- | ---: | ---: | ---: | --- |
| Neo Elysium 2087, idle | 9–41 FPS / 24.4–208.4 ms P95 | 328 | 67,496 | Across two runs. One run varied from 14 FPS / 102.7 ms to 9 FPS / 208.4 ms across five one-second observations; the repeat reported 41 FPS / 24.4 ms. |
| WASD movement, 3.5 s hold | 9–20 FPS / 117–208.4 ms P95 | 328 | 67,496 | Across two runs. Player moved 0.41 world units during each hold and continued to 0.57 total over the following sample window while decelerating. |
| Neo Elysium → The Other You scene transition | 11–26 FPS / 117–208.4 ms P95 | 391–395 | 67,556–69,368 | UI world selection to destination `data-world` update took 2,696–4,727 ms across runs. The browser reported the new world before the measured five-second post-transition sample. |

The game’s opt-in `?perf=1` panel reports a rolling frame-time estimate plus `renderer.info` draw calls and triangle counts. Its FPS and P95 summarize up to the most recent 120 frames, not a phase-isolated sample; the panel refreshed at one-second intervals, so repeated values in this short run are expected. These are browser frame-loop readings, not GPU-only timings.

## Browser and capture details

- Chromium `154.0.8037.57`, headless Playwright, Linux, 1440×900 CSS pixels, device scale factor 1.
- WebGL renderer: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`; vendor `Google Inc. (Google)`.
- The measured renderer is software SwiftShader. These FPS and timing values do not describe a physical desktop GPU, phone, or Quest.
- Local safe synthetic captures: `review-output/e2e/performance-profile-idle.png`, `performance-profile-movement.png`, and `performance-profile-transition.png`. They are ignored by Git.
- Reproduce with `node tools/review/profile-browser.mjs`. The run also checks page errors and HTTP error responses.

## Findings and decision

- The measured scene contains 328–395 draw calls and about 67k–69k triangles in this browser run. Draw calls are a plausible cost area, but this profile does not separate JavaScript, command submission, shader, and raster costs.
- Movement and transition timings varied between runs and came from a software renderer. No quality-scaled scene reduction is justified by this evidence alone; the existing source already caps renderer pixel ratio and disables shadows.
- A meaningful next profile needs Chromium on an identified hardware WebGL device and a browser CPU/GPU trace for the same scripted scene. No physical GPU, mobile device, or Quest was available here. Hardware performance remains **UNVERIFIED**.
- The profile script’s first exploratory version attempted repeated remote keyboard polling toward a physical portal and hit its bounded 90-second approach limit. That run did not reach the portal and is excluded from the timing table. The final profile uses a single bounded WASD hold and records the world-selection scene transition; the existing mobile journey separately covers actual touch movement through a 3D portal.

## Evidence artifacts and checks

- `node tools/review/profile-browser.mjs`: PASS — Chromium/SwiftShader profile; zero page errors and zero HTTP error responses.
- `npm run test:e2e`: PASS on the same branch before this profile — complete guest gift journey, local fallback dialogue, 2087 causal outcome, keyboard/mobile layout checks, no browser errors or HTTP failures. It does not establish hardware performance.
- No product behavior changed as part of this profile. Full unit/build results for this evidence-only checkpoint are recorded in the commit and current QA log.
