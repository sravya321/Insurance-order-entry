import { expect, test } from '@playwright/test';
import { ApiClient, P } from '../../utils/api';
import { env } from '../../config/env';

export { P };
export const api = env.api;

/** Authenticated API client for a seeded user (X-API-Key + token if the login service returns one). */
export async function asUser(email: string): Promise<ApiClient> {
  const c = await ApiClient.create(); await c.login(email); return c;
}
/** Creates a draft application via API, or skips the test with a clear reason if the assumed endpoint differs. */
export async function newApp(c: ApiClient): Promise<string> {
  const id = await c.createApplication();
  test.skip(!id, `Could not create application via POST ${env.api.applications} - confirm endpoint/contract (D-05)`);
  return id!;
}
export const rejected = (s: number) => [400, 401, 403, 404, 409, 413, 415, 422].includes(s);
export function expectRejected(status: number, msg = '') { expect(rejected(status), `${msg} expected 4xx rejection, got ${status}`).toBeTruthy(); }
export function expectOk(status: number, msg = '') { expect([200, 201, 202, 204], `${msg} got ${status}`).toContain(status); }
