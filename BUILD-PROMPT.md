# Build Prompt — Yono Games Directory (Green Edition)

**What this file is:** a complete, copy-paste-ready prompt for a coding agent (Claude Code or
equivalent) to build the site end to end. Fill in the `«FILL»` fields in §1 first, then paste the
whole file as your prompt.

**Reference:** `https://moreyonogames.com/` — a Yono games directory/listing site. Use it to
understand *what kind of site this is*: a discovery hub listing many Yono-family apps.

The build target is a **different domain**: `games.newyono-apps.in` (§1). Treat moreyonogames.com
purely as a genre reference. Write fresh headlines, body copy and FAQ answers, and build the green
design system in §4 rather than reproducing the existing layout.

> **Blocker on the brand mark.** `assets/img/icons/logo.jpg` has the text `moreyonogames.com`
> rendered into the image itself. Shipping it on `games.newyono-apps.in` would put a different
> domain in the site header on every page. Do **not** use it as the site logo, and do not try to
> edit the domain out of the artwork. Use a text wordmark built from `--font-display` until the
> owner supplies a clean logo. Flag this in your build report.

---

## 1. Inputs to fill in before running

| Field | Value |
|---|---|
| Domain | **`games.newyono-apps.in`** — canonical base `https://games.newyono-apps.in` (confirmed by owner) |
| Brand name | **New Yono Apps** |
| Primary keyword | **`yono games`** |
| Target market | India (`en-IN`) |
| Support email | `«FILL»` |
| Telegram / social URLs | `«FILL»` or "none" |
| Real-money gambling content? | **Owner answered Yes.** ⚠ See the blocker at the top of §9 before acting on this. |
| Launch date for `dateModified` | `«FILL»` |

> The owner answered **Yes — real-money apps**. That answer is on hold pending §9; do not write
> promotional copy on that basis until it is resolved. Support email, social URLs and the launch
> date are still `«FILL»` — ask rather than invent them.

---

## 2. Role and objective

You are building a **static, multi-page games directory site** — no frameworks, no build step.
Vanilla HTML5 + CSS3 + ES6. It must be fast on a low-end Android phone on 4G in India, fully
accessible (WCAG 2.1 AA), and structured so that each individual game page can rank on its own.

The site has three jobs:
1. Let a visitor find any one of ~90 Yono-family games fast (search + category filter).
2. Give each game its own indexable page with real, useful, original content.
3. Carry the compliance furniture an India-facing gaming site needs (§8).

---

## 3. Non-negotiables

- **No frameworks.** No React, no Tailwind, no jQuery, no bundler. Plain files served as-is.
- **No invented facts.** Bonus amounts, APK sizes, version numbers, ratings and download counts
  are `null` in `data/games.json` because they are not verified. Do **not** fill them with
  plausible-looking numbers. Render a field only when it has a value; hide the row otherwise.
  Public Yono directories disagree wildly on bonus figures — treating them as facts would be wrong.
- **No scraped copy.** Write every sentence fresh.
- **Mobile-first CSS.** Base styles, then `@media (min-width: 768px)`, then `(min-width: 1200px)`.
- **BEM-lite** class naming (`.block__element--modifier`). No `!important` outside resets.
- **UTF-8, LF line endings, 2-space indent** in HTML/CSS/JS.
- Every image gets explicit `width` + `height` and `loading="lazy"` below the fold.

---

## 4. Design system — green

A deep-forest base with an emerald/neon-lime accent. Not the reference site's look; this is its own
thing: dark glass-panel cards on a near-black green ground, a faint accent glow on interactive
elements, generous rounding, and colour used sparingly so ~90 game logos stay the loudest thing
on the page.

Visual direction:
- **Ground:** near-black green (`--color-bg`), with an optional very low-opacity radial accent glow
  behind the hero only. No busy background patterns anywhere else.
- **Cards:** `--color-surface` panels, 1px `--color-border`, `--radius-lg`, lift + accent glow on
  hover/focus. The game logo is the hero of each card — let it breathe.
- **Accent discipline:** accent green is for CTAs, active filter pills, focus rings and one or two
  stat highlights. Never for body text or large fills.
- **Category pills:** full-round (`--radius-full`) filter chips, horizontally scrollable on mobile.
- **Type:** condensed display face for headings, neutral sans for body. Self-host WOFF2 in
  `assets/fonts/`; `font-display: swap`.

Write this verbatim into `assets/css/tokens.css`:

```css
:root {
  /* Colour — green theme */
  --color-bg:             #0A1A0F;
  --color-surface:        #102018;
  --color-surface-2:      #163020;
  --color-accent:         #00C853;
  --color-accent-dim:     #009940;
  --color-text-primary:   #E8F5E9;
  --color-text-secondary: #81C784;
  --color-text-muted:     #4A7A50;
  --color-border:         #1E3A28;
  --color-error:          #FF5252;
  --color-success:        #00E676;

  /* Typography */
  --font-display: 'Exo 2', 'Nunito', sans-serif;
  --font-body:    'Inter', 'Roboto', sans-serif;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem;  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem; --text-4xl: 2.25rem; --text-5xl: 3rem;

  --line-height-tight: 1.2; --line-height-normal: 1.5; --line-height-loose: 1.75;

  /* Spacing — 4px base */
  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.25rem; --space-6: 1.5rem;  --space-8: 2rem;    --space-10: 2.5rem;
  --space-12: 3rem;   --space-16: 4rem;   --space-20: 5rem;

  /* Radius */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
  --radius-xl: 24px; --radius-full: 9999px;

  /* Elevation */
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(0, 200, 83, 0.25);
  --shadow-glow-strong: 0 0 40px rgba(0, 200, 83, 0.4);

  /* Z-index */
  --z-base: 0; --z-raised: 10; --z-nav: 100; --z-modal: 200; --z-toast: 300;

  /* Motion */
  --transition-fast: 150ms ease; --transition-normal: 250ms ease; --transition-slow: 400ms ease;

  /* Layout */
  --container-max: 1200px;
  --container-pad: var(--space-4);
}

@media (min-width: 768px) { :root { --container-pad: var(--space-8); } }
```

Required global rules: `.skip-link` (visible on `:focus`), `:focus-visible { outline: 2px solid
var(--color-accent); outline-offset: 3px; }`, and a `prefers-reduced-motion: reduce` block that
neutralises animation and transition durations.

**Contrast check:** verify every text/background pair against WCAG AA (4.5:1 body, 3:1 large text).
`--color-text-muted` on `--color-surface` is the risky pair — if it fails, lighten the token rather
than shipping it. On `--color-accent` fills, use near-black text, never white.

---

## 5. File structure

> **Raise before building — URL redundancy.** The host is already `games.`, so the paths below
> produce `https://games.newyono-apps.in/games/yono-rummy.html`, which says "games" twice. Flatter
> URLs (`/yono-rummy.html`, `/rummy.html`) read better and are marginally stronger for SEO. The
> structure below is kept as-is because it is unambiguous and easy to generate; if the owner prefers
> the flat version, moving the `games/` contents to the root is a mechanical change — the generator
> in §6 writes the paths and `sitemap.xml` from one variable. Ask, then commit to one and make every
> canonical, internal link and sitemap entry agree.


```
/
├── index.html                    ← Home
├── 404.html
├── sitemap.xml
├── robots.txt
├── manifest.json
├── favicon.ico
├── data/
│   └── games.json                ← canonical roster (already in repo — 90 games)
├── games/
│   ├── index.html                ← All Games directory (search + filter)
│   ├── rummy.html                ← category hubs (one per §6 category)
│   ├── slots-and-777.html
│   ├── teen-patti-and-vip-club.html
│   ├── arcade-and-casual.html
│   ├── multi-game-platforms.html
│   ├── bingo.html
│   ├── ludo-and-board.html
│   └── <game-slug>.html          ← one per game, 90 total
├── pages/
│   ├── about.html
│   ├── contact.html
│   ├── privacy-policy.html
│   ├── terms.html
│   ├── responsible-gaming.html
│   └── disclaimer.html
└── assets/
    ├── css/{reset,tokens,main}.css + pages/{home,directory,game}.css
    ├── js/main.js + components/{age-gate,cookie-consent,game-filter,faq-accordion}.js
    ├── fonts/                     ← self-hosted WOFF2
    └── img/{games,hero,icons,og}/ ← see §7
```

---

## 6. Game roster

The canonical roster is **`data/games.json`** in this repo: **90 games** across 7 categories.
(One name was corrected against the supplied artwork: *789 Jackpot* → **789 Jackpots**, slug
`789-jackpots`. The artwork is authoritative over the third-party directories the list came from.)
Read it and generate from it. Do not retype the list by hand and do not add or drop titles.

Each record has `slug`, `name`, `category`, `logo`, `logoFallback`, plus content and spec fields
that are empty/`null` until the owner supplies them.

Categories (`key` → hub page):

| key | Label | Hub page | Count |
|---|---|---|---|
| `rummy` | Rummy | `/games/rummy.html` | 26 |
| `slots` | Slots & 777 | `/games/slots-and-777.html` | 35 |
| `vip` | Teen Patti & VIP Club | `/games/teen-patti-and-vip-club.html` | 7 |
| `arcade` | Arcade & Casual | `/games/arcade-and-casual.html` | 13 |
| `bet` | Multi-Game Platforms | `/games/multi-game-platforms.html` | 6 |
| `bingo` | Bingo | `/games/bingo.html` | 2 |
| `ludo` | Ludo & Board | `/games/ludo-and-board.html` | 1 |

Because the site is static, generate the 90 game pages with a small one-off Node script
(`tools/build-pages.js`) that reads `data/games.json` and a template, writes the HTML files, and
also regenerates `sitemap.xml`. Commit both the script and its output — the served site stays
fully static.

### Directory page behaviour (`/games/index.html`)

- Render **all 90 cards in the HTML** at build time. Filtering is progressive enhancement over
  server-rendered markup — never JS-only, so crawlers and no-JS users see the full list.
- Client-side search box filtering on game name, plus category pills. Debounce input ~150ms.
- Use event delegation on the grid container; toggle a `hidden` attribute rather than rebuilding DOM.
- Announce result counts in an `aria-live="polite"` region ("Showing 26 of 90 games").
- Keep `<h1>` unique and the card titles as `<h3>` inside the grid.

### Per-game page template

Every game page needs, in order:
1. Breadcrumb (Home → Category → Game) with matching `BreadcrumbList` schema.
2. `<h1>` = game name. Logo image from `logo` with `logoFallback` in a `<picture>`.
3. A short original intro (60–90 words) describing the game type honestly.
4. A spec table — **render only rows whose value is non-null.** If every spec is null, omit the
   whole table rather than showing an empty shell.
5. "How to download and install" — a generic, accurate 4–5 step Android APK sideload explanation
   (enable unknown sources, download, open, install, launch). Same steps across pages is fine;
   this is genuinely generic procedure.
6. 4–6 original FAQ entries, with `FAQPage` schema. Vary the questions per category so the 90
   pages are not near-duplicates — this is the main thin-content risk in this build.
7. Related games: 4 cards from the same category, plus a link back to the category hub.
8. Compliance block per §8.

**Thin-content guard:** 90 pages from one template will be treated as doorway pages if only the
name changes. Each page needs at least ~150 words of category-specific original prose. If the owner
has not supplied a `blurb` for a game, write an honest description from its category and name — and
do not manufacture specifics (features, prize structures, player counts) you cannot verify.

---

## 7. Assets contract

Artwork has been supplied and arranged. **57 of the 90 games have a logo; 33 do not.**
`assets/README.md` carries the full status and the missing list.

```
assets/img/games/<slug>.<ext>      57 logos, renamed to match the roster slug
assets/img/games/_placeholder.svg  green placeholder for the 33 games with no art
assets/img/icons/logo.jpg          site brand mark
assets/img/icons/icon-controller.svg, icon-trophy.svg, icon-players.svg
assets/img/_unsorted/              one unidentified file, awaiting the owner's call
```

**Read image paths from `data/games.json`, never construct them.** Each record carries:
- `logo` — relative path to the primary image, or `null` if none was supplied
- `logoFallback` — a second format if one exists, otherwise `null`

Extensions are **not** uniform: the uploads are a mix of `.webp`, `.png` and `.jpg`, and almost
every game has exactly one file, not a WebP/PNG pair. So:

- Emit a bare `<img>` when `logoFallback` is `null`. Only wrap in `<picture>` with a `<source>`
  when a genuine second format exists. Do not emit a `<source>` pointing at a file that isn't there.
- When `logo` is `null`, render `assets/img/games/_placeholder.svg`. **Owner's decision: all 90
  pages ship now, with the 33 unillustrated games on the placeholder** — do not hold pages back.
  Never substitute another game's logo, and never leave a broken image.
- Always set explicit `width="96" height="96"`, `alt="<Game Name> logo"`, and `loading="lazy"`
  below the fold.

The supplied logos are mostly gold-on-dark-green artwork, which sits naturally on the `#0A1A0F`
ground — no plate, ring or background treatment is needed behind them. Do not recolour them.

Source images are not uniformly sized (from 148×148 up to 1254×1254) and some exceed the weight
budget. Before building, downscale to 256×256 and compress; the directory page renders up to 90 of
them at once. Keep the originals untouched in git.

Still outstanding, to request from the owner rather than fabricate: the 33 missing game logos,
`assets/img/og/` cards at 1200×630, `icon-192.png`, `icon-512.png`, `favicon.ico`, and WOFF2 fonts.

## 8. SEO

Do this **before** writing any page copy.

### 8a. Keyword cluster
Produce a table — Primary (1) · Secondary (4–6) · LSI (6–10) · Long-tail (8–12) — with a
**Page Target** column mapping each keyword to the one page meant to rank for it. One target page
per keyword; flag any collision so two pages never compete for the same term.

### 8b. Per-page metadata
Every page gets:
- `<title>` ≤ 60 chars, primary keyword first, brand last.
- `<meta name="description">` 145–155 chars, primary + one secondary keyword, no clickbait.
- `<link rel="canonical">` absolute.
- Open Graph: `og:title`, `og:description`, `og:image` (absolute), `og:url`, `og:type`.
- Twitter: `summary_large_image` card.
- `<html lang="en-IN">`.

Game-page title pattern: `<Game Name> — Download & Details | <Brand>`. Keep each unique; 90
identical-shaped titles are fine, 90 identical titles are not.

### 8c. JSON-LD
Inline in `<head>` as `application/ld+json`, using `@graph` to stack:
- **Home:** `WebSite` + `FAQPage`
- **Directory + category hubs:** `CollectionPage` + `ItemList` (each game an `ItemListElement`) + `BreadcrumbList`
- **Game pages:** `SoftwareApplication` (`applicationCategory: "GameApplication"`, `operatingSystem: "ANDROID"`) + `BreadcrumbList` + `FAQPage`
- **About / Contact:** `Organization`

**Do not emit `aggregateRating` or `offers` unless real, verifiable values exist** in
`data/games.json`. Fabricated ratings are a structured-data violation and can earn a manual action.
Omit the property entirely when the value is null.

### 8d. Internal linking
Produce a Source → Anchor Text → Target table. Every page must have ≥2 inbound internal links.
Home → all 7 hubs; each hub → its games; each game → its hub + 4 siblings. Use descriptive anchors
(the game name), never "click here".

### 8e. sitemap.xml / robots.txt
Generate `sitemap.xml` from `data/games.json` (all ~105 URLs) with `<lastmod>`. `robots.txt`:

```
User-agent: *
Allow: /
Disallow: /data/

Sitemap: https://games.newyono-apps.in/sitemap.xml
```

---

## 9. Compliance (India)

> ### ⚠ Unresolved blocker — read before writing any promotional copy
>
> The owner answered **Yes — real-money apps** in §1. That answer conflicts with the compliance
> approach the rest of this section was written around, and the conflict is not cosmetic.
>
> India's **Promotion and Regulation of Online Gaming Act, 2025** bans online money games
> nationwide — games played for stakes, **regardless of whether they are games of skill or of
> chance**. The Act also prohibits *advertising and promoting* such games, and bars financial
> institutions from processing their transactions. A directory site whose purpose is to promote
> real-money gaming apps to an Indian audience falls squarely in the conduct the Act addresses,
> even though the site is not itself the operator.
>
> Two consequences for this build:
>
> 1. **The "skill game, not gambling" defence no longer works.** The older state-by-state analysis
>    — and the restricted-states notice listing Andhra Pradesh, Telangana, Assam, Odisha, Nagaland
>    and Sikkim — reflects the pre-Act position. For online money games the ban is national, so a
>    notice implying the site is fine everywhere *except* six states would be misleading.
> 2. **Framing cannot fix it.** Relaxing the prohibited-words rule because the answer was "Yes"
>    would produce exactly the promotional copy the Act targets.
>
> **Do not resolve this by picking a framing.** Take it to a qualified Indian gaming lawyer and get
> the site's position in writing. Viable directions a lawyer may confirm include: restricting the
> site to genuinely free-to-play titles with no stakes; serving only non-India markets with
> geo-restriction; or repositioning as e-sports / social games, which the Act explicitly promotes.
>
> Until that is resolved, build only the structural work — layout, design system, navigation,
> search and filtering, schema plumbing — and leave promotional copy, bonus messaging and the
> compliance block unwritten. Flag this at the top of your build report.
>
> *(This is a summary of a legal position, not legal advice, and legislation moves. Verify the
> current text of the Act and any rules made under it before relying on any of it.)*


Required on every page:
- **Age gate**, 18+, modal on first visit, consent in `localStorage` key `ageVerified`. Must be
  keyboard-operable, focus-trapped, `role="dialog"` + `aria-modal="true"`.
- **Restricted states notice** in the footer: Andhra Pradesh, Telangana, Assam, Odisha, Nagaland,
  Sikkim. ⚠ Pre-Act framing — see the blocker above. For online money games the restriction is
  national, so do not ship this notice as-is without the legal sign-off.
- **Responsible gaming** section on Home + a dedicated `/pages/responsible-gaming.html`.
- **Cookie consent banner**, consent in `localStorage` key `cookieConsent`.
- **Independence disclaimer:** this site is an independent directory; it does not own, operate or
  distribute the listed apps, and all app names and logos are the property of their respective
  owners. Put this in the footer and on `/pages/disclaimer.html`.
- Footer legal nav: Privacy Policy · Terms · Responsible Gaming · Disclaimer · About · Contact.

**If Real-money gambling = No** (§1), marketing copy must avoid: "bet", "wager", "casino",
"jackpot", "real money", "win cash"; no odds or probability claims; no guaranteed-return language;
no celebrity imagery.

> **Known conflict — handle explicitly:** several games are *named* with those words (`MDM Bet`,
> `MWM Bet`, `MQM Bet`, `MKM Bet`, `MBM Bet`, `789 Jackpot`, `Bet 213 Slots`). Proper nouns stay
> verbatim — never rename a product. The restriction applies to *your* prose: headings, intros,
> CTAs, FAQ answers and meta descriptions. When you run the prohibited-words check, exclude matches
> that fall inside a game name from `data/games.json` and report the rest.

Add a note in the README that these templates are common industry practice, not legal advice, and
should be reviewed by a qualified professional before launch.

---

## 10. Performance and accessibility targets

- Lighthouse mobile ≥ 90 on all four categories for Home, Directory and a sample game page.
- LCP < 2.5s on simulated 4G; CLS < 0.1 (hence mandatory image dimensions).
- Total CSS < 50KB unminified; total JS < 20KB. No blocking third-party requests.
- Keyboard-navigable throughout; visible focus on every interactive element.
- One `<h1>` per page, heading levels never skipped.
- Semantic landmarks: `<header>`, `<nav>`, `<main id="main">`, `<footer>`.
- Test the directory page with 90 cards rendered — that is the heaviest page; lazy-load logos.

---

## 11. Build order

1. Read `data/games.json`. Report the count per category and any missing logo files (§7).
2. Scaffold folders; write `reset.css`, `tokens.css` (§4), `main.css`.
3. Deliver §8a keyword cluster + §8d internal-linking map **as markdown, for approval, before
   writing page copy.**
4. Build Home.
5. Build `/games/index.html` with all 90 cards + search/filter.
6. Build the 7 category hubs.
7. Write `tools/build-pages.js`; generate the 90 game pages + `sitemap.xml`.
8. Build the 6 legal/info pages and `404.html`.
9. Compliance pass (§9), including the prohibited-words check with the proper-noun exclusion.
10. Validate: HTML validator, Rich Results Test on one page of each type, Lighthouse, contrast audit.
11. Report: pages built, missing assets, unfilled data fields, and anything you could not verify.

## 12. Definition of done

- [ ] 90 game pages + 7 hubs + directory + home + 6 legal/info + 404 all build and link correctly
- [ ] No broken internal links, no broken images (placeholder used where a logo is missing)
- [ ] No invented bonuses, ratings, versions, sizes or download counts anywhere
- [ ] Every page has unique title, description, canonical, OG tags and valid JSON-LD
- [ ] `sitemap.xml` matches the actual page set; `robots.txt` correct
- [ ] Age gate, cookie banner, restricted-states notice, disclaimer present sitewide
- [ ] WCAG AA contrast verified; keyboard nav works; reduced-motion respected
- [ ] Lighthouse mobile ≥ 90 on the three sampled page types
- [ ] Missing-asset and unfilled-data report delivered to the owner

---

## 13. Ask before assuming

Stop and ask if: the brand name, primary keyword, support email or real-money answer in §1 is still `«FILL»`; the real-money answer is unclear; logo files
are missing for more than ~10 games; or the owner wants bonus/spec figures displayed but has not
supplied a verified source for them.
