#!/usr/bin/env node
/* Static page generator.
 *
 * Reads data/games.json and writes the directory, category hubs, game pages
 * and sitemap.xml. Run: node tools/build-pages.js
 *
 * COPY POLICY: promotional copy, bonus messaging and the compliance block are
 * intentionally NOT generated. See BUILD-PROMPT.md section 9 for why. Pages whose
 * copy is still pending are marked noindex and kept out of sitemap.xml so a
 * thin-content set can never be indexed by accident. Flip COPY_APPROVED once
 * real copy exists.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/games.json'), 'utf8'));

const SITE = {
  domain: 'games.newyono-apps.in',
  origin: 'https://games.newyono-apps.in',
  brand: 'New Yono Apps',
  lang: 'en-IN',
  // Single source of truth for the games path. Set to '' to flatten every game
  // and hub page to the site root (see BUILD-PROMPT.md section 5).
  gamesDir: 'games',
};

const COPY_APPROVED = false; // section 9 blocker: no promotional copy until legal sign-off

const CATS = DATA.categories;
const GAMES = DATA.games;
const catBy = {};
CATS.forEach((c) => { catBy[c.key] = c; });

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Land a meta description in the 145-155 char window without cutting mid-word.
   Tails are tried shortest-first; see seo/data/title-meta.csv for the same logic. */
function fit(text, tails, lo, hi) {
  lo = lo || 145; hi = hi || 155;
  const base = String(text).replace(/\s+/g, ' ').trim();
  const opts = [''].concat(tails || []);
  for (const extra of opts) {
    const cand = extra ? (base + ' ' + extra).trim() : base;
    if (cand.length >= lo && cand.length <= hi) return cand;
  }
  let cand = base;
  if (tails && tails.length && base.length < lo) cand = (base + ' ' + tails[tails.length - 1]).trim();
  if (cand.length <= hi) return cand;
  const out = [];
  for (const w of cand.split(' ')) {
    if ([...out, w].join(' ').length > hi - 1) break;
    out.push(w);
  }
  return out.join(' ').replace(/[ ,.;:]+$/, '') + '.';
}

/* Title builders. Each falls back to a shorter form so nothing exceeds 60 chars. */
function shortCat(c) { return c.label.split(' & ')[0]; }
/* Ampersands become &amp; once escaped (+4 chars), which breaks length budgets.
   Meta text therefore uses "and" so measured length matches rendered length. */
function plainCat(c) { return c.label.replace(/ & /g, ' and '); }

function catTitle(c, n) {
  const a = `Yono ${plainCat(c)} — ${n} Apps Listed | ${SITE.brand}`;
  if (a.length <= 60) return a;
  const b = `Yono ${plainCat(c)} — ${n} Apps | ${SITE.brand}`;
  if (b.length <= 60) return b;
  return `Yono ${shortCat(c)} — ${n} Apps | ${SITE.brand}`;
}

function gameTitle(g, c) {
  const a = `${g.name} — ${shortCat(c)} App Details and Guide | ${SITE.brand}`;
  if (a.length <= 60) return a;
  const b = `${g.name} — App Details and Guide | ${SITE.brand}`;
  if (b.length <= 60) return b;
  return `${g.name} — App Details | ${SITE.brand}`;
}

const seg = SITE.gamesDir ? SITE.gamesDir + '/' : '';
const gameUrl = (slug) => `/${seg}${slug}.html`;
const catUrl = (slug) => `/${seg}${slug}.html`;
const dirUrl = SITE.gamesDir ? `/${SITE.gamesDir}/` : '/all-games.html';

function write(rel, html) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
}

/* ---------- shared chrome ---------- */

function head(o) {
  const canonical = SITE.origin + o.url;
  const robots = o.noindex ? '\n  <meta name="robots" content="noindex,follow">' : '';
  const ld = o.schema
    ? `\n  <script type="application/ld+json">\n${JSON.stringify(o.schema, null, 2)}\n  </script>`
    : '';
  return `<!DOCTYPE html>
<html lang="${SITE.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(o.title)}</title>
  <meta name="description" content="${esc(o.description)}">
  <link rel="canonical" href="${canonical}">${robots}

  <meta property="og:title" content="${esc(o.title)}">
  <meta property="og:description" content="${esc(o.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(SITE.brand)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(o.title)}">
  <meta name="twitter:description" content="${esc(o.description)}">

  <link rel="stylesheet" href="/assets/css/reset.css">
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/main.css">${o.pageCss ? `\n  <link rel="stylesheet" href="/assets/css/pages/${o.pageCss}.css">` : ''}
  <link rel="manifest" href="/manifest.json">${ld}
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
${header(o.nav)}
  <main id="main">`;
}

function header(current) {
  const link = (href, label, key) =>
    `<li><a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a></li>`;
  return `  <header class="site-header">
    <div class="container">
      <nav class="nav" aria-label="Main">
        <a class="nav__brand" href="/"><span class="nav__brand-mark">&#9670;</span> ${esc(SITE.brand)}</a>
        <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="navMenu" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <ul class="nav__menu" id="navMenu">
          ${link('/', 'Home', 'home')}
          ${link(dirUrl, 'All Games', 'directory')}
          ${CATS.slice(0, 3).map((c) => link(catUrl(c.slug), esc(c.label), c.key)).join('\n          ')}
          ${link('/pages/about.html', 'About', 'about')}
        </ul>
      </nav>
    </div>
  </header>`;
}

function footer() {
  const legal = [
    ['/pages/privacy-policy.html', 'Privacy Policy'],
    ['/pages/terms.html', 'Terms &amp; Conditions'],
    ['/pages/responsible-gaming.html', 'Responsible Gaming'],
    ['/pages/disclaimer.html', 'Disclaimer'],
    ['/pages/about.html', 'About'],
    ['/pages/contact.html', 'Contact'],
  ];
  return `  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <h2>${esc(SITE.brand)}</h2>
          <p class="footer__note">An independent directory of Yono-family game apps. This site does
          not own, operate or distribute any listed application. All app names and logos are the
          property of their respective owners.</p>
        </div>
        <div>
          <h2>Browse</h2>
          <ul class="footer__links">
            <li><a href="${dirUrl}">All Games</a></li>
            ${CATS.map((c) => `<li><a href="${catUrl(c.slug)}">${esc(c.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>
        <div>
          <h2>Information</h2>
          <ul class="footer__links">
            ${legal.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} ${esc(SITE.brand)}. 18+ only. Play responsibly.</p>
        <!-- COMPLIANCE BLOCK PENDING: restricted-states / jurisdiction notice withheld.
             See BUILD-PROMPT.md section 9 - the pre-Act six-state notice would understate
             the current restriction, so nothing is shipped until legal sign-off. -->
      </div>
    </div>
  </footer>

  <div class="age-gate" id="ageGate" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle" aria-describedby="ageGateDesc">
    <div class="age-gate__panel">
      <h2 id="ageGateTitle">Are you 18 or older?</h2>
      <p id="ageGateDesc">This site lists gaming applications intended for adults. Please confirm your age to continue.</p>
      <div class="age-gate__actions">
        <button class="btn btn--primary" type="button" id="ageConfirm">I am 18 or older</button>
        <a class="btn btn--outline" href="https://www.google.com" id="ageDecline">I am under 18</a>
      </div>
      <p class="age-gate__legal">By continuing you confirm you are of legal age and accept our
        <a href="/pages/terms.html">Terms</a> and <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>
    </div>
  </div>

  <div class="cookie-banner" id="cookieBanner" role="region" aria-label="Cookie notice">
    <p>We use cookies to understand how this site is used. See our <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-banner__actions">
      <button class="btn btn--primary btn--sm" type="button" data-consent="accepted">Accept</button>
      <button class="btn btn--outline btn--sm" type="button" data-consent="declined">Decline</button>
    </div>
  </div>

  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/components/age-gate.js" defer></script>
</body>
</html>
`;
}

function breadcrumb(trail) {
  return `    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
${trail.map((t, i) => i === trail.length - 1
    ? `          <li><span aria-current="page">${esc(t.name)}</span></li>`
    : `          <li><a href="${t.url}">${esc(t.name)}</a></li>`).join('\n')}
        </ol>
      </nav>
    </div>`;
}

function breadcrumbSchema(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name,
      item: SITE.origin + (t.url || ''),
    })),
  };
}

function gameCard(g) {
  const img = g.logo
    ? `/${g.logo}`
    : '/assets/img/games/_placeholder.svg';
  const source = g.logoFallback
    ? `<picture><source srcset="/${g.logoFallback}"><img src="${img}" alt="${esc(g.name)} logo" width="96" height="96" loading="lazy"></picture>`
    : `<img src="${img}" alt="${esc(g.name)} logo" width="96" height="96" loading="lazy">`;
  return `          <li class="game-card" data-game data-cat="${g.category}" data-name="${esc(g.name.toLowerCase())}">
            <div class="game-card__media">${source}</div>
            <h3 class="game-card__title"><a href="${gameUrl(g.slug)}">${esc(g.name)}</a></h3>
            <span class="game-card__cat">${esc(catBy[g.category].label)}</span>
          </li>`;
}

/* ---------- directory ---------- */

function buildDirectory() {
  const url = dirUrl;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `All Yono Games`,
        url: SITE.origin + url,
        isPartOf: { '@type': 'WebSite', name: SITE.brand, url: SITE.origin },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: GAMES.length,
          itemListElement: GAMES.map((g, i) => ({
            '@type': 'ListItem', position: i + 1, name: g.name,
            url: SITE.origin + gameUrl(g.slug),
          })),
        },
      },
      breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'All Games', url }]),
    ],
  };

  const blocks = CATS.map((c) => {
    const list = GAMES.filter((g) => g.category === c.key);
    if (!list.length) return '';
    return `      <section class="cat-block" data-cat-block aria-labelledby="cat-${c.slug}">
        <div class="cat-block__head">
          <h2 id="cat-${c.slug}">${esc(c.label)}</h2>
          <a href="${catUrl(c.slug)}">View ${esc(c.label)} &rarr;</a>
        </div>
        <ul class="game-grid">
${list.map(gameCard).join('\n')}
        </ul>
      </section>`;
  }).filter(Boolean).join('\n');

  const pills = [`<button class="pill" type="button" data-filter-cat="all" aria-pressed="true">All (${GAMES.length})</button>`]
    .concat(CATS.map((c) => {
      const n = GAMES.filter((g) => g.category === c.key).length;
      return `<button class="pill" type="button" data-filter-cat="${c.key}" aria-pressed="false">${esc(c.label)} (${n})</button>`;
    })).join('\n            ');

  const html = head({
    url, nav: 'directory', pageCss: 'directory', schema,
    title: `All Yono Games — Full List of ${GAMES.length} Apps | ${SITE.brand}`,
    description: fit(
      `Search or filter the complete list of ${GAMES.length} Yono apps by name and category. Every title is shown with its category and artwork.`,
      ['Updated as the roster changes.', 'The list is updated as the roster changes.']),
  }) + `
${breadcrumb([{ name: 'Home', url: '/' }, { name: 'All Games' }])}

    <div class="container" data-filter-root>
      <div class="directory__head">
        <h1>All Yono Games</h1>
        <p>Every title in the directory, grouped by category. Search by name or use the category
           filters to narrow the list.</p>
      </div>

      <div class="filter">
        <div class="filter__search">
          <label class="visually-hidden" for="gameSearch">Search games by name</label>
          <input type="search" id="gameSearch" data-filter-search placeholder="Search games by name&hellip;" autocomplete="off">
        </div>
        <div class="filter__pills" role="group" aria-label="Filter by category">
            ${pills}
        </div>
        <p class="filter__count" data-filter-count role="status" aria-live="polite">Showing all ${GAMES.length} games</p>
      </div>

${blocks}

      <p class="filter__empty" data-filter-empty hidden>No games match that search.</p>
    </div>

  <script src="/assets/js/components/game-filter.js" defer></script>
` + footer();

  write(SITE.gamesDir ? `${SITE.gamesDir}/index.html` : 'all-games.html', html);
  return url;
}

/* ---------- category hubs ---------- */

function buildCategory(c) {
  const list = GAMES.filter((g) => g.category === c.key);
  const url = catUrl(c.slug);
  const trail = [{ name: 'Home', url: '/' }, { name: 'All Games', url: dirUrl }, { name: c.label, url }];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${c.label} — Yono Games`,
        url: SITE.origin + url,
        isPartOf: { '@type': 'WebSite', name: SITE.brand, url: SITE.origin },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: list.length,
          itemListElement: list.map((g, i) => ({
            '@type': 'ListItem', position: i + 1, name: g.name,
            url: SITE.origin + gameUrl(g.slug),
          })),
        },
      },
      breadcrumbSchema(trail),
    ],
  };

  const html = head({
    url, nav: c.key, pageCss: 'directory', schema,
    title: catTitle(c, list.length),
    description: fit(
      `All ${list.length} ${plainCat(c).toLowerCase()} titles in the Yono app directory. ${c.description}`,
      ['Open any title for its details and related apps.',
       'Compare them here and open any title for full details and related apps.']),
  }) + `
${breadcrumb(trail)}

    <div class="container">
      <div class="directory__head">
        <h1>${esc(c.label)}</h1>
        <p>${esc(c.description)} ${list.length} ${list.length === 1 ? 'title' : 'titles'} listed.</p>
      </div>

      <ul class="game-grid">
${list.map(gameCard).join('\n')}
      </ul>

      <p style="margin-top: var(--space-8);"><a href="${dirUrl}">&larr; Back to all games</a></p>
    </div>
` + footer();

  write(SITE.gamesDir ? `${SITE.gamesDir}/${c.slug}.html` : `${c.slug}.html`, html);
  return url;
}

/* ---------- game pages ---------- */

function buildGame(g) {
  const c = catBy[g.category];
  const url = gameUrl(g.slug);
  const trail = [
    { name: 'Home', url: '/' },
    { name: 'All Games', url: dirUrl },
    { name: c.label, url: catUrl(c.slug) },
    { name: g.name, url },
  ];

  const app = {
    '@type': 'SoftwareApplication',
    name: g.name,
    applicationCategory: 'GameApplication',
    operatingSystem: 'ANDROID',
    url: SITE.origin + url,
  };
  // No aggregateRating and no offers: the roster carries no verified values,
  // and fabricating them is a structured-data violation.
  if (g.blurb) app.description = g.blurb;

  const schema = { '@context': 'https://schema.org', '@graph': [app, breadcrumbSchema(trail)] };

  const img = g.logo ? `/${g.logo}` : '/assets/img/games/_placeholder.svg';
  const media = g.logoFallback
    ? `<picture><source srcset="/${g.logoFallback}"><img src="${img}" alt="${esc(g.name)} logo" width="120" height="120"></picture>`
    : `<img src="${img}" alt="${esc(g.name)} logo" width="120" height="120">`;

  // Spec table: render only rows that actually have a value.
  const specs = [
    ['Category', c.label],
    ['Platform', 'Android'],
    ['Version', g.version],
    ['File size', g.apkSize],
    ['Updated', g.updated],
  ].filter(([, v]) => v != null && v !== '');

  const specTable = specs.length
    ? `      <table class="spec-table">
        <caption class="visually-hidden">${esc(g.name)} details</caption>
        <tbody>
${specs.map(([k, v]) => `          <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n')}
        </tbody>
      </table>`
    : '';

  const related = GAMES.filter((x) => x.category === g.category && x.slug !== g.slug).slice(0, 4);
  const relatedBlock = related.length
    ? `      <section class="related" aria-labelledby="related-h">
        <h2 id="related-h">More ${esc(c.label)}</h2>
        <ul class="game-grid">
${related.map(gameCard).join('\n')}
        </ul>
        <p style="margin-top: var(--space-6);"><a href="${catUrl(c.slug)}">View all ${esc(c.label)} &rarr;</a></p>
      </section>`
    : '';

  const body = g.blurb
    ? `      <p>${esc(g.blurb)}</p>`
    : `      <div class="content-pending">
        <p><strong>Description pending.</strong> Page copy, download guidance and FAQ content for
        this title are held until the compliance question in the build spec is resolved. The page
        structure, navigation and schema are complete.</p>
      </div>`;

  const html = head({
    url, nav: c.key, pageCss: 'game', schema,
    noindex: !COPY_APPROVED,
    title: gameTitle(g, c),
    description: fit(
      `${g.name} is a ${plainCat(c).toLowerCase()} app listed in the Yono directory.`,
      [`See its category, platform and related ${shortCat(c).toLowerCase()} titles.`,
       `See its category and platform details, plus related ${shortCat(c).toLowerCase()} titles here.`,
       `Check its category and platform details, and browse related ${shortCat(c).toLowerCase()} titles in the same section.`]),
  }) + `
${breadcrumb(trail)}

    <div class="container">
      <div class="game-hero">
        <div class="game-hero__media">${media}</div>
        <div class="game-hero__meta">
          <h1>${esc(g.name)} — ${esc(shortCat(c))} App Details</h1>
          <span class="game-hero__cat">${esc(c.label)}</span>
        </div>
      </div>

${body}
${specTable}
${relatedBlock}
    </div>

  <script src="/assets/js/components/faq-accordion.js" defer></script>
` + footer();

  write(SITE.gamesDir ? `${SITE.gamesDir}/${g.slug}.html` : `${g.slug}.html`, html);
  return url;
}

/* ---------- home ---------- */

function buildHome() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: SITE.brand,
        url: SITE.origin,
        inLanguage: SITE.lang,
        description: `Directory of ${GAMES.length} Yono game apps across ${CATS.length} categories.`,
      },
      {
        '@type': 'Organization',
        name: SITE.brand,
        url: SITE.origin,
      },
    ],
  };

  const cards = CATS.map((c) => {
    const n = GAMES.filter((g) => g.category === c.key).length;
    return `          <li class="cat-card">
            <span class="cat-card__count">${n} ${n === 1 ? 'title' : 'titles'}</span>
            <h3><a href="${catUrl(c.slug)}">${esc(c.label)}</a></h3>
            <p>${esc(c.description)}</p>
          </li>`;
  }).join('\n');

  const html = head({
    url: '/', nav: 'home', pageCss: 'home', schema,
    title: `Yono Games List — ${GAMES.length} Apps by Category | ${SITE.brand}`,
    description: fit(
      `An independent directory of ${GAMES.length} Yono game apps sorted into ${CATS.length} categories, from rummy and slots to Teen Patti, arcade and bingo.`,
      ['Browse the full list.', 'Browse or search the full list by name.']),
  }) + `
    <section class="hero">
      <div class="container">
        <h1>Every Yono game, in one directory</h1>
        <p class="hero__lede">${GAMES.length} titles across ${CATS.length} categories, listed with
           their category and artwork so you can find what you are looking for quickly.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${dirUrl}">Browse all games</a>
          <a class="btn btn--outline" href="/pages/about.html">About this site</a>
        </div>

        <ul class="stat-row">
          <li class="stat"><span class="stat__num">${GAMES.length}</span><span class="stat__label">Titles</span></li>
          <li class="stat"><span class="stat__num">${CATS.length}</span><span class="stat__label">Categories</span></li>
          <li class="stat"><span class="stat__num">${GAMES.filter((g) => g.logo).length}</span><span class="stat__label">With artwork</span></li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <h2>Browse by category</h2>
          <p>Titles are grouped by the kind of game they are.</p>
        </div>
        <ul class="cat-grid">
${cards}
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="notice">
          <p><strong>Independent directory.</strong> ${esc(SITE.brand)} does not own, operate or
          distribute any application listed here. App names and logos belong to their respective
          owners. This site is for adults aged 18 and over.</p>
        </div>
      </div>
    </section>
` + footer();

  write('index.html', html);
}

/* ---------- static pages ---------- */

const STATIC_PAGES = [
  { slug: 'about', title: 'About', pending: false,
    description: `About ${SITE.brand}, an independent directory of Yono game apps.`,
    body: `      <p>${esc(SITE.brand)} is an independent directory. We catalogue Yono-family game
      applications so they can be browsed in one place, grouped by category and searchable by name.</p>
      <p>We do not own, operate, publish or distribute any application listed on this site, and we
      are not affiliated with their developers. All application names, logos and trademarks remain
      the property of their respective owners.</p>
      <p>The directory currently lists ${GAMES.length} titles across ${CATS.length} categories.</p>` },

  { slug: 'contact', title: 'Contact', pending: true,
    description: `Contact ${SITE.brand}.`,
    body: `      <p>For corrections to a listing, removal requests from rights holders, or general
      enquiries, use the address below.</p>` },

  { slug: 'privacy-policy', title: 'Privacy Policy', pending: true,
    description: `Privacy policy for ${SITE.brand}.`, body: '' },

  { slug: 'terms', title: 'Terms &amp; Conditions', pending: true,
    description: `Terms and conditions for using ${SITE.brand}.`, body: '' },

  { slug: 'responsible-gaming', title: 'Responsible Gaming', pending: false,
    description: `Responsible gaming guidance and support resources.`,
    body: `      <p>Gaming should stay entertainment. If you choose to play, a few habits help keep
      it that way:</p>
      <ul style="margin: var(--space-4) 0 var(--space-4) var(--space-6); list-style: disc; color: var(--color-text-secondary);">
        <li>Decide your time and spending limits before you start, not during.</li>
        <li>Never play to recover a loss.</li>
        <li>Treat gaming as entertainment, never as a source of income.</li>
        <li>Take regular breaks, and stop when it stops being fun.</li>
      </ul>
      <p>If gaming is affecting your work, studies, finances or relationships, support is available.
      In India, the National Institute of Mental Health and Neurosciences (NIMHANS) runs a
      confidential helpline on <strong>080-46110007</strong>.</p>
      <p>This site is intended for adults aged 18 and over.</p>` },

  { slug: 'disclaimer', title: 'Disclaimer', pending: false,
    description: `Disclaimer for ${SITE.brand}.`,
    body: `      <p>${esc(SITE.brand)} is an independent directory and is not affiliated with,
      endorsed by, or connected to any application, developer or publisher listed on this site.</p>
      <p>We do not host, distribute or provide application files. Listings are informational. All
      application names, logos, screenshots and trademarks are the property of their respective
      owners and appear here for identification only.</p>
      <p>Information on this site is provided as-is and may be incomplete or out of date. Verify
      details with the application's own publisher before relying on them.</p>
      <p>Rights holders who want a listing corrected or removed can reach us via the
      <a href="/pages/contact.html">contact page</a>.</p>` },
];

function buildStatic(pg) {
  const url = `/pages/${pg.slug}.html`;
  const plain = pg.title.replace(/&amp;/g, '&');
  const trail = [{ name: 'Home', url: '/' }, { name: plain, url }];
  const schema = { '@context': 'https://schema.org', '@graph': [breadcrumbSchema(trail)] };

  const pendingBlock = pg.pending
    ? `      <div class="content-pending">
        <p><strong>Content pending.</strong> This page needs copy reviewed and approved before
        publication. It is generated as a structural placeholder so navigation, breadcrumbs and
        internal links are complete and testable.</p>
      </div>`
    : '';

  const html = head({
    url, nav: pg.slug, pageCss: 'game', schema,
    noindex: pg.pending,
    title: `${plain} | ${SITE.brand}`,
    description: pg.description,
  }) + `
${breadcrumb(trail)}

    <div class="container" style="max-width: 760px; padding-bottom: var(--space-12);">
      <h1 style="margin-bottom: var(--space-6);">${pg.title}</h1>
${pg.body}
${pendingBlock}
    </div>
` + footer();

  write(`pages/${pg.slug}.html`, html);
}

function build404() {
  const html = head({
    url: '/404.html', nav: '', pageCss: 'home', noindex: true,
    title: `Page not found | ${SITE.brand}`,
    description: 'The page you were looking for does not exist.',
  }) + `
    <section class="hero">
      <div class="container">
        <h1>Page not found</h1>
        <p class="hero__lede">That page does not exist or has moved.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${dirUrl}">Browse all games</a>
          <a class="btn btn--outline" href="/">Go home</a>
        </div>
      </div>
    </section>
` + footer();
  write('404.html', html);
}

/* ---------- sitemap ---------- */

function buildSitemap(urls) {
  const today = new Date().toISOString().slice(0, 10);
  const body = urls.map((u) => `  <url>
    <loc>${SITE.origin}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  write('sitemap.xml',
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body + '\n</urlset>\n');
}

/* ---------- run ---------- */

const indexable = [{ loc: '/', priority: '1.0' }];

buildHome();
build404();
STATIC_PAGES.forEach(buildStatic);

const dUrl = buildDirectory();
indexable.push({ loc: dUrl, priority: '0.9' });

CATS.forEach((c) => { indexable.push({ loc: buildCategory(c), priority: '0.8' }); });

let pending = 0;
GAMES.forEach((g) => {
  const u = buildGame(g);
  if (COPY_APPROVED) indexable.push({ loc: u, priority: '0.7' });
  else pending++;
});

STATIC_PAGES.filter((p) => !p.pending)
  .forEach((p) => indexable.push({ loc: `/pages/${p.slug}.html`, priority: '0.4' }));

buildSitemap(indexable);

console.log(`home + 404     : 2`);
console.log(`static pages   : ${STATIC_PAGES.length} (${STATIC_PAGES.filter((p) => p.pending).length} noindex, copy pending)`);
console.log(`directory      : 1`);
console.log(`category hubs  : ${CATS.length}`);
console.log(`game pages     : ${GAMES.length}  (${pending} noindex, copy pending)`);
console.log(`sitemap entries: ${indexable.length}`);
console.log(`logos          : ${GAMES.filter((g) => g.logo).length}/${GAMES.length}, rest on placeholder`);
