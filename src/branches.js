/** Parallel reality snapshots. World economies diverge, while no resources
 * cross branches; remembering the other reality is a player privilege, not an exploit.
 */
export const BRANCH_FIELDS=Object.freeze([
 'world','credits','fame','trust','influence','invention','fate','power','dungeonOutcome',
 'pilotTrained','mechDeployed','owned','flags','history','conversation','revision',
 'echoShards','runeProgress','runeMistakes','mechBattle','encounters','lastEncounter',
 'letter','ending','worldVisits','chronal','cast','wardenBattle','stars'
]);
export const initialParallel=()=>({active:'prime',forked:false,snapshots:{}});
export function branchSnapshot(state){return Object.fromEntries(BRANCH_FIELDS.map(k=>[k,structuredClone(state[k])]));}
export function forkIntoEcho(state){
 if(state.parallel?.forked||state.chronal.hours<3||state.stars<2)return null;
 // Pay on the prime branch before creating the branch, so both worlds share the cost.
 state.chronal.hours-=3;state.stars-=2;
 state.parallel={active:'echo',forked:true,snapshots:{prime:branchSnapshot(state)}};
 return state;
}
export function switchBranch(state){
 if(!state.parallel?.forked)return null;
 const from=state.parallel.active,to=from==='prime'?'echo':'prime';
 const previous=state.parallel.snapshots[to];
 if(!previous)return null;
 state.parallel.snapshots[from]=branchSnapshot(state);
 for(const field of BRANCH_FIELDS)state[field]=structuredClone(previous[field]);
 state.parallel.active=to;
 delete state.parallel.snapshots[to];
 return state;
}
export function branchOptions(state){
 if(!state.parallel?.forked)return [{id:'fork-parallel',title:'Open the Echo reality',detail:'Spend 3 hours and 2 stars to split this life into two persistent, independent paths.',disabled:state.chronal.hours<3||state.stars<2,reason:'Requires 3 stored hours and 2 stars'}];
 return [{id:'switch-parallel',title:`Enter ${state.parallel.active==='prime'?'Prime':'Echo'}’s opposite life`,detail:`Store this branch and cross into ${state.parallel.active==='prime'?'Echo':'Prime'}. The other reality has its own wealth, memories and choices.`}];
}
