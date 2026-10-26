/**
 * Chrononomy: a fictional, bounded economy of hours, memories and inter-era exchange.
 * Hours are story resources, never a representation of a player's real lifespan.
 * Each offer is one-time per branch: no travel-based farming or risk-free arbitrage.
 */
export const ERA_RATES = Object.freeze({past:135, self:155, future:200, dungeon:110, mech:230});
export function initialChronal(){return {hours:12,futureDebt:0,pastDebt:0,paradox:0,transactions:[]};}
const note=(c,era,kind,hours,credits)=>{c.transactions.unshift({era,kind,hours,credits});c.transactions=c.transactions.slice(0,24);};
const finite=(n)=>Number.isFinite(n)?Math.floor(n):0;
export function sanitizeChronal(raw){
 const c=initialChronal();if(!raw||typeof raw!=='object')return c;
 for(const k of ['hours','futureDebt','pastDebt','paradox'])c[k]=Math.max(0,Math.min(9999,finite(raw[k])));
 c.transactions=Array.isArray(raw.transactions)?raw.transactions.slice(0,24).filter(t=>t&&ERA_RATES[t.era]&&typeof t.kind==='string').map(t=>({era:t.era,kind:String(t.kind).slice(0,32),hours:Math.max(-999,Math.min(999,finite(t.hours))),credits:Math.max(-100000,Math.min(100000,finite(t.credits)))})):[];
 return c;
}
const used=(s,id)=>Boolean(s.flags[id]);
export function timeOptions(s){
 const t=s.chronal??initialChronal(),rate=ERA_RATES[s.world];
 const sell=`time-sell-${s.world}`,buy=`time-buy-${s.world}`,work=`time-work-${s.world}`;
 const all=[
  {id:work,title:'Earn four hours of borrowed possibility',detail:'Help someone in this world. Earn 4 fictional hours; each world pays once.',disabled:used(s,work),reason:'You already earned this world’s trust.'},
  {id:sell,title:`Trade 3 hours for ${rate*3} credits`,detail:'Sell part of your time reserve at this era’s exchange rate. Once per world.',disabled:used(s,sell)||t.hours<3,reason:used(s,sell)?'Market already settled':'Requires 3 hours'},
  {id:buy,title:`Buy 3 hours for ${rate*7} credits`,detail:'Recover some time at a premium. Buying always costs more than selling.',disabled:used(s,buy)||s.credits<rate*7,reason:used(s,buy)?'Market already settled':`Requires ${rate*7} credits`}
 ];
 if(['self','future'].includes(s.world))all.push({id:'time-borrow-future',title:'Borrow 8 hours from tomorrow',detail:'Receive 8 hours now, but owe 12. Your future self remembers the debt.',disabled:used(s,'time-borrow-future'),reason:'You already signed the future contract.'});
 if(s.world==='past')all.push({id:'time-borrow-past',title:'Borrow 6 hours from yesterday',detail:'Receive 6 hours, owe 8, and destabilize your history.',disabled:used(s,'time-borrow-past'),reason:'A past life can only be borrowed once.'});
 if(['past','self','future'].includes(s.world)){
  const hours={past:6,self:5,future:7}[s.world];
  const victim={past:'the clockmaker’s town',self:'another possible you',future:'the Chronal Exchange'}[s.world];
  all.push({id:`time-heist-${s.world}`,title:`STEAL ${hours} hours from ${victim}`,detail:'A deliberate moral choice. This scene changes memories, trust and paradox. You can never repeat it in this reality.',disabled:used(s,`time-heist-${s.world}`),reason:'That possibility was already taken in this timeline.'});
 }
 if(s.world==='dungeon'&&s.power)all.push({id:'time-steal-warden',title:'Steal 5 hours from the Warden',detail:'Take time without consent. The Witness remembers and paradox grows.',disabled:used(s,'time-steal-warden'),reason:'The Warden has already learned your trick.'});
 if(t.paradox>=6)all.push({id:'time-atone',title:'RETURN SIX HOURS · MEND THE RIP',detail:'Spend six hours restoring what the heists damaged. It repairs some, not all, of the harm.',disabled:used(s,'time-atone')||t.hours<6,reason:used(s,'time-atone')?'You have already made your amends here.':'Requires six stored hours'});
 if(t.futureDebt)all.push({id:'time-repay-future',title:`Repay tomorrow · ${t.futureDebt} hours`,detail:'Clear your debt and recover trust.',disabled:t.hours<t.futureDebt,reason:'Not enough stored hours'});
 if(t.pastDebt)all.push({id:'time-repay-past',title:`Repair yesterday · ${t.pastDebt} hours`,detail:'Restore a damaged memory and reduce paradox.',disabled:t.hours<t.pastDebt,reason:'Not enough stored hours'});
 return all;
}
export function performTimeTrade(s,id){
 const t=s.chronal;const opt=timeOptions(s).find(o=>o.id===id);
 if(!opt||opt.disabled)return null;
 let title='',detail='',key=id,deltaHours=0,deltaCredits=0;
 const rate=ERA_RATES[s.world];
 if(id.startsWith('time-work-')){deltaHours=4;s.trust+=3;title='A borrowed afternoon';detail='You helped someone without knowing how it would change their tomorrow.';}
 else if(id.startsWith('time-sell-')){deltaHours=-3;deltaCredits=rate*3;title='Three hours sold';detail=`The ${s.world} time exchange paid ${deltaCredits} credits. The hours do not return.`;}
 else if(id.startsWith('time-buy-')){deltaHours=3;deltaCredits=-(rate*7);title='Three hours reclaimed';detail='Time always costs more to buy back than it pays to sell.';}
 else if(id==='time-borrow-future'){deltaHours=8;t.futureDebt+=12;title='A debt written in 2046';detail='Your older self feels twelve hours missing from a life you have not lived.';}
 else if(id==='time-borrow-past'){deltaHours=6;t.pastDebt+=8;t.paradox+=6;s.trust=Math.max(0,s.trust-3);title='Yesterday was pawned';detail='A childhood photograph goes blank. Ada Voss adds your name to a ledger of impossible debts.';}
 else if(id==='time-heist-past'){deltaHours=6;t.paradox+=12;s.trust=Math.max(0,s.trust-12);title='The clocktower loses its morning';detail='The past deposits six stolen hours in your account. Ada sees the clocktower darken, and remembers the person who did it.';}
 else if(id==='time-heist-self'){deltaHours=5;t.paradox+=8;t.futureDebt+=3;s.trust=Math.max(0,s.trust-8);title='A theft between two selves';detail='You take five hours from another possible version of your life. The Other You forgets a conversation and gains three hours of debt.';}
 else if(id==='time-heist-future'){deltaHours=7;t.paradox+=14;t.futureDebt+=5;s.trust=Math.max(0,s.trust-16);title='The Chronal Exchange is breached';detail='Seven hours move into your private ledger. Iris discovers the shortfall and a stranger misses a train they needed to catch.';}
 else if(id==='time-steal-warden'){deltaHours=5;t.paradox+=9;s.trust=Math.max(0,s.trust-8);title='Five stolen hours';detail='The Warden recognizes your touch. Its next encounter will remember your theft.';}
 else if(id==='time-atone'){deltaHours=-6;t.paradox=Math.max(0,t.paradox-15);s.trust+=10;title='The first stolen morning returns';detail='Six hours are returned to the world. Ada and Iris notice the repair. Some things remain changed forever.';}
 else if(id==='time-repay-future'){deltaHours=-t.futureDebt;t.futureDebt=0;s.trust+=8;title='Tomorrow returns';detail='Your future self finds eight quiet minutes that seemed to have vanished.';key='';}
 else if(id==='time-repay-past'){deltaHours=-t.pastDebt;t.pastDebt=0;t.paradox=Math.max(0,t.paradox-9);s.trust+=4;title='Yesterday repaired';detail='The photograph is no longer blank. There is still a scar on its edge.';key='';}
 else return null;
 t.hours+=deltaHours;s.credits+=deltaCredits;
 if(key)s.flags[key]=true;
 note(t,s.world,id,deltaHours,deltaCredits);
 return {title,detail};
}
export const TIME_PRINCIPLES = Object.freeze([
 'Time can be earned once through service in each world. Traveling back and forth does not recreate an hour.',
 'Borrowing creates a larger debt than the hours received. Past borrowing also creates paradox.',
 'The global buy/sell spread prevents a profitable cross-world money loop. Prices are purely fictional.',
 'Time heists across past, present and future are irreversible within each branch; amends are limited and never generate hours.',
 'Theft changes character memory and player trust. No real lifetime, finances, or biometric data is used.'
]);
