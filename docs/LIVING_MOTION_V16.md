# Living Motion 1.6 · Animation direction and headset acceptance

This update **does not claim a completed browser/Quest visual validation**. Its automated evidence tests bounded numerical motion, integration, source syntax, local-only operation, and the existing fictional economy. It builds on the already public v1.5 code; describe only newly authored 1.6 changes in the hackathon demo.

## Visual direction: let every action have a cause

| Location | Visible behavior | Gameplay truth |
|---|---|---|
| Future Self · 2046 | Distinct facial acting for listening, speaking, surprise and gratitude; nearby eye contact, independently timed blinking and natural hand reactions | The possible future remains *fictional*, not a diagnosis or prediction. Dialogue speaks but never grants rewards. |
| Future Self · table | A miniature holographic possible-life figure appears once an invention and a fate are chosen | Based solely on branch-local fictional game choices; does not read the private letter or personal memory cards |
| Portals · all five worlds | Rings respond gently to proximity; the membrane gains depth; instanced fragments orbit at a lower rate when far away | The portal still requires an explicit trigger, click or keyboard action. No forced locomotion. |
| Hours Bank | Ten tiny instanced luminous seconds move through the glass | Currency remains controlled by `src/chronal.js`. The animation itself never debits hours. |
| Titan Foundry | A plasma attack has three visual beats: launch, travel, impact. Reactor light and joints react to recoil | Damage, heat and hull are validated by the pre-existing game rules, not by the visual FX. |
| Mech targets | Drones drift along bounded paths with slow yaw and visible aiming geometry | Hit targets stay attached to the moving drones. Visual telegraphs are not actual damage. |

All new effects rely on the existing MIT Three.js engine; no animation subscriptions, trackers, new CDN requests, or proprietary rig libraries have been added.

## Browser acceptance path

1. `npm install && npm run check && npm run animation:check && npm run motion:check`.
2. `npm run dev`, visit `http://localhost:5173/?perf=1`, create a **fictional test** vault. Navigate to **The Other You** and watch the idle actor for 20 seconds; verify visible breathing and blinks without rigid, perfectly synchronized loops.
3. Type a question in local mode. Verify the model changes from listening to speaking and back without clipping, getting stuck or pretending to pronounce specific phonemes. Examine the blueprint and confirm a gentle one-shot reaction.
4. Travel to 1889, invent something and choose *gift*, *patent*, or *auction*. Return to 2046: a small animated holographic alternative should be visible on the table. Check it is absent before making a fate choice.
5. Approach each physical portal. Confirm it changes gently with distance but **never** warps the camera or moves your player without action. Verify `E` / mouse selection and that the animation resets on a new scene.
6. Defend the city in Titan Foundry and fire at a drone; verify a projectile reaches the impact point, expires, and does not fire by itself. Check there are no geometry or material leaks after repeatedly changing worlds.
7. Enable OS *Reduce Motion*, reload, and repeat. Facial loops, shader travel and continuous reticle spin should pause while controls and labels remain usable.
8. DevTools Network: with Meta Cloud **disabled** confirm no private messages leave the device. Gameplay must work with the network offline after initial installation/cache. Run the separately consented cloud Meta demonstration only with fabricated data.
9. Observe actual `?perf=1` frame time and draw calls. Look for regressions after extended movement and repeated portals. Avoid treating a desktop FPS screenshot as Quest evidence.

## Quest-specific checks

- Host the build over HTTPS in a supported Quest browser. Begin seated with guardian enabled. Check both controller rays are aligned after multiple teleports and turns.
- Verify the portal response at different distances (stereo depth, no doubling, no rapid flicker); the headset viewpoint must remain owned by the player's tracked head.
- Test the future self at a comfortable conversational distance. Mouth and eye movement should be readable but not uncannily exaggerated.
- Use the Meta performance HUD and record actual refresh target, frame time, draw calls and dropped frames. The guidance gives a **13.9 ms budget at 72 Hz and 11.1 ms at 90 Hz**, but these are targets, **not measured results** for ELSEWHERE.
- Disable enhanced assets and compare. If 72 Hz is not sustainable, reduce optional scenery or particles and retest on hardware. Stop immediately if a tester becomes uncomfortable.
- Record a direct, unedited 3-minute screen capture from the working game before claiming the hackathon demo is ready.

## Engine references

- Three.js animation blending: https://threejs.org/manual/pages/animation-system.html
- Meta Quest WebXR performance: https://developers.meta.com/vr/documentation/web/webxr-perf-workflow/
- Meta immersive comfort guidelines: https://github.com/meta-quest/agentic-tools/blob/main/skills/hz-immersive-designer/references/comfort-guidelines.md

**Known build limitation at development time:** npm registry access was unavailable; `npm install` could not retrieve Three.js/Vite, so the full Vite bundle and actual XR renderer are unverified. Code and deterministic tests are not visual QA.
