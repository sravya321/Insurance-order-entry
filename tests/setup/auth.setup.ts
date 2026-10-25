import { test as setup } from '@playwright/test';
import { authFile, env, UserKey } from '../../config/env';
import { LoginPage } from '../../pages/LoginPage';

// Logs in once per seeded user and saves storageState so UI specs start authenticated.
const users: UserKey[] = ['valid', 'new', 'draft', 'submitted'];
for (const key of users) {
  setup(`authenticate ${key}`, async ({ page }) => {
    await new LoginPage(page).loginAndWait(env.users[key], env.password);
    await page.context().storageState({ path: authFile(key) });
  });
}
