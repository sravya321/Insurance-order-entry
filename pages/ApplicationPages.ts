import { expect, Page } from '@playwright/test';
import { env } from '../config/env';
import { button, clickIfVisible, errors, field, fillIfPresent, isPresent, setDate, setField } from '../utils/ui';
import { Beneficiary, FormData } from '../data/testData';
import { file } from '../utils/files';

export const STEPS = ['client', 'address-contact', 'kyc-financial', 'product', 'riders', 'beneficiaries', 'documents', 'review'] as const;
export type Step = (typeof STEPS)[number];

/** Base for every wizard step. */
export class StepPage {
  constructor(readonly page: Page, readonly step: Step) {}
  get id(): string { const m = this.page.url().match(/\/applications\/([^/?#]+)/); return m ? m[1] : ''; }
  async open(id: string) { await this.page.goto(`/applications/${id}/${this.step}`); }
  nextBtn = () => button(this.page, /save (&|and) continue|continue|next|save (&|and) next/i);
  saveDraftBtn = () => button(this.page, /save( as)? draft|save$/i);
  async next() { await this.nextBtn().click(); }
  async saveDraft() { await this.saveDraftBtn().click(); }
  async fillForm(data: FormData) { for (const [k, v] of Object.entries(data)) await fillIfPresent(this.page, k, v); }
  errors = (t?: string | RegExp) => errors(this.page, t);
  /** Click Continue and wait for the URL to leave this step (or error to show). */
  async nextAndExpectAdvance() {
    await this.next();
    await expect(this.page).not.toHaveURL(new RegExp(`/${this.step}(\\?|$)`), { timeout: 15_000 });
  }
  async nextAndExpectBlocked() {
    await this.next();
    await expect(this.page).toHaveURL(new RegExp(`/${this.step}`));
  }
}

export class ClientPage extends StepPage {
  constructor(page: Page) { super(page, 'client'); }
  dob = () => field(this.page, /date of birth|dob|birth/i);
  async fillAll(data: FormData, dob: Date) { await this.fillForm(data); await setDate(this.page, /date of birth|dob|birth/i, dob); }
}
export class AddressPage extends StepPage { constructor(page: Page) { super(page, 'address-contact'); }
  copyCheckbox = () => this.page.getByLabel(/same as|copy|mailing.*(same|residential)|correspondence/i).first();
}
export class KycPage extends StepPage {
  constructor(page: Page) { super(page, 'kyc-financial'); }
  pepYes = () => this.page.getByLabel(/pep.*yes|yes.*pep|politically exposed.*yes/i)
    .or(this.page.locator('fieldset, div, section').filter({ hasText: /politically exposed|PEP/i }).getByLabel(/^\s*yes\s*$/i)).first();
  pepNo = () => this.page.getByLabel(/pep.*no|no.*pep|politically exposed.*no/i)
    .or(this.page.locator('fieldset, div, section').filter({ hasText: /politically exposed|PEP/i }).getByLabel(/^\s*no\s*$/i)).first();
  pepDetails = () => this.page.getByLabel(/pep (details|position|role|relationship|country)|position held|public (office|function)/i);
  declaration = () => this.page.getByRole('checkbox', { name: /declar|consent|agree|confirm/i });
  async acceptDeclarations() {
    const boxes = this.declaration();
    const n = await boxes.count();
    for (let i = 0; i < n; i++) await boxes.nth(i).check().catch(() => {});
  }
  async uploadId(path: string) { const f = this.page.locator('input[type="file"]').first(); if (await f.count()) await f.setInputFiles(path); }
}
export class ProductPage extends StepPage {
  constructor(page: Page) { super(page, 'product'); }
  faceValue = () => field(this.page, /face value|sum assured|coverage( amount)?|cover amount/i);
  async selectProduct(name: string) {
    const sel = this.page.getByLabel(/product/i).first();
    if (await isPresent(sel, 1500)) {
      const tag = await sel.evaluate((n) => n.tagName.toLowerCase());
      if (tag === 'select') { await sel.selectOption({ label: name }).catch(() => sel.selectOption({ index: 1 })); return; }
    }
    const opt = this.page.getByRole('radio', { name: new RegExp(name, 'i') }).or(this.page.getByText(new RegExp(name, 'i')).first());
    if (await isPresent(opt, 1500)) await opt.first().click();
  }
  async setFaceValue(v: number | string) { await this.faceValue().fill(String(v)); await this.faceValue().blur(); }
  async fillValid(faceValue: number = env.faceValueValid) { await this.selectProduct(env.productName); await this.setFaceValue(faceValue); }
}
export class RidersPage extends StepPage {
  constructor(page: Page) { super(page, 'riders'); }
  async addRider(name: string, coverage?: number) {
    const card = this.page.locator('li, tr, .card, [class*="rider" i], fieldset, div').filter({ hasText: new RegExp(name, 'i') }).last();
    const toggle = card.getByRole('checkbox').or(card.getByRole('button', { name: /add|select/i })).first();
    if (await isPresent(toggle, 2000)) { const t = await toggle.getAttribute('type'); if (t === 'checkbox') await toggle.check(); else await toggle.click(); }
    else await this.page.getByRole('checkbox', { name: new RegExp(name, 'i') }).first().check();
    if (coverage !== undefined) await fillIfPresent(card, /coverage|sum assured|amount|face value/i, coverage);
  }
  async removeRider(name: string) {
    const card = this.page.locator('li, tr, .card, [class*="rider" i], fieldset, div').filter({ hasText: new RegExp(name, 'i') }).last();
    const cb = card.getByRole('checkbox').first();
    if (await isPresent(cb, 1000)) await cb.uncheck(); else await card.getByRole('button', { name: /remove|delete|x/i }).first().click();
  }
}
export class BeneficiariesPage extends StepPage {
  constructor(page: Page) { super(page, 'beneficiaries'); }
  rows = () => this.page.locator('tbody tr, [data-testid*="beneficiary" i], [class*="beneficiary" i][class*="item" i], [class*="beneficiary-row" i]');
  async add(b: Beneficiary) {
    await clickIfVisible(this.page, /add (new )?beneficiary|\+ ?add|add another/i, 2500);
    const dlg = this.page.getByRole('dialog');
    const scope = (await isPresent(dlg, 800)) ? dlg : this.page;
    await setField(scope, /^(full )?name|beneficiary name/i, b.name, 'last');
    await fillIfPresent(scope, /relationship/i, b.relationship, 'last');
    if (b.type) await fillIfPresent(scope, /type|category|primary|contingent/i, b.type, 'last');
    await setDate(scope, /date of birth|dob|birth/i, b.dob, 'last');
    await setField(scope, /percentage|allocation|share|%/i, b.percentage, 'last');
    if (b.guardian) await fillIfPresent(scope, /guardian( name)?/i, b.guardian, 'last');
    if (scope !== this.page) await button(scope, /^(save|add|confirm|submit)/i).click();
    else await clickIfVisible(this.page, /^(save|add|confirm) beneficiary$|^save$/i, 1500);
  }
  async remove(index = 0) {
    await this.rows().nth(index).getByRole('button', { name: /remove|delete|trash/i }).first().click();
    await clickIfVisible(this.page, /^(yes|confirm|delete|remove)$/i, 1000);
  }
  totalText = () => this.page.getByText(/total/i).filter({ hasText: /\d/ }).first();
}
export class DocumentsPage extends StepPage {
  constructor(page: Page) { super(page, 'documents'); }
  inputs = () => this.page.locator('input[type="file"]');
  async uploadAll(fileName: string) {
    const n = await this.inputs().count();
    for (let i = 0; i < n; i++) await this.inputs().nth(i).setInputFiles(file(fileName));
  }
  async uploadFirst(fileName: string) { await this.inputs().first().setInputFiles(file(fileName)); }
  uploaded = () => this.page.getByText(/uploaded|success/i);
  rejected = () => errors(this.page).or(this.page.getByText(/not supported|invalid|unsupported|too large|exceeds|failed|rejected/i));
}
export class ReviewPage extends StepPage {
  constructor(page: Page) { super(page, 'review'); }
  submitBtn = () => button(this.page, /^submit( application)?$/i);
  errorLinks = () => this.page.locator('a, button').filter({ hasText: /fix|go to|edit|resolve|correct/i });
  async submit() { await this.submitBtn().click(); await clickIfVisible(this.page, /^(confirm|yes|submit)/i, 1500); }
}
export class StatusPage {
  constructor(readonly page: Page) {}
  async open(id: string) { await this.page.goto(`/applications/${id}/status`); }
  reference = () => this.page.getByText(/ref(erence)?(\s*(no|number|#|id))?\s*[:#-]?\s*[A-Z0-9-]{5,}/i).first();
  status = () => this.page.locator('[data-testid*="status" i], [class*="status" i], [class*="badge" i]').first();
}
