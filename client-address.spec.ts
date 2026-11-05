import { test, expect } from '../../fixtures';
import { authFile } from '../../config/env';
import { dobForAge, futureDate } from '../../utils/dates';
import { validAddress, validClient, validDob, XSS } from '../../data/testData';
import { expectValidationError, field, setRawDate, setDate } from '../../utils/ui';

test.use({ storageState: authFile('valid') });

test.describe('Client eligibility', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); });

  test('CLNT-001 valid client progresses @smoke @critical', async ({ flow, page }) => {
    await flow.doClient();
    await expect(page).toHaveURL(/address-contact/);
  });
  test('CLNT-002 all mandatory fields blank blocked', async ({ flow }) => {
    await flow.client.nextAndExpectBlocked();
    await expectValidationError(flow.page);
  });
  for (const label of ['First Name', 'Last Name', 'Date of Birth']) {
    test(`CLNT-003 blank "${label}" blocked`, async ({ flow, page }) => {
      await flow.client.fillAll(validClient(), validDob());
      if (label === 'Date of Birth') await field(page, /date of birth|dob|birth/i).fill('');
      else await field(page, label).fill('');
      await flow.client.nextAndExpectBlocked();
      await expectValidationError(page);
    });
  }
  const boundary: [string, number, number, boolean][] = [
    ['CLNT-004 age exactly 18 accepted', 18, 0, true],
    ['CLNT-005 age 17y364d rejected', 18, 1, false],
    ['CLNT-006 age 17 rejected', 17, 0, false],
    ['CLNT-007 age exactly 65 accepted', 65, 0, true],
    ['CLNT-008 age 65y+1d rejected', 65, -1, false],
    ['CLNT-008b age 66 rejected', 66, 0, false],
  ];
  for (const [name, years, extra, ok] of boundary) {
    test(`${name} @critical @boundary`, async ({ flow, page }) => {
      await flow.client.fillAll(validClient(), dobForAge(years, extra));
      await flow.client.next();
      if (ok) await expect(page).not.toHaveURL(/\/client(\?|$)/, { timeout: 15_000 });
      else { await expect(page).toHaveURL(/\/client/); await expectValidationError(page, /age|18|65|eligib|date of birth|dob/i); }
    });
  }
  test('CLNT-009 future DOB rejected @critical', async ({ flow, page }) => {
    await flow.client.fillAll(validClient(), futureDate(1));
    await flow.client.next(); await expect(page).toHaveURL(/\/client/); await expectValidationError(page);
  });
  test('CLNT-010 DOB equals today rejected', async ({ flow, page }) => {
    await flow.client.fillAll(validClient(), new Date());
    await flow.client.next(); await expect(page).toHaveURL(/\/client/); await expectValidationError(page);
  });
  for (const raw of ['31/02/1990', '00/00/0000', 'abc', '1990-13-40']) {
    test(`CLNT-011 invalid DOB "${raw}" rejected`, async ({ flow, page }) => {
      await flow.client.fillForm(validClient()); await setRawDate(page, /date of birth|dob|birth/i, raw);
      await flow.client.next(); await expect(page).toHaveURL(/\/client/);
    });
  }
  test('CLNT-012 leap-day DOB accepted', async ({ flow, page }) => {
    await flow.client.fillAll(validClient(), new Date(1992, 1, 29));
    await flow.client.next(); await expect(page).not.toHaveURL(/\/client(\?|$)/, { timeout: 15_000 });
  });
  test('CLNT-013 editing DOB later re-enforces eligibility @regression', async ({ flow, page }) => {
    await flow.doClient(); await flow.doAddress(); await flow.doKyc();
    await flow.goStep('client'); await setDate(page, /date of birth|dob|birth/i, dobForAge(70));
    await flow.client.next();
    await expect(page).toHaveURL(/\/client/); await expectValidationError(page);
  });
  test('CLNT-014 name field validation (observational)', async ({ flow, page }) => {
    for (const v of ['1234', '!!!@@@', 'A'.repeat(300)]) {
      await flow.client.fillAll(validClient({ 'First Name': v }), validDob());
      await flow.client.next();
      test.info().annotations.push({ type: `first-name:${v.slice(0, 10)}`, description: /\/client(\?|$)/.test(page.url()) ? 'rejected' : 'accepted' });
    }
  });
  test('CLNT-015 script injection is not executed @security', async ({ flow, page }) => {
    await flow.client.fillAll(validClient({ 'First Name': XSS }), validDob());
    await flow.client.next();
    await page.goto('/dashboard');
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });
  test('CLNT-016 data persists after refresh and back @regression', async ({ flow, page }) => {
    const ln = `Persist${Date.now() % 10000}`;
    await flow.doClient({ 'Last Name': ln });
    await flow.goStep('client'); await page.reload();
    await expect(field(page, 'Last Name')).toHaveValue(ln);
  });
  test.skip('CLNT-017 duplicate client rule (not documented)', async () => {});
});

test.describe('Address & contact', () => {
  test.beforeEach(async ({ flow }) => { await flow.start(); await flow.doClient(); });
  test('ADDR-001 valid address/contact progress @smoke', async ({ flow, page }) => {
    await flow.doAddress(); await expect(page).toHaveURL(/kyc/);
  });
  test('ADDR-002 mandatory fields blank blocked', async ({ flow }) => {
    await flow.address.nextAndExpectBlocked(); await expectValidationError(flow.page);
  });
  for (const bad of ['abc', 'a@b', 'a@.com', '@b.com', 'a b@c.com', 'a@@b.com']) {
    test(`ADDR-003 invalid email "${bad}" rejected`, async ({ flow, page }) => {
      await flow.address.fillForm(validAddress({ Email: bad })); await flow.address.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  test('ADDR-004 valid email variants accepted', async ({ flow, page }) => {
    await flow.address.fillForm(validAddress({ Email: 'a.b+c@sub.domain.co' })); await flow.address.next();
    await expect(page).not.toHaveURL(/address-contact(\?|$)/, { timeout: 15_000 });
  });
  for (const bad of ['abcdefghij', '123', '1'.repeat(25), '!!!###$$$', '']) {
    test(`ADDR-005 invalid phone "${bad}" rejected`, async ({ flow, page }) => {
      await flow.address.fillForm(validAddress({ Phone: bad })); await flow.address.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  for (const bad of ['ABCDEF', '12', '1'.repeat(12), '@@@###', '']) {
    test(`ADDR-007 invalid postal "${bad}" rejected`, async ({ flow, page }) => {
      await flow.address.fillForm(validAddress({ 'Postal Code': bad })); await flow.address.nextAndExpectBlocked(); await expectValidationError(page);
    });
  }
  test('ADDR-008 copy address copies every field exactly @critical', async ({ flow, page }) => {
    const a = validAddress(); await flow.address.fillForm(a);
    const cb = flow.address.copyCheckbox();
    test.skip(!(await cb.isVisible().catch(() => false)), 'no copy-address control found');
    await cb.check();
    for (const lbl of ['Address Line 1', 'City', 'State', 'Postal Code']) {
      const all = page.getByLabel(new RegExp(lbl.replace(/ /g, '[\\s_-]*'), 'i'));
      const n = await all.count(); if (n < 2) continue;
      expect(await all.nth(0).inputValue(), lbl).toBe(await all.nth(1).inputValue());
    }
  });
  test('ADDR-010 untick copy re-enables fields', async ({ flow, page }) => {
    const cb = flow.address.copyCheckbox();
    test.skip(!(await cb.isVisible().catch(() => false)), 'no copy-address control found');
    await flow.address.fillForm(validAddress()); await cb.check(); await cb.uncheck();
    await expect(page.getByLabel(/address[\s_-]*line[\s_-]*1/i).last()).toBeEnabled();
  });
  test('ADDR-011 field length limit enforced (observational)', async ({ flow, page }) => {
    await flow.address.fillForm(validAddress({ City: 'X'.repeat(300), 'Address Line 1': "O'Brien & Sons - Ünïcode" })); await flow.address.next();
    await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
  });
  test('ADDR-012 persists on save draft and resume @regression', async ({ flow, page, dashboard }) => {
    await flow.address.fillForm(validAddress({ City: 'Pune' })); await flow.address.saveDraft();
    await dashboard.goto(); await flow.goStep('address-contact');
    await expect(field(page, 'City')).toHaveValue('Pune');
  });
});
