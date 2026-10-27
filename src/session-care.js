/** Voluntary, session-only headset break invitations. No telemetry or streaks.
 * Measures active XR foreground seconds, not wall-clock idle or browser time.
 */
export function createSessionCare({intervalSeconds=15*60,maxInvitations=2}={}) {
  if (!Number.isFinite(intervalSeconds) || intervalSeconds < 60) throw new RangeError('Invalid interval');
  let activeSeconds=0, invitations=0;
  return {
    sample(seconds,{xr=false,visible=true}={}) {
      if (!xr || !visible || !Number.isFinite(seconds) || seconds<=0 || seconds>.5) return false;
      activeSeconds += seconds;
      if (invitations>=maxInvitations || activeSeconds < (invitations+1)*intervalSeconds) return false;
      invitations++;
      return true;
    },
    reset(){activeSeconds=0;invitations=0;},
    snapshot(){return {invitations,activeSeconds:Math.floor(activeSeconds)};}
  };
}
