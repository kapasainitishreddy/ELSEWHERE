/** Optional, explicitly installed real skinned animation asset, never fetched at runtime.
 * Khronos' Fox contains Survey, Walk and Run animation clips and requires attribution.
 */
export const COMPANION_SOURCE=Object.freeze({
 project:'Khronos glTF Sample Assets: Fox',
 repo:'KhronosGroup/glTF-Sample-Assets',
 revision:'8f492390ddc7a2ae221a1369ef560589cf8c70fb',
 path:'Models/Fox/glTF-Binary/Fox.glb',
 sha:'1ef5c0d05658caea339680fe581aa2c8302b3365',
 size:162852,
 license:'CC0-1.0 AND CC-BY-4.0',
 attribution:'Model: PixelMannen (CC0); rigging and animation: tomkranis (CC BY 4.0); glTF conversion: AsoboStudio and scurest (CC BY 4.0)'
});
export const COMPANION_INDEX='/assets/companions/index.json';
export function validCompanionIndex(x){return Boolean(x&&x.version===1&&x.revision===COMPANION_SOURCE.revision&&x.sourceSha===COMPANION_SOURCE.sha&&x.installed===true);}
export function companionMoodDistance(d){
 return !Number.isFinite(d)||d<0?'survey':d<2.8?'survey':d<8?'walk':'run';
}
