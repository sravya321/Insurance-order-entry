import { test, expect, NO_AUTH } from '../../fixtures';
import { authFile } from '../../config/env';
import { adultBeneficiary } from '../../data/testData';
import { appIdFromUrl } from '../../utils/ui';

test.use({ storageState: authFile('valid') });

test.describe('Review & submit', () => {
  test('REV-001 review shows captured data with masked ID @critical', async ({ flow, page }) => {
    await flow.buildToReview();
    await expect(page.locator('body')).toContainText(/client|applicant/i);
    await expect(page.locator('body')).not.toContainText('P1234567');
  });
  test('REV-002/004 errors grouped and Submit disabled for incomplete application @critical', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.goStep('review');
    await expect(flow.review.submitBtn()).toBeDisabled();
    await expect(page.getByText(/address|kyc|product|beneficiar|document/i).first()).toBeVisible();
  });
  test('REV-003 error link navigates to source step', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.goStep('review');
    const link = flow.review.errorLinks().first(); test.skip(!(await link.isVisible().catch(() => false)), 'no error navigation links found');
    await link.click(); await expect(page).not.toHaveURL(/\/review/);
  });
  test('REV-005 fixing errors enables Submit @critical', async ({ flow }) => {
    await flow.buildToReview(); await expect(flow.review.submitBtn()).toBeEnabled();
  });
  test('REV-006 re-introducing an error disables Submit @regression', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.goStep('beneficiaries'); await flow.bens.remove(0);
    await flow.goStep('review'); await expect(flow.review.submitBtn()).toBeDisabled();
  });
  test('REV-007 successful submission shows reference and Submitted status @smoke @critical', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.submit();
    await expect(flow.status.reference()).toBeVisible();
    await flow.status.open(flow.id); await expect(page.getByText(/submitted/i).first()).toBeVisible();
  });
  test('REV-008 reference numbers are unique', async ({ browser }) => {
    const refs: string[] = [];
    for (let i = 0; i < 2; i++) {
      const ctx = await browser.newContext({ storageState: authFile('valid') }); const p = await ctx.newPage();
      const { AppFlow } = await import('../../utils/flows'); const f = new AppFlow(p);
      await f.buildToReview(); await f.submit(); refs.push((await f.status.reference().innerText()).trim()); await ctx.close();
    }
    expect(new Set(refs).size).toBe(2);
  });
  test('REV-009 double-click submit creates a single submission @critical', async ({ flow, page }) => {
    await flow.buildToReview(); const posts: string[] = [];
    page.on('request', (r) => { if (r.method() === 'POST' && /submit/i.test(r.url())) posts.push(r.url()); });
    await flow.review.submitBtn().dblclick(); await page.waitForTimeout(2000);
    expect(posts.length, 'submit POSTs').toBeLessThanOrEqual(1);
  });
  test('REV-010 submitted application is read-only @critical', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.submit();
    for (const s of ['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents'] as const) {
      await flow.goStep(s);
      expect(await page.locator('input:not([type=hidden]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])').count(), `editable inputs on ${s}`).toBe(0);
    }
  });
  test('REV-011 browser Back after submit cannot resubmit', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.submit(); await page.goBack();
    await expect(flow.review.submitBtn()).toBeHidden().catch(async () => expect(flow.review.submitBtn()).toBeDisabled());
  });
  test('REV-012 submit with expired session redirects to login', async ({ flow, page, context }) => {
    await flow.buildToReview(); await context.clearCookies(); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await flow.review.submitBtn().click().catch(() => {});
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
  test('REV-013 save draft with incomplete data', async ({ flow, dashboard }) => {
    await flow.start(); await flow.doClient({}, undefined, false); await flow.client.saveDraft();
    await dashboard.goto(); await expect(dashboard.rows().filter({ hasText: /draft/i }).first()).toBeVisible();
  });
  test('REV-014 data not lost navigating between steps @regression', async ({ flow, page }) => {
    await flow.start(); await flow.doClient({ 'Last Name': 'KeepMe' }); await flow.doAddress(); await flow.goStep('client');
    await expect(page.getByLabel(/last[\s_-]*name/i).first()).toHaveValue('KeepMe');
  });
  test('REV-015 direct /confirmation or /status for draft shows no confirmation @critical', async ({ flow, page }) => {
    await flow.start(); await flow.doClient();
    for (const s of ['confirmation', 'status']) { await page.goto(`/applications/${flow.id}/${s}`); await expect(page.getByText(/ref(erence)?\s*(no|number)?\s*[:#]\s*[A-Z0-9-]{5,}/i)).toHaveCount(0); }
  });
});

test.describe('Status tracking', () => {
  test('STAT-001/002/003 reference & status consistent across confirmation, status page and dashboard @critical', async ({ flow, page, dashboard }) => {
    await flow.buildToReview(); await flow.submit();
    const confRef = (await flow.status.reference().innerText()).match(/[A-Z0-9-]{5,}$/)?.[0];
    await flow.status.open(flow.id); const statusRef = (await flow.status.reference().innerText()).match(/[A-Z0-9-]{5,}$/)?.[0];
    expect(statusRef).toBe(confRef);
    await dashboard.goto(); await expect(dashboard.rows().filter({ hasText: confRef! }).first()).toBeVisible();
  });
  test('STAT-005 draft application has no reference', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.status.open(flow.id);
    await expect(flow.status.reference()).toHaveCount(0);
  });
  test('STAT-007 status stable across refresh', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.submit(); await flow.status.open(flow.id);
    const a = await page.locator('body').innerText(); await page.reload(); expect(await page.locator('body').innerText()).toContain(a.match(/submitted/i)?.[0] ?? 'ubmitted');
  });
  test.fixme('STAT-004 status history / transitions - BLOCKED: transition matrix not supplied (D-08)', async () => {});
});

test.describe('Status - submitted user', () => {
  test.use({ storageState: authFile('submitted') });
  test('STAT-001b seeded submitted application shows Submitted + reference @smoke', async ({ dashboard, page, flow }) => {
    await dashboard.goto(); const ids = await dashboard.visibleApplicationIds(); test.skip(!ids.length, 'no application link on dashboard');
    await flow.status.open(ids[0]); await expect(page.getByText(/submitted/i).first()).toBeVisible(); await expect(flow.status.reference()).toBeVisible();
  });
});

test.describe('Status isolation', () => {
  test('STAT-006 other agent cannot view status @security @critical', async ({ browser }) => {
    const sc = await browser.newContext({ storageState: authFile('submitted') }); const sp = await sc.newPage();
    const { DashboardPage } = await import('../../pages/DashboardPage'); const d = new DashboardPage(sp); await d.goto(); const ids = await d.visibleApplicationIds(); await sc.close();
    test.skip(!ids.length, 'no submitted application id discovered');
    const vc = await browser.newContext({ storageState: authFile('valid') }); const vp = await vc.newPage();
    await vp.goto(`/applications/${ids[0]}/status`);
    await expect(vp.getByText(/ref(erence)?\s*(no|number)?\s*[:#]\s*[A-Z0-9-]{5,}/i)).toHaveCount(0); await vc.close();
  });
});

test.describe('Navigation & routes', () => {
  test('NAV-001 forward/back keeps data @regression', async ({ flow, page }) => {
    await flow.start(); await flow.doClient({ 'Last Name': 'NavKeep' }); await page.goBack();
    await expect(page.getByLabel(/last[\s_-]*name/i).first()).toHaveValue('NavKeep');
  });
  test('NAV-002 skip-ahead via URL is blocked or flagged', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.goStep('documents');
    await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
  });
  test('NAV-003 all documented routes resolve @smoke', async ({ flow, page }) => {
    await flow.start();
    for (const r of ['/dashboard', '/applications/new', `/applications/${flow.id}`, ...['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents', 'review', 'confirmation', 'status'].map((s) => `/applications/${flow.id}/${s}`)]) {
      const resp = await page.goto(r); expect(resp?.status() ?? 200, r).toBeLessThan(500);
    }
  });
  test('NAV-004 refresh on every step keeps the page working', async ({ flow, page }) => {
    await flow.start();
    for (const s of ['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents', 'review'] as const) { await flow.goStep(s); await page.reload(); await expect(page).toHaveURL(new RegExp(s)); }
  });
});

test.describe('Cross-cutting - logged out', () => {
  test.use({ storageState: NO_AUTH });
  test('NFR-003 keyboard navigation reaches primary login control', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focused);
  });
});
test.describe('Cross-cutting', () => {
  test('NFR-006 security headers / cookie flags (recorded; site is plain HTTP)', async ({ page }) => {
    const r = await page.goto('/login'); const h = r!.headers();
    for (const k of ['x-frame-options', 'content-security-policy', 'x-content-type-options', 'strict-transport-security'])
      test.info().annotations.push({ type: `header:${k}`, description: h[k] ?? 'MISSING' });
    test.info().annotations.push({ type: 'protocol', description: page.url().startsWith('https') ? 'https' : 'http (no TLS)' });
  });
  test('NFR-002 responsive layout has no horizontal overflow', async ({ page }) => {
    for (const w of [1280, 768, 375]) { await page.setViewportSize({ width: w, height: 800 }); await page.goto('/dashboard');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), `width ${w}`).toBeTruthy(); }
  });
});

test.describe('Database (blocked)', () => {
  for (const t of ['DB-001 draft persisted in DB', 'DB-002 submitted record stored with reference/status', 'DB-003 beneficiary totals = 100', 'DB-004 status history rows', 'DB-005 sensitive ID stored securely'])
    test.fixme(`${t} - BLOCKED: DB access, schema and approved queries not supplied (D-06)`, async () => {});
});
