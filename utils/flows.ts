import { expect, Page } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import {
  AddressPage, BeneficiariesPage, ClientPage, DocumentsPage, KycPage, ProductPage, ReviewPage, RidersPage, STEPS, Step, StatusPage,
} from '../pages/ApplicationPages';
import { Beneficiary, FormData, adultBeneficiary, validAddress, validClient, validDob, validKyc } from '../data/testData';
import { env } from '../config/env';
import { file } from './files';

/** Drives the wizard end-to-end; each method leaves the app on the following step. */
export class AppFlow {
  id = '';
  client: ClientPage; address: AddressPage; kyc: KycPage; product: ProductPage; riders: RidersPage;
  bens: BeneficiariesPage; docs: DocumentsPage; review: ReviewPage; status: StatusPage; dash: DashboardPage;
  constructor(readonly page: Page) {
    // Built in the constructor (not field initializers) so `page` is guaranteed to be assigned first.
    this.client = new ClientPage(page); this.address = new AddressPage(page); this.kyc = new KycPage(page);
    this.product = new ProductPage(page); this.riders = new RidersPage(page); this.bens = new BeneficiariesPage(page);
    this.docs = new DocumentsPage(page); this.review = new ReviewPage(page); this.status = new StatusPage(page);
    this.dash = new DashboardPage(page);
  }

  async start(): Promise<string> { this.id = await this.dash.startNewApplication(); return this.id; }
  async goStep(step: Step) { await this.page.goto(`/applications/${this.id}/${step}`); }
  private async on(step: Step) { if (!new RegExp(`/applications/${this.id}/${step}`).test(this.page.url())) await this.goStep(step); }

  async doClient(over: FormData = {}, dob: Date = validDob(), advance = true) {
    await this.on('client'); await this.client.fillAll(validClient(over), dob); if (advance) await this.client.nextAndExpectAdvance();
  }
  async doAddress(over: FormData = {}, advance = true) {
    await this.on('address-contact'); await this.address.fillForm(validAddress(over)); if (advance) await this.address.nextAndExpectAdvance();
  }
  async doKyc(over: FormData = {}, advance = true) {
    await this.on('kyc-financial'); await this.kyc.fillForm(validKyc(over));
    await this.kyc.pepNo().check().catch(() => {});
    await this.kyc.acceptDeclarations();
    await this.kyc.uploadId(file('valid.pdf'));
    if (advance) await this.kyc.nextAndExpectAdvance();
  }
  async doProduct(faceValue: number = env.faceValueValid, advance = true) {
    await this.on('product'); await this.product.fillValid(faceValue); if (advance) await this.product.nextAndExpectAdvance();
  }
  async doRiders(riders: { name: string; coverage?: number }[] = [], advance = true) {
    await this.on('riders'); for (const r of riders) await this.riders.addRider(r.name, r.coverage); if (advance) await this.riders.nextAndExpectAdvance();
  }
  async doBeneficiaries(list: Beneficiary[] = [adultBeneficiary(100)], advance = true) {
    await this.on('beneficiaries'); for (const b of list) await this.bens.add(b); if (advance) await this.bens.nextAndExpectAdvance();
  }
  async doDocuments(fileName = 'valid.pdf', advance = true) {
    await this.on('documents'); await this.docs.uploadAll(fileName); if (advance) await this.docs.nextAndExpectAdvance();
  }
  /** Fill everything up to (not including) `stop`, leaving the app on that step. */
  async buildUpTo(stop: Step) {
    const order: Record<string, () => Promise<void>> = {
      client: () => this.doClient(), 'address-contact': () => this.doAddress(), 'kyc-financial': () => this.doKyc(),
      product: () => this.doProduct(), riders: () => this.doRiders(), beneficiaries: () => this.doBeneficiaries(), documents: () => this.doDocuments(),
    };
    for (const s of STEPS) { if (s === stop) break; await order[s](); }
    await this.on(stop);
  }
  /** A complete, valid application sitting on the Review page. */
  async buildToReview() { await this.start(); await this.buildUpTo('review'); }
  async submit(): Promise<void> { await this.on('review'); await this.review.submit(); await this.page.waitForURL(/confirmation|status/, { timeout: 20_000 }); }
  async expectSubmitDisabled() { await expect(this.review.submitBtn()).toBeDisabled(); }
}
