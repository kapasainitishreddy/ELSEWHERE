# Open-source art pipeline · Chronal Polish 0.4

## Default build: self-contained, private

The game **bundles 12 selected icons** from [Lucide](https://github.com/lucide-icons/lucide), released under the ISC license. They are redistributed as local SVG files in `public/assets/icons/`, with the copyright notice in `public/assets/icons/LICENSE-lucide.txt`. The five environments and core characters remain original procedural Three.js artwork if no optional 3D packs are installed. They **never fetch a model from a third party during gameplay**.

Three.js and its official loaders are MIT-licensed (`three` from npm, installed by the developer before building). Vite is MIT-licensed. Their notices are included in the normal npm distribution process.

## Optional real CC0 3D props

[Kenney](https://kenney.nl/assets) publishes original low-poly packs under **CC0-1.0**, suitable for commercial games. The default game includes placements for 24 hand-picked models from the Space, City, Furniture, Castle, and Mini Dungeon collections. The standalone [Tiny Game Engine CC0 mirror](https://github.com/Hidencod/tge-assets) provides self-contained GLB exports and a browsable catalog.

On a **network-connected developer machine**, after cloning the project:

```bash
npm install
npm run assets:fetch
# Or install only one world's set:
npm run assets:fetch -- --world dungeon
npm run test
npm run build
```

The installer in `scripts/vendor-kenney.mjs`:

1. Downloads from the **pinned upstream git commit** `7be9b573bc74f32ed766b44b3f46550d02ca83b5` (not floating `main`).
2. Validates each file's size, binary glTF magic and expected Git blob SHA before writing it.
3. Writes an exact allowlist to `public/assets/kenney/index.json`.
4. Makes the game load only its **same-origin local copies**, with a procedural fallback if none are available.
5. Never reads a user's save, letter, passphrase, NPC memories, or private information.

To audit the local pack, read `src/asset-catalog.js` and the `index.json` allowlist. Files **are not included in GitHub main or in the default ZIP until the developer explicitly vendors them**. Do not describe the CC0 3D models as already bundled in the repository by default.

### Where the CC0 models appear

| World | Imported CC0 details when installed |
| --- | --- |
| Neo Elysium | City silhouettes, world tree and floating cargo train |
| The Other You | Sofa, books, lamp, plant and bookshelf |
| The First Spark | Research table, books, castle tower and ancient tree |
| Hollow Crown | Dungeon pillars, gate, treasure chest, crystal and orc |
| Titan Foundry | Sci-fi consoles, defense turrets, shuttle and crystals |

The model loader can use its included idle animations when provided. Neither GLB models nor scripted conversations are fetched across domains at game runtime.

## Licenses / provenance

| Item | Author | License | Origin |
| --- | --- | --- | --- |
| 12 HUD and world icons | Lucide Contributors | ISC; includes notices for Feather-derived icons | `lucide-icons/lucide/icons/*.svg` |
| Optional 24 GLB models | Kenney | CC0-1.0 | Kenney original packs mirrored by `Hidencod/tge-assets` |
| Game engine and official loader | Three.js Contributors | MIT | `three` |
| Web toolchain | Vite Contributors | MIT | `vite` |
| Sky, portals, animated motes, debris, story, game logic | Syrava | Project MIT | Original source |

This project uses **no copyrighted Pacific Rim characters, branded mechs, manhwa artwork, or proprietary game maps**. All cinematic comparisons are inspiration only.

## Performance and accessibility

- Background shaders use one sky draw call, one motes draw call and one instanced geometry draw call per world.
- Smaller screens and XR sessions use lower effect counts; reduced-motion users get static effects.
- No heavy full-frame bloom pass is forced onto a headset.
- The procedural fallback remains available for slow devices or missing CC0 files.
- The GLB pack and VR quality need physical Quest/headset visual testing before claiming production readiness.

## Privacy caveat

The assets are all public game content. Their licensing and hash verification do not independently certify the app's overall security. Gameplay privacy still depends on the vault, hosting environment, loaded extensions, browser and device. There is no CDN, analytics endpoint, or automatic public asset download in the production game. Running `npm run assets:fetch` is an explicit **developer-side network operation**.


## Optional animated creature (v1.0)

Run `npm run assets:animated` on a network-connected developer machine to install the Khronos
glTF Sample Assets Fox (`Survey`, `Walk`, `Run` skeletal animation). It is verified against a pinned
Git blob SHA and served only from `/assets/companions/fox.glb`. Mixed CC0 and CC BY 4.0
credits, source links and license details: [ANIMATED_ASSET_LICENSE.md](ANIMATED_ASSET_LICENSE.md).
The binary is **not included by default**. The original project-authored skinned humanoid
characters always work even if this optional pack is missing.
