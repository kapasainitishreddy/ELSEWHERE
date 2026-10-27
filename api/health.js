/** A health endpoint that never reveals or tests credentials. */
export default function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 res.setHeader('Cache-Control','no-store');
 return res.status(200).json({online:true,metaConfigured:Boolean(process.env.MODEL_API_KEY),mode:'opt-in-cloud-or-authored-local'});
}
