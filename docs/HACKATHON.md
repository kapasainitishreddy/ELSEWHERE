# Hackathon submission notes — ELSEWHERE

Project: ELSEWHERE by Syrava. Startup track. Public repository: https://github.com/kapasainitishreddy/ELSEWHERE.

**Participant guide requirements:** public source, original new work within event window, clearly attributable features, demonstrable use of Meta models, a live product, a three-minute video, and a November 4, 2026 at 9 PM ET submission deadline. Current core prototype code authored October 26, 2026. A Meta API key and a successful live Muse Spark conversation must be demonstrated before claiming working model integration in a submission. Do not claim a live Meta demo just because the connector is wired.

## Project thesis

**A possible life engine, not an NPC chatbot.** Bring future-self storytelling, alternate history, invention economics, powers and machines into a single persistent world. The differentiator is that causally valid actions are separate from generative dialogue. AI may narrate a future but can never grant wealth, items or abilities itself.

## What the current prototype implements (original new code)

- Five original procedural Three.js environments, portals and movement.
- Local state machine tracking fictional currency, reputation, trust, property, alternate inventions, powers and mech pilot status.
- Story choices with consequences, prevention of repeated monetary payouts and compact journal of events.
- Future-self dialogue driven by a bounded snapshot of the player's fictional state; deterministic offline fallback.
- Same-origin backend bridge with API key separation, input limits, timeout and rate limiting.
- Desktop and touch interactions, original WebXR controller rays, spatial action beacons and controller floor teleport prototype.
- Separate tactical mech defense and dungeon cipher minigames.
- 5 collectible memory fragments, 3 story endings, and exported/imported save files.
- Context-sensitive original procedural 3D details and optional procedural ambience.
- Node test suite and responsive story HUD. No GitHub Actions.

## Judging rubric alignment

| Category | Weight | Evidence to capture |
| --- | ---: | --- |
| Impact | 30% | Interactive stories, world creation/education possibilities, repeat-use narrative platform and a concrete audience hypothesis (to be user tested) |
| Meta AI tooling | 25% | Record a live Muse Spark call contextualized to player-driven state; show model responding to different timelines, not merely a generic chat |
| Demo | 25% | Cold-start playable flow, world portals, invention choice, skyline changes, future-self reaction, pilot movement |
| Technical depth | 20% | Deterministic simulation engine, atomic decisions, guarded payouts, offline fallback, secrets kept on server, regression tests |

## Three-minute demonstration storyboard

See [DEMO_3MIN.md](DEMO_3MIN.md) for a current evidence-first storyboard covering the new cipher, mech defense, Echo Atlas, three endings, and the first verified Meta API request. Do not show combat or model integrations that have not actually been tested.

## Rights and safety

All scene art is generated from original Three.js primitives (no borrowed manhwa or film IP). The titans are original designs, not characters from Pacific Rim. Credits, fame and time travel are fictional. Real futures and real economic gains are not predicted. Voices are browser speech synthesis and optionally browser speech recognition, not Meta Voice Transcribe. Meta IWSDK is a possible migration, not implemented in the current prototype.
