import { test, expect } from '@playwright/test';
import { ApiClient } from '../../utils/api';
import { env } from '../../config/env';
import { api, asUser, expectOk, expectRejected, newApp, P } from './helpers';

test.describe('Authentication (API)', () => {
  test('AAPI-001 call without X-API-Key is rejected @critical @smoke', async () => {
    const c = await ApiClient.create({ key: null }); const r = await c.get(api.applications);
    expect([401, 403]).toContain(r.status()); await c.dispose();
  });
  test('AAPI-002 invalid X-API-Key is rejected @critical', async () => {
    const c = await ApiClient.create({ key: 'invalid-token' }); const r = await c.get(api.applications);
    expect([401, 403]).toContain(r.status()); expect(await r.text()).not.toMatch(/stack|exception at/i); await c.dispose();
  });
  test('AAPI-003 valid X-API-Key accepted @critical @smoke', async () => {
    const c = await ApiClient.create(); const r = await c.get(api.applications);
    expect(r.status(), 'valid key must not be 401/403').not.toBe(401); expect(r.status()).not.toBe(403);
    expect(r.status()).toBeLessThan(500); await c.dispose();
  });
  test('AAPI-004 login valid credentials @critical', async () => {
    const c = await ApiClient.create(); const r = await c.login(env.users.valid); expectOk(r.status(), 'login'); await c.dispose();
  });
  test('AAPI-005 login invalid credentials @critical', async () => {
    const c = await ApiClient.create(); const r = await c.login(env.users.valid, 'wrong'); expect([400, 401, 403]).toContain(r.status());
    expect(c.token).toBe(''); await c.dispose();
  });
  test('AAPI-006 login locked user @critical', async () => {
    const c = await ApiClient.create(); const r = await c.login(env.users.locked); expectRejected(r.status(), 'locked login'); expect(c.token).toBe('');
    test.info().annotations.push({ type: 'locked-response', description: `${r.status()} ${(await r.text()).slice(0, 120)}` }); await c.dispose();
  });
  for (const body of [{}, { email: env.users.valid }, { email: 123, password: {} }, 'not-json']) {
    test(`AAPI-007 login malformed payload ${JSON.stringify(body).slice(0, 40)} -> 4xx no 500`, async () => {
      const c = await ApiClient.create(); const r = await c.post(api.login, body as any); expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
    });
  }
  test('AAPI-009 logout invalidates token', async () => {
    const c = await asUser(env.users.valid); test.skip(!c.token, 'login service did not return a token');
    const old = c.token; await c.post(api.logout); const r = await c.get(api.applications);
    c.token = old; expect([401, 403]).toContain((await c.get(api.applications)).status()); await c.dispose();
  });
});

test.describe('Dashboard / applications (API)', () => {
  test('DAPI-001 list returns only caller records @security @critical', async () => {
    const a = await asUser(env.users.valid); const b = await asUser(env.users.draft);
    const ra = await a.get(api.applications); const rb = await b.get(api.applications);
    test.skip(!ra.ok() || !rb.ok(), 'list endpoint not available as assumed');
    const ids = async (r: any) => { const j = await r.json(); const arr = Array.isArray(j) ? j : j.items ?? j.data ?? j.applications ?? []; return arr.map((x: any) => String(x.id ?? x.applicationId)); };
    const ia = await ids(ra); const ib = await ids(rb);
    expect(ia.filter((x: string) => ib.includes(x)), 'shared records between users').toEqual([]); await a.dispose(); await b.dispose();
  });
  test('DAPI-002/005 create application returns id with Draft status @smoke', async () => {
    const c = await asUser(env.users.valid); const id = await newApp(c);
    const r = await c.get(P(`${api.applications}/${id}`.replace('{id}', id)));
    expectOk(r.status()); expect(JSON.stringify(await r.json())).toMatch(/draft/i); await c.dispose();
  });
  test('DAPI-003 get application by id - non-owner denied @security @critical', async () => {
    const owner = await asUser(env.users.valid); const id = await newApp(owner);
    const other = await asUser(env.users.draft); const r = await other.get(`${api.applications}/${id}`);
    expect([401, 403, 404]).toContain(r.status()); await owner.dispose(); await other.dispose();
  });
  for (const bad of ['0', '-1', 'abc', 'x'.repeat(200)]) {
    test(`DAPI-004 malformed id "${bad.slice(0, 10)}" -> 4xx`, async () => {
      const c = await asUser(env.users.valid); const r = await c.get(`${api.applications}/${bad}`); expect(r.status()).toBeGreaterThanOrEqual(400); expect(r.status()).toBeLessThan(500); await c.dispose();
    });
  }
  test('DAPI-006 status filter returns only matching', async () => {
    const c = await asUser(env.users.draft); const r = await c.get(`${api.applications}?status=Draft`); test.skip(!r.ok(), 'filter not supported as assumed');
    expect(JSON.stringify(await r.json())).not.toMatch(/"status"\s*:\s*"submitted"/i); await c.dispose();
  });
});
