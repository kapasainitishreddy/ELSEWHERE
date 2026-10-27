# ELSEWHERE v1.3 source release evidence

**Source assembled:** October 26, 2026 (America/New_York). **Purpose:** Hackathon submission preparation, not final certification. **Repo:** `kapasainitishreddy/ELSEWHERE`.

## What was already present before this release

An existing 1.1 GitHub baseline (five worlds, local encrypted vault, branching state, story/NPC memory, scripted future-self conversation, portal UI, optional local Ollama and cloud Meta adapter) and an unpushed local 1.2 Director's Cut visual pass. Those features are **not newly invented in 1.3**. Confirm event eligibility and use git commits to differentiate work made during the official build period.

## Specific new, inspectable work in 1.3

1. `src/premiere.js`: deterministic, skippable seven-stage onboarding and branch-specific causal receipts.
2. `src/ui.js` and `src/submission-polish.css`: the journey entry/skip actions, cause-and-effect atlas section and VR comfort control panel.
3. `src/xr-comfort.js` and `src/worlds.js`: explicit landing validation, rig-relative controller tracking, gentler snap turning and no forced camera reset in XR.
4. `src/scene-director.js`: tiny allowlisted Meta model atmospheric cues, kept outside the irreversible story mutation path.
5. `api/character.js`, `api/health.js` and `api/rate-limit.js`: consent-gated serverless Meta demonstration backend with payload allowlist, no prompt logs, best-effort cost limit and offline fallback.
6. New automated tests under `tests/submission-journey.test.mjs`, `tests/xr-release.test.mjs`, `tests/scene-director.test.mjs`, `tests/serverless-meta.test.mjs` and `tests/inference-limiter.test.mjs`.
7. Research, honest manual gates and a real-gameplay-only 3-minute demo shot list in docs.

## Reproduced local results

- `npm test`: 139/139 Node tests passed.
- `npm run dialogue:check`: 8/8 authored-dialogue checks passed.
- `npm run submission:check`: feature source and targeted tests passed; production build and real device checks marked UNVERIFIED.
- `npm run readiness`: source syntax and Node tests passed, but no Quest or actual Meta model call is claimed.
- Local `npm install` could not reach the registry in this runtime; **no verified production Vite build** at this stage.
- The available Chromium session blocked local URL navigation. **No real rendered browser screenshots were obtained for v1.3.**

## Unfinished gates

- Remote preview with successful Vite production build and browser smoke tests.
- Quest headset physical controller, teleport, interaction, comfort and performance tests.
- Live authenticated Meta inference and security/usage-budget configuration.
- A real, accessible 3-minute screen-recorded demonstration showing only new work.
- Consent-based adult test sessions and documented aggregated findings.
- Verification of organizer's current policies, rights and the precise newly built code claim.

**Release decision:** this is a stronger tested *source candidate*, not a completed or winning submission. See `SUBMISSION_CHECKLIST.md` for acceptance criteria.
