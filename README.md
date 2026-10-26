# ELSEWHERE · Chronal Polish 0.4

> One life is never enough.

**ELSEWHERE** is a privacy-first, browser-based 3D speculative world prototype by Syrava. Enter portals to another century, meet a fictional older version of yourself, invent technology before its era, trade and steal fictional hours, negotiate with a Warden who remembers your fighting style, and defend a futuristic city from inside a giant original mech.

This is an original experimental game and potential **Meta Global AI Developer Hackathon 2026 Startup-track** submission. It is **not** yet a polished shipped VR game, an MMO, or a verified Meta AI submission. In-world hour balances, fame, wealth and life paths are fictional, never real predictions or financial assets.

## What's new in Chronal Polish 0.4

- **World atmosphere:** GPU-friendly original sky gradients, drifting bioluminescent particles, floating debris and portal coronae are now active in all five environments. Particle budgets automatically reduce on small screens and in VR. Reduced-motion players get static alternatives.
- **Interface assets:** 12 selected **Lucide open-source ISC** icon SVGs are stored in the repository and used by the world selector, encrypted-vault indicator, controls and journal. No CDN is contacted.
- **Clear combat targeting:** an in-world reticle appears only during an active dungeon or mech encounter. Keyboard/gamepad/VR controls and the existing rules remain unchanged.
- **CC0 game art integration:** a curated set of **24 Kenney 3D assets** is supported with placements in each world. The model **download is optional** and must be run on a network-connected development computer (the models themselves are *not* bundled in GitHub main). The importer verifies exact model hashes, after which the game loads only local copies. Without installed 3D packs the procedural worlds continue working.
- **Documented provenance:** each asset has its license, author, source, and installation behavior described in [Assets & licenses](docs/ASSETS.md).

```bash
npm run assets:fetch                # Download and locally bundle all 24 Kenney CC0 models
npm run assets:fetch -- --world mech # Or install one world's models
```

These are developer-side commands. Player conversations, saved timelines and vault contents are never included in the asset download.

## Run it

Requires Node.js 22+, npm and an installed copy of the dependencies. Default mode runs entirely on your own computer with authored local dialogue and **no Meta API key**. There is also an optional on-device generative model adapter, enabled only when you run a separate local service.

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

There are glowing portals in the physical 3D scenes as well as accessible text world selectors. Touchscreen has directional buttons and tap controls. Controller haptics are attempted only on supported hardware. VR locomotion defaults to teleportation; no forced continuous VR movement. **Quest/VR rendering, frame rates and controller behavior have not yet been verified on a physical headset.** The 3D engine is plain Three.js WebXR, not Meta's Immersive Web SDK or a full physics engine.

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

- **Three.js** (`three` ^0.181.0, MIT): geometry, materials, shaders, camera, OrbitControls, and WebXR VRButton.
- **Lucide icons** (ISC): 12 selected bundled local SVG assets for HUD and navigation.
- **Kenney models** (CC0-1.0): 24 optional same-origin GLBs from a pinned verified mirror, installed via `npm run assets:fetch` only; not automatically fetched at runtime.
- **Original art systems:** per-biome skydomes, GPU effects, animated portal coronas and XR-budgeted particles.
- **Vite** (^7.1.0, MIT): local development and production web bundling.
- **Ollama**: OPTIONAL separate local inference runtime, **not** included or automatically installed; API used only when the local service is explicitly started. Models have their own licenses and should be checked before commercial use.
- **Our original code:** state machine, branching hour economy, fictional characters and agendas, puzzles, combat rules, ambience synthesis, procedural worlds, private vault, journal, UI, and tests. See [LICENSE](LICENSE).
- Rapier, AI Town, browser-whisper, Godot XR Tools, Meta IWSDK and existing film/anime/manhwa assets are **not bundled into this prototype**. They are research references or future integration candidates, not work we claim to have reused. All current 3D props and titan designs are procedural originals. Twelve Lucide ISC icons are bundled. Twenty-four Kenney CC0 model placements are implemented, with a verified optional developer downloader; GLBs are not checked into main by default.

## Release and hackathon status

The Node test suite covers time trade invariants, alternate branch isolation, NPC agendas, replay safety, combat adaptation, save integrity, browser encryption, opt-in API boundaries and gamepad mapping. These tests **do not prove the Vite production bundle renders or headset performance is acceptable**. Record actual browser/headset sessions and run a security audit before production launch.

See [Architecture](docs/ARCHITECTURE.md), [Demo script](docs/DEMO_3MIN.md), [QA](docs/QA.md) and [Hackathon submission notes](docs/HACKATHON.md). **No GitHub Actions workflows are used.**


## The Quiet Between Worlds · research-informed optional story
A new voluntary, nonclinical experience includes a virtual garden, imagined future-self dialogue, kind roleplay and meaningful small choices. Open it from the header or approach the Stillwater terrace in the future-self world. The calm story choices are ephemeral, never saved, scored or sent to AI. No dopamine/serotonin claims or health advice. The independent /glasses/ Pocket page offers a glanceable concept for Meta Ray-Ban Display; it has not been tested on actual glasses and it does not sync private game data. See docs/RESEARCH_AND_SAFETY.md.

## Future Self testing and research (v0.6)

This version adds the missing loopback-only Ollama bridge, a memory-aware offline future-self conversation, optional private dialogue starters, and a clear-conversation action. It is fictional, not a clinical intervention or prediction. See [testing and Quest checklist](docs/TESTING_AND_QA.md), [hackathon scorecard](docs/HACKATHON_SCORECARD.md), and [research and safeguards](docs/FUTURE_SELF_RESEARCH.md). For optional local generative conversations install Ollama, run `ollama pull qwen2.5:1.5b`, then run `npm run dev:local-ai`. Cloud Meta remains independently opt-in and nonprivate.
