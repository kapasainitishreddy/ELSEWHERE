# ELSEWHERE

**One life is never enough.**

A browser-first 3D world simulation by Syrava. Wander a futuristic city, talk with a speculative older version of yourself, travel to an alternate 1889, rewrite the future by inventing technology, choose superpowers in a dungeon, or drive an original giant robot. Every meaningful choice changes one persistent timeline.

Built as a new open-source prototype for the **Meta Global AI Developer Hackathon (Startup track, October 26 – November 4, 2026)**.

## Run locally

Node.js 22+ is required.

```bash
npm install
npm run dev
```

Open the Vite URL, usually **http://localhost:5173**. The site runs in **offline-story mode** without a Meta API key. `npm run dev` starts both Vite and the local API bridge. To build and verify:

```bash
npm run check
npm run preview
```

`npm run test` covers the economic rules, irreversible invention outcomes, persistent timelines, dungeon outcomes, and pilot progression. No GitHub Actions or CI workflows are used.

## Five worlds

| World | Baseline interactions | What carries forward |
| --- | --- | --- |
| **Neo Elysium (2087)** | Explore the neon city, buy a sky residence, invest in robotics, collect one payout, fund public library | Wealth, property, trust and city landmarks |
| **The Other You (2046)** | Meet a fictional future self, choose dialogue prompts, ask freeform questions by text/optional browser microphone | Conversation and memories reflect inventions, wealth, fame and decisions |
| **The First Spark (1889)** | Prototype Aether Cell, Clockwork Oracle or Skyrail Drive; patent, gift or auction | Changes skyline, economic resources, reputation and future self |
| **The Hollow Crown** | Choose phase shifting, gravity weaving or storm calling; defeat Warden; sell or guard relic | Superpowers, trust, relic outcome |
| **Titan Foundry (2199)** | Synchronize with ATLAS-09, deploy and move it via WASD, defend the city | Pilot status, reputation, city defense |

**Move:** WASD or arrow keys; Shift for speed. **Look:** mouse drag. **Travel:** side world selector or glowing portals inside each scene. **VR:** on supported HTTPS WebXR headsets, use ENTER VR and controller ray/select for portals and world choice panels. Desktop mode is fully playable without a headset.

Fame and credits are fictional in-game variables. The year 1889 is alternate history, not historically accurate invention advice. The future-self character presents imagined paths, **not predictions about real people or outcomes**.

## Optional Meta Muse Spark integration

Copy `.env.example` to `.env`, set `MODEL_API_KEY` **only on the backend**, and restart `npm run dev`. The Node bridge calls Meta's `muse-spark-1.3` via `https://api.meta.ai/v1/chat/completions`. Never put this key in `VITE_` variables, static hosting settings or commits. Test the service with `http://localhost:8787/api/health` (only `metaConfigured`, not the secret, is returned).

With no key, API outage or microphone support, the game stays playable, using branching deterministic dialogue. API responses never mutate inventory, money or achievements. If deploying statically, host `server.mjs` (or equivalent serverless `/api/character`) behind the same HTTPS origin. A static `dist/` by itself still works through the offline dialogue fallback.

Meta references:
- [Meta Model API quickstart](https://dev.meta.ai/docs/cookbook/quickstart-chat-completions)
- [Meta Immersive Web SDK](https://github.com/facebook/immersive-web-sdk)
- [Three.js VRButton](https://threejs.org/docs/pages/VRButton.html)

The current VR layer uses **plain Three.js WebXR**, to minimize integration risk during the hackathon. Meta IWSDK migration is planned but **not yet implemented**. No claim is made that headset interactions or real voice synthesis have been device tested; VR requires HTTPS and a compatible browser/headset.

## Architecture

- `src/game.js`: deterministic causal state, economy, world transitions and local save schema.
- `src/worlds.js`: procedural 3D scenes, portal raycasting, WebXR setup, desktop movement and original ATLAS-09 mech model.
- `src/ui.js`: world navigation, branching action controls, journal, chat and responsive presentation.
- `src/main.js`: client orchestration, browser speech input/output and API fallback.
- `server.mjs`: opt-in backend proxy for Meta Muse Spark. No API credentials in the browser.
- `docs/HACKATHON.md`: provenance, rubric mapping, and demo script.

The prototype has no accounts, multiplayer, paid purchases, real-money earning, imported copyrighted characters or assets. It uses original procedural environments and geometric characters. Do not describe its scripted future simulation as a real-world forecasting engine.

## Next milestones

Improve the WebXR 3D interaction UI, original artistic environments, robust NPC animation, speech latency, asset loading, physical mech controls, collision detection, causal scenario tests, accessible mobile scene navigation and actual Quest headset testing. See [`docs/ROADMAP.md`](docs/ROADMAP.md).
