# ELSEWHERE Future Self: evidence, careful claims, and safety design

**Version:** October 26, 2026 | **Scope:** research-informed fiction, NOT a clinical intervention or validated therapy.

## What researchers have actually studied

1. **Pataranutaporn et al. (2025; FIE 2024 publication)**, [Future You: A Conversation with an AI-Generated Future Self Reduces Anxiety, Negative Emotions, and Increases Future Self-Continuity](https://www.media.mit.edu/publications/future-you-a-conversation-with-an-ai-generated-future-self-reduces-anxiety-negative-emotions-and-increases-future-self-continuity/). A preregistered study (N=344) of a *brief single-session* interaction reported short-term improvements in future-self continuity and self-reported anxiety relative to controls. It does not establish an effective clinical treatment for depression, durable outcomes, or a causal brain-chemical change. Their age-progressed images and backstories are research components, not evidence that our 3D characters have similar effects.
2. **Cai et al. (2026), BMC Psychiatry**, [VR-based exercise interventions for depression: systematic review/meta-analysis](https://pubmed.ncbi.nlm.nih.gov/42050449/). Among 19 RCTs (1,275 participants), pooled VR exercise results were promising, but heterogeneity was substantial and the GRADE certainty was **very low**. ELSEWHERE is not a VR exercise treatment and cannot inherit that result as a product claim.
3. **2026 systematic review of VR for stress**, [JMIR: Virtual Reality Interventions for Stress Reduction in the General Population](https://www.jmir.org/2026/1/e78212). Across 39 pooled RCTs (~4,024 people), certain VR interventions were associated with positive emotion and reduced perceived stress on average; certainty and outcomes varied. Scenes in ELSEWHERE are inspired by immersive environments, not efficacy-tested implementations of those trials.
4. **Meta Horizon OS VR comfort guidance**, [Locomotion and Comfort](https://developers.meta.com/vr/design/locomotion-comfort-usability/). Use teleportation by default, snap turns, accessible seated controls, stable frame rate, limited acceleration, and easy exits. In VR, sensory comfort is a baseline requirement, not cosmetic polish.

## Features derived from this evidence

- The older self is explicitly an **imagined, possible future**, grounded in the player's own game choices, with no guaranteed outcomes or false personal memories.
- Each conversation remembers a small number of previous user turns from the **encrypted local vault**. Offline authored responses and optional **on-device** generative dialogue are distinct modes. The remotely hosted Meta AI is separately opted in and explicitly labeled non-private.
- Conversations offer reflection, a natural follow-up question, and small voluntary real-world actions. No mental-health symptom score, diagnoses, manipulative engagement loops, mood streaks, neurotransmitter claims, or mandatory check-ins.
- Difficult emotions are allowed. The system does not enforce toxic positivity or imply every problem has an easy fix. Emergency disclosures produce human-help information instead of model-generated therapeutic advice.
- Players can end the experience, clear current conversation history, or lock the vault. Old user-exported backups can still contain their older chats.

## Testable hypotheses, NOT validated claims

- In an opt-in usability study with consenting adults, at least 80% can complete the Future Self conversation in under 5 minutes without instructions.
- Players can correctly identify the future character as fictional, not an actual prediction, in a post-demo comprehension question.
- Players can voluntarily name one real-world small action; no automatic measurement or enforcement.
- Participants report acceptable comfort and can stop immediately at any moment; assess dizziness and discomfort, not just delight.
- 100% of tested private-mode requests remain on-origin in a browser Network inspection; no private data is sent through the Meta bridge without session-specific opt-in.

These are **targets** only. No human outcome data has been collected for ELSEWHERE. For studies of clinical depression or other mental-health conditions, seek appropriate clinician/research oversight, consent and ethical review; do not treat a hackathon demo as medical evidence.

## Product and hackathon boundaries

The official Meta Global AI Developer Hackathon guide's sample anti-project list explicitly warns against projects using AI to provide **medical advice**, including AI mental-health advisors. Pitch ELSEWHERE as an interactive storytelling and world-continuity platform with reflective optional experiences. Do not claim treatment, prevention or cure for depression; do not manufacture neurotransmitter measurements. Never seek clinical users as product proof without suitable protections.


## Version 0.7 design update: the One-Hour Compass

The Compass is **not** a clinical treatment, depression-monitoring tool, dopamine/serotonin intervention or validated behavior-change protocol. It is a user-controlled piece of fiction-to-life reflection: create, connect, rest or explore, with one tiny chosen action. It supports `planned`, `tried` and deletion, not streaks or performance scores. The action is locally encrypted and kept separate across parallel branches. Optional **on-device** AI can reference a bounded version of it after user opt-in. The **Meta cloud demo does not receive it**.

Research motivates features, but no scientific result has established the effectiveness of ELSEWHERE itself. To claim meaningful benefit would require an appropriately designed study, informed consent, safety monitoring and reliable outcome measurement. No participant wellbeing data has been collected in the project.
