# Insurance Order Entry – Playwright automation (TypeScript)

Automates the 257 test cases in `Insurance_Order_Entry_Test_Cases.xlsx` for the Whole Life agent application
(login → dashboard → client → address → KYC → product → riders → beneficiaries → documents → review → submit → status), plus the REST API.
Every test title starts with its workbook TC ID (e.g. `AUTH-001`, `BEN-014`). See **COVERAGE.md** for the full map.

## Quick start
```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env        # already pre-filled with the URLs/credentials you supplied
npm run test:smoke          # fast sanity pass
npm test                    # everything (UI + API + E2E)
npm run report              # open the HTML report
```
Useful: `npm run test:api`, `npm run test:critical`, `npm run test:headed`, `npx playwright test -g "BEN-0"`, `BROWSERS=all npm run test:all-browsers`.

## Layout
| Path | Purpose |
|---|---|
| `playwright.config.ts` | Projects: `setup` (logs in each seed user, saves `.auth/*.json`), `chromium` (UI+E2E), `api`, optional firefox/webkit. Trace/video/screenshot retained on failure; HTML + JUnit reports. |
| `config/env.ts`, `.env` | URLs, API key, users, business-rule values, API paths. |
| `pages/` | Page objects: `LoginPage`, `DashboardPage`, wizard steps in `ApplicationPages.ts`. |
| `utils/ui.ts` | Resilient locators (label → placeholder → testid → name/id), validation-error helpers. |
| `utils/flows.ts` | `AppFlow`: builds an application up to any step, submits, etc. |
| `utils/api.ts` | `ApiClient` (X-API-Key + optional bearer token). |
| `fixtures/index.ts` | Test fixtures (`loginPage`, `dashboard`, `flow`, `api`) + console-error attachment. |
| `data/testData.ts`, `utils/dates.ts`, `utils/files.ts` | Data builders, exact-age DOB helper, generated upload files (pdf/jpg/png/exe/zip/empty/over-limit...). |
| `tests/ui`, `tests/api`, `tests/e2e` | Specs, one file per area. |
| `.github/workflows/playwright.yml` | CI: smoke first, then full run, artifacts retained. |

## Read this before the first run
1. **Selectors are inferred, not recorded.** I could not reach the application from where this was built, so field labels, button names and
   error containers come from your documents. `utils/ui.ts` matches flexibly (label/placeholder/test-id/name, case/space/underscore-insensitive),
   but expect to tune some labels in `data/testData.ts` or the page objects after the first run. Fastest way: run `npm run test:headed -- -g "CLNT-001"`,
   read the failure, adjust, repeat per module (client → address → …); later steps reuse earlier ones via `AppFlow`.
2. **API paths are assumed** (`/auth/login`, `/applications`, `/applications/{id}/client` …). Override in `.env` (`API_*`) once you have the contract.
   Tests skip (with the reason) if the application cannot be created through the assumed endpoint.
3. **Business values were never supplied.** Tests needing them skip with a reason until you fill `.env`:
   `FACE_VALUE_MIN/MAX`, `MAX_UPLOAD_MB`, `MAX_RIDERS`, `RIDER_NAME`, `EXCLUSIVE_RIDER_A/B`, `DEPENDENT_RIDER`, `LOCKOUT_THRESHOLD`.
4. **21 cases are `test.fixme`** (shown as "fixme" in reports): MFA/OTP, session timeout, database checks (DB-001…005), premium formula,
   rider age/dependency matrices, affordability rules, status-transition matrix, trust/organisation beneficiaries, API schemas. Remove `fixme` when inputs arrive.
5. **State and destructive tests.** Tests create and submit applications, so run serially (default `workers: 1`). `AUTH-013` locks `learner001`
   (and `AUTH-014` uses `learner002`); `agent.valid` is never locked. Ask the environment owner for the reset procedure (Clarification 4).
6. **Defects are expected.** The app contains seeded defects (per the risk list). A failing test such as `CAPI-002` ("API accepts underage DOB")
   is a finding, not necessarily a script bug – check the trace first.
7. Environment is plain HTTP; `NFR-006` records missing security headers as annotations rather than failing.

## Classifying failures
Console errors are attached to failing tests. Use the trace (`npx playwright show-trace test-results/<test>/trace.zip`) to decide:
application defect vs locator/automation issue vs data/environment vs flaky. Retries are for diagnosis only (CI: 1).
