import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { env } from '../config/env';

export const P = (tpl: string, id = '') => tpl.replace('{id}', encodeURIComponent(id));

export class ApiClient {
  token = '';
  private constructor(readonly ctx: APIRequestContext, private withKey: boolean) {}
  static async create(opts: { key?: string | null } = {}): Promise<ApiClient> {
    const key = opts.key === undefined ? env.apiKey : opts.key;
    const ctx = await request.newContext({
      extraHTTPHeaders: { Accept: 'application/json', ...(key ? { 'X-API-Key': key } : {}) },
    });
    return new ApiClient(ctx, !!key);
  }
  private h(extra: Record<string, string> = {}) { return { ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...extra }; }
  url = (p: string) => `${env.apiUrl}${p}`;
  get = (p: string) => this.ctx.get(this.url(p), { headers: this.h(), failOnStatusCode: false });
  post = (p: string, data?: unknown) => this.ctx.post(this.url(p), { data: data as any, headers: this.h(), failOnStatusCode: false });
  put = (p: string, data?: unknown) => this.ctx.put(this.url(p), { data: data as any, headers: this.h(), failOnStatusCode: false });
  patch = (p: string, data?: unknown) => this.ctx.patch(this.url(p), { data: data as any, headers: this.h(), failOnStatusCode: false });
  del = (p: string) => this.ctx.delete(this.url(p), { headers: this.h(), failOnStatusCode: false });
  raw = (method: string, p: string, o: Record<string, unknown> = {}) => this.ctx.fetch(this.url(p), { method, failOnStatusCode: false, ...(o as any) });

  async login(email: string, password = env.passwordOf(email)): Promise<APIResponse> {
    const r = await this.post(env.api.login, { email, username: email, password });
    const j = await r.json().catch(() => ({}));
    this.token = j.token || j.accessToken || j.access_token || j.data?.token || '';
    return r;
  }
  async createApplication(body: unknown = {}): Promise<string | null> {
    const r = await this.post(env.api.applications, body);
    if (!r.ok()) return null;
    const j = await r.json().catch(() => ({}));
    const id = j.id ?? j.applicationId ?? j.data?.id ?? j.data?.applicationId;
    return id ? String(id) : null;
  }
  dispose() { return this.ctx.dispose(); }
}

export const validClientPayload = (dob: string) => ({
  firstName: 'Asha', lastName: 'Verma', dateOfBirth: dob, dob, gender: 'Female', maritalStatus: 'Married', nationality: 'Indian', occupation: 'Engineer',
});
export const validAddressPayload = () => ({
  addressLine1: '12 Park Street', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India', email: 'asha@example.com', phone: '9876543210',
});
