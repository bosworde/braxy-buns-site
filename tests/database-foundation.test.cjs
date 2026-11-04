const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');

test('foundation migration protects actual PostgreSQL rows and serializes billing', async t => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create table public.members(id uuid primary key default gen_random_uuid(), email text, first_name text,last_name text,
      license_plate text,vehicle_make text,vehicle_model text,vehicle_color text,membership_plan text,membership_status text,
      stripe_customer_id text,stripe_subscription_id text,rewards_points integer default 0,lifetime_washes integer default 0);
    create table public.wash_visits(id uuid primary key default gen_random_uuid(),member_id uuid,email text);
    create table public.tunnel_queue(id uuid primary key default gen_random_uuid());
    create table public.welcome_screen(id uuid primary key default gen_random_uuid());
    create table public.leads(id uuid primary key default gen_random_uuid());
    create table public.founding_member_leads(id uuid primary key default gen_random_uuid());
    insert into auth.users values ('00000000-0000-0000-0000-000000000001','member@example.com',now()),('00000000-0000-0000-0000-000000000002','dennis@braxybuns.com',now());
    insert into members(email,membership_status,rewards_points) values ('member@example.com','inactive',10),('other@example.com','active',20);
    grant all on all tables in schema public to anon,authenticated,service_role;
    alter table members enable row level security;
    create policy old_public_access on members for all to anon,authenticated using(true) with check(true);
  `);
  await db.exec(fs.readFileSync('supabase/migrations/202611040001_member_foundation.sql','utf8'));
  async function as(role, uid, sql) {
    await db.exec(`set role ${role}; set request.jwt.claim.sub = '${uid || ''}'`);
    try { return await db.query(sql) } finally { await db.exec('reset role'); }
  }
  await t.test('anonymous users cannot read member data despite an old public policy', async () => {
    await assert.rejects(as('anon','','select * from members'), /permission denied/);
  });
  await t.test('members cannot read other accounts or change points through direct database access', async () => {
    const id='00000000-0000-0000-0000-000000000001';
    assert.equal((await as('authenticated',id,'select * from members')).rows.length,0);
    assert.equal((await as('authenticated',id,"update members set rewards_points=999 returning id")).rows.length,0);
    await assert.rejects(as('authenticated',id,"insert into members(email) values ('attacker@example.com')"),/row-level security/);
    assert.equal((await db.query("select rewards_points from members where email='member@example.com'")).rows[0].rewards_points,10);
  });
  await t.test('existing verified administrators retain operational access', async () => {
    assert.equal((await as('authenticated','00000000-0000-0000-0000-000000000002','select * from members')).rows.length,2);
  });
  await t.test('customer cannot invoke privileged billing functions or read checkout state', async () => {
    await assert.rejects(as('authenticated','00000000-0000-0000-0000-000000000001',"select braxy_acquire_billing_lock('member@example.com')"),/permission denied/);
    await assert.rejects(as('authenticated','00000000-0000-0000-0000-000000000001','select * from braxy_checkout_state'),/permission denied/);
  });
  const email='member@example.com';
  const claim = async () => (await db.query('select braxy_acquire_billing_lock($1) as token',[email])).rows[0].token;
  let token=await claim();
  const apply=async (event,created,status='active',customer='cus_owner',sub='sub_owner',lease=token) => db.query('select braxy_apply_subscription($1,$2,$3,$4,$5,$6,$7,$8,$9)',[email,lease,event,customer,sub,created,'Dragon Wash Club',status,{}]);
  await t.test('only one billing worker holds a lease',async()=>assert.equal(await claim(),null));
  await t.test('renewal and cancellation change status without resetting points or vehicle data',async()=>{
    await db.query("update members set license_plate='ABC123' where email=$1",[email]);
    await apply('evt_paid',100);
    await apply('evt_cancel',100,'cancelled');
    const row=(await db.query('select * from members where email=$1',[email])).rows[0];
    assert.equal(row.membership_status,'cancelled');assert.equal(row.rewards_points,10);assert.equal(row.license_plate,'ABC123');
  });
  await t.test('duplicate events do not reapply obsolete state',async()=>{
    await apply('evt_paid',100,'active');
    assert.equal((await db.query('select membership_status from members where email=$1',[email])).rows[0].membership_status,'cancelled');
  });
  await t.test('older subscriptions cannot replace a newer subscription',async()=>{
    await apply('evt_new',200,'active','cus_owner','sub_new');
    await apply('evt_old',100,'cancelled');
    assert.equal((await db.query('select stripe_subscription_id from members where email=$1',[email])).rows[0].stripe_subscription_id,'sub_new');
  });
  await t.test('mismatched customer cannot replace an account, and failed event is retryable',async()=>{
    await assert.rejects(apply('evt_wrong',300,'active','cus_attacker','sub_wrong'),/ownership mismatch/);
    assert.equal((await db.query("select * from braxy_billing_events where event_id='evt_wrong'")).rows.length,0);
  });
  await t.test('expired workers cannot overwrite newer billing state',async()=>{
    const old=token;
    await db.query("update braxy_billing_locks set expires_at=now()-interval '1 second' where email=$1",[email]);
    token=await claim();assert.notEqual(token,old);
    await assert.rejects(apply('evt_stale',400,'active','cus_owner','sub_latest',old),/lease expired/);
    await db.query('select braxy_release_billing_lock($1,$2)',[email,old]);
    assert.equal(await claim(),null);
  });
  await db.close();
});
