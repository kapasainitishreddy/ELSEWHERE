# ELSEWHERE: contribution provenance and evidence ledger

**Status:** This is a Git-diff disclosure aid, not a ruling on event eligibility, authorship, or prize eligibility. The owner-supplied participant guide (2026-10-31) says existing startup work may be extended when new contributions are clearly identified. The exact event window and entrant eligibility still require confirmation. No listed code is declared eligible solely from its commit timestamp or presence in this comparison.

The comparison baseline is commit `5aad4a4725d3af92242428f7865a1fe48a919a80`. It already contains five worlds, encrypted saves, First Crossing, Meta bridge scaffolding, and WebXR. It is treated as inherited project work for disclosure purposes. Its timestamp is 2026-10-26 23:49:46 Eastern; the event start time has not been independently established, so this document does **not** conclude that the baseline predates the event.

At the historical 2026-10-27T20:33Z checkpoint `cf7fb7d7d64aed4fd159a43cc38dac210f597076`, the comparison showed 23 commits, 84 changed files, +3,541/−198 lines. These are Git-tree metrics, not successful build, visual, user-test, or eligibility evidence. The examples then under review included causal replay, alternate-fate preview, Yuka NPC navigation, Rapier interaction, scene art, movement, guest entry, BVH picking, and review tooling. They were candidate changes, not adjudicated event contributions.

Historical compare: https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...cf7fb7d7d64aed4fd159a43cc38dac210f597076

At that earlier checkpoint, live Meta inference, a judge-usable public demo, a final three-minute video, and Quest measurements were not evidenced. Current local test/build status is recorded below and in [QA evidence](QA_EVIDENCE_CURRENT.md); it must not be described as missing. Current external/manual gates remain separate: no live Meta request, public demo publication, final video, physical Quest test, or submission is evidenced here.

The following is an existing operator procedure only; this document does not authorize its use. A live request requires separate explicit credential and cost authorization. If authorized, use a protected environment variable (do NOT post a key in chat or commit `.env`):

    npm run meta:probe -- --live

It sends a single synthetic request through the app's serverless Meta handler, may incur usage charges, and writes a sanitized pass/fail record in ignored review-output/. A passing result is one necessary gate, not a substitute for live demo evidence.

## Historical comparison and attribution limits (checkpoint 2026-10-28; superseded by current section below)

The audited starting commit for this ELSEWHERE task was `f3ef0f0f60abfcb6c43e69a8cb25ae11e97a6cb6` on `main`. The conservative provenance baseline above is `5aad4a4725d3af92242428f7865a1fe48a919a80`, recorded at 2026-10-26 23:49:46 Eastern. It contains substantial product code; that existing game, encrypted save, narrative, Meta bridge and XR implementation is treated as inherited baseline work, not a new contribution from this task. Because the event start time has not been independently established, the timestamp does not prove whether this baseline predates the eligible event window.

At the 2026-10-27 checkpoint `cf7fb7d7d64aed4fd159a43cc38dac210f597076`, the Git comparison from `5aad4a4` was 23 commits, 84 files, +3,541/−198 lines. At the reviewed implementation checkpoint `4514f61e52585998374f2b4eeeec7908f29a71dc`, the comparison from the same baseline was 29 commits, 110 files, +5,717/−248 lines. The six commits after `cf7fb7d` changed 38 files, +2,199/−73 lines. Separately, the original task's `f3ef0f0` to `4514f61` diff was 3 commits, 30 files, +1,978/−66 lines. These counts describe their named checkpoints only; later branch history includes both implementation and evidence/documentation changes, summarized in the current comparison below.

These are Git-tree comparison counts only. Commit timestamps, author fields, and diff size do not establish when work was actually performed, who authored each change, whether it meets the event's eligibility rules, or whether it is prize-eligible. At the 4514f61 checkpoint, Git attributed 29 commits after the baseline to two author strings (“Sai Nitish Reddy” and “Sai Nitish Reddy Kapa”). The owner should reconcile contributor identity and confirm credit before submission. Confirm the official event window and contributor disclosures independently before using any of this work in a competition claim.

Measured compare for implementation checkpoint `4514f61`: https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...4514f61e52585998374f2b4eeeec7908f29a71dc

## Current branch comparison — 2026-10-31

Measured from the conservative baseline `5aad4a4725d3af92242428f7865a1fe48a919a80` to the verified working-branch checkpoint `836276fd45ed801b411ea461dd04f3dc67ccbde4` (`codex/elsewhere-completion-20261027`): **60 commits, 141 changed paths, +8,447/−366 lines**. `git log` contains 26 commits attributed as “Sai Nitish Reddy” and 34 as “Sai Nitish Reddy Kapa”. These author strings are Git metadata, not confirmed contributor identities; the owner must reconcile and credit contributors accurately. The current compare is https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...836276fd45ed801b411ea461dd04f3dc67ccbde4 .

Candidate work visible in that diff, subject to the organizer's definition of the event window and owner/contributor verification:

| Candidate contribution | Representative source and tests | Evidence boundary |
| --- | --- | --- |
| Deterministic causal choices, replay receipts, previews, Prime/Echo separation, and distinct gift/patent/auction future outcomes | `src/game.js`, `src/causal-proof.js`, `src/future-outcomes.js`, `tests/causal-proof.test.mjs`, `tests/e2e/fates.mjs` | Browser/state fixtures demonstrate fictional outcomes; no player impact study. |
| Locally authored physical 3D exhibit grounded in recorded story choices | `src/causal-exhibit.js`, `src/scene-director.js`, `tests/meta-causal-exhibit.test.mjs`, `tests/e2e/lifecycle.mjs` | Authored offline exhibit is implemented; mocked focus tests are not live Meta inference. The UI itself displays `AUTHORED PREVIEW`. |
| Guest first-run path, story/provenance surfaces, privacy controls, lock/save recovery, and bounded model-request lifecycle | `src/main.js`, `src/ui.js`, `src/vault.js`, `api/character.js`, `tests/e2e/lifecycle.mjs` | Synthetic browser and unit tests; no public deployment, external security audit, or live provider call. |
| Character movement, animation, NPC steering, Rapier physics, and five-world interactions | `src/player-motion.js`, `src/actor-studio.js`, `src/npc-navigation.js`, `src/physics-playground.js`, `src/worlds.js`, related `tests/` | Local Chromium/SwiftShader and simulated physics only; no physical GPU, phone, or Quest validation. |
| Reproducible browser journeys, visual review, and responsive/accessibility improvements | `tests/e2e/`, `docs/QA_EVIDENCE_CURRENT.md`, `docs/FEATURE_LEDGER.csv` | Named Chromium runs and synthetic screenshots are recorded; human usability, screen-reader, and legal eligibility evidence are absent. |

The participant guide provided by the owner on 2026-10-31 says entrants must use a public repository, submit a three-minute demo highlighting only hackathon-period work, and clearly identify new contributions. This table is a diff-derived candidate manifest, **not** a finding that every listed line was created during the event or is eligible. The 2026-10-27 baseline already contained five worlds, encrypted saves, First Crossing, Meta bridge scaffolding, and WebXR. Compare commit timestamps and diffs, confirm the official event window and contributor identities, then have the entrant approve the final disclosure. No public demo, live Meta claim, user study, or eligibility conclusion is established here.

The current verification at this checkpoint includes `npm test` 253/253, production `npm run build`, working-branch Chromium journeys, and `review:agents`; see [current QA evidence](QA_EVIDENCE_CURRENT.md). A local authored-offline rehearsal exists but is choppy at about 0.73 captured frames per second. It is not the required three-minute submission video. The owner-supplied participant guide establishes the three-minute duration; exact portal fields and remaining entrant conditions still require checking by the entrant. No submission or public video publication is authorized.
