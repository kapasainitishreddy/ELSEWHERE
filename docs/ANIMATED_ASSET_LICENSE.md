# Khronos sample animation attribution and optional installation

The optional **Fox.glb** is used as an animated, fictional companion in the future-self room.
Unlike ELSEWHERE's original in-code rigged citizens, the fox has **real imported joint animations**:
`Survey`, `Walk`, and `Run`. The file is **not shipped by default**; on a developer's network-connected
computer run `npm run assets:animated` to download it from a pinned repository commit and verify its
Git blob SHA. The production website only requests `/assets/companions/fox.glb` from its own origin.
It never fetches external CDN assets during a user's session.

Original credits: **PixelMannen**: Fox model (CC0-1.0). **tomkranis**:
rigging and animation (CC BY 4.0). **AsoboStudio and scurest**: conversion to glTF
(CC BY 4.0). See [upstream Fox README](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Fox/README.md)
and [upstream LICENSE.md](https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/Fox/LICENSE.md).

The CC BY 4.0 material may be redistributed and adapted with attribution and license link.
https://creativecommons.org/licenses/by/4.0/
No author endorsement is implied. The installed model is unmodified and is **not a Syrava original**.

The original rigged human figures, abstract faces, props, portals, animation choreography and
story dialogues in ELSEWHERE are independent project-authored work.

## Checks

- `npm run assets:animated` validates the expected 162,852-byte GLB by Git blob SHA.
- Missing optional assets automatically leave the game playable in procedural mode.
- `npm run test` validates the manifest, opt-in installation and same-origin-only runtime.
- Do not advertise that the model is already downloaded into GitHub unless it is actually installed.
