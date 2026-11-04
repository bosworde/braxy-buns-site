const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const {PGlite}=require('@electric-sql/pglite');
class MemberError extends Error{constructor(m,s){super(m);this.status=s}}
function route({status='active',customer='cus_owner',forbidden=false,outage=false}={}) {
 let writes=0;const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{id:'00000000-0000-0000-0000-000000000001',email:'test@example.com'}}),single:async()=>({data:{stripe_customer_id:'cus_owner',stripe_subscription_id:'sub_owner',license_plate:'TEST'}})})})}),rpc:async()=>{writes++;return{data:{approved:true,recorded:true}}}};
 const imports={'next/server':{NextResponse:{json:(body,o={})=>({body,status:o.status||200})}},'@/lib/member/server':{MemberError,authenticatedAdmin:async()=>{if(forbidden)throw new MemberError('Forbidden',403);return{db}}},'@/lib/billing/lock':{billingLock:async(d,e,fn)=>fn('token')},'@/lib/billing/stripe':{objectId:v=>v,stripeClient:()=>({subscriptions:{retrieve:async()=>{if(outage)throw Error('offline');return{customer,id:'sub_owner'}}}}),membershipState:()=>({status,plan:'Gecko Wash Club'})}};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/admin/admission/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:k=>imports[k],console:{error(){}}});return{post:()=>exports.POST(new Request('https://example.com',{method:'POST',body:JSON.stringify({memberId:'00000000-0000-0000-0000-000000000001',commit:true})})),writes:()=>writes};
}
test('admission rejects unauthorized, inactive, mismatched and unavailable billing without recording visits',async()=>{
 for(const config of [{forbidden:true},{status:'past_due'},{status:'cancelled'},{customer:'cus_other'},{outage:true}]){const r=route(config);assert.ok((await r.post()).status>=400);assert.equal(r.writes(),0)}
 const r=route();assert.equal((await r.post()).status,200);assert.equal(r.writes(),1);
});
test('atomic admission records once, rolls back partial writes, and denies client roles',async()=>{
 const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role;
 create table members(id uuid primary key,email text,license_plate text,stripe_customer_id text,stripe_subscription_id text,first_name text,rewards_points bigint,lifetime_washes int);
 create table braxy_billing_locks(email text,token uuid,expires_at timestamptz);
 create table wash_visits(id uuid default gen_random_uuid(),member_id uuid,email text,membership_plan text,license_plate text,created_at timestamptz default now());
 create table tunnel_queue(wash_visit_id uuid,member_id uuid,license_plate text,first_name text,membership_plan text,rewards_points int,lifetime_washes int,status text);
 insert into members values('00000000-0000-0000-0000-000000000001','test@example.com','TEST','cus','sub','Test',0,0);
 insert into braxy_billing_locks values('test@example.com','00000000-0000-0000-0000-000000000002',now()+interval '5 minutes');`);
 await db.exec(fs.readFileSync('supabase/migrations/20261104205507_atomic_wash_admission.sql','utf8'));
 const call=commit=>db.query(`select braxy_admit_wash('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','sub','cus','Gecko Wash Club','TEST',$1) as result`,[commit]);
 assert.equal((await call(false)).rows[0].result.approved,true);assert.equal((await db.query('select * from wash_visits')).rows.length,0);
 await db.exec("alter table tunnel_queue add constraint test_fail check (status <> 'waiting')");await assert.rejects(call(true));assert.equal((await db.query('select * from wash_visits')).rows.length,0);assert.equal((await db.query('select rewards_points from members')).rows[0].rewards_points,0);
 await db.exec('alter table tunnel_queue drop constraint test_fail');
 const results=await Promise.all([call(true),call(true)]);assert.equal(results.filter(r=>r.rows[0].result.recorded).length,1);assert.equal((await db.query('select * from tunnel_queue')).rows.length,1);assert.equal((await db.query('select rewards_points from members')).rows[0].rewards_points,10);
 for(const role of ['anon','authenticated']){await db.exec(`set role ${role}`);await assert.rejects(call(true),/permission denied/);await db.exec('reset role')}
 await db.exec("update braxy_billing_locks set expires_at=now()-interval '1 second'");await assert.rejects(call(true),/lease expired/);await db.close();
});
