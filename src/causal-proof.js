/**
 * Causal Replay: inspect the fictional simulation, not anybody's real future.
 * Never copy private letters, dialogue, memory cards or identity into receipts.
 * Previews call the game's actual transition function and discard the result.
 */
const FATES=Object.freeze({
 patent:{title:"Patent and license",impact:"Private towers and licensed inventions reshape Neo Elysium."},
 gift:{title:"Share with everyone",impact:"Public workshops and open knowledge reshape Neo Elysium."},
 auction:{title:"Sell to a bidder",impact:"A buyer changes the city, but the archive keeps unanswered questions."}
});
const INVENTIONS=Object.freeze({cell:"Aether Cell",oracle:"Clockwork Oracle",rail:"Skyrail Drive"});
const safeNumber=(n,max=9999999)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
const valid=(x,choices,otherwise="none")=>choices.includes(x)?x:otherwise;
const flag=(s,k)=>s?.flags?.[k]===true;
export function publicWorldSnapshot(s){
 const owned=Array.isArray(s?.owned)?s.owned:[];
 return {
  invention:valid(s?.invention,Object.keys(INVENTIONS)),
  fate:valid(s?.fate,Object.keys(FATES)),
  power:valid(s?.power,["phase","gravity","storm"]),
  credits:safeNumber(s?.credits),fame:safeNumber(s?.fame,999),trust:safeNumber(s?.trust,999),
  hours:safeNumber(s?.chronal?.hours,9999),
  debt:safeNumber(s?.chronal?.futureDebt,9999)+safeNumber(s?.chronal?.pastDebt,9999),
  paradox:safeNumber(s?.chronal?.paradox,9999),
  library:owned.includes("library"),residence:owned.includes("penthouse"),
  foundry:flag(s,"defend-city"),
  dungeon:valid(s?.dungeonOutcome,["victory","mercy","defeat","escaped"])
 };
}
/** A stable replay label, NOT cryptographic proof, security or a personal ID. */
export function causalReceipt(state){
 const data=JSON.stringify(publicWorldSnapshot(state));
 let hash=0x811c9dc5;
 for(let i=0;i<data.length;i++){hash^=data.charCodeAt(i);hash=Math.imul(hash,0x01000193)>>>0;}
 return "CW-"+hash.toString(16).toUpperCase().padStart(8,"0");
}
function worldOutcome(p){
 if(p.fate==="gift")return "People can work with the invention without buying a private license.";
 if(p.fate==="patent")return "Licensing concentrates power and puts the inventor's name on the skyline.";
 if(p.fate==="auction")return "The buyer gains control, while the archive preserves the decision.";
 if(p.invention!=="none")return "The prototype exists. Who owns it has not been decided.";
 return "The city still follows its original unwritten history.";
}
export function causalWorldAudit(state){
 const p=publicWorldSnapshot(state),fate=FATES[p.fate],invention=INVENTIONS[p.invention]||"No prototype yet";
 return {
  receipt:causalReceipt(state),
  status:fate?"ALTERED TIMELINE":p.invention!=="none"?"DECISION PENDING":"ORIGINAL TIMELINE",
  summary:worldOutcome(p),
  nodes:[
   {id:"past",year:"1889",title:"THE ORIGIN",headline:invention,
    detail:fate?fate.title+". "+fate.impact:p.invention!=="none"?"One decision will determine who inherits this invention.":"Visit 1889 to create a fictional invention.",active:p.invention!=="none"},
   {id:"self",year:"2046",title:"THE OTHER YOU",
    headline:p.fate==="patent"?"A celebrated possibility":p.fate==="gift"?"A shared possibility":p.fate==="auction"?"A purchased possibility":"An unwritten possibility",
    detail:fate?"The future-self character discusses a possible life shaped by this decision. It is fiction, not prediction.":"Meet one imagined future self, change the past and return.",active:!!fate},
   {id:"future",year:"2087",title:"NEO ELYSIUM",
    headline:p.library?"A city with a public library":p.fate==="gift"?"A city of open workshops":p.fate==="patent"?"A licensed skyline":p.fate==="auction"?"A city of hidden owners":"The original skyline",
    detail:(p.library?"You funded a permanent public space. ":"")+worldOutcome(p),active:!!fate||p.library},
   {id:"mech",year:"2199",title:"TITAN FOUNDRY",headline:p.foundry?"The breakwater survives":"A future still under threat",
    detail:p.foundry?"You completed a distinct foundry defense and the people remember.":"Defending the foundry is a separate player decision, not an automatic consequence of wealth.",active:p.foundry},
   {id:"dungeon",year:"∞",title:"THE HOLLOW CROWN",headline:p.power==="none"?"An unopened seal":p.power.toUpperCase()+" AWAKENED",
    detail:p.dungeon!=="none"?"The Warden encounter reached "+p.dungeon+".":"Powers, runes and mercy decisions remain local to this reality.",active:p.power!=="none"}
  ],facts:p
 };
}
const COMPARE=[
 ["invention","1889 prototype",v=>INVENTIONS[v]||"None"],
 ["fate","Who owns it",v=>FATES[v]?.title||"Undecided"],
 ["credits","Fictional credits",String],["fame","Fame",String],["trust","Public trust",String],
 ["library","Public library",v=>v?"Built":"Not built"],
 ["residence","Sky residence",v=>v?"Owned":"Not owned"],
 ["power","Dungeon power",v=>v==="none"?"Unchosen":v],
 ["foundry","Breakwater defense",v=>v?"Protected":"Unfinished"],
 ["hours","Hours available",String],["debt","Hours owed",String],["paradox","Paradox",String]
];
export function compareParallelWorlds(s){
 const x=s?.parallel;
 if(!x?.forked||!["prime","echo"].includes(x.active))return null;
 const opposite=x.active==="prime"?"echo":"prime",other=x.snapshots?.[opposite];
 if(!other||typeof other!=="object")return null;
 const current=publicWorldSnapshot(s),inactive=publicWorldSnapshot(other);
 const prime=x.active==="prime"?current:inactive,echo=x.active==="echo"?current:inactive;
 const rows=COMPARE.map(([key,label,format])=>({key,label,prime:format(prime[key]),echo:format(echo[key]),changed:prime[key]!==echo[key]}));
 return {
  current:x.active,
  primeReceipt:causalReceipt(x.active==="prime"?s:other),
  echoReceipt:causalReceipt(x.active==="echo"?s:other),
  changes:rows.filter(r=>r.changed).length,rows
 };
}
/** No write/persist: actual game applyAction is responsible for every possible delta. */
export function previewFates(state,applyAction){
 if(state?.world!=="past"||!Object.hasOwn(INVENTIONS,state?.invention||"")||state.fate||typeof applyAction!=="function")return [];
 const before=publicWorldSnapshot(state);
 return Object.entries(FATES).flatMap(([id,meta])=>{
  const result=applyAction(state,id);
  if(!result?.ok||!result.state)return [];
  const after=publicWorldSnapshot(result.state);
  return [{id,title:meta.title,detail:meta.impact,
   deltaCredits:after.credits-before.credits,deltaFame:after.fame-before.fame,deltaTrust:after.trust-before.trust,
   futureStatus:causalWorldAudit(result.state).nodes.find(n=>n.id==="future")?.headline,
   receipt:causalReceipt(result.state)}];
 });
}
