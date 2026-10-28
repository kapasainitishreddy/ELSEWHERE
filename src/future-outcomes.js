/** Shared layout and walkability contract for 2087 outcome landmarks. */
export const FUTURE_PORTAL_SPACING=5.7;
export const FUTURE_PORTAL_Z=-20.5;
export const FUTURE_PORTAL_APPROACH=Object.freeze({minZ:-22,maxZ:-18,halfWidth:2.4});

/** Portal spacing is shared by mesh placement and clearance tests. */
export function portalXAt(index,count){
 return (Number(index)-(Number(count)-1)/2)*FUTURE_PORTAL_SPACING;
}

/** Bounds are conservative world-space X/Z extents of each procedural landmark. */
export const FUTURE_OUTCOME_LAYOUTS=Object.freeze({
 gift:Object.freeze({offsetX:0,offsetZ:0,bounds:null,collisionRect:null}),
 patent:Object.freeze({
  offsetX:3.8,offsetZ:-2,
  bounds:Object.freeze({minX:11.2,maxX:18.8,minZ:-28.4,maxZ:-21.42}),
  collisionRect:Object.freeze([11.2,18.8,-28.4,-21.42])
 }),
 auction:Object.freeze({
  offsetX:-4.7,offsetZ:-5,
  bounds:Object.freeze({minX:-20.2,maxX:-11.2,minZ:-29.95,maxZ:-21.05}),
  collisionRect:Object.freeze([-20.2,-11.2,-29.95,-21.05])
 })
});

export function futureOutcomeCollisionRects(fate){
 const rect=FUTURE_OUTCOME_LAYOUTS[fate]?.collisionRect;
 return rect?[rect]:[];
}

export function overlaps(a,b){
 return a.minX<b.maxX&&a.maxX>b.minX&&a.minZ<b.maxZ&&a.maxZ>b.minZ;
}
