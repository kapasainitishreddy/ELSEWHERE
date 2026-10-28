/** Keep decorative world signage near enough to read without crowding the vista. */
export const SCENE_SIGN_VISIBILITY_RADIUS=14;
const radiusSquared=SCENE_SIGN_VISIBILITY_RADIUS**2;

export function shouldShowSceneSign(distanceSquared,interactive=false){
 return interactive || (Number.isFinite(distanceSquared) && distanceSquared<=radiusSquared);
}
