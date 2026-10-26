# ELSEWHERE · Chronal Veil 0.3

**ONE LIFE IS NEVER ENOUGH.** A privacy-first, browser-based 3D interactive science-fantasy prototype from Syrava, developed for the **Meta Global AI Developer Hackathon (Startup track, October 26 – November 4, 2026)**.

Five linked worlds, **Prime and Echo parallel realities**, fictional hours as currency, a future-self encounter, a three-rune dungeon, an adaptive Warden, and an original giant mech. Choices carry across worlds. NPCs have role-specific motivations, locally authored free-text responses, and bounded memories of what you do. An original 13-chapter interactive story unfolds inside the Echo Atlas.

> **Prototype boundaries:** This is a source-code milestone, not a headset-verified consumer VR release. No live Meta API response, complete Vite build or Quest headset session has been verified in this environment. Character dialogue in Private Mode is deterministic/authored; it is **not a local generative language model** or independent autonomous-agent runtime.

## Start completely local

Prerequisites: Node.js 22+, npm packages downloaded once, and a browser with WebGL and Web Crypto. For headset/WebXR, use a supported browser, HTTPS or localhost and compatible VR hardware.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (check the port Vite displays). Create a private passphrase of 10–256 characters. Your story then loads **only after the encrypted vault is unlocked**. The local mode never needs an account, API key, microphone, analytics service or game server. The development server can make ordinary package/development requests, but the private gameplay logic does not transmit player data.

```sh
npm run test        # deterministic game, privacy and data integrity checks
npm run build       # production frontend (requires npm dependencies)
npm run check       # tests and production build
npm run preview     # preview a built frontend locally
```

### The private layer

- Game states, NPC memories, questions, private future-self letters, purchases and both parallel branches are stored in a **passphrase-protected AES-256-GCM vault** in browser localStorage; PBKDF2-SHA256 uses 310,000 iterations, random salt and a fresh nonce for each save.
- An existing unencrypted v0.1/v0.2 save is migrated on vault creation. The old plaintext key is removed **after** encrypted writing succeeds.
- Export creates a ciphertext-only `.vault.json` backup; import requires its passphrase. **No automatic sync or server upload.** Manual transfer between devices is possible by carrying the encrypted file yourself.
- Lock clears the active vault key from this page session. Lose the passphrase and there is no recovery service.
- The authored **local** future-self and NPC conversations use no cloud AI, browser speech transcription or network call.
- **Important limits:** At-rest encryption is not protection against a compromised device, malicious browser extension, active-memory access, or malicious updates to hosted code. Running a locally served and trusted copy with the network off gives stronger isolation. Your hosting provider can still observe ordinary page requests if you use a hosted website. See [Privacy and threat model](docs/PRIVACY.md).

### Separate, explicitly non-private Meta demonstration

For hackathon development only, the code includes an **optional opt-in cloud conversation bridge**. It is disabled every session and unavailable during normal `npm run dev` unless the operator deliberately starts the separate bridge. When enabled, it sends each entered question plus a small allowlisted fictional timeline summary to Meta's Model API. It does **not** send your encrypted vault, passphrase, NPC memories, previous chat turns, other timeline or private letter. It is **not completely local or completely private**, so users who want strict locality should never enable it.

```sh
# Only if you intentionally want a cloud demonstration
cp .env.example .env
# Add your own MODEL_API_KEY to .env on your trusted machine
npm run dev:meta
```

Never put secrets in `VITE_` variables or commit `.env`. The Meta bridge runs on `127.0.0.1:8787`, proxied by Vite in development. This feature is **not verified live** without a valid key. Using only authored offline NPCs does **not** meet the competition's Meta-model usage requirement; we must validate an eligible Meta integration before submission. A future local open-weight model is only a research milestone and is not built here.

## Worlds and cause-and-effect

| World | Main experience | Story consequences |
| --- | --- | --- |
| **Neo Elysium, 2087** | Neon skyline, living archivist Iris, sky residence, robotics investments, public library | Wealth, influence, reputation, invention effects and time-exchange heist |
| **The Other You, 2046** | Quiet apartment, speculative older self, private future letter, branching conversation | Possible outcomes based on choices, debt and the hours you stole from another self |
| **The First Spark, 1889** | Ada's workshop; invent the fictional Aether Cell, Clockwork Oracle or Skyrail Drive | Patent, gift or auction it to reshape the other eras; borrow or steal hours from the past |
| **The Hollow Crown** | Phase Shift, Gravity Weaving or Storm Calling; three-rune cipher, tactical Warden confrontation | Your enemy remembers repeated attacks, stolen hours and mercy; relic decision |
| **Titan Foundry, 2199** | Original ATLAS-09 mech and a tactical drone-defense battle | Reactor heat, hull, shields, the evacuation corridor and Sol's opinion of you |

**The Chronal Exchange:** Hours are *fictional opportunities*, not a player's real lifespan. Sell/buy using different era rates, earn hours by helping, borrow against future/past debt, or steal from the clocktower, a parallel self, the Exchange or Warden. **Heists alter NPC memory, trust, paradox and future dialogue.** A limited restitution choice can mend some harm. Prices have a buy/sell spread and one-time transactions to prevent infinite farming. **Stars** are earned by finding memory fragments; two stars and three hours can split the story into Prime/Echo, each with independent money, NPC memories and endings.

**Story:** Read all 13 original chapters of *The Museum of Unlived Days* inside **MY TIMELINE → STORY**. Chapters unlock as worlds and choices develop; the manuscript explores future selves, stolen hours, invention ethics, the Warden's memory and a machine that learns why it should stop fighting.

## Controls and comfort

| Interaction | Desktop/mobile | VR prototype |
| --- | --- | --- |
| Move | WASD/arrows, Shift to sprint; on touch use on-screen D-pad | Point and trigger at unobstructed floor to teleport |
| Look | Mouse drag/touch orbit | Natural head tracking; thumbstick snap-turn where supported |
| Portals | Click glowing portals or world selector | Aim at portal and press trigger |
| Interact | E or click scene beacons; story choices on right | Aim + trigger at panels, beacons and characters |
| Dungeon | SPACE strike, F magic, Q guard, E negotiate | Trigger strikes, grip guards, ray-select alternative moves |
| Mech | WASD drive, SPACE pulse, Q shield, R vent | Trigger fires, grip shields, select panels for other actions |
| Save/privacy | Vault lock icon, passphrase change, encrypted export/import | Same browser UI and private vault |

The visuals use custom procedural Three.js geometry, portal shaders, NPC silhouettes with memory-dependent mood, animated atmosphere, an hourglass orrery and 3D time/choice panels. **Real VR controller ergonomics, accessibility and frame rate still require hardware validation.** Text-first controls remain available when WebGL fails.

## Open-source components actually in use

- [Three.js](https://github.com/mrdoob/three.js) `^0.181.0`, MIT. Also uses its OrbitControls and VRButton/WebXR helpers.
- [Vite](https://github.com/vitejs/vite) `^7.1.0`, MIT, as a development and build tool.
- Original Syrava game logic, characters, narrative, vault, shaders and encounter systems, released under the project's MIT license.

**Not yet integrated:** Meta IWSDK, AI Town, Godot, Rapier, Yuka, downloaded film/mech IP or third-party character assets. No copyrighted Pacific Rim or manhwa characters are included. These may inform later designs, but their use must be licensed and actually tested before being claimed.

## Status, evidence and next milestones

Tests cover economic exploits, character state, time heists and restitution, Prime/Echo divergence, Warden adaptation, passphrase encryption, legacy migration, tamper detection, imported encrypted backups, UI escaping and randomized playthroughs. See [QA](docs/QA.md). No GitHub Actions are used.

The biggest unfinished tasks are **actual WebGL and Quest testing**, richer physically embodied VR combat, autonomous local-model dialogue, visual animation/rigging, and an auditable Meta-model demonstration for hackathon eligibility. See [Architecture](docs/ARCHITECTURE.md), [Story and design bible](docs/STORY_BIBLE.md), [Demo outline](docs/DEMO_3MIN.md) and [Hackathon constraints](docs/HACKATHON.md).

Copyright © 2026 Syrava. [MIT License](LICENSE).
