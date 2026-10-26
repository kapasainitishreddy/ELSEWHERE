# ELSEWHERE submission readiness and judge scorecard

**Event:** Meta Global AI Developer Hackathon (Oct 26–Nov 4, 2026)  
**Track:** Startups | **Deadline:** Nov 4, 2026, 9:00 PM ET | **Prizes:** startup awards 1st $250k, 2nd $150k, 3rd $75k, 4th $50k, 5th $25k.

From the participant guide supplied by the participant, not our own scoring formula:

| Criterion | Weight | Concrete ELSEWHERE evidence required |
|---|---:|---|
| Real-world impact | 30% | Clear users: authors, interactive storytellers, people curious about possible futures. Actual 3–5 user feedback sessions and an audience statement, not unsupported clinical claims. |
| Use of Meta AI tooling | 25% | Live, verified Muse model call in an isolated synthetic/fictitious demo; demonstrate context-aware character/world interaction with observable results, not an API-name slide. |
| Demo | 25% | 3-minute real capture of a working application, show interactive before/after timeline changes, believable dialogue, visible portal crossing, no concept footage posing as gameplay. |
| Technical depth | 20% | Green tests; audited privacy boundaries; deterministic world state and model-output validation; no duplicate rewards on portal swapping; responsive performance on Quest, measured rather than guessed. |

**Important Stage 1 gate:** At least one Meta Model API or eligible Meta open-weights use must be demonstrated. Local Ollama with Qwen, by itself, does **not** satisfy this gate. The default strict-local experience is a separate user promise. Demo Meta with synthetic game profiles and explicit per-session consent only. Never transmit real user mental-health data through that path.

**Eligibility:** Public GitHub repo; work done between Oct 26 and Nov 4 clearly distinguished from prior code/assets; 3-minute demo video; a deployed live product and source; contributors acknowledged; original licenses respected. The guide warns specifically against AI systems generating medical advice (including AI mental-health advisors).

## Evidence from earlier winners, not the same contest

Meta's [2025 LlamaCon hackathon winner announcement](https://ai.meta.com/blog/llamacon-hackathon/): **OrgLens** won first with expert matching plus digital-twin queries based on an organizational knowledge graph; **Compliance Wizards** was second with fraud alerts and a voice assistant; **Llama CCTV Operator** was third with natural-language video event recognition; **Geo-ML** won a special API award with geological-to-3D transformation. The common inference: a well-demonstrated special capability solves a clear problem. These examples do not imply a certain result for ELSEWHERE.

## Show this three-minute story

- **0:00–0:20:** Future Self recognizes the actual synthetic *game* choice shown moments earlier. Show fictional/experimental labeling and opt-in settings.
- **0:20–0:55:** Cross into 1889, gift or patent an invention. Return to 2087, watch the scene and NPC history change. Real interaction only.
- **0:55–1:25:** Switch Prime/Echo branches, prove different futures and ledger values persist without earning free resources.
- **1:25–1:55:** Converse naturally with the Future Self about one decision, recall one prior line, choose an optional tiny action for today.
- **1:55–2:25:** Isolated Meta model demo with **fictitious test dialogue only**, show response and deterministic safety/authority boundaries. If API isn't verified, do not imply it worked or submit as complete.
- **2:25–3:00:** Show real headset interaction and measured performance if verified, source tree, test summary, licensing, and privacy statement. Do not show headsets if only desktop tested.

## Submission gates and blockers (not green until verified)

- [ ] Desktop `npm run check` passes with installed dependencies.
- [ ] No console errors or missing GLB resources in game flow.
- [ ] Quest browser can enter immersive XR on secure origin; controller/hand input and portals work, without sickness.
- [ ] Meta model output works live on a **synthetic** test profile, with explicit cloud disclosure.
- [ ] Demo video exactly 3 minutes or less and shows only new event work.
- [ ] Test at least 3–5 consenting adults on comprehension, comfort, and ease of use.
- [ ] Public source, attribution, demo URL and all submission fields are verified.
- [ ] Claims: no therapy, no depression cure, no dopamine/serotonin measurements, no real future prediction.

No prize or placement can be promised. The strongest path is one polished, reproducible experience with a compelling causal-world demonstration.
