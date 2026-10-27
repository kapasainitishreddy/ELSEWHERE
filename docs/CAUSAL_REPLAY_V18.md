# ELSEWHERE 1.8 — Causal Replay

**27 October 2026 · Meta Global AI Developer Hackathon · Startup track**

## What was added
- A **fictional Causal Replay** view in My Timeline → Cause & Effect with five state-derived observations: 1889, 2046, 2087, 2199, and the Hollow Crown. These are labeled *observations*, not unearned causal claims across unrelated worlds.
- A **What if?** panel unlocked after prototyping an invention in 1889 and *before* choosing patent/share/auction. Its three projections invoke the same authoritative \`applyAction\` transition as gameplay on cloned state. Clicking a choice commits through the existing user action flow, not the preview.
- A **Prime/Echo** comparison that includes only fictional metrics and clearly marks changed values, keeping the other branch's private letters, dialogue, memory cards, and NPC memories out of the comparison.
- A stable eight-hex-character replay label for reproducing a fictional *public-world* snapshot. It is **not a cryptographic signature or authentication token**.
- Keyboard-friendly actionable previews, responsive causal timeline, high-contrast badges and reduced-motion styling.

## Inspection walkthrough
1. Start a fresh encrypted local world and go to **1889**.
2. Invent the Aether Cell. The What if? panel should show three alternative outcomes without charging or rewarding anything yet.
3. Select **Share with everyone**. Return to Neo Elysium and open **My Timeline → Cause & Effect**.
4. Check the 1889 decision, the 2046 fictional future-self response and 2087 skyline; the foundry should still be marked *unfinished* unless separately defended.
5. Recover a memory fragment and open the Echo branch (requires two stars and three fictional hours). Make a different decision on Echo, reopen the causal view and verify Prime/Echo comparisons survive switching branches.
6. Leave a private letter and memory, inspect the receipt again, then confirm the receipt and comparison do not contain the private text.

## Checks
\`\`\`sh
npm install
npm run test
npm run build
npm run submission:check
\`\`\`

Source-based tests do not establish FPS, accessibility on a physical Quest, live Meta API inference or successful public deployment. No changes in this iteration grant extra currency, powers or inventory outside the original validated game state machine. Proof labels are **demonstration IDs**, not security features. Test observed visuals in a browser with both normal and reduced motion.

## Local verification performed for this iteration

- Passed six unit tests on a standalone equivalent causal simulation module.
- Parsed the committed JavaScript modules for syntax, then evaluated the current `src/game.js`, `src/ui.js`, and `src/causal-proof.js` in an isolated test harness with **18 live repository modules**.
- Validated all three `applyAction` preview deltas against the authoritative state machine: patent (+12,700 credits, +62 fame), share (+1,400 credits, +37 fame), auction (+8,890 credits, +22 fame) for the Aether Cell; inspected non-mutating previews and stable Prime/Echo receipts across a branch switch.

**Not verified:** complete `npm test` execution in a full checkout, production Vite build, browser graphics, actual Quest headset comfort, hosted Meta Model API calls or a deployed URL. Those remain mandatory release gates. No test result here establishes award eligibility or an outcome.
