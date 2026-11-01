/** Honest labels for where a session lives and where optional dialogue travels. */
const providerName=label=>label==='Meta Model API'?'META':String(label||'REMOTE MODEL').toUpperCase();
export function remoteRequestTimeout(providerTimeoutMs){return Math.min(65_000,Math.max(12_000,Number(providerTimeoutMs)||12_000)+5_000);}
export function privacyIndicator({guestMode=false,cloudEnabled=false,localAiEnabled=false,remoteProviderLabel='Meta Model API'}={}){
 if(cloudEnabled){const name=providerName(remoteProviderLabel);return guestMode?`GUEST · NOT SAVED · ${name} TEXT LEAVES DEVICE`:`${name} CLOUD · TEXT LEAVES DEVICE`;}
 if(localAiEnabled)return guestMode?'GUEST · NOT SAVED · ON-DEVICE MODEL':'ON-DEVICE MODEL · LOCAL ONLY';
 return guestMode?'GUEST · NOT SAVED':'PRIVATE LOCAL WORLD';
}

/** Dialogue status always carries the save boundary as well as its runtime. */
export function dialogueStatus({guestMode=false,source='authored',remoteProviderLabel='Meta Model API'}={}){
 const persistence=guestMode?'GUEST · NOT SAVED':'ENCRYPTED SAVE';
 const runtime={
  authored:'LOCAL · AUTHORED',
  'local-model':'ON-DEVICE AI',
  'meta-enabled':'META CLOUD ENABLED',
  'meta-response':'META CLOUD RESPONSE',
  'meta-fallback':'META ATTEMPTED · LOCAL FALLBACK',
  support:'SUPPORT INFORMATION',
  'remote-enabled':`${providerName(remoteProviderLabel)} CLOUD ENABLED`,
  'remote-response':`${providerName(remoteProviderLabel)} CLOUD RESPONSE`,
  'remote-fallback':`${providerName(remoteProviderLabel)} ATTEMPTED · LOCAL FALLBACK`
 }[source]||'LOCAL · AUTHORED';
 return `${runtime} · ${persistence}`;
}
