/** A health endpoint that never reveals or tests credentials. */
import {getProviderConfig} from './provider-config.js';
export default function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 res.setHeader('Cache-Control','no-store');
 let provider='unsupported',modelConfigured=false,metaConfigured=false;
 try{const config=getProviderConfig();provider=config.id;modelConfigured=config.configured;metaConfigured=config.id==='meta'&&config.configured;}catch{}
 return res.status(200).json({online:true,provider,modelConfigured,metaConfigured,mode:'opt-in-cloud-or-authored-local'});
}
