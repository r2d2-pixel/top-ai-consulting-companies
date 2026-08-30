---
name: "humanizer"
description: "Checks and corrects articles or drafts (e.g. from Maintouch, or any AI-assisted writing) against house formatting/SEO rules and a checklist of telltale AI-generated writing patterns (banned phrases, missing comparison tables, rigid parallel-template lists, aphoristic closers, repetitive vocabulary, fabricated stats, self-promo blocks, redundant FAQs, copula avoidance, elegant variation, false ranges, fragmented headers) — goal is text that reads like it was written by an experienced SEO/copywriting specialist, not an AI. Use this skill whenever the user pastes or uploads an article/blog draft and asks to review, edit, check, clean up, humanize, or \"make it sound less AI,\" or asks for Maintouch correction prompts, even if they don't name this checklist explicitly. Also use when the user wants to update, extend, or add a new rule to this checklist itself. **For r2d2 niche reviewer sites specifically, this doubles as the \"humanizer\" pass: run it on every piece of freshly generated homepage/company prose before a new site ships or an existing site's copy is edited — see `create-reviewer-site.md` for the exact invocation points.**"
---

# Humanizer

Use this skill to check and correct articles (e.g. drafts from Maintouch, or any AI-assisted draft) before publishing. It combines house formatting/SEO guidelines with a checklist of AI-generated writing patterns to catch and fix. Sections 2-3's pattern list is partly built on Wikipedia's "Signs of AI writing" project (WikiProject AI Cleanup) — that page tracks the same tells across a much larger corpus of AI-generated prose, so it's a good source to revisit if new tells emerge that aren't covered here yet.

The goal isn't just "not obviously AI" — it's text that reads like an experienced SEO/copywriting specialist wrote it: confident, specific, willing to make a judgment call, not neutrally listing facts.

## How to use this skill

1. Read the full draft provided by the user.
2. Walk through the Voice section and sections 1-3 below against the draft, in order.
3. Report findings back to the user grouped by issue (not line-by-line), with real quotes/examples pulled from the specific draft wherever possible.
4. If the user wants to send corrections to Maintouch, produce copy-paste-ready correction prompts — generic instructions work, but citing the actual offending sentence gets better fixes. Number them so they're easy to reference.
5. Offer (don't force) to also draft the fix directly (e.g. rewrite a section, add a missing table) rather than only flagging it.
6. **For a full-piece rewrite (not a targeted fix), run the self-critique pass** described near the end of this file before presenting the final version — it catches tells that survive a first pass because they're locally fine but collectively still read as AI-written.

### Using this skill as the r2d2 reviewer-site "humanizer" pass

When invoked as part of `create-reviewer-site.md` (new site build) or as a
standalone request to clean up an existing r2d2 site's homepage/company
copy, skip step 4 (Maintouch correction prompts don't apply — there's no
external draft tool in the loop) and go straight to applying fixes directly
in the `.astro`/`.ts` source, the same way step 5 already allows.

**Invoke this skill once per site build, not once per phase.** A skill
invocation loads this entire file into context; re-invoking it later in the
same session to "re-check" a second batch of prose just reloads text that's
already there. `create-reviewer-site.md` Phase 0d loads it once, up front —
Phase 2 (company data) and Phase 4f (homepage prose) then apply sections
1–3 below from memory rather than re-invoking. Only re-invoke mid-session if
the earlier context (including this checklist) has plausibly been
summarized/compacted away, or if this is a standalone cleanup request in a
fresh session that never loaded it.

Scope of what to check on a reviewer site:

- `src/pages/index.astro` — hero copy, quick-answer box, SEO PROSE 1/2/3,
  "How we selected"/"How this list was compiled" sections, FAQ answers
- `src/data/companies.ts` — `description`, `tagline`, `bestFor`,
  `primaryDifferentiator`, `pros`, `cons` for any company whose entry was
  just written or edited
- `src/pages/companies/[slug].astro`, `comparisons/[slug].astro`,
  `alternatives/[slug].astro` if their template prose (not just data
  interpolation) was hand-edited

After fixing, rebuild (`npm run build`) and re-run the grep checks in
`create-reviewer-site.md` Phase 5 that overlap with this checklist (title
length, `..`/`....` artifacts, banned-word scan) to confirm nothing broke.

---

## Voice: write like a specialist, not a neutral AI

Avoiding AI patterns is only half the job. Text that is technically "clean" of every banned phrase below can still read as soulless — and soulless is its own tell. Good copy has a point of view behind it.

**Signs of soulless-but-clean writing:** every sentence is the same length and shape; nothing is ever framed as a trade-off, only a feature; no acknowledgment that two things are in tension; reads like a neutral summary rather than someone with domain judgment weighing in.

**How to write with a specialist's voice on review-site copy** (adapted for third-person editorial content — there's no first-person "I" on these sites, but the same underlying moves apply):

- **Take a position, don't just list.** "A firm that reaches for the same stack on every project is optimizing for its own familiarity, not your product" is more useful than neutrally stating what the stack options are.
- **Vary your rhythm on purpose.** Short, blunt sentences next to longer ones that take their time. Don't let every sentence in a paragraph be the same length.
- **Name the trade-off instead of smoothing it over.** "This is a real advantage, but only for X kind of buyer" beats a sentence that only lists the advantage.
- **Address the reader directly where the site already does this** (second person "you"/"your," direct questions) rather than converting everything to abstract third-person description — that's already this project's established voice, keep leaning into it rather than flattening it out.
- **Let a little unevenness in.** Perfectly symmetrical paragraphs (each one the same length, same internal shape) read as generated. A shorter paragraph next to a longer one is normal for a human writer.
- **Be specific about the actual concern, not the abstract category.** Not "pricing can be complex" but "pricing swings by whether PCB design is in scope, not just by vendor size."

---

## 1. Structure & formatting rules

1. Provide a meta title and meta description.
2. Include illustrations, screenshots, or graphics to support key points where possible.
3. Include at least 3 comparison tables per article.
4. Use main keywords in the title, H1, and where possible in H2s. Use secondary keywords at least once in body text.
5. Answer first, explain second — put the answer in the first sentence of a section, not after setup, background, or context.
6. Write every H2/H3 as a real search query a person would type ("What is X?" / "How do I Y?" / "Best Z for A?"). If a heading wouldn't work typed into Google, rewrite it.
7. Every section must make sense read in isolation. Don't rely on "as mentioned above" or assume the reader remembers the previous section.
8. Ground every claim in data: cite statistics with their source and year, or remove the claim. Open time-sensitive claims with "As of 2026...".
9. Don't add month/year to headings, except in listicle/review articles.
10. Body headings (H2/H3) use sentence case, not Title Case (e.g. "What makes a good provider?" not "What Makes A Good Provider?") — AI chatbots default to capitalizing every main word. **Exception:** on r2d2 reviewer sites, the homepage `<title>`/`<h1>` intentionally uses Title Case per SEO convention (see the template `CLAUDE.md` gotcha on this) — that one spot is deliberate, don't "fix" it. This rule targets body H2/H3s and general article headings.
11. Use straight quotes (`"..."`) and apostrophes (`'`), not curly/smart quotes (`"..."`/`'`) — a quick mechanical tell if text was pasted from a chat UI.
12. **Expand every non-obvious acronym on its first use per page: "Full Term (ACRONYM)," then the acronym alone afterward.** This applies within major prose blocks (paragraphs, FAQ answers) — not required inside tables or short "Short answer:" table lead-ins, where space is tight and the term is usually inferable from the table's own column header. Track first use by reading order top-to-bottom on the page, not per-section — a term expanded once in an early paragraph doesn't need re-expanding in a later FAQ answer. Common exceptions that don't need expansion (broadly known outside any niche): AI, PDF, URL, USA, CEO, ID, IT, ISO. Niche-specific acronyms almost always need it even if they feel obvious to someone in the industry — the reader landing on this specific page via search may not be a specialist. Confirmed 2026-08-22: an embedded-software review site used "RFP" (Request for Proposal) more than 10 times across its homepage without ever spelling it out once, on a site whose entire positioning is procurement/RFP-framed content for buyers who may not live in that vocabulary daily.

## 2. Banned words and phrases

- leverage, seamlessly, cutting-edge, robust, innovative, layer, pipeline — name the specific action or attribute instead
- empower, unlock, transform, revolutionise, supercharge — name the actual outcome instead
- "in today's fast-paced/rapidly evolving landscape" — remove, start with the finding directly
- "it's worth noting," "it is important to note," "delve into," or near-variants like "worth mapping/modeling" — cut the filler, state the point
- "our team of experts," "passionate team," "we strive to" — name the team/role/credential or remove
- state-of-the-art, best-in-class, world-class — name the specific advantage instead
- "studies show," "experts agree," "research suggests," "industry reports," "observers have cited/noted" without a named, citable source — name the study, institution, and year, or remove
- at scale, tailor-made, holistic, end-to-end — describe the actual scope specifically
- em dash (—) anywhere — use en dash (–), colon, semicolon, or full stop
- "this is where X comes in" — don't use
- "Actually," "Really" in headings — don't use
- "roster" — never use; name the specific noun instead ("the list," "the 29 companies reviewed," "the companies on this page")
- "sits at" (e.g. "sits at the intersection of") — avoid; state the relationship directly ("combines," "spans," "overlaps with")
- "shop" meaning "company"/"firm" (e.g. "a boutique shop," "an embedded Linux shop") — don't use; say "company," "firm," "vendor," or "team"
- "shortcut" — don't use; name the specific thing being skipped, simplified, or shortened instead
- "Additionally," "crucial," "enhance," "fostering," "garner," "highlight" (as a verb), "interplay," "intricate/intricacies," "key" (as a vague intensifying adjective — "a key role," not a literal key), "landscape" (as an abstract noun — "the competitive landscape"), "showcase," "tapestry" (abstract noun), "testament," "underscore" (verb), "valuable," "vibrant" — these co-occur far more in AI text than human text; name the specific thing instead
- Significance-inflation language: "stands/serves as," "is a testament/reminder," "plays a vital/significant/crucial/pivotal/key role," "underscores/highlights its importance," "reflects broader," "symbolizing its enduring/lasting," "contributing to the," "setting the stage for," "marking/shaping the," "represents/marks a shift," "key turning point," "focal point," "indelible mark," "deeply rooted" — these puff up the importance of an ordinary fact; state the fact plainly instead
- Promotional/travel-brochure language: "boasts a," "rich" (figurative, e.g. "rich heritage"), "profound," "exemplifies," "commitment to," "nestled," "in the heart of," "groundbreaking" (figurative), "renowned," "breathtaking," "must-visit," "stunning" — describe the actual attribute, not a vague superlative
- Persuasive-authority framing: "the real question is," "at its core," "in reality," "what really matters," "fundamentally," "the deeper issue," "the heart of the matter" — these usually just restate an ordinary point with extra ceremony; cut the framing and state the point
- Signposting/tutorial-script phrases: "let's dive in," "let's explore," "let's break this down," "here's what you need to know," "now let's look at," "without further ado" — don't announce what you're about to do, just do it
- Extended filler: "in order to" → "to"; "due to the fact that" → "because"; "at this point in time" → "now"; "in the event that" → "if"; "has/have the ability to" → "can"
- Chatbot/collaborative artifacts (mainly relevant when cleaning up a pasted AI draft, not fresh writing): "I hope this helps," "Of course!," "Certainly!," "You're absolutely right!," "Great question!," "Would you like...," "let me know," "here is a...," "as of [my knowledge cutoff]," "while specific details are limited/scarce" — strip entirely, these are chat-turn residue, not content
- Generic Title Case in body headings — see section 1, rule 10
- Generic template section headers, and any paraphrase of them — including "Real-World Use Cases," "The Challenges of X," "The Limitations of X," "Practical Applications," "Where This Falls Short," "Final Thoughts," "Key Takeaways," "Challenges and Legacy," "Future Outlook." Every heading must come from what that specific section argues, not a listicle skeleton — and must still follow rule 6 (real query).

## 3. AI-generated writing patterns to eliminate

1. **Remove fabricated statistics and unverifiable claims.** Any specific number, benchmark, or anecdote (named F1/accuracy scores, "cut review time from three days to four hours," competitor benchmark comparisons) must have a real, named, citable source — or be deleted/rewritten as a general statement. Do not invent precision to sound authoritative.

2. **Break up rule-of-three/four list patterns.** Vary list length naturally — some pairs, some fives, some prose with no list at all. Don't force every grouping (list items, subsections, constraints, or even a run of nouns within one sentence — "innovation, inspiration, and industry insights") into neat parallel triads or quads just because it looks tidy.

3. **Cut forced internal-link clauses.** Remove tacked-on phrases like "a pattern also seen in...," "which connects to why...," "a key factor when assessing...," "worth mapping/modeling before you build" when they're grafted onto a sentence just to justify a link elsewhere. If a link is needed, work it into a sentence that would exist anyway.

4. **Cut aphoristic one-line closers and vague upbeat endings.** Remove punchy, quotable summary lines like "Your agent moves as fast as its data," "The tooling is there. How you wire it together is what matters," or "That's exactly where due diligence earns its cost." Also remove vague positive-conclusion filler ("the future looks bright," "exciting times lie ahead," "this represents a major step in the right direction") — if there's a real forward-looking fact, state it specifically (a real date, a real plan); if there isn't one, don't manufacture optimism. If a line sounds like a marketing pull-quote rather than something you'd say out loud to a colleague, replace it with a plain, specific statement or cut it.

5. **Reduce repetitive vocabulary — but don't over-correct into synonym cycling either.** Don't repeat the same key word or paired phrase (e.g., "structured," "layer," "signal vs. noise") more than 2-3 times across the whole piece. But also don't swap in a new synonym every single time the same entity is mentioned just to avoid repetition ("the protagonist... the main character... the central figure... the hero" — all one person). If something is the same thing, it's fine to call it by the same name twice in a row; reserve variation for when you're actually saying something new about it.

6. **Cut clipped sentence fragments used for emphasis.** (e.g., "Fast and cheap, and sufficient for simple factual lookups." "No scraping logic required on your end.") Write these as complete sentences integrated into the surrounding paragraph.

7. **Trim the FAQ section** so it adds new information rather than restating the body content nearly verbatim. If an FAQ answer just repeats an earlier section, cut or shorten it.

8. **Read-aloud test.** After writing or rewriting, reread each paragraph and ask: would a knowledgeable person actually say this out loud, in this order, with this rhythm? If a sentence sounds like a marketing aphorism, or a paragraph sounds like a template being filled in, rewrite it plainer.

9. **Don't dedicate a separate paragraph, section, or FAQ entry to self-promotion.** Mentioning the product (e.g. CatchAll/NewsCatcher) 1-2 times in relevant context is fine, but cut standalone self-promo blocks and product-focused headings, and don't build FAQ entries around the product or product-vs-competitor comparisons. Fold any necessary product mention into a sentence that would exist anyway.

10. **Vary sentence structure within lists, even when list length is fine.** A list can have an acceptable number of items (per rule 2 above) and still read as robotic if every bullet follows the identical template — e.g. "[Term]: [one-line definition]. [Prescriptive directive sentence]." repeated across 5+ consecutive items (SWOT analysis: asks X. Apply during Y. / Porter's Five Forces: measures X. Best suited to Y.). This includes the specific case of a bolded-label-then-colon vertical list where every item is really just one sentence split into a fake header ("**User Experience:** The user experience has been improved..." → fold into prose, or vary the shape). Fix by varying sentence shape item-to-item, or by converting a sequential list (steps in a process, stages in a cycle) into connected prose or a numbered flow instead of flat parallel bullets.

11. **Vary paragraph openers — don't let one formula repeat.** A common AI tell is opening most or all paragraphs with the same construction, e.g. "[Topic] matters more / deserves more scrutiny / varies more in X than in Y." Use that specific construction (or any near-equivalent "X matters more than Y" template) at most once across a whole piece. Open paragraphs differently: some with a direct claim, some with a question, some with a concrete example, some starting mid-thought.

12. **Vary paragraph endings — don't make every paragraph land on the same kind of imperative.** Another common tell is closing nearly every paragraph with a directive in the same shape ("Ask directly...," "Ask specifically...," "Request documentation..."). Keep that kind of prescriptive close in at most half the paragraphs it currently appears in, and phrase it differently each time — sometimes as a question, sometimes folded into the prior sentence instead of tacked on after it, sometimes dropped entirely in favor of just ending on the point itself.

13. **Vary sentence length and structure, including active/passive mix.** Mix short, blunt sentences with longer ones — don't let every sentence be a single long clause chained together with "and" or built around a colon. Some sentences should be plain, simple statements. Use passive voice where it's more natural instead of forcing every sentence into the same active-voice template (e.g. "the boundary is set by the vendor's SLA" reads more naturally than always "you should ask who sets the boundary").

14. **Kill cross-paragraph rhetorical-template repetition.** This is the paragraph-level version of rule 10's list-level fix. If the same rhetorical move — claim, then why it matters more here than elsewhere, then an exception, then a prescriptive ask — repeats in identical shape across every paragraph in a piece, break the pattern: collapse two paragraphs into one, split one into two with different internal logic, or restructure a paragraph entirely so it isn't running the same four-beat template as its neighbors.

15. **Avoid copula avoidance — let "is/are" do the work.** AI writing habitually substitutes an elaborate verb for a plain "is/are/has": "Gallery 825 serves as LAAA's exhibition space" instead of "Gallery 825 is LAAA's exhibition space"; "the firm boasts 200 employees" instead of "the firm has 200 employees." "Serves as," "stands as," "marks," "represents [a]," "boasts/features/offers [a]" are the usual substitutes. Use the plain copula unless the elaborate verb is genuinely more precise.

16. **Cut negative parallelisms and tailing negations.** "It's not just about X, it's Y" and "Not only does it X, it Y's" are overused — state the point directly instead of setting up the negative frame first. Also cut clipped tailing-negation fragments tacked onto the end of a sentence instead of written as a real clause ("...the options come from the selected item, no guessing" → "...without forcing the reader to guess").

17. **Cut false ranges.** AI writing likes "from X to Y" constructions where X and Y aren't actually two ends of one meaningful scale ("from the birth of stars to the enigmatic dance of dark matter" — these aren't a range, they're a list dressed up as one). If two things aren't genuinely endpoints of the same axis, list them plainly instead of forcing a "from...to..." frame.

18. **Name the actor instead of dropping it in a fragment.** Distinct from rule 13 (which is fine with natural passive voice for rhythm) — this is about fragments and fake-terse sentences that omit the subject entirely to sound punchy: "No configuration file needed," "Results are preserved automatically." Usually clearer as "You don't need a configuration file" / "The system preserves the results automatically" — name who or what is doing the thing.

19. **Don't mechanically bold every defined term.** AI chatbots bold phrases on autopilot, especially first-mention terms and list labels. Reserve bold for genuine emphasis, not as a tic applied to every technical term or every list item's lead phrase.

20. **Cut fragmented headers.** A heading immediately followed by a one-line paragraph that just restates the heading before the real content starts ("## Performance / Speed matters. / When users hit a slow page, they leave.") is padding — cut the restatement and go straight to the real content. **This is not the same as this project's "answer first" rule (section 1, rule 5)** — a "Short answer: [the actual answer]" line right after a heading is real content, not a restatement of the heading; that pattern stays.

21. **Don't cram a meta-claim, a definition, and a rhetorical question into one sentence.** A tell that survives even careful rule-by-rule editing: "The [abstract noun] that actually predicts/determines/matters is [X]: [X reworded as a yes/no question]?" — e.g. "The evaluation question that actually predicts delivery quality is ownership boundary: does the vendor own hardware and firmware together, or does the engagement stop at software?" This announces its own importance, defines the term, and re-asks it as a question, all in one breath — it sounds analytical but is really just doing three jobs badly instead of one job well. Split it: state the question or claim plainly ("Ask whether the vendor owns hardware and firmware together, or whether the engagement stops at software."), and if the significance genuinely needs a sentence of its own, give it one, separately and briefly.

22. **Don't stack an inflated superlative with a stock idiom.** "[Metric] is the single most useful proxy on this page for X, and it cuts both ways" pairs an inflated superlative ("the single most useful proxy") with a cliché hedge idiom ("cuts both ways," "a double-edged sword," "it's a trade-off"). Either move alone is fine in moderation; stacked together in one sentence they read as manufactured insight rather than an actual claim. State the real trade-off directly instead ("Team size predicts a lot about how a firm behaves, for better and worse") or just describe both sides without reaching for the idiom.

23. **Never use the "X, not Y" contrastive appositive construction.** A noun phrase followed by a comma, "not," and a contrasting noun phrase — either interrupting a sentence ("that handoff, not the initial estimate, is where schedules slip") or tacked onto the end ("verifiable signals, not marketing claims") — is easy to reach for repeatedly without noticing, and it reads as a stock rhetorical move the moment it shows up more than once on a page. Confirmed 2026-08-22: a single homepage used this construction 8+ times across its major prose blocks before anyone noticed the pattern, not just the one instance the user originally flagged. Restructure instead: use "instead of"/"rather than" as a subordinating phrase, split into two independent sentences, or state the point as a direct positive claim without naming the rejected alternative at all. **Vary which fix you use** — mechanically swapping every ", not X" for "rather than X" just trades one repeated tic for another.

24. **Don't reach for a rare or informal single word when a plainer, more common one says the same thing.** Words like "punt" (for "defer," "hand off," "give up on it") can sound like a writer straining for color or casualness, and they sit oddly next to otherwise neutral, professional prose — the register mismatch itself reads as unnatural, even though rare-word usage isn't a typical "AI tell" the way filler phrases are (if anything, an AI is more likely to default to bland corporate vocabulary than a colorful rare word — this is a plain writing-quality issue, not specifically an AI-detection one, and the humanizer checklist covers it because good copy needs both). If a word would make a reader pause to parse it, or feels like slang dropped into otherwise formal copy, use the plainer synonym.

Also worth a standing check on any content this skill touches: watch for hyphenation applied with unnatural consistency across common word pairs (third-party, cross-functional, client-facing, data-driven, decision-making, well-known, high-quality, real-time, long-term) — AI hyphenates these uniformly every time, where a human writer is inconsistent about it. Uniform hyphenation across a whole piece is itself a tell, even for pairs that are individually fine to hyphenate once.

---

## Self-critique pass (recommended for full-piece rewrites)

For a targeted single-sentence fix, skip this — it's overkill. For a full section or full-page rewrite, run one extra pass before calling it done:

1. Reread the draft as if you're seeing it fresh.
2. Ask yourself: "What makes this still obviously AI-generated?" Answer briefly, in bullets — be honest about what's still off, even if every individual rule above technically passed. Common survivors: rhythm that's still too evenly paced, transitions that are too clean, a closer that's still slightly slogan-y, paragraphs that are all suspiciously the same length.
3. Revise specifically against what you just found, then move on — this isn't a loop to repeat indefinitely, one pass is enough to catch what a rule-by-rule check misses.

---

## Updating this checklist

If the user asks to add, remove, or edit a rule in this checklist (in this skill or in the standalone instructions doc), edit the relevant numbered section directly, keep the existing numbering/style conventions, and confirm the change with the user before considering it final.

**Whenever you add a new banned word/phrase or pattern to this checklist,
immediately re-sweep any content already written or reviewed under the old
version of the checklist — in this session, and on any live site the
current conversation has already touched — for the specific new
term(s).** Extending the list only changes what gets caught going forward;
it does nothing for text that already exists. Confirmed 2026-08-22: "roster,"
"sits at," "shop," and "shortcut" were added on 2026-08-21 immediately after
this skill was used to rewrite top-embedded-software-companies.com's
homepage — but that same homepage was never re-checked against the newly
added terms, so all four survived untouched in text written minutes
earlier, until the user found "sits at" via a live screenshot the next day.
The fix at the time: `grep -noiE "\broster\b|\bsits? at\b|\bshortcut\b|\bshop\b"
<file>` against every file this session already ran the humanizer pass on,
immediately after editing this checklist — not as a separate later task.
This is a session-scoped step you do yourself; it does not, and cannot,
retroactively fix already-published sites from *before* this skill existed
or from prior sessions — that requires an explicit portfolio-wide sweep,
which is a separate, larger action to confirm with the user rather than run
unprompted (see `create-reviewer-site.md` gotcha 31 in the template
`CLAUDE.md` for the full incident writeup).

**2026-08-21:** Added banned terms "roster," "sits at," "shop" (meaning company/firm), and "shortcut" to section 2, per explicit user request after using this skill to rewrite top-embedded-software-companies.com's homepage. Also adopted as the standard "humanizer" pass for all r2d2 reviewer-site content generation — see `create-reviewer-site.md` for wiring.

**2026-08-22 (morning):** Added rules 11-14 to section 3 (vary paragraph openers, vary paragraph endings, vary sentence length/structure including active/passive mix, kill cross-paragraph rhetorical-template repetition), plus a new example on rule 4 and sharper wording on rule 8, per a rewrite-instructions sample the user supplied. These four rules are the paragraph/sentence-level counterpart to rule 10, which already covered the same "identical shape repeated" tell at the list-item level. Per the re-sweep rule directly above, this update itself did not require a re-sweep of already-shipped sites — rules 11-14 describe patterns (repeated paragraph openers/closers, monotone sentence structure) rather than literal greppable strings, so there's no mechanical check to re-run; catching pre-existing instances of these patterns on already-shipped sites requires a full re-read, not a grep, and hasn't been done as part of this update.

**2026-08-22 (afternoon):** Renamed the skill from `ai-writing-checker` to `humanizer` (user's preferred name, easier to recall — canonical file renamed from `ai-writing-checker.md` to `humanizer.md`, symlink moved from `~/.claude/skills/ai-writing-checker/` to `~/.claude/skills/humanizer/SKILL.md`, all references in `create-reviewer-site.md`/`CLAUDE.md`/memory updated). Merged in a large batch of patterns from a separate personal project's humanizer prompt (`~/PycharmProjects/humaneditor/humanizer-prompt`, itself based on Wikipedia's "Signs of AI writing" / WikiProject AI Cleanup): a new "Voice" section (adapted for third-person editorial review-site copy rather than first-person blogging — the source's original framing), 11 new patterns in section 2/3 (copula avoidance, negative parallelism/tailing negations, elegant variation as the flip side of repetitive-vocabulary, false ranges, dropped-actor fragments, mechanical over-bolding, fragmented headers, significance-inflation language, promotional/travel-brochure language, persuasive-authority framing, signposting phrases), a hyphenation-consistency check, sentence-case-headings + straight-quotes mechanical checks, and a recommended self-critique pass for full-piece rewrites. Deliberately left out of the merge: the source's "Voice Calibration" section (matching a user-supplied personal writing sample) — not applicable here, there's no single personal voice to match across a multi-site editorial portfolio; and its full worked example at the end — the principle is captured in the self-critique pass above without reproducing a long standalone example.

**2026-08-22 (evening):** Added section 1 rule 12 (expand non-obvious acronyms on first use per page) and section 3 rules 21-22 (don't cram a meta-claim + definition + rhetorical question into one sentence; don't stack an inflated superlative with a stock idiom like "cuts both ways"), after the user flagged three live examples in one message: an "RFP"-framed site that never once spelled out RFP across 10+ uses, "The evaluation question that actually predicts delivery quality is ownership boundary: does the vendor own X or Y?", and "Team size is the single most useful proxy on this page for how a firm will actually behave, and it cuts both ways." All three fixed directly (across `best-embedded-software-development-companies.com`, `top-embedded-software-development-agencies.com`, `best-embedded-development-services.com`), plus a same-page acronym sweep on each (RFP, RFI, PCB, RTOS, FPGA expanded on true first use — tracked by page reading order, not per-section, and skipping table/short-answer contexts per the existing scope convention). Note for next use: rules 21-22 and the acronym rule are pattern/context-dependent, not literal-string greppable in a low-false-positive way, so there's no Phase 5 mechanical backstop for them — same limitation as rules 11-14, catching them requires an actual read.

**2026-08-23:** Added section 3 rules 23-24 (never use the "X, not Y" contrastive appositive construction; don't reach for a rare/informal word like "punt" over a plain common one), after the user reviewed the rules-21/22 fixes on `best-embedded-software-development-companies.com` and flagged both issues in the same paragraph. Checking the full page turned up 8+ instances of the "X, not Y" pattern, not just the one the user quoted — all rewritten, deliberately varying the fix (instead of/rather than/splitting into two sentences/restating as a positive claim) so the fix itself didn't become a new repeated tic. This is the second time in two days a rule got added only after a full-page grep showed the flagged instance wasn't isolated (see the acronym-expansion incident above) — worth remembering that a single flagged sentence is often a symptom, not the whole bug, and checking the rest of the page for the same construction should be the default response, not an afterthought.
