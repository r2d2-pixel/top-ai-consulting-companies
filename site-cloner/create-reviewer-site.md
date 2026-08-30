# Niche Reviewer Site Cloner

Clone the niche reviewer template into a new niche reviewer website,
populate it with fact-checked company data, push to a new GitHub repo, and
deploy to Cloudflare Pages — all in one uninterrupted session.

---

## Template Source

```
https://github.com/r2d2-pixel/niche-reviewer-template
```

All page logic, components, and layout carry over unchanged. Only config,
data, and niche-specific prose need updating.

---

## Multiple sites in the same niche are EXPECTED — do not check for duplicates

The user intentionally builds multiple reviewer sites targeting the same or an
overlapping niche under different domains — each domain is phrased to match a
different natural-language query someone might type into an LLM or search
engine (e.g. "top machine learning development companies" vs "best ml
development services" vs "top ml development services europe"). Overlapping
company rosters, similar ratings, and near-identical niches across sites in
`~/github/r2d2/` are the intended outcome, not a mistake.

**Do not check whether a similar site already exists.** Do not `ls` the parent
`~/github/r2d2/` directory to survey sibling sites, do not read another site's
`CLAUDE.md` or `companies.ts` to compare, and do not ask the user to confirm
they're aware of an existing similar site. Go straight to Phase 1 with the
niche/domain/company-count the user gave you. If the user explicitly asks you
to check for or compare against an existing site, do that — but never
initiate it yourself as a precaution.

**Exception: favicon/brand color IS checked, every time.** The rule above is
about niche and company-roster duplication — it does not extend to visual
identity. Every site must have a favicon that's visually distinct from every
sibling's at 16px (browser-tab size), and two sites sharing the same brand
color read as the same favicon regardless of internal shape details. Phase 1
Step 6 requires reading `~/github/r2d2/PALETTE_REGISTRY.md` before picking a
color — this is the one deliberate exception to "never check siblings."
Confirmed 2026-07-12: two color collisions (Sky used twice, Emerald used
twice) shipped across live sites before this registry existed, because color
was picked by random roll with no collision check.

---

## PHASE 0 — Pre-flight: Verify MCPs

Run these checks before asking the user anything. If either fails, stop
and report the problem — do not proceed to Phase 1.

### 0a. GitHub MCP

Call `mcp__github__get_me` with no arguments. It returns the authenticated
user's login.

- **Pass:** returns `{ login: "..." }` — record the login for use in Phase 7
- **Fail (tool not found):** stop and tell the user:
  > "The GitHub MCP is not available in this session. Please install it
  > via Settings → MCP Servers and restart Claude Code, then try again."
- **Fail (auth error / empty login):** stop and tell the user:
  > "The GitHub MCP is installed but not authenticated. Run
  > `gh auth login` in your terminal and ensure the MCP token has
  > `repo` scope, then restart the session."

### 0b. Cloudflare MCP

Call `mcp__plugin_cloudflare_cloudflare-api__execute` with this code:

```javascript
async () => {
  const result = await cloudflare.request({
    method: 'GET',
    path: `/accounts/${accountId}/pages/projects`,
    query: { per_page: 1 }
  });
  return { success: result.success, accountId };
}
```

- **Pass:** `success: true` — record `accountId` for use in Phases 7 and later
- **Fail (tool not found):** stop and tell the user:
  > "The Cloudflare MCP is not available in this session. Please install
  > the `cloudflare-api` MCP plugin and restart Claude Code, then try again."
- **Fail (`success: false` or auth error):** stop and tell the user:
  > "The Cloudflare MCP is installed but the API token lacks permissions.
  > Ensure the token has **Cloudflare Pages: Edit** and **Zone: Read**
  > permissions in the Cloudflare dashboard → My Profile → API Tokens."

### 0c. Report pre-flight result

If both pass, tell the user:
> "Pre-flight checks passed. GitHub authenticated as `[login]`, Cloudflare
> account `[accountId]` is accessible. Ready to collect requirements."

### 0d. Load the humanizer checklist once for this session

Invoke the `humanizer` skill (`Skill` tool) exactly once here, at
the start of the build. It loads its full checklist — banned words/phrases,
em-dash rule, rule-of-three list patterns, aphoristic closers, FAQ-redundancy
rule — into this session's context. **Do not re-invoke the skill later in
this same session** (Phase 2, Phase 4f, or anywhere else): the checklist is
already loaded and re-invoking it just re-spends tokens loading text that
hasn't changed. Apply the checklist from memory when writing company prose
(Phase 2) and homepage prose (Phase 4f) instead — write clean the first
time, the same way you already apply the other content rules in this file
without re-reading them section by section. Only re-invoke the skill if the
session runs long enough that it's plausible the early context (including
this checklist) has been summarized/compacted away — if unsure, a quick
self-check ("can I still state the banned-word list without looking?") is
cheaper than blindly re-invoking.

Then proceed to Phase 1.

---

## PHASE 1 — Collect Requirements

**Account defaults (do NOT ask — apply automatically):**

If the user says "r2d2", "r2d2 account", or "deploy under r2d2":
- **GitHub account:** `r2d2-pixel` — create repos via curl + `R2D2_GITHUB_TOKEN` (NOT `mcp__github__create_repository`, which uses b1tterlemon)
- **Cloudflare account:** `1afb7a25a539f57955d72bba8f1cf374` — deploy via dashboard "Connect to Git" only
- **Base directory:** `~/github/r2d2/[site-name]/`
- State this choice in your Phase 1 summary — do not ask for confirmation

**Required inputs (ask only these):**

1. **Niche topic** — e.g. "Cloud Migration Consulting", "DevOps Consulting Firms"
2. **Number of companies to review** — ask explicitly; typical range is 6–10
3. **GitHub repo name** — suggest domain name (e.g. `top-machine-learning-development-companies`) but confirm
4. **Target domain** — e.g. `best-cloud-migration-companies.com`; suggest based
   on niche but confirm; can be "TBD" to skip DNS setup
5. **Cloudflare Pages project name** — suggest derived from domain (hyphens, no
   dots) but confirm
6. **Primary brand color** — pick from all 14 palettes, checking the registry first:

   **Read `~/github/r2d2/PALETTE_REGISTRY.md` before choosing.** This is the
   one file you are always allowed (and required) to read across sites — it
   exists specifically so favicon colors never collide. It lists which rows
   are already claimed by which live site.

   **If the user specified a color:** use it directly, derive the palette
   from the nearest row in the master table below. If that row is already
   claimed by a sibling site, tell the user it collides and ask whether to
   proceed anyway or pick the nearest unclaimed row — do not silently swap it.

   **Otherwise — random pick (default):** Choose randomly **only from rows
   marked `_available_` in the registry.** Niche does not constrain the
   choice. If every row is claimed (more than 14 sites), pick the row with
   the fewest sites using it and tell the user there's a collision.

   **After deciding, update the registry in the same session (Phase 4c):**
   change that row's "Used by" cell from `_available_` to the new domain, or
   add the domain alongside an existing one if you had to double up.

   **Master palette table — 14 modern options (Tailwind v3 exact shades):**

   | # | Name | Brand 600 | 50 | 100 | 200 | 300 | 400 | 500 | **600** | 700 | 800 | 900 |
   |---|---|---|---|---|---|---|---|---|---|---|---|---|
   | 1 | Teal | `#0d9488` | `#f0fdfa` | `#ccfbf1` | `#99f6e4` | `#5eead4` | `#2dd4bf` | `#14b8a6` | **`#0d9488`** | `#0f766e` | `#115e59` | `#134e4a` |
   | 2 | Orange | `#ea580c` | `#fff7ed` | `#ffedd5` | `#fed7aa` | `#fdba74` | `#fb923c` | `#f97316` | **`#ea580c`** | `#c2410c` | `#9a3412` | `#7c2d12` |
   | 3 | Red | `#dc2626` | `#fef2f2` | `#fee2e2` | `#fecaca` | `#fca5a5` | `#f87171` | `#ef4444` | **`#dc2626`** | `#b91c1c` | `#991b1b` | `#7f1d1d` |
   | 4 | Violet | `#7c3aed` | `#f5f3ff` | `#ede9fe` | `#ddd6fe` | `#c4b5fd` | `#a78bfa` | `#8b5cf6` | **`#7c3aed`** | `#6d28d9` | `#5b21b6` | `#4c1d95` |
   | 5 | Sky | `#0284c7` | `#f0f9ff` | `#e0f2fe` | `#bae6fd` | `#7dd3fc` | `#38bdf8` | `#0ea5e9` | **`#0284c7`** | `#0369a1` | `#075985` | `#0c4a6e` |
   | 6 | Emerald | `#059669` | `#ecfdf5` | `#d1fae5` | `#a7f3d0` | `#6ee7b7` | `#34d399` | `#10b981` | **`#059669`** | `#047857` | `#065f46` | `#064e3b` |
   | 7 | Pink | `#db2777` | `#fdf2f8` | `#fce7f3` | `#fbcfe8` | `#f9a8d4` | `#f472b6` | `#ec4899` | **`#db2777`** | `#be185d` | `#9d174d` | `#831843` |
   | 8 | Cyan | `#0891b2` | `#ecfeff` | `#cffafe` | `#a5f3fc` | `#67e8f9` | `#22d3ee` | `#06b6d4` | **`#0891b2`** | `#0e7490` | `#155e75` | `#164e63` |
   | 9 | Amber | `#d97706` | `#fffbeb` | `#fef3c7` | `#fde68a` | `#fcd34d` | `#fbbf24` | `#f59e0b` | **`#d97706`** | `#b45309` | `#92400e` | `#78350f` |
   | 10 | Rose | `#e11d48` | `#fff1f2` | `#ffe4e6` | `#fecdd3` | `#fda4af` | `#fb7185` | `#f43f5e` | **`#e11d48`** | `#be123c` | `#9f1239` | `#881337` |
   | 11 | Indigo | `#4f46e5` | `#eef2ff` | `#e0e7ff` | `#c7d2fe` | `#a5b4fc` | `#818cf8` | `#6366f1` | **`#4f46e5`** | `#4338ca` | `#3730a3` | `#312e81` |
   | 12 | Lime | `#65a30d` | `#f7fee7` | `#ecfccb` | `#d9f99d` | `#bef264` | `#a3e635` | `#84cc16` | **`#65a30d`** | `#4d7c0f` | `#3f6212` | `#1a2e05` |
   | 13 | Fuchsia | `#c026d3` | `#fdf4ff` | `#fae8ff` | `#f5d0fe` | `#f0abfc` | `#e879f9` | `#d946ef` | **`#c026d3`** | `#a21caf` | `#86198f` | `#701a75` |
   | 14 | Blue | `#2563eb` | `#eff6ff` | `#dbeafe` | `#bfdbfe` | `#93c5fd` | `#60a5fa` | `#3b82f6` | **`#2563eb`** | `#1d4ed8` | `#1e40af` | `#1e3a8a` |

   State the chosen palette in your Phase 1 summary:
   > "Brand color: **[Name]** `[Brand 600]` (row [#], randomly selected)."

7. **Visual theme preset** — pick from `~/github/r2d2/THEME_REGISTRY.md`.

   Color alone is not enough to make sites feel distinct, and even a
   neutral/font/radius token pass alone was judged too subtle when compared
   side-by-side against a sibling (confirmed 2026-07-12). The registry now
   organizes themes around **3 Major Options** with a two-step random draw:

   **Read `~/github/r2d2/THEME_REGISTRY.md` before choosing**, then:

   a. Roll Major Option 1 (Light Classic), 2 (Light + Bold Hero), or 3
      (Full Dark) with equal probability — unless the user specifies a
      direction (e.g. "dark", "minimal", "warm"), in which case honor that
      instead of rolling.
   b. If Option 2 or 3, roll randomly among that option's rows marked
      `_available_` in the registry's row table. Option 1 has only row 0.
   c. **If Option 3, also roll the two dark-mode sub-axes** in the
      registry's "Dark mode sub-axes" section — Depth (Deep or Soft, equal
      probability) and Base hue (Neutral or Tinted, equal probability) —
      unless the user specified a preference (e.g. "not too dark" → Soft;
      "dark green/blue/etc." → Tinted). These are independent of the row
      pick and of each other.
   d. **Flag Option 3 (dark) to the user before building** — it's a
      whole-site pass touching every page's colors, not a handful of
      classes, per the registry's "Dark mode implementation notes." Still
      apply it the same session if approved; it's mechanical (follow the
      notes), not a fresh design exploration — just larger in scope than
      Options 1/2. If Base hue rolled Tinted, also follow the registry's
      "Tinted base" notes — it is not a drop-in reuse of the Neutral recipe
      (text/borders must stay neutral, badge tints need a neutral-glass
      treatment, and status colors may need a manual contrast bump).

   State the chosen theme in your Phase 1 summary:
   > "Visual theme: **[Name]** (row [#], Option [1/2/3][, Depth: Deep/Soft, Base hue: Neutral/Tinted if Option 3])."

8. **User-supplied company data (if any)** — ask, or check the prompt/attached
   files, for whether the user has already given you data for one or more
   companies: a client's own facts to feature them accurately, a batch-plan
   doc with facts pre-decided for a company appearing across multiple sites,
   pasted research, a spreadsheet, etc. If so, note exactly which companies
   and which fields (facts, prose, ratings — whatever was supplied) are
   covered. This becomes authoritative input to Phase 2 (see "User-supplied
   data takes precedence over independent research" there) — it does not
   replace independent research for the rest of the roster or for any field
   the supplied data doesn't cover.

**Auto-derive (confirm in summary):**
- Site name → "Best [Niche] Companies"

Summarise all confirmed inputs — including any user-supplied company data
identified in Step 8 — and ask the user to approve before Phase 2.

---

## PHASE 2 — Research Companies

Use WebSearch to research exactly the number of companies the user specified.

**Do this inline in the main session. Do NOT spawn an Agent/subagent/fork for
this phase**, even for a large company count (e.g. 34). It's tempting to fork
research off to keep the WebSearch output out of context, but that output is
exactly what feeds the `companies.ts` you write next — it's worth keeping.
Delegating this phase to a subagent roughly doubles token cost for no benefit
and has been flagged by the user as a regression once already.

### User-supplied data takes precedence over independent research

If Phase 1 Step 8 identified company data the user already supplied — a
client's own facts, a batch-plan doc, pasted research, a spreadsheet — use
that data as-is for the companies and fields it covers. Do not independently
re-research those specific facts and silently overwrite them with a
different (even if independently "correct") result, and do not treat the
supplied data as loose inspiration to paraphrase away from. Every other
company in the roster, and any field the supplied data doesn't cover for an
otherwise-supplied company (e.g. the user gave founding facts but not
pros/cons), still gets the full independent-research treatment below — this
rule narrows what needs research, it doesn't replace Phase 2 with "trust the
prompt for everything."

This matters most when the same user-supplied company recurs across a batch
of sites (see "Facts consistency across a batch" and "Prose uniqueness when
a company appears on more than one site" further down this phase): the
supplied *facts* (founded, HQ, team size, and anything else explicitly
given) must stay identical to what was supplied on every site that features
it — do not let independent per-site research drift them, even slightly, and
even when a fresh search turns up something that looks more current or more
precise. If you genuinely believe the supplied data is wrong (e.g. it's
stale, or a fresh primary source contradicts it), flag that to the user and
ask before changing it — don't silently "correct" it. Prose fields
(`tagline`, `description`, `bestFor`, etc.) still get independently written
per site as normal, even for a company whose facts came from the user.

### For each company, collect and verify:

- **Full legal name** (primary source: company website, LinkedIn, Crunchbase)
- **Website URL** (the real homepage, not a press page)
- **Founding year** (verify from Crunchbase, LinkedIn, or company About page — not marketing copy)
- **HQ** (legal HQ city; note if delivery centre differs)
- **Team size band** (from LinkedIn "About" tab or Crunchbase — do NOT use company website claims alone)
- **Key services** (what they actually deliver, not what they claim)
- **Notable clients or public case studies** (name or category only; do not invent)
- **Cloud/tech certification tiers** (verify from official partner directories only)
- **Acquisitions, ownership changes, parent company** (disclose in `description` and `cons`)
- **Pricing model** (fixed / T&M / retainer / marketplace)
- **Genuine strengths** — what they are measurably better at
- **Genuine weaknesses** — real trade-offs, not softened disclaimers

### Tech stack — inference rules:

A company won't always list every tool it uses. Apply these rules:

- **Explicitly stated** (website, case studies, job postings, GitHub): list as-is
- **Certifications imply stack**: AWS Premier Partner → include core AWS services;
  Azure Expert MSP → Azure equivalents; GCP Partner → GCP services. List the
  platform, not every individual service.
- **Company size + niche implies baseline**: A 5,000-person DevOps consultancy
  almost certainly uses Terraform, Kubernetes, and CI/CD tooling even if not
  stated. Include these with reasonable confidence.
- **Do NOT blanket-assume excellence**: Presence in `techStack` does not mean
  leadership — reflect depth in `pros`/`cons` and `rating`.
- **Never invent specific version numbers, proprietary tool names, or internal
  frameworks** without a source.

### Research rules (non-negotiable):

- Tag unverifiable marketing claims: `(per company website; independently unverifiable)`
- Disclose acquisitions in `description` and in at least one `cons` entry
- Confirm cloud partnership tiers from official partner directories
- Do NOT copy competitors' descriptions or any SEO-scraped content

### Rating logic:

Ratings are for **niche-specific delivery suitability**, not overall IT quality.
- No company should top every dimension
- The single clearest specialist/boutique gets ≥ 4.7; place it at rank #1
- Large IT generalists should rate 0.5–1.0 lower than boutiques on specialist dimension
- Spread across the full list must be ≥ 0.8 points (e.g. 4.8 down to 3.9)
- Give at least one company a clear win on cost/accessibility
- Give at least one large company a win on scale/compliance
- **Watch for name-recognition bias toward heavily-marketed companies.**
  Some companies (e.g. LeewayHertz) publish enough SEO/content-marketing
  material that they get pulled toward a top-2 rank by default, independent
  of the niche or the rest of the roster. Confirmed 2026-07-12: LeewayHertz
  landed at rank #2 on two unrelated sites while sitting at rank ~11-14 on
  four others with the same research process — the #2 placements had no
  extra verified differentiation to justify the gap. Before ranking any
  company in the top 3, check that its rating is earned by *this niche's*
  rating dimensions (specialist depth, scale, cost) versus the rest of *this
  site's* roster — not by how much marketing copy it has relative to
  competitors.

### Prose uniqueness when a company appears on more than one site

Overlapping rosters across sibling sites are expected (see "Multiple sites in
the same niche" above) — but overlapping **written prose** for the same
company is not. `tagline`, `description`, `bestFor`, `primaryDifferentiator`,
`pros`, `cons`, and `useCases` must be independently written every time a
company reappears on another site, even within the same batch session.

**Confirmed 2026-08-12:** across a 10-site batch that all featured the same
company (Tensorway), 6 of the 10 sites opened its `description` with the
near-identical sentence ("Tensorway is the AI-focused unit of an established
Alicante, Spain software development company with roughly 25 years in the
market...") and the other 4 shared a second near-identical opener — despite
the batch's own planning doc explicitly stating the rule above. Two sites
(`best-ai-agent-development-companies-list`, `top-ai-agent-development-services`)
had gone further and copy-pasted the entire `tagline` and most of `pros`/
`cons`/`useCases` verbatim from each other. Facts (founded year, HQ, team
size) can and should stay consistent for the same real company across sites —
only the prose fields need to differ.

**Verify before finishing any site where a company also lives on a sibling
site you've already built (in this session or a prior one):**
```bash
# Pull that company's current opening sentence + tagline from each sibling
# site that already has it, and read them side by side before writing yours.
grep -A2 'slug: "COMPANY-SLUG"' ~/github/r2d2/*/src/data/companies.ts \
  | grep -E "tagline:|description:"
```
If two or more openers share the same first 6+ words, or any full sentence
is byte-identical across sites, rewrite until every site's prose is
genuinely distinct — different sentence structure, different lead fact,
different case study or differentiator emphasized. Do this check per
company, not just once per site.

### Apply the humanizer checklist to every company's prose

Before moving to Phase 3, check `tagline`, `description`, `bestFor`,
`primaryDifferentiator`, `pros`, and `cons` for every company just written
in this phase against the `humanizer` checklist loaded once back
in Phase 0d. **Do not re-invoke the skill here** — apply it from memory,
the same way you already apply the other Phase 2 research rules without
re-reading them. It catches things the prose-uniqueness check above
doesn't: em dashes, banned words (including "roster," "sits at," "shop"
meaning company, "shortcut"), rule-of-three list patterns, aphoristic
closers, and repetitive vocabulary within a single company's own fields.
Fix directly in `companies.ts` as you write — don't write first and sweep
for violations after, that's the redundant-token version of this step.

### Facts consistency across a batch — check facts, not just prose

The prose-uniqueness check above catches near-duplicate *wording*. It does
**not** catch a company's core *facts* (`founded`, `hq`, `teamSize`) silently
diverging between sites — a passing prose-diff does not imply the facts are
right. **Confirmed 2026-08-13:** on a 10-site batch with a plan doc fixing a
featured company's facts (founded year, HQ, team size), 4 of the 10 sites
instead carried a wholesale wrong-facts narrative — different founding year,
an invented parent-company/spin-out story, different HQ, different team-size
band — none of which is a prose-phrasing problem, all of which is a factual
error that a prose-only diff will not surface. If a batch plan doc fixes a
company's facts, verify every site against the plan **and** against
siblings, not just its prose:

```bash
grep -A3 'slug: "COMPANY-SLUG"' ~/github/r2d2/*/src/data/companies.ts \
  | grep -E "founded:|hq:|teamSize:"
```

All values for the same real company must match (or have a documented,
deliberate reason not to) across every site that features it.

After research, present a summary table of all candidates and ask the user:
> "Here are the [N] companies I found. Confirm to proceed, or let me know if
> you want to swap any out before I build the site."

Do not proceed to Phase 3 until the user approves the company list.

---

## PHASE 3 — Scaffold the New Site

Before cloning, only check that the target folder name itself doesn't already
exist (e.g. `ls ~/github/r2d2/[new-site-name]` — expect "No such file or
directory"). Do not `ls ~/github/r2d2/` broadly to see what else is in there —
see "Multiple sites in the same niche are EXPECTED" above.

```bash
# 1. Clone the generic template (no AI-agent-specific content)
# For r2d2 sites, base dir is ~/github/r2d2/ — NOT ~/Projects/
git clone https://github.com/r2d2-pixel/niche-reviewer-template.git ~/github/r2d2/[new-site-name]

# 2. Re-init git so this becomes a fresh independent repo
cd ~/github/r2d2/[new-site-name]
rm -rf .git
git init
git branch -m master main   # macOS git init creates 'master' by default — rename immediately

# 3. Initial commit
git add .
git commit -m "chore: initial scaffold from niche-reviewer-template"
```

The cloned template already has:
- Generic `src/config.ts` with TODO placeholders for all niche-specific fields
- Empty `src/data/companies.ts` with the `Company` type and helper functions
- `public/_headers` and `public/_redirects` for Cloudflare Pages
- `src/pages/index.astro` with all niche content as TODO placeholders
- No `vercel.json` (removed in the template)
- No AI-agent-specific hardcoding anywhere in source files

---

## PHASE 4 — Customize All Files

Work through each file below in order. Do NOT skip any.

### 4a. `src/config.ts`

Replace every TODO value with real niche content:

```typescript
export const SITE = {
  name:          'Best [Niche] Companies',
  domain:        '[target-domain]',
  url:           'https://[target-domain]',
  tagline:       'Independent reviews of [niche] companies',
  description:   'Find and compare the best [niche] companies. Independent reviews, pricing data, and side-by-side comparisons.',
  locale:        'en_US',
  twitterHandle: '',
  lastReviewed:  '[Month Year]',
};
```

**Never put `${SITE.lastReviewed}` (or any month/year) inside a `description`
prop.** `SITE.lastReviewed` exists only for visible on-page trust signals —
"Last reviewed: [Month Year]" footers/badges on company, comparison, and
alternatives pages, and the "Updated [Month Year]" hero badge on the
homepage. It must never appear inside text that becomes a
`<meta name="description">`. Confirmed 2026-07-12: a meta description reading
"Updated July 2026" was live on all 10 r2d2 sites and looks stale in every
month that isn't the one baked in — the user does not update these sites
monthly, so a static date in a search-result snippet actively undersells
freshness rather than signaling it. `SITE.description` (used as the default
`description` fallback in `Base.astro`, and echoed verbatim in
`llms.txt.ts`'s blockquote) is included in this rule — do not append "Updated
[Month Year]" to it either.

```typescript
export const NICHE = {
  label:          '[Niche Label]',       // e.g. 'Cloud Migration'
  providerLabel:  'company',
  providersLabel: 'companies',
  verticalSlug:   '[niche-slug]',        // e.g. 'cloud-migration' — kebab-case
};

export const BRANDING = {
  primaryColor: '[brand-600-hex]',       // from Phase 1 color choice
  logoText:     'Best [Niche] Companies',
  logoPath:     '/logos/site-logo.svg',
};

export const MONETIZATION = {
  enabled: false,
  defaultRel: 'nofollow' as 'sponsored' | 'nofollow' | '',
  disclosurePath: '/affiliate-disclosure',
};

export const NAV = [
  { label: 'Home',        href: '/' },
  { label: 'Disclosure',  href: '/affiliate-disclosure/' },
];
```

### 4b. `astro.config.mjs`

Change `site:` only — leave all other settings unchanged:
```js
site: 'https://[target-domain]',
```

### 4c. `tailwind.config.mjs`

Replace the full `brand` color object. Copy all 10 shade values from the
row selected in Phase 1 (Step 6 — registry-checked color).

**Update `~/github/r2d2/PALETTE_REGISTRY.md` now**, in the same session:
mark the chosen row's "Used by" cell with this site's domain. Do this before
moving to 4d — it's easy to forget once you're deep in company data entry.

Example using row 11 (Indigo):

```js
brand: {
  50:  '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
},
```

### 4c-2. Apply the visual theme preset

Apply the row picked in Phase 1 Step 7. Follow "How to apply a row" in
`~/github/r2d2/THEME_REGISTRY.md` exactly — it's a mechanical find/replace
pass, not a fresh design pass. What that means depends on the Major Option:

- **Option 1** (row 0): nothing to apply — this is the unmodified template look.
- **Option 2** (rows 1/2/4/5): neutral scale rename, radius permutation,
  `font-display` on `<h1>`s and the header logo only, plus the mandatory
  "Hero band treatment" — do not skip the hero step, a token-only pass was
  judged too subtle when compared side-by-side against a sibling
  (confirmed 2026-07-12).
- **Option 3** (rows 3/6/7/8/9, dark): follow "Dark mode implementation
  notes" in full, plus the "Dark mode sub-axes" (Depth, Base hue) rolled in
  Phase 1c — this is a whole-site pass (every `.astro` file, not just the
  homepage): inverted neutral-scale substitution, brand-color rebalancing
  for dark-background contrast, hardcoded hex colors (e.g. `StarRating`),
  Tailwind Typography `prose-invert`, and status colors. If Base hue is
  Tinted, also follow "Tinted base" notes — text/borders stay neutral even
  though backgrounds use the site's own `brand` family, badge tints need a
  neutral-glass treatment, and status colors (e.g. green checkmarks on a
  green-tinted base) may need a manual contrast bump found only by visual
  QA, not assumed from the Neutral recipe. Grep for the opacity-collision
  bug the notes describe before committing (two distinct flavors documented
  — a pre-existing source token, and your own replacement text getting
  re-matched by a later rule in the same pass).

Do this across every `.astro` file under `src/`, then `npm run build` to
confirm it's clean before moving on.

**Update `~/github/r2d2/THEME_REGISTRY.md` now**, in the same session: mark
the chosen row's "Used by" cell with this site's domain. Do this before
moving to 4d — same reasoning as the palette registry update above.

### 4d. `src/data/companies.ts`

Replace the empty `companies` array with the researched company data.
Keep the `Company` type export and helper functions exactly as-is.

**Required fields per company object:**

```typescript
{
  slug: string,             // kebab-case, unique, URL-safe
  name: string,             // full display name
  website: string,          // https:// URL
  tagline: string,          // one sentence, factual, no superlatives
  description: string,      // 3–5 sentences; encyclopedic, not marketing.
                            // Tag unverifiable claims with:
                            // (per company website; independently unverifiable)
  founded: number,          // verified year as integer
  hq: string,               // "City, Country" — note legal vs. delivery if different
  teamSize: string,         // band, e.g. "200–500"
  rating: number,           // 1 decimal, e.g. 4.7
  badges: string[],         // service categories this company actually delivers;
                            // every value must appear in SERVICE_LABELS (see 4e)
  bestFor: string,          // SHORT comma-separated phrase (~5-10 words), NOT a
                            // full sentence — see "bestFor must be short" below
  primaryDifferentiator: string, // one sentence — what makes them distinct
  pricingModel: string,     // e.g. "Fixed project, T&M, retainer"
  minimumEngagement: string, // e.g. "$25K" or "Not published"
  techStack: string[],      // verified tools/platforms they use
  industries: string[],     // sectors they serve
  engagementModels: string[], // e.g. ["Fixed project", "Dedicated team"]
  pros: string[],           // 4–6 real strengths, 1 sentence each
  cons: string[],           // 2–4 real trade-offs, 1 sentence each
  useCases: string[],       // 3–5 specific scenarios where they excel.
                            // NOTE: not rendered on the company profile page
                            // itself (that section was removed — see gotcha
                            // 23 in CLAUDE.md, it read as generic filler);
                            // still used in comparisons/[slug].astro's
                            // "Use case fit" table, so keep writing it.
  featured: boolean,        // true for top 3–4 companies only
}
```

**Rating discipline:**
- Rank #1 boutique specialist: 4.7–4.9
- Rank #2–3: 4.3–4.6
- Mid-tier: 4.0–4.3
- Large generalists: 3.9–4.2 (they win on scale, not niche depth)
- Minimum 0.8 spread across all companies

**`bestFor` must be short — this is the single most reused field in the
template.** It renders in the homepage quick-answer box, the homepage ranked
table, the company profile "Short answer" line, and (spliced into a full
sentence) on every comparison and alternatives page — up to half a dozen
places across a site. A full grammatical sentence there reads fine in
isolation but turns the homepage quick-answer box into a wall of text the
moment every row has one. Confirmed 2026-08-11 across 26 live sites: the
average `bestFor` had ballooned to 12-21 words per company (full sentences
like "Fortune 1000 enterprises needing production-grade ML across CPG, BFSI,
and healthcare verticals with dedicated engineering teams and proven
enterprise delivery.") versus the ~5-word style the format actually needs.

```
Bad:  "Enterprises, especially in financial services, needing AI delivery
       at scale with strong cloud-native ML platform engineering."
Good: "Financial-services enterprises, cloud-native AI at scale."

Bad:  "Companies wanting AI/ML delivered by a long-established generalist
       IT consultancy already handling other IT needs."
Good: "Companies wanting AI/ML from an established IT generalist."
```

Target ~5-10 words, comma-separated phrase or fragment, not a full sentence
with subordinate clauses. It still needs to read naturally both as a
standalone label ("Best for: ...") and spliced mid-sentence ("X is the
better choice for ...") — a short noun-phrase fragment satisfies both; a
full sentence with its own subject/verb usually only reads naturally in one
of those two contexts.

**Never end `bestFor`, `primaryDifferentiator`, `tagline`, or any `cons`
entry with a period.** These fields get spliced into template sentences that
add their own trailing "." — a field that already ends in "." produces
".." (or "...." for the 8-word-truncated preview shown in some tables).
Confirmed 2026-08-12 across all 26 sites: the template's helper functions
(`stripTrailingPeriods`, `lowerFirstSentence`, `truncateWords` — defined in
the frontmatter of `index.astro`, `companies/[slug].astro`,
`comparisons/[slug].astro`, and `alternatives/[slug].astro`) defensively
strip trailing periods before splicing, so a stray period in your data won't
currently break anything — but don't rely on that safety net when writing
new data; write these fields without a trailing period in the first place.
Full sentences (`description`, `useCases` items) should still end in a
period as normal — this rule is specifically for fields that get spliced
mid-sentence.

### 4e. `src/lib/companies.ts`

Update `SERVICE_LABELS` to match exactly the `badges` values used in
the new `companies.ts`. Every key must appear in at least one company's
`badges` array. Example for cloud migration:

```typescript
export const SERVICE_LABELS: Record<string, string> = {
  'cloud-strategy':      'Cloud Strategy',
  'migration':           'Migration',
  'cloud-native':        'Cloud Native',
  'managed-services':    'Managed Services',
  'data-migration':      'Data Migration',
  'security':            'Security',
  'cost-optimisation':   'Cost Optimisation',
  'staff-aug':           'Staff Aug',
};
```

### 4f. `src/pages/index.astro`

The template has TODO placeholder sections throughout. Fill each one:

| Section | What to add |
|---|---|
| Quick answer box bullet list | Hand-curated criteria — see subsection below, do this *after* Phase 2 ratings settle |
| `<h2>` headings | Rephrase with your niche keyword if needed |
| Use-case table rows | Map your niche's top use cases to companies |
| Industry table rows | Map industries to recommended companies |
| Pricing table rows | Add real pricing ranges for your niche |
| FAQ answers | Add niche-specific answers to each question |
| SEO PROSE 1/2/3 paragraphs | Independently rewrite — see subsection below, do NOT leave as-is |

Run this scan after editing to verify no TODOs remain:
```bash
grep -n "TODO" src/pages/index.astro | head -30
```

### Quick-answer box must be hand-curated, not mechanically derived

The "Which X is best?" box ships with a mechanical derivation
(`featuredProfiles.slice(0, 6).map(...)` + a `bestForShort()` helper that
takes the text before the first comma of `company.bestFor`). That helper
only fixes one problem — run-on "Best for X, not Y:" grammar. It does **not**
prevent two different companies from truncating to the same word (confirmed
2026-08-13: a 16-site batch shipped rows like "Best for fintech:" appearing
twice among the same site's six picks, because two roster companies both led
`bestFor` with "fintech"). Once Phase 2 research is done and ratings are
final, replace the mechanical derivation with a hand-curated array:

```typescript
// Hand-curated, non-overlapping "Best for X" categories — top-rated company
// is always "overall"; the other 5 must be genuinely distinct real
// differentiators (industry, engagement model, geography, team size/cost,
// etc.), not near-synonyms of each other or of one another's wording.
const quickAnswerPicks: { slug: string; label: string }[] = [
  { slug: "top-rated-company-slug", label: "overall" },
  { slug: "other-slug-1", label: "regulated financial services" },
  { slug: "other-slug-2", label: "a 100% EU-only delivery footprint" },
  { slug: "other-slug-3", label: "startups on a tight budget" },
  { slug: "other-slug-4", label: "enterprises without an in-house AI team" },
  { slug: "other-slug-5", label: "pilot-to-production delivery" },
];
```

Render it in place of `featuredProfiles.slice(0, 6)`, resolving each
`pick.slug` against `companies` and rendering:
`Best {pick.label === 'overall' ? 'overall' : \`for ${pick.label}\`}:`.
Delete the now-unused `bestForShort()` helper once nothing calls it. Pick
labels that are the kind of thing someone would actually type into Google —
"best for startups", "best for enterprise", "best for fintech", "best
budget option" — grounded in that company's real `industries`, `teamSize`,
`minimumEngagement`, or `engagementModels`, not invented.

**Verify before shipping:**
```bash
# After building, no two "Best ..." rows in the quick-answer box may repeat
grep -oE 'Best (overall|for [^:<]*):' dist/index.html | sort | uniq -d
```
Must return nothing.

### Homepage SEO prose must be independently written per site

`index.astro` ships 3 "SEO PROSE" blocks (What makes a good provider / [Niche]
in [year]: what buyers should know / How this list was compiled — 3
paragraphs each). This placeholder text is coherent, plausible,
niche-agnostic advice — unlike an obviously-fake stub, it reads as
already-done work on a skim, which is exactly why it has shipped unedited
before. **Confirmed 2026-08-13:** a 16-site batch had all 9 paragraphs
byte-identical across every site except the `{NICHE.label}` token — this fell
through a gap in the per-*company* prose-uniqueness rule (Phase 2) because
it's per-*site* editorial copy, not company data. Rewrite all 9 paragraphs
around this site's actual positioning angle (e.g. procurement/RFP framing,
EU/GDPR framing, boutique-agency framing, ranked-listicle framing,
engineering/technical-buyer framing — whatever genuinely differentiates this
site from its siblings per the Phase 1 niche/domain phrasing).

**Verify before shipping:**
```bash
# Any hit means this site still has template stock text — must return 0
grep -c "Technical depth is a reliable proxy for expertise\|Projects cost more than most initial estimates\|All company data was sourced from each company" src/pages/index.astro
```
If this site shares a niche/company batch with sibling sites, additionally
diff its SEO PROSE against each sibling's the same way the Phase 2 prose
check requires — near-identical paragraphs across sites are the same bug
even when the single-site grep above passes.

**Apply the humanizer checklist here too — from memory, not a re-invoke.**
Once the 3 SEO PROSE blocks, the FAQ answers, and the "How we selected"/"How
this list was compiled" sections are written, check `src/pages/index.astro`'s
prose against the same `humanizer` checklist loaded in Phase 0d.
This is the step most likely to introduce em dashes, rule-of-three list
templates, and FAQ-restates-the-table redundancy, since it's freehand
editorial writing rather than data interpolation. Apply fixes directly, then
rebuild before running the Phase 5 verification checks below.

**Homepage `<title>`/`<h1>` casing — the template already handles this, do
not break it.** The homepage `<title>` and `<h1>` are
`` `Best ${NICHE.label} ${providersLabelTC} in ${year}` ``, where
`providersLabelTC` is a `titleCase()`-transformed version of
`NICHE.providersLabel` computed in the frontmatter. `NICHE.providersLabel`
itself stays lowercase (e.g. `'agencies'`, `'companies'`) because it also
reads correctly mid-sentence elsewhere on the same page (e.g. "36 agencies
reviewed", "Compare all agencies") — do not capitalize the config value
itself, only the title/H1 call sites use the title-cased copy. If you
customize the homepage headline with hardcoded text instead of
`{NICHE.providersLabel}` (as `best-ml-development-companies-europe` and
`top-ml-development-services-europe` do, e.g. "Best Machine Learning
Development Companies in Europe"), just write it correctly capitalized by
hand — there's no lowercase-word bug to introduce in that path.

Verify before committing:
```bash
# Confirm the built homepage <title> has no lowercase word after "Best "
# that should be capitalized (spot-check by eye — this greps the raw string)
grep -o "<title>[^<]*</title>" dist/index.html
```

### 4g. `src/pages/comparisons/[slug].astro`

Two sections require niche-specific updates:

**`hasCap()` function keys:** Replace the placeholder capability keys with
the actual capabilities in your niche. Keys must match the labels used in
the JSX capabilities table.

```typescript
const checks: Record<string, (c: Company) => boolean> = {
  'Cloud strategy & roadmap': c => c.badges.some(b => b.includes('strategy')),
  'AWS/Azure/GCP migration':  c => c.badges.some(b => b.includes('migration')),
  // ... add all capability checks for your niche
};
```

**`allTech` array:** Replace with the 5–10 key technologies for your niche:
```typescript
const allTech = ['Terraform', 'Kubernetes', 'AWS', 'Azure', 'GCP'];
```

**Capability array in JSX:** Must exactly match `hasCap()` keys:
```tsx
{['Cloud strategy & roadmap', 'AWS/Azure/GCP migration', ...].map((cap, i) => (
```

Run this scan to confirm no TODO placeholders remain:
```bash
grep -n "TODO" src/pages/comparisons/\[slug\].astro | head -10
```

### 4h. `src/pages/llms.txt.ts`

Create this file to make the site machine-readable by AI crawlers (follows the
[llmstxt.org](https://llmstxt.org/) spec). It is a dynamic Astro endpoint that
generates `/llms.txt` at build time from the companies data, so it never goes stale.

**Best practices baked in:**
- H1 → site name; blockquote → site description from `SITE.description`
- Curated sections (not a sitemap dump) — all companies listed with taglines
- Comparisons limited to the featured company vs all others (focused, not overwhelming)
- Every link has a one-liner description — bare URLs are ignored by LLMs
- Alternatives in `## Optional` so LLMs can skip if context is tight
- Under 50 KB even with 30+ companies; stays within model context limits

```typescript
import { SITE, NICHE } from '../config';
import { companies, getComparisons } from '../data/companies';

export async function GET() {
  const featured = companies.find((c) => c.featured) ?? companies[0];
  const comparisons = getComparisons();
  // Only include comparisons involving the top-ranked (featured) company
  const keyComparisons = comparisons.filter(
    (c) => c.slug1 === featured.slug || c.slug2 === featured.slug
  );

  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(`> ${SITE.description}`);
  lines.push('');

  lines.push('## Start Here');
  lines.push('');
  lines.push(`- [Homepage](${SITE.url}/): Full directory of ${companies.length} ${NICHE.providersLabel} with ratings, pros/cons, and verified pricing`);
  lines.push(`- [Affiliate Disclosure](${SITE.url}/affiliate-disclosure/): Editorial independence policy and disclosure`);
  lines.push('');

  lines.push(`## ${NICHE.label} Reviews`);
  lines.push('');
  for (const c of companies) {
    lines.push(`- [${c.name}](${SITE.url}/companies/${c.slug}/): ${c.tagline}`);
  }
  lines.push('');

  lines.push('## Comparisons');
  lines.push('');
  for (const cmp of keyComparisons) {
    const a = companies.find((c) => c.slug === cmp.slug1);
    const b = companies.find((c) => c.slug === cmp.slug2);
    if (a && b) {
      lines.push(`- [${a.name} vs ${b.name}](${SITE.url}/comparisons/${cmp.slug}/): Head-to-head comparison of ${a.name} and ${b.name}`);
    }
  }
  lines.push('');

  lines.push('## Optional');
  lines.push('');
  for (const c of companies) {
    lines.push(`- [${c.name} Alternatives](${SITE.url}/alternatives/${c.slug}/): Best alternatives to ${c.name} for ${NICHE.label.toLowerCase()} use cases`);
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

After creating the file, run `npm run build` and confirm the endpoint appears:
```
λ src/pages/llms.txt.ts
   └─ /llms.txt (+Xms)
```

### 4i. `public/favicon.svg`

The template ships a placeholder favicon. Replace it with a niche-appropriate
SVG icon using the site's `BRANDING.primaryColor`. The `<link rel="icon">` tag
is already in `Base.astro` — only the SVG file needs to be replaced.

**The fill color must be the registry-checked color from Phase 1/4c — never
reuse a sibling's color.** At 16px (browser tab size) the background fill
dominates what the eye sees; two favicons with the same fill and different
internal line art still read as identical. If `PALETTE_REGISTRY.md` shows
your row already claimed, go back and pick a different one before generating
this file.

Design rules:
- 32×32 viewBox, simple shape that reads at 16px (browser tab size)
- Background: `<rect width="32" height="32" rx="6" fill="[brand-600-hex]"/>`
- Icon: white shapes representing the niche
- Under 1 KB — no embedded fonts, no external references

Verify before committing:
```bash
head -2 public/favicon.svg   # must start with <svg
```

### 4j. `src/pages/contact.astro`

Create a contact page for link placement / advertising inquiries using Web3Forms.
The Web3Forms access key is reusable across all sites — use `032a901f-d3c0-46a4-afd4-907be497ee1e`.
The domain field on web3forms.com is a label only; it is not validated or enforced.

```astro
---
import Base from '../layouts/Base.astro';
import { SITE } from '../config';
---

<Base
  title="Contact"
  description={`Get in touch with ${SITE.name} — advertising, link placements, corrections, or general inquiries.`}
  canonical={`${SITE.url}/contact/`}
>
  <section class="py-16 sm:py-24">
    <div class="mx-auto max-w-xl px-4 sm:px-6">

      <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Contact us</h1>
      <p class="text-slate-600 mb-10">
        Interested in a sponsored listing or link placement on {SITE.name}?
        Fill out the form and we'll get back to you within 1–2 business days.
      </p>

      <div id="success" class="hidden bg-green-50 border border-green-200 text-green-800 rounded-lg px-5 py-4 mb-6 text-sm">
        Thanks! Your message has been sent. We'll reply within 1–2 business days.
      </div>
      <div id="error" class="hidden bg-red-50 border border-red-200 text-red-800 rounded-lg px-5 py-4 mb-6 text-sm">
        Something went wrong. Please try again or email us directly.
      </div>

      <form id="contact-form" action="https://api.web3forms.com/submit" method="POST" class="space-y-5">
        <input type="hidden" name="access_key" value="032a901f-d3c0-46a4-afd4-907be497ee1e" />
        <input type="hidden" name="subject" value={`Link placement inquiry — ${SITE.domain}`} />
        <input type="hidden" name="from_name" value={SITE.name} />
        <input type="checkbox" name="botcheck" class="hidden" />

        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Your name</label>
          <input id="name" type="text" name="name" required autocomplete="name" placeholder="Jane Smith"
            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600" />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input id="email" type="email" name="email" required autocomplete="email" placeholder="jane@company.com"
            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600" />
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-slate-700 mb-1">Message</label>
          <textarea id="message" name="message" required rows="5"
            placeholder="Tell us about the placement you're looking for, your target URL, and any budget or timeline details."
            class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 resize-y"></textarea>
        </div>

        <button type="submit" id="submit-btn"
          class="w-full bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Send message
        </button>
      </form>
    </div>
  </section>

  <script>
    const form = document.getElementById('contact-form') as HTMLFormElement;
    const btn  = document.getElementById('submit-btn') as HTMLButtonElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form),
        });
        const data = await res.json();
        if (data.success) {
          form.classList.add('hidden');
          document.getElementById('success')!.classList.remove('hidden');
        } else {
          throw new Error(data.message);
        }
      } catch {
        document.getElementById('error')!.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = 'Send message';
      }
    });
  </script>
</Base>
```

Then add "Contact" to the nav and footer in `src/layouts/Base.astro`:
- Desktop nav: add `<a href="/contact/" class="px-3 py-2 rounded hover:text-brand-600 transition-colors">Contact</a>` right after the Disclosure link, before `</nav>`
- Mobile nav: add `<a href="/contact/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600">Contact</a>` right after the Disclosure link, inside the same `<div class="border-t ...">` block
- Footer Resources `<ul>`: add `<li><a href="/contact/" class="text-xs text-slate-600 hover:text-brand-600">Contact</a></li>` right after the Affiliate disclosure `<li>`

Verify before committing:
```bash
grep -c "contact" src/layouts/Base.astro   # expect 3 (desktop nav, mobile nav, footer)
```

### 4k. `CLAUDE.md`

Update the three niche-specific sections:
1. **Rating logic** dimension winner bullets — name your niche's actual companies
2. **Known verified facts** — list verified facts for each company
3. **Current Status** at the bottom — replace with actual page count and company list

---

## PHASE 5 — Build & Verify Locally

```bash
cd ~/Projects/[new-site-name]
npm install --cache /tmp/npm-cache   # use this form to avoid EACCES cache permission errors
npm run build
```

**Expected output:**
- Zero TypeScript errors
- Zero Astro build errors
- Page count = 1 home + N profiles + N alternatives + N×(N-1)/2 comparisons + 1 disclosure + 1 404 + 1 companies index
  (e.g. 7 companies → 1 + 7 + 7 + 21 + 1 + 1 + 1 = 39 … Astro reports 38 because robots.txt is a TS route counted separately)
  Quick check: `[build] N page(s) built` in the output — any TypeScript error before this line must be fixed before pushing.

**If build fails:**
- Read the full error message and fix the offending file
- Re-run `npm run build`
- Do NOT proceed to GitHub push until build exits 0

**Verification scans — run all, fix every hit before proceeding:**

```bash
# 1. Check no TODO placeholders remain in config
grep -n "TODO" src/config.ts

# 2. Check no TODO placeholders remain in index
grep -n "TODO" src/pages/index.astro | head -20

# 3. Check no TODO placeholders remain in comparisons page
grep -n "TODO" src/pages/comparisons/\[slug\].astro | head -10

# 4. Verify vercel.json is absent
ls vercel.json 2>/dev/null && echo "DELETE vercel.json before pushing"

# 5. Verify SERVICE_LABELS keys match badges in companies.ts
grep "badges:" src/data/companies.ts | head -20
grep "'" src/lib/companies.ts | head -20
```

**Companies dropdown completeness check — REQUIRED before pushing:**

If more than one company has `featured: true` (true for any site with 3-4
featured picks per the data spec), a broken `navCompanies` filter can
silently drop companies 2-4 from the "Companies" nav dropdown specifically,
while those same companies still render correctly everywhere else on the
homepage (comparisons list, ranked table, footer) — so a generic "does this
company appear anywhere on the page" grep will NOT catch it. This shipped
across every site built from an earlier template version. Check the dropdown
section itself, isolated by its HTML comment markers:

```bash
# Extract just the "Companies dropdown" block and count company links in it
awk '/<!-- Companies dropdown -->/,/<!-- Comparisons dropdown -->/' dist/index.html \
  | grep -oE '/companies/[a-z0-9-]+/"' | sort -u | wc -l
# Total companies defined in data
grep -c "slug: '" src/data/companies.ts
```
The two counts must match exactly. If the dropdown count is lower, a company
is missing from the "Companies" dropdown — check `navCompanies` in
`src/layouts/Base.astro`: it must pin **all** `featured: true` companies at
the top (not just the first one found) and must not filter any of them out
of the remaining list.

**Stale date in meta description check — REQUIRED before pushing:**

`<meta name="description">` must never contain `${SITE.lastReviewed}` or any
other baked-in month/year — it reads as stale the moment the calendar turns
over, and this template's sites are not on a monthly update cadence. The
on-page "Last reviewed: [Month Year]" text is fine and untouched by this
check; this only targets the `<meta name="description">` tag itself.

```bash
# Any built page with a month name in its meta description is a bug
grep -rlE '<meta name="description" content="[^"]*(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{4}' dist/
```
This must return **zero** file paths. If it doesn't, trace the offending
page's `description`/`pageDesc` string back to `${SITE.lastReviewed}` and
remove that clause — do not touch the separate on-page "Last reviewed" text.

**Page `<title>` length check — REQUIRED before pushing:**

Every page's `<title>` must be strictly under 70 characters (SEO — longer
titles get truncated with "..." in Google search results). This is enforced
architecturally in `Base.astro`: it computes `title | SITE.name` and drops
the ` | SITE.name` suffix instead if that would push the total to 70+
characters (`titleWithSite.length >= 70 ? title : titleWithSite`) — so a
long company name or long `SITE.name` never overflows, it just loses the
branding suffix on that one page. The company profile title itself
(`src/pages/companies/[slug].astro`) is `${company.name} review ${year}` —
do not add a niche-label clause like `: ${NICHE.label}` to it; that alone
pushed real titles (e.g. "Accenture review 2026: Machine Learning
Development | Best Machine Learning Development Services Companies") well
past 100 characters before this was fixed (2026-07-12).

```bash
# Any built page with a <title> of 70+ characters is a bug
grep -roE "<title>.{70,}</title>" dist/ | head -10
```
This must return **zero** results. If it doesn't, the offending page's title
template is too verbose on its own — comparison pages
(`src/pages/comparisons/[slug].astro`) are the most likely culprit, since
`${c1.name} vs ${c2.name} (${year}): ${NICHE.label} comparison` can exceed
70 characters by itself with two long company names, even before the
`Base.astro` safety net has a chance to drop anything (there's nothing left
to drop — the raw title is already over budget). That's a known, currently
unresolved gap in this template: flag it to the user rather than silently
rewording their comparison title format, since shortening it is a content
decision, not a mechanical fix.

**Humanizer / banned-word check — REQUIRED before pushing:**

This is a mechanical backstop for the `humanizer` checklist loaded
once in Phase 0d and applied from memory while writing Phase 2/4f prose —
it won't catch everything the skill does (list-template repetition, FAQ
redundancy, and the header-specific/uncited-claim rules all need a human or
model read, not a grep), but em dashes and most of the banned-word list are
cheap to grep for and easy to miss on a skim of a long page. Run this
**every time**, not just when something feels off — see gotcha 31 in
`CLAUDE.md` for why a "looks fine" skim isn't enough on its own.

```bash
# Em dashes in rendered homepage/company/comparison output — must be zero
grep -c "—" dist/index.html
grep -rl "—" dist/companies/ dist/comparisons/ dist/alternatives/ 2>/dev/null

# Banned words/phrases — this MUST stay in sync with the full list in
# humanizer.md section 2. This is the complete greppable subset; the
# header-specific rules ("Actually"/"Really" in headings, generic template
# headers), copula-avoidance/elegant-variation/false-ranges (section 3,
# rules 15/5/17 — these need sentence-level context, not a keyword match),
# and the "uncited claim" nuance on "studies show"/"experts agree" aren't
# reliably greppable and still need a human/model read.
grep -rniE "\broster\b|\bsits? at\b|\bshortcut\b|\bshop\b|leverage|seamlessly|cutting-edge|\brobust\b|innovative|\blayer\b|pipeline|empower|unlock|\btransform|revolutionise|supercharge|fast-paced|rapidly evolving|it'?s worth noting|it is important to note|delve into|our team of experts|passionate team|we strive to|state-of-the-art|best-in-class|world-class|studies show|experts agree|research suggests|industry reports|observers have (cited|noted)|at scale|tailor-made|\bholistic\b|end-to-end|this is where|testament|\bpivotal\b|underscores its|highlights its (importance|significance)|indelible mark|deeply rooted|boasts a|\bnestled\b|breathtaking|\bstunning\b|groundbreaking|must-visit|renowned|the real question is|at its core|what really matters|the heart of the matter|let'?s dive in|let'?s explore|let'?s break this down|here'?s what you need to know|without further ado|in order to|due to the fact that|at this point in time|in the event that|i hope this helps|would you like|as of my (last|knowledge)|garner|fostering|\binterplay\b|intricac|\bshowcase\b|\btapestry\b|\bunderscore\b|enduring|align with" dist/index.html
```
The em-dash count must be zero on `index.astro`'s own authored prose (hero,
SEO PROSE blocks, FAQ, "how we selected"/"how this list was compiled").
Note per-company data fields (`companies.ts` `pros`/`cons`/
`primaryDifferentiator`) are covered separately by the Phase 2 humanizer
pass, not this homepage-only grep. Any banned-word hit needs a human look —
"shop" as in "workshop" or a literal retail business the site is reviewing
is a false positive; "shop" meaning "the company" is the real target;
"case studies **showing** X" is not the banned "studies show" pattern.

**Matrix table all-dash check — REQUIRED before pushing:**

After the build, open `dist/index.html` and search for tables with only "–" cells.
A table where every data cell is "–" means keyword mismatch — the column keywords
don't match what's in the company data.

```bash
# Quick check: if any matrix table has 5+ consecutive "–" cells, investigate
grep -c '">–<' dist/index.html
```

The engagement models table is safe (auto-generates columns from data). Check all
other matrix tables — especially the industry matrix. The industry matrix uses
keywords `['ai', 'financial', 'government', 'research', 'media', 'commerce']`
against `c.industries[]`. If your niche uses different industry terminology,
update the column keywords in `src/pages/index.astro` to match substrings of
the actual `industries` values in `companies.ts`.

**Double-period artifact check — REQUIRED before pushing:**

`bestFor`, `primaryDifferentiator`, `tagline`, and `cons[0]` get spliced into
template sentences that add their own trailing "." — the template's
`stripTrailingPeriods`/`lowerFirstSentence`/`truncateWords` helpers (see the
"`bestFor` must be short" note in 4d) defend against this, but only where
they're actually called. If you hand-add a new sentence that interpolates
one of these fields directly (without routing it through a helper), a period
already present in the data will double up.

```bash
# Any match here is a real ".." or "...." artifact (excludes normal "..." ellipsis)
grep -rEo '[A-Za-z](\.\.|\.{4,})[^.]' dist/**/*.html | grep -v '\.\.\.[^.]'
```
This must return **zero** results. If it doesn't, find the interpolation
site and wrap the field in `stripTrailingPeriods(...)` (raw splice) or
`lowerFirstSentence(...)` (splice + lowercase first word, preserving
acronym casing like "SaaS"/"EU").

**Service-area / use-case table sanity check — REQUIRED before pushing:**

On `companies/[slug].astro`, the "Service area" table must be driven by
`company.badges` (via `SERVICE_LABELS`) and the "Use case" table must show
only the real per-item `company.useCases` text — **never** pair either with
a second column that repeats a static slice of `industries`/`techStack`,
e.g. `company.industries.slice(0, 2).join(', ')`. That produces a column
where every row shows the identical value, which reads as broken/templated
data (confirmed 2026-08-11 across all 26 live sites — the original template
paired `useCases` rows with `Available for {industries} clients` and
`{industries.slice(0,2)}`/`{techStack.slice(0,2)}` columns that never varied
per row). If you edit either table, keep every column driven by data that
actually varies row-to-row, or drop the column instead of faking variation.

**bestFor-repetition-within-a-page check — REQUIRED before pushing:**

On `comparisons/[slug].astro`, `bestFor` must appear verbatim in **at most
one place** — the Quick Verdict — not restated in the head-to-head table,
"Who should choose", Verdict, and FAQ sections too (confirmed 2026-08-12:
the original template repeated it in all 5, which a reader can literally
find-in-page and see highlighted 5-6 times on one screen). The
head-to-head table's row uses `primaryDifferentiator` instead; "Who should
choose" and Verdict draw from `useCases[0]`/`useCases[1]`; FAQ draws from
`pros[0]`. If you add a new section that needs a one-line "why this
company" blurb, reach for `useCases`/`pros`/`primaryDifferentiator` before
reaching for `bestFor` again.

```bash
# Pick one company's bestFor phrase from a comparison page and count hits —
# anything above 1-2 (Quick Verdict + maybe one other legitimate use) is a regression
grep -o "SOME_DISTINCTIVE_PHRASE_FROM_BESTFOR" dist/comparisons/SLUG1-vs-SLUG2/index.html | wc -l
```

**Commit the clean build:**

```bash
git add src/ CLAUDE.md PROGRESS.md astro.config.mjs tailwind.config.mjs \
        public/_redirects public/_headers
git commit -m "feat: complete [Niche] reviewer site — [N] companies, clean build"
```

---

## PHASE 6 — Create GitHub Repository

Use the GitHub MCP tool `mcp__github__create_repository`:

```
name:        [repo-name]
description: "Niche reviewer site: [Site Name]"
private:     true
auto_init:   false
```

Then push the local commits:

```bash
cd ~/Projects/[new-site-name]
git remote add origin https://github.com/[github-account]/[repo-name].git
git branch -M main
git push -u origin main
```

Confirm the push succeeded by checking the remote exists:
```bash
git ls-remote origin
```

---

## PHASE 7 — Deploy to Cloudflare Pages

**CRITICAL: Do NOT create the Pages project via the Cloudflare API MCP.**
The API creates a "Direct Upload" project that cannot connect to GitHub.
The `PATCH source:` endpoint to fix this returns error `8000069` and has no
workaround short of deleting the project and starting over.

**Always create the Pages project from the Cloudflare dashboard:**

Tell the user:
> "To deploy, go to the Cloudflare dashboard → Pages → Create a project →
> **Connect to Git** → select the **[github-account]/[repo-name]** repository →
> set Branch: `main`, Build command: `npm run build`, Build output directory: `dist` →
> click Save and Deploy. Let me know when the first build completes."

Wait for the user to confirm the build completed before proceeding.

**If the user reports "A project with this name already exists":**
This means a Direct Upload project with that name already exists (likely from a
previous API call). Fix:

1. Use the Cloudflare API MCP to delete the stale project:
```javascript
async () => {
  return cloudflare.request({
    method: 'DELETE',
    path: `/accounts/${accountId}/pages/projects/[cloudflare-project-name]`
  });
}
```
2. Then instruct the user to create fresh from the dashboard using Connect to Git.

**After the first dashboard build succeeds:**

1. Note the preview URL: `https://[project-name].pages.dev`
2. Every subsequent `git push origin main` triggers an automatic redeploy — no further dashboard action needed.

**If the user provided a custom domain:**
- Add it in Cloudflare Pages → Custom domains
- Instruct the user to point their domain's CNAME or nameservers to Cloudflare
- DNS propagation: 0–48 hours; the `.pages.dev` URL works immediately

---

## PHASE 8 — Post-Deploy Verification

After deployment completes, verify using the `.pages.dev` URL:

### Navigation checks
- [ ] Homepage loads — hero headline contains new niche keyword
- [ ] At least 2 company profile pages load correctly
- [ ] At least 1 comparison page loads
- [ ] Alternatives page for one company loads
- [ ] Affiliate disclosure page loads
- [ ] Contact page loads and form fields render
- [ ] 404 page loads and description references new niche

### Technical checks
- [ ] `https://[domain]/sitemap-index.xml` returns valid XML
- [ ] `https://[domain]/robots.txt` returns `Allow: *` and sitemap pointer
- [ ] `https://[domain]/llms.txt` returns plain text starting with `# [Site Name]`
- [ ] llms.txt contains all company names with taglines (spot-check 3)
- [ ] No broken internal links on homepage (check browser console)

### Content checks
- [ ] Page `<title>` on homepage contains new niche keyword
- [ ] Meta description is niche-specific
- [ ] JSON-LD on a company page includes correct `foundingDate` and `description`
- [ ] No two company ratings are identical (meaningful spread)

### Grep check (post-deploy)
```bash
curl -s https://[project-name].pages.dev/ | grep -i "TODO" | head -5
```

If any issues: fix in source → commit → `git push` → wait for Cloudflare
auto-redeploy → re-verify.

---

## PHASE 9 — Handoff Summary

Report to the user:

```
Site live at: https://[project-name].pages.dev
Custom domain: https://[domain] (DNS: propagating / active)

GitHub: https://github.com/[account]/[repo-name]
Branch: main | Auto-deploys: enabled

Pages generated: [N] total
  [N] company profiles | [N] alternatives | [N×(N-1)] comparisons
  + home, disclosure, 404

llms.txt: https://[domain]/llms.txt (auto-generated from companies data)

Recommended next steps:
  1. Submit sitemap to Google Search Console:
     https://search.google.com/search-console → Add property → [domain]
     Sitemap URL: https://[domain]/sitemap-index.xml
  2. [If DNS not yet configured] Point domain to Cloudflare Pages
  3. Create the Bot Traffic Cloudflare dashboard:
     Follow docs/superpowers/plans/2026-06-29-cloudflare-bot-dashboard.md
     (takes ~10 min; use the new domain's zone ID)
```

---

## Error Handling Reference

| Error | Action |
|---|---|
| `npm run build` TypeScript error | Read full error, fix the offending file, re-run. Never push broken code. |
| `vercel.json` found after scan | `rm vercel.json`, re-commit, rebuild. |
| GitHub push rejected (auth) | Ask user to check GitHub MCP credentials / PAT scope (needs `repo` scope). |
| Cloudflare Pages build fails | Check build logs in Cloudflare dashboard. Common causes: wrong output dir (`dist`), missing `NODE_VERSION=20`. |
| Cloudflare Pages API auth error | Verify API token has `Cloudflare Pages: Edit` permission. Fall back to dashboard UI. |
| "A project with this name already exists" | The existing project is a Direct Upload project (created by a prior API call). Delete it via API (`DELETE /accounts/{id}/pages/projects/{name}`), then recreate from the Cloudflare dashboard using Connect to Git. |
| Pages project won't connect to GitHub / error `8000069` | The project is a Direct Upload project. The `PATCH source:` endpoint cannot convert it. Delete and recreate from the dashboard. |
| `git push` goes to `master` not `main` | You forgot `git branch -m master main` after `git init`. Run it now, then force-push: `git push -u origin main`. |
| `npm install` EACCES permission error | Use `npm install --cache /tmp/npm-cache` to bypass the cache permission issue. |
| Fewer than 6 verifiable companies | Tell user; ask whether to proceed with fewer or research adjacent sub-niches. |
| Domain not yet purchased | Skip DNS steps; note `*.pages.dev` URL; remind user to add custom domain later. |
| Two companies share a slug | Append suffix to the second (e.g. `-inc`, `-group`); ensure URL-safe. |
| `SERVICE_LABELS` key missing | Every string in every company's `badges` array must have a matching key in `SERVICE_LABELS`. Add missing keys. |
| TODO found in deployed page | Trace to source file, fill in real content, commit, push. |

---

## Quality Gate — Do Not Mark Done Until All Pass

**Build & content integrity**
- [ ] `npm run build` exits 0 with zero TypeScript or Astro errors
- [ ] Build output shows `λ src/pages/llms.txt.ts → /llms.txt`
- [ ] `grep -n "TODO" src/config.ts` returns zero results
- [ ] `grep -n "TODO" src/pages/index.astro` returns zero results
- [ ] `ls vercel.json` returns "No such file"
- [ ] `public/favicon.svg` exists and `head -1 public/favicon.svg` starts with `<svg`
- [ ] `src/pages/llms.txt.ts` exists and imports from `../config` and `../data/companies`
- [ ] All `SERVICE_LABELS` keys in `src/lib/companies.ts` have a matching entry in at least one company's `badges` array
- [ ] `hasCap()` function keys in `comparisons/[slug].astro` are niche-specific (no TODO placeholders)
- [ ] `allTech` array in `comparisons/[slug].astro` is niche-specific (no TODO placeholders)
- [ ] Companies dropdown link count (isolated between the `<!-- Companies dropdown -->` /
      `<!-- Comparisons dropdown -->` comments in `dist/index.html`) equals total company count —
      catches the "featured company drops siblings 2-4" nav bug
- [ ] `src/pages/contact.astro` exists with the Web3Forms access key and a "Contact" link
      appears in the desktop nav, mobile nav, and footer Resources list
- [ ] `grep -roE "<title>.{70,}</title>" dist/` returns zero results — every page's `<title>`
      is strictly under 70 characters
- [ ] Homepage `<title>` and `<h1>` have every word capitalized except articles/prepositions
      (e.g. "Best Machine Learning Agencies in 2026", not "...agencies in 2026") —
      `grep -o "<title>[^<]*</title>" dist/index.html` and eyeball it
- [ ] `grep -rlE '<meta name="description" content="[^"]*(January|February|March|April|May|June|July|August|September|October|November|December) [0-9]{4}' dist/`
      returns zero file paths — no meta description contains a baked-in month/year
- [ ] `grep -rEo '[A-Za-z](\.\.|\.{4,})[^.]' dist/**/*.html | grep -v '\.\.\.[^.]'` returns zero
      results — no ".." or "...." double-period artifacts from an unstripped trailing period
- [ ] Company profile "Service area" table rows come from `company.badges` (via `SERVICE_LABELS`);
      "Use case" table shows only the real per-item `useCases` text — neither table pairs a row
      with a second column that repeats a static `industries`/`techStack` slice on every row
- [ ] On a sampled comparison page, `bestFor` appears verbatim in at most the Quick Verdict —
      not also restated in the head-to-head table, "Who should choose", Verdict, and FAQ
- [ ] Homepage quick-answer box uses a hand-curated `quickAnswerPicks` array (not the mechanical
      `featuredProfiles.slice(0, 6)` + `bestForShort()` derivation) — `grep -oE 'Best (overall|for
      [^:<]*):' dist/index.html | sort | uniq -d` returns nothing (no two picks share a label)
- [ ] All 3 "SEO PROSE" blocks in `index.astro` were independently rewritten for this niche —
      `grep -c "Technical depth is a reliable proxy for expertise\|Projects cost more than most
      initial estimates\|All company data was sourced from each company" src/pages/index.astro`
      returns 0 (no template stock text remains)
- [ ] `humanizer` pass was run on homepage prose (Phase 4f) and on every
      newly-written company's `tagline`/`description`/`bestFor`/`primaryDifferentiator`/`pros`/`cons`
      (Phase 2) — `grep -c "—" dist/index.html` returns 0 and a spot-check grep for banned words
      ("roster", "sits at", "shop" meaning company, "shortcut", plus the skill's full list) is clean
- [ ] Company profile "What is X?" Overview section's second paragraph does not restate
      founded year / HQ (already stated in the description paragraph above it and in the page
      header meta line) — it should only cover `industries` and `primaryDifferentiator`
- [ ] Company profile FAQ's "What is X?" answer is `company.tagline`, not `company.description` —
      confirm it doesn't literally repeat the Overview paragraph shown higher on the same page

**Visual identity**
- [ ] `~/github/r2d2/PALETTE_REGISTRY.md` was read before picking the brand color, and updated
      with this site's domain after picking it
- [ ] Chosen palette row is not already claimed by a sibling site in the registry
- [ ] `~/github/r2d2/THEME_REGISTRY.md` was read before picking the visual theme, and updated
      with this site's domain after applying it
- [ ] Chosen theme row is not row 0 (Classic Light) unless every other row was claimed
- [ ] `npm run build` succeeded after applying the theme preset

**Data quality**
- [ ] All company ratings have ≥ 0.8 spread across the list
- [ ] No two companies have identical `pros` or `cons` entries
- [ ] All unverifiable facts tagged `(per company website; independently unverifiable)`
- [ ] `CLAUDE.md` "Known verified facts" contains only the new niche's companies
- [ ] `CLAUDE.md` "Rating logic" dimension winners reference the new companies
- [ ] Any top-3-ranked company earned it on this site's own rating dimensions —
      not carried over by reputation/marketing volume from other sessions
      (see the name-recognition bias note in Phase 2 Rating logic)
- [ ] Every `bestFor` is a short comma-separated phrase (~5-10 words), not a full sentence,
      and does not end in a period (see "`bestFor` must be short" in Phase 4d)
- [ ] For any company that also appears on a sibling site (this session or a prior one), its
      `tagline`/`description`/`bestFor`/`primaryDifferentiator`/`pros`/`cons`/`useCases` were
      diffed against the sibling's version and are genuinely distinct prose, not near-duplicate
      phrasing (see "Prose uniqueness when a company appears on more than one site" in Phase 2)
- [ ] For any company that also appears on a sibling site or has fixed facts in a batch plan doc,
      its `founded`/`hq`/`teamSize` were diffed against the plan and siblings and match (see
      "Facts consistency across a batch" in Phase 2) — a passing prose-diff does not imply facts
      are right
- [ ] Any company data the user supplied directly (client facts, batch-plan doc, pasted research)
      was used as-is, not silently overwritten by independent research (see "User-supplied data
      takes precedence over independent research" in Phase 2); every other company/field still
      got full independent research

**Deployment**
- [ ] `sitemap-index.xml` accessible on the live `.pages.dev` URL
- [ ] At least 3 live pages spot-checked: home, 1 company profile, 1 comparison
- [ ] 404 page description references new niche
- [ ] GitHub remote has the clean commit and auto-deploy is active
- [ ] Cloudflare Pages project is connected and first build succeeded
