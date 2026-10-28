/** Keep one abort deadline active through both response headers and body parsing. */
export async function fetchMetaJson(fetchImpl,url,init={},timeoutMs=12_000){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetchImpl(url,{...init,signal:controller.signal});
  const data=await response.json();
  return {response,data};
 }finally{clearTimeout(timeout);}
}
