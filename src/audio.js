/** Original lightweight synthesizer. No downloaded music, samples or trackers. Sound is opt-in. */
const NOTES = {
  future:[92.50,138.59,277.18],self:[110,164.81,220],past:[98,146.83,196],
  dungeon:[73.42,116.54,174.61],mech:[61.74,123.47,185.0]
};
export function createSoundscape(){
  let context,master,ambience=[],enabled=false,world='future';
  function ensure(){
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return false;
    if(!context){context=new Ctx();master=context.createGain();master.gain.value=0;master.connect(context.destination);}
    if(context.state==='suspended')context.resume().catch(()=>{});
    return true;
  }
  function clear(){
    for(const {osc,gain} of ambience){try{osc.stop()}catch{}osc.disconnect();gain.disconnect();}
    ambience=[];
  }
  function setScene(next){
    world=next;
    if(!context||!enabled)return;
    clear();const notes=NOTES[next]||NOTES.future;
    notes.forEach((note,i)=>{
      const osc=context.createOscillator(),gain=context.createGain();
      osc.type=i===2?'triangle':'sine';osc.frequency.value=note;
      gain.gain.value=[.028,.015,.008][i];
      osc.connect(gain);gain.connect(master);osc.start();ambience.push({osc,gain});
    });
  }
  function toggle(on){
    enabled=Boolean(on);
    if(!ensure())return false;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(enabled?.8:0,context.currentTime,.21);
    if(enabled)setScene(world);else setTimeout(()=>{if(!enabled)clear()},700);
    return enabled;
  }
  function effect(kind='choice'){
    if(!enabled||!context)return;
    const t=context.currentTime;
    const profile={choice:[360,550,.11],portal:[140,720,.65],victory:[415,830,.52],warning:[240,110,.25],pulse:[150,60,.43],shard:[560,1120,.52]}[kind]||[360,550,.11];
    const osc=context.createOscillator(),gain=context.createGain();osc.type=kind==='pulse'?'sawtooth':'sine';
    osc.frequency.setValueAtTime(profile[0],t);osc.frequency.exponentialRampToValueAtTime(profile[1],t+profile[2]);
    gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(kind==='pulse'?.075:.045,t+.018);
    gain.gain.exponentialRampToValueAtTime(.001,t+profile[2]);
    osc.connect(gain);gain.connect(master);osc.start(t);osc.stop(t+profile[2]+.03);
    osc.addEventListener('ended',()=>{osc.disconnect();gain.disconnect();},{once:true});
  }
  function dispose(){clear();context?.close().catch(()=>{});context=null;}
  return {toggle,effect,setScene,dispose,get enabled(){return enabled}};
}
