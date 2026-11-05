# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\journeys.spec.ts >> E2E - other personas >> new user >> E2E-005 first-run journey from clean state
- Location: tests\e2e\journeys.spec.ts:58:9

# Error details

```
TimeoutError: locator.waitFor: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByLabel(/^(full )?name|beneficiary name/i)).or(locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByPlaceholder(/^(full )?name|beneficiary name/i))).or(locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').and(getByTestId(/^(full )?name|beneficiary name/i))).last() to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=f8e1]:
  - navigation [ref=f8e2]:
    - generic [ref=f8e3]:
      - link "Insurance Order Entry Demo Platform QA Automation Training App" [ref=f8e4] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/dashboard
        - generic [aria-hidden] [ref=f8e5]: IO
        - generic [ref=f8e6]:
          - generic [ref=f8e7]: Insurance Order Entry Demo Platform
          - generic [ref=f8e8]: QA Automation Training App
      - generic [ref=f8e9]:
        - list [ref=f8e10]:
          - listitem [ref=f8e11]:
            - link "Dashboard" [ref=f8e12] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/dashboard
          - listitem [ref=f8e13]:
            - link "Applications" [ref=f8e14] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/applications
          - listitem [ref=f8e15]:
            - link "Products" [ref=f8e16] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/products
          - listitem [ref=f8e17]:
            - link "Support" [ref=f8e18] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/support
        - generic [ref=f8e19]:
          - link "New Agent" [ref=f8e20] [cursor=pointer]:
            - /url: http://8.231.84.60:8081/profile
          - button "Logout" [ref=f8e22] [cursor=pointer]
  - main [ref=f8e23]:
    - alert [ref=f8e24]: Rider selection saved.
    - generic [ref=f8e26]:
      - link "← Back to Riders" [ref=f8e27] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/applications/117/riders
      - link "Application Summary" [ref=f8e28] [cursor=pointer]:
        - /url: http://8.231.84.60:8081/applications/117
    - generic [ref=f8e29]:
      - generic [ref=f8e30]:
        - generic [ref=f8e31]:
          - generic [ref=f8e32]: "Application #117"
          - heading "Beneficiaries" [level=1] [ref=f8e33]
          - paragraph [ref=f8e34]: Add or update primary and secondary beneficiaries for the policy.
        - link "Back to Application" [ref=f8e35] [cursor=pointer]:
          - /url: http://8.231.84.60:8081/applications/117
      - generic [ref=f8e36]: "Primary allocation: 0.00% | Secondary allocation: 0.00%"
      - generic [ref=f8e37]: No beneficiary has been added. Estate assignment will apply by default if no beneficiary is named.
      - generic [ref=f8e38]:
        - strong [ref=f8e40]: Existing Beneficiaries
        - table [ref=f8e43]:
          - rowgroup [ref=f8e44]:
            - row [ref=f8e45]:
              - columnheader "Level" [ref=f8e46]
              - columnheader "Type" [ref=f8e47]
              - columnheader "Name" [ref=f8e48]
              - columnheader "Designation" [ref=f8e49]
              - columnheader "Relationship" [ref=f8e50]
              - columnheader "Age" [ref=f8e51]
              - columnheader "Allocation" [ref=f8e52]
              - columnheader "Email" [ref=f8e53]
              - columnheader "Phone" [ref=f8e54]
              - columnheader "Action" [ref=f8e55]
          - rowgroup [ref=f8e56]:
            - row [ref=f8e57]:
              - cell "No beneficiaries added yet. Estate assignment will apply by default." [ref=f8e58]
      - generic [ref=f8e59]:
        - generic [ref=f8e60]:
          - strong [ref=f8e62]: Add Beneficiary
          - generic [ref=f8e64]:
            - generic [ref=f8e65]:
              - generic [ref=f8e66]: Beneficiary Level *
              - combobox [ref=f8e67]:
                - option "Select" [selected]
                - option "Primary"
                - option "Secondary"
            - generic [ref=f8e68]:
              - generic [ref=f8e69]: Beneficiary Type *
              - combobox [ref=f8e70]:
                - option "Individual" [selected]
                - option "Trust"
                - option "Organization"
            - generic [ref=f8e71]:
              - generic [ref=f8e72]: Relationship *
              - combobox [ref=f8e73]:
                - option "Select" [selected]
                - option "Spouse"
                - option "Child"
                - option "Parent"
                - option "Sibling"
                - option "Trust"
                - option "Organization"
                - option "Other"
            - generic [ref=f8e74]:
              - generic [ref=f8e75]: Allocation % *
              - spinbutton [ref=f8e76]: "100"
            - generic [ref=f8e77]:
              - generic [ref=f8e78]: Beneficiary Designation *
              - combobox [ref=f8e79]:
                - option "Revocable" [selected]
                - option "Irrevocable"
              - generic [ref=f8e80]: Irrevocable beneficiaries cannot be changed or removed in this demo without beneficiary consent.
            - generic [ref=f8e81]:
              - generic [ref=f8e82]: Phone
              - textbox "(212) 555-1212" [ref=f8e83]
            - generic [ref=f8e84]:
              - generic [ref=f8e85]: Email
              - textbox [ref=f8e86]
            - generic [ref=f8e87]:
              - generic [ref=f8e88]: Country
              - textbox [ref=f8e89]: US
        - generic [ref=f8e90]:
          - strong [ref=f8e92]: Individual Beneficiary Details
          - generic [ref=f8e94]:
            - generic [ref=f8e95]:
              - generic [ref=f8e96]: First Name *
              - textbox [ref=f8e97]
            - generic [ref=f8e98]:
              - generic [ref=f8e99]: Middle Name
              - textbox [ref=f8e100]
            - generic [ref=f8e101]:
              - generic [ref=f8e102]: Last Name *
              - textbox [ref=f8e103]
            - generic [ref=f8e104]:
              - generic [ref=f8e105]: Date of Birth *
              - textbox [ref=f8e106]
            - generic [ref=f8e107]:
              - generic [ref=f8e108]: Gender
              - combobox [ref=f8e109]:
                - option "Select" [selected]
                - option "Male"
                - option "Female"
                - option "Non-binary"
        - generic [ref=f8e110]:
          - strong [ref=f8e112]: Address Details
          - generic [ref=f8e114]:
            - generic [ref=f8e115]:
              - generic [ref=f8e116]: Address Line 1
              - textbox [ref=f8e117]
            - generic [ref=f8e118]:
              - generic [ref=f8e119]: City
              - textbox [ref=f8e120]
            - generic [ref=f8e121]:
              - generic [ref=f8e122]: State
              - textbox [ref=f8e123]
            - generic [ref=f8e124]:
              - generic [ref=f8e125]: Postal Code
              - textbox [ref=f8e126]
        - generic [ref=f8e127]:
          - strong [ref=f8e129]: Minor Beneficiary Guardian Details
          - generic [ref=f8e131]:
            - generic [ref=f8e132]:
              - generic [ref=f8e133]: Guardian Name
              - textbox [ref=f8e134]
            - generic [ref=f8e135]:
              - generic [ref=f8e136]: Guardian Relationship
              - textbox [ref=f8e137]
            - generic [ref=f8e138]:
              - generic [ref=f8e139]: Guardian Contact
              - textbox [ref=f8e140]
            - generic [ref=f8e141]:
              - generic [ref=f8e142]: Guardian Address
              - textbox [ref=f8e143]
            - generic [ref=f8e145]:
              - checkbox "Legal acknowledgement completed for minor beneficiary" [ref=f8e146]
              - generic [ref=f8e147]: Legal acknowledgement completed for minor beneficiary
        - generic [ref=f8e148]:
          - link "Back" [ref=f8e149] [cursor=pointer]:
            - /url: http://8.231.84.60:8081/applications/117/riders
          - generic [ref=f8e150]:
            - button "Save Beneficiary" [ref=f8e151] [cursor=pointer]
            - link "Continue" [ref=f8e152] [cursor=pointer]:
              - /url: http://8.231.84.60:8081/applications/117/documents
  - contentinfo [ref=f8e153]:
    - generic [ref=f8e154]:
      - generic [ref=f8e155]: TalentFarm QA Automation Lab
      - generic [ref=f8e156]: Insurance Order Entry Demo
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