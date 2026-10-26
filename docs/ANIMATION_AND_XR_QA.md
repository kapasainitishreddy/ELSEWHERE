# ELSEWHERE: Kinetic Worlds 0.9 / Motion + XR testing runbook

This is a developer test plan, not a certification. The headset and model interactions have **not** been physically verified in this environment. Test with fictional identities and consent only. Never record private letters or conversations in a public demo.

## What changed in the actual game

| Scene | New visible interaction | What to verify |
|---|---|---|
| Neo Elysium | Procedural animated rail transit, instanced skyline, examine causal skyline | No flashing, no clipping, readable controls, scene reflects invention choices |
| Future Self | Deliberate speaking/listening animation, blinking, breathing, memory artifact, floating light | Animations match voice turn-taking and stop on vault lock/world exit |
| 1889 | Hovering illustrated papers, inspecting invention plans, gears and environmental lighting | Touch and E hint appear, no accidental purchases or duplicated inventions |
| Dungeon | Rotating crystals, rune inspection, impact particles and Warden target | Controller trigger selects target, combat events still require valid rules |
| Mech | Thruster response, recoil, combat impact and action cues | Reactor heat and hull rules still hold, no physics-induced nausea |
| All five | Direct-object ray selection, inspectable art, proximity hint, bounded FX | Teleportation only on explicit user choice, no forced camera motion |

## 1. Local developer run

```sh
npm install
npm run motion:check
npm test
npm run build
npm run dev
```

Open `http://localhost:5173/?perf=1`. The performance counter is opt-in and **not an analytics system**. Record observed FPS, P95 frame time, GL draw calls, and triangles at the beginning and after entering each world. Test normal and reduced-motion OS modes. Check for exceptions in the browser console. Confirm that the encrypted vault remains readable after upgrade. Reset the debug URL by removing `?perf=1`.

For improved local scenery, optionally run `npm run assets:fetch`. The curated Kenney models (CC0) must be installed locally on a network-connected developer system. The game itself does not fetch third-party model URLs.

## 2. Desktop scenario walkthrough

1. Create a disposable local vault (do not use a real personal journal). Confirm the world loads without a Meta or Ollama service.
2. In Future City, walk with WASD or arrows. Observe the animated transit. Walk toward a glowing sculpture, read the on-screen **E · Examine** prompt, press E and verify a local-only artifact description appears.
3. Approach an active portal, confirm that the proximity prompt says the correct destination, press E. Confirm arrival flash, scene transition and new world. Do not confuse portal proximity with automatic teleportation.
4. In the 1889 workshop, invent then patent or share one fictional technology. Return to 2087 and inspect the modified skyline. Verify old save currency and plot choices still persist.
5. Enter the dungeon, select an ability, use keyboard or mouse aiming to fight. Check the impact VFX disappears and action cannot be repeated illegally.
6. In the mech world, pilot ATLAS-09, use space or gamepad A to attack, Q or gamepad X for guard, and R or gamepad B for reactor vent. Observe recoil without a shaking camera.
7. Meet your fictional older self. Start talking, type a natural question, then watch the listening and speaking gestures. Change the timeline and revisit; the future-self dialogue should match the actual game state.
8. Disable animation at the OS level (reduced motion). No forced camera movement; action cues remain legible.
9. Enable DevTools Network > Offline. Repeat local authored conversations and navigation after the app is installed/cached. No personal prompt, private journal, or passphrase should be transmitted. Asset downloads and the optional cloud demo are separate actions.

## 3. Quest physical test

Use a secure HTTPS build; WebXR is not guaranteed on every browser, graphics processor, or headset. Begin seated, with a clear guardian/boundary and supervised tester. Users must be able to quit freely.

- Verify real headset FPS and motion-to-photon comfort: do **not** infer comfort from desktop measurements. Watch for dropped frames, judder and overly bright flashing. Stop immediately if discomfort starts.
- Controller ray should change from turquoise to warm gold when a 3D target is aimed at; endpoint should terminate on a hit. Trigger selects a target. Grip guards only during combat. Snap turn is discrete. Floor teleport checks collision proxies.
- Approach the five physical artifact stands, inspect via VR trigger and read the brief in-headset note. An action should not happen twice from one input.
- In the future-self room, verify that body language can be perceived at a comfortable distance and remains legible without having to turn the user's head rapidly.
- Record observed headset refresh rate, FPS, comfort notes, scene-loading time, visual defects and actual controller bindings. Claim no performance number until measured on that hardware.
- Repeat with optional locally bundled CC0 models enabled. Watch geometry memory and draw-call changes.

## 4. Build acceptance gates for Meta competition

- Successful `npm run check` and no critical console exceptions in Chromium/Quest.
- At least one complete unedited three-minute screen capture from real game code, not concept art.
- Consent-aware optional live Meta model call with only fictional fields, clearly labeled remote. Default local experience must remain useful if the service is disabled.
- Participants can leave any story, decline future-self prompts, lock vault and clear their records without coercion.
- No claim of depression cure, dopamine or serotonin changes, psychiatric treatment or guaranteed health improvements.
- Third-party open-source licenses and new hackathon contributions clearly documented.

## Engineering references

- Three.js built-in animation and rendering: https://threejs.org/docs/
- Three.js instanced rendering: https://threejs.org/docs/pages/InstancedMesh.html
- Meta WebXR performance guidance: https://developers.meta.com/vr/documentation/web/webxr-perf-workflow/
- Kenney CC0 models: https://kenney.nl/assets

All animation sequences and effects in Kinetic Worlds 0.9 use the project's existing MIT-licensed Three.js dependency and original authored procedural geometry. There is no new mandatory animation service or analytics SDK.
