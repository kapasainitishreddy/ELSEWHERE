# Tactile Worlds · 1.10 source release

## In the playable game
- Hollow Crown and Titan Foundry each gain a small standalone physics gallery at x=8.4, z=5.8 (near the visitor's arrival). Three collidable relics rest in an original circular plinth.
- **Approach and press E, click a relic, or aim with a VR controller trigger** to apply a capped physical impulse. Crates tumble, collide with the floor and invisible boundary walls, and settle naturally. Nearby prompts follow the physical bodies.
- Rapier `@dimforge/rapier3d-compat` 0.21.0 (Apache-2.0) loads **only** upon entering the dungeon or mech area. A failed physics engine import leaves the existing playable world intact.
- A fixed 1/60 step with at most three updates per animation frame limits physics load. Every world exit disposes the physics instance, meshes and interaction registrations.
- A trained actor also faces their walking direction and turns toward a nearby listener instead of sliding sideways.

## Safety and honesty
This is an **optional interaction gallery**, not full-body VR grappling or true destructible mech combat. Canonical battle damage, resources, time, memories, letters, and saves remain governed by the existing deterministic game engine. There are no tracking calls, third-party run-time asset requests, screen shakes, or new user permissions. Reduced-motion players get smaller impulses and no added torque.

## Tests
`npm install`, `npm run world:check`, `npm test`, `npm run build`. Then use desktop mouse, E/gamepad and physical Quest controllers in both scenes. Verify collision, repeatedly remounting a scene during asynchronous WASM load, performance, reduced-motion settings, and a successful return through the same portal. Network-restricted source edits cannot substitute for a fresh install, full Vite build or device testing.

## Upstream
Rapier source: https://github.com/dimforge/rapier (Apache-2.0).
Yuka: https://github.com/Mugen87/yuka (MIT).
Meta IWSDK is **not installed into the production Three runtime**; its official super-three alias requirement requires separate integration tests before replacing a functional XR renderer.
