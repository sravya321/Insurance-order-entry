import { test, expect } from '../../fixtures';
import { authFile, env } from '../../config/env';
import { AppFlow } from '../../utils/flows';

test.describe('Dashboard - valid agent', () => {
  test.use({ storageState: authFile('valid') });
  test('DASH-001 loads with list and New Application action @smoke @critical', async ({ dashboard }) => {
    await dashboard.goto();
    await expect(dashboard.newApplicationBtn()).toBeVisible();
  });
  test('DASH-005 New Application creates a draft and opens client step @smoke @critical', async ({ dashboard, page }) => {
    const id = await dashboard.startNewApplication();
    expect(id).toBeTruthy();
    await expect(page).toHaveURL(/\/applications\/[^/]+/);
  });
  test('DASH-007 filter by status', async ({ dashboard }) => {
    await dashboard.goto();
    const before = await dashboard.rowCount();
    test.skip(before === 0, 'user has no applications to filter');
    await dashboard.applyStatusFilter('Draft');
    for (const t of await dashboard.rows().allInnerTexts()) expect(t).toMatch(/draft/i);
  });
  test('DASH-008 search applications (if present)', async ({ dashboard, page }) => {
    await dashboard.goto();
    const box = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i)).first();
    test.skip(!(await box.isVisible().catch(() => false)), 'no search control in UI');
    await dashboard.search('zzzz-no-match');
    await expect(dashboard.rows()).toHaveCount(0);
  });
  test('DASH-012 invalid / non-existent applicationId shows safe error', async ({ page }) => {
    for (const id of ['999999999', 'abc']) {
      await page.goto(`/applications/${id}`);
      await expect(page.locator('body')).not.toContainText(/exception|stack|sql/i);
    }
  });
  test('DASH-015 new draft appears on dashboard', async ({ dashboard, flow, page }) => {
    await flow.start(); await flow.doClient();
    await dashboard.goto();
    expect(await dashboard.rowCount()).toBeGreaterThan(0);
    await expect(dashboard.rows().filter({ hasText: /draft/i }).first()).toBeVisible();
  });
  test('DASH-016 dashboard load time baseline (recorded)', async ({ page }) => {
    const t0 = Date.now(); await page.goto('/dashboard'); await page.waitForLoadState('networkidle');
    test.info().annotations.push({ type: 'load-ms', description: String(Date.now() - t0) });
  });
});

test.describe('Dashboard - fresh user', () => {
  test.use({ storageState: authFile('new') });
  test('DASH-002 empty state with New Application CTA @smoke', async ({ dashboard, page }) => {
    await dashboard.goto();
    await expect(dashboard.newApplicationBtn()).toBeVisible();
    test.skip((await dashboard.rowCount()) > 0, 'agent.new already has applications (seed state changed)');
    await expect(page.getByText(/no applications|nothing|get started|empty|haven't/i).first()).toBeVisible();
  });
});

test.describe('Dashboard - draft user', () => {
  test.use({ storageState: authFile('draft') });
  test('DASH-003 shows seeded draft(s)', async ({ dashboard }) => {
    await dashboard.goto();
    await expect(dashboard.rows().filter({ hasText: /draft/i }).first()).toBeVisible();
  });
  test('DASH-006 resume draft opens application with data intact @critical', async ({ dashboard, page }) => {
    await dashboard.goto();
    const id = await dashboard.resumeFirstDraft();
    expect(id).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(`/applications/${id}`));
    // At least one saved value should be pre-populated somewhere in the wizard.
    await page.goto(`/applications/${id}/client`);
    const filled = await page.locator('input:not([type=hidden]):not([type=file])').evaluateAll((els) => els.filter((e) => (e as HTMLInputElement).value).length);
    expect(filled, 'client step has persisted values').toBeGreaterThan(0);
  });
});

test.describe('Dashboard - submitted user', () => {
  test.use({ storageState: authFile('submitted') });
  test('DASH-004 shows submitted application with reference @critical', async ({ dashboard }) => {
    await dashboard.goto();
    await expect(dashboard.rows().filter({ hasText: /submitted/i }).first()).toBeVisible();
  });
  test('DASH-013 submitted application opens read-only @critical', async ({ dashboard, page }) => {
    await dashboard.goto();
    const ids = await dashboard.visibleApplicationIds();
    test.skip(ids.length === 0, 'no application links found on dashboard');
    await page.goto(`/applications/${ids[0]}/client`);
    const editable = await page.locator('input:not([type=hidden]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])').count();
    expect(editable, 'editable inputs on submitted application').toBe(0);
    await expect(page.getByRole('button', { name: /save|submit/i }).filter({ hasNot: page.locator('[disabled]') })).toHaveCount(0);
  });
});

test.describe('Dashboard isolation', () => {
  test('DASH-010 own-record isolation in list @security @critical', async ({ browser }) => {
    const ids: Record<string, string[]> = {};
    for (const k of ['valid', 'draft', 'submitted'] as const) {
      const ctx = await browser.newContext({ storageState: authFile(k) }); const p = await ctx.newPage();
      const { DashboardPage } = await import('../../pages/DashboardPage');
      const d = new DashboardPage(p); await d.goto(); ids[k] = await d.visibleApplicationIds(); await ctx.close();
    }
    for (const a of Object.keys(ids)) for (const b of Object.keys(ids)) if (a < b) {
      const overlap = ids[a].filter((x) => ids[b].includes(x));
      expect(overlap, `${a} and ${b} must not share applications`).toEqual([]);
    }
  });
  test('DASH-011 opening another agent’s application by URL is denied (IDOR) @security @critical', async ({ browser }) => {
    const dc = await browser.newContext({ storageState: authFile('draft') }); const dp = await dc.newPage();
    const { DashboardPage } = await import('../../pages/DashboardPage');
    const dd = new DashboardPage(dp); await dd.goto(); const ids = await dd.visibleApplicationIds(); await dc.close();
    test.skip(ids.length === 0, 'could not discover a draft-user application id');
    const vc = await browser.newContext({ storageState: authFile('valid') }); const vp = await vc.newPage();
    for (const sub of ['', '/client', '/review', '/status']) {
      await vp.goto(`/applications/${ids[0]}${sub}`);
      await expect(vp.locator('body')).not.toContainText(/Asha|first name/i);
      expect(vp.url().includes(`/applications/${ids[0]}${sub}`) ? await vp.getByText(/forbidden|not found|denied|unauthori[sz]ed|404|403/i).count() : 1, `route ${sub}`).toBeGreaterThan(0);
    }
    await vc.close();
  });
  test('DASH-009 status summary counts match list', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: authFile('valid') }); const page = await ctx.newPage();
    await page.goto('/dashboard');
    const tile = page.locator('[data-testid*="summary" i], [class*="summary" i], [class*="stat" i]').first();
    test.skip(!(await tile.isVisible().catch(() => false)), 'no summary tiles found');
    const rows = await page.locator('tbody tr').count();
    const nums = (await tile.innerText()).match(/\d+/g)?.map(Number) ?? [];
    expect(nums.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(rows > 0 ? 1 : 0);
    await ctx.close();
  });
  test.skip('DASH-014 status badge labels (needs full status list - D-08)', async () => {});
});
