const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const {PGlite}=require('@electric-sql/pglite');
function load(){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/billing/alerts.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:()=>({objectId:v=>typeof v==='string'?v:v?.id||null}),Set,Date,console});return exports}
test('risk alerts resolve all invoice subscriptions and preserve reviewed events on replay',async()=>{
 const mod=load();const saved=new Map();let count=0;
 const db={from:()=>({upsert:async(row,options)=>{assert.equal(options.ignoreDuplicates,true);if(!saved.has(row.id))saved.set(row.id,row);return{error:null}}})};
 const stripe={charges:{retrieve:async()=>({id:'ch_1',customer:'cus_1',payment_intent:'pi_1'})},invoicePayments:{list:args=>{assert.equal(args.payment.payment_intent,'pi_1');return(async function*(){yield{invoice:'in_1'};yield{invoice:'in_2'}})()}},invoices:{retrieve:async id=>{count++;return{parent:{subscription_details:{subscription:id==='in_1'?'sub_1':'sub_2'}}}}}};
 const event={id:'evt_risk',type:'charge.dispute.created',data:{object:{id:'dp_1',charge:'ch_1'}}};
 await mod.recordRiskAlert(db,stripe,event);assert.equal(count,2);assert.deepEqual(Array.from(saved.get('evt_risk').subscription_ids),['sub_1','sub_2']);saved.get('evt_risk').resolved_at='reviewed';await mod.recordRiskAlert(db,stripe,event);assert.equal(saved.get('evt_risk').resolved_at,'reviewed');
});
test('unresolved non-subscription charges still create actionable alerts and failed storage rejects',async()=>{
 const mod=load();let row;const stripe={charges:{retrieve:async()=>({id:'ch_2',customer:null,payment_intent:null})}};const event={id:'evt_refund',type:'charge.refunded',data:{object:{id:'ch_2'}}};
 await mod.recordRiskAlert({from:()=>({upsert:async r=>{row=r;return{}}})},stripe,event);assert.equal(row.resource_id,'ch_2');assert.equal(row.subscription_ids.length,0);
 await assert.rejects(mod.recordRiskAlert({from:()=>({upsert:async()=>({error:{message:'offline'}})})},stripe,event),/Could not save/);
});
test('alert storage denies anonymous and customer roles',async()=>{
 const db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
 const file=fs.readdirSync('supabase/migrations').find(x=>x.endsWith('_billing_review_alerts.sql'));await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(db.query('select * from braxy_operational_alerts'),/permission denied/);await db.exec('reset role')}
 await db.close();
});
