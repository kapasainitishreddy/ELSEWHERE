# ELSEWHERE: truthful release and hackathon checklist

**Track:** Startup. **Theme:** Build for Your World. **Submission deadline:** Nov 4, 2026, 9:00 PM ET. **Current status:** PREVIEW / NOT VERIFIED READY.

This document separates source evidence from physical headset, external-service and human usability tests. No test passing locally is a substitute for real footage. Always follow the latest official participant guide if instructions change.

## Requirements from the participant guide

- [ ] Public GitHub repository and an accessible live product.
- [ ] New work during the event is identified and distinguished from earlier versions. Existing startup code is permitted only with explicit disclosure. Keep dated Git commits and a change log; do not represent v0.1-v1.1 as created during the official building window without checking the organizer's dates.
- [ ] Integrate an eligible **Meta** AI model and prove actual usage. Authored local dialogue and Ollama alone do not satisfy the Meta-model gate.
- [ ] Record and publish a real **three-minute** working demo focused on code and features created during the hackathon.
- [ ] All third-party assets comply with their individual licenses. No copyrighted manhwa characters, Pacific Rim IP or unlicensed sound effects.
- [ ] No therapeutic, dopamine, serotonin, depression-cure, medical-advice or guaranteed-result claims.
- [ ] No GitHub Actions required or configured. Use manual `npm run submission:check` before recording and submitting.

## Automated gates (can run in the source checkout)

```sh
npm install
npm run test
npm run dialogue:check
npm run submission:check
npm run build
```

An install may require internet. `submission:check` reports **UNVERIFIED** if the build cannot run, rather than claiming a pass. Never print or commit `.env` values. Check `MODEL_API_KEY` through `GET /api/health` only for boolean configuration; never show the key.

## Desktop visual acceptance (must be observed)

- [ ] Game builds and starts with no JavaScript exceptions.
- [ ] Fresh vault can be created, locked, unlocked after reload, and deleted intentionally.
- [ ] First Crossing can be completed from new vault, including both invention fate and changed future.
- [ ] Intro can be skipped; first 5 minutes can be played without tutorial text overpowering the world.
- [ ] Movement, portal click/ray, E interaction, attack, guard, and return controls are understandable.
- [ ] Keyboard, mouse, gamepad and mobile layouts are usable; no horizontal overflow or invisible close buttons.
- [ ] All optional asset downloads are bundled at build time. Failed downloads fall back to coherent procedural scenery.
- [ ] With no cloud consent, offline game works and sends no character request; opt-in status clearly says Meta text leaves device.
- [ ] `?perf=1` measurements recorded in a local test note; no frame rate claims without measurements.

## Quest headset acceptance (must be observed)

- [ ] Start WebXR on supported HTTPS origin, not plain LAN HTTP or local `file://`.
- [ ] Teleport lands at the selected point, never inside a wall; controller rays follow player after movement.
- [ ] Snap turning follows chosen 30° or 45° mode, with stable horizon and no involuntary camera motion.
- [ ] Portals, future-self dialog, world props and combat can be operated with the controller's normal reach.
- [ ] VR text is legible; controls usable seated; one-handed limits understood.
- [ ] Device framerate and frametime measured against the specific headset refresh target; no guessed Quest FPS.
- [ ] Multiple participants can finish core route without serious discomfort; provide breaks/stop immediately.

## Meta model and security acceptance (must be observed)

- [ ] Hosted API route accepts a fictional dialogue request with explicit consent and a configured secret, returns a valid `reply` with only an allowlisted `cue`.
- [ ] Failures fall back to local dialogue with no game-state mutation.
- [ ] Cross-origin requests, oversized bodies, private additional fields and unconsented calls are rejected.
- [ ] Cloud prompt contains only the allowlisted fictional timeline, not passphrases, private letters or raw history.
- [ ] Anonymous inference endpoints have operator-level rate, cost and abuse controls before broad public launch. An in-process limiter is not sufficient across serverless replicas. Use provider spend limits and edge protections.
- [ ] No credentials/PII in build logs, video, or GitHub; clear opt-in disclosure.

## Human usability: 5 adults, optional, consented, aggregated

Give each person the same tasks: create a vault, meet older self, invent, choose ownership, travel forward, find the changed world, lock. Ask for the hardest step, motion discomfort (none/mild/moderate/severe), whether the future-self fiction was clear, and whether they'd try another world. Record counts, not names, free-form confessions, clinical history or device identifiers. Do not invent testimonials; remove anything a user asks to withdraw.

## Release decision

**Not submission-ready** if any of these remain: production build failed/unverified, Quest comfort unknown, Meta integration not actually called, demo unrecorded, new-work provenance unclear, or published live URL unavailable. Automated tests are necessary but insufficient. The official organizer makes the final eligibility and judging decision.
