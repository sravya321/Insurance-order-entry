# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth-dashboard.api.spec.ts >> Authentication (API) >> AAPI-001 call without X-API-Key is rejected @critical @smoke
- Location: tests\api\auth-dashboard.api.spec.ts:7:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [401, 403]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { ApiClient } from '../../utils/api';
  3  | import { env } from '../../config/env';
  4  | import { api, asUser, expectOk, expectRejected, newApp, P } from './helpers';
  5  | 
  6  | test.describe('Authentication (API)', () => {
  7  |   test('AAPI-001 call without X-API-Key is rejected @critical @smoke', async () => {
  8  |     const c = await ApiClient.create({ key: null }); const r = await c.get(api.applications);
> 9  |     expect([401, 403]).toContain(r.status()); await c.dispose();
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  10 |   });
  11 |   test('AAPI-002 invalid X-API-Key is rejected @critical', async () => {
  12 |     const c = await ApiClient.create({ key: 'invalid-token' }); const r = await c.get(api.applications);
  13 |     expect([401, 403]).toContain(r.status()); expect(await r.text()).not.toMatch(/stack|exception at/i); await c.dispose();
  14 |   });
  15 |   test('AAPI-003 valid X-API-Key accepted @critical @smoke', async () => {
  16 |     const c = await ApiClient.create(); const r = await c.get(api.applications);
  17 |     expect(r.status(), 'valid key must not be 401/403').not.toBe(401); expect(r.status()).not.toBe(403);
  18 |     expect(r.status()).toBeLessThan(500); await c.dispose();
  19 |   });
  20 |   test('AAPI-004 login valid credentials @critical', async () => {
  21 |     const c = await ApiClient.create(); const r = await c.login(env.users.valid); expectOk(r.status(), 'login'); await c.dispose();
  22 |   });
  23 |   test('AAPI-005 login invalid credentials @critical', async () => {
  24 |     const c = await ApiClient.create(); const r = await c.login(env.users.valid, 'wrong'); expect([400, 401, 403]).toContain(r.status());
  25 |     expect(c.token).toBe(''); await c.dispose();
  26 |   });
  27 |   test('AAPI-006 login locked user @critical', async () => {
  28 |     const c = await ApiClient.create(); const r = await c.login(env.users.locked); expectRejected(r.status(), 'locked login'); expect(c.token).toBe('');
  29 |     test.info().annotations.push({ type: 'locked-response', description: `${r.status()} ${(await r.text()).slice(0, 120)}` }); await c.dispose();
  30 |   });
  31 |   for (const body of [{}, { email: env.users.valid }, { email: 123, password: {} }, 'not-json']) {
  32 |     test(`AAPI-007 login malformed payload ${JSON.stringify(body).slice(0, 40)} -> 4xx no 500`, async () => {
  33 |       const c = await ApiClient.create(); const r = await c.post(api.login, body as any); expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
  34 |     });
  35 |   }
  36 |   test('AAPI-009 logout invalidates token', async () => {
  37 |     const c = await asUser(env.users.valid); test.skip(!c.token, 'login service did not return a token');
  38 |     const old = c.token; await c.post(api.logout); const r = await c.get(api.applications);
  39 |     c.token = old; expect([401, 403]).toContain((await c.get(api.applications)).status()); await c.dispose();
  40 |   });
  41 | });
  42 | 
  43 | test.describe('Dashboard / applications (API)', () => {
  44 |   test('DAPI-001 list returns only caller records @security @critical', async () => {
  45 |     const a = await asUser(env.users.valid); const b = await asUser(env.users.draft);
  46 |     const ra = await a.get(api.applications); const rb = await b.get(api.applications);
  47 |     test.skip(!ra.ok() || !rb.ok(), 'list endpoint not available as assumed');
  48 |     const ids = async (r: any) => { const j = await r.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? j.applications ?? []; return arr.map((x: any) => String(x.id ?? x.applicationId)); };
  49 |     const ia = await ids(ra); const ib = await ids(rb);
  50 |     expect(ia.filter((x: string) => ib.includes(x)), 'shared records between users').toEqual([]); await a.dispose(); await b.dispose();
  51 |   });
  52 |   test('DAPI-002/005 create application returns id with Draft status @smoke', async () => {
  53 |     const c = await asUser(env.users.valid); const id = await newApp(c);
  54 |     const r = await c.get(P(`${api.applications}/${id}`.replace('{id}', id)));
  55 |     expectOk(r.status()); expect(JSON.stringify(await r.json())).toMatch(/draft/i); await c.dispose();
  56 |   });
  57 |   test('DAPI-003 get application by id - non-owner denied @security @critical', async () => {
  58 |     const owner = await asUser(env.users.valid); const id = await newApp(owner);
  59 |     const other = await asUser(env.users.draft); const r = await other.get(`${api.applications}/${id}`);
  60 |     expect([401, 403, 404]).toContain(r.status()); await owner.dispose(); await other.dispose();
  61 |   });
  62 |   for (const bad of ['0', '-1', 'abc', 'x'.repeat(200)]) {
  63 |     test(`DAPI-004 malformed id "${bad.slice(0, 10)}" -> 4xx`, async () => {
  64 |       const c = await asUser(env.users.valid); const r = await c.get(`${api.applications}/${bad}`); expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
  65 |     });
  66 |   }
  67 |   test('DAPI-006 status filter returns only matching', async () => {
  68 |     const c = await asUser(env.users.draft); const r = await c.get(`${api.applications}?status=Draft`); test.skip(!r.ok(), 'filter not supported as assumed');
  69 |     expect(JSON.stringify(await r.json())).not.toMatch(/"status"\s*:\s*"submitted"/i); await c.dispose();
  70 |   });
  71 | });
  72 | 
```