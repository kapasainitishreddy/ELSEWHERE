# What players complain about, and how ELSEWHERE responds

**Research date:** October 26, 2026. This is a design evidence log, not a claim that ELSEWHERE has been user-tested. Community posts are anecdotes, not population-level estimates. Do not manufacture testimonials or claim a feature is liked before a user tries it.

## 1. VR movement, camera and physical comfort

**Observed pattern:** Quest owners commonly discuss motion sickness, uncontrolled camera movement and the difficulty of comfort configuration. Meta's official locomotion guidelines recommend comfort options such as teleportation and snap turning, and caution against camera movement unrelated to player input. References:

- [Meta locomotion design](https://developers.meta.com/vr/design/locomotion-overview/)
- [Meta immersive comfort guidance](https://developers.meta.com/vr/design/bp-overview/)
- [Meta VR hand interactions](https://developers.meta.com/vr/design/hands-best-practices/)

**Changes:** `src/xr-comfort.js` exposes Gentle 30-degree and Standard 45-degree snap turning; landing validation rejects distant or colliding destinations; controllers are attached to the moving XR player rig, not global scene coordinates; no forced camera shake; comfort settings are accessible from the top bar and the headset selection panel. This is a source-level implementation, not evidence of reduced nausea.

**Acceptance test:** On a real Quest headset, new players can reach the future-self apartment and return through a portal without external coaching; headset tracking remains correct after teleporting; no forced camera movement; testers may stop immediately. Measure dropped frames and nausea feedback without collecting identifying data.

## 2. AI companions that forget, repeat or pretend to know the user

**Observed pattern:** Social discussions of AI companions and research on AI NPCs describe repetitive answers, forgotten context, implausible conversational timing and fragile immersion. Individual anecdotes do not establish frequency. Scientific reference:

- [The Challenges of AI-Driven NPCs in Immersive VR (ACM study)](https://dl.acm.org/)
- [Meta Model API](https://dev.meta.ai/events/global-hackathon)

**Changes:** Existing local dialogue uses actual fictional timeline events and bounded local memory. `src/scene-director.js` allows an optional Meta model to select only a temporary scene cue (rain, warmth, wonder, quiet or resolve); game economics and saved NPC knowledge remain deterministic. Dialogue has an authored fallback if the model fails. The future self is an **imagined possibility**, never a prediction of the real player.

**Acceptance test:** Ask at least 10 follow-up questions per alternate world state. Look for accurate references to invention ownership, reversibility, the correct timeline, and polite handling of unexpected inputs. Model responses should not spontaneously award wealth, claim to cure illnesses or treat the character as the real future.

## 3. Fatigue and overloaded controls

**Observed pattern:** Meta's hands guidance favors simple, consistent interaction vocabulary, direct handling of nearby items and clear visual feedback rather than forcing players to memorize many gestures.

**Changes:** A single `E`/trigger interaction vocabulary for portals and objects, a skippable `The First Crossing` path, fewer mandatory menus, a constrained world atlas and a comfort panel. In VR the player may aim and select rather than physically reaching far beyond comfortable zones.

**Acceptance test:** Ask adults who have not seen the project to find the first portal, speak, choose a past invention, return, and show what changed. Record whether each step completed unaided and what confused them. Do not change the evaluation tasks mid-session.

## 4. Trust, privacy and false therapeutic promises

**Observed pattern:** Users evaluating AI companions deserve to know exactly when text leaves their device, what is remembered, and how to stop or erase it. Clinical claims require clinical evidence.

**Changes:** Passphrase-encrypted local saves, no analytics, browser and local authored dialogue by default, no microphone auto-enable, per-session consent before cloud Meta dialogue, strictly allowlisted fictional world summary, and no exported real-world health claims. Visual cues do not alter private memory or real-world medical state.

**Acceptance test:** With no cloud consent, inspect the browser network log and confirm no POST to `/api/character`; lock and inspect storage for no plaintext questions or letters; unlock after reload and recover the branch; enable cloud explicitly and verify exactly what request fields leave the device. Test data must be fictional. Do not assert *zero* hosting or browser metadata collection without auditing the deployment infrastructure.

## 5. Story clarity and satisfying consequences

**Design hypothesis, not established user finding:** Five universes and complex game currencies can obscure the main value proposition for first-time players.

**Changes:** `src/premiere.js` introduces a short, skippable route through the future-self apartment, the 1889 invention decision, and 2087's changed city. `crossingReceipt` provides an inspectable and deterministic consequence that can be shown in the World Atlas.

**Acceptance test:** 80% of at least five first-time adult testers should complete the core route unaided. Measure with opt-in, aggregate, non-medical usability notes. The 80% threshold is an **internal product target**, not a research result.

## Interpret the evidence carefully

These guidelines inform design, but they do not prove ELSEWHERE improves mental health, increases neurotransmitters, or prevents discomfort. Short-term studies of simulated future selves or immersive environments cannot be extrapolated to claims that this game cures depression. Present the project as **creative, private, branching storytelling** and assess usability before making outcome claims.
