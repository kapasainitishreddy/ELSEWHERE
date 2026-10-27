# ELSEWHERE Trust & Comfort 1.4 QA

Release should be judged on a real device and with real users. Automated source checks are only the first gate.

## Keyboard + desktop smoke

1. Start clean and unlock the private vault. Move to The Other You and open the story panel.
2. Pin `I want to finish a book this year.` Verify it appears, can be removed, and stays in encrypted storage after reload. No silent upload.
3. Ask `What did I ask you to remember?` in authored offline mode. Expect explicit pinned memory and no invented real history.
4. Pin a different fact in Echo; switching to Prime must not expose it. Returning to Echo restores it.
5. Test the cloud toggle: default is off. Enabled mode clearly says text leaves the device; private memory cards and future letter remain unshared.
6. Under network throttling or a failed optional local model, dialogue should fall back safely without changing credits, hours or story facts.
7. Run `?perf=1`; inspect frame stability and draw calls. This counter is local, opt-in and not a medical measure.

## Quest / WebXR manual gates

1. From a secure HTTPS origin, enter VR. Test walking/teleporting with the physical controller while observing hands and ray origins after portal travel.
2. Try **Gentle** (30°, 11 m), **Seated** (30°, 16 m), and **Standard** (45°, 14 m) comfort choices. Ensure objects are reachable, invalid landings rejected, and no camera shakes occur.
3. After ~15 minutes of *active VR* time, a voluntary break invitation should appear once, unobtrusively. No timer while headset session is inactive; no penalties when leaving.
4. Compare standing/seated legibility, two-controller use, one-controller use, motion-reduced OS preference, and voice off. Avoid forcing health self-reports.
5. Confirm a Quest-class stable frame rate (at least 72 FPS, ideally consistently higher). Record device model, browser version, measured sample windows, heat, and any comfort complaints. Stop immediately if nausea or dizziness occurs.

## Failure handling

- WebGL unavailable: readable text-only story controls remain available.
- Offline: old public assets can be read from cache, but navigations fetch a fresh HTML shell when connected; no API call or private save is cached by the service worker.
- Wrong passphrase: fail closed without replacing the vault.
- Model hallucination/repetition: use authored fallback, report no claim of medical treatment, never alter economy state.
- Unsupported on-device speech: remain text-only. Never default to cloud speech recognition.

**Evidence collection:** Never collect transcripts, decrypted backups, actual passphrases or identifiable information from user tests. Ask consent for aggregated, non-sensitive observations only.
