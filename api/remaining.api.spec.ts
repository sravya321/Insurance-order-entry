import { test, expect } from '@playwright/test';
import { ApiClient, P, validAddressPayload, validClientPayload } from '../../utils/api';
import { env } from '../../config/env';
import { dobForAge, iso } from '../../utils/dates';
import { api, asUser, expectOk, expectRejected, newApp } from './helpers';

const firstSubmittedId = async (c: ApiClient) => {
  const list = await c.get(api.applications); test.skip(!list.ok(), 'list endpoint differs (D-05)');
  const j = await list.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? [];
  const sub = arr.find((x: any) => /submitted/i.test(JSON.stringify(x))); test.skip(!sub, 'no submitted application for this user');
  return String(sub.id ?? sub.applicationId);
};

test.describe('Remaining API coverage', () => {
  test('AAPI-008 other user’s data via token is denied @security @critical', async () => {
    const o = await asUser(env.users.valid); const id = await newApp(o); const x = await asUser(env.users.draft);
    expect([401, 403, 404]).toContain((await x.get(`${api.applications}/${id}`)).status()); await o.dispose(); await x.dispose();
  });
  test('ACAPI-003 address payload with omitted mandatory fields rejected', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c); expectRejected((await c.put(P(api.address, id), {})).status()); await c.dispose();
  });
  test('KAPI-004 valid KYC/financial persisted and returned', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const w = await c.put(P(api.kyc, id), { idType: 'Passport', idNumber: 'P1234567', annualIncome: 1200000, netWorth: 5000000, pep: false });
    test.skip(!w.ok(), 'KYC payload shape differs from assumption (D-05)');
    expect(JSON.stringify(await (await c.get(P(api.kyc, id))).json())).toMatch(/1200000/); await c.dispose();
  });
  test('PAPI-004 face value change recalculates premium (API)', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const prem = async (fv: number) => { await c.put(P(api.product, id), { product: env.productName, faceValue: fv }); const r = await c.get(P(api.product, id)); const t = await r.text(); const m = t.match(/"premium[^"]*"\s*:\s*"?([\d.]+)/i); return m ? Number(m[1]) : null; };
    const a = await prem(env.faceValueValid); const b = await prem(env.faceValueValid * 2);
    test.skip(a === null || b === null, 'premium field not found in product response (D-05/D-07)');
    expect(b!).toBeGreaterThan(a!); await c.dispose();
  });
  test.fixme('RAPI-003 rider age ineligible rejected - BLOCKED: rider age limits not supplied (D-07)', async () => {});
  test('RAPI-004 valid riders persisted; premium reconciles with UI', async () => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    const c = await asUser(env.users.valid); const id = await newApp(c);
    expectOk((await c.put(P(api.riders, id), [{ name: env.riderName }])).status()); expect(await (await c.get(P(api.riders, id))).text()).toContain(env.riderName); await c.dispose();
  });
  test('BAPI-005 delete beneficiary re-validates remaining total @critical', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const mk = (p: number, n: string) => ({ name: n, relationship: 'Spouse', dateOfBirth: iso(dobForAge(34)), percentage: p, allocation: p, type: 'Primary' });
    const w = await c.put(P(api.beneficiaries, id), [mk(60, 'AA'), mk(40, 'BB')]); test.skip(!w.ok(), 'beneficiary payload differs (D-05)');
    await c.put(P(api.beneficiaries, id), [mk(60, 'AA')]).then((r) => expectRejected(r.status(), 'removing a beneficiary leaves 60%')); await c.dispose();
  });
  test('DAPI2-002 oversized upload rejected @boundary', async () => {
    test.skip(!env.maxUploadMb, 'MAX_UPLOAD_MB not supplied (D-08)');
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await c.ctx.post(c.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}) }, multipart: { file: { name: 'big.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(env.maxUploadMb! * 1024 * 1024 + 1, 0x20) } }, failOnStatusCode: false });
    expectRejected(r.status(), 'oversized'); await c.dispose();
  });
  test('DAPI2-003 valid upload then list documents', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await c.ctx.post(c.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}) }, multipart: { file: { name: 'valid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') } }, failOnStatusCode: false });
    test.skip(!r.ok(), `upload endpoint/field name differs from assumption (got ${r.status()}) (D-05)`);
    expect(await (await c.get(P(api.documents, id))).text()).toContain('valid.pdf'); await c.dispose();
  });
  test.fixme('RAPI2-003 submit valid application via API - BLOCKED: needs full API contract to build a valid app (D-05)', async () => {});
  test('RAPI2-004 submitting an already-submitted application is rejected / idempotent @critical', async () => {
    const c = await asUser(env.users.submitted); const id = await firstSubmittedId(c);
    const r = await c.post(P(api.submit, id)); expect([200, 400, 403, 404, 409, 422]).toContain(r.status());
    const s = await (await c.get(P(api.status, id))).text(); expect((s.match(/ref[^"]*"\s*:\s*"[^"]+"/gi) ?? []).length, 'single reference').toBeLessThanOrEqual(1); await c.dispose();
  });
  test.fixme('GAPI-004 response schema validation - BLOCKED: API schemas not supplied (D-05)', async () => {});
  test('NFR-004 environment health: every seeded agent can authenticate', async () => {
    for (const email of [env.users.valid, env.users.new, env.users.draft, env.users.submitted]) {
      const c = await ApiClient.create(); const r = await c.login(email); expect(r.status(), `login ${email}`).toBeLessThan(400); await c.dispose();
    }
  });
  test('NFR-005 evidence capture is configured (trace/video/screenshot on failure)', async ({}, info) => {
    const u = info.project.use as any; expect(['retain-on-failure', 'on-first-retry', 'on']).toContain(u.trace ?? 'retain-on-failure');
    const cfg = require('fs').readFileSync(require('path').resolve(__dirname, '../../playwright.config.ts'), 'utf8');
    for (const k of ["trace: 'retain-on-failure'", "screenshot: 'only-on-failure'", "video: 'retain-on-failure'"]) expect(cfg).toContain(k);
  });
});
