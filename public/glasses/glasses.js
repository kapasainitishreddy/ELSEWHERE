/** Standalone glasses concept. No cookies, camera, microphone, telemetry or persisted data. */
const stories=[
 {title:'Wonder',prompt:'Notice one small beautiful thing. It need not become a photograph or a task.'},
 {title:'Possible Tomorrow',prompt:'An imagined older you says: “I am not your prediction. You are allowed to choose a different path.”'},
 {title:'Kindness',prompt:'If someone you love had made a mistake, what kind words might you offer them?'},
 {title:'One Free Hour',prompt:'The fictional Hours Bank offers another hour. You choose rest instead. Nothing is lost.'}
];
const root=document.querySelector('#screen');let selection=-1;
function render(){
 root.replaceChildren();
 const h=document.createElement('h1'),p=document.createElement('p'),buttons=document.createElement('div');buttons.className='actions';
 const add=(text,sub,act)=>{const b=document.createElement('button');b.type='button';b.textContent=text;if(sub){const t=document.createElement('small');t.textContent=sub;b.append(t);}b.addEventListener('click',act);buttons.append(b);};
 if(selection===-1){h.textContent='One quiet moment.';p.textContent='Four tiny imaginary stories. Nothing you choose is saved.';stories.forEach((s,i)=>add(s.title,s.prompt.slice(0,45)+'…',()=>{selection=i;render();}));}
 else{h.textContent=stories[selection].title;p.textContent=stories[selection].prompt;add('Return to the doorway','Forget this choice',()=>{selection=-1;render();});}
 root.append(h,p,buttons);
}
render();