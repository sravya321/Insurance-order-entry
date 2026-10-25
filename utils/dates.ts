export function addYears(d: Date, years: number): Date {
  const r = new Date(d.getTime());
  r.setFullYear(r.getFullYear() + years);
  return r;
}
export function addDays(d: Date, days: number): Date {
  const r = new Date(d.getTime());
  r.setDate(r.getDate() + days);
  return r;
}
/** DOB giving an exact age today; extraDays>0 makes the person that many days YOUNGER. */
export function dobForAge(years: number, extraDays = 0): Date {
  const t = new Date();
  const base = new Date(t.getFullYear() - years, t.getMonth(), t.getDate());
  return addDays(base, extraDays);
}
export const futureDate = (days = 1) => addDays(new Date(), days);
export function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function fmt(d: Date, pattern: string): string {
  const [y, m, dd] = iso(d).split('-');
  return pattern.replace('YYYY', y).replace('MM', m).replace('DD', dd);
}
