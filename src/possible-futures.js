import {isUrgentSafetyMessage, futureConversationReply} from './future-dialogue.js';

const text=(v,n)=>String(v??'').trim().slice(0,n);
const dayPattern=/^\d{4}-\d{2}-\d{2}$/;
const count=v=>Number.isInteger(v)?Math.max(0,Math.min(9999,v)):0;
export function localDay(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
const distance=(a,b)=>(Date.parse(`${b}T00:00:00Z`)-Date.parse(`${a}T00:00:00Z`))/86400000;
export const currentStreak=(p,today=localDay())=>p.last&&distance(p.last,today)>1?0:p.streak;
export function initialFutures(){return {plans:[],active:0};}
export function sanitizeFutures(value){
  const plans=(Array.isArray(value?.plans)?value.plans:[]).slice(0,5).filter(p=>p&&text(p.title,80)).map(p=>({
    title:text(p.title,80), step:text(p.step,160),
    nodes:[...new Set((Array.isArray(p.nodes)?p.nodes:[]).filter(n=>Number.isInteger(n)&&n>=1&&n<=365))].sort((a,b)=>a-b).slice(0,8),
    streak:count(p.streak),total:count(p.total),resets:count(p.resets),last:dayPattern.test(p.last)?p.last:'',
    selected:Number.isInteger(p.selected)?p.selected:0,
    conversation:(Array.isArray(p.conversation)?p.conversation:[]).slice(-20).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').map(m=>({role:m.role,text:text(m.text,500),node:count(m.node)}))
  })).map(p=>({...p,nodes:p.nodes.length?p.nodes:[1,7,14,21]}));
  return {plans,active:Math.min(count(value?.active),Math.max(0,plans.length-1))};
}
export function updateFutures(state,action,data={},today=localDay()){
  const next=structuredClone(state), f=sanitizeFutures(next.possibleFutures), p=f.plans[f.active];
  const fail=error=>({ok:false,error});
  if(action==='create'){
    if(f.plans.length>=5)return fail('You can keep up to five plans in this reality.');
    const title=text(data.title,80),step=text(data.step,160);
    if(!title||!step)return fail('Give this plan a name and one small step.');
    const nodes=[...new Set(String(data.nodes||'1,7,14,21').split(',').map(v=>Number(v.trim())).filter(n=>Number.isInteger(n)&&n>=1&&n<=365))].sort((a,b)=>a-b).slice(0,8);
    if(!nodes.length)return fail('Add milestone days between 1 and 365, separated by commas.');
    f.plans.push({title,step,nodes,streak:0,total:0,resets:0,last:'',selected:0,conversation:[]});f.active=f.plans.length-1;
  }else if(action==='switch'){
    const index=Number(data.index);if(!Number.isInteger(index)||!f.plans[index])return fail('Choose an existing plan.');f.active=index;
  }else if(action==='delete'){
    if(!p)return fail('Choose a plan first.');f.plans.splice(f.active,1);f.active=Math.min(f.active,Math.max(0,f.plans.length-1));
  }else{
    if(!p)return fail('Create a plan first.');
    if(action==='checkin'){
      if(p.last===today)return fail('Today is already checked in. You can return whenever you like.');
      if(p.last&&distance(p.last,today)<=0)return fail('Check your device date before checking in.');
      if(p.last&&distance(p.last,today)>1){p.streak=0;p.resets++;p.selected=0;}
      p.streak++;p.total++;p.last=today;
    }else if(action==='reset'){
      p.streak=0;p.selected=0;p.resets++;
    }else if(action==='select'){
      const n=Number(data.node);if(n!==0&&(!p.nodes.includes(n)||n>currentStreak(p,today)))return fail('This future opens when you reach its milestone.');p.selected=n;
    }else if(action==='talk'){
      const q=text(data.question,350);if(!q)return fail('Write a message first.');
      const node=p.selected<=currentStreak(p,today)?p.selected:0;
      const context=node?`At day ${node}, we are still learning about ${p.title}.`:`I'm here with you at the beginning of ${p.title}.`;
      let reflection='You do not need to be perfect. What feels like a manageable next step?';
      if(/miss|break|relaps|slip|fail|mistake|difficult|struggl/i.test(q))reflection='A difficult day does not erase what we learned. What is one kind, manageable step we can take next?';
      else if(/anxious|depress|lonely|hopeless|overwhelm|sad/i.test(q))reflection='That sounds hard to carry. Would it help to tell someone you trust, or consider support from a mental health professional?';
      else if(/proud|success|finished|worked|did it|progress/i.test(q))reflection='You showed up for something that matters to you. What helped, and what would you like to carry forward?';
      else if(/how|plan|help|next|start|motivat/i.test(q))reflection=`We can make the next step smaller: ${p.step}. What would make that feel possible today?`;
      const reply=isUrgentSafetyMessage(q)?futureConversationReply({conversation:[],compass:null},q):`${context} ${reflection}`;
      p.conversation.push({role:'user',text:q,node},{role:'assistant',text:reply,node});p.conversation=p.conversation.slice(-20);
    }else return fail('Unknown plan action.');
  }
  next.possibleFutures=f;next.revision=(next.revision||0)+1;return {ok:true,state:next};
}
