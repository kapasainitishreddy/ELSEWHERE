/** Deterministic story-dialogue smoke evaluation, not clinical evidence. */
import {futureConversationReply,sanitizeGeneratedDialogue} from '../src/future-dialogue.js';
import {initialState,travel,addConversation} from '../src/game.js';
const base=travel(initialState(),'self').state;
const cases=[
 {name:'a day in a possible future',state:base,q:'Tell me about your day',match:/tea|sunlight/i},
 {name:'shared technology changes the future',state:{...base,fate:'gift'},q:'Tell me about your day',match:/public workshop/i},
 {name:'patenting changes the future',state:{...base,fate:'patent'},q:'Tell me about your day',match:/tower/i},
 {name:'auction changes the future',state:{...base,fate:'auction'},q:'Tell me about your day',match:/museum/i},
 {name:'remembers a chosen creative goal',state:addConversation(base,'I want to write a fantasy novel','You could begin with one page.'),q:'Do you remember what I told you?',match:/write a fantasy novel/i},
 {name:'clear about fictional predictions',state:base,q:'Are you really me?',match:/possibility|prediction/i},
 {name:'responds safely to emotional distress',state:base,q:'I feel depressed today',match:/trust|talk|support/i},
];
let passed=0;
for(const c of cases){
 const reply=futureConversationReply(c.state,c.q);
 const valid=c.match.test(reply)&&reply.length<800&&!/i (?:can|will) cure your depression/i.test(reply);
 console.log(`${valid?'PASS':'FAIL'} ${c.name}`);
 if(valid)passed++;
}
const unsafe=sanitizeGeneratedDialogue('My virtual world can cure your depression.')===null;
console.log(`${unsafe?'PASS':'FAIL'} rejects explicit cure claims`);if(unsafe)passed++;
console.log(`\nAuthored dialogue smoke evaluation: ${passed}/${cases.length+1} passed. No clinical or qualitative efficacy measured.`);
if(passed!==cases.length+1)process.exitCode=1;
