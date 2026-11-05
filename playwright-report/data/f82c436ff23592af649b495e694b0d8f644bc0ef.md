# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\journeys.spec.ts >> End-to-end journeys >> E2E-004 negative-to-positive: errors on review then fix then submit @critical
- Location: tests\e2e\journeys.spec.ts:25:7

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[name="mobile_number"]')

```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - main [ref=f3e2]:
    - generic [ref=f3e4]:
      - heading "500" [level=1] [ref=f3e5]
      - generic [ref=f3e6]: Server Error
  - main [ref=f3e7]:
    - generic [ref=f3e9]:
      - heading "500" [level=1] [ref=f3e10]
      - generic [ref=f3e11]: Server Error
```

# Test source

```ts
  1   | import { expect, Page } from '@playwright/test';
  2   | import { env } from '../config/env';
  3   | import { button, clickIfVisible, errors, field, fillIfPresent, isPresent, setDate, setField } from '../utils/ui';
  4   | import { Beneficiary, FormData } from '../data/testData';
  5   | import { file } from '../utils/files';
  6   | 
  7   | export const STEPS = ['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents', 'review'] as const;
  8   | export type Step = (typeof STEPS)[number];
  9   | 
  10  | /** Base for every wizard step. */
  11  | export class StepPage {
  12  |   constructor(readonly page: Page, readonly step: Step) {}
  13  |   get id(): string { const m = this.page.url().match(/\/applications\/([^/?#]+)/); return m ? m[1] : ''; }
  14  |   async open(id: string) { await this.page.goto(`/applications/${id}/${this.step}`); }
  15  |   nextBtn = () => button(this.page, /save (&|and) continue|continue|next|save (&|and) next/i);
  16  |   saveDraftBtn = () => button(this.page, /save( as)? draft|save$/i);
  17  |   async next() { await this.nextBtn().click(); }
  18  |   async saveDraft() { await this.saveDraftBtn().click(); }
  19  |   async fillForm(data: FormData) { for (const [k, v] of Object.entries(data)) await fillIfPresent(this.page, k, v); }
  20  |   errors = (t?: string | RegExp) => errors(this.page, t);
  21  |   /** Click Continue and wait for the URL to leave this step (or error to show). */
  22  |   async nextAndExpectAdvance() {
  23  |     await this.next();
  24  |     try {
  25  |       await expect(this.page).not.toHaveURL(new RegExp(`/${this.step}(\\?|$)`), { timeout: 15_000 });
  26  |     } catch (e) {
  27  |       const msgs = await this.page.locator('[role="alert"], .error, .invalid-feedback, .text-danger, .alert-danger, [class*="error" i]').allInnerTexts();
  28  |       const empty = await this.page.locator('input[required], select[required], textarea[required]').evaluateAll(
  29  |         (els) => els.filter((n) => !(n as HTMLInputElement).value).map((n) => (n as HTMLInputElement).name || n.id));
  30  |       throw new Error(`Stayed on ${this.step}. Page errors: ${JSON.stringify(msgs)}. Empty required fields: ${JSON.stringify(empty)}`);
  31  |     }
  32  |   }
  33  |   async nextAndExpectBlocked() {
  34  |     await this.next();
  35  |     await expect(this.page).toHaveURL(new RegExp(`/${this.step}`));
  36  |   }
  37  | }
  38  | export class AddressPage extends StepPage { constructor(page: Page) { super(page, 'address-contact'); }
  39  |   copyCheckbox = () => this.page.getByLabel(/same as|copy|mailing.*(same|residential)|correspondence/i).first();
  40  |   /** Fill the fields the app requires that validAddress() does not cover. */
  41  |   async completeRequired() {
  42  |     const zips = this.page.locator('input[name*="zip" i], input[name*="postal" i]');
  43  |     const zn = await zips.count();
  44  |     for (let i = 0; i < zn; i++) await zips.nth(i).fill('10001');
> 45  |     await this.page.locator('[name="mobile_number"]').fill('9876543210');
      |                                                       ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  46  |     const mode = this.page.locator('[name="preferred_communication_mode"]');
  47  |     const opts = await mode.locator('option').evaluateAll((os) =>
  48  |       os.map((o) => (o as HTMLOptionElement).value).filter((v) => v !== ''));
  49  |     if (opts.length) await mode.selectOption(opts[0]);
  50  |     await this.copyCheckbox().check().catch(() => {});
  51  |   }
  52  | }
  53  | 
  54  | export class ClientPage extends StepPage {
  55  |   constructor(page: Page) { super(page, 'client'); }
  56  |   dob = () => field(this.page, /date of birth|dob|birth/i);
  57  |   async fillAll(data: FormData, dob: Date) {
  58  |     await this.fillForm(data);
  59  |     await this.page.locator('[name="employer_name"]').fill('Acme Insurance Ltd');
  60  |     await this.page.locator('[name="employer_address"]').fill('1 Business Park, Mumbai');
  61  |     await setDate(this.page, /date of birth|dob|birth/i, dob);
  62  |   }
  63  | }
  64  | export class KycPage extends StepPage {
  65  |   constructor(page: Page) { super(page, 'kyc-financial'); }
  66  |   pepYes = () => this.page.getByLabel(/pep.*yes|yes.*pep|politically exposed.*yes/i)
  67  |     .or(this.page.locator('fieldset, div, section').filter({ hasText: /politically exposed|PEP/i }).getByLabel(/^\s*yes\s*$/i)).first();
  68  |   pepNo = () => this.page.getByLabel(/pep.*no|no.*pep|politically exposed.*no/i)
  69  |     .or(this.page.locator('fieldset, div, section').filter({ hasText: /politically exposed|PEP/i }).getByLabel(/^\s*no\s*$/i)).first();
  70  |   pepDetails = () => this.page.getByLabel(/pep (details|position|role|relationship|country)|position held|public (office|function)/i);
  71  |   declaration = () => this.page.getByRole('checkbox', { name: /declar|consent|agree|confirm/i });
  72  |   async acceptDeclarations() {
  73  |     const boxes = this.declaration();
  74  |     const n = await boxes.count();
  75  |     for (let i = 0; i < n; i++) await boxes.nth(i).check().catch(() => {});
  76  |   }
  77  |   async uploadId(path: string) { const f = this.page.locator('input[type="file"]').first(); if (await f.count()) await f.setInputFiles(path); }
  78  | }
  79  | export class ProductPage extends StepPage {
  80  |   constructor(page: Page) { super(page, 'product'); }
  81  |   faceValue = () => field(this.page, /face value|sum assured|coverage( amount)?|cover amount/i);
  82  |   async selectProduct(name: string) {
  83  |     const sel = this.page.getByLabel(/product/i).first();
  84  |     if (await isPresent(sel, 1500)) {
  85  |       const tag = await sel.evaluate((n) => n.tagName.toLowerCase());
  86  |       if (tag === 'select') { await sel.selectOption({ label: name }).catch(() => sel.selectOption({ index: 1 })); return; }
  87  |     }
  88  |     const opt = this.page.getByRole('radio', { name: new RegExp(name, 'i') }).or(this.page.getByText(new RegExp(name, 'i')).first());
  89  |     if (await isPresent(opt, 1500)) await opt.first().click();
  90  |   }
  91  |   async setFaceValue(v: number | string) { await this.faceValue().fill(String(v)); await this.faceValue().blur(); }
  92  | async fillValid(faceValue: number = env.faceValueValid) {
  93  |   await this.selectProduct(env.productName);
  94  |   await this.setFaceValue(faceValue);
  95  |   await this.setPaymentTerm();
  96  | }
  97  | async setPaymentTerm(years: string = '20') {
  98  |   const el = this.page.locator('[name="payment_term_years"]');
  99  |   const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  100 |   if (tag === 'select') {
  101 |     const opts = await el.locator('option').evaluateAll((os) =>
  102 |       os.map((o) => (o as HTMLOptionElement).value).filter((v) => v !== ''));
  103 |     await el.selectOption(opts.includes(years) ? years : opts[0]);
  104 |   } else {
  105 |     await el.fill(years);
  106 |   }
  107 | }}
  108 | export class RidersPage extends StepPage {
  109 |   constructor(page: Page) { super(page, 'riders'); }
  110 |   async addRider(name: string, coverage?: number) {
  111 |     const card = this.page.locator('li, tr, .card, [class*="rider" i], fieldset, div').filter({ hasText: new RegExp(name, 'i') }).last();
  112 |     const toggle = card.getByRole('checkbox').or(card.getByRole('button', { name: /add|select/i })).first();
  113 |     if (await isPresent(toggle, 2000)) { const t = await toggle.getAttribute('type'); if (t === 'checkbox') await toggle.check(); else await toggle.click(); }
  114 |     else await this.page.getByRole('checkbox', { name: new RegExp(name, 'i') }).first().check();
  115 |     if (coverage !== undefined) await fillIfPresent(card, /coverage|sum assured|amount|face value/i, coverage);
  116 |   }
  117 |   async removeRider(name: string) {
  118 |     const card = this.page.locator('li, tr, .card, [class*="rider" i], fieldset, div').filter({ hasText: new RegExp(name, 'i') }).last();
  119 |     const cb = card.getByRole('checkbox').first();
  120 |     if (await isPresent(cb, 1000)) await cb.uncheck(); else await card.getByRole('button', { name: /remove|delete|x/i }).first().click();
  121 |   }
  122 | }
  123 | export class BeneficiariesPage extends StepPage {
  124 |   constructor(page: Page) { super(page, 'beneficiaries'); }
  125 |   rows = () => this.page.locator('tbody tr, [data-testid*="beneficiary" i], [class*="beneficiary" i][class*="item" i], [class*="beneficiary-row" i]');
  126 |    async add(b: Beneficiary) {
  127 |     await clickIfVisible(this.page, /add (new )?beneficiary|\+ ?add|add another/i, 2500);
  128 |     const dlg = this.page.getByRole('dialog');
  129 |     const scope = (await isPresent(dlg, 800)) ? dlg : this.page;
  130 |     const inputs = await scope.locator('input, select, textarea').evaluateAll((els) =>
  131 |       els.map((e) => ({ name: (e as HTMLInputElement).name, id: e.id, type: (e as HTMLInputElement).type })));
  132 |     const buttons = await this.page.getByRole('button').allInnerTexts();
  133 |     console.log('BENEFICIARY FORM INPUTS:', JSON.stringify(inputs));
  134 |     console.log('PAGE BUTTONS:', JSON.stringify(buttons));
  135 |     await setField(scope, /^(full )?name|beneficiary name/i, b.name, 'last');
  136 |     await fillIfPresent(scope, /relationship/i, b.relationship, 'last');
  137 |     if (b.type) await fillIfPresent(scope, /type|category|primary|contingent/i, b.type, 'last');
  138 |     await setDate(scope, /date of birth|dob|birth/i, b.dob, 'last');
  139 |     await setField(scope, /percentage|allocation|share|%/i, b.percentage, 'last');
  140 |     if (b.guardian) await fillIfPresent(scope, /guardian( name)?/i, b.guardian, 'last');
  141 |     if (scope !== this.page) await button(scope, /^(save|add|confirm|submit)/i).click();
  142 |     else await clickIfVisible(this.page, /^(save|add|confirm) beneficiary$|^save$/i, 1500);
  143 |   }
  144 |   async remove(index = 0) {
  145 |     await this.rows().nth(index).getByRole('button', { name: /remove|delete|trash/i }).first().click();
```