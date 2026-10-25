import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AppFlow } from '../utils/flows';
import { ApiClient } from '../utils/api';

type Fx = { loginPage: LoginPage; dashboard: DashboardPage; flow: AppFlow; api: ApiClient };

export const test = base.extend<Fx>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboard: async ({ page }, use) => { await use(new DashboardPage(page)); },
  flow: async ({ page }, use) => { await use(new AppFlow(page)); },
  api: async ({}, use) => { const c = await ApiClient.create(); await use(c); await c.dispose(); },
  // Console errors are attached on failure to help classify app vs automation failures.
  page: async ({ page }, use, info) => {
    const logs: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
    await use(page);
    if (info.status !== info.expectedStatus && logs.length) await info.attach('console-errors', { body: logs.join('\n'), contentType: 'text/plain' });
  },
});
export { expect };
export const NO_AUTH = { cookies: [], origins: [] };
