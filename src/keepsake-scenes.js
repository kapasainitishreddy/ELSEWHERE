/** Pure, fictional future-apartment memories. No personal note or message is read. */
const clean=(text,limit=90)=>String(text||'').replace(/[\r\n]/g,' ').slice(0,limit);
export function futureKeepsakes(state={}){
 const invention=clean(state.invention||'');
 const invented=Boolean(invention);
 const fate=state.fate||'undecided';
 const branch=state.parallel?.active==='echo'?'Echo':'Prime';
 const inventionText= !invented
  ? 'An empty notebook waits for a choice you have not made. Your possible future has room for invention.'
  : fate==='gift'?`A blueprint of ${invention} hangs here. In this fictional future it became a public gift, and people still use it.`
  : fate==='patent'?`The first patent of ${invention} sits under glass. It brought fame, but Ada wants to know who gained access.`
  : fate==='auction'?`A faded auction ticket for ${invention} carries an enormous fictional price. The collector kept the object, not the idea.`
  : `An unfinished design for ${invention} remembers the question of what happens after invention.`;
 const years=Number.isInteger(state.chronal?.hours)?state.chronal.hours:0;
 const debt=(Number(state.chronal?.pastDebt)||0)+(Number(state.chronal?.futureDebt)||0);
 return [
  {id:'blueprint',title:'THE BLUEPRINT',short:'An invention changes its meaning',text:inventionText,location:[-3.55,1.65,-3.18],accent:0xf5bc8b},
  {id:'hourglass',title:'BORROWED HOURS',short:'Every hour belongs to someone',text:`The timepiece reads ${Math.max(0,years)} fictional hours stored and ${Math.max(0,debt)} owed. The ${branch} timeline has its own account. Time is currency here, but nobody trades real lifetime.`,location:[2.85,1.2,-3.55],accent:0x91ebdc},
  {id:'portrait',title:'A POSSIBILITY',short:'A life that is not a prediction',text:state.owned?.includes('library')
    ? `A small photo shows a crowded public library in the ${branch} reality. Not a promise of success, just a world you helped create.`
    : `A photo of a quiet street in the ${branch} reality. The person who lives here has changed, but their future is an invention, not a prophecy.`,location:[4.65,2.05,-4.1],accent:0xd4b8ff},
 ];
}
export function keepsakeReaction(id){
 if(id==='blueprint')return 'delighted';
 if(id==='hourglass')return 'listening';
 return 'speaking';
}
