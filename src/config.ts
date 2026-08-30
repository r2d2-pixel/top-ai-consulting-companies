// ─── SITE CONFIG ───────────────────────────────────────────────────────────
// To clone this site for a new niche: edit EVERY field in this file,
// swap out src/data/companies.ts, and you're done.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name:          'Top AI Consulting Companies',
  domain:        'top-ai-consulting-companies.com',
  url:           'https://top-ai-consulting-companies.com',
  tagline:       'Independent reviews of AI consulting companies',
  description:   'Ranked, independently researched reviews of the top AI consulting companies — strategy, readiness assessment, and implementation partners compared side by side.',
  locale:        'en_US',
  twitterHandle: '',        // e.g. '@yourhandle' — leave empty to omit OG tag
};

export const NICHE = {
  label:          'AI Consulting',
  providerLabel:  'company',
  providersLabel: 'companies',
  verticalSlug:   'ai-consulting',
};

export const BRANDING = {
  primaryColor: '#059669',  // tailwind brand-600; update tailwind.config.mjs too
  logoText:     'Top AI Consulting Companies',
  logoPath:     '/logos/site-logo.svg',   // place file in public/logos/
};

// ─── MONETIZATION ──────────────────────────────────────────────────────────
export const MONETIZATION = {
  enabled: false,
  // When enabled=true, companies with monetized:true get rel="sponsored" on outbound links.
  // Set to false site-wide to strip all sponsored rels (e.g. while testing).
  defaultRel: 'nofollow' as 'sponsored' | 'nofollow' | '',
  disclosurePath: '/affiliate-disclosure',
};

// ─── NAV ───────────────────────────────────────────────────────────────────
export const NAV = [
  { label: 'Home',        href: '/' },
  { label: 'Disclosure',  href: '/affiliate-disclosure/' },
];
