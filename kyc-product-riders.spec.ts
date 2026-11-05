import { test, expect } from '../../fixtures';
import { authFile, env } from '../../config/env';
import { expectValidationError, field, readPremium, errors } from '../../utils/ui';
import { validKyc } from '../../data/testData';
import { file } from '../../utils/files';

test.use({ storageState: authFile('valid') });

test.describe('KYC / Financial / Compliance', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.doClient(); await flow.doAddress(); });
  test('KYC-001 valid KYC & financial progress @smoke @critical', async ({ flow, page }) => {
    await flow.doKyc(); await expect(page).toHaveURL(/product/);
  });
  test('KYC-002 ID number masked after save @security @critical', async ({ flow, page }) => {
    await flow.doKyc(); await flow.goStep('kyc-financial');
    const body = await page.locator('body').innerText();
    const val = await field(page, /id number/i).inputValue().catch(() => '');
    expect(body.includes('P1234567') || val === 'P1234567', 'full ID visible in clear text').toBeFalsy();
  });
  test('KYC-003 ID not exposed in API responses @security @critical', async ({ flow, page }) => {
    const bodies: string[] = []; page.on('response', async (r) => { if (r.url().includes('/api/')) bodies.push(await r.text().catch(() => '')); });
    await flow.doKyc(); await flow.goStep('kyc-financial'); await page.reload(); await page.waitForLoadState('networkidle');
    expect(bodies.filter((b, i) => i > 0 && b.includes('P1234567')).length, 'GET responses containing clear ID').toBe(0);
  });
  for (const bad of ['1', 'abc', '!!!!', '00000000']) {
    test(`KYC-004 invalid ID "${bad}" rejected`, async ({ flow, page }) => {
      await flow.kyc.fillForm(validKyc({ 'ID Number': bad })); await flow.kyc.acceptDeclarations(); await flow.kyc.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  test('KYC-005 mandatory KYC evidence missing blocks progress @critical', async ({ flow, page }) => {
    await flow.kyc.fillForm(validKyc()); await flow.kyc.pepNo().check().catch(() => {}); await flow.kyc.acceptDeclarations();
    const hasUpload = (await page.locator('input[type="file"]').count()) > 0;
    test.skip(!hasUpload, 'no evidence upload on KYC step');
    await flow.kyc.next(); await expect(page).toHaveURL(/kyc-financial/); await expectValidationError(page);
  });
  test('KYC-006 valid KYC upload', async ({ flow, page }) => {
    test.skip((await page.locator('input[type="file"]').count()) === 0, 'no upload control');
    await flow.kyc.uploadId(file('valid.pdf')); await expect(page.getByText(/uploaded|success|valid\.pdf/i).first()).toBeVisible();
  });
  test('KYC-007 unsupported KYC file rejected', async ({ flow, page }) => {
    test.skip((await page.locator('input[type="file"]').count()) === 0, 'no upload control');
    await flow.kyc.uploadId(file('bad.exe')); await expect(page.getByText(/not supported|invalid|unsupported|rejected|allowed/i).first()).toBeVisible();
  });
  test('KYC-008 PEP=Yes shows mandatory conditional fields @critical', async ({ flow }) => {
    await flow.kyc.pepYes().check(); await expect(flow.kyc.pepDetails().first()).toBeVisible();
  });
  test('KYC-009 PEP=Yes with missing details blocked @critical', async ({ flow, page }) => {
    await flow.kyc.fillForm(validKyc()); await flow.kyc.pepYes().check(); await flow.kyc.acceptDeclarations();
    await flow.kyc.uploadId(file('valid.pdf')).catch(() => {});
    await flow.kyc.nextAndExpectBlocked(); await expectValidationError(page);
  });
  test('KYC-010 PEP=Yes with complete details accepted', async ({ flow, page }) => {
    await flow.kyc.fillForm(validKyc()); await flow.kyc.pepYes().check();
    const d = flow.kyc.pepDetails(); const n = await d.count();
    for (let i = 0; i < n; i++) await d.nth(i).fill('Member of Parliament');
    await flow.kyc.acceptDeclarations(); await flow.kyc.uploadId(file('valid.pdf')).catch(() => {});
    await flow.kyc.next(); await expect(page).not.toHaveURL(/kyc-financial(\?|$)/, { timeout: 15_000 });
  });
  test('KYC-011 PEP=No hides conditional fields', async ({ flow }) => {
    await flow.kyc.pepYes().check(); await flow.kyc.pepNo().check();
    await expect(flow.kyc.pepDetails().first()).toBeHidden();
  });
  test('KYC-012 required declaration unticked blocks @critical', async ({ flow, page }) => {
    await flow.kyc.fillForm(validKyc()); await flow.kyc.pepNo().check().catch(() => {});
    const boxes = await flow.kyc.declaration().count(); test.skip(boxes === 0, 'no declaration checkbox');
    await flow.kyc.uploadId(file('valid.pdf')).catch(() => {});
    await flow.kyc.nextAndExpectBlocked(); await expectValidationError(page);
  });
  for (const bad of [-1, 0, 'abc', 1e13]) {
    test(`KYC-013 invalid income "${bad}" rejected`, async ({ flow, page }) => {
      await flow.kyc.fillForm(validKyc({ 'Annual Income': bad })); await flow.kyc.acceptDeclarations(); await flow.kyc.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  test.fixme('KYC-014 affordability rule applied - BLOCKED: rule values not supplied (D-07)', async () => {});
  test.fixme('KYC-015 adequate income accepted - BLOCKED: rule values not supplied (D-07)', async () => {});
  test('KYC-017 KYC data persists after draft save/resume @regression', async ({ flow, page }) => {
    await flow.doKyc({ Employer: 'PersistCo' }, false); await flow.kyc.saveDraft().catch(() => {});
    await flow.goStep('kyc-financial'); await expect(field(page, 'Employer')).toHaveValue('PersistCo');
  });
});

test.describe('Product', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.buildUpTo('product'); });
  test('PROD-001 select eligible Whole Life product @smoke @critical', async ({ flow, page }) => {
    await flow.doProduct(); await expect(page).toHaveURL(/riders/);
  });
  test('PROD-002 premium displayed and numeric @critical', async ({ flow, page }) => {
    await flow.product.fillValid(); const p = await readPremium(page);
    expect(p, 'premium shown').not.toBeNull(); expect(p!).toBeGreaterThan(0);
  });
  test('PROD-003 face value below minimum rejected @boundary', async ({ flow, page }) => {
    test.skip(env.faceValueMin === undefined, 'FACE_VALUE_MIN not supplied (D-07)');
    await flow.product.selectProduct(env.productName); await flow.product.setFaceValue(env.faceValueMin! - 1); await flow.product.nextAndExpectBlocked(); await expectValidationError(page);
  });
  test('PROD-004 face value exactly minimum accepted @boundary', async ({ flow, page }) => {
    test.skip(env.faceValueMin === undefined, 'FACE_VALUE_MIN not supplied (D-07)');
    await flow.product.fillValid(env.faceValueMin!); await flow.product.next(); await expect(page).not.toHaveURL(/\/product(\?|$)/, { timeout: 15_000 });
  });
  test('PROD-005 face value exactly maximum accepted @boundary', async ({ flow, page }) => {
    test.skip(env.faceValueMax === undefined, 'FACE_VALUE_MAX not supplied (D-07)');
    await flow.product.fillValid(env.faceValueMax!); await flow.product.next(); await expect(page).not.toHaveURL(/\/product(\?|$)/, { timeout: 15_000 });
  });
  test('PROD-006 face value above maximum rejected @boundary', async ({ flow, page }) => {
    test.skip(env.faceValueMax === undefined, 'FACE_VALUE_MAX not supplied (D-07)');
    await flow.product.selectProduct(env.productName); await flow.product.setFaceValue(env.faceValueMax! + 1); await flow.product.nextAndExpectBlocked(); await expectValidationError(page);
  });
  for (const bad of ['0', '-1000', 'abc', '', '1.5', '1000000000000']) {
    test(`PROD-007 invalid face value "${bad}" rejected`, async ({ flow, page }) => {
      await flow.product.selectProduct(env.productName); await flow.product.setFaceValue(bad);
      await flow.product.next(); await expect(page).toHaveURL(/\/product/);
      await expect(page.locator('body')).not.toContainText(/NaN|undefined|exception/i);
    });
  }
  test('PROD-008 premium recalculates when face value changes @critical', async ({ flow, page }) => {
    await flow.product.fillValid(env.faceValueValid); const a = await readPremium(page);
    await flow.product.setFaceValue(env.faceValueValid * 2); await page.waitForTimeout(800); const b = await readPremium(page);
    expect(a).not.toBeNull(); expect(b).not.toBeNull(); expect(b!, 'higher cover -> higher premium').toBeGreaterThan(a!);
  });
  test('PROD-009 stale premium not retained after change and navigation @critical', async ({ flow, page }) => {
    await flow.product.fillValid(env.faceValueValid); await flow.product.next();
    await flow.goStep('product'); await flow.product.setFaceValue(env.faceValueValid * 2); const fresh = await readPremium(page);
    await flow.product.next(); await flow.goStep('review');
    const reviewText = (await page.locator('body').innerText()).replace(/,/g, '');
    expect(fresh).not.toBeNull(); expect(reviewText).toContain(String(fresh));
  });
  test('PROD-012 DOB change re-validates product @regression', async ({ flow, page }) => {
    await flow.doProduct(); await flow.goStep('client');
    const { setDate } = await import('../../utils/ui'); const { dobForAge } = await import('../../utils/dates');
    await setDate(page, /date of birth|dob|birth/i, dobForAge(70)); await flow.client.next();
    await expect(page).toHaveURL(/\/client/);
  });
  test('PROD-013 product selection persists on resume @regression', async ({ flow, page }) => {
    await flow.doProduct(env.faceValueValid, false); await flow.product.saveDraft().catch(() => {});
    await flow.goStep('product'); await expect(flow.product.faceValue()).toHaveValue(new RegExp(String(env.faceValueValid).replace(/(\d)(?=(\d{3})+$)/g, '$1,?')));
  });
  test.fixme('PROD-010 premium drivers (payment mode/term) - BLOCKED: premium formula not supplied (D-07)', async () => {});
  test.fixme('PROD-011 unsuitable product for client profile - BLOCKED: eligibility rules not supplied', async () => {});
});

test.describe('Riders', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.buildUpTo('riders'); });
  test('RDR-014 no rider selected is allowed @smoke', async ({ flow, page }) => {
    await flow.riders.nextAndExpectAdvance(); await expect(page).toHaveURL(/beneficiaries/);
  });
  test('RDR-001/002 add eligible rider updates premium; removal reverts', async ({ flow, page }) => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    const base = await readPremium(page);
    await flow.riders.addRider(env.riderName); await page.waitForTimeout(800);
    const withR = await readPremium(page);
    if (base !== null && withR !== null) expect(withR).toBeGreaterThan(base);
    await flow.riders.removeRider(env.riderName); await page.waitForTimeout(800);
    if (base !== null) expect(await readPremium(page)).toBe(base);
  });
  test('RDR-003 rider coverage above base rejected @critical', async ({ flow, page }) => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    await flow.riders.addRider(env.riderName, env.faceValueValid + 1); await flow.riders.next();
    await expect(page).toHaveURL(/riders/); await expectValidationError(page);
  });
  test('RDR-007 max rider count exceeded blocked @boundary', async ({ flow, page }) => {
    test.skip(!env.maxRiders || !env.riderName, 'MAX_RIDERS / rider names not supplied (D-07)');
    const boxes = page.getByRole('checkbox'); const n = await boxes.count();
    for (let i = 0; i < Math.min(n, env.maxRiders! + 1); i++) await boxes.nth(i).check().catch(() => {});
    await flow.riders.next(); await expectValidationError(page);
  });
  test('RDR-010 mutually exclusive riders cannot coexist @critical', async ({ flow, page }) => {
    test.skip(!env.exclusiveRiderA || !env.exclusiveRiderB, 'EXCLUSIVE_RIDER_A/B not supplied (D-07)');
    await flow.riders.addRider(env.exclusiveRiderA); await flow.riders.addRider(env.exclusiveRiderB).catch(() => {});
    await flow.riders.next(); await expect(page).toHaveURL(/riders/); await expectValidationError(page);
  });
  test('RDR-008 dependent rider without prerequisite blocked @critical', async ({ flow, page }) => {
    test.skip(!env.dependentRider, 'DEPENDENT_RIDER not supplied (D-07)');
    await flow.riders.addRider(env.dependentRider); await flow.riders.next(); await expect(page).toHaveURL(/riders/); await expectValidationError(page);
  });
  test('RDR-013 rider selection persists on resume @regression', async ({ flow, page }) => {
    test.skip(!env.riderName, 'RIDER_NAME not supplied (D-07)');
    await flow.riders.addRider(env.riderName); await flow.riders.saveDraft().catch(() => {}); await flow.goStep('riders');
    await expect(page.getByRole('checkbox', { name: new RegExp(env.riderName, 'i') }).first()).toBeChecked();
  });
  test.fixme('RDR-005/006 rider age limit - BLOCKED: per-rider age limits not supplied (D-07)', async () => {});
  test.fixme('RDR-012 base face value reduced below rider coverage - needs rider values (D-07)', async () => {});
});
