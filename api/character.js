/**
 * Serverless version of ELSEWHERE's consent-only, server-selected model bridge.
 * No cookies, vault contents, private letters, identifying records or prompts
 * are logged or persisted by this handler. Remote Meta inference is NOT local.
 * The user must opt in for each browser session before the client calls it.
 */
import {validRequest,getMessages} from '../server.mjs';
import {buildChatRequest,getProviderConfig,providerConfigurationVersion} from './provider-config.js';
import {parseDirectedResponse,parseDirectedFocus} from '../src/scene-director.js';
import {createInferenceLimiter} from './rate-limit.js';
const sharedLimiter=createInferenceLimiter();
const JSON_HEADERS={
 'Content-Type':'application/json; charset=utf-8',
 'Cache-Control':'no-store, no-cache, max-age=0',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer'
};
const reply=(res,status,body)=>res.status(status).setHeader('Cache-Control',JSON_HEADERS['Cache-Control']).setHeader('X-Content-Type-Options','nosniff').setHeader('Referrer-Policy','no-referrer').json(body);
function sameOrigin(req){
 // JSON cross-origin requests require preflight and receive no CORS allowance.
 // Further reject forged same-site browser requests with mismatched origin.
 const origin=req.headers?.origin,host=req.headers?.host;
 if(!origin)return true; // e.g. server-side smoke checks
 if(typeof origin!=='string'||typeof host!=='string')return false;
 try{const url=new URL(origin);return url.host===host && ['https:','http:'].includes(url.protocol);}catch{return false;}
}
function safeInput(body){
 if(!body||typeof body!=='object'||Array.isArray(body))return null;
 const fields=Object.keys(body);if(fields.some(x=>!['world','question','timeline','cloudConsent','providerConfigVersion'].includes(x)))return null;
 if(JSON.stringify(body).length>4096 || !validRequest(body))return null;
 if(typeof body.providerConfigVersion!=='string'||!/^[a-f0-9]{64}$/.test(body.providerConfigVersion))return null;
 const summary=body.timeline;
 if(Object.keys(summary).some(k=>!['credits','fame','trust','invention','fate','power','ending'].includes(k)))return null;
 return body;
}
export function createCharacterHandler({provider=()=>getProviderConfig(),key,model,call=fetch,limiter=sharedLimiter}={}){
 return async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed'});
  if(!sameOrigin(req))return reply(res,403,{error:'Origin not allowed'});
  const data=safeInput(req.body);
  if(!data)return reply(res,400,{error:'Invalid consent or conversation request'});
  let selected;
  try{selected={...provider()};}catch{return reply(res,503,{error:'Model provider configuration is invalid. Local authored dialogue remains available.'});}
  if(key)selected.apiKey=key();
  if(model)selected.model=model();
  selected.apiKey=String(selected.apiKey||'');selected.model=String(selected.model||'').trim();
  selected.configured=Boolean(selected.remoteEnabled===true&&selected.endpoint&&selected.apiKey&&!/[\r\n]/.test(selected.apiKey)&&selected.model.length>0&&selected.model.length<=250&&!/[\r\n]/.test(selected.model)&&(selected.id!=='modal'||/^[^.]+\..+$/.test(selected.apiKey)));
  selected.configurationVersion=providerConfigurationVersion(selected);
  if(!selected.configured)return reply(res,503,{error:'The selected model provider is not configured. Local authored dialogue remains available.'});
  if(data.providerConfigVersion!==selected.configurationVersion)return reply(res,409,{error:'The configured remote recipient changed. Review and enable remote consent again; no question was sent.'});
  const ip=String(req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'anonymous');
  const release=limiter.begin(ip);
  if(!release)return reply(res,429,{error:'Demo capacity reached. Continue with local authored dialogue.'});
  const controller=new AbortController();let timedOut=false,clientGone=Boolean(req.aborted||res.destroyed);
  const timeout=Math.min(60_000,Math.max(10,Number(selected.timeoutMs)||12_000));
  const onClientGone=()=>{if(!res.writableEnded){clientGone=true;if(!controller.signal.aborted)controller.abort(new DOMException('Client disconnected','AbortError'));}};
  req.on?.('aborted',onClientGone);res.on?.('close',onClientGone);
  const timer=setTimeout(()=>{timedOut=true;if(!controller.signal.aborted)controller.abort(new DOMException('Provider deadline exceeded','TimeoutError'));},timeout);
  try{
   if(clientGone)return;
   const response=await call(selected.endpoint,{
    method:'POST',signal:controller.signal,
    headers:{Authorization:`Bearer ${selected.apiKey}`,'Content-Type':'application/json'},redirect:'error',
    body:JSON.stringify(buildChatRequest(selected,getMessages(data)))
   });
   if(!response.ok)return reply(res,502,{error:'Model is temporarily unavailable. Continue with local authored dialogue.'});
   const raw=await response.json();const safe=parseDirectedResponse(raw?.choices?.[0]?.message?.content);
   if(!safe)return reply(res,502,{error:'Response did not meet story safety requirements'});
   return reply(res,200,{reply:safe.reply,cue:safe.cue,focus:parseDirectedFocus(raw?.choices?.[0]?.message?.content),provider:selected.label});
  }catch{if(clientGone)return;if(timedOut)return reply(res,504,{error:'Model reply timed out. Continue with local authored dialogue.'});return reply(res,502,{error:'Model request failed. Continue with local authored dialogue.'});}
  finally{clearTimeout(timer);req.off?.('aborted',onClientGone);req.removeListener?.('aborted',onClientGone);res.off?.('close',onClientGone);res.removeListener?.('close',onClientGone);release();}
 };
}
export default createCharacterHandler();
