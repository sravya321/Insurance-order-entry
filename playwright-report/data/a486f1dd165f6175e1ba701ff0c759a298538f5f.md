# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\journeys.spec.ts >> End-to-end journeys >> E2E-006 UI submit then API reconciliation
- Location: tests\e2e\journeys.spec.ts:33:7

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByLabel(/^(full )?name|beneficiary name/i)).or(locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByPlaceholder(/^(full )?name|beneficiary name/i))).or(locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByTestId(/^(full )?name|beneficiary name/i))).last() to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=f7e1]:
  - navigation [ref=f7e2]:
    - generic [ref=f7e3]:
      - link "Insurance Order Entry Demo Platform QA Automation Training App" [ref=f7e4] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/dashboard
        - generic [aria-hidden] [ref=f7e5]: IO
        - generic [ref=f7e6]:
          - generic [ref=f7e7]: Insurance Order Entry Demo Platform
          - generic [ref=f7e8]: QA Automation Training App
      - generic [ref=f7e9]:
        - list [ref=f7e10]:
          - listitem [ref=f7e11]:
            - link "Dashboard" [ref=f7e12] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/dashboard
          - listitem [ref=f7e13]:
            - link "Applications" [ref=f7e14] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/applications
          - listitem [ref=f7e15]:
            - link "Products" [ref=f7e16] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/products
          - listitem [ref=f7e17]:
            - link "Support" [ref=f7e18] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/support
        - generic [ref=f7e19]:
          - link "Valid Agent" [ref=f7e20] [cursor=pointer]:
            - /url: http://8.231.84.60:8081/profile
          - button "Logout" [ref=f7e22] [cursor=pointer]
  - main [ref=f7e23]:
    - alert [ref=f7e24]: Rider selection saved.
    - generic [ref=f7e26]:
      - link "← Back to Riders" [ref=f7e27] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/applications/115/riders
      - link "Application Summary" [ref=f7e28] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/applications/115
    - generic [ref=f7e29]:
      - generic [ref=f7e30]:
        - generic [ref=f7e31]:
          - generic [ref=f7e32]: "Application #115"
          - heading "Beneficiaries" [level=1] [ref=f7e33]
          - paragraph [ref=f7e34]: Add or update primary and secondary beneficiaries for the policy.
        - link "Back to Application" [ref=f7e35] [cursor=pointer]:
          - /url: http://8.231.84.60:8081/applications/115
      - generic [ref=f7e36]: "Primary allocation: 0.00% | Secondary allocation: 0.00%"
      - generic [ref=f7e37]: No beneficiary has been added. Estate assignment will apply by default if no beneficiary is named.
      - generic [ref=f7e38]:
        - strong [ref=f7e40]: Existing Beneficiaries
        - table [ref=f7e43]:
          - rowgroup [ref=f7e44]:
            - row [ref=f7e45]:
              - columnheader "Level" [ref=f7e46]
              - columnheader "Type" [ref=f7e47]
              - columnheader "Name" [ref=f7e48]
              - columnheader "Designation" [ref=f7e49]
              - columnheader "Relationship" [ref=f7e50]
              - columnheader "Age" [ref=f7e51]
              - columnheader "Allocation" [ref=f7e52]
              - columnheader "Email" [ref=f7e53]
              - columnheader "Phone" [ref=f7e54]
              - columnheader "Action" [ref=f7e55]
          - rowgroup [ref=f7e56]:
            - row [ref=f7e57]:
              - cell "No beneficiaries added yet. Estate assignment will apply by default." [ref=f7e58]
      - generic [ref=f7e59]:
        - generic [ref=f7e60]:
          - strong [ref=f7e62]: Add Beneficiary
          - generic [ref=f7e64]:
            - generic [ref=f7e65]:
              - generic [ref=f7e66]: Beneficiary Level *
              - combobox [ref=f7e67]:
                - option "Select" [selected]
                - option "Primary"
                - option "Secondary"
            - generic [ref=f7e68]:
              - generic [ref=f7e69]: Beneficiary Type *
              - combobox [ref=f7e70]:
                - option "Individual" [selected]
                - option "Trust"
                - option "Organization"
            - generic [ref=f7e71]:
              - generic [ref=f7e72]: Relationship *
              - combobox [ref=f7e73]:
                - option "Select" [selected]
                - option "Spouse"
                - option "Child"
                - option "Parent"
                - option "Sibling"
                - option "Trust"
                - option "Organization"
                - option "Other"
            - generic [ref=f7e74]:
              - generic [ref=f7e75]: Allocation % *
              - spinbutton [ref=f7e76]: "100"
            - generic [ref=f7e77]:
              - generic [ref=f7e78]: Beneficiary Designation *
              - combobox [ref=f7e79]:
                - option "Revocable" [selected]
                - option "Irrevocable"
              - generic [ref=f7e80]: Irrevocable beneficiaries cannot be changed or removed in this demo without beneficiary consent.
            - generic [ref=f7e81]:
              - generic [ref=f7e82]: Phone
              - textbox "(212) 555-1212" [ref=f7e83]
            - generic [ref=f7e84]:
              - generic [ref=f7e85]: Email
              - textbox [ref=f7e86]
            - generic [ref=f7e87]:
              - generic [ref=f7e88]: Country
              - textbox [ref=f7e89]: US
        - generic [ref=f7e90]:
          - strong [ref=f7e92]: Individual Beneficiary Details
          - generic [ref=f7e94]:
            - generic [ref=f7e95]:
              - generic [ref=f7e96]: First Name *
              - textbox [ref=f7e97]
            - generic [ref=f7e98]:
              - generic [ref=f7e99]: Middle Name
              - textbox [ref=f7e100]
            - generic [ref=f7e101]:
              - generic [ref=f7e102]: Last Name *
              - textbox [ref=f7e103]
            - generic [ref=f7e104]:
              - generic [ref=f7e105]: Date of Birth *
              - textbox [ref=f7e106]
            - generic [ref=f7e107]:
              - generic [ref=f7e108]: Gender
              - combobox [ref=f7e109]:
                - option "Select" [selected]
                - option "Male"
                - option "Female"
                - option "Non-binary"
        - generic [ref=f7e110]:
          - strong [ref=f7e112]: Address Details
          - generic [ref=f7e114]:
            - generic [ref=f7e115]:
              - generic [ref=f7e116]: Address Line 1
              - textbox [ref=f7e117]
            - generic [ref=f7e118]:
              - generic [ref=f7e119]: City
              - textbox [ref=f7e120]
            - generic [ref=f7e121]:
              - generic [ref=f7e122]: State
              - textbox [ref=f7e123]
            - generic [ref=f7e124]:
              - generic [ref=f7e125]: Postal Code
              - textbox [ref=f7e126]
        - generic [ref=f7e127]:
          - strong [ref=f7e129]: Minor Beneficiary Guardian Details
          - generic [ref=f7e131]:
            - generic [ref=f7e132]:
              - generic [ref=f7e133]: Guardian Name
              - textbox [ref=f7e134]
            - generic [ref=f7e135]:
              - generic [ref=f7e136]: Guardian Relationship
              - textbox [ref=f7e137]
            - generic [ref=f7e138]:
              - generic [ref=f7e139]: Guardian Contact
              - textbox [ref=f7e140]
            - generic [ref=f7e141]:
              - generic [ref=f7e142]: Guardian Address
              - textbox [ref=f7e143]
            - generic [ref=f7e145]:
              - checkbox "Legal acknowledgement completed for minor beneficiary" [ref=f7e146]
              - generic [ref=f7e147]: Legal acknowledgement completed for minor beneficiary
        - generic [ref=f7e148]:
          - link "Back" [ref=f7e149] [cursor=pointer]:
            - /url: http://8.231.84.60:8081/applications/115/riders
          - generic [ref=f7e150]:
            - button "Save Beneficiary" [ref=f7e151] [cursor=pointer]
            - link "Continue" [ref=f7e152] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/applications/115/documents
  - contentinfo [ref=f7e153]:
    - generic [ref=f7e154]:
      - generic [ref=f7e155]: TalentFarm QA Automation Lab
      - generic [ref=f7e156]: Insurance Order Entry Demo
```

# Test source

```ts
  1   | import { expect, Locator, Page } from '@playwright/test';
  2   | import { env } from '../config/env';
  3   | import { fmt } from './dates';
  4   | 
  5   | type Scope = Page | Locator;
  6   | const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  7   | 
  8   | /** "First Name" -> /first[\s_-]*name/i so it matches "First name", "first_name", "First-Name". */
  9   | export const labelRx = (label: string | RegExp): RegExp =>
  10  |   label instanceof RegExp ? label : new RegExp(esc(label).replace(/\s+/g, '[\\s_-]*'), 'i');
  11  | 
  12  | /**
  13  |  * Resilient field finder: label -> placeholder -> data-testid -> name/id attribute.
  14  |  * If the real UI uses different wording, pass a RegExp or change the label in data/*.ts.
  15  |  */
  16  | export function field(scope: Scope, label: string | RegExp, nth: 'first' | 'last' = 'first'): Locator {
  17  |   const rx = labelRx(label);
  18  |   // Only real form controls may match (a data-testid like "login-form" must never be picked).
  19  |   const CONTROL = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea';
  20  |   let loc = scope.locator(CONTROL).and(scope.getByLabel(rx))
  21  |     .or(scope.locator(CONTROL).and(scope.getByPlaceholder(rx)))
  22  |     .or(scope.locator(CONTROL).and(scope.getByTestId(rx)));
  23  |   if (typeof label === 'string') {
  24  |     const words = label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  25  |     const variants = [words.join(''), words.join('_'), words.join('-')];
  26  |     const attr = variants.map((v) => `input[name*="${v}" i], input[id*="${v}" i], select[name*="${v}" i], select[id*="${v}" i], textarea[name*="${v}" i], textarea[id*="${v}" i]`).join(', ');
  27  |     loc = loc.or(scope.locator(attr));
  28  |   }
  29  |   return nth === 'last' ? loc.last() : loc.first();
  30  | }
  31  | 
  32  | export async function isPresent(loc: Locator, timeout = 1500): Promise<boolean> {
  33  |   try {
  34  |     await loc.waitFor({ state: 'visible', timeout });
  35  |     return true;
  36  |   } catch {
  37  |     return false;
  38  |   }
  39  | }
  40  | 
  41  | /** Fill a text input / select / checkbox with whatever the control turns out to be. */
  42  | export async function setField(scope: Scope, label: string | RegExp, value: string | number | boolean, nth: 'first' | 'last' = 'first') {
  43  |   const el = field(scope, label, nth);
> 44  |   await el.waitFor({ state: 'visible', timeout: 10_000 });
      |            ^ TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
  45  |   const tag = await el.evaluate((n) => n.tagName.toLowerCase());
  46  |   const type = await el.evaluate((n) => (n as HTMLInputElement).type || '');
  47  |   if (tag === 'select') {
  48  |   const want = String(value).trim().toLowerCase();
  49  |   const opts = await el.locator('option').evaluateAll((os) =>
  50  |     os.map((o) => ({ value: (o as HTMLOptionElement).value, text: (o.textContent || '').trim() })));
  51  |   const hit =
  52  |     opts.find((o) => o.text.toLowerCase() === want || o.value.toLowerCase() === want) ||
  53  |     opts.find((o) => o.text.toLowerCase().startsWith(want[0]) && o.value !== '') ||
  54  |     opts.find((o) => o.value !== '');
  55  |   if (!hit) throw new Error(`No selectable option for "${value}". Options: ${JSON.stringify(opts)}`);
  56  |   await el.selectOption(hit.value);
  57  | } else if (type === 'checkbox' || type === 'radio') {
  58  |     await el.setChecked(Boolean(value));
  59  |   } else {
  60  |     await el.fill(String(value));
  61  |   }
  62  | }
  63  | 
  64  | export async function fillIfPresent(scope: Scope, label: string | RegExp, value: string | number | boolean, nth: 'first' | 'last' = 'first') {
  65  |   if (await isPresent(field(scope, label, nth), 800)) {
  66  |     await setField(scope, label, value, nth);
  67  |     return true;
  68  |   }
  69  |   return false;
  70  | }
  71  | 
  72  | /** Type a date into either a native date input (ISO) or a text input (DATE_FORMAT). */
  73  | export async function setDate(scope: Scope, label: string | RegExp, d: Date, nth: 'first' | 'last' = 'first') {
  74  |   const el = field(scope, label, nth);
  75  |   await el.waitFor({ state: 'visible', timeout: 10_000 });
  76  |   const type = await el.evaluate((n) => (n as HTMLInputElement).type);
  77  |   await el.fill(type === 'date' ? fmt(d, 'YYYY-MM-DD') : fmt(d, env.dateFormat));
  78  |   await el.blur();
  79  | }
  80  | /** Raw string variant for invalid dates. */
  81  | export async function setRawDate(scope: Scope, label: string | RegExp, raw: string) {
  82  |   const el = field(scope, label);
  83  |   await el.waitFor({ state: 'visible', timeout: 10_000 });
  84  |   const type = await el.evaluate((n) => (n as HTMLInputElement).type);
  85  |   if (type === 'date') {
  86  |     await el.evaluate((n, v) => { (n as HTMLInputElement).value = v; n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true })); }, raw);
  87  |   } else {
  88  |     await el.fill(raw);
  89  |   }
  90  |   await el.blur();
  91  | }
  92  | 
  93  | export const button = (scope: Scope, name: string | RegExp): Locator =>
  94  |   scope.getByRole('button', { name: typeof name === 'string' ? labelRx(name) : name }).first();
  95  | 
  96  | export async function clickIfVisible(scope: Scope, name: string | RegExp, timeout = 1200): Promise<boolean> {
  97  |   const b = button(scope, name);
  98  |   if (await isPresent(b, timeout)) {
  99  |     await b.click();
  100 |     return true;
  101 |   }
  102 |   return false;
  103 | }
  104 | 
  105 | const ERROR_SELECTOR = [
  106 |   '[role="alert"]', '.error', '.errors', '.error-message', '.field-error', '.invalid-feedback', '.text-danger',
  107 |   '.text-red-500', '.text-red-600', '[class*="error" i]', '[data-testid*="error" i]', '[aria-invalid="true"]',
  108 |   'mat-error', '.Mui-error', '.ant-form-item-explain-error', '.toast-error', '.alert-danger',
  109 | ].join(', ');
  110 | 
  111 | export function errors(page: Page, text?: string | RegExp): Locator {
  112 |   const base = page.locator(ERROR_SELECTOR);
  113 |   return text ? base.filter({ hasText: text }).or(page.getByText(text)) : base;
  114 | }
  115 | export async function expectValidationError(page: Page, text?: string | RegExp) {
  116 |   await expect(errors(page, text).first(), `expected a validation error${text ? ` matching ${text}` : ''}`).toBeVisible({ timeout: 8000 });
  117 | }
  118 | export async function expectNoValidationError(page: Page) {
  119 |   await expect(page.locator('[role="alert"]:visible, .error:visible, .invalid-feedback:visible, [aria-invalid="true"]:visible')).toHaveCount(0);
  120 | }
  121 | export const appIdFromUrl = (url: string): string | null => {
  122 |   const m = url.match(/\/applications\/([^/?#]+)/);
  123 |   return m && m[1] !== 'new' ? m[1] : null;
  124 | };
  125 | export const money = (n: number) => n.toLocaleString('en-US');
  126 | 
  127 | /** Visible text of the premium element (first element mentioning "premium" with a number). */
  128 | export async function readPremium(page: Page): Promise<number | null> {
  129 |   const loc = page.locator('[data-testid*="premium" i], :text-matches("premium", "i")').filter({ hasText: /\d/ }).first();
  130 |   if (!(await isPresent(loc, 4000))) return null;
  131 |   const txt = (await loc.innerText()).replace(/,/g, '');
  132 |   const m = txt.match(/(\d+(?:\.\d+)?)/g);
  133 |   return m ? Number(m[m.length - 1]) : null;
  134 | }
  135 | 
```