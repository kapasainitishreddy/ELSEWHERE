# Record the local ELSEWHERE demo on Windows

This is the practical next route to test capture on the user's Windows hardware: run the game locally and capture its browser window with Xbox Game Bar, which is built into supported Windows installations. It uses no live AI provider, cloud recorder, paid service, or extra screen-capture software. Game Bar availability, recording smoothness and capture settings vary by Windows policy and hardware; the steps below do not claim that a Windows recording has already been made.

The cloud Chromium capture was inspected and decoded successfully, but it produced only 115 frames over 79.64 seconds (about 1.44 fps) on SwiftShader. That footage is visibly choppy and lasts less than the required three minutes. Do not use it as the demo video. Capture on the owner's Windows PC and review the result there.

## Before recording

1. Use the ELSEWHERE checkout on the PC. Open PowerShell in the repository root. Node.js 22 or newer and the repository's already-approved dependencies must be available. Check Node with `node --version`.
2. If `node_modules` is missing, stop and get approval before installing dependencies. `npm ci` installs the exact versions in `package-lock.json`; this is only setup, and is not needed when the checkout is already installed. No OBS, codec pack, model, or browser extension is required for the recording steps below.
3. Start the local-only development server:

   ```powershell
   npm run dev -- --port 5173 --strictPort
   ```

   Leave this PowerShell window open. Open `http://127.0.0.1:5173/` in an installed, hardware-accelerated Chrome or Edge window. The server binds to `127.0.0.1`; do not use `npm run play`, which binds to all network interfaces. The game and its authored dialogue run locally. Do not configure or enable a remote model provider for this rehearsal.
4. Set the display to 1920×1080 if available, browser zoom to 100%, and the browser window to full-screen with **F11**. At 1280×720, keep the same zoom and ensure the story text is readable. Turn on Windows Do Not Disturb/Focus so notification banners do not enter the capture.
5. Open **Settings → Gaming → Captures** and choose the highest available capture resolution and quality with 60 fps if the PC supports it. Leave microphone recording off unless you deliberately want your own narration. If you narrate, use only the synthetic script below. Disable background recording so only the planned take is saved.
6. Open Game Bar with **Win+G** while the browser is focused. Confirm the Capture widget is available and microphone capture is off. Make one 10-second test recording with **Win+Alt+R**, stop with the same keys, and play it from `Videos\Captures`. Confirm it shows the browser at full resolution and has smooth motion before making the main take. Delete the test clip if you do not need it.

If Game Bar is unavailable or blocked by device policy, stop and ask before installing or using another recorder. This procedure intentionally does not install substitute software.

## Three-minute continuous take

Use a clean guest session. Guest play avoids touching an existing encrypted save and visibly says `GUEST · NOT SAVED`. Do not type private or personally identifying information. The exact future-self prompts below are synthetic. Keep the conversation status in frame so viewers can see that this is the authored offline path, not a live Meta response.

Start at the entry gate, make sure the browser is the focused app, then press **Win+Alt+R**. Record one continuous take; the times below are guide marks, not edits. Keep each result visible for a few seconds so the text can be read.

| Time | Action | What the viewer should see |
| --- | --- | --- |
| 00:00–00:20 | Show the entry gate, then select **PLAY GUEST DEMO**. | The 2087 city and `GUEST · NOT SAVED` label. A short spoken introduction can say this is a local story game, not a prediction. |
| 00:20–00:40 | Follow **MEET YOUR FUTURE SELF**, then the next guide button to begin the conversation. | The 2046 apartment and the imagined-future-self disclosure. |
| 00:40–01:00 | Ask: “What does an ordinary day look like in this possible future?” Submit and pause on the reply. | The actual response and `LOCAL · AUTHORED` status. If narrating, say plainly that this take uses authored offline dialogue; live Meta inference is not shown. |
| 01:00–01:25 | Close the story panel, follow **STEP INTO 1889**, open the choices, and select **Invent Aether Cell**. | The 1889 workshop and the selected fictional invention. |
| 01:25–01:45 | Choose **Give it to the world**. Pause on the resulting public-workshop receipt. | The consequential choice and its state-based outcome. Do not call the fictional credits or outcome real-world advice. |
| 01:45–02:15 | Follow the guided return to 2046. Ask: “What changed after we shared the Aether Cell?” | The future-self reply recalls the public workshops. Keep the `LOCAL · AUTHORED · GUEST · NOT SAVED` status legible. |
| 02:15–02:45 | Follow **WITNESS THE RIPPLE** to 2087 and open the story panel. | The changed city, public-workshop text and causal receipt. Hold the view still for readability. |
| 02:45–03:00 | End on the 2087 outcome and unsaved label. | If narrating, close with: “The game consequences are deterministic and local. This recording uses authored dialogue; it does not demonstrate a live Meta model call.” With the mic off, leave the on-screen guest/authored labels visible. |

If an action takes longer, skip optional exploration rather than speeding up or interpolating the footage. To recover from a wrong choice or obscured shot, stop recording, reload a fresh guest session, and make another continuous take. Do not edit a mock response into a live-provider claim.

## Finish and inspect

1. Stop with **Win+Alt+R** at about 03:00. Game Bar normally saves recordings in the current Windows user's `Videos\Captures` folder. Rename the chosen file `ELSEWHERE-local-authored-rehearsal.mp4` so it cannot be mistaken for live Meta evidence.
2. Play the entire MP4 from the beginning. Check that there is no desktop, Game Bar menu, notification, loading screen, minimization, unreadable text, dropped/stalled motion, or accidental private information. Confirm the clip is close to three minutes and the `LOCAL · AUTHORED` and `GUEST · NOT SAVED` labels are visible at the relevant moments.
3. Keep the raw capture unchanged. If the clip is still choppy, rerun only after checking that the browser's hardware acceleration is enabled and that the machine is not under heavy load. Do not interpolate, duplicate frames, or increase playback speed to conceal capture performance.
4. The clip remains a local rehearsal until its format, duration, required disclosure, eligibility and other portal fields are checked against the actual submission instructions. A clean local recording does not prove a live Meta call, a public deployment, headset performance, or submission acceptance.

## Commands verified in the managed workspace

The project script `npm run demo:record:authored` completed locally, `ffprobe` confirmed its H.264 1280×720 stream and exact duration/frame count, and a full ffmpeg decode passed. It made zero Meta, off-origin, or guest-vault requests. The documented server command `npm run dev -- --port 5173 --strictPort` served the app successfully at `http://127.0.0.1:5173/`. Windows Game Bar itself and this Windows procedure have not been exercised on the owner's PC; verify the short test capture before recording the three-minute take.
