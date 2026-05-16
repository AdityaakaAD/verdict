// Region list for onboarding step 3. Each region carries a default IANA
// timezone used to seed the profile (the streak system + 9 PM Featured drop
// rely on this being correct from day one).

export interface Region {
  code: string;
  label: string;
  timezone: string;
}

export const REGIONS: readonly Region[] = [
  { code: 'IN', label: 'India', timezone: 'Asia/Kolkata' },
  { code: 'BD', label: 'Bangladesh', timezone: 'Asia/Dhaka' },
  { code: 'LK', label: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { code: 'NP', label: 'Nepal', timezone: 'Asia/Kathmandu' },
  { code: 'PK', label: 'Pakistan', timezone: 'Asia/Karachi' },
  { code: 'SG', label: 'Singapore', timezone: 'Asia/Singapore' },
  { code: 'MY', label: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'ID', label: 'Indonesia', timezone: 'Asia/Jakarta' },
  { code: 'PH', label: 'Philippines', timezone: 'Asia/Manila' },
  { code: 'AE', label: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  { code: 'GB', label: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'US', label: 'United States', timezone: 'America/New_York' },
  { code: 'CA', label: 'Canada', timezone: 'America/Toronto' },
  { code: 'AU', label: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'OTHER', label: 'Somewhere else', timezone: 'UTC' },
] as const;

export function regionFromCode(code: string): Region {
  return REGIONS.find((r) => r.code === code) ?? REGIONS[0]!;
}
