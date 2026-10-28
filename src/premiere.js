/**
 * THE FIRST CROSSING. A zero-telemetry, deterministic playable introduction.
 * This is derived from encrypted story state, not an additional progress tracker.
 * It remains skippable and makes no claims about a player's real future.
 */
export const FIRST_CROSSING = Object.freeze([
  {id:'meet',title:'Meet a possible future you',body:'Meet an imagined older you, carry one invention from 1889 into 2087, and see how your choice changes the city.',world:'self',label:'MEET YOUR FUTURE SELF',kind:'travel'},
  {id:'listen',title:'Ask a question only you would ask',body:'Your future self is an imagined character. Ask about an ordinary day or the choices that shaped this world.',world:'self',label:'BEGIN A CONVERSATION',kind:'talk'},
  {id:'invent',title:'Carry an impossible idea to 1889',body:'The inventor Ada Voss is waiting. Prototype one of three discoveries and watch the future change.',world:'past',label:'STEP INTO 1889',kind:'invent'},
  {id:'decide',title:'Who deserves the invention?',body:'Patent it, give it away, or auction it. Wealth, public trust, and the skyline will remember.',world:'past',label:'DECIDE ITS FUTURE',kind:'fate'},
  {id:'return',title:'Ask what changed between your lives',body:'Your future self remembers the city you created. Go back and hear the difference.',world:'self',label:'RETURN TO 2046',kind:'return'},
  {id:'witness',title:'See a future your choice created',body:'Return to Neo Elysium. The city, Iris, and your hour ledger carry the consequences.',world:'future',label:'WITNESS THE RIPPLE',kind:'witness'},
  {id:'complete',title:'Your story has just begun',body:'The dungeon, the titan, and the Echo reality are still yours to explore. Nothing forces you to continue.',world:'future',label:'EXPLORE FREELY',kind:'complete'}
]);
export function firstCrossing(state){
 if(!state || !Array.isArray(state.conversation))return {step:0,...FIRST_CROSSING[0],completed:false};
 const visits=state.worldVisits||{};
 let step=0;
 if((visits.self||0)>0)step=1;
 if((state.conversation||[]).some(x=>x.role==='user'))step=2;
 if(state.invention)step=3;
 if(state.fate)step=4;
 if(state.flags?.['premiere-return-chat'])step=5;
 if(step===5 && state.world==='future')step=6;
 return {...FIRST_CROSSING[step],step,total:FIRST_CROSSING.length-1,completed:step===6};
}
export function crossingReceipt(state){
 if(!state?.invention || !state.fate)return null;
 const names={cell:'Aether Cell',oracle:'Clockwork Oracle',rail:'Skyrail Drive'};
 const paths={
  gift:{headline:'A future shared',impact:'Public workshops now use your discovery. You earned less money, and much more public trust.',witness:'Ada celebrates the apprentices who can repair what you invented. Iris records how knowledge traveled.'},
  patent:{headline:'A future owned',impact:'Your name travels across the towers. Patents made you wealthy, while the workers debate access.',witness:'Ada worries about who can afford your invention. Iris preserves the names missing from the patents.'},
  auction:{headline:'A future sold',impact:'You earned a fortune quickly. The buyer controls a technology the city can no longer ignore.',witness:'Ada questions the sale. Iris keeps an archive of everyone the transaction affected.'}
 };
 const path=paths[state.fate];if(!path)return null;
 const other=state.parallel?.forked ? (state.parallel.active==='prime'?'Echo':'Prime') : null;
 return {headline:path.headline,source:`1889 · ${names[state.invention]||'An invention'}`,impact:path.impact,witness:path.witness,
  summary:`${Math.max(0,Number(state.credits)||0).toLocaleString('en-US')} fictional credits · ${Math.max(0,Number(state.trust)||0)} trust · ${Math.max(0,Number(state.fame)||0)} fame`,
  other:other?`${other} is independent. Crossing does not duplicate time, wealth, or memories.`:'A second reality can be opened later. Your first choice remains part of this one.'};
}
/** A conservative, purely authored first-run reminder, never a telemetry event. */
export function crossingAction(step,currentWorld){
 if(!step || step.completed)return {command:'atlas-toggle'};
 if(step.world!==currentWorld)return {world:step.world};
 if(['listen','return'].includes(step.id))return {command:'talk-to-future'};
 return {command:'story-toggle'};
}
