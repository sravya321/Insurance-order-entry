import { expect, Locator, Page } from '@playwright/test';
import { env } from '../config/env';
import { fmt } from './dates';

type Scope = Page | Locator;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "First Name" -> /first[\s_-]*name/i so it matches "First name", "first_name", "First-Name". */
export const labelRx = (label: string | RegExp): RegExp =>
  label instanceof RegExp ? label : new RegExp(esc(label).replace(/\s+/g, '[\\s_-]*'), 'i');

/**
 * Resilient field finder: label -> placeholder -> data-testid -> name/id attribute.
 * If the real UI uses different wording, pass a RegExp or change the label in data/*.ts.
 */
export function field(scope: Scope, label: string | RegExp, nth: 'first' | 'last' = 'first'): Locator {
  const rx = labelRx(label);
  // Only real form controls may match (a data-testid like "login-form" must never be picked).
  const CONTROL = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';
  let loc = scope.locator(CONTROL).and(scope.getByLabel(rx))
    .or(scope.locator(CONTROL).and(scope.getByPlaceholder(rx)))
    .or(scope.locator(CONTROL).and(scope.getByTestId(rx)));
  if (typeof label === 'string') {
    const words = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const variants = [words.join(''), words.join('_'), words.join('-')];
    const attr = variants.map((v) => `input[name*="${v}" i], input[id*="${v}" i], select[name*="${v}" i], select[id*="${v}" i], textarea[name*="${v}" i], textarea[id*="${v}" i]`).join(', ');
    loc = loc.or(scope.locator(attr));
  }
  return nth === 'last' ? loc.last() : loc.first();
}

export async function isPresent(loc: Locator, timeout = 1500): Promise<boolean> {
  try {
    await loc.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/** Fill a text input / select / checkbox with whatever the control turns out to be. */
export async function setField(scope: Scope, label: string | RegExp, value: string | number | boolean, nth: 'first' | 'last' = 'first') {
  const el = field(scope, label, nth);
  await el.waitFor({ state: 'visible', timeout: 10_000 });
  const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  const type = await el.evaluate((n) => (n as HTMLInputElement).type || '');
  if (tag === 'select') {
    try {
      await el.selectOption({ label: String(value) });
    } catch {
      await el.selectOption(String(value));
    }
  } else if (type === 'checkbox' || type === 'radio') {
    await el.setChecked(Boolean(value));
  } else {
    await el.fill(String(value));
  }
}

export async function fillIfPresent(scope: Scope, label: string | RegExp, value: string | number | boolean, nth: 'first' | 'last' = 'first') {
  if (await isPresent(field(scope, label, nth), 800)) {
    await setField(scope, label, value, nth);
    return true;
  }
  return false;
}

/** Type a date into either a native date input (ISO) or a text input (DATE_FORMAT). */
export async function setDate(scope: Scope, label: string | RegExp, d: Date, nth: 'first' | 'last' = 'first') {
  const el = field(scope, label, nth);
  await el.waitFor({ state: 'visible', timeout: 10_000 });
  const type = await el.evaluate((n) => (n as HTMLInputElement).type);
  await el.fill(type === 'date' ? fmt(d, 'YYYY-MM-DD') : fmt(d, env.dateFormat));
  await el.blur();
}
/** Raw string variant for invalid dates. */
export async function setRawDate(scope: Scope, label: string | RegExp, raw: string) {
  const el = field(scope, label);
  await el.waitFor({ state: 'visible', timeout: 10_000 });
  const type = await el.evaluate((n) => (n as HTMLInputElement).type);
  if (type === 'date') {
    await el.evaluate((n, v) => { (n as HTMLInputElement).value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); }, raw);
  } else {
    await el.fill(raw);
  }
  await el.blur();
}

export const button = (scope: Scope, name: string | RegExp): Locator =>
  scope.getByRole('button', { name: typeof name === 'string' ? labelRx(name) : name }).first();

export async function clickIfVisible(scope: Scope, name: string | RegExp, timeout = 1200): Promise<boolean> {
  const b = button(scope, name);
  if (await isPresent(b, timeout)) {
    await b.click();
    return true;
  }
  return false;
}

const ERROR_SELECTOR = [
  '[role="alert"]', '.error', '.errors', '.error-message', '.field-error', '.invalid-feedback', '.text-danger',
  '.text-red-500', '.text-red-600', '[class*="error" i]', '[data-testid*="error" i]', '[aria-invalid="true"]',
  'mat-error', '.Mui-error', '.ant-form-item-explain-error', '.toast-error', '.alert-danger',
].join(', ');

export function errors(page: Page, text?: string | RegExp): Locator {
  const base = page.locator(ERROR_SELECTOR);
  return text ? base.filter({ hasText: text }).or(page.getByText(text)) : base;
}
export async function expectValidationError(page: Page, text?: string | RegExp) {
  await expect(errors(page, text).first(), `expected a validation error${text ? ` matching ${text}` : ''}`).toBeVisible({ timeout: 8000 });
}
export async function expectNoValidationError(page: Page) {
  await expect(page.locator('[role="alert"]:visible, .error:visible, .invalid-feedback:visible, [aria-invalid="true"]:visible')).toHaveCount(0);
}
export const appIdFromUrl = (url: string): string | null => {
  const m = url.match(/\/applications\/([^/?#]+)/);
  return m && m[1] !== 'new' ? m[1] : null;
};
export const money = (n: number) => n.toLocaleString('en-US');

/** Visible text of the premium element (first element mentioning "premium" with a number). */
export async function readPremium(page: Page): Promise<number | null> {
  const loc = page.locator('[data-testid*="premium" i], :text-matches("premium", "i")').filter({ hasText: /\d/ }).first();
  if (!(await isPresent(loc, 4000))) return null;
  const txt = (await loc.innerText()).replace(/,/g, '');
  const m = txt.match(/(\d+(?:\.\d+)?)/g);
  return m ? Number(m[m.length - 1]) : null;
}
