# ELSEWHERE: new-work provenance (27 October 2026)

The participant guide allows startup baseline code only when event-created work is explicitly distinguished. Conservative baseline before 2026-10-27 00:00 Eastern (04:00 UTC): commit 5aad4a4725. This already had five worlds, encrypted saves, First Crossing, Meta bridge scaffolding and WebXR source. Do NOT advertise those foundations as entirely new.

At 2026-10-27T20:33Z checkpoint cf7fb7d7d64aed4fd159a43cc38dac210f597076, the GitHub compare against the baseline shows 23 commits, 84 changed files, +3,541/-198 lines. These are code metrics, NOT successful build, visual or user-test metrics.

New-work examples include causal replay, alternate-fate preview, Yuka NPC navigation, Rapier tactile gallery, scene art, camera-relative movement, guest demo, BVH picker, and Google Research review tooling. Use the actual diff before the final video; this checkpoint omits later commits.

Compare link: https://github.com/kapasainitishreddy/ELSEWHERE/compare/5aad4a4725...cf7fb7d7d64aed4fd159a43cc38dac210f597076

Strict event gates still missing as verified in this chat: one **successful actual Meta Model API call** through the app, passing full npm tests and Vite production build, public stable HTTPS playable demo, three-minute real gameplay footage showing event work, and any claimed Quest measurement. Source includes an opt-in single-call test at tools/review/meta-live-probe.mjs; adding it does not execute the call or prove eligibility.

Opt-in only, with an environment-set MODEL_API_KEY (do NOT post it in chat or commit .env):

    npm run meta:probe -- --live

It sends a single synthetic request through the app's serverless Meta handler, may incur usage charges, and writes a sanitized pass/fail record in ignored review-output/. A passing result is one necessary gate, not a substitute for live demo evidence.
