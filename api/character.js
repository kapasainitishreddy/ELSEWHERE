/**
 * Vercel serverless version of ELSEWHERE's consent-only Meta Model API bridge.
 * No cookies, vault contents, private letters, identifying records or prompts
 * are logged or persisted by this handler. Remote Meta inference is NOT local.
 * The user must opt in for each browser session before the client calls it.
 */
import {validRequest,getMessages} from '../server.mjs';
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
 const fields=Object.keys(body);if(fields.some(x=>!['world','question','timeline','cloudConsent'].includes(x)))return null;
 if(JSON.stringify(body).length>4096 || !validRequest(body))return null;
 const summary=body.timeline;
 if(Object.keys(summary).some(k=>!['credits','fame','trust','invention','fate','power','ending'].includes(k)))return null;
 return body;
}
export function createCharacterHandler({key=()=>process.env.MODEL_API_KEY,model=()=>process.env.META_MODEL||'muse-spark-1.3',call=fetch,limiter=sharedLimiter}={}){
 return async function handler(req,res){
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed'});
  if(!sameOrigin(req))return reply(res,403,{error:'Origin not allowed'});
  const data=safeInput(req.body);
  if(!data)return reply(res,400,{error:'Invalid consent or conversation request'});
  const apiKey=key();if(!apiKey)return reply(res,503,{error:'Meta is not configured. Local authored dialogue remains available.'});
  const ip=String(req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'anonymous');
  const release=limiter.begin(ip);
  if(!release)return reply(res,429,{error:'Demo capacity reached. Continue with local authored dialogue.'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await call('https://api.meta.ai/v1/chat/completions',{
    method:'POST',signal:controller.signal,
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:model(),messages:getMessages(data),max_tokens:260})
   });
   if(!response.ok)return reply(res,502,{error:'Model is temporarily unavailable'});
   const raw=await response.json();const safe=parseDirectedResponse(raw?.choices?.[0]?.message?.content);
   if(!safe)return reply(res,502,{error:'Response did not meet story safety requirements'});
   return reply(res,200,{reply:safe.reply,cue:safe.cue,focus:parseDirectedFocus(raw?.choices?.[0]?.message?.content),provider:'Meta Model API'});
  }catch{return reply(res,502,{error:'Model request failed. Continue with local authored dialogue.'});}
  finally{clearTimeout(timer);release();}
 };
}
export default createCharacterHandler();
