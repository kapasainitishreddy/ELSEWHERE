# Live Meta check and preview plan

**Reviewed:** 2026-11-04 05:56 UTC. **Status:** preparation only. No API key was configured, no live provider request was sent, and no preview was deployed or published.

## What is confirmed

- Meta's current Global AI Developer Hackathon page advertises Muse Spark through Meta Model API and Meta open-weight models, and lists project submissions due Nov 4, 2026 at 9:00 PM ET (Nov 5, 02:00 UTC). The entrant must still confirm their acceptance, selected track, exact participant-guide requirements, account access and current portal fields. The public page does not prove this project's or entrant's eligibility.
- The repository's first-party Meta route now matches Meta's current API docs: `https://api.meta.ai/v1/chat/completions`, model `muse-spark-1.3`, server-side `MODEL_API_KEY`. This is the shortest and clearest path for demonstrating Meta Model API use. Meta's Standard mode says prompt/content is not used to train Meta models; Contributor mode permits training use in exchange for lower rates, so the runbook recommends Standard mode.
- Meta's event material advertises free Model API credits for the hackathon, but this workspace cannot inspect the entrant's account or credit balance. Check the actual account balance/expiry before relying on credits.
- Other configured route choices are Meta Muse Spark Open through Fireworks or Modal Shared Endpoints; the Meta Research announcement lists Baseten, Fireworks, Modal and other API platforms. Meta's public event page permits Meta open weights, but any provider-specific acceptance should be confirmed against the selected participant's guide. No adapter has live account/model proof. Baseten's current accessible docs describe token billing but the model-specific numeric rate was not retrievable in this review.

## Exact data sent

1. Enabling remote mode first makes `GET /api/health`; it contains no question or timeline. The app then names the configured recipient and asks for consent.
2. After consent, each submitted future-self question makes one same-origin `POST /api/character` with `cloudConsent:true`, `world:"self"`, an opaque SHA-256 provider/configuration fingerprint, the trimmed question (maximum 350 characters), and an allowlisted timeline object: credits, fame, trust, invention, fate, power, and ending.
3. Before contacting the selected provider, the server clamps credits to 0–100,000,000 and fame/trust to 0–999; it reduces invention/fate/power/ending to known fictional enum values. The provider receives a developer instruction describing the fictional character and safety/output constraints, that compact summary, and the current typed question. It receives no prior chat history, private letter, passphrase, encrypted save, NPC memory, or other reality/branch.
4. The upstream request includes the selected model, those two messages, and `max_tokens:260`; partner adapters also set `stream:false`. The API key is in the server-side Bearer header, not browser code. The reply is screened and parsed; model output cannot modify game state. The user's typed question leaves the device and should be synthetic/non-sensitive.

The browser host and serverless host also see the inbound app request and ordinary request metadata. The chosen model provider sees the API request from the server environment. Treat remote mode as off-device, regardless of encrypted local saves. See [the code](../src/main.js), [request builder](../server.mjs), and [privacy boundary](PRIVACY.md).

## Provider choices and request cost

Prefer **Meta Model API Standard mode with `muse-spark-1.3`**: it is already the default in the code, the endpoint and model are now verified in Meta's docs, and it avoids adding an intermediary. Current posted prices are $1.25/M uncached input tokens and $4.25/M output tokens; cached input is $0.15/M. The app's prompt is roughly 400–500 input tokens for its current bounded request, and asks for 2–5 sentences with a 260-token hard output cap. That estimates about **$0.0009–$0.0011 per typical reply** (roughly one tenth of a cent); at 400–500 input tokens and the full 260 output-token cap, about **$0.0016–$0.0017 per request**. These are token-price calculations, not a quote or exact invoice; actual usage, taxes, credits and billing must be checked in the account. Two calls for a probe plus an in-app demonstration should be about **$0.002–$0.004 before credits**, if input remains in that range. Failed/time-out requests may still incur usage. The app does not currently retain provider token-usage counts.

Fireworks currently lists the exact Muse Spark Open model slug `accounts/fireworks/models/muse-spark-open` at the same Standard $1.25/M input and $4.25/M output rate. Modal Shared Endpoints lists Muse Spark Open at the same token rates; Modal's monthly compute credits do not cover token-billed Shared Endpoints. Dedicated Modal hosting is a separate GPU/CPU/memory-per-second cost and not needed for a minimal check. A current Baseten per-token amount remains **unknown** here; read the account's price before any request. Do not use a Contributor mode just to save fractions of a cent without an explicit decision about provider training use.

Sources: [Meta event page](https://dev.meta.ai/events/global-hackathon), [Meta developer announcement of hackathon credits](https://developers.meta.com/blog/meta-connect-recap/), [Meta Chat Completions reference](https://dev.meta.ai/docs/api-reference/chat-completions/create-chat-completion), [Meta pricing and rate limits](https://dev.meta.ai/docs/pricing-rate-limits), [Meta model data-use modes](https://dev.meta.ai/docs/models), [official Meta announcement of Muse Spark Open providers](https://research.meta.ai/blog/muse-spark-open), [Fireworks model/rates](https://app.fireworks.ai/models/fireworks/muse-spark-open), [Fireworks serverless pricing](https://docs.fireworks.ai/serverless/pricing), [Modal supported models/pricing](https://modal.com/docs/guide/supported-models), [Modal plan and compute pricing](https://modal.com/pricing), [Baseten pricing documentation](https://docs.baseten.co/inference/model-apis/pricing-and-limits).

## Minimum one-time live verification

This requires the entrant's explicit approval to use a provider key and a stated maximum number of calls/cost. Keep a key out of chat, Git, screenshots and browser bundles. The repository ignores `.env`.

1. The entrant confirms an approved Meta Model API account/key is available and inspects the actual credit balance, model terms and participant guide. Direct Meta setup requires no provider choice or URL changes:

   ```dotenv
   MODEL_PROVIDER=meta
   MODEL_API_KEY=<the entrant supplies this privately>
   META_MODEL=muse-spark-1.3
   ```

2. Put these values in the ignored local `.env` or inject them only into the local process environment. Do not put them in any `VITE_*` value. A `GET /api/health` check reveals configured status/provider only; it does not call the model.
3. For one bounded, synthetic handler test, run `node --env-file=.env tools/review/meta-live-probe.mjs --live` (Node 22+). This makes **one** upstream request using the fixed synthetic Aether Cell question, no retries, and writes a sanitized receipt to ignored `review-output/meta-live-check.json`. The receipt omits question, reply, key, endpoint, and raw error. This probe constructs the consent flag itself; it is handler evidence, not proof the player consented in the UI.
4. For the user-facing demonstration, run `npm run dev:model`, enter guest or a disposable private world, open **My Timeline → Privacy**, enable remote mode after reading its recipient-specific consent prompt, then submit only the synthetic question “What changed after we shared the Aether Cell?” Keep the visible provider/status and actual response in frame. This is a **second** billable request and demonstrates the actual UI consent path. With remote mode off, verify the authored reply still works.
5. Save the sanitized handler receipt, timestamp/model/account evidence with secrets redacted, and a capture of the in-app provider status/consent/response. Never call a mock or authored response live Meta evidence. Do not claim the API call alone proves eligibility or public deployment.

## Public HTTPS preview: remaining work and safeguards

A **static-only** build can be shown with authored offline dialogue and no API key; remote mode then remains unavailable. This is the lowest-risk public code preview, but it does not demonstrate the Meta integration gate. To expose the live route, use a host that serves the Vite `dist/` output and runs the existing Node `/api/health` and `/api/character` functions on the same origin. Add the Meta key only as a server-side host secret; never bake it into assets or client variables. There is no deployment config or verified hosting account/domain in this repository yet.

Before a public live-key deployment, the owner must choose/authorize the host and public URL, confirm its spend ceiling, and add provider spend limits plus managed edge rate limiting/abuse controls. `api/rate-limit.js` is process-local best-effort state; it is not a durable distributed cap across serverless replicas. Do not expose the anonymous model route with only that limiter. Hosting price/domain cost cannot be estimated without a chosen provider/account; check the host's plan and billing first. A public preview also needs a fresh-browser HTTPS smoke test of load, consent, one synthetic reply, authored fallback, local saves, mobile layout, and zero leaked secrets.

No deployment/publish action is part of this plan. Entrant eligibility, current portal submission fields, live account access/credits, hosted rate/budget protections, public URL, video and physical device evidence remain open.
