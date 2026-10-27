# ELSEWHERE open-source integration ledger · 2026-10-27

This document separates running code from future proposals. Linking a repo never means it is installed.

## Integrated now
- Three.js (MIT): original worlds, WebXR, character skeletons, rendering, official glTF loader. https://github.com/mrdoob/three.js
- Yuka v0.7.8 (MIT): autonomous steering for Iris, Ada, the Witness, and Commander Sol. Creates one local Vehicle and ArriveBehavior per active actor. Routes stay within 1.05 game units of home, avoid scene rectangles, pause to listen as the player approaches, and update the E-to-talk location. Source: https://github.com/Mugen87/yuka
- Rapier 0.21.0 (Apache-2.0): physically simulated, capped training props in Hollow Crown and Titan Foundry, loaded only on those worlds. https://github.com/dimforge/rapier
- Vite (MIT): build and development. https://github.com/vitejs/vite
- Lucide (ISC, with bundled notices): locally bundled icons. https://github.com/lucide-icons/lucide

Yuka is a local client-side game mechanic. It never receives saved memories, letters, passphrases or remote prompts; the game state machine remains authoritative. Navigation is transient rather than persisted.

Run npm install, npm run npc:check, npm test, npm run build and npm run dev on a network-connected checkout. Approach Iris in Neo Elysium or Ada in 1889 and verify that the character stops and keyboard/click/VR interactions follow its visible position. Also test reduced motion and portal remounts.

The isolated navigator tests use a minimal Yuka-compatible fake to exercise route safety, bounding, proximity pauses and wiring. They do not prove the actual npm package bundle or a physical Quest run. Those are **still unverified**.

## Optional art: supported but not shipped by default
- Kenney CC0 3D assets from verified pinned developer downloads (npm run assets:fetch). No third-party runtime CDN. See ASSETS.md.
- Khronos glTF Sample Assets Fox (mixed CC0 / CC BY 4.0, licensed and attributed, npm run assets:animated). See ANIMATED_ASSET_LICENSE.md.

## Future candidates: NOT INTEGRATED
- Meta IWSDK 1.0 (MIT) https://github.com/facebook/immersive-web-sdk : Quest emulation, grabbing, locomotion and spatial UI. Test an isolated scene first; its required super-three alias may conflict with the current Three.js runtime.
- Full game-wide Rapier collisions / combat: the current integration is a bounded interaction gallery, not physics-based enemy AI.
- three-mesh-bvh (MIT) https://github.com/gkjohnson/three-mesh-bvh : accelerate complex imported mesh raycasts if a benchmark justifies its overhead.
- More Kenney CC0 environment kits https://kenney.nl/assets : install as pinned same-origin files and verify source provenance.

Do not copy copyrighted manhwa worlds, Pacific Rim designs, or other franchise characters. Preserve open-source notices. No asset or library integration by itself certifies a complete VR game, live Meta model use, or hackathon submission readiness. Full npm tests, Vite build, browser visual QA, Quest testing, and Meta API demo remain separate gates.
