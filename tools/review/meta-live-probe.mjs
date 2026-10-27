/**
 * ELSEWHERE synthetic one-call Meta Model API integration probe.
 * Explicit --live only. May incur charges. Prints no keys, prompts or responses.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createCharacterHandler} from '../../api/character.js';
if(!process.argv.includes('--live')){
 console.log('NOT RUN: optional live Meta test. Run npm run meta:probe -- --live with MODEL_API_KEY configured locally.');
 process.exit(0);
}
if(!process.env.MODEL_API_KEY){
 console.error('BLOCKED: MODEL_API_KEY missing; no API call made.');
 process.exit(2);
}
const request={
 method:'POST',
 headers:{origin:'http://localhost',host:'localhost','x-real-ip':'127.0.0.1'},
 socket:{remoteAddress:'127.0.0.1'},
 body:{
   cloudConsent:true,world:'self',
   question:'In this fictional world, how did gifting an Aether Cell in 1889 change the future?',
   timeline:{credits:100,fame:3,trust:8,invention:'cell',fate:'gift',power:'none',ending:'unwritten'}
 }
};
const result={statusCode:0,body:null};
const response={
 status(n){result.statusCode=n;return this;},
 setHeader(){return this;},
 json(data){result.body=data;return data;}
};
const handler=createCharacterHandler();
await handler(request,response);
const valid=result.statusCode===200 &&
 result.body?.provider==='Meta Model API' &&
 typeof result.body.reply==='string' &&
 result.body.reply.length>0 &&
 ['rain','warmth','wonder','quiet','resolve'].includes(result.body.cue);
const receipt={
 checkedAt:new Date().toISOString(),
 mode:'live ELSEWHERE serverless Meta handler (synthetic opt-in request)',
 model:process.env.META_MODEL||'muse-spark-1.3',
 success:valid,
 status:result.statusCode,
 provider:valid?'Meta Model API':'unverified',
 responseCharacterCount:valid?result.body.reply.length:0,
 note:'One synthetic local-handler request; NOT proof of public deployment, 3-minute demo, or Quest quality.'
};
mkdirSync(resolve(process.cwd(),'review-output'),{recursive:true});
writeFileSync(resolve(process.cwd(),'review-output/meta-live-check.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(valid?'LIVE META HANDLER PASS':'META HANDLER NO-GO');
console.log('Sanitized proof: review-output/meta-live-check.json. No secrets or conversation text were printed.');
if(!valid)process.exitCode=1;
