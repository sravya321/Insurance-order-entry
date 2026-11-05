import { test, expect } from '@playwright/test';
import { env } from '../../config/env';
import { dobForAge, futureDate, iso } from '../../utils/dates';
import { validAddressPayload, validClientPayload, P } from '../../utils/api';
import { api, asUser, expectOk, expectRejected, newApp } from './helpers';

const put = (c: any, tpl: string, id: string, body: unknown) => c.put(P(tpl, id), body);

test.describe('Client (API)', () => {
  test('CAPI-001 valid client payload stored @smoke', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await put(c, api.client, id, validClientPayload(iso(dobForAge(35)))); expectOk(r.status(), 'client'); await c.dispose();
  });
  const cases: [string, Date, boolean][] = [
    ['CAPI-002 age 17 rejected (UI/API parity)', dobForAge(17), false],
    ['CAPI-003 age 66 rejected', dobForAge(66), false],
    ['CAPI-004 future DOB rejected', futureDate(1), false],
    ['CAPI-005a age 18 accepted', dobForAge(18), true],
    ['CAPI-005b age 65 accepted', dobForAge(65), true],
  ];
  for (const [name, dob, ok] of cases) test(`${name} @critical @boundary`, async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await put(c, api.client, id, validClientPayload(iso(dob)));
    ok ? expectOk(r.status(), name) : expectRejected(r.status(), `${name} (200 means UI-only validation = DEFECT)`); await c.dispose();
  });
  for (const [n, body] of [['omit mandatory', {}], ['wrong types', { firstName: 123, dateOfBirth: {} }], ['nulls', { firstName: null, lastName: null, dateOfBirth: null }]] as const)
    test(`CAPI-006 ${n} -> 4xx, no 500`, async () => {
      const c = await asUser(env.users.valid); const id = await newApp(c); const r = await put(c, api.client, id, body);
      expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
    });
  test('CAPI-007 update other user’s application denied @security @critical', async () => {
    const o = await asUser(env.users.valid); const id = await newApp(o); const x = await asUser(env.users.draft);
    const r = await put(x, api.client, id, validClientPayload(iso(dobForAge(35)))); expect([401, 403, 404]).toContain(r.status()); await o.dispose(); await x.dispose();
  });
});

test.describe('Address & contact / KYC (API)', () => {
  for (const [k, v] of [['email', 'abc'], ['phone', 'abc'], ['postalCode', '@@@']] as const)
    test(`ACAPI-001 invalid ${k} rejected`, async () => {
      const c = await asUser(env.users.valid); const id = await newApp(c);
      await put(c, api.client, id, validClientPayload(iso(dobForAge(35))));
      const r = await put(c, api.address, id, { ...validAddressPayload(), [k]: v }); expectRejected(r.status(), k); await c.dispose();
    });
  test('ACAPI-002 valid address stored', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); const r = await put(c, api.address, id, validAddressPayload()); expectOk(r.status()); await c.dispose();
  });
  test('KAPI-001 PEP=true without details rejected @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await put(c, api.kyc, id, { idType: 'Passport', idNumber: 'P1234567', annualIncome: 1200000, pep: true, isPep: true }); expectRejected(r.status(), 'PEP w/o details'); await c.dispose();
  });
  test('KAPI-002 sensitive ID masked in responses @security @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const w = await put(c, api.kyc, id, { idType: 'Passport', idNumber: 'P1234567', annualIncome: 1200000, pep: false });
    test.skip(!w.ok(), 'KYC payload shape differs from assumption (D-05)');
    const g = await c.get(P(api.kyc, id)); expect(await g.text()).not.toContain('P1234567'); await c.dispose();
  });
  for (const bad of [-1, 'abc'])
    test(`KAPI-003 invalid income ${bad} rejected`, async () => {
      const c = await asUser(env.users.valid); const id = await newApp(c);
      const r = await put(c, api.kyc, id, { idType: 'Passport', idNumber: 'P1234567', annualIncome: bad, pep: false }); expectRejected(r.status()); await c.dispose();
    });
});

test.describe('Product & riders (API)', () => {
  test('PAPI-003/005 invalid product payloads rejected, no 500', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    for (const body of [{}, { productCode: 'UNKNOWN', faceValue: 'abc' }, { faceValue: -1 }]) {
      const r = await put(c, api.product, id, body); expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500);
    } await c.dispose();
  });
  test('PAPI-002 face value below min / above max rejected @boundary', async () => {
    test.skip(env.faceValueMin === undefined || env.faceValueMax === undefined, 'limits not supplied (D-07)');
    const c = await asUser(env.users.valid); const id = await newApp(c);
    for (const v of [env.faceValueMin! - 1, env.faceValueMax! + 1]) expectRejected((await put(c, api.product, id, { product: env.productName, faceValue: v })).status(), `faceValue ${v}`); await c.dispose();
  });
  test('PAPI-001 API premium equals UI premium', async () => { test.fixme(true, 'BLOCKED: premium formula / service path not supplied (D-05, D-07)'); });
  test('RAPI-001 rider coverage above base rejected @critical', async () => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    const c = await asUser(env.users.valid); const id = await newApp(c);
    await put(c, api.product, id, { product: env.productName, faceValue: env.faceValueValid });
    expectRejected((await put(c, api.riders, id, [{ name: env.riderName, coverage: env.faceValueValid + 1 }])).status()); await c.dispose();
  });
  test('RAPI-002 exclusive riders rejected @critical', async () => {
    test.skip(!env.exclusiveRiderA || !env.exclusiveRiderB, 'exclusive riders not supplied (D-07)');
    const c = await asUser(env.users.valid); const id = await newApp(c);
    expectRejected((await put(c, api.riders, id, [{ name: env.exclusiveRiderA }, { name: env.exclusiveRiderB }])).status()); await c.dispose();
  });
});

test.describe('Beneficiaries & documents (API)', () => {
  const ben = (pct: number, dob: Date = dobForAge(34), over: Record<string, unknown> = {}) => ({ name: `B${Math.random().toString(36).slice(2, 7)}`, relationship: 'Spouse', dateOfBirth: iso(dob), percentage: pct, allocation: pct, type: 'Primary', ...over });
  for (const [n, list] of [['total 90', [ben(90)]], ['total 110', [ben(60), ben(50)]]] as const)
    test(`BAPI-001 allocation ${n} rejected @critical`, async () => {
      const c = await asUser(env.users.valid); const id = await newApp(c); expectRejected((await put(c, api.beneficiaries, id, list)).status(), n); await c.dispose();
    });
  test('BAPI-002 minor without guardian rejected @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); expectRejected((await put(c, api.beneficiaries, id, [ben(100, dobForAge(8))])).status()); await c.dispose();
  });
  test('BAPI-003 duplicate beneficiary rejected @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); const b = ben(50); expectRejected((await put(c, api.beneficiaries, id, [b, { ...b }])).status()); await c.dispose();
  });
  test('BAPI-004 valid beneficiaries 60/40 stored', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); const r = await put(c, api.beneficiaries, id, [ben(60), ben(40)]); expectOk(r.status()); await c.dispose();
  });
  test('DAPI2-001 oversized / unsupported upload rejected @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await c.ctx.post(c.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}) }, multipart: { file: { name: 'bad.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ' + 'x'.repeat(200)) } }, failOnStatusCode: false });
    expectRejected(r.status(), 'unsupported .exe upload'); await c.dispose();
  });
  test('DAPI2-004 upload to another user’s application denied @security', async () => {
    const o = await asUser(env.users.valid); const id = await newApp(o); const x = await asUser(env.users.draft);
    const r = await x.ctx.post(x.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(x.token ? { Authorization: `Bearer ${x.token}` } : {}) }, multipart: { file: { name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') } }, failOnStatusCode: false });
    expect([401, 403, 404]).toContain(r.status()); await o.dispose(); await x.dispose();
  });
});

test.describe('Review / submit / status (API)', () => {
  test('RAPI2-001 validation service lists errors for incomplete app', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); const r = await c.get(P(api.validate, id)).then((x) => x.ok() ? x : c.post(P(api.validate, id)));
    test.skip(!r.ok(), 'validation endpoint differs (D-05)'); expect((await r.text()).length).toBeGreaterThan(2); await c.dispose();
  });
  test('RAPI2-002 submit incomplete application rejected @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); const r = await c.post(P(api.submit, id));
    expectRejected(r.status(), 'submitting an incomplete app (200 = DEFECT: UI-only validation)');
    const s = await c.get(P(api.status, id)); if (s.ok()) expect(await s.text()).not.toMatch(/submitted/i); await c.dispose();
  });
  test('RAPI2-005 / CAPI-008 edit after submit rejected @critical', async () => {
    const c = await asUser(env.users.submitted);
    const list = await c.get(api.applications); test.skip(!list.ok(), 'list endpoint differs');
    const j = await list.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? []; const sub = arr.find((x: any) => /submitted/i.test(JSON.stringify(x))); test.skip(!sub, 'no submitted application found');
    const id = String(sub.id ?? sub.applicationId);
    expectRejected((await put(c, api.client, id, validClientPayload(iso(dobForAge(40))))).status(), 'editing submitted'); await c.dispose();
  });
  test('RAPI2-006 mass assignment of status/reference ignored @security', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    await put(c, api.client, id, { ...validClientPayload(iso(dobForAge(35))), status: 'Submitted', referenceNumber: 'HACK-0001' });
    const s = await c.get(P(api.status, id)); if (s.ok()) { const t = await s.text(); expect(t).not.toMatch(/HACK-0001/); expect(t).not.toMatch(/submitted/i); } await c.dispose();
  });
  test('SAPI-001 status API for submitted app returns reference', async () => {
    const c = await asUser(env.users.submitted); const list = await c.get(api.applications); test.skip(!list.ok(), 'list endpoint differs');
    const j = await list.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? []; const sub = arr.find((x: any) => /submitted/i.test(JSON.stringify(x))); test.skip(!sub, 'no submitted application');
    const r = await c.get(P(api.status, String(sub.id ?? sub.applicationId))); expectOk(r.status()); expect(await r.text()).toMatch(/submitted/i); await c.dispose();
  });
  test('SAPI-002 status for unknown / other user’s app denied', async () => {
    const c = await asUser(env.users.valid); expect([400, 401, 403, 404]).toContain((await c.get(P(api.status, '999999999'))).status()); await c.dispose();
  });
});

test.describe('General API', () => {
  test('GAPI-001 error responses share a consistent JSON structure', async () => {
    const c = await asUser(env.users.valid); const shapes = new Set<string>();
    for (const r of [await c.get(`${api.applications}/999999999`), await c.post(api.login, {}), await c.put(P(api.client, '999999999'), {})]) {
      const j = await r.json().catch(() => null); if (j && typeof j === 'object') shapes.add(Object.keys(j).sort().join(','));
    }
    test.info().annotations.push({ type: 'error-shapes', description: [...shapes].join(' | ') }); expect(shapes.size, 'distinct error shapes').toBeLessThanOrEqual(2); await c.dispose();
  });
  test('GAPI-002 malformed JSON and wrong content-type -> 4xx', async () => {
    const c = await asUser(env.users.valid);
    const r = await c.raw('POST', api.applications, { data: '{bad json', headers: { 'Content-Type': 'application/json', 'X-API-Key': env.apiKey } });
    expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
  });
  test('GAPI-003 unsupported method -> 405', async () => {
    const c = await asUser(env.users.valid); const r = await c.raw('DELETE', api.login, { headers: { 'X-API-Key': env.apiKey } }); expect([404, 405]).toContain(r.status()); await c.dispose();
  });
  test('GAPI-005 injection payloads do not cause 500 @security', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await put(c, api.client, id, { firstName: "'; DROP TABLE users;--", lastName: '<script>alert(1)</script>', dateOfBirth: iso(dobForAge(35)) });
    expect(r.status()).toBeLessThan(500); await c.dispose();
  });
  test('GAPI-006 response time baseline recorded', async () => {
    const c = await asUser(env.users.valid); const t0 = Date.now(); await c.get(api.applications);
    test.info().annotations.push({ type: 'list-ms', description: String(Date.now() - t0) }); await c.dispose();
  });
});
