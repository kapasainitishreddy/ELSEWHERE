# ELSEWHERE

> One life is never enough.

ELSEWHERE is a privacy-first, browser-based 3D speculative game prototype. Players travel among five fictional eras, meet an imagined future self, invent technology in 1889, choose who owns it, and see the recorded choice alter 2087. The Warden and mech branches add recoverable combat. Game rules and rewards remain deterministic; dialogue may be authored/offline or explicitly optional, and model text cannot change game state. The future-self story is fiction, not prediction, therapy or financial advice.

## Current tested checkpoint — 2026-10-31

**Local development status: verified. External submission status: NO-GO.** On the current source, `npm test` passes 253/253 tests, `npm run build` passes, and `npm run review:agents` reports 11 PASS, 0 FAIL, 0 WARNING, 6 UNVERIFIED. The build still warns about large app and Rapier chunks. The last clean `npm ci` was run at an earlier checkpoint; recent changes add no dependencies.

Verified local behavior includes:

- Guest entry without saving, portal travel, the future → 1889 invention → distinct gift/patent/auction futures → grounded recall journey.
- Warden and mech battles that can be lost, exited, re-entered and recovered; repeat rewards remain disabled.
- Actual Rapier physics props that settle and stay within the tested collider cage through a ten-minute fixed-step simulation.
- Locally authored causal exhibits derived from saved fictional outcomes; Meta direction is opt-in and the browser/API contract has mock coverage only.
- Dialogue and privacy labels distinguish unsaved guest, encrypted-vault, on-device-model, and Meta transport states; local mock lifecycle coverage checks these modes.
- Keyboard dialogue submission disables duplicate sends while pending, announces runtime/save status through a polite live region, and restores focus to the question field after the response.
- AES-GCM local saves, lock/reload/unlock, encrypted backup download, canceled replacement, malformed-file rejection and file-picker restore.
- Keyboard entry and combat controls; a selected 200% viewport/scale emulation, visible focus, one primary-action contrast check and reduced-motion behavior.
- Entering combat clears the opening-story overlay and collapses the long story sheet; a compact one-row HUD keeps attack, story and portal-atlas controls reachable. Story text remains available in a bounded scroll panel. The physics-sandbox button sits beside the scene and is hidden during combat; the movement prompt stays above the portal dock.

Repeat the verified checks from the repository root:

```bash
npm ci --cache "${TMPDIR:-/tmp}/elsewhere-npm-cache"
npm test
npm run build
npm run review:agents
npm run test:e2e:combat-recovery
ELSEWHERE_COMBAT_LAYOUT_ONLY=1 npm run test:e2e:combat-recovery
npm run test:e2e:backup-recovery
npm run test:e2e:accessibility
node --test tests/physics-long-session.test.mjs
npm run demo:record:authored
```

In this managed container, the default npm cache path was absent. The clean install passed with `npm ci --cache "${TMPDIR:-/tmp}/elsewhere-npm-cache"`; lockfile integrity checking remained enabled. The browser runs used Chromium 154 with SwiftShader software WebGL and synthetic data. The 200% check emulates zoom geometry by halving the CSS viewport at device scale factor 2; it is not browser zoom UI. Real-browser screenshots and combat interactions verified the responsive HUD at 1000×720, 390×844, and a 720×450 reduced-viewport emulation. These results are software-rendered browser evidence, not phone/GPU/Quest performance measurements. See [QA evidence](docs/QA_EVIDENCE_CURRENT.md) for current and historical screenshots and limitations.

**Dialogue privacy labels now disclose both dimensions:** guest play is unsaved even when an on-device or Meta mock is selected; a saved vault is encrypted, while Meta-enabled questions leave the device. Browser fixtures cover these label combinations but do not establish a live service call.

**Local recording rehearsal:** `npm run demo:record:authored` captures an actual authored-offline Chromium story journey and validates its MP4. The currently retained local clip is H.264, 1280×720, 119.16 seconds and 87 frames (~0.73 fps); it is choppy and is not submission-ready footage. It is ignored by Git, uses Chromium 154/SwiftShader, and makes zero Meta/off-origin requests. The shot list and three-minute edit remain a design target; see [local capture runbook](docs/DEMO_RUNBOOK_LOCAL.md) and [demo outline](docs/DEMO_3MIN.md).

**External gates remain open:** no live Meta inference (the local mocks are not Meta proof), public HTTPS preview/API, polished real demo video, current official eligibility confirmation, Quest/phone hardware run, screen-reader audit, human research, or submission. SwiftShader output is not hardware performance evidence. Do not describe this prototype as submission-ready.

**Combat flow rechecked 2026-10-30:** Full Warden and Mech browser recovery journeys passed on Chromium 154 with SwiftShader after the responsive combat HUD change. The Mech path covered defeat, reboot, victory, exit/re-entry and the single-use mission reward. See [latest QA evidence](docs/QA_EVIDENCE_CURRENT.md). Official judging weights were verified from rules dated October 25 on October 30: Impact 30%, Meta AI tooling 25%, Technical execution 20%, Demo 25%. Startup representative eligibility and exact portal fields remain unverified; see [hackathon readiness](docs/HACKATHON_READINESS_CURRENT.md).

For setup and first-run instructions, see [Run it](#run-it). The current playable worlds and controls are documented later in this README. The complete feature status is in the [feature ledger](docs/FEATURE_LEDGER.csv).

## Historical release notes

The dated feature notes below preserve what earlier releases claimed. Their statements that installation, builds or visual QA were still outstanding describe the evidence at that time and are superseded by the current checkpoint above and `docs/QA_EVIDENCE_CURRENT.md`; they are not current test results.

**Model-directed exhibit (Oct 27, 2026):** With explicit Meta consent, Muse Spark can select a physical 3D exhibit of the recorded alternate-history consequences (people, infrastructure, memory). Content is locally grounded and never changes saved gameplay. No live model call or public runtime verification is claimed. [Design](docs/META_CAUSAL_EXHIBIT_V113.md).

**Event provenance and Meta verification probe (October 27, 2026):** 23 new commits/84 changed files against the conservative 00:00 ET event baseline; added an opt-in, one-request Meta handler probe (`npm run meta:probe -- --live`), which has **NOT** been executed here. [Provenance and gates](docs/HACKATHON_NEW_WORK_PROVENANCE.md).

**External Audit & Google Research Harnesses (October 27, 2026):** Pinned Google's Harness2 and RRSI as development-only git submodules. Added a deterministic skeptical reviewer (`npm run review:source`, `npm run review:agents`) and five independent reviewer briefs. Neither upstream research framework was run here or installed in the deployed game. [Setup](tools/research/README.md) · [Meta competition blockers](docs/META_HACKATHON_REALITY_CHECK_2026-10-27.md). **Current release verdict: NO-GO pending verified Meta model, live product, and real demo footage.**

**Hands-on Visual Test 1.12.2 (October 27, 2026):** Added a direct **▶ TEST RUNE PHYSICS** button in the practice arena and new real-Three.js/Rapier runtime regression tests to catch missing geometry, malformed animation and physics errors. [How to launch](docs/HOW_TO_PLAY.md). A visual browser review is still outstanding.

**Arena Art 1.12.1 (October 27, 2026):** Replaced invisible collision-wall behavior with visible, transparent practice rails; added restrained arena geometry, weighted mechanical bevels, lighting and subtle impact feedback. Improved the physics guest-preview camera composition. [QA notes](docs/TACTILE_WORLDS_V110.md). Hardware and browser visual QA remain open.

**Character & Motion Art 1.12.0 (October 27, 2026):** Added layered character silhouettes, facial and hair detailing, ground-contact soft shadows, subtle cloth motion, gait accents and more controlled stylized lighting. The player walk cadence is now matched more closely to travel speed. [Technical notes and QA](docs/CHARACTER_FINISH_V112.md). **Source checks only; actual visual/browser/Quest QA still needed.**

**Instant Physics 1.11.3 (October 27, 2026):** Start screen includes **RUN PHYSICS SANDBOX**, opening a temporary dungeon practice session beside the interactive relics. No save or passphrase; the game reports whether WebAssembly physics started. [Try it](docs/HOW_TO_PLAY.md).

**Physics Feel 1.11.2 (October 27, 2026):** Training relics have realistic damping, reduced bounce, visible object-to-collider alignment, shorter impulses and smoother rendered poses on high-refresh displays. [Physics QA notes](docs/TACTILE_WORLDS_V110.md).

**Living Movement 1.11.1 (October 27, 2026):** The traveler now uses the existing skinned humanoid rig with cross-faded idle/walk clips, frame-rate-independent camera-relative movement, controlled acceleration and braking, smooth turns and a chase camera. Fixed cumulative head and shoulder drift in all actors. The guest preview now explains movement and nearby physics objects. [Design and QA](docs/MOVEMENT_POLISH_V111.md).

**PLAY WITHOUT INSTALLING ANYTHING:** [Open ELSEWHERE in StackBlitz](https://stackblitz.com/fork/github/kapasainitishreddy/ELSEWHERE?startScript=play&view=preview). StackBlitz imports the current public GitHub branch, installs packages and runs Vite in your browser. Click **PLAY GUEST DEMO** for an unsaved session. Local Chromium software-rendering journeys are tested below; StackBlitz-hosted execution and headset WebXR remain unverified. [Local setup instructions](docs/HOW_TO_PLAY.md).

**Living NPCs 1.9 (October 27, 2026):** Integrated MIT-licensed Yuka steering into the four in-world supporting characters. They follow local bounded routes, avoid existing collision rectangles, stop for conversations, and move their E interaction prompts with their body meshes. The source and isolated contract tests are available, but the full npm install, browser build and physical Quest QA still need verification. [Open-source ledger](docs/OPEN_SOURCE_INTEGRATION.md).

**Tactile Worlds 1.10.3 (October 27, 2026):** Rapier-powered physical relics and cargo arrive in the dungeon and mech scenes; they react to E, clicks and controller triggers without changing canonical save state. Yuka cast now turns toward its travel direction and the player. The physics stage loads lazily and releases resources between worlds. Imported verified Kenney props also become inspectable through the lazy MIT-licensed three-mesh-bvh adapter, with ordinary picking fallback. [Implementation and QA](docs/TACTILE_WORLDS_V110.md). Dependency installation, full browser build and Quest hardware verification remain outstanding.

**Causal Replay 1.8 (October 27, 2026):** The 1889 workshop now offers three accurate, no-side-effect previews before committing an invention's fate. The Timeline journal shows five world-state observations, reproducible non-sensitive replay labels, and a side-by-side Prime/Echo comparison. The underlying game state machine remains authoritative; this is fictional, not future prediction. [Implementation and QA](docs/CAUSAL_REPLAY_V18.md). **Full npm test, Vite build, live Meta API and Quest testing remain unverified.**


**Living Atmosphere 1.7:** Five distinct procedural environmental performances, with one instanced draw call per world, bounded event reactions, Quest/mobile particle caps, and no continuous effect under Reduced Motion. See [the animation and VR QA guide](docs/LIVING_ATMOSPHERE_V17.md). Code-level release only: real headset rendering remains unverified.

### Living Motion 1.6: performance-directed animation

The new **Presence Director** builds on the existing local skeletal rigs and authored clips rather than pulling external video or AI-generated motions. The future self and NPCs have individual acting rhythms, conversation-sensitive gaze and hand gestures, breathing, subtler blinks, and a more readable speaking mouth. Each character's acting remains deterministic, does not examine a user's face, and doesn't store or send biometric information. This is deliberately **stylized acting, not voice-to-phoneme lip sync**.

- **Reactive portals:** animated rings, a compact same-origin shader, and instanced shards respond to player proximity. Far-away shards update less often for headset performance. The XR camera never follows the effect.
- **Combat choreography:** mech fire has a visible launch → projectile travel → impact sequence. Drones move on bounded lanes, reactor light responds to recoil, and the Warden/dungeon continue to use existing authoritative combat rules.
- **Time has motion:** the Hours Bank gains ten instanced fictional seconds that move through a small hourglass. These visuals **do not** charge, reward, or spend hours.
- **Alternate-life projection:** after deciding what happens to an invention, the future-self apartment can project a miniature, animated possible life onto the table. This is entirely fictional and reflects saved game choices, not any personal future prediction.
- **Comfort and safety:** respects `prefers-reduced-motion`, caps attack effects, and recreates smaller FX budgets when switching into Quest XR. No automated viewpoint shifts, screen flashes, tracking, cloud calls, or new telemetry.
- **Drift fix:** moving background vehicles use anchored positions instead of accumulating their vertical offset.

Run `npm run animation:check`, `npm run motion:check`, `npm test`, and `npm run build` on a machine with Three.js and Vite installed. Read [Living Motion QA](docs/LIVING_MOTION_V16.md) for browser and physical Quest checks. Node tests cannot certify visual fidelity or headset comfort; those remain **unverified** here.

### Story revision · The Ninth Platform (v1.5)

A new original mystery spans the 2046 apartment, 1889 workshop, Hollow Crown, 2199 titan and 2087 station. Six optional chapters are unlocked by physical-world story choices. Inventions, ownership, time debt, Warden mercy/combat, mech defense and the Empire/Legacy/Wanderer endings produce distinct prose. This narrative requires no network or model and uses the existing encrypted local vault. [Read the five-act story bible](docs/STORY_V15.md).

### Trust & Comfort 1.4 — research-informed update (Oct 27, 2026)

- **Memory Cards:** While visiting The Other You, *you* choose up to six memories for your possible older self to retain. These are encrypted with your existing local passphrase vault, are separated between Prime and Echo realities, and can be forgotten individually. Only an explicitly enabled loopback/on-device model can read them; Meta Cloud does not receive them.
- **Conversation reliability:** A deterministic reviewer rejects some unsupported backstories, chronology contradictions, and repeated generated replies; the authored, private character provides a fallback. No heuristic can guarantee a perfect AI conversation.
- **Quest comfort:** Gentle, Seated and Standard teleport/snap options; voluntary session-only break reminders; no forced headset movement or health measurements.
- **Offline updates:** Network-first HTML with same-origin offline fallback, strictly bounded static caching and no private/API response caching.
- **Evidence:** [Research → pain points → test plan](docs/RESEARCH_TO_RELEASE_2026-10-27.md) and [device QA protocol](docs/COMFORT_AND_MEMORY_QA.md).

This is not a medical device, therapy, or a way to manipulate serotonin/dopamine. Test with `npm test` and `npm run submission:check`; **a working browser bundle, real headset comfort, and live Meta model call are mandatory before claiming submission readiness**.

### v1.3 First Crossing / submission preview (October 26, 2026)

ELSEWHERE now presents a **guided, skippable seven-stage playable introduction**: meet a fictional older self, ask a question, travel through a portal to alternative 1889, invent technology, choose who owns it, return to talk again, and witness the changed future. The World Atlas adds a deterministic cause-and-effect receipt, with separate authored witness perspectives. Story state remains encrypted in the local vault. This is a game consequence, not a prediction about the player or a real-world financial opportunity.

The VR rig has been corrected so controller rays move with the tracked player; XR camera position is not reset by arbitrary scene updates. Teleport targets are bounded and checked for props, with gentle 30° or standard 45° snap-turn options, explicitly accessible in both desktop UI and headset. **Hardware comfort and frame rates are unverified** until tested on a real Quest.

For a hackathon Meta-model demonstration, an optional **same-origin `/api/character` serverless handler** accepts consented fictional dialogue only; it requests an allowlisted atmospheric cue with each character reply and never lets model output change wealth, inventories or achievements. A conservative per-process request limit reduces accidental costs, but **deployment-level spending limits and edge abuse defenses are required before public use**. The default on-device authored dialogue works without this service.

The hackathon entry is **interactive, causally consistent storytelling**, not an AI mental-health advisor and not a medical treatment. See [player-pain-point research](docs/RESEARCH_PATTERNS_AND_RESPONSES.md), [three-minute demo shot list](docs/DEMO_3MIN.md) and [manual submission gate](docs/SUBMISSION_CHECKLIST.md). Run `npm run submission:check` to identify source checks versus manual blockers. Earlier source versions predate the official build period, so identify all *new work* truthfully.

### Director's Cut 1.2

An improved world-first presentation with local illustrated portal thumbnails, enhanced environment grading, an explicit focus-mode exit, and a more immersive experience when desktop movement begins. These are actual user-interface changes, not just a separate concept rendering. Five-world navigation, gameplay state and private saves remain intact. For QA, read [Director's Cut](docs/DIRECTORS_CUT.md). This release does not claim that production Vite, Quest or live Meta inference has been verified.

### Living Presence 1.0.1: animated people and meaningful details

**New in this source update:**

- **Original skinned humanoids** replace the abstract future-self mannequin and four supporting cast models. They use real Three.js bone hierarchies and a skinned coat, not just a spinning capsule. Six authored clips (`idle`, `listening`, `speaking`, `walking`, `delighted`, `startled`) are cross-faded using `AnimationMixer`; the future self animates when a conversation begins. Facial expressions and the mouth movement are stylized and **not audio-driven lip sync**.
- **Three new local 3D keepsakes** in 2046: the blueprint changes with inventions and patents, the borrowed-hours watch describes your branch's **fictional** time balance, and the portrait reflects your imagined city. Select via E, click, or WebXR controller ray. Examining each object triggers brief story text and a related future-self gesture; no additional personal records are collected.
- **A genuinely animated open-source fox companion** is supported. The optional **Khronos glTF Sample Assets Fox** has imported Survey/Walk/Run skin animations. You must run `npm run assets:animated` on a network-connected developer computer; the game never fetches from third parties during gameplay. Its mixed CC0/CC-BY 4.0 authorship and license are documented in [the attribution file](docs/ANIMATED_ASSET_LICENSE.md). **The GLB is not bundled in this default repository. When installed, the companion follows the traveler with bounded walk/run movement instead of simply running in place.**
- **VR/headset comfort:** a bounded desktop pixel ratio, no new forced camera motion, idle animation reductions under the OS reduced-motion setting, local-only haptic attempts and original built-in teleport/snap-turn controls.
- **Offline cache consistency:** a refreshed same-origin service worker does not indefinitely cache stale optional 3D asset manifests after a developer installs an art pack.

Read [Character and Quest QA](docs/CHARACTER_AND_ANIMATION_QA.md), then run `npm run animation:check` and `npm run check`. **Node tests and source checks are not substitutes for a successful Vite build, live visual review, measured Quest performance, or real-person comfort testing.**

### Kinetic Worlds 0.9: interact with the world

The new interaction and animation pass makes the existing worlds more responsive **without adding cloud calls, commercial assets or health claims**:

- **Living characters:** the traveler has jointed walking and breathing; independent story characters idle, turn toward you, shift posture and change their gestures with memory affinity; the fictional future self blinks, tilts their head, opens their mouth during speech and visibly listens while preparing replies. These are expressive procedural animations, not face capture or real personal likenesses.
- **Real interactions:** five locally described physical artifacts can be examined in their scenes. E works for nearby beacons, artifacts and portals; mouse click and Quest-controller trigger activate corresponding 3D targets. Hover reticles and a proximity cue explain actions before selection.
- **Spatial response:** original WebXR-friendly ring and spark animations punctuate arrivals, historical inventions, new memories, Warden strikes and mech reactor pulses. The mech also has recoil and animated thrusters. Effects have strict budgets, expire, and are destroyed on scene changes, with a reduced-motion option and no VR camera shaking.
- **More believable environments:** reactive train movement, softly shifting light in the apartment, hovering papers in 1889, crystalline relics in the dungeon, and animated hangar illumination.
- **VR performance:** far-off futuristic towers, roofs and lit windows now use Three.js `InstancedMesh` instead of hundreds of individual draw calls. Character, weather and event budgets are smaller on lower-power devices. This is an optimization, **not yet a measured FPS guarantee**.
- **Local QA:** append `?perf=1` to the game URL to display live frame rate, 95th percentile frame time, draw calls and triangles; metrics are neither stored nor transmitted. Run `npm run motion:check` for animation-budget unit tests.

See [Animation & Quest testing](docs/ANIMATION_AND_XR_QA.md). **111 simulation, dialogue, privacy and motion tests passed for the prior 0.9 release; production Vite bundling and physical Quest controls are not verified.** This release still needs visual QA and device performance measurements before being used as a competition demo.

### Future Compass 0.7: a life beyond the headset

The imagined older self now has a **One-Hour Compass**: in the Future Self room, you may privately choose one small real-world act of creation, connection, rest or curiosity. There are no streaks, daily alerts, scores, mandatory answers or rewards for marking a step tried. The character can refer to the selected step and earlier conversation in subsequent turns. Clearing it deletes the active vault's note (not old exported backups). Prime and Echo hold separate intentions.

- By default, dialogue is **authored, local, and offline**. Optional Ollama on-device conversations receive short, bounded current-character context only after you enable them. Generated replies containing certain medical promises, isolation language or guaranteed predictions are rejected in favor of the authored fallback. A simple filter cannot guarantee safety across all model outputs.
- Optional Meta API use remains a separate, **explicitly non-private** hackathon demonstration. It does **not** receive Compass notes, private letters, NPC histories or other branch data. The privacy indicator now changes during a cloud session.
- No claim of dopamine/serotonin manipulation, depression treatment, medical benefit, or real future prediction is made. This is a fictional, reflective experience, **not therapy**.
- New local check command: `npm run readiness` reports source/test results and identifies headset, Meta API, and browser validations that still require manual evidence. **87 source-level tests passed in the development environment for this release**, but a complete browser build and physical headset testing remain unverified.

See [Future Self research](docs/FUTURE_SELF_RESEARCH.md), [testing runbook](docs/TESTING_AND_QA.md), and [hackathon scorecard](docs/HACKATHON_SCORECARD.md).

### Earlier Chronal Polish 0.4 work

- **World atmosphere:** GPU-friendly original sky gradients, drifting bioluminescent particles, floating debris and portal coronae are now active in all five environments. Particle budgets automatically reduce on small screens and in VR. Reduced-motion players get static alternatives.
- **Interface assets:** 12 selected **Lucide open-source ISC** icon SVGs are stored in the repository and used by the world selector, encrypted-vault indicator, controls and journal. No CDN is contacted.
- **Clear combat targeting:** an in-world reticle appears only during an active dungeon or mech encounter. Keyboard/gamepad/VR controls and the existing rules remain unchanged.
- **CC0 game art integration:** a curated set of **24 Kenney 3D assets** is supported with placements in each world. The model **download is optional** and must be run on a network-connected development computer (the models themselves are *not* bundled in GitHub main). The importer verifies exact model hashes, after which the game loads only local copies. Without installed 3D packs the procedural worlds continue working.
- **Documented provenance:** each asset has its license, author, source, and installation behavior described in [Assets & licenses](docs/ASSETS.md).

```bash
npm run assets:fetch                # Download and locally bundle all 24 Kenney CC0 models
npm run assets:animated             # Optional CC BY 4.0 Fox with genuine skeletal clips
npm run assets:fetch -- --world mech # Or install one world's models
```

These are developer-side commands. Player conversations, saved timelines and vault contents are never included in the asset download.

## Run it

Requires Node.js 22+, npm and an installed copy of the dependencies. Default mode runs entirely on your own computer with authored local dialogue and **no Meta API key**. There is also an optional on-device generative model adapter, enabled only when you run a separate local service.

```bash
npm ci
npm run dev
# Visit http://localhost:5173
```

Use Node.js 22 or newer. `npm ci` installs the exact versions recorded in `package-lock.json`. In restricted containers where npm's default cache directory is unavailable, you can keep the same integrity-checked install while placing the cache under `/tmp`:

```bash
npm ci --cache "${TMPDIR:-/tmp}/elsewhere-npm-cache"
```

```bash
npm run test             # simulation + vault + privacy + controls
npm run build            # production Vite build
npm run check            # tests then production build
npm run readiness        # automated checks + explicit submission blockers
```


`npm run dev` starts the local Vite server only. Personal gameplay never needs a cloud API. On the first visit, create a passphrase-protected local vault. There is **no passphrase recovery**. Do not lose it. Back up using the encrypted export in My Timeline.

## Private on-device generative NPC conversations (optional)

ELSEWHERE has two **distinct** local dialogue modes:

1. **Default, zero-setup:** original authored dialogue driven by each character's bounded memories and choices. No prompts leave the unlocked browser. This works without installing a model, network access, an account, or an API key.
2. **Optional on-device Ollama:** expressive, generated conversations with Ada, Iris, Sol, the Witness, Warden and your fictional future self. There is no Meta API key or remote inference. You install the model yourself, then deliberately enable it in **My Timeline → Privacy → On-device AI** (or the future-self conversation panel). The toggle resets whenever the vault locks or the page reloads. The characters still have the same game-engine memory and the language model **cannot modify game currency, unlocks, trust or plot flags**.

First install [Ollama](https://ollama.com/) on your **own** computer. Download a lightweight local model while online, then you can play without internet (subject to local browser asset caching):

```bash
ollama pull qwen2.5:1.5b
ollama serve              # may already be running as an OS service
# In another terminal, from the ELSEWHERE folder:
npm run dev:local-ai
# Open http://127.0.0.1:5173 and enable on-device AI in Privacy
```

Use `LOCAL_AI_MODEL=<a previously downloaded local model>` to choose another model. **No model is downloaded by the game.** Device RAM/VRAM and performance vary. If Ollama is absent, inference times out, or the player switches worlds, the game gracefully falls back to authored dialogue or discards stale responses. Ollama's inference API is fixed at `127.0.0.1:11434` and the game's private bridge binds only to `127.0.0.1:8788`; it does not accept browser requests from unapproved web origins. Text prompts, selected character memories and a bounded **fictional** state summary travel from your unlocked browser to these loopback processes; neither process in this game's bridge writes them to disk or sends them to Meta. Other software or a separately reconfigured Ollama installation could have different behavior, so inspect your setup if absolute network isolation is essential. Stored dialogue stays AES-encrypted inside your browser vault.

Our production game bundle also avoids remote font CDNs and uses a strict first-party browser connection policy. This is privacy-first by default, **not a claim of independently audited perfect secrecy**. A compromised browser, operating system, model plugin, or hosted game update can still access the decrypted content during a session.

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

**Independent NPC agendas:** five story characters advance through original authored developments after distinct meaningful decisions. Ada opens a night school, Iris documents missing hours, Sol opens rescue corridors, the Witness discovers another way to resolve the crown and The Other You writes an unsent letter. They remember choices, offer missions and react when you return. By default this is **deterministic offline storytelling**, not continuously thinking autonomous agents. Optional Ollama adds private generated dialogue, not continuously running agent behavior.

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

There are glowing portals in the 3D scenes as well as text world selectors. Touchscreens have directional buttons and tap controls. Controller haptics are attempted only on supported hardware. VR locomotion defaults to teleportation; no forced continuous VR movement. **Quest/VR rendering, frame rates and controller behavior have not been verified on a physical headset.** The 3D runtime uses Three.js WebXR rather than Meta's Immersive Web SDK. Rapier powers dungeon/mech physics props; the project is not a full game-engine framework.

## The Private Layer

- **Encrypted at rest:** all saves, NPC memories, private letters, story transactions and *both* timelines are inside a versioned **AES-256-GCM** envelope, with a passphrase-derived PBKDF2-SHA256 key (310,000 iterations), unique salt and fresh IVs.
- **Private by default:** no account, tracking, cloud saves, browser speech recognition or remote AI requests in normal gameplay. Character replies run via authored local logic by default. Optional on-device Ollama processes a selected character’s bounded memories without a remote model.
- **Manual migration and backup:** old unencrypted browser saves are migrated into the vault when it is first created. Backup exports and imports contain ciphertext only and require the passphrase.
- **Offline behavior:** the production service worker caches only same-origin public assets. The HTML or scripts must first be served/downloaded. True offline use requires a local installed build or a verified cached copy.
- **Security caveats:** a device compromise, browser extension, malicious website update or screen recording can access data while it is unlocked. Network hosts can see site requests when the game is remotely served. This is **not independently audited or guaranteed zero-knowledge in all threat models**.

Full limitations: [Privacy model and threat boundaries](docs/PRIVACY.md).

### Optional Meta demonstration (not private)

The game includes a **separately started**, opt-in Meta Model API bridge for hackathon demonstrations. This is **OFF** every session and not started by `npm run dev`. To use it, put a developer-only API key in `.env`, run `npm run dev:meta`, and explicitly turn on Meta cloud mode in My Timeline. The next typed prompt and a small fictional state summary leave the device for Meta; saved NPC memories, letters, keys, and other branch data do not. This mode **cannot** be described as completely local. The bridge and model must be verified with actual credentials before making a live capability claim.

## Open source and rights

Versions below come from the committed `package-lock.json` (lockfile version 3); licenses are the package metadata recorded there. Optional assets have separate notices in [Assets & licenses](docs/ASSETS.md) and are not assumed to be bundled just because an installer or placement exists.

- **Rapier** (`@dimforge/rapier3d-compat` 0.21.0, Apache-2.0): used for the dungeon and mech physics props and exercised by real Rapier WASM tests, including the ten-minute fixed-step settling simulation. It is in the runtime dependency graph; the browser build emits a lazy Rapier chunk.
- **Three.js** (`three` 0.181.2, MIT): scene graph, renderer, materials, camera, OrbitControls and WebXR VRButton.
- **three-mesh-bvh** 0.9.16 (MIT): optional acceleration for bounded imported-mesh inspection, with ordinary raycast fallback.
- **Yuka** 0.7.8 (MIT): local NPC navigation and steering.
- **Vite** 7.3.7 (MIT) and **Playwright** 1.62.1 (Apache-2.0): development/build tool and browser-test dependency respectively.
- **Lucide icons** (ISC): 12 selected bundled local SVG assets with their notice in `public/assets/icons/LICENSE-lucide.txt`.
- **Kenney assets** (CC0-1.0) and the **Khronos Fox** (CC0 plus CC BY 4.0 components): optional developer-installed art packs; their binaries are not included in the default repository. Preserve attribution and the separate notices when installing them.
- **Original art systems and game code:** procedural environments, characters, portals, story, deterministic state, privacy vault, interface and tests are project-authored; see [LICENSE](LICENSE).
- AI Town, browser-whisper, Godot XR Tools, Meta IWSDK and film/anime/manhwa assets are not bundled. The optional Meta API bridge is application code, not a bundled Meta SDK, and it has not been validated with a live call.

## Release and hackathon status

The current local evidence and unresolved gates are summarized above and in [QA evidence](docs/QA_EVIDENCE_CURRENT.md) and the [readiness matrix](docs/HACKATHON_READINESS_CURRENT.md). Local Chromium and Node checks do not establish a live Meta response, current competition eligibility, public preview, recorded submission video, physical-device performance, Quest comfort, accessibility certification, or participant impact. Submission readiness is **NO-GO** until its applicable external gates are independently satisfied. **No GitHub Actions workflows are present in this repository.**

## Research-informed immersive storytelling (Stillwater)

**The Quiet Between Worlds** is an optional, nonclinical reflection experience inspired by peer-reviewed research on virtual nature, future-self continuity, and self-compassion. It contains four short original stories accessible with the **✦ QUIET BETWEEN WORLDS** button; a luminous garden terrace appears near the future-self apartment. The narrative choices are deliberately **ephemeral**: never saved, scored, shared with a model, or counted as time-currency. There are no streaks, dopamine meters, serotonin claims, mood classification, diagnoses or health advice. It is not therapy and does not predict your future.

**Meta AI glasses companion concept**: open `/glasses/` on a supported browser for a standalone, camera-free, microphone-free, tracking-free collection of short fictional reflections. It does not sync with the encrypted VR vault or run immersive VR. A Meta Ray-Ban Display device test is still required; displayless AI glasses cannot run a visual VR world. Full research and limitations: [`docs/RESEARCH_AND_SAFETY.md`](docs/RESEARCH_AND_SAFETY.md).

For the **Meta Startup hackathon**, the primary submission remains privacy-first, causally connected interactive worlds. Do not claim that an optional research-inspired scene is a medical intervention; AI mental-health advisors appear on the organizer's anti-project list. Cloud Meta-model use is strictly separate and opt-in and the actual model integration must be demonstrated before submitting.

## Test and verify the Future Self update

The on-device roleplay bridge now includes the previously missing `local-server.mjs` and a memory-aware authored Future Self that responds to fictional world choices without requiring any network connection. There are optional text conversation starters, a **CLEAR PRIVATE CONVERSATION** action, and a private **One-Hour Compass** that records a small voluntary act without a score or streak. This is fiction and reflection, never a medical intervention, digital therapist, or prediction.

See [TESTING_AND_QA.md](docs/TESTING_AND_QA.md) for step-by-step desktop and Meta Quest testing; [HACKATHON_SCORECARD.md](docs/HACKATHON_SCORECARD.md) for the official judging rubric and target evidence; and [FUTURE_SELF_RESEARCH.md](docs/FUTURE_SELF_RESEARCH.md) for the relevant research and limitations.

To opt into local language-model roleplay on your computer, install [Ollama](https://ollama.com/) and download a compatible small model, e.g. `ollama pull qwen2.5:1.5b`; start Ollama and run `npm run dev:local-ai`. The model and its logs/process remain under your control, subject to the local computer's security. This is *not* the Meta API. If you enable the separate Meta cloud demo, selected typed questions and fictional context leave your device and no longer qualify as completely local.


## Future Self Presence Lab (v0.8)

This versioned note describes the feature when it was introduced; consult the current checkpoint and QA evidence at the top for present-day verification.

The imagined future-self encounter now has **subtle listening/speaking avatar animation** and a room keepsake that reflects your alternate-history choices. Authored, offline dialogue includes concrete, choice-dependent fictional moments; optional local Ollama provides more flexible conversation. The player's actual future is never predicted.

**Opt-in voice** is deliberately conservative. Hear Future Self will use **only English voices flagged as on-device by the browser**. Experimental dictation opens a microphone **only when the browser verifies an installed on-device speech-recognition pack**; it inserts editable words, never sends them automatically, and never falls back to cloud transcription. Many browser/headset configurations will stay text-only. See [Future Self Presence Lab](docs/FUTURE_SELF_PRESENCE.md).

Run `npm run dialogue:check` for the authored narrative smoke evaluation, `npm test` for regression tests, and `npm run readiness` for the honest submission preflight. These are not replacements for an actual visual browser/Quest test, voluntary usability feedback, or proof of Meta-model usage. The strongest privacy guarantee depends on the browser and operating system, so an offline locally installed build with typed input remains the most isolated configuration.
