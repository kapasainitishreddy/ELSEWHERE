# ELSEWHERE 0.2: Echo Protocol architecture

## Goals

One authored world feels more real when it remembers a choice. The system does not ask a language model to invent game rules or award riches. It gives the model a narrow task: portray a fictional, reactive future self.

```text
Browser 3D (Three.js, WebXR) ──┬── Original geometric worlds + portals + spatial actions
                              ├── Player motion, atmospheric particles, original synthesized sound
                              └── Scene rebuild based on deterministic saved state
                                      ↑
UI / Story Deck ── worldOptions ── applyAction / travel / writeLetter
                                      │
                              Local causal state engine
                                      │
                           versioned browser localStorage / explicit private JSON import and export

Future-self text conversation (optional)
Browser ── bounded POST /api/character ── Node bridge ── Meta Model API (Muse Spark)
        └── local response fallback when key, network or provider is unavailable
```

## Authoritative state and safety invariants

- `src/game.js` owns all currency, reputation, inventions, powers, mission outcomes, endings and event log mutations.
- Invention decisions and dividend collection are irreversible within one timeline. Warden and defense rewards are one-time.
- `worldOptions(state)` constrains actions to enabled choices. Disabled options are also refused by `applyAction`, not just by HTML buttons.
- `saveState` and `loadState` use a schema-compatible v1 file with new default fields. Legacy saves retain their current world, inventions, wealth and history. Stored arrays, flags and dialogue have size/format limits.
- NPC local replies are deterministic and react to relevant story facts. This is intentionally not advertised as a full autonomous simulation.
- API-generated speech is **narrative-only**. JSON returned from Meta is not parsed as executable commands, in-game credits or game-state patches.
- The letter is a local note unless a player enables a separate opt-in. Voice transcription depends on browser capabilities and may use an external provider.

## Scenes and interactions

`src/worlds.js` builds the original 3D level layouts, camera, hit-testing, portals, XR controller rays and room switching. `src/scenery.js` adds context-sensitive scenery and coarse collision proxies. For movement, a lightweight collision system blocks the most significant scene obstacles. This is not a full rigid-body physics engine. `src/audio.js` synthesizes a different chord per world, entirely client-side and opt-in. `src/ui.js` is the semantic HTML layer and accessibility fallback.

Desktop uses keyboard orbit/movement and click targets. Mobile uses a directional pad. VR uses controller ray selection and floor teleportation. The headset path remains unverified.

## Next prioritized engineering milestones

1. Run `npm install`, `npm run check` and all routes on a real GPU/browser. Record screenshots and actual frame rates on low-end phones and a supported Quest.
2. Prove actual Meta Model API credentials and model output work from the server. Record model fallback, rate limits and input privacy behavior.
3. Build a player action tool schema with deterministic approval, so NPCs can propose verifiable consequences without directly mutating the world.
4. Replace scene collision proxies with a physics layer, implement true mech cockpit interaction, gameplay animations and interaction sound design.
5. Add legal/licensing notices and integration proof for any external models, assets or tools introduced after this baseline.

No GitHub Actions workflows are used.
