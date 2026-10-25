import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const e = process.env;
const num = (v?: string) => (v && v.trim() !== '' && !isNaN(Number(v)) ? Number(v) : undefined);

export const env = {
  baseUrl: e.BASE_URL || 'http://34.93.145.116:8081',
  apiUrl: (e.API_URL || 'http://34.93.145.116:8081/api').replace(/\/$/, ''),
  apiKey: e.API_KEY || 'qa-insurance-demo-token-123',
  password: e.PASSWORD || 'Password@123',
  users: {
    valid: e.USER_VALID || 'agent.valid@insurance.test',
    new: e.USER_NEW || 'agent.new@insurance.test',
    draft: e.USER_DRAFT || 'agent.draft@insurance.test',
    submitted: e.USER_SUBMITTED || 'agent.submitted@insurance.test',
    locked: e.USER_LOCKED || 'agent.locked@insurance.test',
  },
  learner: (n: number) =>
    `${e.LEARNER_PREFIX || 'learner'}${String(n).padStart(3, '0')}@${e.LEARNER_DOMAIN || 'insurance.test'}`,
  // Forced password change (policy: >=12 chars, upper, lower, digit, one of !@#$%^&*, no 1234/abcd/qwer/password/welcome/admin/letmein, no aaa/111).
  autoChangePassword: (e.AUTO_CHANGE_PASSWORD || '').toLowerCase() === 'true',
  newPassword: e.NEW_PASSWORD || 'Qa#Insure2026xyz!',
  passwordOf: (email: string) => passwordOf(email),
  dateFormat: e.DATE_FORMAT || 'YYYY-MM-DD',
  // Business rule values: undefined => dependent tests are skipped with a clear reason.
  lockoutThreshold: num(e.LOCKOUT_THRESHOLD),
  productName: e.PRODUCT_NAME || 'Whole Life',
  faceValueValid: num(e.FACE_VALUE_VALID) ?? 500000,
  faceValueMin: num(e.FACE_VALUE_MIN),
  faceValueMax: num(e.FACE_VALUE_MAX),
  maxUploadMb: num(e.MAX_UPLOAD_MB),
  maxRiders: num(e.MAX_RIDERS),
  riderName: e.RIDER_NAME || '',
  exclusiveRiderA: e.EXCLUSIVE_RIDER_A || '',
  exclusiveRiderB: e.EXCLUSIVE_RIDER_B || '',
  dependentRider: e.DEPENDENT_RIDER || '',
  prerequisiteRider: e.PREREQUISITE_RIDER || '',
  api: {
    login: e.API_LOGIN || '/auth/login',
    logout: e.API_LOGOUT || '/auth/logout',
    applications: e.API_APPLICATIONS || '/applications',
    client: e.API_CLIENT || '/applications/{id}/client',
    address: e.API_ADDRESS || '/applications/{id}/address-contact',
    kyc: e.API_KYC || '/applications/{id}/kyc-financial',
    product: e.API_PRODUCT || '/applications/{id}/product',
    riders: e.API_RIDERS || '/applications/{id}/riders',
    beneficiaries: e.API_BENEFICIARIES || '/applications/{id}/beneficiaries',
    documents: e.API_DOCUMENTS || '/applications/{id}/documents',
    validate: e.API_VALIDATE || '/applications/{id}/validate',
    submit: e.API_SUBMIT || '/applications/{id}/submit',
    status: e.API_STATUS || '/applications/{id}/status',
  },
};


// ---- Per-user passwords -------------------------------------------------------------
// Some seeded accounts (agent.valid) are forced to change their password on first login.
// Order of lookup: .auth/passwords.json (written by the auto-change) -> PASSWORD_<LOCALPART> env -> PASSWORD.
const PW_FILE = path.resolve(__dirname, '..', '.auth', 'passwords.json');
export function passwordOf(email: string): string {
  try { const m = JSON.parse(fs.readFileSync(PW_FILE, 'utf8')); if (m[email]) return m[email]; } catch { /* none yet */ }
  const key = 'PASSWORD_' + email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return process.env[key] || env.password;
}
export function rememberPassword(email: string, pw: string) {
  let m: Record<string, string> = {};
  try { m = JSON.parse(fs.readFileSync(PW_FILE, 'utf8')); } catch { /* new file */ }
  m[email] = pw; fs.mkdirSync(path.dirname(PW_FILE), { recursive: true }); fs.writeFileSync(PW_FILE, JSON.stringify(m, null, 2));
}

export type UserKey = 'valid' | 'new' | 'draft' | 'submitted';
export const authFile = (k: UserKey) => path.resolve(__dirname, '..', '.auth', `${k}.json`);
