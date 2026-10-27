# Living Atmosphere 1.7 · VR-friendly environmental storytelling

This is a **code-tested animation pass**, not a claim of successful Quest headset rendering, human playtesting, clinical efficacy or hackathon submission certification. The app is a fictional entertainment and reflection experience, not a depression treatment.

## Performance design

- A single `THREE.InstancedMesh` per world makes all particles a single draw call. No postprocessing bloom, camera bob, scripted head rotation, global animation loop, asset CDN or remote data source.
- Conservative bound: **42 instances in XR**, **34 on mobile**, and **up to 78 on desktop**. `prefers-reduced-motion` disables the new continuous environmental layer.
- Relative motion is slow and non-flashing. XR updates are capped near 30 updates per second while the headset renderer continues to render at its device's refresh rate. Existing teleport, snap-turn and seated comfort settings remain intact.
- Effects are absolute-time deterministic rather than accumulated displacement. A reopened world starts at its own scene state, so long sessions do not cause drift.
- When the user chooses an option, inspects a keepsake, arrives through a portal or hears a future-self reply, the local particle field softly brightens then fades. These **do not** change story outcomes, time currency, NPC memory or account balances.

## Art direction and physical placement

| World | Living visual beat | Why the location matters |
| --- | --- | --- |
| Neo Elysium · 2087 | Gentle streaks of cold cyan light move through distant architectural depth | Distinguishes bustling future city without rapidly strobing neon |
| The Other You · 2046 | Long, quiet blue rain beyond the apartment glass | Foregrounds a safe, intimate conversation without moving the camera |
| The First Spark · 1889 | Warm ascending forge embers near the machine and workbench | The historical workshop feels inhabited rather than static |
| The Hollow Crown | Slow orbiting violet motes gather near the Warden chamber | Dungeon magic reads clearly without flashing or a full-screen effect |
| Titan Foundry · 2199 | Small drifting reactor sparks in the hangar | Conveys physical scale without needing costly particle trails |

## Developer testing

```bash
npm install
npm run environment:check
npm run check
npm run dev
```

On desktop, inspect the 2046 apartment: droplets should be visible *outside* the room rather than floating through the player. Inspect a keepsake to see a temporary brightening. Cross between all five worlds and verify each palette changes and the previous objects disappear. Test the same actions with OS Reduce Motion enabled; there should be no new persistent animated particles.

On Quest over HTTPS, record frame times and dropped frames before and after this change; verify fixed headset/camera pose, no shimmering stereo effect, and that 72 Hz or 90 Hz device targets are met *on the actual target headset*. Reduce particle counts further if necessary. Actual headset results must be documented; no automated unit test proves perceptual comfort.

## Privacy and safety

This layer takes only a **world ID**, game event type and frame time. It never reads the vault, photos, messages, microphones, real physical-world locations, biosensors or account identities. It contains no HTTP calls, metrics upload or persistent storage. It cannot diagnose, prevent, or cure any health condition.
