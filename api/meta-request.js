/** Keep one abort deadline active through response headers and body parsing;
 * propagate client disconnect cancellation without converting it to a retry. */
export async function fetchModelJson(fetchImpl,url,init={},timeoutMs=12_000){
 const controller=new AbortController();
 const external=init.signal,requestInit={...init};delete requestInit.signal;
 const abortFromCaller=()=>controller.abort(external?.reason||new DOMException('Client disconnected','AbortError'));
 if(external?.aborted)abortFromCaller();else external?.addEventListener('abort',abortFromCaller,{once:true});
 const timeout=setTimeout(()=>controller.abort(new DOMException('Provider deadline exceeded','TimeoutError')),timeoutMs);
 try{
  const response=await fetchImpl(url,{...requestInit,redirect:'error',signal:controller.signal});
  const data=await response.json();
  return {response,data};
 }finally{clearTimeout(timeout);external?.removeEventListener('abort',abortFromCaller);}
}
export const fetchMetaJson=fetchModelJson;
