# SEO Expansion Strategy — games.newyono-apps.in

**Scope:** 90 game pages, 7 category hubs, directory, home, 6 info pages (106 total).
**Brand:** New Yono Apps · **Head term:** `yono games` · **Market:** India (`en-IN`)

---

## 0. Read this before anything else — three limits on what follows

These are stated up front because they change what parts of this plan are actionable today.

### 0.1 The reference site could not be crawled

`moreyonogames.com` sits behind Cloudflare bot protection. Every automated request — page,
`sitemap.xml`, `sitemap_index.xml`, `wp-sitemap.xml` — returned **403 Forbidden**. Only
`robots.txt` resolved (200), and it disclosed the WordPress convention plus a sitemap URL that is
itself blocked.

So §1 below is **structural inference**, assembled from that `robots.txt`, from SERP metadata, and
from three sibling Yono directories that are reachable and organised the same way. It is a
reasonable blueprint. It is **not** a crawl, and no claim in it should be treated as verified. If
you want a real competitor audit, run it from a browser session or a tool with residential egress
and hand me the export.

Nothing was copied from that site. Structure was studied; no text, markup or metadata reused.

### 0.2 Your site is not live, so it was audited at source

There is nothing serving at `games.newyono-apps.in` yet. Rather than skip §2, I audited the built
repo directly — which is strictly better than a crawl, since I can see the generator, the data
layer and every template. The inventory in `seo/data/url-inventory.csv` is generated from the
actual rendered HTML of all 106 pages.

### 0.3 The per-game content in §6 cannot be written from what we hold

This is the important one.

Your §6 asks every game page to carry unique *What Is / How to Play / Features / Gameplay / Guide /
Tips / Mobile / Updates* sections. Producing that for 90 apps would require knowing each app's
mechanics, modes, feature set, device requirements and update history.

**We hold none of it.** `data/games.json` carries a name, a category and artwork. Bonus, version,
file size, rating and download count are all `null` — deliberately, because the public directories
contradict each other (the same title appears at ₹51, ₹320 and ₹1,500 across three sources).

Writing those sections anyway would mean inventing gameplay for 90 apps. Your own brief forbids
exactly that, in §7 ("never generate meaningless SEO filler"), §11 ("do not generate hundreds of
pages with nearly identical paragraphs") and §24 ("never create misleading claims"). Following §6
literally would require breaking §7, §11 and §24.

**So this document delivers the system, not the prose.** Framework, keyword clusters, entity map,
internal-link engine, metadata, schema and technical fixes are all built and applied. The per-game
body copy is specified as a research brief — `seo/data/entity-map.csv` marks **810 entity slots
across the 90 games as `NEEDS SOURCE`**, which is the precise shopping list. Fill those from the
app listings themselves and the content writes itself honestly.

> **Also still open:** the compliance blocker in `BUILD-PROMPT.md` §9. You answered "real-money
> apps = Yes", which collides with India's Promotion and Regulation of Online Gaming Act, 2025.
> Promotional copy is gated on that regardless of research. Both gates must lift before game-page
> copy ships.

### 0.4 One more thing this plan does not contain

**No search volumes, no keyword difficulty, no traffic estimates.** I have no keyword-tool access.
Every keyword in the universe is marked `validated=NO`. Treat the clusters as *candidate* terms
grouped by intent — a structure to validate, not a prioritised list. Run them through a real tool
before committing effort.

---

## 1. Reference-site architecture blueprint *(inferred — see §0.1)*

| Dimension | Observed / inferred | What we do differently |
|---|---|---|
| Platform | WordPress (`/wp-admin/`, `sitemap_index.xml` in robots.txt) | Static generation — no plugin bloat, no render-blocking theme CSS |
| URL pattern | Flat root slugs, `/<game-name>/`, trailing slash | `/games/<slug>.html` — see §12 open decision |
| Page types | Home, per-game pages, a "new games" hub, blog/guides, about/contact/disclaimer | Same, plus 7 **category hubs** they appear to lack |
| Category depth | Weak — titles appear to sit flat under home | Explicit taxonomy: home → 7 hubs → 90 games |
| Title pattern | `<Game> (Yono) Download APK & Get ₹<bonus> Yono Games` | No bonus figures in titles. Unverifiable, and a compliance risk under §9 |
| Meta pattern | Bonus-led, repetitive across pages | Unique per page, 145–155 chars, category-differentiated |
| H1 | Game name, often with bonus/download modifier | `<Game> — <Category> App Details` |
| Content depth | Thin-to-moderate per game, heavy template reuse | Depth gated on real research (§0.3) rather than padded |
| Internal linking | Hub-and-spoke from home; sibling links inconsistent | Full matrix, 2,105 edges, every page ≤2 clicks from home |
| Breadcrumbs | Not consistently present | Present sitewide with `BreadcrumbList` schema |
| FAQ | Present on some game pages | Framework ready; content gated on research |
| Schema | `MobileApplication` with ratings/bonus offers | `SoftwareApplication` **without** fabricated `aggregateRating`/`offers` |
| Entity coverage | Game → bonus → download | Game → category → platform → mechanics → requirements → guides |

**The structural gap worth exploiting:** these directories compete on bonus numbers in titles and
metas. Those numbers are unverifiable, mutually contradictory across sites, and legally exposed in
the current Indian regime. A directory that competes instead on *accurate, structured, genuinely
useful app information* has a defensible position they cannot easily copy.

---

## 2. Site audit — current state

Full inventory: **`seo/data/url-inventory.csv`** (106 rows, every column your §2 requested).

| Metric | Value | Status |
|---|---|---|
| Total pages | 106 | — |
| Indexable | 12 | By design — copy gate |
| `noindex` (copy pending) | 94 | 90 games + 3 legal shells + 404 |
| Broken internal links | **0** | PASS |
| Missing asset references | **0** | PASS |
| Duplicate titles | **0** | PASS |
| Duplicate meta descriptions | **0** | PASS |
| Missing H1 | **0** | PASS |
| Pages with ≠1 H1 | **0** | PASS |
| Images missing ALT | **0** | PASS |
| Invalid JSON-LD | **0** | PASS |
| Fabricated `aggregateRating`/`offers` | **0** | PASS |
| Titles >60 chars | **0** | PASS |
| Descriptions outside 145–155 | **0** | PASS |
| Orphan pages | 1 (`/404.html`) | Correct — 404s should not be linked |
| Pages with <2 inbound links | **0** | PASS |
| Max crawl depth from home | **2** | PASS |
| Internal link edges | 2,105 | — |
| CSS / JS weight | 15 KB / 5.6 KB | No libraries |

### Findings

**CRITICAL — none.** No broken links, no duplicate metadata, no fabricated structured data.

**HIGH — thin content, already contained.** 103 of 106 pages are under 300 words; 90 are game
pages at a ~248-word median. This is the doorway-page risk your §11 warns about. It is currently
**neutralised** — every thin page carries `meta robots noindex,follow` and is excluded from
`sitemap.xml`, so the set cannot be indexed before it has substance. The gate is one flag
(`COPY_APPROVED` in `tools/build-pages.js`). **Do not flip it until the pages have real content.**

**MEDIUM — keyword cannibalisation risk, pre-empted.** Head terms are assigned exclusively: `yono
games` → home, `yono games download` → directory, `yono <category>` → hub, `<game name>` → game
page. No two pages target the same term. Enforced in `seo/data/keyword-universe.csv` via the
`url` column; re-run the check whenever pages are added.

**MEDIUM — category descriptions were thin.** Found during this pass: several read as bare labels
("Bingo titles."). Rewritten as substantive, factual descriptions of each format — fixed in
`data/games.json`, now flowing into hub pages, hub metas and the directory.

**LOW — `Terms & Conditions`** is the one title carrying `&amp;`. Intentional and correct.

---

## 3. Keyword universe

**`seo/data/keyword-universe.csv` — 1,736 rows.** Columns: `slug, url, game, category, primary,
tier, keyword, intent, placement, validated`.

Per game: 1 primary (the name), 8 secondary (`app`, `game`, `download`, `apk`, `online`,
`android`, `latest version`, `login`), 8 long-tail question forms (`what is`, `how to play`, `how
to download`, `is X safe`, `app details`, `supported devices`, `beginner guide`, `game guide`), and
2 category modifiers. Plus 5 site-level head terms and 21 category terms.

Patterns are applied only where honest for the title. Nothing is manufactured to hit a count, per
your §3. Every row is `validated=NO` — see §0.4.

**Placement map (your §8):**

| Tier | Placement | Rule |
|---|---|---|
| Primary | H1, title, first 100 words | Once naturally. Never repeated for density |
| Secondary | Relevant H2, spec table, body | Only in the section it actually describes |
| Long-tail | FAQ question or subsection heading | Question form, answered directly |
| Modifier | Body prose, hub context | Never in the title |
| Entity | Body prose | Natural language, not exact-match |

---

## 4. Semantic entity map

**`seo/data/entity-map.csv` — 1,260 rows** (14 entities × 90 games).

| Status | Count | Meaning |
|---|---|---|
| `known` | 450 | Derived from data we hold — category, platform, distribution, brand family, market |
| `NEEDS SOURCE` | **810** | Genre, mechanics, modes, developer, publisher, version, file size, requirements, update history |

That 810 is the exact gap between today's pages and the pages your §6 describes. It is a concrete,
finite research task — 9 fields × 90 apps — not an open-ended writing job.

Relationship model per game:

```
Game ──isPartOf──→ Category ──isPartOf──→ Directory
 │
 ├─ operatingSystem → Android
 ├─ audience        → India
 ├─ brandFamily     → Yono app family
 ├─ genre           → NEEDS SOURCE
 ├─ describes       → gameplay mechanics        NEEDS SOURCE
 ├─ hasPart         → game modes                NEEDS SOURCE
 ├─ requirements    → device requirements       NEEDS SOURCE
 └─ related         → 4 same-category siblings
```

---

## 5. Homepage blueprint

| Element | Value |
|---|---|
| Title | `Yono Games List — 90 Apps by Category \| New Yono Apps` (52) |
| Meta | 145–155 chars, category-led, no bonus claims |
| H1 | Every Yono game, in one directory |
| Primary | `yono games` |
| Secondary | `yono games list`, `all yono games` |
| Schema | `WebSite` + `Organization` |

Semantic hierarchy: H1 (head term) → lede (count + category span) → stat row (90 / 7 / 57) → H2
*Browse by category* → 7 hub cards each with count, label and factual description → independence
notice. Keywords land in headings, card anchors and ALT text — never stacked in one paragraph.

**Gap vs. your §5:** Featured / Latest / Popular sections and homepage FAQs are not built. They
need editorial signals (which games are featured? what makes one popular?) that we don't hold.
Ranking by roster position would be arbitrary. Specify the signal and I'll build them.

---

## 6. Category hub blueprint

Seven hubs: Rummy (26), Slots & 777 (35), Teen Patti & VIP Club (7), Arcade & Casual (13),
Multi-Game Platforms (6), Bingo (2), Ludo & Board (1).

Each carries a unique title (`Yono <Category> — N Apps Listed`), a 145–155 char meta, an H1, a
factual explanation of what the format *is*, the full card grid, and `CollectionPage` + `ItemList`
+ `BreadcrumbList` schema.

Per your §10 these are explicitly **not** thin lists — the format explanation is the differentiator
and was rewritten this pass. Hub FAQs and related-category links remain to be added once the
category-level research exists.

> **Ludo & Board holds one title.** A one-item hub is weak. Either merge it into Arcade & Casual,
> or add the Ludo titles that exist in the wider Yono family. Your call — I won't invent entries.

---

## 7. Game-page template

Live structure: breadcrumb + schema → logo (`<picture>`, real dimensions, descriptive ALT) → H1
`<Game> — <Category> App Details` → category pill → spec table (**null rows omitted entirely**) →
4 related siblings → hub link.

Sections from your §6 that are **framework-ready but ungated content**, each blocked on the 810
`NEEDS SOURCE` fields:

| Section | Blocked on |
|---|---|
| What Is `<Game>` | genre, mechanics |
| How to Play | rules, objective |
| Features | verified feature list |
| Gameplay | modes, progression, interface |
| Game Guide / Tips | mechanics knowledge |
| On Mobile | device requirements |
| Updates | verified version history |
| FAQ (5–10) | all of the above |

**Anti-duplication rule (your §11):** the template is layout only. Uniqueness must come from
per-game research, not from rotating synonyms through a fixed paragraph. Before publishing, run an
n-gram similarity check across the 90 bodies; anything above ~70% shared shingles is spun content
and fails.

---

## 8. Internal linking engine

**`seo/data/internal-links.csv` — 628 planned edges**; 2,105 actually rendered (nav and footer
multiply them).

| Relationship | Pattern | Count |
|---|---|---|
| home → hub | Category label anchor | 7 |
| home → directory | "Browse all games" | 1 |
| directory → game | Game name | 90 |
| hub → game | Game name | 90 |
| game → hub | "All `<Category>`" | 90 |
| game → sibling | Game name, same category | 360 |

Anchors are descriptive game and category names — no "click here", no exact-match stuffing.
Result: **0 orphans** (bar the 404, correctly), **0 pages under 2 inbound links**, **max depth 2**.

Remaining opportunity: no editorial cross-category links, because we have no basis for asserting
two games are similar beyond shared category. That basis is in the 810 missing fields.

---

## 9. Title & meta database

**`seo/data/title-meta.csv` — 99 indexable pages.** All unique, all titles ≤60, all descriptions
145–155. The formulas are implemented in `tools/build-pages.js`, so the database and the rendered
site cannot drift.

Two bugs were found and fixed while wiring this up:

1. **Ampersand escaping.** `esc()` renders `&` as `&amp;`, four characters longer than the string
   measured when building the title. Category labels like "Slots & 777" were silently pushing
   titles to 61–62 chars. Meta text now uses "and", so measured length equals rendered length.
2. **Mixed dash encoding.** The generator held both `—` escapes and literal `—`, so
   string patches matched inconsistently. Normalised to one representation.

---

## 10. Schema strategy

| Page | Emitted |
|---|---|
| Home | `WebSite` + `Organization` |
| Directory | `CollectionPage` + `ItemList` (90) + `BreadcrumbList` |
| Category | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| Game | `SoftwareApplication` + `BreadcrumbList` |
| Info | `BreadcrumbList` |
| FAQ | `FAQPage` — **withheld until real Q&A exists** |

**Deliberately absent:** `aggregateRating`, `ratingValue`, `ratingCount`, `offers`, `price`,
`Review`, `interactionStatistic`. We hold no verified values. Emitting invented ones is a
structured-data violation that risks manual action — your §15 and §24 both prohibit it, and the
audit confirms zero instances sitewide.

`softwareVersion` and `fileSize` are wired to render **only when non-null**, so they activate
automatically when you supply real data.

---

## 11. Technical SEO

**CRITICAL** — none outstanding.

**HIGH**
- Ship to HTTPS with HSTS; confirm a single canonical host (`games.` subdomain, no www variant).
- Serve `404.html` on a real 404 status, not 200.
- Resolve the `/games/` URL redundancy (§12) **before** launch — post-launch it becomes a 90-page redirect map.

**MEDIUM**
- Lighthouse not yet measured — no Chrome measurement harness configured here, so the ≥90 target is *unverified*, not met.
- Self-host WOFF2 with `font-display: swap`; currently no fonts are bundled, so the display face falls back to system.
- Downscale source logos to 256×256 (originals run to 1254×1254) and compress. Directory renders up to 90 at once.
- Add `icon-192.png`, `icon-512.png`, `favicon.ico` — referenced by the manifest, not yet supplied.

**LOW**
- Directory is one page with 90 cards — correct for now; revisit pagination only past ~200.
- Add OG images (`assets/img/og/`, 1200×630); currently `og:image` is absent.

**Already correct:** canonical on every page, clean `robots.txt` (`/data/`, `/tools/` disallowed),
valid sitemap with only indexable URLs, zero broken links, mobile-first CSS verified at 390px,
explicit image dimensions (CLS protection), lazy-loading below fold, WCAG AA verified across 11
colour pairs, no render-blocking third-party requests.

---

## 12. Open decisions

1. **URL structure.** Host is already `games.`, so pages read `games.newyono-apps.in/games/yono-rummy.html`. Flattening to `/yono-rummy.html` is one variable (`SITE.gamesDir`) **today** and a 90-page redirect map after launch. Recommend flattening now.
2. **Featured / Popular / Latest** — needs an editorial signal from you.
3. **Ludo & Board** single-title hub — merge or expand.
4. **The 33 games without logos** — shipping on placeholder per your earlier call.

---

## 13. Priority roadmap

| # | Action | Blocked on | Effort |
|---|---|---|---|
| 1 | Resolve the §9 compliance position | Indian gaming lawyer | — |
| 2 | Decide URL structure | You | Minutes |
| 3 | Fill the 810 `NEEDS SOURCE` fields | App listings research | Large |
| 4 | Validate keyword universe in a real tool | Tool access | Small |
| 5 | Write per-game copy from research | 1 + 3 | Large |
| 6 | Add FAQs + `FAQPage` schema | 3, 5 | Medium |
| 7 | Flip `COPY_APPROVED` → lifts noindex, adds 90 URLs to sitemap | 5, 6 | Trivial |
| 8 | Supply logos, OG cards, icons, fonts | You | Small |
| 9 | Lighthouse + Rich Results validation | 7 | Small |
| 10 | Supporting guides (topical authority) | 3 | Medium |

**Nothing downstream of step 1 should ship.** Steps 2, 4 and 8 can proceed in parallel now.

---

## 14. Topical authority map

```
Yono games (home)
├── Rummy (26) ──┬── individual titles
│                └── [future] how rummy formats differ
├── Slots & 777 (35)
├── Teen Patti & VIP Club (7)
├── Arcade & Casual (13)
├── Multi-Game Platforms (6)
├── Bingo (2)
└── Ludo & Board (1)
```

Supporting pages worth building **once research exists** — each only if it genuinely helps a reader:
format explainers per category, an APK sideloading safety guide, a device-requirements guide, a
glossary. Skip comparison pages until we can compare on facts.

---

## 15. What was implemented this pass

- Rewrote the title system: unique, intent-led, all ≤60, with graceful fallbacks
- Rewrote meta descriptions: all 99 indexable pages land in 145–155 without mid-word truncation
- Fixed the ampersand-escaping and dash-encoding bugs above
- Added a descriptive game-page H1 (`<Game> — <Category> App Details`)
- Expanded all 7 category descriptions from labels into factual format explanations
- Generated the four SEO data files below

URLs, functionality, design, assets and data structure were left untouched, per your §22.

## 16. Deliverables

| File | Rows | Contents |
|---|---|---|
| `seo/data/url-inventory.csv` | 106 | Full audit: type, title, meta, H1, word count, indexability, canonical, links, images, schema, status |
| `seo/data/keyword-universe.csv` | 1,736 | Keyword, tier, intent, placement, target URL, validation flag |
| `seo/data/entity-map.csv` | 1,260 | Entity, value, relationship, `known` / `NEEDS SOURCE` |
| `seo/data/internal-links.csv` | 628 | Source, destination, anchor, semantic relationship |
| `seo/data/title-meta.csv` | 99 | Title, length, description, length, H1 |
| `seo/build-seo-data.py` | — | Regenerates all five from `data/games.json` |

## 17. Pre-launch checklist

- [ ] §9 compliance position obtained in writing
- [ ] URL structure decided and frozen
- [ ] 810 `NEEDS SOURCE` fields filled
- [ ] Per-game copy written from research, n-gram similarity <70%
- [ ] FAQs written, `FAQPage` schema enabled
- [ ] Keyword universe validated against real volume data
- [ ] `COPY_APPROVED = true`, noindex lifted, sitemap regenerated
- [ ] Logos, OG cards, icons, fonts supplied
- [ ] Lighthouse mobile ≥90 on home, directory, game page
- [ ] Rich Results Test passed per page type
- [ ] 404 returns a real 404 status
- [ ] HTTPS + HSTS + single canonical host
- [ ] Still zero fabricated ratings, bonuses, counts or reviews
