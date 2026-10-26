# ELSEWHERE research and safety brief (October 26, 2026)

## Position the project correctly
ELSEWHERE is an original **interactive science-fantasy storytelling engine**, not a therapy app, medical advisor, medical device, depression treatment, or method for raising dopamine or serotonin. Research papers inspire optional design choices but **do not validate this game**. The Meta Global AI Developer Hackathon participant guide explicitly lists generic **AI Mental Health Advisors** among sample anti-projects. Build the hackathon entry around user agency, causal parallel worlds, memorable NPCs, sound technical execution, and genuinely verified Meta-model integration, not treatment claims.

## Peer-reviewed evidence and narrow design implications

1. **Future You: A Conversation with an AI-Generated Future Self Reduces Anxiety, Negative Emotions, and Increases Future Self-Continuity** (Pataranutaporn et al., IEEE FIE, 2024 conference paper, published 2025). The published abstract reports a preregistered study of 344 people and short-term gains in reported future-self continuity and anxiety outcomes after an AI-simulated future-self conversation. https://doi.org/10.1109/FIE61694.2024.10893443 . Our implementation: an explicitly imaginary future character. This evidence cannot prove that ELSEWHERE improves mental health or the future.

2. **Virtual nature, real relief** (_npj Digital Medicine_, 2025). Review/meta-analysis of 24 studies of virtual nature, spanning VR and other display conditions; pooled self-reported outcomes were promising, but between-study heterogeneity was substantial. https://doi.org/10.1038/s41746-025-02057-4 . Our implementation: a noncompetitive garden, calm visuals, no achievement or time penalties. Not a therapeutic claim.

3. **VR interventions for stress reduction in the general population** (Strauch et al., 2026). 55 eligible randomized studies; 39 studies and 4,024 people in quantitative synthesis. Many physiological stress effects were not significant. https://pubmed.ncbi.nlm.nih.gov/42184377/ . Our design: let players freely choose or decline immersive reflection without assuming a uniform response.

4. **A single-session VR intervention addressing self-compassion and self-criticism...** (Hidding et al., 2024, randomized study of 68). Compassionate roleplay showed promising effects; adding viewpoint switching did not offer additional benefit. https://doi.org/10.1016/j.brat.2023.104466 . Our implementation: voluntary fictional dialogue with a defeated knight, not prescribed therapy.

5. **Dismantling the mechanism of VR self-compassion training** (Xia et al., 2026). Different formats showed outcome-specific effects, with no significant group differences in anxiety or stress; embodiment is not inherently therapeutic. https://doi.org/10.1016/j.brat.2026.105102 .

6. **FutureU VR trial** (2026). Short-term future-oriented reflection effects do not ensure lasting behavior change. The study cautions about differences between intervention conditions. https://pmc.ncbi.nlm.nih.gov/articles/PMC13170087/ .

7. **Dopamine reward prediction-error signalling: a two-component response** (Schultz, _Nature Reviews Neuroscience_, 2016). Dopamine relates to more complex learning and reward signals than a simple pleasure meter. https://doi.org/10.1038/nrn.2015.26 . We neither measure nor promise changes in dopamine or serotonin. Do not publish "boosts brain chemicals" marketing or invented neurochemical percentages.

8. **Adverse Effects of Virtual and Augmented Reality Interventions in Psychiatry** (Lundin et al., 2023). Review of 73 studies found serious gaps in adverse-event reporting, including cybersickness; 7 studies reported worsening clinical symptoms or increased fall risk. https://pubmed.ncbi.nlm.nih.gov/37145841/ . Design consequence: seated option, clear exits, no forced motion, reduced-motion support, and stop if dizzy or unwell.

## Meta devices are distinct targets
- **Quest** is the VR target for immersive 3D world navigation. Use WebXR, controller pointing, teleportation, snap turns, and test real headset frame stability. Meta's 72 Hz frame budget is ~13.9 ms, 90 Hz ~11.1 ms. https://developers.meta.com/vr/documentation/unreal/os-missed-frames/
- **Ray-Ban Meta glasses** are not Quest VR headsets. Meta Wearables Device Access Toolkit supports mobile-linked glasses experiences; capabilities such as camera, microphone, audio and motion require device-specific support and appropriate permissions. Meta Ray-Ban Display also has a standalone web-app option. https://developers.meta.com/wearables/faq/
- The /glasses/ Pocket preview is a lightweight **standalone webpage**, not a deployed/approved hardware integration. It uses neither camera nor microphone, makes no API calls, does not transfer vault contents and is unverified on actual Meta Ray-Ban Display glasses.

## Implemented, with limits
- Stillwater is optional and strictly in-memory. Four short authored stories use no mood labels, health scores, streaks, ads, user profiling, biometric readings, tracking, or automatic model calls. Closing the dialog clears the session; it never changes fictional hours or credits.
- The future-self 3D scene includes a garden terrace with a bench, tree, reflective pool and readable sign. The desktop dialog has complete branching choices; the XR sign currently shows a shorter local in-world note. Full XR branching panels are **not implemented**.
- The rest of the private game uses local encrypted saves. Optional cloud Meta-model mode is **separate and not fully private**; live Meta inference has not been validated for this release. No third party is guaranteed to refrain from using any data voluntarily transmitted to its cloud service.

## Exit criteria before submission
1. Run a full Vite production build and check the gameplay visually in a browser; passing Node unit tests is insufficient.
2. Test on Quest hardware with comfortable seated use, stable FPS, controller interaction, motion settings, and clear exit. Stop play if discomfort occurs.
3. Verify the /glasses/ UI on actual Meta Ray-Ban Display hardware in developer mode; do not assume browser compatibility.
4. Network-inspect local mode and audit hosting logs, microphone permissions, CSS/fonts, service-worker cache and cloud consent.
5. Demonstrate genuinely eligible Meta model use in live product and on video using **synthetic fictional world data** if privacy permits.
6. Do not claim measured wellbeing efficacy or neurotransmitter changes without a separate, appropriate ethics-reviewed evaluation.
