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
function screen(status, online = true) {
  const member = { id: 'qa', first_name: 'QA', membership_status: status, membership_plan: 'Gecko Wash Club', billingAvailable: true };
  const states = ['pass', { member, visits: [], visitsUnavailable: false }, true, false, false, '', '', false, '', false, false, null, online];
  let i = 0;
  const app = load('app/app/MemberApp.tsx', {
    ...common, './UnavailablePass': unavailable,
    '@/lib/member/model': load('lib/member/model.ts'),
    react: { ...React, useState: () => [states[i++], () => {}], useRef: () => ({ current: 0 }), useEffect: () => {}, useCallback: fn => fn },
    'next/image': { __esModule: true, default: ({ priority, ...props }) => React.createElement('img', props) },
    'qrcode.react': { QRCodeCanvas: () => React.createElement('canvas', { id: 'braxy-member-qr' }) },
  });
  return renderToStaticMarkup(React.createElement(app.default));
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
