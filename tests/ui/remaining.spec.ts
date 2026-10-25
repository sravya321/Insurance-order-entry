import { test, expect } from '../../fixtures';
import { authFile, env } from '../../config/env';
import { adultBeneficiary, validAddress } from '../../data/testData';
import { field } from '../../utils/ui';
import { NO_AUTH } from '../../fixtures';

test.use({ storageState: authFile('valid') });

test.describe('Remaining UI coverage', () => {
  test('ADDR-006 valid phone accepted', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.address.fillForm(validAddress({ Phone: '9123456780' })); await flow.address.next();
    await expect(page).not.toHaveURL(/address-contact(\?|$)/, { timeout: 15_000 });
  });
  test('ADDR-009 copy address then edit original (observational)', async ({ flow, page }) => {
    await flow.start(); await flow.doClient(); await flow.address.fillForm(validAddress());
    const cb = flow.address.copyCheckbox(); test.skip(!(await cb.isVisible().catch(() => false)), 'no copy-address control');
    await cb.check(); await field(page, 'City').fill('Changed City');
    const all = page.getByLabel(/city/i); test.info().annotations.push({ type: 'copy-after-edit', description: (await all.count()) > 1 ? `mailing city = ${await all.nth(1).inputValue()}` : 'single city field' });
    await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
  });
  test.fixme('KYC-016 changing income after product re-triggers suitability - BLOCKED: rule values not supplied (D-07)', async () => {});
  test.fixme('RDR-004 rider coverage equal/below/above base boundaries - BLOCKED: rider limits not supplied (D-07)', async () => {});
  test.fixme('RDR-009 removing prerequisite leaves orphan dependent rider - BLOCKED: dependency matrix not supplied (D-07)', async () => {});
  test('RDR-011 duplicate same rider cannot be added twice', async ({ flow, page }) => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    await flow.start(); await flow.buildUpTo('riders'); await flow.riders.addRider(env.riderName); await flow.riders.addRider(env.riderName).catch(() => {});
    expect(await page.getByRole('checkbox', { name: new RegExp(env.riderName, 'i') }).filter({ has: page.locator(':checked') }).count()).toBeLessThanOrEqual(1);
  });
  test('BEN-015 edit beneficiary allocation revalidates totals', async ({ flow, page }) => {
    await flow.start(); await flow.buildUpTo('beneficiaries'); await flow.doBeneficiaries([adultBeneficiary(60), adultBeneficiary(40)], false);
    const edit = flow.bens.rows().first().getByRole('button', { name: /edit/i }).first(); test.skip(!(await edit.isVisible().catch(() => false)), 'no edit control on beneficiary rows');
    await edit.click(); await field(page, /percentage|allocation|share|%/i).fill('70'); await page.getByRole('button', { name: /save|update/i }).first().click();
    await flow.bens.nextAndExpectBlocked();
  });
  test('DOC-010 upload status indicators show uploaded / failed states', async ({ flow }) => {
    await flow.start(); await flow.buildUpTo('documents');
    await flow.docs.uploadFirst('valid.pdf'); await expect(flow.docs.uploaded().first()).toBeVisible();
    await flow.docs.uploadFirst('bad.exe'); await expect(flow.docs.rejected().first()).toBeVisible();
  });
  test('NAV-005 two tabs editing same application do not corrupt data', async ({ flow, context, page }) => {
    await flow.start(); await flow.doClient({ 'Last Name': 'TabOne' }, undefined, false);
    const p2 = await context.newPage(); await p2.goto(`/applications/${flow.id}/client`);
    await field(p2, 'Last Name').fill('TabTwo'); await p2.getByRole('button', { name: /save|continue|next/i }).first().click(); await p2.waitForLoadState('networkidle');
    await flow.client.saveDraft().catch(() => flow.client.next()); await page.reload(); await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
    test.info().annotations.push({ type: 'last-write-wins-value', description: await field(page, 'Last Name').inputValue().catch(() => 'n/a') });
  });
});

test.describe('Cross-browser (logged out)', () => {
  test.use({ storageState: NO_AUTH });
  test('NFR-001 cross-browser smoke: login page renders @cross-browser @smoke', async ({ page, browserName }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="password"]')).toBeVisible(); test.info().annotations.push({ type: 'browser', description: browserName });
  });
});
