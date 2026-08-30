export type { Company } from '../data/companies';
export { companies, getCompany, getAllSlugs, getComparisons } from '../data/companies';
import { companies } from '../data/companies';

export function getCompanies() {
  return companies;
}

// A company's minimumEngagement is "undisclosed" if it uses any of these
// sentinel strings rather than a real figure. Check membership here instead
// of `=== 'Not disclosed'` directly — a company entry can legitimately use a
// different phrasing (e.g. "Not published") for the same underlying fact,
// and every template that splices minimumEngagement into a sentence needs to
// treat all of them the same way to avoid rendering e.g. "Minimum engagement
// starts at Not published."
const UNDISCLOSED_MINIMUMS = new Set(['Not disclosed', 'Not published']);
export function isUndisclosedMinimum(value: string): boolean {
  return UNDISCLOSED_MINIMUMS.has(value);
}

// Update these keys/labels to match the service categories in your niche
export const SERVICE_LABELS: Record<string, string> = {
  'custom-build':   'Custom Build',
  'consulting':     'Consulting',
  'integration':    'Integration',
  'staff-aug':      'Staff Aug',
  'fixed-price':    'Fixed Price',
  'dedicated-team': 'Dedicated Team',
};
