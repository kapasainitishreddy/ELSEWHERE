/**
 * Local-only NPC navigation powered by Yuka's MIT-licensed steering model.
 * Meshes, interaction targets and story state remain owned by the host.
 * Upstream: https://github.com/Mugen87/yuka (MIT)
 */
export const NPC_PATROL_RADIUS = 1.05;

function validPoint(point) {
  return point && Number.isFinite(point.x) && Number.isFinite(point.z);
}

/** Prevent actors from intersecting the existing coarse collision proxies. */
export function navIsWalkable(point, rects = [], padding = .42) {
  if (!validPoint(point)) return false;
  return !rects.some(rect => {
    if (!Array.isArray(rect) || rect.length !== 4 || !rect.every(Number.isFinite)) return false;
    const [x0, x1, z0, z1] = rect;
    return point.x > x0 - padding && point.x < x1 + padding && point.z > z0 - padding && point.z < z1 + padding;
  });
}

/** Stable stops for every actor, not a random route after each state refresh. */
export function navPatrolStops({id = 'citizen', x, z}, radius = NPC_PATROL_RADIUS) {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return [];
  const hash = [...String(id)].reduce((n, char) => (Math.imul(n, 31) + char.charCodeAt(0)) >>> 0, 23);
  const phase = (hash % 360) * Math.PI / 180;
  const r = Math.max(0, Math.min(NPC_PATROL_RADIUS, Number.isFinite(radius) ? radius : 0));
  return [0, 2, 1, 3].map((step, index) => ({
    x: x + Math.cos(phase + step * Math.PI / 2) * r * (index % 2 ? .6 : .9),
    z: z + Math.sin(phase + step * Math.PI / 2) * r * (index % 2 ? .6 : .9)
  }));
}

/**
 * One tiny, independent Yuka steering vehicle per active actor.
 * YUKA is injected so core constraints can be tested without a renderer.
 * This adapter never touches local storage, saves, dialogue, or any network.
 */
export function createNpcNavigator(YUKA, {id, x, z, rects = [], radius = NPC_PATROL_RADIUS} = {}) {
  if (!YUKA?.Vehicle || !YUKA?.Vector3 || !YUKA?.ArriveBehavior || !Number.isFinite(x) || !Number.isFinite(z)) {
    throw new TypeError('NPC navigation requires Yuka and a finite home position');
  }
  const home = {x, z};
  const vehicle = new YUKA.Vehicle();
  vehicle.position.set(x, 0, z);
  vehicle.maxSpeed = .94;
  vehicle.maxForce = 3.4;
  vehicle.updateOrientation = false;
  const target = new YUKA.Vector3(x, 0, z);
  vehicle.steering.add(new YUKA.ArriveBehavior(target, 1.3, .12));
  const stops = navPatrolStops({id, x, z}, radius).filter(point => navIsWalkable(point, rects));
  const route = stops.length ? stops : [home];
  let next = 0;

  function step(delta, traveler = null, reducedMotion = false) {
    const dt = Number.isFinite(delta) ? Math.max(0, Math.min(delta, .05)) : 0;
    const close = validPoint(traveler) && Math.hypot(traveler.x - vehicle.position.x, traveler.z - vehicle.position.z) < 4.5;
    if (reducedMotion || dt === 0 || close) {
      // The interaction planes are attached to the model; the player can talk without chasing it.
      vehicle.velocity.set(0, 0, 0);
      target.set(vehicle.position.x, 0, vehicle.position.z);
      return {x: vehicle.position.x, z: vehicle.position.z, walking: false, listening: Boolean(close)};
    }

    let waypoint = route[next];
    if (Math.hypot(vehicle.position.x - waypoint.x, vehicle.position.z - waypoint.z) < .19) {
      next = (next + 1) % route.length;
      waypoint = route[next];
    }
    target.set(waypoint.x, 0, waypoint.z);
    const oldX = vehicle.position.x;
    const oldZ = vehicle.position.z;
    vehicle.update(dt);
    const dx = vehicle.position.x - x;
    const dz = vehicle.position.z - z;
    const dist = Math.hypot(dx, dz);
    const limit = Math.max(0, Math.min(NPC_PATROL_RADIUS, Number.isFinite(radius) ? radius : 0));
    if (dist > limit && dist > 0) {
      vehicle.position.set(x + dx / dist * limit, 0, z + dz / dist * limit);
      vehicle.velocity.set(0, 0, 0);
    }
    if (!navIsWalkable(vehicle.position, rects)) {
      vehicle.position.set(oldX, 0, oldZ);
      vehicle.velocity.set(0, 0, 0);
      next = (next + 1) % route.length;
    }
    const moved = Math.hypot(vehicle.position.x - oldX, vehicle.position.z - oldZ) > .0005;
    return {x: vehicle.position.x, z: vehicle.position.z, walking: moved, listening: false};
  }

  return {step, home: {...home}, stopCount: route.length};
}
