const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');
class MemberError extends Error{constructor(message,status=500){super(message);this.status=status}}
function load(path,imports){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:key=>{if(!(key in imports))throw Error(key);return imports[key]},Date});return exports;}
const validation=load('lib/member/preopening.ts',{'./server':{MemberError}});
const details={first_name:' Test ',last_name:' Member ',preferred_plan:'Gecko',vehicle_make:'',vehicle_model:'',vehicle_color:'',license_plate:' ab 123 ',acknowledgement:true};
function setup({denied=false,open=true,row=null,dbError=false}={}) {
 let saved,readId,table;
 const db={from:name=>{
  table=name;assert.equal(name,'braxy_preopening_profiles');
  return {
   select:()=>({eq:(key,id)=>{assert.equal(key,'auth_user_id');readId=id;return{maybeSingle:async()=>({data:row,error:dbError?{}:null})}}}),
   upsert:async data=>{saved=data;return{error:dbError?{}:null}}
  };
 }};
 const route=load('app/api/preopening/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options.status||200,headers:options.headers})}},
  '@/lib/member/server':{MemberError,authenticatedUser:async()=>{if(denied)throw new MemberError('Unauthorized',401);return{db,user:{id:'verified-user'},email:'verified@example.com'}}},
  '@/lib/member/launch':{preopening:()=>open},'@/lib/member/preopening':validation
 });
 return{route,get saved(){return saved},get readId(){return readId},get table(){return table}};
}
const request=body=>new Request('https://example.com/api/preopening',{method:'POST',body:JSON.stringify(body)});
test('free registration rejects unverified requests before any database read or write',async()=>{const s=setup({denied:true});assert.equal((await s.route.GET(request({}))).status,401);assert.equal((await s.route.POST(request(details))).status,401);assert.equal(s.table,undefined)});
test('each preferred tier is saved exactly, using verified identity and a strict field allowlist',async()=>{for(const preferred_plan of ['Gecko','Iguana','Dragon']){const s=setup();assert.equal((await s.route.POST(request({...details,preferred_plan,auth_user_id:'victim',email:'victim@example.com',membership_status:'active',rewards_points:500,stripe_subscription_id:'sub_fake'}))).status,200);assert.equal(s.saved.preferred_plan,preferred_plan);assert.equal(s.saved.auth_user_id,'verified-user');assert.equal(s.saved.email,'verified@example.com');assert.equal(s.saved.license_plate,'AB123');assert.equal(s.saved.first_name,'Test');for(const forbidden of ['membership_status','rewards_points','stripe_subscription_id'])assert.equal(s.saved[forbidden],undefined)}});
test('vehicle is optional, but names, tier and free-registration acknowledgement are validated',async()=>{assert.equal((await setup().route.POST(request({...details,license_plate:''}))).status,200);for(const change of [{first_name:''},{preferred_plan:'Plus'},{license_plate:'!@'},{acknowledgement:false},{first_name:'x'.repeat(51)}]){const s=setup();assert.equal((await s.route.POST(request({...details,...change}))).status,400);assert.equal(s.saved,undefined)}});
test('profile read is bound to verified user and never grants billing, points, visits, or admission',async()=>{const s=setup({row:{auth_user_id:'verified-user',first_name:'Test',preferred_plan:'Dragon'}});const result=await s.route.GET(request({auth_user_id:'victim'}));assert.equal(s.readId,'verified-user');assert.equal(result.body.member.membership_status,'preopening');assert.equal(result.body.member.billingAvailable,false);assert.equal(result.body.member.rewards_points,0);assert.equal(result.body.member.lifetime_washes,0);assert.equal(result.body.visits.length,0);assert.equal(result.headers['Cache-Control'],'private, no-store')});
test('closed registration and database failures do not report successful enrollment',async()=>{const closed=setup({open:false});assert.equal((await closed.route.POST(request(details))).status,409);assert.equal(closed.saved,undefined);const failure=setup({dbError:true});assert.equal((await failure.route.POST(request(details))).status,503);assert.equal((await failure.route.GET(request({}))).status,503)});

test('pre-opening registration list requires administrator verification', async () => {
 let accessed=false;
 const route=load('app/api/admin/preopening/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options.status||200})}},
  '@/lib/member/server':{MemberError,authenticatedAdmin:async()=>{throw new MemberError('Forbidden',403)}}
 });
 assert.equal((await route.GET(new Request('https://example.com/api/admin/preopening'))).status,403);
});
