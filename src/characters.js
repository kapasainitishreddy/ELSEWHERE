/** Deterministic local role-play. NPCs remember facts and react to causal changes.
 * No network calls and no generated claims about the player's real future.
 */
export const CAST=Object.freeze({
 iris:{name:'Iris Vale',world:'future',role:'Archivist of missing histories',goal:'Keep knowledge free',fear:'A history controlled by one owner',voice:'precise, skeptical, compassionate'},
 ada:{name:'Ada Voss',world:'past',role:'Clockmaker and reluctant inventor',goal:'Make technology accessible to workers',fear:'The wealthy buying tomorrow',voice:'wry, practical, courageous'},
 witness:{name:'The Hollow Witness',world:'dungeon',role:'Keeper of the Chrono Crown',goal:'Prevent a second time war',fear:'Being forgotten by the Warden',voice:'ritualistic, melancholy, watchful'},
 sol:{name:'Commander Sol',world:'mech',role:'The last titan marshal',goal:'Defend the evacuation corridor',fear:'A pilot who enjoys causing harm',voice:'direct, brave, deeply tired'},
 warden:{name:'The Hollow Warden',world:'dungeon',role:'Opponent who guards stolen hours',goal:'Recover the crown and the time stolen from it',fear:'The player breaking a promise',voice:'formal, distrustful, methodical'},
 elder:{name:'The Other You',world:'self',role:'A fictional possible future',goal:'Let the traveler choose without claiming certainty',fear:'Becoming a prediction that traps the traveler',voice:'gentle, honest, self-questioning'}
});
const cap=(n,a,b)=>Math.max(a,Math.min(b,n));
export function initialCast(){return Object.fromEntries(Object.entries(CAST).map(([id,c])=>[id,{affinity:id==='warden'?-25:0,mood:'watchful',memories:[`I am ${c.role.toLowerCase()}.`],interactions:0,dialogue:[]}]));}
export function sanitizeCast(raw){
 const result=initialCast();if(!raw||typeof raw!=='object')return result;
 for(const id of Object.keys(result)){
  const r=raw[id];if(!r||typeof r!=='object')continue;
  result[id]={affinity:cap(Number.isFinite(r.affinity)?Math.floor(r.affinity):0,-100,100),mood:['watchful','hopeful','wary','grateful','angry','curious'].includes(r.mood)?r.mood:'watchful',interactions:cap(Number.isInteger(r.interactions)?r.interactions:0,0,9999),memories:Array.isArray(r.memories)?r.memories.filter(m=>typeof m==='string').slice(-8).map(m=>m.slice(0,210)):result[id].memories,dialogue:Array.isArray(r.dialogue)?r.dialogue.slice(-8).filter(x=>x&&typeof x.question==='string'&&typeof x.reply==='string').map(x=>({question:x.question.slice(0,240),reply:x.reply.slice(0,600)})):[]};
 }
 return result;
}
function remember(target,memory,affinity=0,mood='watchful'){
 target.affinity=cap(target.affinity+affinity,-100,100);target.mood=mood;
 if(!target.memories.includes(memory))target.memories.push(memory);
 target.memories=target.memories.slice(-8);
}
export function rememberWorldEvent(state,action,title){
 if(!state.cast)state.cast=initialCast();
 const c=state.cast;
 if(action==='patent'){remember(c.ada,'I warned the traveler about owning every key.',-18,'wary');remember(c.iris,'The traveler patented technology in 1889, rewriting corporate power.',-9,'wary');}
 if(action==='gift'){remember(c.ada,'The traveler released an invention to the workers.',22,'grateful');remember(c.iris,'The city archives show a discovery shared with everyone.',24,'grateful');}
 if(action==='auction'){remember(c.ada,'The traveler auctioned their invention to an unknown buyer.',-12,'wary');}
 if(action==='time-heist-past'){remember(c.ada,'The traveler robbed six hours from our clocktower. The factory workers lost a morning.',-28,'angry');remember(c.elder,'The clocktower in childhood is blank in my memories.',-15,'wary');}
 if(action==='time-heist-self'){remember(c.elder,'The traveler took five hours from another possible me. I can feel a missing conversation.',-24,'angry');remember(c.iris,'Two versions of the traveler are disputing ownership of a lost day.',-4,'wary');}
 if(action==='time-heist-future'){remember(c.iris,'The traveler stole seven hours from the Exchange. A stranger missed their train.',-35,'angry');remember(c.elder,'The future ledger lists me as an accomplice in the Exchange heist.',-10,'wary');}
 if(action==='time-atone'){remember(c.ada,'Six hours were returned. Not all of the damage could be undone.',10,'curious');remember(c.iris,'An anonymous restitution appeared in the time ledger.',9,'curious');remember(c.elder,'We tried to make amends. That choice counts, even without forgiveness.',6,'hopeful');}
 if(action==='time-steal-warden'){remember(c.warden,'The traveler stole five of my bound hours. I will remember.',-35,'angry');remember(c.witness,'I watched the traveler steal from the Warden.',-10,'wary');}
 if(action==='time-borrow-past'){remember(c.ada,'A childhood memory went blank when the traveler borrowed yesterday.',-6,'wary');remember(c.elder,'A photograph from childhood has disappeared.',-10,'wary');}
 if(action==='time-repay-past'){remember(c.ada,'The traveler returned borrowed hours to the past.',9,'grateful');remember(c.elder,'A lost photograph returned, with a faint scar.',8,'hopeful');}
 if(action==='time-borrow-future'){remember(c.elder,'The traveler borrowed hours from my future. I carry the debt.',-12,'wary');}
 if(action==='time-repay-future'){remember(c.elder,'The traveler honored the promise and returned my lost hours.',18,'grateful');}
 if(action==='defend-city'){remember(c.sol,'I watched the traveler protect the evacuation corridor.',20,'grateful');remember(c.iris,'The archivist records a pilot who saved strangers.',10,'hopeful');}
 if(action==='face-warden'){remember(c.warden,'The traveler entered my arena. I can learn their fighting style.',-2,'wary');}
 if(action==='warden-strike'||action==='warden-power')remember(c.warden,'I remember each repeated move and adapt to its rhythm.',-2,'wary');
 if(state.wardenBattle?.outcome==='victory')remember(c.witness,'The Warden was finally defeated in the arena.',6,'curious');
 if(state.wardenBattle?.outcome==='mercy')remember(c.witness,'The Warden laid down its sword without a final blow.',18,'hopeful');
 if(action==='guard-relic'){remember(c.warden,'The traveler protected the crown rather than selling it.',12,'curious');}
 if(action==='sell-relic'){remember(c.warden,'The traveler sold the crown to a stranger.',-15,'angry');}
 if(action==='fund-city'){remember(c.iris,'A public archive was funded and opened to the city.',30,'grateful');}
 if(action.startsWith('power-')){remember(c.witness,`The traveler chose ${action.slice(6)} magic.`,5,'curious');remember(c.warden,'The traveler has learned a forbidden power.',-4,'wary');}
 if(action==='find-shard'){const id=({future:'iris',past:'ada',dungeon:'witness',mech:'sol',self:'elder'})[state.world];if(id)remember(c[id],`The traveler recovered the memory fragment of ${state.world}.`,6,'curious');}
 if(action.startsWith('seal-'))remember(c.elder,`The traveler chose the ${action.slice(5)} ending.`,3,'hopeful');
 return title;
}
export function speakAs(state,id){
 const c=CAST[id],m=state.cast?.[id];if(!c||!m)return 'The silence is answer enough.';
 m.interactions=cap(m.interactions+1,0,9999);
 const last=m.memories.slice(-2).join(' ');
 const intro={
  iris:'“Archives do not lie,” Iris says. “They simply omit what someone paid to erase.”',
  ada:'Ada winds the clock backward. “You keep calling it the future. For us, it is just tomorrow’s rent.”',
  witness:'The Witness presses a palm against the crown. “Time does not forgive. It records.”',
  sol:'Sol tightens a frayed glove. “A good pilot knows when to stand down.”',
  warden:'The Warden lowers its blade. “I know the shape of the choices you made.”',
  elder:'Your older self studies the light beyond the window. “I only know one possible life. You still have the others.”'
 }[id];
 const response=m.mood==='grateful'?' Their voice softens.':m.mood==='angry'?' They keep their distance.':m.mood==='wary'?' They watch your hands before answering.':'';
 return `${intro}${response} ${last} “What will you do next?”`;
}
export function worldDossier(state){
 const ids=Object.keys(CAST).filter(id=>CAST[id].world===state.world);
 return ids.map(id=>({id,name:CAST[id].name,role:CAST[id].role,goal:CAST[id].goal,mood:state.cast?.[id]?.mood??'watchful',affinity:state.cast?.[id]?.affinity??0,memory:state.cast?.[id]?.memories?.slice(-1)[0]||'',interactions:state.cast?.[id]?.interactions||0,agendaStage:state.society?.stages?.[id]||0}));
}

/** Local, authored free-text roleplay with per-character conversation memory.
 * It is intentionally NOT called an LLM, yet does respond to state and player prompts.
 * Query text is never transmitted, indexed or stored outside the encrypted game vault.
 */
const LINES={
 iris:{
  time:'“The Exchange records the hours. My archives record who went without. I will show you both ledgers, if you promise to look.”',
  invention:'“Your machine erased some terrible things. It erased other lives too. I have the photographs to prove it.”',
  danger:'“I am afraid of the day one person controls all history and calls it public safety.”',
  help:'“If you want to help, do not only buy a tower. Return an hour. Fund a room where people can read about the lives they never owned.”',
  trust:'“I trust evidence first. I trust promises only when someone pays the cost of keeping them.”',
  base:'“This city has a dozen histories. Tell me which cost you are willing to remember.”'},
 ada:{
  time:'“Those factory workers were owed their mornings before your ledger existed. Who gets to decide how much a life is worth?”',
  invention:'“Do not show me a diagram and call yourself a savior. Show me who owns the machine, and who has to fix it when it breaks.”',
  danger:'“I am afraid a clever machine will simply help a cruel employer work people harder.”',
  help:'“Come to the workshop. We will make something the apprentices can repair without permission from a bank.”',
  trust:'“You can have my friendship before my agreement. Those are two different things.”',
  base:'“There is a strange sort of arrogance in knowing tomorrow. Can you still listen to somebody who only knows today?”'},
 witness:{
  time:'“Hours gathered in the crown like rain. You can hold the water, but not the people from whom it fell.”',
  invention:'“Every tool is a little spell. The danger begins when the wielder believes consequences are for other people.”',
  danger:'“The Warden is not the first monster made from stolen hours. It is only the one that remembers its name.”',
  help:'“Bring me a promise you intend to keep. I can teach you a different kind of victory.”',
  trust:'“Power that can put down its sword is rarer than power that can raise it.”',
  base:'“The stone remembers every step. It has never mistaken force for wisdom.”'},
 sol:{
  time:'“Every minute we keep the corridor open is another minute for someone to escape. That is how I measure a victory.”',
  invention:'“A pilot can learn a machine. It takes longer to teach a machine restraint.”',
  danger:'“My greatest fear is the moment a pilot starts to enjoy the sound of a falling enemy.”',
  help:'“Stand behind the refugees, not in front of a camera. Keep your heat low. Use the shield before the cannon.”',
  trust:'“I trust the pilot who can disengage. Heroes who never stop fighting leave nobody to rebuild.”',
  base:'“ATLAS is strong enough to stop a city. I need somebody strong enough to tell it not to.”'},
 warden:{
  time:'“The hours you stole are not numbers to me. They are unfinished conversations. Give me a reason not to count every one.”',
  invention:'“You make new futures with old hands. Tell me whose past was consumed as fuel.”',
  danger:'“I fear no blade. I fear promises spoken by people who do not plan to remain.”',
  help:'“I will not help you break the crown. But I might help you understand why it must not be sold.”',
  trust:'“You ask for trust while touching the lock on my hours. I will remember what your hands choose.”',
  base:'“I fought the last traveler for seventy years. The first thing they forgot was why they came.”'},
 elder:{time:'“We bought hours and lost the habit of spending them with people.”',invention:'“It changed the skyline. Not the questions.”',danger:'“I feared choosing wrongly. It took longer to learn that avoiding choices was a choice.”',help:'“Start with the person in front of you, not a monument to your future self.”',trust:'“Forgiveness and trust are different rooms. We may have to enter them one at a time.”',base:'“I am one possible memory, not your destiny.”'}
};
function intent(question){
 const q=question.toLowerCase();
 if(/steal|trade|hour|borrow|time|debt|paradox|clock|past|future/.test(q))return 'time';
 if(/invent|money|technology|machine|patent|business|rich|robot|power|weapon/.test(q))return 'invention';
 if(/afraid|fear|danger|fight|battle|war|death|enemy|warden/.test(q))return 'danger';
 if(/help|mission|quest|save|protect|what should|how can/.test(q))return 'help';
 if(/trust|friend|lie|forgive|promise|betray|love/.test(q))return 'trust';
 return 'base';
}
export function roleplayReply(state,id,question){
 const actor=CAST[id],memory=state.cast?.[id];
 if(!actor||!memory||actor.world!==state.world)return null;
 const q=String(question||'').trim().slice(0,240);if(!q)return null;
 const subject=intent(q);let reply=LINES[id][subject];
 if(memory.mood==='angry')reply+=' “Do not ask me to forget the last thing you did.”';
 else if(memory.mood==='grateful')reply+=' “I remember that you helped us.”';
 else if(memory.mood==='wary')reply+=' “I have not forgotten what changed after you arrived.”';
 if(subject==='time'&&(state.chronal?.futureDebt||state.chronal?.pastDebt))reply+=` “The ledger still says ${state.chronal.futureDebt+state.chronal.pastDebt} hours are owed.”`;
 if(subject==='invention'&&state.fate==='gift')reply+=' “You chose to share the discovery. I will not erase that.”';
 if(subject==='invention'&&state.fate==='patent')reply+=' “The world now knows the name on your patent.”';
 const previous=memory.dialogue?.slice(-1)[0];
 if(previous?.question.toLowerCase()===q.toLowerCase())reply+=' “You asked that before. My answer has not changed just because you want another.”';
 return reply.slice(0,600);
}
