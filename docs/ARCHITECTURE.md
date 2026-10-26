# ELSEWHERE 0.3 — Privacy-first causal architecture

```text
Three.js + WebXR (rendering, controller rays, floor teleport, original shaders)
    ↕ local gameplay input
Game state machine (src/game.js)
    ├── Chronal Exchange (src/chronal.js): hours, debt, era rates, paradox, heists
    ├── Character memory (src/characters.js): mood, affinity, bounded events
    ├── Warden director (src/warden.js): patterns, guards, focus, mercy
    ├── Parallel gate (src/branches.js): Prime/Echo isolated snapshots
    ├── Original 13-chapter story (src/story.js): unlocks based on actions
    └── Five worlds/scenery (src/worlds.js + src/scenery.js)
    ↓ never sent to a server in Private Mode
Passphrase AES-256-GCM vault (src/vault.js) → localStorage ciphertext
    ↔ manual encrypted backup import/export
    ↔ lock/rekey functions

OPTIONAL, separately started private on-device model:
Player enables local AI each session → bounded, selected NPC memory + fictional state
    → same-origin /api/local-dialogue → loopback server (local-server.mjs)
    → fixed 127.0.0.1:11434 Ollama API → local generated fiction
    → reply displayed + saved inside encrypted browser vault
    ✗ no vault keys, future letter, other branches, internet inference or persistence

OPTIONAL, explicitly non-private hackathon demonstration (not started by default):
Player consents → only immediate typed question + allowlisted FICTIONAL summary
    → same-origin /api/character → 127.0.0.1-only bridge (server.mjs)
    → Meta Model API → result (narrative only; cannot mutate game rules)
```

## Security invariants

1. `src/game.js` determines game mutations; dialogue cannot grant credits, move worlds, unlock powers or mint hours. Options are validated on each action, not just disabled in HTML.
2. A one-time time trade cannot be repeated by recrossing portals. Hour buy rates exceed all sell rates. A Chronal heist is a one-time moral choice per reality. Repayment removes debt and consumes hours.
3. Prime/Echo snapshots do not transfer wealth, NPC memory, hidden flags or endings. Fork costs are paid before snapshotting both realities.
4. The Web Crypto passphrase is never persisted; salt and IV are unsecret, ciphertext authenticated. Secure context is required. Old plaintext saves are deleted **only after** the new encrypted record is written.
5. Local UI text is escaped before insertion into HTML. Public service-worker caches exclude `/api/` and `/private/` requests. In production a SW may cache application code, not vault payloads.
6. Optional Meta bridge requires explicit `cloudConsent:true` and sends no stored letters, previous chat turns, full timeline, NPC memories, alternate branch snapshots or passphrases. A real question/summary still crosses the network if enabled.
7. Default authored dialogue is deterministic and reactive. The separately enabled Ollama adapter uses a local general-purpose language model for fictional speech only. It does not make NPCs continuously autonomous.

## XR and interaction

WebXR uses Three.js' VRButton and controller `select`/`squeeze`: point and select portals, panels, objects or floor. Active combat maps trigger to attack and grip to guard/shield, preventing attack triggers from accidentally teleporting. XR floor teleport is restricted to bounds and coarse obstacles. Thumbstick snap-turn works where supported; desktop WASD, mouse orbit and tactile story buttons are fallbacks. Custom geometry/materials are disposed during world rebuilds; browser and headset tests remain outstanding.

## Test evidence and unfinished work

Node tests cover simulation, randomized playthroughs, branch separation, vault cryptography, malformed backups, action boundaries, output escaping, a fallback-only dialogue mode and a consented Meta request's allowlist. A passing simulation suite is **not** proof of production WebXR quality.

Unfinished: real frame rate/device QA, robust navmesh/rigid-body physics, real ragdoll/hand interactions, full mission pacing, headset-tested locally hosted Meta open-weights inference, cryptographic review, manual offline-shell testing, automated screenshot comparison and accessibility audits. No GitHub Actions workflows are used.

## SocietyPulse and controls

`src/society.js` advances the world's five authored NPC agendas only from *distinct* simulation actions, with a capped trigger ledger. Portal travel, idle browser time and repeated conversation cannot farm progress. Its snapshot (`society`) is included in the branch fields and validated on save loading, so independent Prime/Echo worlds preserve different NPC agendas. Missions deduct fictional hour balances transactionally through the authoritative `applyAction` gate.

`src/controls.js` normalizes browser Gamepad sticks and returns button press edges; `src/worlds.js` uses these for movement, interaction, guarded attacks and power/vent abilities. The VR controller path uses select-ray portals, attackable physical targets, safe floor teleportation, 30-degree snap turning and best-effort supported haptics. Controller and headset behavior still needs physical testing.
