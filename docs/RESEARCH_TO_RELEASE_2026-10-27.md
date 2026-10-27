# ELSEWHERE 1.4 — Research → player complaint → verified implementation

**Date:** 27 October 2026 · **Track:** Meta Global AI Developer Hackathon / Startup  
**Status:** Engineering iteration, **not** a verified Quest or clinical release.

## Scope and evidence limits

Research informs design choices; it does not establish that ELSEWHERE prevents, diagnoses, or cures depression, increases dopamine or serotonin, or improves an individual user's health. Reviews are qualitative reports, not representative prevalence estimates. Software tests prove selected logic, not comfort, safety or emotional outcomes in humans.

| Repeated problem / evidence | What changed in 1.4 | Inspectable acceptance criterion | What still needs human testing |
| --- | --- | --- | --- |
| VR nausea, smooth turning and lack of breaks. Meta locomotion guidance recommends multiple user preferences and teleport/snap-turn options. A 2025 comparison study reported tradeoffs between controller and teleportation usability/comfort. | Seated teleport preset, existing gentle & standard snap modes, activity-aware break invitation after 15 minutes of *foreground XR* play, no punishment for stopping. | `tests/research-polish.test.mjs`; `tests/xr-release.test.mjs` | Quest 3 / 3S: seated, standing, controller ray, landing rejection and real nausea feedback. Stop immediately on discomfort. |
| People report roleplay bots forgetting the plot, responding with generic language and contradicting earlier facts. | Player-authored encrypted memory cards (up to six), one set per parallel timeline; deterministic dialogue refers to an explicitly pinned fact; on-device AI receives only local selected cards; reply reviewer rejects obvious chronology contradictions, fabricated childhood memories and repeated answers. | Memory-card / contradiction / branch-isolation tests; model prompt evidence | Test longer conversations with consenting adult users and record contradictions, recovery and follow-up quality. Heuristic checks have false negatives and false positives. |
| AI companion users worry about intimate information and losing remembered conversations. A 2026 interview study found privacy choices are often made *before* sharing. | Memory cards are voluntary, editable, removable, encrypted with the existing vault; they are never copied to Meta. The privacy panel now prominently changes its heading when cloud inference is enabled. | Privacy-contract tests and source allowlists | Verify with DevTools network capture. Confirm browser extensions, hosted updates and model-provider data processing remain outside our guarantees. |
| Offline apps keep serving old builds after an update. | Service worker: network-first document navigation with per-path offline fallback, scoped static cache and private/API exclusions; versioned cache retirement. | Service-worker assertions and no-telemetry source review | Offline → online update test in an installed browser on a real device. |
| Users sometimes feel pressured by streaks, coaching, mood questions and endless engagement. Research on anthropomorphic AI companions raises dependency concerns. | Player-driven memory, authored fallbacks and already-existing no-streak One-Hour Compass; break reminders never lock content or reward retention. | Compass regression suite + session-care unit tests | User interviews about agency, discomfort and perceived pressure; no diagnosis or therapeutic efficacy claims. |
| VR text and small targets are difficult to use while seated or holding controllers. | Seated reach option and readable memory panel with accessible labels and controls; no required headset movement to write or remove a memory. | DOM source assertions, keyboard tab-order manual script | Real Quest legibility and controller target testing. |

## Primary cited sources

1. Meta Horizon OS, **Locomotion Best Practices** (updated Dec 2025): https://developers.meta.com/vr/design/locomotion-best-practices/
2. Hořejší et al., **Virtual reality locomotion methods differentially affect spatial orientation and cybersickness during maze navigation**, *Scientific Reports* (Jul 2025): https://www.nature.com/articles/s41598-025-12143-y
3. **Visual Factors in Cybersickness: A Literature Survey and Meta-Analysis**, PubMed record (2025): https://pubmed.ncbi.nlm.nih.gov/41389808/
4. van Gelder et al., **Stimulating Future-Oriented Thinking and Goal-Achievement Through the Future Self Using Virtual Reality and a Smartphone App**, RCT (2026): https://pubmed.ncbi.nlm.nih.gov/42126335/
5. **Chatting with confidants or corporations? Privacy management with AI companions**, *Journal of Computer-Mediated Communication* (2026): https://academic.oup.com/jcmc/article/31/4/zmag014/8741679
6. **AI companionship or digital entrapment?**, review of public discussion at scale (2025): https://doi.org/10.1016/j.jik.2025.100835
7. Public Character.AI player feedback, April 2025: https://www.reddit.com/r/CharacterAI/comments/1jouykp/
8. Public Character.AI memory complaints, March 2026: https://www.reddit.com/r/CharacterAI/comments/1rn7itb/
9. Public Replika memory feedback, February 2025: https://www.reddit.com/r/ReplikaOfficial/comments/1iwuje1/
10. Public VR comfort discussion, October 2026: https://www.reddit.com/r/virtualreality/comments/1wxxxct/

## Concrete acceptance protocol

**Browser and privacy, before submission:** `npm install && npm run check && npm run submission:check`. On desktop, unlock a fresh vault, pin and forget a memory, switch Prime/Echo, inspect source and service worker, reload, verify no cloud question was sent, import/export encrypted backup, clear it and confirm no plain text in localStorage, caches, or console logs. Run with network disabled and again online to verify updated HTML is fetched.

**VR and comfort:** Use a real headset on HTTPS. Test seated and standing movement, near/far teleport targets, safe landing collision, 30°/45° turns, loss of controller tracking, exit and re-entry, simulated low frame rate, different IPD settings, and 15-minute voluntary break suggestion. Record headset FPS and p95 frame time; target stable ≥72 FPS (13.9 ms/frame), confirm independent observation. Never instruct someone to push through symptoms.

**NPC and narrative:** Test a twenty-turn fictional future-self conversation after patent/gift/auction branches, ask them to remember an explicitly pinned fact, intentionally provide a false memory, switch to Echo, check no leakage, then return. Measure contradictions/20 turns, repetition/20 turns, time to recover from model failure and successful authored fallback. An AI guard is a heuristic, not a guarantee.

**Meta use and honesty:** With consent, verify one live Meta Model API request on a disposable fictional timeline with safe dramatic scene cue. Confirm keys remain server-side and generated text cannot award currency or powers. Capture evidence of the call and game response. Record an accessible real 3-minute product demo. **Without these checks the hackathon submission is NOT certified ready.**
