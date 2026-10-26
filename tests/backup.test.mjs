import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,travel,applyAction,writeLetter} from '../src/game.js';
import {createBackup,readBackup} from '../src/backup.js';
test('timeline export is private JSON with explicit provenance and can restore its exact state',()=>{
 let s=travel(initialState(),'past').state;s=applyAction(s,'invent-cell').state;
 s=writeLetter(s,'Keep learning.');
 const serialized=createBackup(s,'2026-10-26T12:00:00Z');
 assert.match(serialized,/syrava-elsewhere-timeline/);
 assert.match(serialized,/Keep learning/);
 assert.deepEqual(readBackup(serialized),s);
});
test('reject untrusted or oversized imported files without loading a new world',()=>{
 assert.throws(()=>readBackup('{broken'),/JSON/);
 assert.throws(()=>readBackup(JSON.stringify({format:'other'})),/not an ELSEWHERE/);
 assert.throws(()=>readBackup('X'.repeat(150001)),/too large/);
 const valid=JSON.parse(createBackup(initialState()));valid.state.version=10;
 assert.throws(()=>readBackup(JSON.stringify(valid)),/not an ELSEWHERE/);
});
