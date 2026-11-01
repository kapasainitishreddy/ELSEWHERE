import test from 'node:test';
import assert from 'node:assert/strict';
import {getProviderConfig} from '../api/provider-config.js';

test('provider defaults remain Meta and do not require network access',()=>{
 const config=getProviderConfig({});
 assert.deepEqual(config,{id:'meta',label:'Meta Model API',endpoint:'https://api.meta.ai/v1/chat/completions',model:'muse-spark-1.3',apiKey:'',configured:false,timeoutMs:12000});
});

test('Baseten uses its documented chat endpoint and the supplied Muse Spark Open model id',()=>{
 const config=getProviderConfig({MODEL_PROVIDER:'baseten',BASETEN_API_KEY:'synthetic-baseten-key'});
 assert.deepEqual(config,{id:'baseten',label:'Baseten',endpoint:'https://inference.baseten.co/v1/chat/completions',model:'meta-models/muse-spark-open-1026',apiKey:'synthetic-baseten-key',configured:true,timeoutMs:30000});
});

test('Fireworks requires an explicitly configured model id',()=>{
 const missingModel=getProviderConfig({MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-fireworks-key'});
 assert.equal(missingModel.configured,false);
 assert.equal(missingModel.model,'');
 const config=getProviderConfig({MODEL_PROVIDER:'fireworks',FIREWORKS_API_KEY:'synthetic-fireworks-key',FIREWORKS_MODEL:'accounts/example/models/explicit-model'});
 assert.deepEqual(config,{id:'fireworks',label:'Fireworks',endpoint:'https://api.fireworks.ai/inference/v1/chat/completions',model:'accounts/example/models/explicit-model',apiKey:'synthetic-fireworks-key',configured:true,timeoutMs:30000});
});

test('provider selection is an allowlist and endpoint overrides are rejected',()=>{
 assert.throws(()=>getProviderConfig({MODEL_PROVIDER:'unknown-provider'}),/Unsupported model provider/);
 assert.throws(()=>getProviderConfig({MODEL_PROVIDER:'https://attacker.invalid',META_API_URL:'https://attacker.invalid'}),/Unsupported model provider/);
 assert.equal(getProviderConfig({MODEL_PROVIDER:'meta',META_API_URL:'https://attacker.invalid'}).endpoint,'https://api.meta.ai/v1/chat/completions');
});

test('provider configs do not reuse another provider credential',()=>{
 assert.equal(getProviderConfig({MODEL_PROVIDER:'baseten',MODEL_API_KEY:'meta-secret'}).configured,false);
 assert.equal(getProviderConfig({MODEL_PROVIDER:'fireworks',BASETEN_API_KEY:'baseten-secret',FIREWORKS_MODEL:'explicit'}).configured,false);
});

test('Modal requires an explicit HTTPS endpoint, model, and proxy token on a Modal host',()=>{
 const absent=getProviderConfig({MODEL_PROVIDER:'modal'});
 assert.equal(absent.configured,false);
 assert.equal(absent.endpoint,'');
 assert.equal(getProviderConfig({MODEL_PROVIDER:'modal',MODAL_CHAT_COMPLETIONS_URL:'http://app.modal.run/v1/chat/completions',MODAL_MODEL:'model',MODAL_PROXY_TOKEN:'id.secret'}).configured,false);
 assert.equal(getProviderConfig({MODEL_PROVIDER:'modal',MODAL_CHAT_COMPLETIONS_URL:'https://app.evilmodal.run/v1/chat/completions',MODAL_MODEL:'model',MODAL_PROXY_TOKEN:'id.secret'}).configured,false);
 assert.equal(getProviderConfig({MODEL_PROVIDER:'modal',MODAL_CHAT_COMPLETIONS_URL:'https://modal.run/v1/chat/completions',MODAL_MODEL:'model',MODAL_PROXY_TOKEN:'id.secret'}).configured,false);
 assert.equal(getProviderConfig({MODEL_PROVIDER:'modal',MODAL_CHAT_COMPLETIONS_URL:'https://app.modal.run:8443/v1/chat/completions',MODAL_MODEL:'model',MODAL_PROXY_TOKEN:'id.secret'}).configured,false);
 const config=getProviderConfig({MODEL_PROVIDER:'modal',MODAL_CHAT_COMPLETIONS_URL:'https://app--serve.modal.run/v1/chat/completions',MODAL_MODEL:'explicit-modal-model',MODAL_PROXY_TOKEN:'synthetic-id.synthetic-secret'});
 assert.deepEqual(config,{id:'modal',label:'Modal',endpoint:'https://app--serve.modal.run/v1/chat/completions',model:'explicit-modal-model',apiKey:'synthetic-id.synthetic-secret',configured:true,timeoutMs:30000});
});
