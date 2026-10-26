# Future Self Presence Lab (v0.8)

ELSEWHERE provides **a fictional possible older self**, not a real future prediction, AI therapist, or clinical treatment. The scene is an experimental storytelling experience. This version prioritizes conversation continuity, visible turn-taking, privacy and player autonomy.

## What changed

1. The 3D older self now **listens** while a response is being prepared, and gently **speaks** while a reply is read. The head and arms move subtly; there is no forced camera motion. An alternate-history keepsake in the room reacts to sharing, patenting or auctioning an invention.
2. The authored character can tell a small original vignette about a possible day in 2046, with different details depending on the player's timeline. It never pretends to know real personal details.
3. **Hear Future Self** uses the browser's speech synthesis **only for English voices explicitly marked `localService: true`**. It starts only after the user enables it; stop, vault lock and world switching cancel speech. If a local voice is not available, dialogue stays text-only.
4. **Talk (if offline supported)** is experimental. It requires the browser's `SpeechRecognition.available({ langs: ['en-US'], processLocally: true })` to return `available`, plus a recognizer that supports `processLocally = true`. It does not automatically download language packs, fall back to cloud STT, or automatically send recognized text. Players review the filled input and press Send themselves.
5. Optional Ollama on loopback can generate richer, memory-aware character speech. The player must enable it, install Ollama locally, and understand that locally running models can have their own telemetry or logging behavior. No remote AI is needed to play.
6. Optional Meta Model API is a separate, **explicit cloud mode** for the hackathon. It does not qualify as device-only; questions and a limited fictional world summary leave the device. No private letter, passphrase, or encrypted save is included.

## Testing checklist

### Desktop first

- Run `npm install`, `npm run check`, `npm run dev` on your development computer.
- Create a throwaway encrypted vault and travel to **The Other You (2046)**. Talk without model access. Ask about an ordinary day, about the city after a shared invention, and "What did I want to create?" after previously saying you want to draw a book.
- Enable **Hear Future Self** with a local English system voice installed. Confirm the reply is audible, the avatar responds, there is a visible mute control, and switching worlds or locking the vault stops playback. If unavailable, confirm there is no audio and typing works.
- Try **Talk (if offline supported)**. When the browser does not have verified local speech recognition, it must **not ask for mic permission** or fall back to network recognition. Where local recognition is supported and installed, it should transcribe into the editable text box only, without sending the text.
- Inspect DevTools Network while playing in private mode. There should be no request containing the typed conversation. Confirm no voice/media request is sent over the network. A browser or operating system is outside ELSEWHERE's complete audit scope, so run offline for the strongest practical privacy test.

### Quest headset (not yet verified)

- Test the future room while seated and standing. Confirm natural head movement is user-controlled, text remains readable, the avatar's gestures are subtle and there's always a way to exit.
- Try VR controller selection and portal travel, then test on-device speech features only if the browser explicitly supports them. Otherwise use the text conversation panel or desktop mode.
- Record frame rate, sickness or discomfort, microphone permissions, voices supported, and error screenshots. Stop immediately if someone feels dizzy.

### Human usability, not a medical trial

With consenting adults, use fictional accounts and avoid collecting personal health information. Ask five short questions: Can they identify the fictional nature of the future? Does the older self recall the previous turn? Is the next action optional? Could they leave the conversation easily? Did anything make them uncomfortable or confused? Capture only aggregate ratings and observed defects, not private transcripts.

## Safety and limits

- This does **not** cure depression or measurably increase neurotransmitters. Never ask users to stop medication or avoid human help. If users express serious distress, show supportive information and real-world human support options; never promise a cure.
- Local voice flags are provided by the browser/OS and have **not** been independently audited. No default mic permission or remote speech recognition is allowed. Users who need the strongest isolation should run an offline, locally installed copy and type instead of using speech features.
- Automated tests verify gates and deterministic dialogue only. They do **not** prove that the experience is emotionally helpful, headset-ready, or clinically effective.
