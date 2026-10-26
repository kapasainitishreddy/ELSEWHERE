import {loadState,saveState,WORLDS} from './game.js';

/** Portable, explicitly exported stories. Never upload implicitly. */
export function createBackup(state,at=new Date().toISOString()){
  return JSON.stringify({format:'syrava-elsewhere-timeline',schema:1,exportedAt:at,state},null,2);
}
export function readBackup(raw){
  if(typeof raw!=='string'||raw.length>150_000)throw new Error('This backup is too large or invalid.');
  let backup;
  try{backup=JSON.parse(raw);}catch{throw new Error('The file is not valid JSON.');}
  if(backup?.format!=='syrava-elsewhere-timeline'||backup?.schema!==1||!backup.state||backup.state.version!==1||!WORLDS[backup.state.world])throw new Error('This is not an ELSEWHERE timeline backup.');
  const store={getItem:()=>JSON.stringify(backup.state)};
  return loadState(store); // applies normal size bounds and content validation
}
