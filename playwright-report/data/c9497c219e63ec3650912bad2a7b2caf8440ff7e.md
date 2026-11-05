# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\auth.spec.ts >> Authentication (UI) >> AUTH-013 failed-attempt lockout triggers (discovers threshold) @critical
- Location: tests\ui\auth.spec.ts:76:7

# Error details

```
Error: no lockout observed within 10 attempts

expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- main [ref=f19e2]:
  - generic [ref=f19e4]:
    - generic [ref=f19e5]:
      - generic [aria-hidden] [ref=f19e6]: IO
      - generic [ref=f19e7]:
        - heading "Insurance Order Entry Demo Platform" [level=1] [ref=f19e8]
        - paragraph [ref=f19e9]: QA Automation Training App
    - alert [ref=f19e10]:
      - generic [ref=f19e11]: "Please review the following:"
      - list [ref=f19e12]:
        - listitem [ref=f19e13]: Invalid credentials.
    - generic [ref=f19e14]:
      - generic [ref=f19e15]:
        - generic [ref=f19e16]: Email
        - textbox "Email" [active] [ref=f19e17]: learner001@insurance.test
      - generic [ref=f19e18]:
        - generic [ref=f19e19]: Password
        - textbox "Password" [ref=f19e20]
      - generic [ref=f19e21]:
        - button "Login" [ref=f19e22] [cursor=pointer]
        - link "Forgot password?" [ref=f19e23] [cursor=pointer]:
          - /url: http://8.231.84.60:8081/forgot-password
    - link "New agent? Register here" [ref=f19e25] [cursor=pointer]:
      - /url: http://8.231.84.60:8081/register
    - generic [ref=f19e26]: "Demo user: agent.valid@insurance.test / Password@123"
```

# Test source

```ts
  1   | import { test, expect, NO_AUTH } from '../../fixtures';
  2   | import { env } from '../../config/env';
  3   | import { SQLI, XSS } from '../../data/testData';
  4   | 
  5   | test.use({ storageState: NO_AUTH });
  6   | test.describe('Authentication (UI)', () => {
  7   |   test('AUTH-001 valid agent login lands on dashboard @smoke @critical', async ({ loginPage, page }) => {
  8   |     await loginPage.loginAndWait(env.users.valid, env.password);
  9   |     await expect(page).toHaveURL(/\/(dashboard|applications\/\d+\/client)/);
  10  |     await expect(loginPage.error()).toHaveCount(0);
  11  |   });
  12  |   test('AUTH-002 login page renders all controls @smoke', async ({ loginPage }) => {
  13  |     await loginPage.goto();
  14  |     await expect(loginPage.email()).toBeVisible();
  15  |     await expect(loginPage.password()).toHaveAttribute('type', 'password');
  16  |     await expect(loginPage.submit()).toBeEnabled();
  17  |   });
  18  |   test('AUTH-003 login with Enter key', async ({ loginPage, page }) => {
  19  |     await loginPage.goto();
  20  |     await loginPage.email().fill(env.users.valid);
  21  |     await loginPage.password().fill(env.password);
  22  |     await loginPage.password().press('Enter');
  23  |     await expect(page).toHaveURL(/\/(dashboard|applications\/\d+\/client)/);
  24  |   });
  25  |   test('AUTH-004 logout ends session and blocks back/direct access @critical', async ({ loginPage, page }) => {
  26  |     await loginPage.loginAndWait(env.users.valid, env.password);
  27  |     await loginPage.logout();
  28  |     await expect(page).toHaveURL(/\/login/);
  29  |     await page.goBack();
  30  |     await page.goto('/dashboard');
  31  |     await expect(page).toHaveURL(/\/login/);
  32  |   });
  33  |   test('AUTH-005 session survives refresh', async ({ loginPage, page }) => {
  34  |     await loginPage.loginAndWait(env.users.valid, env.password);
  35  |     await page.reload();
  36  |     await expect(page).toHaveURL(/\/(dashboard|applications\/\d+\/client)/);
  37  |   });
  38  |   test('AUTH-006 wrong password rejected @critical', async ({ loginPage }) => {
  39  |     await loginPage.goto(); await loginPage.login(env.users.valid, 'WrongPass@1');
  40  |     await loginPage.expectOnLogin();
  41  |     await expect(loginPage.error(/invalid|incorrect|wrong|failed|credentials/i)).toBeVisible();
  42  |   });
  43  |   test('AUTH-007 unregistered email rejected @critical', async ({ loginPage }) => {
  44  |     await loginPage.goto(); await loginPage.login('nouser@insurance.test', env.password);
  45  |     await loginPage.expectOnLogin();
  46  |     await expect(loginPage.error(/invalid|incorrect|wrong|failed|credentials|not found/i)).toBeVisible();
  47  |   });
  48  |   test('AUTH-008 blank email and password', async ({ loginPage }) => {
  49  |     await loginPage.goto(); await loginPage.submit().click();
  50  |     await loginPage.expectOnLogin();
  51  |     expect(await loginPage.email().evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  52  |   });
  53  |   test('AUTH-009 blank email only', async ({ loginPage }) => {
  54  |     await loginPage.goto(); await loginPage.password().fill(env.password); await loginPage.submit().click();
  55  |     await loginPage.expectOnLogin();
  56  |     expect(await loginPage.email().evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  57  |   });
  58  |   test('AUTH-010 blank password only', async ({ loginPage }) => {
  59  |     await loginPage.goto(); await loginPage.email().fill(env.users.valid); await loginPage.submit().click();
  60  |     await loginPage.expectOnLogin();
  61  |     expect(await loginPage.password().evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
  62  |   });
  63  |   for (const bad of ['agent.valid@', 'agent.valid', '@insurance.test']) {
  64  |     test(`AUTH-011 malformed email "${bad}" is not authenticated`, async ({ loginPage }) => {
  65  |       await loginPage.goto(); await loginPage.login(bad, env.password);
  66  |       await loginPage.expectOnLogin();
  67  |     });
  68  |   }
  69  |   test('AUTH-012 locked account shows locked message @critical', async ({ loginPage }) => {
  70  |     test.skip(true, 'agent.locked is not locked in this environment (redirects to /change-password)');
  71  |     await loginPage.goto(); await loginPage.login(env.users.locked, env.password);
  72  |     await loginPage.expectOnLogin();
  73  |     // Risk R01: must say locked, not generic invalid credentials.
  74  |     await expect(loginPage.error(/lock|suspend|disabled|blocked|too many/i)).toBeVisible();
  75  |   });
  76  |   test('AUTH-013 failed-attempt lockout triggers (discovers threshold) @critical', async ({ loginPage, page }) => {
  77  |     const learner = env.learner(1); // destructive: consumes learner001
  78  |     let lockedAt = 0;
  79  |     const max = env.lockoutThreshold ? env.lockoutThreshold + 2 : 10;
  80  |     for (let i = 1; i <= max; i++) {
  81  |       await loginPage.goto(); await loginPage.login(learner, `Wrong${i}!`);
  82  |       if (await loginPage.error(/lock|too many|suspend|blocked/i).isVisible().catch(() => false)) { lockedAt = i; break; }
  83  |     }
  84  |     test.info().annotations.push({ type: 'observed-lockout-attempt', description: String(lockedAt) });
> 85  |     expect(lockedAt, `no lockout observed within ${max} attempts`).toBeGreaterThan(0);
      |                                                                    ^ Error: no lockout observed within 10 attempts
  86  |     if (env.lockoutThreshold) expect(lockedAt).toBeLessThanOrEqual(env.lockoutThreshold + 1);
  87  |     await loginPage.goto(); await loginPage.login(learner, env.password); // correct password must also fail
  88  |     await expect(page).toHaveURL(/\/login/);
  89  |     await expect(loginPage.error(/lock/i)).toBeVisible();
  90  |   });
  91  |   test('AUTH-014 attempts below threshold do not lock', async ({ loginPage, page }) => {
  92  |     test.skip(!env.lockoutThreshold, 'LOCKOUT_THRESHOLD not documented (Clarification Q / D-02)');
  93  |     const learner = env.learner(2);
  94  |     for (let i = 1; i < env.lockoutThreshold!; i++) { await loginPage.goto(); await loginPage.login(learner, `Wrong${i}!`); }
  95  |     await loginPage.goto(); await loginPage.login(learner, env.password);
  96  |     await expect(page).toHaveURL(/\/dashboard/);
  97  |   });
  98  |   test('AUTH-015 direct /dashboard when logged out redirects @critical @smoke', async ({ page }) => {
  99  |     await page.goto('/dashboard'); await expect(page).toHaveURL(/\/login/);
  100 |   });
  101 |   test('AUTH-016 protected application routes redirect when logged out @critical', async ({ page }) => {
  102 |     for (const r of ['/applications/new', '/applications/1', '/applications/1/client', '/applications/1/documents', '/applications/1/review', '/applications/1/status']) {
  103 |       await page.goto(r);
  104 |       await expect(page, `route ${r}`).toHaveURL(/\/login/);
  105 |     }
  106 |   });
  107 |   test('AUTH-017 password masked and not in URL', async ({ loginPage, page }) => {
  108 |     await loginPage.goto();
  109 |     await expect(loginPage.password()).toHaveAttribute('type', 'password');
  110 |     await loginPage.login(env.users.valid, env.password);
  111 |     await page.waitForLoadState('networkidle');
  112 |     expect(page.url()).not.toContain(env.password);
  113 |     expect(page.url()).not.toContain(encodeURIComponent(env.password));
  114 |   });
  115 |   test.fixme('AUTH-018 password policy consistent (no password set/reset flow documented)', async () => {});
  116 |   test('AUTH-019 login errors do not leak internals', async ({ loginPage, page }) => {
  117 |     await loginPage.goto(); await loginPage.login('nouser@insurance.test', env.password);
  118 |     const unknown = (await loginPage.error().first().innerText()).trim();
  119 |     await loginPage.goto(); await loginPage.login(env.users.valid, 'WrongPass@1');
  120 |     const wrong = (await loginPage.error().first().innerText()).trim();
  121 |     expect(unknown, 'unknown-user vs wrong-password message should match (no user enumeration)').toBe(wrong);
  122 |     const body = await page.locator('body').innerText();
  123 |     expect(body).not.toMatch(/stack|exception|sql|syntax|at \w+\.\w+\(/i);
  124 |   });
  125 |   test('AUTH-020 SQL injection / script payloads rejected @security', async ({ loginPage, page }) => {
  126 |     for (const p of [SQLI, XSS]) {
  127 |       await loginPage.goto(); await loginPage.login(p, p);
  128 |       await expect(page).toHaveURL(/\/login/);
  129 |       expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  130 |     }
  131 |   });
  132 |   test('AUTH-021 email upper-case / whitespace handling (observational)', async ({ loginPage, page }) => {
  133 |     await loginPage.goto(); await loginPage.login(env.users.valid.toUpperCase(), env.password);
  134 |     await page.waitForTimeout(1500);
  135 |     test.info().annotations.push({ type: 'uppercase-email', description: /dashboard/.test(page.url()) ? 'accepted' : 'rejected' });
  136 |     await expect(page.locator('body')).not.toContainText(/exception|stack trace/i);
  137 |   });
  138 |   test('AUTH-022 learner pool users can login (sample)', async ({ loginPage, page }) => {
  139 |     for (const n of [3, 30]) { await loginPage.loginAndWait(env.learner(n), env.password); await loginPage.logout(); await expect(page).toHaveURL(/\/login/); }
  140 |   });
  141 |   test('AUTH-023 two sessions are isolated @security', async ({ browser }) => {
  142 |     const mk = async (email: string) => { const c = await browser.newContext(); const p = await c.newPage(); const { LoginPage } = await import('../../pages/LoginPage'); await new LoginPage(p).loginAndWait(email, env.password); return { c, p }; };
  143 |     const a = await mk(env.users.valid); const b = await mk(env.users.draft);
  144 |     await a.p.reload(); await b.p.reload();
  145 |     const ta = await a.p.locator('body').innerText(); const tb = await b.p.locator('body').innerText();
  146 |     expect(ta).not.toEqual(tb);
  147 |     await a.c.close(); await b.c.close();
  148 |   });
  149 |   test.fixme('AUTH-024 MFA / OTP login - BLOCKED: no MFA user or OTP mechanism supplied (D-02)', async () => {});
  150 |   test.fixme('AUTH-025 session timeout - BLOCKED: timeout value not documented', async () => {});
  151 | });
```