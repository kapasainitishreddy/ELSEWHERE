/** One synthetic provider-handler request. --live requires separately approved
 * credentials and cost. No raw question, reply, credential or error is retained. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {getProviderConfig} from '../../api/provider-config.js';

export async function runSyntheticProbe({live=false,env={},call=fetch}={}){
 if(!live)return {exitCode:0,message:'NOT RUN: optional live provider test. Separate credential and cost authorization is required before --live.',receipt:null};
 let config;
 try{config=getProviderConfig(env);}catch{return {exitCode:2,message:'BLOCKED: unsupported provider configuration; no API call made.',receipt:null};}
 if(!config.configured)return {exitCode:2,message:'BLOCKED: selected provider is not configured; no API call made.',receipt:null};
 const {createCharacterHandler}=await import('../../api/character.js');
 const request={method:'POST',headers:{origin:'http://localhost',host:'localhost','x-real-ip':'127.0.0.1'},socket:{remoteAddress:'127.0.0.1'},body:{
  cloudConsent:true,world:'self',providerConfigVersion:config.configurationVersion,
  question:'In this fictional world, how did gifting an Aether Cell in 1889 change the future?',
  timeline:{credits:100,fame:3,trust:8,invention:'cell',fate:'gift',power:'none',ending:'unwritten'}
 }};
 const result={statusCode:0,body:null};
 const response={status(n){result.statusCode=n;return this;},setHeader(){return this;},json(data){result.body=data;return data;}};
 let upstreamRequests=0,upstreamStatus=null;
 const handler=createCharacterHandler({provider:()=>config,limiter:{begin:()=>()=>{}},call:async(...args)=>{
  upstreamRequests++;const upstream=await call(...args);upstreamStatus=Number.isInteger(upstream.status)?upstream.status:null;return upstream;
 }});
 await handler(request,response);
 const dialogueValid=result.statusCode===200&&result.body?.provider===config.label&&typeof result.body.reply==='string'&&result.body.reply.length>0;
 const schemaValid=dialogueValid&&['rain','warmth','wonder','quiet','resolve'].includes(result.body.cue)&&['people','infrastructure','memory'].includes(result.body.focus);
 const receipt={checkedAt:new Date().toISOString(),mode:'single synthetic local serverless-handler request',provider:config.label,configuredModel:config.model,
  handlerStatus:result.statusCode,upstreamStatus,upstreamRequests,dialogueValid,schemaValid,success:schemaValid,
  responseCharacterCount:dialogueValid?result.body.reply.length:0,
  note:'Local handler evidence only. Does not establish model eligibility, a deployed user experience, demo video, or device quality.'};
 return {exitCode:schemaValid?0:1,message:schemaValid?'PROVIDER HANDLER PASS':'PROVIDER HANDLER NO-GO',receipt};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const result=await runSyntheticProbe({live:process.argv.includes('--live'),env:process.env});
 if(result.receipt){
  mkdirSync(resolve(process.cwd(),'review-output'),{recursive:true});
  writeFileSync(resolve(process.cwd(),'review-output/meta-live-check.json'),JSON.stringify(result.receipt,null,2)+'\n');
 }
 console.log(result.message);
 if(result.receipt)console.log('Sanitized proof: review-output/meta-live-check.json. No secrets or conversation text were printed.');
 process.exitCode=result.exitCode;
}
