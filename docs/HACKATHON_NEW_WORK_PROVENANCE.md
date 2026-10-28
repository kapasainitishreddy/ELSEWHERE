# ELSEWHERE: new-work provenance (27 October 2026)

The participant guide allows startup baseline code only when event-created work is explicitly distinguished. Conservative baseline before 2026-10-27 00:00 Eastern (04:00 UTC): commit 5aad4a4725. This already had five worlds, encrypted saves, First Crossing, Meta bridge scaffolding and WebXR source. Do NOT advertise those foundations as entirely new.

At 2026-10-27T20:33Z checkpoint cf7fb7d7d64aed4fd159a43cc38dac210f597076, the GitHub compare against the baseline shows 23 commits, 84 changed files, +3,541/-198 lines. These are code metrics, NOT successful build, visual or user-test metrics.

New-work examples include causal replay, alternate-fate preview, Yuka NPC navigation, Rapier tactile gallery, scene art, camera-relative movement, guest demo, BVH picker, and Google Research review tooling. Use the actual diff before the final video; this checkpoint omits later commits.

Compare link: https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...cf7fb7d7d64aed4fd159a43cc38dac210f597076

Strict event gates still missing as verified in this chat: one **successful actual Meta Model API call** through the app, passing full npm tests and Vite production build, public stable HTTPS playable demo, three-minute real gameplay footage showing event work, and any claimed Quest measurement. Source includes an opt-in single-call test at tools/review/meta-live-probe.mjs; adding it does not execute the call or prove eligibility.

Opt-in only, with an environment-set MODEL_API_KEY (do NOT post it in chat or commit .env):

    npm run meta:probe -- --live

It sends a single synthetic request through the app's serverless Meta handler, may incur usage charges, and writes a sanitized pass/fail record in ignored review-output/. A passing result is one necessary gate, not a substitute for live demo evidence.

## Current comparison and attribution limits (28 October 2026)

The audited starting commit for this ELSEWHERE task was `f3ef0f0f60abfcb6c43e69a8cb25ae11e97a6cb6` on `main`. The conservative provenance baseline above is `5aad4a4725d3af92242428f7865a1fe48a919a80`, recorded at 2026-10-26 23:49:46 Eastern. It predates the documented event date, but already contains substantial product code; that existing game, encrypted save, narrative, Meta bridge and XR implementation is baseline work, not a new contribution from this task.

At the 2026-10-27 checkpoint `cf7fb7d7d64aed4fd159a43cc38dac210f597076`, the Git comparison from `5aad4a4` was 23 commits, 84 files, +3,541/−198 lines. At the reviewed implementation checkpoint `4514f61e52585998374f2b4eeeec7908f29a71dc`, the comparison from the same baseline was 29 commits, 110 files, +5,717/−248 lines. The six commits after `cf7fb7d` changed 38 files, +2,199/−73 lines. Separately, the current task's `f3ef0f0` to `4514f61` diff was 3 commits, 30 files, +1,978/−66 lines. The follow-up commits after that checkpoint update evidence documentation only.

These are Git-tree comparison counts only. Commit timestamps, author fields, and diff size do not establish when work was actually performed, who authored each change, whether it meets the event's eligibility rules, or whether it is prize-eligible. Git records 29 commits after the baseline under two author identities with different displayed names (26 commits as “Sai Nitish Reddy” and 3 as “Sai Nitish Reddy Kapa”). The owner should reconcile whether these identify one contributor or multiple contributors and confirm credit before submission. Confirm the official event window and contributor disclosures independently before using any of this work in a competition claim.

Measured compare for implementation checkpoint `4514f61`: https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...4514f61e52585998374f2b4eeeec7908f29a71dc
