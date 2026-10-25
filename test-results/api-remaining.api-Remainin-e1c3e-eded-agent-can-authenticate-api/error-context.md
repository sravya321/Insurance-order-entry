# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\remaining.api.spec.ts >> Remaining API coverage >> NFR-004 environment health: every seeded agent can authenticate
- Location: tests\api\remaining.api.spec.ts:66:7

# Error details

```
Error: login agent.valid@insurance.test

expect(received).toBeLessThan(expected)

Expected: < 400
Received:   404
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { ApiClient, P, validAddressPayload, validClientPayload } from '../../utils/api';
  3  | import { env } from '../../config/env';
  4  | import { dobForAge, iso } from '../../utils/dates';
  5  | import { api, asUser, expectOk, expectRejected, newApp } from './helpers';
  6  | 
  7  | const firstSubmittedId = async (c: ApiClient) => {
  8  |   const list = await c.get(api.applications); test.skip(!list.ok(), 'list endpoint differs (D-05)');
  9  |   const j = await list.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? [];
  10 |   const sub = arr.find((x: any) => /submitted/i.test(JSON.stringify(x))); test.skip(!sub, 'no submitted application for this user');
  11 |   return String(sub.id ?? sub.applicationId);
  12 | };
  13 | 
  14 | test.describe('Remaining API coverage', () => {
  15 |   test('AAPI-008 other user’s data via token is denied @security @critical', async () => {
  16 |     const o = await asUser(env.users.valid); const id = await newApp(o); const x = await asUser(env.users.draft);
  17 |     expect([401, 403, 404]).toContain((await x.get(`${api.applications}/${id}`)).status()); await o.dispose(); await x.dispose();
  18 |   });
  19 |   test('ACAPI-003 address payload with omitted mandatory fields rejected', async () => {
  20 |     const c = await asUser(env.users.valid); const id = await newApp(c); expectRejected((await c.put(P(api.address, id), {})).status()); await c.dispose();
  21 |   });
  22 |   test('KAPI-004 valid KYC/financial persisted and returned', async () => {
  23 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  24 |     const w = await c.put(P(api.kyc, id), { idType: 'Passport', idNumber: 'P1234567', annualIncome: 1200000, netWorth: 5000000, pep: false });
  25 |     test.skip(!w.ok(), 'KYC payload shape differs from assumption (D-05)');
  26 |     expect(JSON.stringify(await (await c.get(P(api.kyc, id))).json())).toMatch(/1200000/); await c.dispose();
  27 |   });
  28 |   test('PAPI-004 face value change recalculates premium (API)', async () => {
  29 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  30 |     const prem = async (fv: number) => { await c.put(P(api.product, id), { product: env.productName, faceValue: fv }); const r = await c.get(P(api.product, id)); const t = await r.text(); const m = t.match(/"premium[^"]*"\s*:\s*"?([\d.]+)/i); return m ? Number(m[1]) : null; };
  31 |     const a = await prem(env.faceValueValid); const b = await prem(env.faceValueValid * 2);
  32 |     test.skip(a === null || b === null, 'premium field not found in product response (D-05/D-07)');
  33 |     expect(b!).toBeGreaterThan(a!); await c.dispose();
  34 |   });
  35 |   test.fixme('RAPI-003 rider age ineligible rejected - BLOCKED: rider age limits not supplied (D-07)', async () => {});
  36 |   test('RAPI-004 valid riders persisted; premium reconciles with UI', async () => {
  37 |     test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
  38 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  39 |     expectOk((await c.put(P(api.riders, id), [{ name: env.riderName }])).status()); expect(await (await c.get(P(api.riders, id))).text()).toContain(env.riderName); await c.dispose();
  40 |   });
  41 |   test('BAPI-005 delete beneficiary re-validates remaining total @critical', async () => {
  42 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  43 |     const mk = (p: number, n: string) => ({ name: n, relationship: 'Spouse', dateOfBirth: iso(dobForAge(34)), percentage: p, allocation: p, type: 'Primary' });
  44 |     const w = await c.put(P(api.beneficiaries, id), [mk(60, 'AA'), mk(40, 'BB')]); test.skip(!w.ok(), 'beneficiary payload differs (D-05)');
  45 |     await c.put(P(api.beneficiaries, id), [mk(60, 'AA')]).then((r) => expectRejected(r.status(), 'removing a beneficiary leaves 60%')); await c.dispose();
  46 |   });
  47 |   test('DAPI2-002 oversized upload rejected @boundary', async () => {
  48 |     test.skip(!env.maxUploadMb, 'MAX_UPLOAD_MB not supplied (D-08)');
  49 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  50 |     const r = await c.ctx.post(c.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}) }, multipart: { file: { name: 'big.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(env.maxUploadMb! * 1024 * 1024 + 1, 0x20) } }, failOnStatusCode: false });
  51 |     expectRejected(r.status(), 'oversized'); await c.dispose();
  52 |   });
  53 |   test('DAPI2-003 valid upload then list documents', async () => {
  54 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  55 |     const r = await c.ctx.post(c.url(P(api.documents, id)), { headers: { 'X-API-Key': env.apiKey, ...(c.token ? { Authorization: `Bearer ${c.token}` } : {}) }, multipart: { file: { name: 'valid.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') } }, failOnStatusCode: false });
  56 |     test.skip(!r.ok(), `upload endpoint/field name differs from assumption (got ${r.status()}) (D-05)`);
  57 |     expect(await (await c.get(P(api.documents, id))).text()).toContain('valid.pdf'); await c.dispose();
  58 |   });
  59 |   test.fixme('RAPI2-003 submit valid application via API - BLOCKED: needs full API contract to build a valid app (D-05)', async () => {});
  60 |   test('RAPI2-004 submitting an already-submitted application is rejected / idempotent @critical', async () => {
  61 |     const c = await asUser(env.users.submitted); const id = await firstSubmittedId(c);
  62 |     const r = await c.post(P(api.submit, id)); expect([200, 400, 403, 404, 409, 422]).toContain(r.status());
  63 |     const s = await (await c.get(P(api.status, id))).text(); expect((s.match(/ref[^"]*"\s*:\s*"[^"]+"/gi) ?? []).length, 'single reference').toBeLessThanOrEqual(1); await c.dispose();
  64 |   });
  65 |   test.fixme('GAPI-004 response schema validation - BLOCKED: API schemas not supplied (D-05)', async () => {});
  66 |   test('NFR-004 environment health: every seeded agent can authenticate', async () => {
  67 |     for (const email of [env.users.valid, env.users.new, env.users.draft, env.users.submitted]) {
> 68 |       const c = await ApiClient.create(); const r = await c.login(email); expect(r.status(), `login ${email}`).toBeLessThan(400); await c.dispose();
     |                                                                                                                ^ Error: login agent.valid@insurance.test
  69 |     }
  70 |   });
  71 |   test('NFR-005 evidence capture is configured (trace/video/screenshot on failure)', async ({}, info) => {
  72 |     const u = info.project.use as any; expect(['retain-on-failure', 'on-first-retry', 'on']).toContain(u.trace ?? 'retain-on-failure');
  73 |     const cfg = require('fs').readFileSync(require('path').resolve(__dirname, '../../playwright.config.ts'), 'utf8');
  74 |     for (const k of ["trace: 'retain-on-failure'", "screenshot: 'only-on-failure'", "video: 'retain-on-failure'"]) expect(cfg).toContain(k);
  75 |   });
  76 | });
  77 | 
```