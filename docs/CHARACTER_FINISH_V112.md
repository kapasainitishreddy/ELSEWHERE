# Character silhouettes and animation cadence · v1.12.0

Source changes—not a pre-rendered animation video.

- Characters now use **tailored, distinct geometry**: tapered hair locks, fitted collars, shoulder layers, cuffs, belt, detailed footwear, facial refinements and two subtly animated coat tails. The traveler has its own headband; the imagined elder has muted silver detail.
- Spherical white eyes are flattened to avoid a toy-eyed appearance. Facial acting remains animated with the existing skeletal mixer.
- Radial ground-contact shadows replace the obvious solid circular shadow discs. Each texture is generated locally with a 64 × 64 alpha field.
- Secondary acting now uses the **mixer-sampled base pose** instead of a separate yaw accumulator or ever-growing head/shoulder offsets; the supporting NPC can turn toward you without fighting its patrol heading.
- A shorter walking clip and travel-speed-scaled playback bring the step frequency closer to ground movement; body lift/lean/roll are strictly bounded and off for reduced-motion users.
- Lower exposure, gentler key light, and an opposing world-color rim light help preserve shape and depth rather than bleaching the characters.
- No remote models, faces, tracking, saves or extra network requests.

This is a stylized character-art pass, not a promise of realistic motion capture, accurate inverse kinematics, or full art-direction review. Test in a real Chromium browser and Quest device, including returning through portals and ending all animation mixers on disposal.
