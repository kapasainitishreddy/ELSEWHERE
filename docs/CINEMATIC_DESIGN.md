# ELSEWHERE 1.1: The Living Canvas

## What changed

The first visual system treated ELSEWHERE as an analytics dashboard: a permanent 294px sidebar, a 365px story sidebar, dense tiny metrics and a nearly empty stage. It buried critical choices and conversation in a scrolling column and reduced the spatial world to a background.

The Living Canvas redesign separates **exploration**, **story**, and **memory**:

1. The 3D scene occupies the entire viewport with cinematic editorial type and only two primary actions.
2. All five worlds are reachable through the always-visible Portal Dock. The compact Atlas drawer shows advanced resources, memories, identity, and extra settings.
3. World decisions, characters, private correspondence, chronal trading, and future-self chat remain in a readable, closable narrative side sheet. This preserves the actual game rule engine rather than inventing demo-only interactions.
4. One contextual invitation surfaces the current story and what to do next.
5. A small time-currency HUD allows direct access to trading and keeps the privacy status visible. Real money and real time are never exchanged.

## Visual direction

Warm ivory typography, restrained theme accents, dimensional frosted surfaces, subtle grain, purposeful light, negative space and original vector scenic art. Each world has an individual palette: Neo Elysium (glacial teal), The Other You (amber), The First Spark (bronze), The Hollow Crown (violet), Titan Foundry (ember).

Five original SVG fallback scenes are located at `public/assets/vistas/*.svg`. Their source generator is `scripts/generate-vistas.py`. They are authored within this repository, include no third-party artwork or tracking, and fetch no external resources. The scenery is **not presented as a VR screenshot**. The app hides it once the actual WebGL experience mounts successfully and leaves it visible in text-only mode.

No cloud fonts, image CDNs, telemetry, or third-party artwork APIs are introduced. Existing Lucide icon notices and optional locally downloaded Kenney/Khronos asset license requirements remain unchanged.

## Interactions and accessibility

- Primary world CTA opens the story sheet; in 2046 it goes directly to the private future-self conversation.
- `Explore worlds` opens the Atlas. The Portal Dock goes directly between connected worlds.
- `Trade` opens the real chronal-exchange choices in the story sheet.
- Click/tap outside an open drawer or press Escape to close it. Buttons have accessible labels and focus feedback.
- Mobile uses a horizontally sized Portal Dock and a full-height story sheet. Actual touch movement controls appear when WebGL is ready.
- `prefers-reduced-motion` disables scenic arrival effects and decorative motion.
- The private vault and consent model are unchanged. Online Meta dialogue remains strictly opt-in, not “fully local.”

## Quality gates

- `node --test tests/*.test.mjs` for regressions and visual-shell source behavior.
- Check source UI previews at 1600x900 and 390x844, including story, Atlas, world changes and empty state.
- **Still required:** install Three.js and Vite, run `npm run build`, measure real WebGL draw calls and frame times, and validate actual Quest comfort and interaction reachability. Source-driven UI preview is not equivalent to those tests.
