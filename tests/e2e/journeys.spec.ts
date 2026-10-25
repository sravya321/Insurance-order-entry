import { test, expect } from '../../fixtures';
import { authFile, env } from '../../config/env';
import { adultBeneficiary, minorBeneficiary } from '../../data/testData';
import { ApiClient, P } from '../../utils/api';

test.use({ storageState: authFile('valid') });

test.describe('End-to-end journeys', () => {
  test('E2E-001 happy path: login to status tracking @smoke @critical', async ({ flow, page, dashboard }) => {
    await flow.start();
    await flow.doClient(); await flow.doAddress(); await flow.doKyc(); await flow.doProduct(); await flow.doRiders();
    await flow.doBeneficiaries(); await flow.doDocuments();
    await expect(page).toHaveURL(/review/); await expect(flow.review.submitBtn()).toBeEnabled();
    await flow.submit();
    await expect(flow.status.reference()).toBeVisible();
    await flow.status.open(flow.id); await expect(page.getByText(/submitted/i).first()).toBeVisible();
    await dashboard.goto(); await expect(dashboard.rows().filter({ hasText: /submitted/i }).first()).toBeVisible();
  });
  test('E2E-002 riders + multiple beneficiaries incl. minor with guardian @critical', async ({ flow, page }) => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    await flow.start(); await flow.buildUpTo('riders'); await flow.doRiders([{ name: env.riderName }]);
    await flow.doBeneficiaries([adultBeneficiary(50), adultBeneficiary(30), minorBeneficiary(20)]); await flow.doDocuments(); await flow.submit();
    await expect(flow.status.reference()).toBeVisible();
  });
  test('E2E-004 negative-to-positive: errors on review then fix then submit @critical', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.doAddress(); await flow.doKyc(); await flow.doProduct(); await flow.doRiders();
    await flow.doBeneficiaries([adultBeneficiary(60), adultBeneficiary(30)], false);
    await flow.goStep('review'); await expect(flow.review.submitBtn()).toBeDisabled();
    await flow.goStep('beneficiaries'); await flow.bens.add(adultBeneficiary(10)); await flow.bens.nextAndExpectAdvance();
    await flow.doDocuments(); await expect(flow.review.submitBtn()).toBeEnabled(); await flow.submit();
    await expect(flow.status.reference()).toBeVisible();
  });
  test('E2E-006 UI submit then API reconciliation', async ({ flow, page }) => {
    await flow.buildToReview(); await flow.submit();
    const ref = (await flow.status.reference().innerText()).match(/[A-Z0-9-]{5,}$/)?.[0];
    const c = await ApiClient.create(); await c.login(env.users.valid);
    const r = await c.get(P(env.api.status, flow.id)); test.skip(!r.ok(), 'status endpoint differs from assumption (D-05)');
    const t = await r.text(); expect(t).toMatch(/submitted/i); if (ref) expect(t).toContain(ref); await c.dispose();
  });
  test('E2E-008 smoke: critical-path sanity @smoke', async ({ flow, page, dashboard }) => {
    await dashboard.goto(); await flow.start();
    for (const s of ['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents', 'review'] as const) {
      await flow.goStep(s); await expect(page.locator('body')).not.toContainText(/exception|stack trace|something went wrong/i);
    }
  });
});

test.describe('E2E - other personas', () => {
  test.describe('draft user', () => {
    test.use({ storageState: authFile('draft') });
    test('E2E-003 draft flow: resume seeded draft and continue @critical', async ({ dashboard, page }) => {
      await dashboard.goto(); const id = await dashboard.resumeFirstDraft(); expect(id).toBeTruthy();
      await page.goto(`/applications/${id}/review`); await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
    });
  });
  test.describe('new user', () => {
    test.use({ storageState: authFile('new') });
    test('E2E-005 first-run journey from clean state', async ({ flow, page, dashboard }) => {
      await dashboard.goto(); await flow.buildToReview(); await flow.submit(); await expect(flow.status.reference()).toBeVisible();
    });
  });
  test.describe('submitted user', () => {
    test.use({ storageState: authFile('submitted') });
    test('E2E-007 view-only regression for submitted application', async ({ dashboard, page }) => {
      await dashboard.goto(); const ids = await dashboard.visibleApplicationIds(); test.skip(!ids.length, 'no application link');
      await page.goto(`/applications/${ids[0]}/status`); await expect(page.getByText(/submitted/i).first()).toBeVisible();
    });
  });
});
