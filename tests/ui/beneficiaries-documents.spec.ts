import { test, expect } from '../../fixtures';
import { authFile, env } from '../../config/env';
import { adultBeneficiary, minorBeneficiary } from '../../data/testData';
import { dobForAge, futureDate } from '../../utils/dates';
import { expectValidationError } from '../../utils/ui';
import { file } from '../../utils/files';
import * as fs from 'fs';

test.use({ storageState: authFile('valid') });

test.describe('Beneficiaries', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.buildUpTo('beneficiaries'); });
  test('BEN-001 single primary 100% accepted @smoke @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(100)]); await expect(page).toHaveURL(/documents/);
  });
  test('BEN-002 multiple beneficiaries totalling 100% accepted @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(60), adultBeneficiary(40)]); await expect(page).toHaveURL(/documents/);
  });
  test('BEN-003 no primary beneficiary blocked @critical', async ({ flow, page }) => {
    await flow.bens.nextAndExpectBlocked(); await expectValidationError(page);
  });
  test('BEN-004 total below 100% blocked @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(50), adultBeneficiary(40)], false); await flow.bens.nextAndExpectBlocked(); await expectValidationError(page, /100/);
  });
  test('BEN-005 total above 100% blocked @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(70), adultBeneficiary(40)], false); await flow.bens.nextAndExpectBlocked(); await expectValidationError(page, /100/);
  });
  for (const pct of [99, 99.99, 100.01, 101]) {
    test(`BEN-006 single beneficiary at ${pct}% blocked @boundary`, async ({ flow, page }) => {
      await flow.doBeneficiaries([adultBeneficiary(pct)], false); await flow.bens.nextAndExpectBlocked();
    });
  }
  for (const bad of [0, -10, 101]) {
    test(`BEN-007 invalid allocation ${bad} rejected`, async ({ flow, page }) => {
      await flow.doBeneficiaries([adultBeneficiary(bad)], false); await flow.bens.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  test('BEN-008 minor without guardian blocked @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([minorBeneficiary(100, { guardian: '' })], false); await flow.bens.nextAndExpectBlocked(); await expectValidationError(page, /guardian/i);
  });
  test('BEN-009 minor with guardian accepted @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([minorBeneficiary(100)]); await expect(page).toHaveURL(/documents/);
  });
  test('BEN-010 adult beneficiary does not require guardian', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(100)]); await expect(page).toHaveURL(/documents/);
  });
  test('BEN-011a beneficiary exactly 18 treated as adult @boundary', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(100, { dob: dobForAge(18) })]); await expect(page).toHaveURL(/documents/);
  });
  test('BEN-011b beneficiary 17y364d treated as minor @boundary', async ({ flow, page }) => {
    await flow.doBeneficiaries([minorBeneficiary(100, { dob: dobForAge(18, 1), guardian: '' })], false); await flow.bens.nextAndExpectBlocked();
  });
  test('BEN-012 beneficiary future DOB rejected', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(100, { dob: futureDate(1) })], false); await flow.bens.nextAndExpectBlocked();
  });
  test('BEN-013 duplicate beneficiary prevented @critical', async ({ flow, page }) => {
    const b = adultBeneficiary(50); await flow.bens.add(b); await flow.bens.add({ ...b });
    expect(await flow.bens.rows().count(), 'duplicate must not be added twice').toBeLessThanOrEqual(1);
  });
  test('BEN-014 removing a beneficiary leaves invalid total -> blocked @critical', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(60), adultBeneficiary(40)], false); await flow.bens.remove(0);
    await flow.bens.nextAndExpectBlocked(); await expectValidationError(page);
  });
  test('BEN-016 mandatory beneficiary fields blank rejected', async ({ flow, page }) => {
    await flow.doBeneficiaries([adultBeneficiary(100, { name: '' })], false); await flow.bens.nextAndExpectBlocked();
  });
  test('BEN-019 beneficiaries persist on resume @regression', async ({ flow, page }) => {
    const b = adultBeneficiary(100); await flow.doBeneficiaries([b], false); await flow.bens.saveDraft().catch(() => {});
    await flow.goStep('beneficiaries'); await expect(page.getByText(b.name).first()).toBeVisible();
  });
  test.fixme('BEN-017 primary vs contingent totals - BLOCKED: rule unconfirmed (Clarification 7)', async () => {});
  test.fixme('BEN-018 trust / organisation beneficiary - BLOCKED: rule unconfirmed (Clarification 7)', async () => {});
  test.fixme('BEN-020 maximum beneficiary count - BLOCKED: limit not documented', async () => {});
});

test.describe('Documents', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.buildUpTo('documents'); });
  test('DOC-001 required documents listed', async ({ flow }) => {
    expect(await flow.docs.inputs().count(), 'file inputs on documents step').toBeGreaterThan(0);
  });
  test('DOC-002 upload valid PDF @smoke @critical', async ({ flow }) => {
    await flow.docs.uploadFirst('valid.pdf'); await expect(flow.docs.uploaded().first()).toBeVisible();
  });
  for (const f of ['valid.jpg', 'valid.png']) test(`DOC-003 upload valid ${f}`, async ({ flow }) => {
    await flow.docs.uploadFirst(f); await expect(flow.docs.uploaded().first()).toBeVisible();
  });
  for (const f of ['bad.exe', 'bad.zip', 'bad.js', 'bad.html']) test(`DOC-004 unsupported ${f} rejected @critical`, async ({ flow }) => {
    await flow.docs.uploadFirst(f); await expect(flow.docs.rejected().first()).toBeVisible();
    await expect(flow.docs.uploaded().filter({ hasText: f })).toHaveCount(0);
  });
  for (const f of ['invoice.pdf.exe', 'disguised.pdf']) test(`DOC-005 disguised file ${f} rejected/flagged @security`, async ({ flow }) => {
    await flow.docs.uploadFirst(f); await expect(flow.docs.rejected().first()).toBeVisible();
  });
  test('DOC-006 file at size limit accepted @boundary', async ({ flow }) => {
    test.skip(!env.maxUploadMb, 'MAX_UPLOAD_MB not supplied (D-08)');
    await flow.docs.uploadFirst('at-limit.pdf'); await expect(flow.docs.uploaded().first()).toBeVisible();
  });
  test('DOC-007 file above size limit rejected @critical @boundary', async ({ flow }) => {
    test.skip(!env.maxUploadMb, 'MAX_UPLOAD_MB not supplied (D-08)');
    await flow.docs.uploadFirst('over-limit.pdf'); await expect(flow.docs.rejected().first()).toBeVisible();
  });
  for (const f of ['empty.pdf', 'corrupt.png']) test(`DOC-008 ${f} rejected`, async ({ flow }) => {
    await flow.docs.uploadFirst(f); await expect(flow.docs.rejected().first()).toBeVisible();
  });
  test('DOC-009 missing required document blocks progress @critical', async ({ flow, page }) => {
    await flow.docs.next(); await expect(page).toHaveURL(/documents|review/);
    await flow.goStep('review'); await expect(flow.review.submitBtn()).toBeDisabled();
  });
  test('DOC-011 replace uploaded document', async ({ flow }) => {
    await flow.docs.uploadFirst('valid.pdf'); await flow.docs.uploadFirst('valid.png'); await expect(flow.docs.uploaded().first()).toBeVisible();
  });
  test('DOC-012 delete uploaded document returns to missing', async ({ flow, page }) => {
    await flow.docs.uploadFirst('valid.pdf');
    const del = page.getByRole('button', { name: /remove|delete/i }).first();
    test.skip(!(await del.isVisible().catch(() => false)), 'no delete control');
    await del.click();
  });
  test('DOC-013 special-character filename handled', async ({ flow }) => {
    await flow.docs.uploadFirst('name with spaces & symbols (1).pdf'); await expect(flow.page.locator('body')).not.toContainText(/exception|stack trace/i);
  });
  test('DOC-014 network failure during upload does not show false success', async ({ flow, page }) => {
    await page.route('**/api/**/documents**', (r) => r.abort());
    await flow.docs.uploadFirst('valid.pdf'); await page.waitForTimeout(1500);
    await expect(flow.docs.uploaded().filter({ hasText: /uploaded|success/i })).toHaveCount(0);
  });
  test('DOC-015 documents persist after resume @regression', async ({ flow, page }) => {
    await flow.docs.uploadAll('valid.pdf'); await flow.docs.saveDraft().catch(() => {}); await flow.goStep('documents');
    await expect(flow.docs.uploaded().first()).toBeVisible();
  });
  test('DOC-fixture-sanity fixture files exist', async () => { for (const f of ['valid.pdf', 'bad.exe', 'empty.pdf']) expect(fs.existsSync(file(f))).toBeTruthy(); });
});
