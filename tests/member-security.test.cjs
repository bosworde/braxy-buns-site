const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function moduleFrom(path, imports, env = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: key => { if (!(key in imports)) throw Error(key); return imports[key] }, process: { env }, URL, console });
  return exports;
}
const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-only' };
const next = { NextResponse: { json: (body, options) => ({ body, ...options }) } };
function authModule(db) { return moduleFrom('lib/member/server.ts', { '@supabase/supabase-js': { createClient: () => db } }, env) }
test('authentication rejects missing bearer token before accessing member records', async () => {
  const { authenticatedMember } = authModule({});
  await assert.rejects(authenticatedMember(new Request('https://example.com/api/member')), e => e.status === 401);
});
test('authentication rejects invalid or unconfirmed identities', async () => {
  for (const result of [{ data: { user: null }, error: new Error('bad token') }, { data: { user: { email: 'a@example.com' } }, error: null }]) {
    const { authenticatedMember } = authModule({ auth: { getUser: async () => result } });
    await assert.rejects(authenticatedMember(new Request('https://example.com', { headers: { Authorization: 'Bearer bad' } })), e => e.status === 401);
  }
});
test('member lookup uses verified identity, ignoring caller email and member ID', async () => {
  let filter;
  const db = { auth: { getUser: async () => ({ data: { user: { email: 'Owner@Example.com', email_confirmed_at: 'yes' } }, error: null }) }, from: () => ({ select: () => ({ eq: (column, value) => { filter = [column, value]; return { maybeSingle: async () => ({ data: { id: 'own-member' }, error: null }) } } }) }) };
  const result = await authModule(db).authenticatedMember(new Request('https://example.com?email=victim@example.com', { headers: { Authorization: 'Bearer verified' } }));
  assert.deepEqual(filter, ['email', 'owner@example.com']); assert.equal(result.member.id, 'own-member');
});
test('vehicle updates cannot alter membership, points, or another member', async () => {
  const { MemberError } = authModule({}); let update, id;
  const db = { from: () => ({ update: value => { update = value; return { eq: (column, value) => { id = value; return { select: () => ({ maybeSingle: async () => ({ data: { id: value }, error: null }) }) } } } } }) };
  const route = moduleFrom('app/api/member/route.ts', { 'next/server': next, '@/lib/member/server': { MemberError, authenticatedMember: async () => ({ db, member: { id: 'owner' } }) } });
  const response = await route.PATCH(new Request('https://example.com', { method: 'PATCH', body: JSON.stringify({ vehicle_make: 'Ford', vehicle_model: 'Explorer', vehicle_color: 'White', license_plate: ' abc 123 ', id: 'victim', rewards_points: 999, membership_status: 'active' }) }));
  assert.equal(response.body.success, true); assert.equal(id, 'owner'); assert.equal(update.license_plate, 'ABC123');
  assert.deepEqual(Object.keys(update).sort(), ['license_plate', 'vehicle_color', 'vehicle_make', 'vehicle_model']);
  const invalid = await route.PATCH(new Request('https://example.com', { method: 'PATCH', body: JSON.stringify({ vehicle_make: 'Ford' }) })); assert.equal(invalid.status, 400);
});
test('billing ignores supplied customer ID and uses the verified membership', async () => {
  const { MemberError } = authModule({}); let customer;
  class Stripe { billingPortal = { sessions: { create: async args => { customer = args.customer; return { url: 'https://billing.stripe.com/test' } } } } }
  const route = moduleFrom('app/api/create-customer-portal/route.ts', { 'next/server': next, stripe: { default: Stripe }, '@/lib/member/server': { MemberError, authenticatedMember: async () => ({ member: { stripe_customer_id: 'cus_owner' } }) } }, { STRIPE_SECRET_KEY: 'test-only' });
  const result = await route.POST(new Request('https://example.com', { method: 'POST', body: JSON.stringify({ customerId: 'cus_victim' }) }));
  assert.equal(result.body.url, 'https://billing.stripe.com/test'); assert.equal(customer, 'cus_owner');
});
test('reward progress remains finite at and above the final milestone', () => {
  const { rewardProgress } = moduleFrom('lib/member/model.ts', {});
  for (const points of [0, 49, 50, 100, 250, 499, 500, 700]) {
    const progress = rewardProgress(points); assert.ok(Number.isFinite(progress.percent)); assert.ok(progress.percent >= 0 && progress.percent <= 100);
  }
  assert.equal(rewardProgress(500).percent, 100);
});
