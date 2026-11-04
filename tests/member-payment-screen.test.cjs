const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const styles = new Proxy({}, { get: (_, key) => String(key) });
function load(path, imports = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { exports, process, console, require: key => key in imports ? imports[key] : require(key) });
  return exports;
}
const messages = load('lib/member/membership-message.ts');
const common = {
  '@/lib/member/membership-message': messages,
  './member.module.css': { __esModule: true, default: styles },
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
};
const unavailable = load('app/app/UnavailablePass.tsx', common);
function screen(status, online = true, preopening = false, view = 'pass') {
  const member = { id: 'qa', first_name: 'QA', membership_status: status, membership_plan: 'Gecko Wash Club', billingAvailable: true };
  const states = [view, { member, visits: [], visitsUnavailable: false }, true, false, false, '', '', false, '', false, false, null, "Gecko", online];
  let i = 0;
  const app = load('app/app/MemberApp.tsx', {
    ...common, './UnavailablePass': unavailable, './PreopeningProfile': load('app/app/PreopeningProfile.tsx', common),
    '@/lib/member/model': load('lib/member/model.ts'),
    react: { ...React, useState: () => [states[i++], () => {}], useRef: () => ({ current: 0 }), useEffect: () => {}, useCallback: fn => fn },
    'next/image': { __esModule: true, default: ({ priority, ...props }) => React.createElement('img', props) },
    'qrcode.react': { QRCodeCanvas: () => React.createElement('canvas', { id: 'braxy-member-qr' }) },
  });
  return renderToStaticMarkup(React.createElement(app.default, { preopening }));
}
test('overdue member gets recovery action, no signup detour and no usable QR', () => {
  for (const status of ['past_due', 'unpaid', 'incomplete']) {
    const html = screen(status);
    assert.match(html, /Fix payment securely/);
    assert.match(html, /payment needs attention/);
    assert.doesNotMatch(html, /braxy-member-qr|Download wash pass|href="\/join"/);
  }
});
test('recovered member sees QR again, with no failed-payment notice', () => {
  const html = screen('active');
  assert.match(html, /braxy-member-qr/);
  assert.match(html, /Download wash pass/);
  assert.doesNotMatch(html, /Fix payment securely/);
});
test('pending payment and verification outages are not called declines', () => {
  assert.match(screen('payment_pending'), /payment is still processing/);
  assert.match(screen('verification_unavailable'), /We couldn’t verify your membership/);
  assert.doesNotMatch(screen('verification_unavailable'), /payment needs attention|braxy-member-qr/);
});
test('offline recovery controls are disabled', () => {
  assert.match(screen('past_due', false), /<button[^>]*disabled=""[^>]*>Fix payment securely/);
});

test('pre-opening overrides active status and never displays an entry QR or billing control', () => {
  const html = screen('active', true, true);
  assert.match(html, /AVAILABLE AFTER OPENING/);
  assert.match(html, /not valid for wash entry/);
  assert.doesNotMatch(html, /braxy-member-qr|Download wash pass|Manage billing|Fix payment securely/);
});
test('pre-opening clubs express interest without checkout links', () => {
  const html = screen('preopening', true, true, 'plans');
  for (const plan of ['Gecko', 'Iguana', 'Dragon']) assert.match(html, new RegExp('Interested in ' + plan));
  assert.doesNotMatch(html, /href="\/join|Manage billing/);
});
test('pre-opening profile provides free registration and optional vehicle details', () => {
  const html = screen('preopening', true, true, 'garage');
  assert.match(html, /FREE PRE-OPENING REGISTRATION/);
  assert.match(html, /name="preferred_plan"/);
  assert.match(html, /type="checkbox"[^>]*required=""[^>]*name="acknowledgement"/);
  assert.doesNotMatch(html, /Manage billing|Continue to checkout/);
});
