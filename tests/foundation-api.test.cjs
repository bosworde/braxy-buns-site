const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
function load(path,imports={},env={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:key=>{if(!(key in imports))throw Error(key);return imports[key]},process:{env},URL,Set,Object,console:{error(){}}});return exports;}
class MemberError extends Error{constructor(message,status=500){super(message);this.status=status}}
const next={NextResponse:{json:(body,options={})=>({body,status:options.status||200})}};
const stripeModel=load('lib/billing/stripe.ts',{stripe:{default:class{}},'@/lib/member/server':{MemberError}});
const active={id:'sub_owner',created:100,customer:'cus_owner',status:'active',metadata:{auth_user_id:'user'},pause_collection:null,latest_invoice:{status:'paid'},items:{data:[{price:{id:'price_1TezO8193rp9H3JHyzHPvkOH'}}]}};
const request=body=>new Request('https://example.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
test('only recognized, paid, unpaused active subscriptions grant access',()=>{
 assert.equal(stripeModel.membershipState(active).status,'active');
 for(const status of ['past_due','unpaid','incomplete','incomplete_expired','trialing','paused','canceled'])assert.notEqual(stripeModel.membershipState({...active,status}).status,'active');
 assert.equal(stripeModel.membershipState({...active,latest_invoice:{status:'open'}}).status,'payment_pending');
 assert.equal(stripeModel.membershipState({...active,pause_collection:{behavior:'void'}}).status,'paused');
 assert.equal(stripeModel.membershipState({...active,items:{data:[{price:{id:'unknown'}}]}}).status,'inactive');
});
test('preview cannot use a live Stripe secret',()=>{
 const mod=load('lib/billing/stripe.ts',{stripe:{default:class{}},'@/lib/member/server':{MemberError}},{STRIPE_SECRET_KEY:'sk_live_example',VERCEL_ENV:'preview'});
 assert.throws(()=>mod.stripeClient(),/Live billing is disabled/);
});
function cancellation(auth,subscription=active){let canceled;const route=load('app/api/cancel-subscription/route.ts',{'next/server':next,'@/lib/member/server':{MemberError,authenticatedAdmin:auth},'@/lib/billing/stripe':{objectId:stripeModel.objectId,stripeClient:()=>({subscriptions:{retrieve:async id=>{assert.equal(id,'sub_owner');return subscription},cancel:async id=>{canceled=id;return {...subscription,status:'canceled'}}}})},'@/lib/billing/lock':{billingLock:async(db,email,fn)=>fn('lease')},'@/lib/billing/sync':{saveSubscription:async()=>{}}});return{route,get canceled(){return canceled}}}
const admin=async()=>({db:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{email:'owner@example.com',stripe_customer_id:'cus_owner',stripe_subscription_id:'sub_owner'}})})})})}});
test('unauthorized cancellation is rejected before Stripe is called',async()=>{
 const c=cancellation(async()=>{throw new MemberError('Forbidden',403)});assert.equal((await c.route.POST(request({memberId:'00000000-0000-0000-0000-000000000001'}))).status,403);assert.equal(c.canceled,undefined);
});
test('cancellation ignores supplied subscription IDs and verifies customer ownership',async()=>{
 const c=cancellation(admin);assert.equal((await c.route.POST(request({memberId:'00000000-0000-0000-0000-000000000001',subscriptionId:'sub_victim'}))).status,200);assert.equal(c.canceled,'sub_owner');
 const wrong=cancellation(admin,{...active,customer:'cus_victim'});assert.equal((await wrong.route.POST(request({memberId:'00000000-0000-0000-0000-000000000001'}))).status,409);assert.equal(wrong.canceled,undefined);
});
function webhook({event,subscription={...active,status:'canceled'},duplicate=false,writeFails=false,badSignature=false}){
 let written, reads=0;
 const db={from:table=>({select:()=>({eq:()=>({maybeSingle:async()=>table==='braxy_billing_events'?{data:duplicate?{event_id:event.id}:null}:{data:table==='members'?{email:'owner@example.com',stripe_subscription_id:'sub_owner'}:null}})})})};
 const stripe={webhooks:{constructEvent:()=>{if(badSignature)throw Error();return event}},subscriptions:{retrieve:async()=>{reads++;return subscription}}};
 const route=load('app/api/stripe-webhook/route.ts',{'next/server':next,'@/lib/member/server':{MemberError,serviceDatabase:()=>db},'@/lib/billing/stripe':{stripeClient:()=>stripe,objectId:stripeModel.objectId},'@/lib/billing/lock':{billingLock:async(db,email,fn)=>fn('lease')},'@/lib/billing/sync':{saveSubscription:async(db,sub)=>{if(writeFails)throw Error();written=sub}}},{STRIPE_WEBHOOK_SECRET:'whsec_test',STRIPE_SECRET_KEY:'sk_test_example'});
 return{route,get written(){return written},get reads(){return reads}};
}
const event={id:'evt_1',type:'customer.subscription.updated',livemode:false,data:{object:active}};
const hookRequest=()=>new Request('https://example.com',{method:'POST',headers:{'stripe-signature':'test'},body:'{}'});
test('webhook rejects missing or invalid signatures',async()=>{
 const w=webhook({event,badSignature:true});assert.equal((await w.route.POST(request({}))).status,400);assert.equal((await w.route.POST(hookRequest())).status,400);assert.equal(w.reads,0);
});
test('delayed active event uses current canceled subscription rather than the old payload',async()=>{
 const w=webhook({event});assert.equal((await w.route.POST(hookRequest())).status,200);assert.equal(w.written.status,'canceled');assert.equal(w.reads,2);
});
test('webhook retries failed database writes and ignores successfully processed duplicates',async()=>{
 const failed=webhook({event,writeFails:true});assert.equal((await failed.route.POST(hookRequest())).status,503);
 const duplicate=webhook({event,duplicate:true});assert.equal((await duplicate.route.POST(hookRequest())).status,200);assert.equal(duplicate.reads,0);
});
test('failed-payment invoices reconcile the subscription from the pinned Stripe invoice shape',async()=>{
 const w=webhook({event:{...event,type:'invoice.payment_failed',data:{object:{parent:{subscription_details:{subscription:'sub_owner'}}}}},subscription:{...active,status:'past_due'}});
 assert.equal((await w.route.POST(hookRequest())).status,200);assert.equal(w.written.status,'past_due');
});
test('live events cannot enter the test webhook',async()=>{
 const w=webhook({event:{...event,livemode:true}});assert.equal((await w.route.POST(hookRequest())).status,400);assert.equal(w.reads,0);
});
test('LPR scanning requires administrator authentication before reading an upload',async()=>{
 const route=load('app/api/lpr-scan/route.ts',{'next/server':next,'@/lib/member/server':{MemberError,authenticatedAdmin:async()=>{throw new MemberError('Forbidden',403)}}});
 assert.equal((await route.POST(request({}))).status,403);
});
test('checkout refuses an existing active subscription before creating another session',async()=>{
 let created=false;const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null})})})})};
 const route=load('app/api/create-checkout-session/route.ts',{'next/server':next,'node:crypto':{randomUUID:()=>''},'@/lib/member/server':{MemberError,authenticatedMember:async()=>({db,user:{id:'user',email:'owner@example.com'},member:{stripe_customer_id:'cus_owner'}})},'@/lib/billing/stripe':{prices:()=>({'Dragon Wash Club':'price_test'}),siteOrigin:()=> 'https://example.com',stripeClient:()=>({subscriptions:{list:async()=>({data:[active],has_more:false})},checkout:{sessions:{create:async()=>{created=true}}}})},'@/lib/billing/lock':{billingLock:async(db,email,fn)=>fn('lease')}});
 const response=await route.POST(request({planName:'Dragon Wash Club',email:'victim@example.com',firstName:'A',lastName:'B',licensePlate:'ABC123',vehicleMake:'Ford',vehicleModel:'Explorer',vehicleColor:'White'}));
 assert.equal(response.status,409);assert.equal(created,false);
});

test('checkout preserves each requested tier and replaces an unpaid checkout for another tier', async () => {
 for (const planName of Object.keys(stripeModel.prices())) {
  const wanted=stripeModel.prices()[planName];const calls=[];
  const previous={customer_id:'cus_owner',session_id:'cs_old',price_id:'price_other'};
  const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:previous})})})}),rpc:async()=>({error:null})};
  const stripe={subscriptions:{list:async()=>({data:[],has_more:false})},checkout:{sessions:{retrieve:async()=>({id:'cs_old',status:'open',url:'https://checkout.stripe.com/old'}),expire:async id=>{calls.push(['expire',id])},create:async args=>{calls.push(['create',args.line_items[0].price]);return{id:'cs_new',url:'https://checkout.stripe.com/new'}}}}};
  const route=load('app/api/create-checkout-session/route.ts',{'next/server':next,'node:crypto':{randomUUID:()=> 'attempt'},'@/lib/member/server':{MemberError,authenticatedMember:async()=>({db,user:{id:'user',email:'owner@example.com'},member:{stripe_customer_id:'cus_owner'}})},'@/lib/billing/stripe':{prices:stripeModel.prices,siteOrigin:()=> 'https://example.com',stripeClient:()=>stripe},'@/lib/billing/lock':{billingLock:async(db,email,fn)=>fn('lease')}});
  const result=await route.POST(request({planName,firstName:'A',lastName:'B',licensePlate:'ABC123',vehicleMake:'Ford',vehicleModel:'Explorer',vehicleColor:'White'}));
  assert.equal(result.status,200);assert.deepEqual(calls,[['expire','cs_old'],['create',wanted]]);
  previous.price_id=wanted;calls.length=0;
  const resumed=await route.POST(request({planName,firstName:'A',lastName:'B',licensePlate:'ABC123',vehicleMake:'Ford',vehicleModel:'Explorer',vehicleColor:'White'}));
  assert.equal(resumed.body.resumed,true);assert.equal(calls.length,0);
 }
});
