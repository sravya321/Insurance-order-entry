# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth-dashboard.api.spec.ts >> Authentication (API) >> AAPI-004 login valid credentials @critical
- Location: tests\api\auth-dashboard.api.spec.ts:20:7

# Error details

```
Error: login got 404

expect(received).toContain(expected) // indexOf

Expected value: 404
Received array: [200, 201, 202, 204]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { ApiClient, P } from '../../utils/api';
  3  | import { env } from '../../config/env';
  4  | 
  5  | export { P };
  6  | export const api = env.api;
  7  | 
  8  | /** Authenticated API client for a seeded user (X-API-Key + token if the login service returns one). */
  9  | export async function asUser(email: string): Promise<ApiClient> {
  10 |   const c = await ApiClient.create(); await c.login(email); return c;
  11 | }
  12 | /** Creates a draft application via API, or skips the test with a clear reason if the assumed endpoint differs. */
  13 | export async function newApp(c: ApiClient): Promise<string> {
  14 |   const id = await c.createApplication();
  15 |   test.skip(!id, `Could not create application via POST ${env.api.applications} - confirm endpoint/contract (D-05)`);
  16 |   return id!;
  17 | }
  18 | export const rejected = (s: number) => [400, 401, 403, 404, 409, 413, 415, 422].includes(s);
  19 | export function expectRejected(status: number, msg = '') { expect(rejected(status), `${msg} expected 4xx rejection, got ${status}`).toBeTruthy(); }
> 20 | export function expectOk(status: number, msg = '') { expect([200, 201, 202, 204], `${msg} got ${status}`).toContain(status); }
     |                                                                                                           ^ Error: login got 404
  21 | 
```