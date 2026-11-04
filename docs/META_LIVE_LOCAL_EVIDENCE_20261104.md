# Verified local Meta integration — November 4, 2026

Two additional fictional requests were authorized with a $0.02 ceiling. Exactly two upstream requests were made. Preparatory browser-navigation failures made zero model requests.

| Test | Result | Input tokens | Output including reasoning | Reasoning subset |
| --- | --- | ---: | ---: | ---: |
| Local invocation of the actual serverless handler | HTTP 200; complete directed reply, cue and focus validated | 321 | 328 | 229 |
| Real browser consent and conversation through the local model bridge | HTTP 200; Meta response displayed inside ELSEWHERE | 322 | 388 | 280 |

Both responses finished with `stop`. The browser made exactly one `/api/character` request and the local bridge made exactly one upstream call. A fictional Aether Cell was invented and shared through the real game UI before the question was submitted. The test used an unsaved guest session. The question and allowlisted fictional summary were transmitted after the consent dialog; private plans, letters and saved conversations were not included. The reply was displayed with the cloud-session disclosure. Remote mode was disabled afterward, the temporary local servers were stopped, and persistent `.env.local` remote enablement remained false.

Totals: 643 input tokens and 716 output tokens including reasoning. At the verified standard rates of $1.25/M input and $4.25/M output, estimated cost is **$0.00384675 before credits**. Actual posted billing is unverified. The original three playground requests were separate; combined estimates across all five calls total $0.009715. The renewed two-call authorization is exhausted.

The browser evidence was checked at 2026-11-04T20:30:22.946Z. The game displayed a complete response grounded in the fictional decision to share the invention. Synthetic narration and labels in the video distinguish the local live test from offline gameplay. The public static demo still has no live inference route. This local evidence does not establish anonymous hosted-inference security, clinical benefits, eligibility, or a winning score.

Official API references: https://dev.meta.ai/docs/reasoning and https://dev.meta.ai/docs/pricing-rate-limits . Token-count receipts omit credentials and raw prompts/answers; no secret is committed.
