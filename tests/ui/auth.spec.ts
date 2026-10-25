import { test, expect, NO_AUTH } from '../../fixtures';
import { env } from '../../config/env';
import { SQLI, XSS } from '../../data/testData';

test.use({ storageState: NO_AUTH });
test.describe('Authentication (UI)', () => {
  test('AUTH-001 valid agent login lands on dashboard @smoke @critical', async ({ loginPage, page }) => {
    await loginPage.loginAndWait(env.users.valid, env.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(loginPage.error()).toHaveCount(0);
  });
  test('AUTH-002 login page renders all controls @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.email()).toBeVisible();
    await expect(loginPage.password()).toHaveAttribute('type', 'password');
    await expect(loginPage.submit()).toBeEnabled();
  });
  test('AUTH-003 login with Enter key', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.email().fill(env.users.valid);
    await loginPage.password().fill(env.password);
    await loginPage.password().press('Enter');
    await expect(page).toHaveURL(/\/dashboard/);
  });
  test('AUTH-004 logout ends session and blocks back/direct access @critical', async ({ loginPage, page }) => {
    await loginPage.loginAndWait(env.users.valid, env.password);
    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);
    await page.goBack();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
  test('AUTH-005 session survives refresh', async ({ loginPage, page }) => {
    await loginPage.loginAndWait(env.users.valid, env.password);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });
  test('AUTH-006 wrong password rejected @critical', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.login(env.users.valid, 'WrongPass@1');
    await loginPage.expectOnLogin();
    await expect(loginPage.error(/invalid|incorrect|wrong|failed|credentials/i)).toBeVisible();
  });
  test('AUTH-007 unregistered email rejected @critical', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.login('nouser@insurance.test', env.password);
    await loginPage.expectOnLogin();
    await expect(loginPage.error(/invalid|incorrect|wrong|failed|credentials|not found/i)).toBeVisible();
  });
  test('AUTH-008 blank email and password', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.submit().click();
    await loginPage.expectOnLogin();
    await expect(loginPage.error(/required|enter|cannot be (blank|empty)/i).first()).toBeVisible();
  });
  test('AUTH-009 blank email only', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.password().fill(env.password); await loginPage.submit().click();
    await loginPage.expectOnLogin(); await expect(loginPage.error().first()).toBeVisible();
  });
  test('AUTH-010 blank password only', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.email().fill(env.users.valid); await loginPage.submit().click();
    await loginPage.expectOnLogin(); await expect(loginPage.error().first()).toBeVisible();
  });
  for (const bad of ['agent.valid@', 'agent.valid', '@insurance.test']) {
    test(`AUTH-011 malformed email "${bad}" is not authenticated`, async ({ loginPage }) => {
      await loginPage.goto(); await loginPage.login(bad, env.password);
      await loginPage.expectOnLogin();
    });
  }
  test('AUTH-012 locked account shows locked message @critical', async ({ loginPage }) => {
    await loginPage.goto(); await loginPage.login(env.users.locked, env.password);
    await loginPage.expectOnLogin();
    // Risk R01: must say locked, not generic invalid credentials.
    await expect(loginPage.error(/lock|suspend|disabled|blocked|too many/i)).toBeVisible();
  });
  test('AUTH-013 failed-attempt lockout triggers (discovers threshold) @critical', async ({ loginPage, page }) => {
    const learner = env.learner(1); // destructive: consumes learner001
    let lockedAt = 0;
    const max = env.lockoutThreshold ? env.lockoutThreshold + 2 : 10;
    for (let i = 1; i <= max; i++) {
      await loginPage.goto(); await loginPage.login(learner, `Wrong${i}!`);
      if (await loginPage.error(/lock|too many|suspend|blocked/i).isVisible().catch(() => false)) { lockedAt = i; break; }
    }
    test.info().annotations.push({ type: 'observed-lockout-attempt', description: String(lockedAt) });
    expect(lockedAt, `no lockout observed within ${max} attempts`).toBeGreaterThan(0);
    if (env.lockoutThreshold) expect(lockedAt).toBeLessThanOrEqual(env.lockoutThreshold + 1);
    await loginPage.goto(); await loginPage.login(learner, env.password); // correct password must also fail
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.error(/lock/i)).toBeVisible();
  });
  test('AUTH-014 attempts below threshold do not lock', async ({ loginPage, page }) => {
    test.skip(!env.lockoutThreshold, 'LOCKOUT_THRESHOLD not documented (Clarification Q / D-02)');
    const learner = env.learner(2);
    for (let i = 1; i < env.lockoutThreshold!; i++) { await loginPage.goto(); await loginPage.login(learner, `Wrong${i}!`); }
    await loginPage.goto(); await loginPage.login(learner, env.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });
  test('AUTH-015 direct /dashboard when logged out redirects @critical @smoke', async ({ page }) => {
    await page.goto('/dashboard'); await expect(page).toHaveURL(/\/login/);
  });
  test('AUTH-016 protected application routes redirect when logged out @critical', async ({ page }) => {
    for (const r of ['/applications/new', '/applications/1', '/applications/1/client', '/applications/1/documents', '/applications/1/review', '/applications/1/status']) {
      await page.goto(r);
      await expect(page, `route ${r}`).toHaveURL(/\/login/);
    }
  });
  test('AUTH-017 password masked and not in URL', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(loginPage.password()).toHaveAttribute('type', 'password');
    await loginPage.login(env.users.valid, env.password);
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain(env.password);
    expect(page.url()).not.toContain(encodeURIComponent(env.password));
  });
  test.fixme('AUTH-018 password policy consistent (no password set/reset flow documented)', async () => {});
  test('AUTH-019 login errors do not leak internals', async ({ loginPage, page }) => {
    await loginPage.goto(); await loginPage.login('nouser@insurance.test', env.password);
    const unknown = (await loginPage.error().first().innerText()).trim();
    await loginPage.goto(); await loginPage.login(env.users.valid, 'WrongPass@1');
    const wrong = (await loginPage.error().first().innerText()).trim();
    expect(unknown, 'unknown-user vs wrong-password message should match (no user enumeration)').toBe(wrong);
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/stack|exception|sql|syntax|at \w+\.\w+\(/i);
  });
  test('AUTH-020 SQL injection / script payloads rejected @security', async ({ loginPage, page }) => {
    for (const p of [SQLI, XSS]) {
      await loginPage.goto(); await loginPage.login(p, p);
      await expect(page).toHaveURL(/\/login/);
      expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
    }
  });
  test('AUTH-021 email upper-case / whitespace handling (observational)', async ({ loginPage, page }) => {
    await loginPage.goto(); await loginPage.login(env.users.valid.toUpperCase(), env.password);
    await page.waitForTimeout(1500);
    test.info().annotations.push({ type: 'uppercase-email', description: /dashboard/.test(page.url()) ? 'accepted' : 'rejected' });
    await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
  });
  test('AUTH-022 learner pool users can login (sample)', async ({ loginPage, page }) => {
    for (const n of [3, 30]) { await loginPage.loginAndWait(env.learner(n), env.password); await loginPage.logout(); await expect(page).toHaveURL(/\/login/); }
  });
  test('AUTH-023 two sessions are isolated @security', async ({ browser }) => {
    const mk = async (email: string) => { const c = await browser.newContext(); const p = await c.newPage(); const { LoginPage } = await import('../../pages/LoginPage'); await new LoginPage(p).loginAndWait(email, env.password); return { c, p }; };
    const a = await mk(env.users.valid); const b = await mk(env.users.draft);
    await a.p.reload(); await b.p.reload();
    const ta = await a.p.locator('body').innerText(); const tb = await b.p.locator('body').innerText();
    expect(ta).not.toEqual(tb);
    await a.c.close(); await b.c.close();
  });
  test.fixme('AUTH-024 MFA / OTP login - BLOCKED: no MFA user or OTP mechanism supplied (D-02)', async () => {});
  test.fixme('AUTH-025 session timeout - BLOCKED: timeout value not documented', async () => {});
});
