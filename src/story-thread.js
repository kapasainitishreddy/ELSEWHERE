/**
 * THE NINTH PLATFORM — authored, entirely local narrative investigation.
 * Story discoveries are one-time, branch-specific choices. They never grant
 * money, hours, powers or personal predictions. No AI service is involved.
 */
export const STORY_CLUES = Object.freeze([
  'story-photograph','story-contract','story-witness','story-blackbox','story-platform'
]);

export const STORY_CHOICES = Object.freeze({
  'story-photograph': {
    world:'self',title:'Turn over the photograph',detail:'Ask the Other You about the empty seat in a picture that keeps changing.',
    available:s=>(s.worldVisits?.self||0)>0,
    event:{title:'The photograph remembers an empty seat',detail:'An umbrella casts a second shadow in the photograph. Your other self says someone was once meant to meet you at Platform Nine.'}
  },
  'story-contract':{
    world:'past',title:'Read the fine print of Vey’s offer',detail:'Examine the document Ada refused to sign and discover its hidden witness clause.',
    available:s=>(s.worldVisits?.past||0)>0,
    event:{title:'The clause written in invisible ink',detail:'Vey’s contract promises hours to whoever can afford to wait. Ada finds a witness signature dated centuries after her birth.'}
  },
  'story-witness':{
    world:'dungeon',title:'Ask who the crown was made to protect',detail:'Hear the Witness’s account before you decide whether to fight or negotiate.',
    available:s=>(s.worldVisits?.dungeon||0)>0,
    event:{title:'The Warden’s first promise',detail:'The crown began as a promise to prevent a single child from waiting alone. The kingdom turned that promise into a prison.'}
  },
  'story-blackbox':{
    world:'mech',title:'Replay the titan’s sealed black box',detail:'Follow the first order ATLAS-09 refused, hidden beneath a century of repairs.',
    available:s=>!!s.pilotTrained,
    event:{title:'An order the titan would not obey',detail:'The defense grid classified unpaid lives as expendable. Sol kept the original recording as evidence, not a victory trophy.'}
  },
  'story-platform':{
    world:'future',title:'Find the station between centuries',detail:'Follow Iris to Platform Nine, absent from every public railway map.',
    available:s=>(s.worldVisits?.self||0)>0,
    event:{title:'Platform Nine appears in the timetable',detail:'The station is a junction of missed meetings. Iris finds a ticket with two dates and one unnamed passenger.'}
  },
  'story-unpriced':{
    world:'future',title:'Open the last unpriced hour',detail:'Return the evidence to Iris and decide what the missing hour should mean.',
    available:s=>!!s.fate && STORY_CLUES.filter(id=>s.flags?.[id]).length>=3,
    event:{title:'The hour nobody could own',detail:'You learn who disappeared from the first ledger. The Archive records a choice, not a perfect erasure of the past.'}
  }
});

export function storyCluesFound(state){return STORY_CLUES.filter(id=>state?.flags?.[id]);}
/** Read-only, spoiler-safe journal projection for the current canonical branch. */
export function storyClueJournal(state){
  const found=STORY_CLUES.filter(id=>state?.flags?.[id]===true).map(id=>{
    const choice=STORY_CHOICES[id];
    return Object.freeze({id,world:choice.world,title:choice.event.title,detail:choice.event.detail});
  });
  const hasInvention=['gift','patent','auction'].includes(state?.fate);
  const revealed=state?.flags?.['story-unpriced']===true;
  const ready=hasInvention&&found.length>=3;
  const currentLead=narrativeOptions(state).some(option=>STORY_CLUES.includes(option.id));
  const hint=revealed
    ? 'The final inquiry is recorded in this reality.'
    : ready
      ? 'The final inquiry is ready in Neo Elysium, whenever you choose to return.'
      : !hasInvention
        ? 'Choose an invention in 1889 and discover any three clues to open the final inquiry.'
        : currentLead
          ? 'An optional lead is available in the world you are visiting.'
          : `Discover ${Math.max(0,3-found.length)} more ${3-found.length===1?'clue':'clues'} in any of the five worlds. Unfound details stay hidden.`;
  const final=revealed?Object.freeze({title:STORY_CHOICES['story-unpriced'].event.title,detail:STORY_CHOICES['story-unpriced'].event.detail}):null;
  return Object.freeze({branch:state?.parallel?.active==='echo'?'echo':'prime',found:Object.freeze(found),required:3,
    status:revealed?'REVEALED':ready?'READY':'LOCKED',hasInvention,ready,revealed,hint,final});
}
export function narrativeOptions(state){
  return Object.entries(STORY_CHOICES)
    .filter(([id,choice])=>choice.world===state?.world && choice.available(state) && !state.flags?.[id])
    .map(([id,choice])=>({id,title:choice.title,detail:choice.detail,disabled:!!state.flags?.[id],reason:'This clue has already been recorded in this reality.'}));
}
export function narrativeEvent(state,id){
  const choice=STORY_CHOICES[id];
  if(!choice || choice.world!==state?.world || !choice.available(state) || state.flags?.[id])return null;
  return {...choice.event};
}

const INVENTIONS={cell:'Aether Cell',oracle:'Clockwork Oracle',rail:'Skyrail Drive'};
const asHours=n=>Math.max(0,Math.floor(Number(n)||0));
const branch=s=>s?.parallel?.active==='echo'?'Echo':'Prime';

/** A short original scene reflecting actual, current-branch actions. */
export function storyAfterimage(s,id){
  if(!s || typeof s!=='object')return '';
  if(id==='elder'){
    if(s.fate==='gift')return `\n\nAFTERIMAGE · ${branch(s).toUpperCase()}\n\nAcross the street, a public workshop is still open after sunset. The older stranger watches an apprentice pass a toolbox to someone she has never met. “That's our invention,” they say, “but it doesn't belong to us anymore. I didn't expect that to feel like relief.”`;
    if(s.fate==='patent')return `\n\nAFTERIMAGE · ${branch(s).toUpperCase()}\n\nThe older stranger slides aside a newspaper bearing your name. “We can afford to buy the entire building now,” they say, without quite smiling. “I hope, in whichever life you choose, you still remember how to knock before entering somebody else's room.”`;
    if(s.fate==='auction')return `\n\nAFTERIMAGE · ${branch(s).toUpperCase()}\n\nA billboard beyond the rain advertises a machine you once built. It names the buyer, not Ada. The older stranger circles the small print with a fingertip. “It turns out selling an idea doesn't mean you stop being responsible for what it does.”`;
    if(s.chronal?.futureDebt>0)return `\n\nAFTERIMAGE · AN HOUR ON LOAN\n\nThe second cup has gone cold. Your older self glances toward the door, expecting a visitor neither of you can name. The debt stands at ${asHours(s.chronal.futureDebt)} fictional hours. They do not accuse you. They ask, very quietly, what you want to remember.`;
    return '';
  }
  if(id==='invention' && s.invention && s.fate){
    const machine=INVENTIONS[s.invention]||'machine';
    const versions={
      gift:`Ada opens the workshop doors. Someone asks whose permission they need to rebuild the ${machine}. “Nobody's,” she answers. The first free blueprint leaves in a baker's flour-covered hands. The street hasn't become fair overnight, but the door stays open.`,
      patent:`The patent is signed beneath the lamp. Your name survives in the ink; Ada's small note about access is stapled behind the contract, where only the patient will find it. “A patent can protect work,” she says. “Now show me whether yours protects people too.”`,
      auction:`The auctioneer's hammer falls. Vey does not smile; he studies the faces of the buyers who lost. You have enough fictional credits to change your circumstances. Ada folds away one unsold blueprint and asks if a price can ever be the end of a promise.`
    };
    return `\n\nTHE CHOICE YOU MADE · ${branch(s).toUpperCase()}\n\nThe ${machine} has changed this century. ${versions[s.fate]||''}`;
  }
  if(id==='city' && s.fate){
    return `\n\nTHE CITY AFTER YOUR CHOICE\n\n${s.fate==='gift'?'Under the elevated rails, repair stalls remain lit well past midnight. Their signs bear dozens of names, none printed larger than the others.':s.fate==='patent'?'A corporation bearing your name has built an avenue of glass. At its entrance, a workers’ cooperative is negotiating for the right to use what you invented.':'Above the river hangs an enormous advertisement for a buyer you barely remember. Below it, a small independent shop is reverse-engineering the device to repair one for a neighbor.'}`;
  }
  if(id==='warden' && s.wardenBattle?.outcome){
    const mercy=s.wardenBattle.outcome==='mercy';
    return `\n\nWHAT THE WARDEN REMEMBERS\n\n${mercy?'The blade touches the floor. For the first time in centuries, the Warden asks the Witness to repeat a name instead of a sentence of judgment. The chamber stays open long enough for a conversation.':'The blade lies broken among the stones. The Witness kneels by the armor and begins recording what the Warden guarded. Winning the fight has not erased the need to keep the promise.'}`;
  }
  if(id==='titan' && s.flags?.['defend-city']){
    return `\n\nAFTER THE SIRENS\n\nSol powers down ATLAS-09. Inside its open palm, a mechanic has written the names of the people who made it through the corridor. The letters are crooked. Sol refuses an offer to replace them with a victory counter.`;
  }
  if(id==='epilogue' && s.ending){
    const finale={
      empire:'The city knows your name. You do not erase it; you amend the first contract so people can refuse your technology and still participate in tomorrow. On the steps outside, Ada’s apprentices are asking questions nobody has paid them to ask.',
      legacy:'Nobody agrees on who invented the first light. Different streets have different stories, and all of them are partly true. A night-school window stays bright. It does not need your portrait over the door.',
      wanderer:'A train departs with one seat empty. You keep the ticket rather than deciding where it must lead. Behind you, somebody else approaches the turnstile, carrying a question you have never heard.'
    };
    const evidence=s.flags?.['story-unpriced']?' Iris leaves one page blank in the public ledger: the name of the person who chose to keep an hour unpriced.':' The station retains one unopened platform. Nothing requires you to solve every mystery to have lived this chapter.';
    return `\n\nYOUR ENDING · ${s.ending.toUpperCase()}\n\n${finale[s.ending]||''}${evidence}`;
  }
  return '';
}
