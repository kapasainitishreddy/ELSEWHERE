# Next live integration test

No live call was made while preparing this change. The previous three playground-call authorization is exhausted. An existing Meta key and a new explicit spending approval are required before executing either test.

## Prepared changes

Meta's official reasoning documentation says `max_tokens` includes reasoning plus visible output. The old 260-token adapter budget could finish before a visible answer. The Meta request now uses 1,024 total output tokens, `reasoning_effort: minimal`, and a 45-second server deadline. Partner request defaults remain unchanged. Remote inference stays disabled unless the operator explicitly enables it.

The synthetic handler probe now records sanitized token counts and finish reason, without keeping prompts, answers, keys or raw errors. Provider-reported completion tokens include reasoning; the reasoning field is a subset, not an extra billable amount.

The prepared synthetic handler request contains 1,595 UTF-8 bytes of messages and caps total output at 1,024 tokens. Published Standard Muse Spark rates were checked on November 4: $1.25 / million input tokens and $4.25 / million output tokens. A conservative input allowance of 1,595 tokens plus the output cap is approximately $0.00635 per handler call before credits. An approved two-call $0.02 ceiling leaves room for the proposed handler test and one browser test of the same bounded fictional question. Recalculate before changing the question or context; never retry automatically.

Sources: https://dev.meta.ai/docs/reasoning and https://dev.meta.ai/docs/pricing-rate-limits . These are planning estimates, not a posted charge or a verified live result.

## Completion evidence still needed

1. Owner supplies an existing key through local configuration, never chat or the public bundle, and renews the spend approval.
2. One synthetic local handler request returns a complete, validated answer; inspect the sanitized receipt.
3. One synthetic browser request passes the actual per-session consent UI and displays a genuine Meta response. Capture the real result and measured token counts. Restore remote-off defaults afterward.
4. Only then revise the video and entry's Meta-use claims. A local test alone does not establish an anonymous public service is safe: provider spending controls and distributed rate/abuse controls remain prerequisites for exposing paid inference publicly.

Real user feedback, participant/contributor eligibility and physical headset results cannot be manufactured by software checks. The current entry makes no clinical-benefit or physical-device claim.
