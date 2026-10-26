# QA checklist for ELSEWHERE 0.2

## Automated tests

- [x] 24 automated tests of pure state, UI output, imports, server request boundaries and randomized invariants.
- [x] Old v0.1 saves load with the new fields.
- [x] One-time grants are non-repeatable.
- [x] Three separate rune sequences, reset on wrong attempt, boss gated by cipher.
- [x] Reactor heat, hull, shield state, limited reward.
- [x] Letter stays optional and conversation prompt explicitly treats user text as untrusted.
- [x] Explicit JSON timeline export/import handles malformed inputs safely.
- [ ] Full Vite production build on a system with npm dependencies. Dependency installation was blocked by DNS in the build environment.
- [ ] Real graphical regression screenshots and WebGL developer console check.
- [ ] Meta Model API live request using the user's own valid key.

## Human acceptance journey

- [ ] Load index page with a normal browser and no API key, verify it renders a canvas and right-side choice panel.
- [ ] Start in Neo Elysium, visit 1889, invent Cell, choose gift, return to city. Compare changed structures and archivist dialogue.
- [ ] Open future-self room, submit a text question and verify local fallback. Save a letter and reload; confirm it persists privately.
- [ ] Enable letter sharing and confirm consent text is clear. Disable again; inspect outbound `/api/character` to make sure the letter is omitted.
- [ ] Enter Hollow Crown, choose Phase Shift, touch Moon, Crown, Star. Wrong rune should clear progress. Confront Warden after the correct sequence.
- [ ] Enter Titan Foundry, train, deploy, start defense, pulse three drones, use shields and vent. Confirm hull and reactor meter changes.
- [ ] Recover shards in three different worlds; test all three endings separately with fresh timelines.
- [ ] Open Atlas tabs, cinematic mode, sound toggle, and help. Confirm focus and keyboard navigation.
- [ ] Browser responsive tests at 390px, 768px, 1440px. Confirm touch D-pad and scrollable story panel.
- [ ] Quest/WebXR: verify portal/controller selection and teleportation do not cause nausea or accidental actions.
- [ ] Stress: cross worlds 50 times and monitor GPU memory, CPU time, and lost WebGL contexts.

## Caveats

No live Meta request, VR session, native mobile tap testing, or production bundle has been executed in this environment. Do not mark those complete simply because the implementation code exists.
