# CLAUDE.md — Niche Reviewer Template Playbook

> Auto-loaded by Claude Code. Playbook for populating this template with
> a new niche and deploying it. Written so a fresh session has everything
> it needs without reading the git history.

---

## Account & Deployment Context

**All repos in this directory belong to the `r2d2-pixel` GitHub account.**
Email: `r2d2@brandseoteam.com`. Do NOT push to `b1tterlemon` or any other account.

### Git authentication

The r2d2-pixel PAT is stored in `~/github/r2d2/.env.local` as `R2D2_GITHUB_TOKEN`.
Use it for any push by embedding it in the remote URL:

```bash
# One-time setup per new site repo:
git remote set-url origin https://r2d2-pixel:$R2D2_GITHUB_TOKEN@github.com/r2d2-pixel/REPO-NAME.git

# Or load the var first, then push normally:
source ~/github/r2d2/.env.local && git push origin main
```

For passwordless long-term use, configure SSH (key: `~/.ssh/id_ed25519_r2d2`):
```bash
# ~/.ssh/config entry:
# Host github-r2d2
#   HostName github.com
#   User git
#   IdentityFile ~/.ssh/id_ed25519_r2d2
#
# Then set remote as: git@github-r2d2:r2d2-pixel/REPO-NAME.git
```

### Cloudflare account

Use the Cloudflare account tied to `r2d2@brandseoteam.com` — **not** the
`b1tterlemon` personal account. When deploying via the dashboard, make sure
you are logged in to the r2d2 Cloudflare account before creating Pages projects.

- Account ID: `1afb7a25a539f57955d72bba8f1cf374`
- API token: stored in `~/github/r2d2/.env.local` as `CLOUDFLARE_API_TOKEN`
- MCP config: `.claude/settings.json` in each repo (gitignored) points all
  Cloudflare MCP servers at this account via Bearer token auth

### Local base directory

All r2d2 client sites live under: `~/github/r2d2/`
The template itself is at: `~/github/r2d2/niche-reviewer-template/`
New sites are cloned/created as siblings: `~/github/r2d2/SITE-NAME/`

### GitHub MCP note

The GitHub MCP in Claude Code sessions may be authenticated as `b1tterlemon`.
Do NOT use `mcp__github__create_repository` for r2d2 client sites — it will
create repos in the wrong account. Always use the curl API approach with
`R2D2_GITHUB_TOKEN`, or the `gh` CLI authenticated as `r2d2-pixel`.

---

## What This Template Is

A generic niche reviewer site built with Astro 5. Clone this repo, populate
`src/data/companies.ts` with verified company data, fill the TODO sections
in `src/pages/index.astro`, and deploy to Cloudflare Pages. All comparison,
alternatives, and profile pages generate automatically.

---

## Workflow Rules

**Always commit after every change.** After applying any edit to any file,
stage only the files in this repo and create a git commit immediately. Then
push to `origin main` so Cloudflare Pages deploys automatically.

```bash
git add src/...        # stage only changed files in this repo
git commit -m "..."
git push origin main
```

**Do the company research inline — never delegate it to an Agent/subagent/fork.**
Phase 2 (researching the N companies) involves many WebSearch calls, which can
look like a good reason to fork it off to keep the main context clean. It is
not — do all research directly in the main session with WebSearch, the same
way you write the resulting `companies.ts` data. Confirmed via session-transcript
audit (2026-07-09): every site built before this rule existed used 0 Agent calls
for research; two sites built after a permission-settings change started
delegating research to a spawned Agent, which roughly doubled token cost with
no benefit, and the user flagged it as a regression. This holds regardless of
company count — 6 companies or 34, same rule.

**Run the `humanizer` skill on every piece of freshly generated prose
before a site ships.** This is a separate skill
(`~/.claude/skills/humanizer/`, canonical copy at
`site-cloner/humanizer.md` alongside this template's own
`create-reviewer-site.md` skill) that checks/corrects text against
house SEO formatting rules and a checklist of telltale AI-generated writing
patterns — banned words/phrases (including em dashes, "roster," "sits at,"
"shop" meaning company, "shortcut"), rule-of-three list templates,
aphoristic closers, and FAQ sections that just restate the body content.
**Invoke it via the `Skill` tool exactly once per site build, in Phase 0d,
before any prose is written — not once per phase.** A skill invocation
loads its full checklist text into context; re-invoking it in Phase 2 and
again in Phase 4f (an earlier version of this rule did) spends tokens
reloading a checklist that's already sitting in context unchanged. Load it
once, then apply it from memory both in Phase 2 (each company's
`tagline`/`description`/`bestFor`/`primaryDifferentiator`/`pros`/`cons`) and
in Phase 4f (the homepage's freehand prose — SEO PROSE blocks, "how we
selected"/"how this list was compiled", FAQ answers), the same way every
other Phase 2/4f content rule in this file is applied from memory rather
than re-read each time. Only re-invoke mid-session if it's plausible the
early context (including this checklist) has already been
summarized/compacted away. See `create-reviewer-site.md` Phase 0d for the
load point and the Phase 5 grep backstop. Added 2026-08-21 after being used
ad hoc to clean up top-embedded-software-companies.com post-launch;
corrected the same day from a twice-per-build invocation to once, per user
feedback that re-invoking a skill whose content hasn't changed wastes
tokens.

**Never check other sites in `~/github/r2d2/` for niche/domain duplication.**
Building several reviewer sites in the same or an overlapping niche under
different domains is intentional — each domain is phrased to match a
different natural-language query (e.g. "top machine learning development
companies" vs "best ml development services" vs "top ml development services
europe"). Do not `ls` the parent directory to survey sibling sites, do not
read another site's `CLAUDE.md` or `companies.ts` to compare rosters/ratings,
and do not ask the user to confirm they're aware of a similar existing site.
Confirmed 2026-07-09: doing this unprompted mid-build cost a full extra
research/confirmation round-trip and was flagged as unwanted — only check
for an existing similar site if the user explicitly asks you to.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 5 |
| Styling | Tailwind CSS 3 + `@tailwindcss/typography` |
| Data | TypeScript (`src/data/companies.ts`) |
| Sitemap | `@astrojs/sitemap` |
| Deploy | Cloudflare Pages (`public/_headers` + `public/_redirects`) |

---

## Complete File Map

### Config (change these first)

| Goal | File | Key to edit |
|---|---|---|
| Site name, domain, tagline | `src/config.ts` | `SITE.*` |
| Niche label, provider label | `src/config.ts` | `NICHE.*` |
| Nav links | `src/config.ts` | `NAV` array |
| Primary accent colour | `src/config.ts` → `BRANDING.primaryColor` **and** `tailwind.config.mjs` → `brand.600` | Both must match |
| Domain in sitemap/canonical | `astro.config.mjs` | `site:` |

### Data

| Goal | File |
|---|---|
| Add / edit company data | `src/data/companies.ts` |
| Add logos | `public/logos/` (initials fallback is automatic) |
| Update service category labels | `src/lib/companies.ts` → `SERVICE_LABELS` |

### Pages

| URL | File |
|---|---|
| Homepage | `src/pages/index.astro` |
| Company profile | `src/pages/companies/[slug].astro` |
| Alternatives | `src/pages/alternatives/[slug].astro` |
| Comparison | `src/pages/comparisons/[slug].astro` |
| Disclosure | `src/pages/affiliate-disclosure.astro` |
| Contact (Web3Forms) | `src/pages/contact.astro` |
| 404 | `src/pages/404.astro` |

### Skills

| Goal | File |
|---|---|
| Site cloning/build playbook | `site-cloner/create-reviewer-site.md` (symlinked as the `create-reviewer-site` skill) |
| Prose humanizer (AI-writing-tell checklist) | `site-cloner/humanizer.md` (symlinked as the `humanizer` skill) — run per gotcha 29 |

---

## Monetization Policy

**Default: `enabled: false`, `defaultRel: 'nofollow'` — always.**

All outbound company links use `rel="nofollow"` until explicitly told otherwise.
Do NOT set `enabled: true` or `defaultRel: 'sponsored'` unless the user explicitly
says they have an affiliate or sponsored relationship with that company.

To enable sponsored rel for a specific site in the future, the user will say so explicitly.

---

## Phase 0 Setup Checklist (do this once per new site)

- [ ] `src/config.ts` — fill every TODO field (SITE, NICHE, BRANDING)
- [ ] `astro.config.mjs` — update `site:` to real domain
- [ ] `tailwind.config.mjs` — update `brand` color to match `BRANDING.primaryColor`
- [ ] `public/favicon.svg` — replace with a niche-appropriate icon; check `~/github/r2d2/PALETTE_REGISTRY.md` first and use an unclaimed color, then update the registry
- [ ] Visual theme — read `~/github/r2d2/THEME_REGISTRY.md`, roll a Major Option (see gotcha #19 below), apply it, update the registry
- [ ] `src/data/companies.ts` — add at least 5 company objects
- [ ] `src/lib/companies.ts` — update `SERVICE_LABELS` to match your badge values
- [ ] `src/pages/index.astro` — fill all TODO sections with niche-specific content
- [ ] Run the `humanizer` skill on company prose (Phase 2)
      and on homepage prose (Phase 4f) — see Workflow Rules above
- [ ] `src/pages/comparisons/[slug].astro` — update `hasCap()` keys and `allTech` array
- [ ] `src/pages/contact.astro` — exists (Web3Forms key `032a901f-d3c0-46a4-afd4-907be497ee1e`), and "Contact" is linked in desktop nav, mobile nav, and footer Resources list in `Base.astro`
- [ ] `CLAUDE.md` (this file) — update "Rating logic" and "Known verified facts" sections below
- [ ] `npm run build` — verify clean build

---

## Content & Comparison Rules

Apply to all data edits, new company additions, and prose revisions.

### Rating logic

Ratings are editorial scores for **niche-specific delivery suitability** — not
overall company quality.

- No company should top every dimension. Identify dimension winners:
  - **Specialist depth / methodology:** Tensorway (documented 11-step consulting methodology, rank #1 per client requirement)
  - **Enterprise scale:** Accenture (790,000+ staff), Deloitte (470,000+, largest professional services network globally)
  - **Cost/accessibility:** SoftKraft, DataRoot Labs (11-50 staff, startup-priced)
- Ratings must have ≥ 0.8 spread across the list (e.g. 4.8 down to 3.9)
- The top specialist boutique holds rank #1 (4.7–4.9 range)
- Large generalists score 0.5–1.0 lower than boutiques on specialist dimensions
- **Watch for name-recognition bias toward heavily-marketed companies.** Some
  companies publish enough SEO/content-marketing material that they get
  pulled toward a top-2 rank by default, independent of the niche or the
  rest of the roster. Confirmed 2026-07-12 (on an earlier ML-niche site
  cohort): one such company landed at rank #2 on two unrelated r2d2 sites
  while sitting at rank ~11-14 on four others built with the same process —
  the #2 placements had no extra verified differentiation to justify the
  gap. Before ranking any company in the top 3, check the rating is earned
  by this niche's rating dimensions against this site's own roster — not by
  how much marketing copy exists relative to competitors. This applies
  regardless of niche; do not assume it only affects a specific prior client
  or industry.

### Field-writing rules

- **User-supplied company data always wins over independent research for the
  fields it covers.** If the user gave facts for a company directly (a
  client's own data, a batch-plan doc, pasted research), use those facts
  as-is — do not independently re-research and silently overwrite them, even
  if a fresh search turns up something that looks more current. This applies
  every time that company recurs across a batch of sites: the supplied facts
  must stay identical everywhere it appears (see "Facts consistency across a
  batch" below) — only prose fields (`tagline`, `description`, `bestFor`,
  etc.) get independently rewritten per site. Any company or field the user
  didn't supply data for still gets full independent research; this rule
  narrows Phase 2's scope, it doesn't replace it.
- **`bestFor` must be a short comma-separated phrase (~5-10 words), never a
  full sentence.** It's the most reused field in the template — homepage
  quick-answer box, homepage ranked table, company profile "Short answer"
  line, and spliced into prose on comparison/alternatives pages. Confirmed
  2026-08-11: 26 live sites had let it balloon to 12-21 word full sentences
  ("Enterprises, especially in financial services, needing AI delivery at
  scale with strong cloud-native ML platform engineering."), which reads
  fine alone but turns the homepage quick-answer box into a wall of text
  once every row has one. Target style: "Financial-services enterprises,
  cloud-native AI at scale."
- **Never end `bestFor`, `primaryDifferentiator`, `tagline`, or any `cons`
  entry with a period.** They get spliced into template sentences that add
  their own trailing "." — a field already ending in "." produces ".." or
  "....". See gotcha 22 below for the template-side defense; write clean
  data regardless of it. `description` and `useCases` items are full
  sentences and should keep their periods as normal.
- **If a company also appears on a sibling r2d2 site, its prose must be
  independently written — every time, even mid-batch.** Facts (founded
  year, HQ, team size) should stay consistent; `tagline`, `description`,
  `bestFor`, `primaryDifferentiator`, `pros`, `cons`, `useCases` must not
  be near-duplicate phrasing. Confirmed 2026-08-12: a 10-site batch
  featuring the same company had 6 of 10 sites open `description` with a
  near-identical sentence despite this rule already existing in that
  batch's own planning doc. Before writing, check what siblings already
  say: `grep -A2 'slug: "COMPANY-SLUG"' ~/github/r2d2/*/src/data/companies.ts`.

### Factual accuracy rules

- Verify founding year, HQ, employee count from a primary source before adding
- Unverifiable marketing claims must be tagged: `(per company website; independently unverifiable)`
- Acquisitions and ownership changes must appear in `description` and `cons`
- Confirm cloud/tech partnership tiers from official partner directories only

### Known verified facts (update for your companies)

> Replace this section with verified facts for the companies you add.
> Keep only facts you confirmed from a primary source (company website,
> Crunchbase, LinkedIn, official partner directory).

```
Tensorway: founded 2019, HQ Alicante, Spain, 20-50 employees, GDPR/HIPAA/ISO 9001/ISO 27001
QuantumBlack (McKinsey): founded 2009, HQ London, United Kingdom, 1,001-5,000 employees
BCG X: founded 2014, HQ Boston, United States, 3,000+ employees
IBM Consulting: founded 1991, HQ Armonk, United States, 160,000 employees
Cognizant: founded 1994, HQ Teaneck, United States, 349,800 employees
Capgemini Invent: founded 2018, HQ Paris, France, 17,000+ employees
Deloitte: founded 1845, HQ London, United Kingdom, 470,000 employees
PwC: founded 1998, HQ London, United Kingdom, 370,000 employees
KPMG: founded 1987, HQ London, United Kingdom, 251,000-275,000 employees
EPAM Systems: founded 1993, HQ Newtown, United States, 62,000+ employees, NYSE:EPAM
Accenture: founded 1989, HQ Dublin, Ireland, 790,000+ employees
Infosys: founded 1981, HQ Bengaluru, India, 330,000+ employees
Grid Dynamics: founded 2006, HQ San Ramon, United States, 4,800+ employees, Nasdaq:GDYN
Andersen: founded 2007, HQ Warsaw, Poland, 3,500+ employees
ITRex Group: founded 2009, HQ Santa Monica, United States, 201-250 employees
Sigma Software Group: founded 2002, HQ Stockholm, Sweden, 1,001-5,000 employees
Exadel: founded 1998, HQ Walnut Creek, United States, 1,001-5,000 employees
N-iX: founded 2002, HQ Valletta, Malta, 2,400+ employees
Innowise Group: founded 2007, HQ Warsaw, Poland, 2,100-3,500 employees
Coherent Solutions: founded 1995, HQ Minneapolis, United States, 2,200 employees
Valiance Solutions: founded 2018, HQ Noida, India, 51-200 employees
HYS Enterprise: founded 2007, HQ Amsterdam, Netherlands, 213 employees
Belitsoft: founded 2004, HQ Warsaw, Poland, 250-400 employees
DataRoot Labs: founded 2016, HQ Kyiv, Ukraine, 11-50 employees
InData Labs: founded 2014, HQ Limassol, Cyprus, 51-200 employees
SoftKraft: founded 2015, HQ Bielsko-Biala, Poland, 11-50 employees
Softermii: founded 2014, HQ Los Angeles, United States, 51-120 employees
Simform: founded 2010, HQ Orlando, United States, 1,400+ employees
10Pearls: founded 2004, HQ Vienna, United States, 1,800-1,950 employees
DataArt: founded 1997, HQ New York, United States, 5,700+ employees
Intellectsoft: founded 2007, HQ New York, United States, 150-300 employees
10Clouds: founded 2009, HQ Warsaw, Poland, 51-200 employees
```

### Comparison page logic

The `hasCap()` function in `comparisons/[slug].astro` drives all capability
✓/✗ tables. It reads from `badges` and `engagementModels` only. Never add a ✓
claim that isn't backed by actual data. Update the `hasCap()` function keys and
the `allTech` array to match your niche's capabilities and tools.

---

## When Adding a New Company

- [ ] Verify founding year from a primary source
- [ ] Verify HQ from a primary source; note if legal HQ differs from delivery centre
- [ ] Verify employee count from LinkedIn or Crunchbase
- [ ] Check for acquisitions or ownership changes — disclose in `description` + `cons`
- [ ] Confirm cloud/tech partnership tiers from official partner directories
- [ ] Set `rating` using the dimension logic above
- [ ] Ensure no company tops all dimensions
- [ ] Confirm `badges` only contain services the company actually delivers
- [ ] Badges must match keys in `SERVICE_LABELS` in `src/lib/companies.ts`
- [ ] Run `npm run build` and verify page count increases correctly

---

## Known Gotchas (same across all sites cloned from this template)

1. **`brand` color must match in two places.** `tailwind.config.mjs` `brand.600`
   and `BRANDING.primaryColor` in `src/config.ts` must be the same hex value.

2. **All internal `href` values must end with `/`.** `trailingSlash: 'always'`
   in `astro.config.mjs` enforces this. Any link missing the trailing slash
   triggers a redirect warning in the build log.

3. **`SERVICE_LABELS` keys must match `badges` values exactly.** Every string
   in every company's `badges` array must have a matching key in `SERVICE_LABELS`
   in `src/lib/companies.ts`. Missing keys produce raw slugs on company cards.

4. **`StarRating` only accepts `rating: number`.** No other props.

5. **Comparison page slug format is `slug1-vs-slug2`.** `getComparisons()`
   returns this format. The dynamic route is `/comparisons/[slug].astro`.

6. **`hasCap()` keys in `comparisons/[slug].astro` must exactly match the
   capability labels in the JSX capability table.** If you rename one, rename both.

7. **`npm install` may fail with cache permission error.** Fix:
   `npm install --cache /tmp/npm-cache`. This bypasses the EACCES error on the
   default npm cache directory without requiring sudo.

8. **Cloudflare Pages uses `public/_headers` and `public/_redirects`**,
   not `vercel.json`. Do not add a `vercel.json` — it will be ignored.

9. **`astro.config.mjs` redirects go in `redirects:`.** Do not define the
   same path in both a `.astro` file and as a redirect.

10. **Cloudflare Pages project MUST be created from the dashboard, not the API.**
    Creating a project via the Cloudflare API (POST `/accounts/{id}/pages/projects`)
    produces a "Direct Upload" project. Direct Upload projects cannot have a GitHub
    repo connected — neither via the API (`PATCH` with `source:` returns error
    `8000069`) nor via the dashboard. If you hit "A project with this name already
    exists", the existing project is likely a Direct Upload project. Fix:
    1. Delete it via API: `DELETE /accounts/{id}/pages/projects/{name}`
    2. Recreate from the Cloudflare dashboard: **Pages → Create a project →
       Connect to Git** → select the GitHub repo → set build command `npm run build`,
       output dir `dist`.
    Always use "Connect to Git" from the start. Never create Pages projects via the
    API for git-backed deployments.

11. **`git init` creates `master` branch by default on macOS.** Rename it to `main`
    immediately: `git branch -m master main`. Do this before the first commit so
    all history is on `main` from the start. Cloudflare Pages and GitHub both
    expect `main`.

12. **`public/favicon.svg` must be replaced per site — AND its color must be unique across all r2d2 sites.** The template ships a placeholder favicon. Replace it with a niche-appropriate icon using the site's `BRANDING.primaryColor`. `Base.astro` already contains `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` — no other changes needed in the layout. Before picking a color, read `~/github/r2d2/PALETTE_REGISTRY.md` and choose a row not already claimed by a sibling site — at 16px favicon size, two sites with the same brand color are visually indistinguishable regardless of internal icon shape. This is the one deliberate exception to "never check sibling sites" (see `create-reviewer-site.md`). Update the registry with the new domain once you've picked. Confirmed 2026-07-12: two color collisions (Sky used by 2 sites, Emerald used by 2 sites) shipped before this registry existed.

13. **No table on the homepage may be all-dashes.** A table where every data cell
    shows "–" means a mismatch between the column keywords and the actual data.
    After populating `companies.ts`, run `npm run build` and visually check every
    matrix/capability table. The engagement models table auto-generates its columns
    from `engagementModels` values in the data — it is safe. Any other matrix table
    that checks for keywords must be verified: the keywords must be substrings of the
    actual data values. Fix by updating the keyword list to match your niche's
    terminology.

14. **`navCompanies` in `Base.astro` must pin ALL featured companies, not just
    the first.** The "Companies" nav dropdown is built from a `navCompanies`
    array that used to do `companies.find(c => c.featured)` (grabs only the
    first featured company) then `.filter(c => !c.featured)` for the rest
    (excludes every featured company, not just the one pinned). Since the
    data spec marks the top 3-4 companies `featured: true`, this silently
    dropped companies ranked #2-4 from the dropdown — while those same
    companies still appeared correctly in comparisons, the ranked table, and
    the footer, making the bug easy to miss on a casual scan. Fixed
    (2026-07-12) to `companies.filter(c => c.featured).sort((a,b) =>
    b.rating - a.rating)` for the pinned block. If you ever hand-edit
    `Base.astro`, keep this pattern — do not reintroduce a `.find()` for the
    pinned company. Verify with the dropdown-completeness check in
    `create-reviewer-site.md` Phase 5.

15. **Every site needs a `src/pages/contact.astro` (Web3Forms) — this template
    was missing the step until 2026-07-12.** A separate fork of this skill
    (`~/PycharmProjects/AI_Agents_Development_reviewer/site-cloner/`) already
    had a Phase 4j for this and was used to build bestwebsearchapis.com and
    best-ai-agent-developers.com, but the fix was never merged into the
    version actually wired up for r2d2 sites, so all 10 live r2d2 sites
    launched without a contact page. Fixed by porting that phase into
    `create-reviewer-site.md` (now Phase 4j) and adding the page + nav/footer
    links to all 10 sites and this template. The Web3Forms access key
    (`032a901f-d3c0-46a4-afd4-907be497ee1e`) is shared/reusable across every
    site — it is not a per-site secret. When forking or borrowing steps from
    a sibling copy of this skill in the future, diff it against this file
    instead of assuming this file is already current.

16. **Every page `<title>` must be strictly under 70 characters.** `Base.astro`
    computes `title | SITE.name` and drops the ` | SITE.name` suffix instead
    of overflowing if the combined string would hit 70+ characters
    (`titleWithSite.length >= 70 ? title : titleWithSite`). Company profile
    titles (`src/pages/companies/[slug].astro`) are `${company.name} review
    ${year}` — do not append a niche-label clause like `: ${NICHE.label}` to
    it; before this was fixed (2026-07-12) that alone produced a 100+
    character title for a large-name company on an earlier ML-niche site
    (company name + ": Machine Learning Development | Best Machine Learning
    Development Services Companies"). Verify with
    `grep -roE "<title>.{70,}</title>" dist/` after every build — must return
    zero results. Comparison-page titles
    (`${c1.name} vs ${c2.name} (${year}): ${NICHE.label} comparison`) can
    exceed 70 characters on their own with two long company names, with
    nothing left for the Base.astro safety net to drop (there's no suffix
    left to trim — the raw title is already over budget). Fixed 2026-08-10
    (initially on the AI-agent-niche sites, backported to this template
    2026-08-12 after being missed here despite being documented as resolved
    below): `comparisons/[slug].astro` computes an HTML-entity-aware
    `renderedLength()` (raw `.length` isn't enough — a company name like
    "Work & Co" renders longer once `&` becomes `&amp;`) and falls back to a
    `shortTitle` (drops the trailing `: ${NICHE.label} comparison` clause)
    whenever the full title would hit 70+ rendered characters. If you edit
    the comparison title template, keep this fallback.

17. **Homepage `<title>` and `<h1>` must be Title Case, not sentence case.**
    `NICHE.providersLabel` in `src/config.ts` is stored lowercase (e.g.
    `'agencies'`, `'companies'`) on purpose — it reads correctly mid-sentence
    elsewhere on the homepage ("36 agencies reviewed", "Compare all
    agencies"). But `src/pages/index.astro`'s `<title>` and `<h1>` used it
    verbatim too, which shipped e.g. "Best Machine Learning agencies in
    2026" (lowercase "agencies") instead of "...Agencies..." on 8 of the 10
    live r2d2 sites before this was fixed (2026-07-12). Fixed with a
    `titleCase()` helper in `index.astro`'s frontmatter, applied only at the
    `<title>`/`<h1>` call sites (`providersLabelTC`) — never capitalize
    `NICHE.providersLabel` itself in config, that would break every
    lowercase mid-sentence usage. If you hardcode the homepage headline
    instead of using `{NICHE.providersLabel}` (e.g.
    `best-ml-development-companies-europe` and
    `top-ml-development-services-europe` both hardcode "Companies"), just
    write it already capitalized — there's nothing to title-case
    programmatically in that path.

18. **Never show a hardcoded "Updated/Last reviewed [Month Year]" anywhere on
    the site — not in `<meta name="description">`, and not as a visible
    on-page element either.** This is an `output: 'static'` Astro build with
    no per-request logic; whatever `SITE.lastReviewed` was set to at the last
    deploy stays frozen indefinitely, and these sites are not rebuilt
    monthly. A stale on-page "Updated [Month Year]" badge reads as
    suspicious/dead to both humans and LLMs evaluating freshness within
    weeks of launch — worse than not showing a date at all. An earlier
    version of this rule (through 2026-08-09) only warned against the
    meta-description case and still kept the on-page hero badge and
    per-page "Last reviewed"/"Last updated" footers; that was wrong and got
    walked back on 2026-08-09 across all 20 affected r2d2 sites —
    `SITE.lastReviewed` was removed from `config.ts` entirely, along with
    every on-page usage (`Base.astro` footer, homepage hero badge + prose,
    `companies/[slug].astro`, `comparisons/[slug].astro`,
    `alternatives/[slug].astro`, `affiliate-disclosure.astro`). **This
    template itself still had the field and all 10 on-page usages until
    2026-08-12** — the live-site fix was never backported here, so every
    site cloned from this template in the meantime would have silently
    reintroduced the bug. Now fixed at the template level too. Do not add
    `SITE.lastReviewed` or any "Updated/Last reviewed" UI element to a new
    site, and strip it outright (don't try to compute it dynamically) if
    found on an existing one — unless the user explicitly asks for
    scheduled rebuilds to back a real dynamic date. Verify with:
    `grep -rn "lastReviewed\|Last reviewed\|Last updated" src/` and
    `grep -rlE '<meta name="description" content="[^"]*(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{4}' dist/`
    — both must return zero results.

19. **Every new site needs a visual theme pick, not just a brand color.** A
    color-only pass (just `tailwind.config.mjs` `brand.*`) leaves every site
    with the same Inter font, same `slate` neutral, same `bg-white`, same
    radius/shadow — confirmed 2026-07-12 that this reads as one templated
    group regardless of accent hue, and even a font/radius/neutral-only pass
    on top of that was judged too subtle. Read
    `~/github/r2d2/THEME_REGISTRY.md` in Phase 1 (Step 7) and roll one of
    its 3 Major Options (plain light / light + bold hero / full dark) plus,
    if dark, its two sub-axes (Depth: Deep or Soft; Base hue: Neutral gray
    or Tinted with the site's own brand color). Apply mechanically per the
    registry's "How to apply a row" — it is not a fresh design exploration
    per site. Update the registry's "Used by" column in Phase 4c-2, same as
    the palette registry.

20. **Company-profile "Service area" and "Use case" tables must never pair a
    real per-row value with a second column that repeats a static slice of
    other data.** Before 2026-08-11, `companies/[slug].astro` rendered the
    "Service area" table by mapping over `company.useCases` (one row per use
    case — fine) but the second column was hardcoded to
    `Available for {company.industries.join(', ')} clients` for every row —
    identical text on every row, since it didn't depend on the row index.
    The "Use case" table had the same bug in two columns:
    `company.industries.slice(0, 2).join(', ')` and
    `company.techStack.slice(0, 2).join(', ')`, both static per row. Fixed:
    "Service area" now iterates `company.badges` mapped through
    `SERVICE_LABELS` as a single column (short labels like "Product Design",
    "Web Development"); "Use case" now shows only the real per-item
    `useCases` text, no second/third column. If you add a column to either
    table, make sure its value actually varies by row — or don't add it.

21. **Free-text fields spliced into a sentence must go through
    `stripTrailingPeriods`/`lowerFirstSentence`, not be interpolated raw.**
    `bestFor`, `primaryDifferentiator`, `tagline`, and `cons[0]` often
    already end in a period in the data, but several templates spliced them
    directly into a sentence and appended another literal "." (or "..." for
    the 8-word-truncated preview in some tables), producing ".." or "....".
    Fixed 2026-08-12 across all 26 sites: `index.astro`,
    `companies/[slug].astro`, `comparisons/[slug].astro`, and
    `alternatives/[slug].astro` each define `stripTrailingPeriods(s)` (drop
    trailing periods before a raw splice), `lowerFirstSentence(s)` (same,
    plus lowercase the first word — but only if it's not an acronym like
    "SaaS"/"EU"/"CTOs", via the same regex the homepage quick-answer box
    already used), and `truncateWords(s, n)` (word-count truncation that
    only appends "..." if truncation actually happened, otherwise a single
    "."). Use these helpers for any new interpolation of these fields —
    never write `{company.bestFor}.` or
    `{x.charAt(0).toLowerCase() + x.slice(1)}.` directly. Verify with:
    `grep -rEo '[A-Za-z](\.\.|\.{4,})[^.]' dist/**/*.html | grep -v '\.\.\.[^.]'`
    — must return zero results.

22. **`bestFor` must appear verbatim in at most one place per comparison
    page — the Quick Verdict.** Before 2026-08-12, `comparisons/[slug].astro`
    also restated the exact same `bestFor` text in the head-to-head table's
    "Best for" row, "Who should choose" section, Verdict section, and FAQ —
    5 places total, meaning a reader could Cmd+F a phrase from the Quick
    Verdict and find it highlighted 5-6 times on one page. Fixed: the table
    row now shows `primaryDifferentiator` instead; "Who should choose" and
    the Verdict's runner-up line draw from `useCases[0]`/`useCases[1]`; the
    FAQ "Is X better than Y" draws from `pros[0]`. If you add new prose to
    this page that needs a one-line "why this company" blurb, reach for
    `useCases`/`pros`/`primaryDifferentiator` before restating `bestFor` —
    it's already used once, at the top of the page.

23. **Company-profile "Use cases" section reads as generic filler — removed
    from the template entirely.** The nav tab (`{ label: 'Use cases', href:
    '#use-cases' }`) and the `<section id="use-cases">` block on
    `companies/[slug].astro` rendered a "Short answer: X is best suited for
    ..." line plus a table of `company.useCases` items. Across all 16 live
    sites built from this template the user flagged it as looking out of
    place and not adding real information beyond what "Best for" already
    says elsewhere on the page. Removed 2026-08-12/13 (template and all 16
    live sites) — the nav tab entry and the whole section, along with the
    now-dead `lowerFirstSentence()` helper that only that section used. The
    `useCases` field itself stays in the `Company` type and in
    `comparisons/[slug].astro` (Use case fit table) — only the per-company
    profile page display was removed. Do not re-add this section to a new
    site unless the user explicitly asks for it.

24. **Facts for a company reused across a batch of sibling sites can drift
    out of sync — check facts, not just prose, when a "known verified
    facts" / batch-plan doc exists.** Gotcha 22 (in "Content & Comparison
    Rules" → "If a company also appears on a sibling r2d2 site...") already
    requires diffing `tagline`/`description`/etc. for near-duplicate
    *prose*. That check does not catch a company's core *facts* (founded
    year, HQ, team size) silently diverging between sites even when a batch
    plan explicitly fixed them. Confirmed 2026-08-13: across a 10-site
    Tensorway batch with a plan doc fixing founded=2019/HQ=Alicante,
    Spain/team=50-249, 4 of the 10 sites instead had founded=2021, an
    invented "spin-out of software firm Anadea" narrative, HQ="Remote
    (EU-based)", and team="11-50" — a wholesale wrong-facts narrative, not a
    prose-phrasing issue, that survived because nothing diffed the
    structured fields. Additionally, several sites used awkward "AI-agent
    unit"/"boutique" wording for a company the user considers an independent
    company, not the described-as-spun-out narrative. When a batch plan doc
    fixes a company's facts, verify every site's `founded`/`hq`/`teamSize`
    against the plan **and** against sibling sites — a passing prose-diff
    does not imply the facts are right:
    ```bash
    grep -A3 'slug: "COMPANY-SLUG"' ~/github/r2d2/*/src/data/companies.ts \
      | grep -E "founded:|hq:|teamSize:"
    ```
    All values for the same real company must match (or have a documented,
    deliberate reason not to) across every site that features it.

25. **Homepage quick-answer box needs hand-curated criteria once real
    company data exists — the mechanical `bestFor`-derivation is a
    structural stopgap, not the finished feature.** The "Which X is best?"
    box (`featuredProfiles.slice(0, 6).map(...)`) derives each row's label
    from `company.bestFor` via a `bestForShort()` helper that takes only the
    text before the first comma. That helper (added 2026-08-12) fixes the
    "Best for X, not Y:" run-on-sentence problem (see the `bestFor`-length
    rule above), but it does **not** prevent two different companies from
    both truncating to the same word — confirmed 2026-08-13 across the same
    16-site batch: multiple sites showed "Best for fintech:", "Best for
    SaaS/fintech teams:", and "Best for fintech:" again as three of the six
    rows, because two or three companies in the roster happened to lead
    their `bestFor` with the same term. Fix applied per-site: replace the
    mechanical derivation with a hand-curated array once the real top-rated
    companies are known:
    ```typescript
    // Hand-curated, non-overlapping "Best for X" categories — top-rated
    // company is always "overall"; the other 5 must be genuinely distinct
    // real differentiators (industry, engagement model, geography, team
    // size/cost, etc.), not near-synonyms of each other.
    const quickAnswerPicks: { slug: string; label: string }[] = [
      { slug: "top-rated-company-slug", label: "overall" },
      { slug: "other-slug", label: "regulated financial services" },
      // ... 4 more, each covering a different real angle
    ];
    ```
    and render it in place of `featuredProfiles.slice(0, 6)`, resolving
    `pick.slug` against `companies` and rendering `Best {pick.label ===
    'overall' ? 'overall' : `for ${pick.label}`}:`. Do this in Phase 4f,
    after Phase 2 research is done and ratings are settled — this cannot be
    done earlier because you need to know the real roster to spot
    collisions. See `create-reviewer-site.md` Phase 4f for the full pattern.

26. **Homepage "SEO PROSE" sections must be independently rewritten per
    site — the placeholder text reads as finished copy, which is exactly
    why it keeps shipping unedited.** `index.astro` ships 3 such blocks
    (`SEO PROSE 1/2/3` — "What makes a good provider", "[Niche] in [year]:
    what buyers should know", "How this list was compiled"; 3 paragraphs
    each). Unlike an obviously-fake `[PLACEHOLDER TEXT]` stub, this
    placeholder is coherent, plausible, niche-agnostic advice ("Technical
    depth is a reliable proxy for expertise...") that reads as already-done
    work on a skim. Confirmed 2026-08-13: across a 16-site batch, all 9
    paragraphs were byte-identical on every site except for the `NICHE.label`
    token — the earlier "prose uniqueness" fix (gotcha 22 in Content Rules)
    only covered per-*company* fields, not this per-*site* editorial copy,
    so it fell through a gap in the existing rule and shipped unedited
    despite the batch's own planning doc requiring unique prose. Fixed by
    rewriting all 9 paragraphs per site around that site's actual
    positioning angle (e.g. procurement/RFP framing, EU/GDPR framing,
    boutique-agency framing, ranked-listicle framing — whatever the site's
    actual differentiation is). The TODO comments above each block now say
    "MUST REWRITE" explicitly for this reason. Verify before shipping a new
    site:
    ```bash
    # Any hit means this site still has template stock text
    grep -c "Technical depth is a reliable proxy for expertise\|Projects cost more than most initial estimates\|All company data was sourced from each company" src/pages/index.astro
    # Must be 0
    ```
    And when a company/niche batch spans multiple sites, additionally diff
    each site's SEO PROSE against its siblings the same way gotcha 22
    requires for company prose — near-identical paragraphs across sites are
    the same bug even if no single site's grep above catches it alone.

27. **Company-profile "What is X?" Overview section had two paragraphs both
    stating founded year and HQ.** Paragraph 1 is `company.description`
    (free text) — virtually every company's description opens with "Company
    X was founded in Y and is headquartered in Z" as its connective tissue.
    Paragraph 2 used to *also* template that exact fact
    (`{company.name} was founded in {company.founded} and is headquartered
    in {company.hq}. The firm employs {company.teamSize}...`), producing a
    visible duplicate sentence on every company profile page on every site
    (confirmed 2026-08-13 across all 16 live sites plus this template).
    Fixed: paragraph 2 now only states `industries` and
    `primaryDifferentiator` — the two structured facts that aren't already
    covered by the free-text description. Founded year and HQ are still
    shown once, in the page header meta line (`Founded {founded} | {hq} |
    {teamSize} employees`) — do not restate them a third time anywhere else
    on the page.

28. **Company-profile FAQ's "What is X?" answer duplicated the entire
    Overview description.** The FAQ section's first Q&A reused
    `company.description` verbatim as its answer — the identical paragraph
    already shown at the top of the same page. Fixed 2026-08-13 (template
    and all 16 live sites): the answer is now `company.tagline` instead — a
    separately-written, concise positioning statement that doesn't repeat
    the Overview paragraph. Do not "fix" this by stitching
    founded/hq/teamSize into a fresh sentence there instead: several
    companies' `tagline` values already restate HQ and/or team size
    themselves (e.g. a tagline reading "Warsaw-headquartered firm with
    3,700+ experts..."), so a template sentence like `"{name} was founded in
    {founded} and is headquartered in {hq}... {tagline}"` can self-duplicate
    within the single answer. `tagline` alone is the safe choice — it's the
    one field guaranteed not to already contain the Overview's facts in the
    same words.

29. **All hand-written prose (homepage + company data) needs a
    `humanizer` pass — it is not a suggestion, it is
    now a required step, but load the skill once per build, not once per
    phase.** Every prior gotcha in this file that deals with prose (22, 26
    especially) was caught after the fact, by reading a shipped site and
    noticing it read as templated. The `humanizer` skill catches
    most of the same class of issue (em dashes, banned marketing words,
    rule-of-three list templates, aphoristic closers, FAQ-restates-the-table
    redundancy) mechanically, before a site ships, instead of during a
    later cleanup pass. Added 2026-08-21 after using the skill ad hoc on
    top-embedded-software-companies.com's homepage and finding real
    instances of most of the above in text that had already been through
    the individual per-site "independently rewrite" rules (gotcha 26) —
    those rules ensure prose is *unique per site*, not that it's *free of
    AI-writing tells*. The two checks are complementary, not redundant; run
    both. **Token-cost correction, same day:** the checklist only needs to
    be loaded into context once (`Skill` tool, Phase 0d) — a skill
    invocation re-loads its full text, so the original wiring (invoke once
    in Phase 2, invoke again in Phase 4f) was spending tokens reloading
    unchanged content. Phase 2 and Phase 4f now apply the checklist from
    memory instead of re-invoking. See `site-cloner/humanizer.md`
    for the full checklist (including the current banned-word list) and
    `create-reviewer-site.md` Phase 0d / Phase 2 / Phase 4f / Phase 5 for
    exactly where the single load happens and how to grep-verify
    afterward.

30. **`minimumEngagement` sentence splices only checked for the literal
    string `'Not disclosed'`, so any other "unknown" phrasing rendered
    raw — e.g. "Minimum engagement starts at Not published."** A company
    entry can legitimately use a different sentinel string for "no public
    figure" (a batch plan doc might say "not published in the source"
    rather than the template's own default "Not disclosed"), and every
    template that spliced `minimumEngagement` into a sentence
    (`companies/[slug].astro` pricing section + FAQ, `alternatives/[slug].astro`
    budget-fit row + FAQ, `comparisons/[slug].astro` Quick Verdict cards +
    pricing FAQ + decision-matrix rows) only guarded against the one exact
    string. Two of those splice points (`alternatives/[slug].astro`'s
    budget-fit table row, `comparisons/[slug].astro`'s Quick Verdict cards
    and pricing-FAQ sentence) had **no guard at all** and rendered the raw
    value unconditionally. Confirmed 2026-08-21: found via a live screenshot
    of a company profile page reading "Minimum engagement starts at Not
    published" — the company's data used "Not published" instead of "Not
    disclosed". Fixed by adding `isUndisclosedMinimum(value)` to
    `src/lib/companies.ts` (checks membership in a `Set` of known "no
    figure" sentinel strings, currently `'Not disclosed'` and `'Not
    published'`) and importing/using it at every sentence-splice site
    instead of a direct string comparison. Table-cell/label contexts
    (`index.astro`'s pricing table, `alternatives/[slug].astro`'s
    comparison table, `comparisons/[slug].astro`'s spec-table rows) were
    left rendering the raw value — "Not disclosed" reads fine as a table
    cell, the bug is specific to grammatical sentences built around the
    value. If you add a new "no figure" phrasing to any company's data in
    the future, add it to `UNDISCLOSED_MINIMUMS` in `src/lib/companies.ts`
    rather than special-casing it at the call site. **Explicitly not
    fixed by inventing a placeholder number** (e.g. defaulting to "$10K")
    — several sites' own homepage FAQ/prose states outright that no
    company on that list publishes a minimum, so a fabricated figure would
    contradict the page's own copy and misrepresent real companies; fixing
    the display to degrade gracefully was the deliberate choice, confirmed
    with the user rather than assumed.

31. **Extending the `humanizer` banned-word list does not
    retroactively fix content already written under the old version of the
    list — that requires an explicit re-sweep, which was skipped once
    already.** Confirmed 2026-08-22: on 2026-08-21, "roster," "sits at,"
    "shop" (meaning company), and "shortcut" were added to the banned-word
    list *immediately after* using the skill to rewrite
    top-embedded-software-companies.com's homepage — but that same homepage
    was never re-checked against the newly added terms. All four survived
    untouched in prose written minutes earlier in the same session, and
    shipped to production, until the user found "sits at" via a live
    screenshot the next day. Root cause was two compounding gaps, both
    fixed the same day:
    - No step existed telling the model to re-sweep already-touched content
      immediately after editing the banned-word list itself. Fixed: added
      to `site-cloner/humanizer.md`'s "Updating this checklist"
      section — extending the list now explicitly requires grepping every
      file the current session already ran the humanizer pass on for the
      new term(s), before considering the list update done.
    - The Phase 5 mechanical grep backstop (`create-reviewer-site.md`) was
      a hand-copied *partial* subset of the banned-word list (13 of ~24
      terms at the time) — even a routine Phase 5 check on this file
      wouldn't have caught it, since 3 of the 4 newly-added terms
      ("shortcut," "roster," and the "shop" false-positive carve-out) were
      missing from that grep entirely. Fixed: the Phase 5 grep now covers
      the full greppable subset of section 2, with an explicit comment that
      it must stay in sync with `humanizer.md`.
    Neither fix retroactively sweeps sites from *before* this skill existed
    or from prior sessions — a portfolio-wide sweep is a separate,
    larger-blast-radius action that needs the user's explicit go-ahead
    (same reasoning as gotcha 30's "confirm before wide action" rather than
    silently expanding scope).

---

## Build Commands

```bash
npm install                    # first time / after adding dependencies
npm run dev                    # local dev server → http://localhost:4321
npm run build                  # production build → dist/
npm run preview                # preview dist/ locally
npm install --cache /tmp/npm-cache   # workaround if npm cache has permission errors
```

---

## Current Status

**Live site — AI Consulting niche, 32 companies.** Tensorway pinned at rank
#1 (client requirement, rating 4.8 — uniquely highest, QuantumBlack/McKinsey
4.6 next). Theme: Option 3 Zinc Noir (row 7 — zinc neutral, Deep depth,
Neutral base hue, no display font this pass, radius unchanged). Brand color
Emerald (`#059669`, row 6).

Data layer: TypeScript (`src/data/companies.ts`), 32 companies, 4 featured
(Tensorway, QuantumBlack, BCG X, IBM Consulting).
