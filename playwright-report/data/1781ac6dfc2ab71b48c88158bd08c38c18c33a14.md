# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup\auth.setup.ts >> authenticate valid
- Location: tests\setup\auth.setup.ts:8:8

# Error details

```
Error: Login did not leave /login for agent.valid@insurance.test. URL=http://136.83.129.92:8081/login page message: Please review the following:
Invalid credentials.
```

# Page snapshot

```yaml
- main [ref=f1e2]:
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [aria-hidden] [ref=f1e6]: IO
      - generic [ref=f1e7]:
        - heading "Insurance Order Entry Demo Platform" [level=1] [ref=f1e8]
        - paragraph [ref=f1e9]: QA Automation Training App
    - alert [ref=f1e10]:
      - generic [ref=f1e11]: "Please review the following:"
      - list [ref=f1e12]:
        - listitem [ref=f1e13]: Invalid credentials.
    - generic [ref=f1e14]:
      - generic [ref=f1e15]:
        - generic [ref=f1e16]: Email
        - textbox "Email" [active] [ref=f1e17]: agent.valid@insurance.test
      - generic [ref=f1e18]:
        - generic [ref=f1e19]: Password
        - textbox "Password" [ref=f1e20]
      - generic [ref=f1e21]:
        - button "Login" [ref=f1e22] [cursor=pointer]
        - link "Forgot password?" [ref=f1e23] [cursor=pointer]:
          - /url: http://136.83.129.92:8081/forgot-password
    - link "New agent? Register here" [ref=f1e25] [cursor=pointer]:
      - /url: http://136.83.129.92:8081/register
    - generic [ref=f1e26]: "Demo user: agent.valid@insurance.test / Password@123"
```

# Test source

```ts
  1  | import { expect, Page } from '@playwright/test';
  2  | import { button, errors, field } from '../utils/ui';
  3  | import { env, rememberPassword } from '../config/env';
  4  | 
  5  | export class LoginPage {
  6  |   constructor(readonly page: Page) {}
  7  |   email = () => this.page.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[data-testid*="email" i], input[name*="user" i], input[data-testid*="user" i]').first()
  8  |     .or(field(this.page, /e-?mail|user ?name/i));
  9  |   password = () => this.page.locator('input[type="password"]').first();
  10 |   submit = () => this.page.locator('[data-testid*="login"][data-testid*="button"], [data-testid*="login"][data-testid*="submit"], [data-testid*="signin"]').first()
  11 |     .or(button(this.page, /log ?in|sign ?in/i)).or(this.page.locator('form button[type="submit"], form button:not([type])').first()).first();
  12 |   async goto() { await this.page.goto('/login'); }
  13 |   async login(email: string, password: string) {
  14 |     await this.email().fill(email);
  15 |     await this.password().fill(password);
  16 |     await this.submit().click();
  17 |   }
  18 |   async loginAndWait(email: string, password: string = env.passwordOf(email)) {
  19 |     await this.goto();
  20 |     await this.login(email, password);
  21 |     try {
  22 |       await this.page.waitForURL((u) => !/\/login\/?$/.test(u.pathname), { timeout: 20_000 });
  23 |     } catch {
  24 |       const msg = await errors(this.page).first().innerText().catch(() => '(no error text on page)');
> 25 |       throw new Error(`Login did not leave /login for ${email}. URL=${this.page.url()} page message: ${msg}`);
     |             ^ Error: Login did not leave /login for agent.valid@insurance.test. URL=http://136.83.129.92:8081/login page message: Please review the following:
  26 |     }
  27 |     if (/\/change-password/.test(this.page.url())) await this.handleForcedPasswordChange(email, password);
  28 |     console.log(`[login] ${email} landed on ${this.page.url()}`);
  29 |   }
  30 |   /** The app forces a password change on first login for some seeded users (e.g. agent.valid). */
  31 |   async handleForcedPasswordChange(email: string, current: string) {
  32 |     if (!env.autoChangePassword) {
  33 |       throw new Error(
  34 |         `${email} is forced to /change-password. Either change the password once by hand and put it in .env as ` +
  35 |         `PASSWORD_${email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_')}=<new password>, or set AUTO_CHANGE_PASSWORD=true ` +
  36 |         `(this PERMANENTLY changes the shared account's password to NEW_PASSWORD).`);
  37 |     }
  38 |     const p = this.page;
  39 |     await p.getByTestId('change-password-current').fill(current);
  40 |     await p.getByTestId('change-password-new').fill(env.newPassword);
  41 |     await p.getByTestId('change-password-confirm').fill(env.newPassword);
  42 |     await p.getByTestId('change-password-submit').click();
  43 |     await p.waitForURL((u) => !/\/change-password/.test(u.pathname), { timeout: 20_000 });
  44 |     rememberPassword(email, env.newPassword);
  45 |     console.log(`[login] password for ${email} changed; stored in .auth/passwords.json`);
  46 |   }
  47 |   error = (text?: string | RegExp) => errors(this.page, text).first();
  48 |   async expectOnLogin() { await expect(this.page).toHaveURL(/\/login/); }
  49 |   async logout() {
  50 |     await this.page.locator('[data-testid="nav-logout-button"]').or(this.page.getByRole('button', { name: /log ?out|sign ?out/i })).first().click();
  51 |   }
  52 | }
  53 | 
```