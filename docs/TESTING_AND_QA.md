# ELSEWHERE: desktop, VR, privacy and Future Self testing

**Last revised:** October 26, 2026. This checklist separates what can be automatically checked from what requires an actual browser, headset, installed assets, and volunteers. Green unit tests are not proof of VR quality, therapy efficacy or production readiness.

## A. Windows desktop smoke test (first)

Install Node.js 22 or later and Git, then open PowerShell:

```powershell
git clone https://github.com/kapasainitishreddy/ELSEWHERE.git
cd ELSEWHERE
npm install
npm test
npm run build
npm run dev
```

Open `http://127.0.0.1:5173`. Create a **testing-only passphrase** of at least 10 characters. Test the following in order:

1. **Portal**: go from Neo Elysium to 1889 using the in-world portal or side selector. Try WASD / arrow keys, mouse drag to look, `E` to interact. Check easy readable controls.
2. **Change history**: create an invention; choose a patent or a public gift. Return to future city. Verify skyline/archives and characters reflect the same choice.
3. **Talk naturally**: travel to The Other You (2046). Ask a freeform question, then type `I want to write a story every week.` Ask, `Do you remember what I said?` Confirm prior words return accurately without a guaranteed prediction. Try a starter prompt.
4. **Reset private dialogue**: click `CLEAR PRIVATE CONVERSATION`, confirm, and verify the conversation disappears from that branch only. Old exported backups are not erased by this action.
5. **Conflict and portals**: learn a power, solve the three-rune sequence, confront the Warden. Test attack, guard, parley. In mech world, test pulse, shield, heat cooling, and lose/retry paths. Check controls do not trap the user.
6. **Encrypted save**: lock vault, reload, unlock; data should restore. Export encrypted backup and verify readable strings such as your test letter do **not** appear in the JSON file. Restore on a separate test profile; wrong passphrase must fail.
7. **Accessibility**: keyboard focus rings, buttons at 200% browser zoom, reduced motion in OS settings, no mouse-required mandatory actions, safe exit. Test mobile layout separately.
8. **Visual QA**: open browser Developer Tools Console and Network. No red JavaScript exceptions, obvious Z-fighting, stretched assets, unreadable UI, or missing GLB resources. Optional `npm run assets:fetch` requires internet at setup, not runtime.

**Note:** `npm run dev` runs private authored dialogue only. `npm run dev:meta` is a separate, nonprivate demonstration; it is not required for normal play.

## B. On-device conversation test (optional, no cloud)

Install the official [Ollama](https://ollama.com/) runtime locally and download a small model once (internet needed for model download):

```powershell
ollama pull qwen2.5:1.5b
npm run dev:local-ai
```

Within ELSEWHERE, enable `ON-DEVICE AI (OLLAMA)`. This sends the selected short prompt and bounded encrypted-vault story context only to a loopback service at `127.0.0.1:8788`, which forwards to Ollama on `127.0.0.1:11434`. It cannot ensure privacy if Ollama or your computer is compromised. If offline, responses should fall back to locally authored text. Verify character continuity, latency, prompt injection resistance and shutdown without data loss. It is not Meta tooling for hackathon Stage 1.

## C. Quest / WebXR test

This repository currently uses **plain Three.js WebXR** rather than Meta's IWSDK, so **do not claim IWER emulation has been integrated**. Meta recommends developing with [IWSDK and IWER](https://developers.meta.com/vr/documentation/iwsdk/guides/02-testing-experience/), then verifying on a physical Quest 3 or 3S. For the current build, use a secure HTTPS staging deployment or an appropriately configured local secure origin reachable from the Quest Browser; a plain LAN HTTP address may not qualify as a WebXR secure context. Quest and development computer should be on the same Wi-Fi, or use documented ADB port forwarding for a supported secure localhost workflow.

On-headset, check seated and standing flows, recenter, controller triggers, ray targeting, portal selection, snap turn, no forced camera motion, readable near/far text, audio levels, and the ability to exit at any time. Test sessions as brief as 3–5 minutes first, stop immediately if dizzy, and record real device frame rates. See [Meta's VR comfort best practices](https://developers.meta.com/vr/design/locomotion-best-practices/). **Performance goal, not measured:** stable device-native frame rate and no serious discomfort in consenting tests.

## D. Privacy/network verification

Open DevTools Network tab, disable Meta cloud and optional Ollama, reload, and play. Filtering by Fetch/XHR should show **no personal-data request**. Confirm fonts and assets come from the same origin. With opt-in on-device Ollama, only a same-origin `POST /api/local-dialogue` appears; the bridge itself contacts loopback only. With Meta cloud opt-in, the typed question and a fictional allowlisted world summary **leave the machine**; treat this as a different privacy mode. Never enter actual medical history into the hackathon demo.

Use a throwaway fictional profile to test all model paths. Verify rejected requests, timeout fallback, no hallucinated inventory mutations, wrong passphrases, and developer-server unavailability. Do not publish real testers' chat transcripts or vault backups.

## E. 5-minute adult tester script (not a clinical trial)

Seek permission, avoid collecting names or medical details, and offer an immediate stop option. Ask: (1) could you move/teleport, (2) did Future Self feel responsive to the previous turn, (3) do you understand this is a fictional possible future, (4) did you feel physically uncomfortable, (5) which step was confusing? Record aggregate counts, not private narratives. Do **not** infer antidepressant effects or neurotransmitter changes from the demo.

## F. Release blocker rules

A failing build, broken Quest input, unavailable Meta API, or visible cloud privacy ambiguity means **not submission-ready**. The official hackathon needs a publicly accessible repo, a verifiable three-minute video, live code/product and demonstrable Meta AI model use. Submit work done during this event separately labeled from earlier code and licensed third-party assets.


## G. One-Hour Compass acceptance test (v0.7)

This is an **optional story-to-real-life bridge**, not a wellbeing intervention or health outcome measure.

1. Unlock a test vault, travel to **The Other You**, and find **THE ONE-HOUR COMPASS** below the private conversation.
2. Choose **Create something**, enter `Write a paragraph` and save. Check that the character answers `What should I do today?` with a reference to that exact step, not a generic reminder or a mandatory routine.
3. Say `Tell me more`, `Yes`, and `I tried`. Verify follow-up turns are context-aware and no rewards, clocks, scores, or streaks appear.
4. Choose **I GAVE IT A TRY**. Check the wording invites optional reflection and doesn't grade the outcome. Clear the intention. Verify the note is no longer visible.
5. Save the note again. Switch to **Echo** (after earning the branch unlock), create a *different* intention, return to Prime, and verify both are independent.
6. Export a **test** encrypted backup and inspect the ciphertext. The step text must not appear in readable form. Lock/unlock and confirm the note returns. Changing a passphrase should not erase it.
7. With Meta mode enabled using only a fictional test identity, inspect the single allowlisted request in DevTools: the private Compass note must not be present. The visible mode label must say cloud text leaves the device. Disconnect the network and verify the default authored mode remains functional.
8. With a deliberately mocked Ollama response promising a depression cure, the endpoint should reject its output and authored dialogue should remain usable. Run `node --test tests/dialogue-guard.test.mjs` for a reproducible mock test.

Run `npm run readiness` for an honest preflight status. It never turns an untested Quest, model endpoint, demo, or human usability session into a fake green check. Record a **real** Quest test and inspect frame rate/comfort before claiming the VR experience is ready.
