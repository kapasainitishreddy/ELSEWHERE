# ELSEWHERE

**One life is never enough.**

An original, browser-first interactive world prototype by **Syrava**. Travel to five very different realities, change an alternate past, confront a possible future self, unlock powers, and pilot a giant original robot. The causal state engine carries decisions, wealth, reputation, relationships, artifacts and world changes between scenes.

The project is an early, publicly inspectable entry candidate for the **2026 Meta Global AI Developer Hackathon, Startup track**. It is a playable prototype, not yet a finished MMO, production VR release, or fully autonomous world simulator.

## Get started

Requires **Node.js 22+** and an installation of the npm dependencies.

```sh
npm install
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`.

```sh
npm run test      # pure state/mission/privacy tests
npm run build     # production frontend bundle
npm run check     # both tests and build
```

`npm run dev` starts Vite and the optional API bridge together. You can play the entire deterministic story without a Meta API key. Offline *story mode* means no AI request is needed for built-in interactions. It does not imply that your browser has already cached the website for disconnected use.

## Five worlds, one timeline

| Destination | What you can experience | What follows you |
| --- | --- | --- |
| **Neo Elysium, 2087** | Walk a neon city, meet archivist Iris, acquire property, invest in robotics, build a public library | Wealth, fame, trust, investments and visible city architecture |
| **The Other You, 2046** | Speak to an imaginative older self, ask questions, write a local future letter | Remembered inventions, fictional possible life outcomes, optional letter |
| **The First Spark, 1889** | Create an Aether Cell, Clockwork Oracle or Skyrail Drive. Patent, gift or auction the breakthrough | A changing skyline, altered social trust and future-self narrative |
| **The Hollow Crown** | Choose one of three powers, follow its rune riddle, unlock the chamber, decide the Chrono Relic's fate | Powers, progress, ethical legacy |
| **Titan Foundry, 2199** | Synchronize with ATLAS-09, drive it, shield, cool its reactor, repel three hostile drones | Mission status, fame and public trust |

**Echo Protocol 0.2 additions:**

- Find five original **memory fragments**, one in each world. Three fragments plus an altered past unlock three epilogue choices: Empire, Legacy and Wanderer. Endings are exclusive to a timeline but do not lock travel.
- Local characters **Iris, Ada Voss, the Hollow Witness and Commander Sol** change their dialogue based on your actions. These are authored, deterministic interactions, not autonomous AI agents.
- The dungeon requires solving a **three-rune sequence** before confronting the Warden. Each power reveals a different clue. Wrong attempts reset the sequence.
- Mech defense is now a **resource-management battle**. Space fires, Q raises a shield, reactor heat and hull loss affect your choices. Mission rewards cannot be farmed.
- **Echo Atlas** shows causal history, world impacts and fragments. Export and import portable JSON backups, with a warning that backups include private letters and conversations. Existing 0.1 saves are migrated additively.
- Original procedural atmosphere and scene details: animated city gardens and traffic, memory mementos, steam-era airships, floating dungeon crystals, enemy drones, glowing portals and weather particles.
- World beacons can be selected from the scene. VR controllers ray-select portals and actions, and can teleport to walkable ground.
- Optional procedural ambient sound, keyboard controls, mobile directional controls, reduced-motion support, a cinematic HUD mode and text-first fallback for WebGL failures.

## Controls

| Control | Desktop | Touch / VR |
| --- | --- | --- |
| Move | `W A S D` or arrows, `Shift` to move faster | Touch D-pad; in VR, point at open ground and select to teleport |
| Look | Drag mouse | Touch orbit; headset tracking in VR |
| Interact | Click portal or beacon, `E` near a beacon | Tap or controller select |
| Mech pulse | `Space` during defense | Select the pulse action in the story or spatial choice panels |
| Mech shield | `Q` during defense | Select shield action |
| World navigation | Left rail or portals | World selectors or portals |
| Story history | **MY TIMELINE** | Same menu on flat browser UI |
| Cinematic presentation | Top-right square button | Available in browser UI |
| Sound | Top-right note button, off by default | Supported on browsers allowing Web Audio |

VR support is built on **plain Three.js WebXR**, not Meta IWSDK. A supported secure-origin WebXR browser and suitable VR controller are required. Quest headset testing has **not** been performed.

## Optional Meta Muse Spark conversations

1. Copy `.env.example` to `.env`.
2. Set `MODEL_API_KEY` in the local server environment. **Never put the key in frontend environment variables.**
3. Start `npm run dev` and check `http://localhost:8787/api/health`.
4. Enter **The Other You** and ask a question.

The Node backend forwards bounded text requests to Meta Model API `muse-spark-1.3`, using `https://api.meta.ai/v1/chat/completions`. If the service is unavailable, safe deterministic dialogue remains playable. Model output never changes currency, inventory, achievements, mission status or powers. Only pure simulation actions can mutate the game state.

**Privacy:** The optional future-self letter is stored in this browser. It is **not sent to the Meta API by default**. Players can opt in with the checkbox beside the letter. Speech input uses browser speech recognition when available, which may send audio to the browser/provider. The game does not store microphone recordings. Synthesized browser voice and procedural ambience are opt-in.

## Technology and open source

- [`three`](https://github.com/mrdoob/three.js) `^0.181.0`, MIT licensed, including the bundled OrbitControls and VRButton add-ons.
- [`vite`](https://github.com/vitejs/vite) `^7.1.0`, MIT licensed, development/build tooling.
- **Original ELSEWHERE code**: scene generators, shaders, gameplay rules, story dialogue, audio synthesis, save migration, tests and HUD, MIT licensed by Syrava.
- **Optional paid service**: Meta Muse Spark via the official Meta Model API. No API key or other proprietary model weights are checked into this repository.

Meta's Immersive Web SDK, Godot XR Tools, AI Town, Rapier, Project Flowerbed, and existing manhwa/anime/game assets are **not incorporated** at this stage. Character art is intentionally abstract and original. The titan is an original geometric design, not a Pacific Rim character or model.

## Checks and known limitations

`npm run test` currently runs 24 automated checks covering world transitions, economy anti-exploits, rune puzzles, mech battle invariants, 40 randomized 90-turn playthroughs, v0.1 save compatibility, JSON backup validation, UI output escaping, privacy boundaries and Meta request construction. Full `npm run build` and headset/browser playtesting are still required before a release. Do not present runtime VR or Meta API functionality as verified until you have tested them with a headset and configured credentials.

Current limits: small authored worlds rather than an infinite universe; no NPC autonomous scheduling, multiplayer, real historical simulations, physical haptics beyond device controls, or in-app real-currency purchases. In-game credits and fame are fictional.

See [Architecture](docs/ARCHITECTURE.md), [Demo script](docs/DEMO_3MIN.md), [QA checklist](docs/QA.md), and [Hackathon notes](docs/HACKATHON.md).

**Built under Syrava.** The source is MIT licensed; retain required notices when reusing it. See [LICENSE](LICENSE).
