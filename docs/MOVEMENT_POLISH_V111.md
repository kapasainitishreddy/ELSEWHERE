# Movement polish · ELSEWHERE 1.11.1

The previous player was a rectangle/capsule puppet with immediate speed changes. Secondary acting also integrated bone angles repeatedly. The new implementation:
- Reuses the original Three.js skeletal humanoid for the traveler, including real blended idle/walk tracks, rather than a separate block figure.
- Uses a pure, frame-rate-independent acceleration/braking solver shared by keyboard and gamepad.
- Moves relative to the camera orbit orientation, normalizes diagonal inputs, slides along collision boundaries, and turns by the shortest heading arc.
- Uses a damped third-person camera target that preserves manual orbit/zoom. It never moves the headset camera in VR.
- Bounds extra head and shoulder offsets after the AnimationMixer, avoiding accumulating pose drift; reduced-motion is supported.
- Adds a compact first-play guide and E-to-push hints for physical objects.
- Keeps all movement local and absent from saved state or analytics.

Tests: `npm run movement:check`, `npm run world:check`, `npm test`, `npm run build`. Run the guest demo in Chrome/Brave and inspect foot sliding, mouse orbit, stopping distance, world travel, colliding against buildings, mobile buttons, and Quest controller comfort. Visual and headset quality are not proven by source-level tests.
