// ─── SITE CONFIG ───────────────────────────────────────────────────────────
// To clone this site for a new niche: edit EVERY field in this file,
// swap out src/data/companies.ts, and you're done.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name:          'TODO: Site Name',
  domain:        'TODO: yourdomain.com',
  url:           'https://TODO.yourdomain.com',
  tagline:       'TODO: Independent reviews of [Niche]',
  description:   'TODO: Site meta description for search engines.',
  locale:        'en_US',
  twitterHandle: '',        // e.g. '@yourhandle' — leave empty to omit OG tag
};

export const NICHE = {
  label:          'TODO: Niche Label',    // e.g. "AI Agent Development" — used in headings and meta
  providerLabel:  'company',              // singular: "company" or "agency" or "tool"
  providersLabel: 'companies',            // plural
  verticalSlug:   'TODO-niche-slug',      // used in URL slugs, e.g. "ai-agent-development"
};

export const BRANDING = {
  primaryColor: '#1e40af',  // tailwind brand-600; update tailwind.config.mjs too
  logoText:     'TODO: Site Name',
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
