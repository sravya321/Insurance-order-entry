import { expect, Page } from '@playwright/test';
import { button, errors, field } from '../utils/ui';
import { env, rememberPassword } from '../config/env';

export class LoginPage {
  constructor(readonly page: Page) {}
  email = () => this.page.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[data-testid*="email" i], input[name*="user" i], input[data-testid*="user" i]').first()
    .or(field(this.page, /e-?mail|user ?name/i));
  password = () => this.page.locator('input[type="password"]').first();
  submit = () => this.page.locator('[data-testid*="login"][data-testid*="button"], [data-testid*="login"][data-testid*="submit"], [data-testid*="signin"]').first()
    .or(button(this.page, /log ?in|sign ?in/i)).or(this.page.locator('form button[type="submit"], form button:not([type])').first()).first();
  async goto() { await this.page.goto('/login'); }
  async login(email: string, password: string) {
    await this.email().fill(email);
    await this.password().fill(password);
    await this.submit().click();
  }
  async loginAndWait(email: string, password: string = env.passwordOf(email)) {
    await this.goto();
    await this.login(email, password);
    try {
      await this.page.waitForURL((u) => !/\/login\/?$/.test(u.pathname), { timeout: 20_000 });
    } catch {
      const msg = await errors(this.page).first().innerText().catch(() => '(no error text on page)');
      throw new Error(`Login did not leave /login for ${email}. URL=${this.page.url()} page message: ${msg}`);
    }
    if (/\/change-password/.test(this.page.url())) await this.handleForcedPasswordChange(email, password);
    console.log(`[login] ${email} landed on ${this.page.url()}`);
  }
  /** The app forces a password change on first login for some seeded users (e.g. agent.valid). */
  async handleForcedPasswordChange(email: string, current: string) {
    if (!env.autoChangePassword) {
      throw new Error(
        `${email} is forced to /change-password. Either change the password once by hand and put it in .env as ` +
        `PASSWORD_${email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_')}=<new password>, or set AUTO_CHANGE_PASSWORD=true ` +
        `(this PERMANENTLY changes the shared account's password to NEW_PASSWORD).`);
    }
    const p = this.page;
    await p.getByTestId('change-password-current').fill(current);
    await p.getByTestId('change-password-new').fill(env.newPassword);
    await p.getByTestId('change-password-confirm').fill(env.newPassword);
    await p.getByTestId('change-password-submit').click();
    await p.waitForURL((u) => !/\/change-password/.test(u.pathname), { timeout: 20_000 });
    rememberPassword(email, env.newPassword);
    console.log(`[login] password for ${email} changed; stored in .auth/passwords.json`);
  }
  error = (text?: string | RegExp) => errors(this.page, text).first();
  async expectOnLogin() { await expect(this.page).toHaveURL(/\/login/); }
  async logout() {
    await this.page.locator('[data-testid="nav-logout-button"]').or(this.page.getByRole('button', { name: /log ?out|sign ?out/i })).first().click();
  }
}
