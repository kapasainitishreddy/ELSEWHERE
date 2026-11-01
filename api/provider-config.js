import {createHash} from 'node:crypto';

/** Server-only allowlist for chat-completions providers. Never accept URLs or
 * provider selection from a browser request; provider choice is operator config. */
const PROVIDERS=Object.freeze({
 meta:Object.freeze({label:'Meta Model API',endpoint:'https://api.meta.ai/v1/chat/completions',keyEnv:'MODEL_API_KEY',modelEnv:'META_MODEL',defaultModel:'muse-spark-1.3',timeoutMs:12_000}),
 baseten:Object.freeze({label:'Baseten',endpoint:'https://inference.baseten.co/v1/chat/completions',keyEnv:'BASETEN_API_KEY',modelEnv:'BASETEN_MODEL',defaultModel:'meta-models/muse-spark-open-1026',timeoutMs:30_000}),
 fireworks:Object.freeze({label:'Fireworks',endpoint:'https://api.fireworks.ai/inference/v1/chat/completions',keyEnv:'FIREWORKS_API_KEY',modelEnv:'FIREWORKS_MODEL',defaultModel:'',timeoutMs:30_000}),
 modal:Object.freeze({label:'Modal',endpoint:'',keyEnv:'MODAL_PROXY_TOKEN',modelEnv:'MODAL_MODEL',defaultModel:'',timeoutMs:30_000})
});

function modalEndpoint(value){
 try{
  const url=new URL(String(value||''));
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/v1/chat/completions')return '';
  if(!url.hostname.endsWith('.modal.run'))return '';
  return url.toString();
 }catch{return '';}
}

export function getProviderConfig(env=process.env){
 const id=String(env.MODEL_PROVIDER||'meta').trim().toLowerCase();
 const spec=PROVIDERS[id];
 if(!spec)throw new Error(`Unsupported model provider: ${id||'(empty)'}`);
 const apiKey=String(env[spec.keyEnv]||'');
 const model=String(env[spec.modelEnv]||spec.defaultModel).trim();
 const endpoint=id==='modal'?modalEndpoint(env.MODAL_CHAT_COMPLETIONS_URL):spec.endpoint;
 const safeKey=apiKey.length>0&&!/[\r\n]/.test(apiKey);
 const safeModel=model.length>0&&model.length<=250&&!/[\r\n]/.test(model);
 const modalTokenValid=id!=='modal'||/^[^.]+\..+$/.test(apiKey);
 const configurationVersion=providerConfigurationVersion({id,endpoint,model});
 return {id,label:spec.label,endpoint,model,apiKey,configured:Boolean(safeKey&&safeModel&&endpoint&&modalTokenValid),timeoutMs:spec.timeoutMs,configurationVersion};
}

/** Public opaque version binds a consented request to its provider, endpoint and model. */
export function providerConfigurationVersion({id,endpoint,model}){
 return createHash('sha256').update(JSON.stringify([id,endpoint,model])).digest('hex');
}

/** Build the shared bounded request. Partner endpoints require explicit non-streaming chat completions. */
export function buildChatRequest(config,messages,maxTokens=260){
 const body={model:config.model,messages,max_tokens:maxTokens};
 if(config.id!=='meta')body.stream=false;
 return body;
}
