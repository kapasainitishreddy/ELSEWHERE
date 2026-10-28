# Browser performance profile — 2026-10-28

## Result

This is an executed before/after browser profile, not a target-device benchmark. The only product change is that distant non-interactive 3D sign planes are hidden; interactive signs stay visible and nearby decorative signs return as the player approaches.

| Scene | Before | After | Measured change |
| --- | --- | --- | --- |
| Neo Elysium 2087 | 328 draws / 67,496 tris | 316 draws / 67,472 tris | −12 draws / −24 tris |
| The Other You | 391–395 draws / 67,556–69,368 tris | 379–385 draws / 67,532–69,348 tris | −10 to −12 draws / −20 to −24 tris |

The directional draw-count change was consistent in the paired runs. Frame timing was not: before, idle samples ranged 9–41 FPS, movement 9–20 FPS, and the world transition 11–26 FPS; after, valid samples ranged 69–85 FPS idle, 6–74 FPS during/after movement, and 9–74 FPS during/after transition. One post-change run had no valid idle or movement timing sample. P95 ranged 24.4–208.4 ms before and 11.7–300.2 ms after, including that high-variance software-rendered run. No FPS improvement is established.

The latest post-change run reported 85 FPS / 11.7 ms P95 idle, 74 FPS / 15.4 ms P95 around the WASD phase, and 74 FPS / 15.4 ms P95 after scene change. It confirmed 316 initial-scene draws and 383 steady destination-scene draws. This remains a SwiftShader execution, not a performance guarantee.

The game’s opt-in `?perf=1` panel reports a rolling frame-time estimate plus `renderer.info` draw calls and triangle counts. Its FPS and P95 summarize up to the most recent 120 frames, not a phase-isolated sample; the panel refreshed at one-second intervals, so repeated values in this short run are expected. These are browser frame-loop readings, not GPU-only timings.

## Browser and capture details

- Chromium `154.0.8037.57`, headless Playwright, Linux, 1440×900 CSS pixels, device scale factor 1.
- WebGL renderer: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`; vendor `Google Inc. (Google)`.
- The measured renderer is software SwiftShader. These FPS and timing values do not describe a physical desktop GPU, phone, or Quest.
- Local safe synthetic captures: `review-output/e2e/performance-profile-idle.png`, `performance-profile-movement.png`, and `performance-profile-transition.png`. They are ignored by Git.
- Reproduce with `node tools/review/profile-browser.mjs`. The run also checks page errors and HTTP error responses.

## Findings and decision

- Before the sign-visibility change the measured scenes used 328–395 draw calls; after it they used 316–385. The change removes 10–12 distant decorative sign draws per scene while keeping interactive signs available. The captures show fewer distant placards along the vista; some labels near the action points still overlap.
- Movement and transition timings varied substantially between runs and came from a software renderer. Draw-call reduction is demonstrated; faster rendering is not. The existing source already caps renderer pixel ratio and disables shadows.
- A meaningful next profile needs Chromium on an identified hardware WebGL device and a browser CPU/GPU trace for the same scripted scene. No physical GPU, mobile device, or Quest was available here. Hardware performance remains **UNVERIFIED**.
- The profile script’s first exploratory version attempted repeated remote keyboard polling toward a physical portal and hit its bounded 90-second approach limit. That run did not reach the portal and is excluded from the timing table. The final profile uses a single bounded WASD hold and records the world-selection scene transition; the existing mobile journey separately covers actual touch movement through a 3D portal.
- XR visibility follows the rig’s teleport position in source, but no WebXR-capable browser session or physical headset was available to validate the change in-headset.

## Evidence artifacts and checks

- `node tools/review/profile-browser.mjs`: PASS — Chromium/SwiftShader profile; zero page errors and zero HTTP error responses.
- `npm run test:e2e`: PASS on the same branch before this profile — complete guest gift journey, local fallback dialogue, 2087 causal outcome, keyboard/mobile layout checks, no browser errors or HTTP failures. It does not establish hardware performance.
- Regression tests verify the 14-unit decorative-sign visibility radius and that interaction labels remain visible at any distance. Full unit/build/browser results after this change are in the current QA log.

## XR-panel and sign-clarity profile — 2026-10-28

This is the matched 1440×900 profile after hiding desktop-only XR choice panels and limiting visible scene signs. It used the same Chromium 154 / SwiftShader renderer, DPR 1, guest 2087 initial scene, 3.5-second W hold, and self-world UI transition as the prior profile. The 120-frame HUD is rolling and phase values can carry earlier spikes.

| Phase | Latest observed frame display | Draw calls / triangles | Other evidence |
|---|---|---|---|
| Idle in 2087 | 44 FPS / 22.5 ms P95 | 301 steady (first sample 305) / 67,442 steady (first sample 68,562) | Player stayed at x=0, z=6. |
| WASD movement | 7 FPS / 388.8 ms rolling P95 | 301–303 / 67,438–67,446 | 3.5-second W hold moved 0.41 world units. |
| UI-selected transition to The Other You | 7–9 FPS; rolling P95 remained 388.8 ms | 301 on the first sample, then 360–362 / 67,430–69,302 | Scene-state change took 2,756 ms. |

The prior post-sign-culling profile reported 316 steady initial-2087 draws; this run reports 301 steady draws, a reduction of 15. The previous profile's latest idle sample was 85 FPS / 11.7 ms P95, versus 44 FPS / 22.5 ms here. Movement and transition readings are also substantially slower and noisy. This establishes **lower draw count**, not faster rendering; the cause of frame-time variation was not isolated. The rendering path is SwiftShader software WebGL. These numbers are not desktop GPU, phone, or Quest measurements.

The current real capture, `review-output/e2e/performance-profile-idle.png`, shows the XR-only controller panel absent from desktop and only a limited number of 3D signs. The profile completed with zero console/page errors and zero HTTP errors. The frame loop continuously spends high CPU in software rendering; target hardware profiling is still needed before drawing an optimization conclusion.
