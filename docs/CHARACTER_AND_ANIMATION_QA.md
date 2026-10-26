# ELSEWHERE v1.0 · Character and VR presence QA

This checklist is a **test plan**, not evidence of a successful Quest run. The 3D scene, new skeletons, and GLB assets have not been visually tested on a physical headset in the build environment.

## Intent

- Characters should feel like participants in a fictional world, not static chat screens.
- A single animated human figure uses a real `THREE.SkinnedMesh`, a two-joint skinned coat, a facial and limb bone hierarchy, and six cross-faded authored `THREE.AnimationClip`s: idle, listening, speaking, walking, delighted, startled. All default assets are original Three.js geometry and remain private/local.
- The optional *Khronos Fox* brings imported skinning and Survey / Walk / Run animation clips. It requires a deliberate developer-side download. No remote asset fetch occurs while playing. Attribution: `docs/ANIMATED_ASSET_LICENSE.md`.
- Future-self keepsakes (blueprint, borrowed-hours watch, and imagined portrait) represent the currently active fictional Prime/Echo timeline. Interactions are ephemeral, do not read users' letters or save extra sensitive material.

## Local install and smoke checks

```sh
npm install
npm run assets:fetch         # optional Kenney CC0 world models
npm run assets:animated      # optional Khronos animated fox, pins SHA
npm run animation:check      # skeletal clips, models, privacy and artifacts
npm run check                # Node tests + Vite production build
npm run dev
```

Open `http://localhost:5173/?perf=1` on desktop. In the future-self apartment, use mouse or E to examine **The Blueprint**, **Borrowed Hours**, and **A Possibility**. Type a question, watch the listening and speaking transitions, interact with a keepsake, and then revisit after your 1889 choices change. Check that the letter stays encrypted on lock. If optional model files were installed while the site was open, refresh so the local manifest is revalidated.

## Acceptance scenarios

1. **Close encounter:** Future self looks and gestures naturally with the authored reply. Speech animation only when the character is speaking. Animation stops when locking the vault. No player likeness scan or claims that this is the true future.
2. **Causality:** Patent an Aether Cell in 1889. The blueprint text changes in 2046. Switch to Echo and confirm the correct branch. Return to Prime without merging memories or money.
3. **Action discovery:** Hover, click, or press E near the three keepsakes and near Ada, Iris, the Witness and Sol. Gamepad A and Quest controller ray selection should choose the same action. Verify readable in-headset feedback without forcing a neck turn.
4. **Third-party model provenance:** Confirm the optional fox is absent by default. After running `assets:animated`, verify the file on disk, visible fox in the future apartment, all three animation clips, and its attribution in the shipped documentation. If missing/corrupted, the core room must still render.
5. **Reduced motion:** Activate operating-system reduced motion. Dialogue captions and object labels remain, animations and particles no longer demand visual attention. No camera shake or automatic scene steering.
6. **Controller comfort:** On a Quest headset, test seated and standing, ray/trigger selection, squeeze, 30-degree snap turning and short-range ground teleport. Stop testing if discomfort occurs. Never infer comfort from desktop tests.
7. **Measured frame timing:** Enable `?perf=1`. Record median/95th-percentile frame timing and draw calls for at least 60 seconds in each world in real headset mode. A **72 Hz** refresh rate has about **13.9 ms** per frame, while 90 Hz has about **11.1 ms**. These are budgets, not achieved FPS claims. Examine dropped frames and legibility as well as median FPS.
8. **Network and privacy:** With cloud AI off, inspect DevTools Network for gameplay. Initial hosting/asset delivery may still contact the game's origin; no private prompts, letters, passphrase, vault data or model requests should leave the device. Opt-in Meta mode is explicitly remote and must not be presented as private.

## Known limitations

- Rigged humanoids use original *stylized procedural geometry*, not a professional performance-captured human with blendshape lips or body-motion capture. Mouth movement is illustrative rather than phoneme-synchronized.
- Import of Khronos Fox is optional and was not run in this disconnected environment. The full `npm run build` requires Vite dependencies installed on a connected machine.
- No physiological sensing, depression treatment, dopamine/serotonin modulation, or clinically validated mental-health outcome is claimed.
- Model safety checks and AES vault testing do not establish security of the user's browser, operating system or third-party software.

References: [Meta WebXR performance workflow](https://developers.meta.com/vr/documentation/web/webxr-perf-workflow/), [Three.js AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer), [Khronos Fox](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Fox).
