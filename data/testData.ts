import { dobForAge, iso } from '../utils/dates';
import { env } from '../config/env';

/** UI label -> value. Labels are matched flexibly (see utils/ui.ts); unknown/optional labels are skipped. */
export type FormData = Record<string, string | number | boolean>;

let seq = Date.now() % 100000;
export const uniq = () => `${++seq}`;

export const validClient = (over: FormData = {}): FormData => ({
  'First Name': 'Asha',
  'Last Name': `Verma${uniq()}`,
  Gender: 'Female',
  'Marital Status': 'Married',
  Nationality: 'Indian',
  Occupation: 'Engineer',
  ...over,
});
export const validDob = () => dobForAge(35);

export const validAddress = (over: FormData = {}): FormData => ({
  'Address Line 1': '12 Park Street',
  'Address Line 2': 'Sector 5',
  City: 'Mumbai',
  State: 'Maharashtra',
  'Postal Code': '400001',
  Country: 'India',
  Email: `asha.${uniq()}@example.com`,
  Phone: '9876543210',
  ...over,
});

export const validKyc = (over: FormData = {}): FormData => ({
  'ID Type': 'Passport',
  'ID Number': 'P1234567',
  'Annual Income': 1200000,
  'Net Worth': 5000000,
  'Source of Funds': 'Salary',
  Employer: 'ACME Pvt Ltd',
  ...over,
});

export const validProduct = () => ({ product: env.productName, faceValue: env.faceValueValid });

export interface Beneficiary { name: string; relationship: string; dob: Date; percentage: number; type?: string; guardian?: string; }
export const adultBeneficiary = (pct = 100, over: Partial<Beneficiary> = {}): Beneficiary => ({
  name: `Ben Adult ${uniq()}`, relationship: 'Spouse', dob: dobForAge(34), percentage: pct, type: 'Primary', ...over,
});
export const minorBeneficiary = (pct = 100, over: Partial<Beneficiary> = {}): Beneficiary => ({
  name: `Ben Minor ${uniq()}`, relationship: 'Child', dob: dobForAge(8), percentage: pct, type: 'Primary', guardian: 'Guardian Parent', ...over,
});

export const SQLI = "' OR '1'='1";
export const XSS = '<script>window.__xss=1</script>';
export const todayIso = () => iso(new Date());
