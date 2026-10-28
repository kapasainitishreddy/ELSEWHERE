/** Keep decorative world signage near enough to read without crowding the vista. */
export const SCENE_SIGN_VISIBILITY_RADIUS=14;
/** Keep action text close to the player; the nearby-E cue and hit proxies remain active. */
export const SCENE_ACTION_SIGN_VISIBILITY_RADIUS=9;
/** Limit the number of placards competing in the 3D view. */
export const MAX_VISIBLE_SCENE_SIGNS=3;

export function visibleSceneSignIndexes(entries){
 return new Set(entries
  .filter(({distanceSquared,interactive})=>shouldShowSceneSign(distanceSquared,interactive))
  .sort((a,b)=>a.distanceSquared-b.distanceSquared||a.index-b.index)
  .slice(0,MAX_VISIBLE_SCENE_SIGNS)
  .map(({index})=>index));
}

export function shouldShowSceneSign(distanceSquared,interactive=false){
 const radius=interactive?SCENE_ACTION_SIGN_VISIBILITY_RADIUS:SCENE_SIGN_VISIBILITY_RADIUS;
 return Number.isFinite(distanceSquared) && distanceSquared>=0 && distanceSquared<=radius**2;
}
