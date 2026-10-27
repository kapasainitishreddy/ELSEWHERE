/** Session-only VR comfort. No headset measurements or settings leave the device. */
export const COMFORT_PRESETS = Object.freeze({
 gentle:Object.freeze({label:'Gentle · 30° snap',snapDegrees:30,teleportDistance:11,rayDistance:11}),
 seated:Object.freeze({label:'Seated · reach farther',snapDegrees:30,teleportDistance:16,rayDistance:16}),
 standard:Object.freeze({label:'Standard · 45° snap',snapDegrees:45,teleportDistance:14,rayDistance:14})
});
export const DEFAULT_COMFORT='gentle';
export const comfortPreset = id=>COMFORT_PRESETS[id]||COMFORT_PRESETS[DEFAULT_COMFORT];
export const comfortTurn = (axis,armed,preset=DEFAULT_COMFORT)=>{
 const magnitude=Number.isFinite(axis)?Math.abs(axis):0;
 if(magnitude<.35)return {armed:true,radians:0};
 if(!armed || magnitude<=.8)return {armed:false,radians:0};
 const degrees=comfortPreset(preset).snapDegrees;
 return {armed:false,radians:-Math.sign(axis)*(degrees*Math.PI/180)};
};
export function walkableLanding({x,z,source,distance,rects=[],limit=11}){
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(distance))return false;
 if(distance<.25||distance>limit)return false;
 if(x < -18 || x > 18 || z < -18 || z > 17)return false;
 if(!Array.isArray(rects))return false;
 // A predictable half-meter safety margin prevents landing inside set dressing.
 return !rects.some(r=>Array.isArray(r)&&r.length===4&&x>=r[0]-.5&&x<=r[1]+.5&&z>=r[2]-.5&&z<=r[3]+.5);
}
