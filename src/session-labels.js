/** Honest labels for where a session lives and where optional dialogue travels. */
export function privacyIndicator({guestMode=false,cloudEnabled=false,localAiEnabled=false}={}){
 if(cloudEnabled)return guestMode?'GUEST · NOT SAVED · META TEXT LEAVES DEVICE':'META CLOUD · TEXT LEAVES DEVICE';
 if(localAiEnabled)return guestMode?'GUEST · NOT SAVED · ON-DEVICE MODEL':'ON-DEVICE MODEL · LOCAL ONLY';
 return guestMode?'GUEST · NOT SAVED':'PRIVATE LOCAL WORLD';
}

/** Dialogue status always carries the save boundary as well as its runtime. */
export function dialogueStatus({guestMode=false,source='authored'}={}){
 const persistence=guestMode?'GUEST · NOT SAVED':'ENCRYPTED SAVE';
 const runtime={
  authored:'LOCAL · AUTHORED',
  'local-model':'ON-DEVICE AI',
  'meta-enabled':'META CLOUD ENABLED',
  'meta-response':'META CLOUD RESPONSE',
  'meta-fallback':'META ATTEMPTED · LOCAL FALLBACK',
  support:'SUPPORT INFORMATION'
 }[source]||'LOCAL · AUTHORED';
 return `${runtime} · ${persistence}`;
}
