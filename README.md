# ELSEWHERE · The Chronal Veil

> One life is never enough.

**ELSEWHERE** is a privacy-first, browser-based 3D speculative world prototype by Syrava. Enter portals to another century, meet a fictional older version of yourself, invent technology before its era, trade and steal fictional hours, negotiate with a Warden who remembers your fighting style, and defend a futuristic city from inside a giant original mech.

This is an original experimental game and potential **Meta Global AI Developer Hackathon 2026 Startup-track** submission. It is **not** yet a polished shipped VR game, an MMO, or a verified Meta AI submission. In-world hour balances, fame, wealth and life paths are fictional, never real predictions or financial assets.

## Run it

Requires Node.js 22+, npm and an installed copy of the dependencies. Default mode runs entirely on your own computer with authored local dialogue and **no Meta API key**.

```bash
npm install
npm run dev
# Visit http://localhost:5173
```

```bash
npm run test             # simulation + vault + privacy + controls
npm run build            # production Vite build
npm run check            # tests then production build
```

`npm run dev` starts the local Vite server only. Personal gameplay never needs a cloud API. On the first visit, create a passphrase-protected local vault. There is **no passphrase recovery**. Do not lose it. Back up using the encrypted export in My Timeline.

## What you can actually play

| World | Era | Encounters |
| --- | --- | --- |
| Neo Elysium | 2087 | Living skyline, archivist Iris, property, robotics investing, public reading room and chronal time trading |
| The Other You | 2046 | A possible older self, a private encrypted letter, debt consequences, local text roleplay and alternate endings |
| The First Spark | 1889 | Invent one of three impossible devices, patent/share/auction, speak with Ada and help her apprentices |
| The Hollow Crown | Ageless | Choose one power, solve a three-rune cipher, fight or negotiate with a memory-adapting Warden |
| Titan Foundry | 2199 | Synchronize with ATLAS-09, pilot it, attack moving drone targets, manage shields, hull and heat, help evacuate civilians |

**One shared causal simulation:** invention ownership alters the skyline and dialogue. Stolen hours change debt, paradox, trust, NPC feelings and the future-self story. Quest choices and memories carry between eras. No endless money loops from returning through portals.

**Prime / Echo parallel realities:** collect memory stars, spend three hours and two stars to fork. Each branch then keeps its own economy, inventions, actors, NPC agenda progress, debts and story history. You can switch back without mixing balances or sharing private memories between those versions.

**Independent NPC agendas:** five story characters advance through original authored developments after distinct meaningful decisions. Ada opens a night school, Iris documents missing hours, Sol opens rescue corridors, the Witness discovers another way to resolve the crown and The Other You writes an unsent letter. They remember choices, offer missions and react when you return. This is **deterministic offline storytelling**, not real-time autonomous AI agents.

**A full story layer:** the Echo Atlas journal includes authored prose chapters unlocked by your choices, cause-and-effect history, collectibles, actor memory dossiers and the living-world event feed. There are multiple moral outcomes and three player-selected endings. See [Story Bible](docs/STORY_BIBLE.md).

## Controls

| Action | Keyboard/mouse | Gamepad | WebXR |
| --- | --- | --- | --- |
| Walk | `W A S D` / arrows | Left stick | Aim into empty floor and trigger to teleport |
| Look | Drag / orbit | Mouse orbit available | Move your head; right stick snap-turns in 30-degree steps |
| Interact / portals | Click object or `E` near a beacon/portal | **A** near beacon or portal | Controller ray + trigger |
| Strike / mech pulse | **Space**, or aim and click a target | **A** in combat | Aim and trigger |
| Shield / guard | **Q** | **X** | Controller grip/squeeze |
| Power / vent | **F** / **R** | **B** | World action panels |
| Negotiate with Warden | **E** during battle | **Y** | Spatial choice panel |
| Inspect journal | My Timeline | Use browser UI | Best viewed in desktop mode |

There are glowing portals in the physical 3D scenes as well as accessible text world selectors. Touchscreen has directional buttons and tap controls. Controller haptics are attempted only on supported hardware. VR locomotion defaults to teleportation; no forced continuous VR movement. **Quest/VR rendering, frame rates and controller behavior have not yet been verified on a physical headset.** The 3D engine is plain Three.js WebXR, not Meta's Immersive Web SDK or a full physics engine.

## The Private Layer

- **Encrypted at rest:** all saves, NPC memories, private letters, story transactions and *both* timelines are inside a versioned **AES-256-GCM** envelope, with a passphrase-derived PBKDF2-SHA256 key (310,000 iterations), unique salt and fresh IVs.
- **Private by default:** no account, tracking, cloud saves, browser speech recognition or remote AI requests in normal gameplay. Character replies run via authored local logic. No remote model receives game memories by default.
- **Manual migration and backup:** old unencrypted browser saves are migrated into the vault when it is first created. Backup exports and imports contain ciphertext only and require the passphrase.
- **Offline behavior:** the production service worker caches only same-origin public assets. The HTML or scripts must first be served/downloaded. True offline use requires a local installed build or a verified cached copy.
- **Security caveats:** a device compromise, browser extension, malicious website update or screen recording can access data while it is unlocked. Network hosts can see site requests when the game is remotely served. This is **not independently audited or guaranteed zero-knowledge in all threat models**.

Full limitations: [Privacy model and threat boundaries](docs/PRIVACY.md).

### Optional Meta demonstration (not private)

The game includes a **separately started**, opt-in Meta Model API bridge for hackathon demonstrations. This is **OFF** every session and not started by `npm run dev`. To use it, put a developer-only API key in `.env`, run `npm run dev:meta`, and explicitly turn on Meta cloud mode in My Timeline. The next typed prompt and a small fictional state summary leave the device for Meta; saved NPC memories, letters, keys, and other branch data do not. This mode **cannot** be described as completely local. The bridge and model must be verified with actual credentials before making a live capability claim.

## Open source and rights

- **Three.js** (`three` ^0.181.0, MIT): geometry, materials, shaders, camera, OrbitControls, and WebXR VRButton.
- **Vite** (^7.1.0, MIT): local development and production web bundling.
- **Our original code:** state machine, branching hour economy, fictional characters and agendas, puzzles, combat rules, ambience synthesis, procedural worlds, private vault, journal, UI, and tests. See [LICENSE](LICENSE).
- Rapier, AI Town, browser-whisper, Godot XR Tools, Meta IWSDK and existing film/anime/manhwa assets are **not bundled into this prototype**. They are research references or future integration candidates, not work we claim to have reused. All current 3D props and titan designs are procedural originals. No third-party game assets are bundled.

## Release and hackathon status

The Node test suite covers time trade invariants, alternate branch isolation, NPC agendas, replay safety, combat adaptation, save integrity, browser encryption, opt-in API boundaries and gamepad mapping. These tests **do not prove the Vite production bundle renders or headset performance is acceptable**. Record actual browser/headset sessions and run a security audit before production launch.

See [Architecture](docs/ARCHITECTURE.md), [Demo script](docs/DEMO_3MIN.md), [QA](docs/QA.md) and [Hackathon submission notes](docs/HACKATHON.md). **No GitHub Actions workflows are used.**
