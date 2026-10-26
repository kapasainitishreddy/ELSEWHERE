/**
 * One voluntary action from an imaginary future, returned to real life.
 * This is a private, non-clinical note, never a diagnosis, score or streak.
 * It is saved only as part of the player's encrypted local/branch vault.
 */
export const COMPASS_FOCI = Object.freeze([
  {id:'create',label:'Create something',example:'Write a few lines or make one small sketch'},
  {id:'connect',label:'Connect with someone',example:'Send a kind message to someone you trust'},
  {id:'rest',label:'Make room to rest',example:'Take a comfortable break without a task to finish'},
  {id:'explore',label:'Discover something',example:'Learn one new thing just because it interests you'}
]);
const allowed=new Set(COMPASS_FOCI.map(f=>f.id));
export function initialCompass(){return {focus:null,step:'',status:'empty'};}
export function sanitizeCompass(value){
  const focus=typeof value?.focus==='string'&&allowed.has(value.focus)?value.focus:null;
  const step=typeof value?.step==='string'?value.step.trim().slice(0,160):'';
  if(!focus||step.length<4)return initialCompass();
  return {focus,step,status:value.status==='tried'?'tried':'planned'};
}
export function prepareCompass(focus,step){
  if(!allowed.has(focus))return {ok:false,error:'Choose a focus that feels right to you.'};
  if(typeof step!=='string'||step.trim().length<4||step.trim().length>160)
    return {ok:false,error:'Write a small, specific action in 4 to 160 characters.'};
  return {ok:true,compass:{focus,step:step.trim(),status:'planned'}};
}
export function updateCompass(state,operation,{focus,step}={}){
  if(state.world!=='self')return {ok:false,state,error:'Visit your future self to leave an intention.'};
  let compass,heading;
  if(operation==='plan'){
    const prepared=prepareCompass(focus,step);if(!prepared.ok)return {...prepared,state};
    compass=prepared.compass;heading='A small intention, privately kept';
  }else if(operation==='tried'){
    if(state.compass?.status!=='planned')return {ok:false,state,error:'There is no open intention to reflect on.'};
    compass={...sanitizeCompass(state.compass),status:'tried'};
    heading='You gave it a try. That counts as an experience, not a score.';
  }else if(operation==='clear'){
    compass=initialCompass();heading='A new page is ready whenever you are.';
  }else{return {ok:false,state,error:'Unknown intention action.'};}
  const next=structuredClone(state);
  next.compass=compass;next.revision+=1;
  // No private intention text in the public in-game event or history log.
  return {ok:true,state:next,event:{title:heading,detail:'A voluntary choice in your encrypted private journal.'}};
}
