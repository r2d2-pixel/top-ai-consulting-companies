# Build Progress

## Phase Checklist

- [ ] **Phase 0** — Config and niche setup
  - [ ] `src/config.ts` — SITE, NICHE, BRANDING fields updated
  - [ ] `astro.config.mjs` — `site:` updated to real domain
  - [ ] `tailwind.config.mjs` — brand color updated (if changing from default)

- [ ] **Phase 1** — Company data
  - [ ] `src/data/companies.ts` — at least 5 Company objects added
  - [ ] Logos added to `public/logos/` (optional; initials fallback is fine)
  - [ ] `npm run build` passes with company data

- [ ] **Phase 2** — Content review
  - [ ] `src/pages/index.astro` — TODO sections replaced with niche content
  - [ ] Quick Answer Box updated with real company recommendations
  - [ ] Use-case table rows filled in for your niche
  - [ ] Industry table rows filled in
  - [ ] Pricing table rows updated with real ranges
  - [ ] FAQ updated with niche-specific answers
  - [ ] SEO prose updated for your niche

- [ ] **Phase 3** — SEO setup
  - [ ] Page titles and descriptions checked across all pages
  - [ ] `src/pages/affiliate-disclosure.astro` — disclosure text updated
  - [ ] `SITE.lastReviewed` updated to current month/year

- [ ] **Phase 4** — Deploy
  - [ ] Cloudflare DNS / Pages configured
  - [ ] `public/_headers` verified
  - [ ] `npm run build` passes clean — expected pages: 1 home + N profiles + N alternatives + N×(N-1)/2 comparisons + guide + disclosure + 404
  - [ ] Sitemap submitted to Google Search Console

- [ ] **Phase 5** — Bot dashboard (optional)
  - [ ] Cloudflare Custom Dashboard created per domain
  - [ ] 5 charts configured per spec in `docs/superpowers/specs/`
