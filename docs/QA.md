# ELSEWHERE 0.3 — Validation ledger

## Automated (executed locally)

- [x] State schema migration from v0.1/v0.2.
- [x] Cross-era trade limits, repayment, exploit-resistant buy/sell rates and heist consequences.
- [x] Two isolated realities retain different inventions, economic state, debts and NPC memories.
- [x] Three power-specific rune ciphers, tactical Warden adaptation and peaceful resolution boundaries.
- [x] Mech heat, hull, guard/shield and one-time defensive rewards.
- [x] Original story chapters unlock based on actual state; role-playing messages display safely.
- [x] Randomized 90-step playthroughs preserve game state invariants and survive save/reload.
- [x] PBKDF2/AES-GCM vault creation, wrong passphrase, tamper rejection, legacy migration, queued writes, rekey and encrypted backup portability.
- [x] Private letter escaping, no third-party mic transcription, explicit cloud-consent contract and cloud input allowlist.
- [x] JavaScript syntax check via `node --check`.

## Not independently verified

- [ ] `npm install`, `npm run build` and actual Three.js/Vite bundle in this restricted environment. npm dependency downloads were blocked by DNS/network access.
- [ ] Visual rendering, animation composition, shadows, XR portal highlighting and collision paths in a real browser.
- [ ] Meta Quest headset/controller comfort, frame rate, accessibility and motion sickness testing.
- [ ] Production offline service worker cache after warm first visit and safe cache updates.
- [ ] Live Meta Model API model access/usage in the separate opt-in demo (needed for Meta hackathon eligibility).
- [ ] Independent privacy penetration test, DOM injection review and supply-chain audit.

## Manual verification journey

1. Launch on **127.0.0.1**, create strong passphrase, reload and confirm lock screen. Inspect localStorage for `syrava.elsewhere.private-v1` ciphertext only, no plaintext `syrava.elsewhere.v1`.
2. Export ciphertext, import to separate browser profile with passphrase, test incorrect passphrase, confirm Prime/Echo history survives. Lock the vault and verify the UI clears.
3. Go Future → Past, prototype an invention and gift or patent it, return to Future and compare geometry and Iris's reply.
4. Enter 2046, converse about the changed future, leave a letter, lock and unlock; confirm letter remains private.
5. Trade hours in each era, attempt duplicate sells/buys, steal from past/self/future, check paradox and character mood, then choose limited restitution.
6. Collect two stars, enter Echo reality, patent in one branch and share in the other, switch back and verify their ledgers diverge without duplication.
7. In the dungeon solve the runes, face the Warden, test three repeated strikes, power, guard, attempted parley, and lawful/tainted mercy.
8. In Titan Foundry train, deploy, fire and shield the mech. Test both desktop and actual VR controller inputs.
9. Turn off network after caching production shell; verify game remains usable with the local authored dialogue.
10. **Optional cloud-only demo:** intentionally start backend, opt in, inspect browser network panel; verify only immediate question + allowlisted fictional summary leaves the browser, no private letter, full save or NPC memory. Confirm opt-in resets after reload.

Do not call a build or headset experience verified until these manual checks have actually been executed.


## On-device NPC QA checklist (v0.3.2)

- Run `npm test` and confirm 61+ tests pass (including origin, loopback, prompt allowlist and narrative-only outcomes).
- Check `npm run dev` sends no browser API requests by default and accepts no remote fonts.
- Check My Timeline → Privacy → Local AI is disabled after every vault lock or reload.
- Install a local Ollama model and start `npm run dev:local-ai` to verify reply latency and tone for all six actor identities. **Not yet verified in an actual model session.**
- Turn off Ollama mid-conversation: the game must keep authored dialogues working, leave the vault valid, and not change achievements from model text.
- Switch worlds while an NPC response is pending: the stale result must not appear in the new world.
- Validate `index.html` CSP and service worker behavior in real Chromium / Quest; source tests alone do not prove network isolation.
