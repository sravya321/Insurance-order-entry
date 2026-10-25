import { expect, Locator, Page } from '@playwright/test';
import { appIdFromUrl, button, clickIfVisible, isPresent } from '../utils/ui';

export class DashboardPage {
  constructor(readonly page: Page) {}
  async goto() { await this.page.goto('/dashboard'); await expect(this.page).toHaveURL(/\/dashboard/); }
  newApplicationBtn = () => this.page.getByRole('button', { name: /new application|create application|start application/i }).or(this.page.getByRole('link', { name: /new application|create application|start application/i })).first();
  /** Candidate rows: table rows or card/list items that look like applications. */
  rows = (): Locator => this.page.locator('tbody tr, [data-testid*="application" i], [class*="application" i][class*="row" i], [class*="application-card" i]');
  rowWith = (text: string | RegExp) => this.rows().filter({ hasText: text }).first();
  async rowCount() { return this.rows().count(); }

  /** Click New Application and return the created application id. */
  async startNewApplication(): Promise<string> {
    await this.goto();
    await this.newApplicationBtn().click();
    await this.page.waitForURL(/\/applications\//, { timeout: 20_000 });
    if (/\/applications\/new/.test(this.page.url())) {
      await clickIfVisible(this.page, /create|start|continue|next|begin/i, 3000);
      await this.page.waitForURL(/\/applications\/(?!new)[^/]+/, { timeout: 20_000 }).catch(() => {});
    }
    const id = appIdFromUrl(this.page.url());
    if (!id) throw new Error(`Could not read applicationId from URL ${this.page.url()}`);
    return id;
  }
  async resumeFirstDraft() {
    const row = this.rowWith(/draft/i);
    await expect(row, 'a Draft application row').toBeVisible();
    const act = row.getByRole('button', { name: /resume|continue|edit|open/i }).or(row.getByRole('link', { name: /resume|continue|edit|open/i })).first();
    if (await isPresent(act, 1500)) await act.click(); else await row.click();
    await this.page.waitForURL(/\/applications\/(?!new)[^/]+/);
    return appIdFromUrl(this.page.url());
  }
  async openRow(text: string | RegExp) {
    const row = this.rowWith(text);
    const act = row.getByRole('link').or(row.getByRole('button', { name: /view|open|status|resume/i })).first();
    if (await isPresent(act, 1500)) await act.click(); else await row.click();
  }
  async applyStatusFilter(status: string) {
    const sel = this.page.getByLabel(/status/i).first();
    if (await isPresent(sel, 1500)) {
      const tag = await sel.evaluate((n) => n.tagName.toLowerCase());
      if (tag === 'select') await sel.selectOption({ label: status }); else { await sel.click(); await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click(); }
    } else {
      await button(this.page, new RegExp(`^${status}$`, 'i')).click();
    }
  }
  async search(q: string) {
    const box = this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i)).first();
    await box.fill(q); await box.press('Enter');
  }
  /** Application ids present on the page via links. */
  async visibleApplicationIds(): Promise<string[]> {
    const hrefs = await this.page.locator('a[href*="/applications/"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') || ''));
    return [...new Set(hrefs.map((h) => appIdFromUrl(h)).filter((x): x is string => !!x))];
  }
}
