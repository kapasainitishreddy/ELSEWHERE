/**
 * Quiet Lives: small deterministic NPC agendas that progress when the player makes
 * DISTINCT meaningful choices. The cast does not require a server, model, clock,
 * or an always-open tab. Travelling between portals cannot farm progress.
 * Each parallel reality owns a separate ledger of events and actor memories.
 */
export const AGENDAS = Object.freeze({
  iris: {world:'future',name:'Iris Vale',goal:'Preserve every version of the city'},
  ada: {world:'past',name:'Ada Voss',goal:'Keep tomorrow out of a single owner’s hands'},
  witness: {world:'dungeon',name:'The Hollow Witness',goal:'Recover stolen hours without creating a new war'},
  sol: {world:'mech',name:'Commander Sol',goal:'Evacuate civilians before the foundry falls'},
  elder: {world:'self',name:'The Other You',goal:'Remember why a life was worth living'}
});
const STAGES=[2,5,9];
const bound=(n,max)=>Number.isInteger(n)?Math.max(0,Math.min(max,n)):0;
export const initialSociety=()=>({beats:0,triggers:[],stages:Object.fromEntries(Object.keys(AGENDAS).map(k=>[k,0])),events:[]});
export function sanitizeSociety(raw){
 const s=initialSociety();if(!raw||typeof raw!=='object')return s;
 s.beats=bound(raw.beats,64);
 s.triggers=Array.isArray(raw.triggers)?[...new Set(raw.triggers.filter(t=>typeof t==='string'&&/^[a-z0-9-]{2,60}$/.test(t)))].slice(0,64):[];
 for(const id of Object.keys(AGENDAS))s.stages[id]=bound(raw.stages?.[id],3);
 s.events=Array.isArray(raw.events)?raw.events.filter(e=>e&&AGENDAS[e.actor]&&typeof e.title==='string'&&typeof e.detail==='string')
   .slice(-18).map(e=>({actor:e.actor,stage:bound(e.stage,3),title:e.title.slice(0,80),detail:e.detail.slice(0,280)})):[];
 return s;
}
function sceneFor(state,id,stage){
 if(id==='ada'){
  if(stage===1)return {title:'The night school opens',detail:'Ada gathered apprentices under the clocktower. Her lessons continue while you explore other centuries.'};
  if(stage===2)return state.fate==='patent'?
   {title:'The workshop goes underground',detail:'Ada copied every drawing she could remember before your patent lawyers arrived.'}:
   {title:'Blueprints for everyone',detail:'Ada is teaching mechanics to repair the strange machines you brought into history.'};
  return {title:'The clockmakers refuse the contract',detail:'A guild forms around Ada. The children of workers no longer owe their mornings to Vey.'};
 }
 if(id==='iris'){
  if(stage===1)return {title:'The archive of missing hours',detail:'Iris secretly starts recording which lives disappear when hours are bought or stolen.'};
  if(stage===2)return state.flags['time-heist-future']?
   {title:'The Archivist publishes the theft',detail:'Iris has documented the Chronal Exchange breach. Your name is in the sealed evidence.'}:
   {title:'Two skylines in one photograph',detail:'Iris discovers the outline of a building that exists only in another timeline.'};
  return {title:'A city reads its own history',detail:'Iris opens the hidden ledger so citizens can see the cost of each celebrated invention.'};
 }
 if(id==='witness'){
  if(stage===1)return {title:'The Witness leaves a second key',detail:'A hidden inscription points to a peaceful way into the Hollow Crown.'};
  if(stage===2)return {title:'The Warden writes a name',detail:'The Witness finds a list of people whose stolen hours created the armor of the Warden.'};
  return {title:'A quiet throne',detail:'The Witness gathers people who want the crown to become a memorial rather than a weapon.'};
 }
 if(id==='sol'){
  if(stage===1)return {title:'The first rescue shuttle',detail:'Sol sends engineers to the evacuation corridor without waiting for your arrival.'};
  if(stage===2)return {title:'The pilot without a weapon',detail:'Sol trains technicians to protect the corridor even if ATLAS never deploys.'};
  return {title:'The last corridor stays open',detail:'Sol establishes shelters and refuses an order to abandon the outer districts.'};
 }
 if(stage===1)return {title:'The unsent letter',detail:'Your older self writes a reply but leaves the envelope unsealed. There is still time to change it.'};
 if(stage===2)return state.chronal.futureDebt>0?
  {title:'A quiet hour goes missing',detail:'The Other You marks a blank space on the calendar where tomorrow was borrowed.'}:
  {title:'An ordinary morning',detail:'The Other You remembers the value of a day without prizes, fortunes, or names on towers.'};
 return {title:'A second cup of tea',detail:'Your older self makes room at the table for someone who chose a different future.'};
}
function addMemory(state,actor,event){
 const memory=state.cast?.[actor];if(!memory)return;
 if(!memory.memories.includes(event.detail))memory.memories.push(event.detail);
 memory.memories=memory.memories.slice(-8);
 memory.mood=state.flags['time-heist-future']&&actor==='iris'?'wary':memory.mood;
}
export function advanceSociety(state,actionId){
 const s=state.society;
 if(!s||typeof actionId!=='string'||s.triggers.includes(actionId))return [];
 if(s.triggers.length>=64)return [];
 s.triggers.push(actionId);s.beats++;
 const changes=[];
 for(const [actor,agenda] of Object.entries(AGENDAS)){
  if(!(state.worldVisits?.[agenda.world]>0))continue;
  const stage=s.stages[actor];if(stage>=3||s.beats<STAGES[stage])continue;
  const entry={actor,stage:stage+1,...sceneFor(state,actor,stage+1)};
  s.stages[actor]=stage+1;s.events.push(entry);addMemory(state,actor,entry);
  changes.push(entry);
 }
 s.events=s.events.slice(-18);
 return changes;
}
export function societyOptions(s){
 const options={
  future:{id:'society-archive',actor:'iris',price:2,title:'Carry the secret archive',detail:'Spend 2 fictional hours helping Iris release evidence of altered histories. Unlock a public archive.'},
  past:{id:'society-apprentices',actor:'ada',price:4,title:'Give Ada four hours for the apprentices',detail:'Volunteer at the clockhouse and protect an entire generation’s morning.'},
  dungeon:{id:'society-oath',actor:'witness',price:3,title:'Repair the Witness’s broken oath',detail:'Spend three hours hearing every name taken by the Chrono Crown. Reduce the paradox.'},
  mech:{id:'society-evacuation',actor:'sol',price:3,title:'Help Sol open the evacuation route',detail:'Give three hours to guide civilians through the foundry, before firing a weapon.'},
  self:{id:'society-letter',actor:'elder',price:1,title:'Answer the unsent letter',detail:'Spend an hour listening to a possible future self without asking for a prediction.'}
 };
 const quest=options[s.world];if(!quest||!s.society||s.society.stages[quest.actor]<1)return [];
 return [{id:quest.id,actor:quest.actor,title:quest.title,detail:quest.detail,disabled:!!s.flags[quest.id]||s.chronal.hours<quest.price||quest.id==='society-oath'&&!s.power,
  reason:s.flags[quest.id]?'Already completed':s.chronal.hours<quest.price?`Requires ${quest.price} fictional hours`:'Learn a power before repairing the oath.'}];
}
export function performSocietyQuest(s,id){
 const quest=societyOptions(s).find(o=>o.id===id&&!o.disabled);if(!quest)return null;
 const effects={
  'society-archive':{hours:2,trust:12,fame:2,stars:1,title:'The archive belongs to everyone',detail:'Iris releases the evidence without publishing your private letter. A public reading room appears in Neo Elysium.'},
  'society-apprentices':{hours:4,trust:16,fame:0,stars:1,title:'A morning that cannot be sold',detail:'Ada’s apprentices keep their clockhouse and build a free repair shop in 1889.'},
  'society-oath':{hours:3,trust:8,fame:0,stars:1,title:'The names return to the crown',detail:'The Witness recites the lost names. A little paradox dissolves, but the histories remain.'},
  'society-evacuation':{hours:3,trust:20,fame:4,stars:1,title:'The foundry doors stay open',detail:'Sol takes the civilians through a service corridor. This rescue does not depend on destroying an enemy.'},
  'society-letter':{hours:1,trust:6,fame:0,stars:1,title:'The answer was not a prediction',detail:'The Other You puts down the ledger and stays at the table for an ordinary conversation.'}
 };
 const x=effects[id];if(!x)return null;
 s.chronal.hours-=x.hours;s.trust+=x.trust;s.fame+=x.fame;s.stars+=x.stars;
 if(id==='society-oath')s.chronal.paradox=Math.max(0,s.chronal.paradox-6);
 const actor=quest.actor;
 const memory=s.cast?.[actor];if(memory){memory.mood='grateful';memory.affinity=Math.min(100,memory.affinity+18);memory.memories.push(x.detail);memory.memories=memory.memories.slice(-8);}
 return {title:x.title,detail:x.detail};
}
