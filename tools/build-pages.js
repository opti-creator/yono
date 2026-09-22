#!/usr/bin/env node
/* Static page generator.
 *
 * Reads data/games.json and writes home, directory, category hubs, game pages,
 * info pages, 404, sitemap.xml and the search index.
 *   node tools/build-pages.js
 *
 * COPY POLICY (unchanged): promotional copy, bonus messaging and the compliance
 * block are NOT generated - see BUILD-PROMPT.md section 9. Pages awaiting copy are
 * noindex and excluded from sitemap.xml. Flip COPY_APPROVED once copy exists.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/games.json'), 'utf8'));

let OPT = {};
try { OPT = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/img/games/opt/manifest.json'), 'utf8')); }
catch (e) { console.warn('! no optimised image manifest - run tools/optimize-images.py'); }

const SITE = {
  origin: 'https://games.newyono-apps.in',
  brand: 'New Yono Apps',
  lang: 'en-IN',
  gamesDir: 'games',   // set to '' to flatten every hub and game page to the root
};

const COPY_APPROVED = false;

const CATS = DATA.categories;
const GAMES = DATA.games;
const catBy = {};
CATS.forEach((c) => { catBy[c.key] = c; });
const countIn = (key) => GAMES.filter((g) => g.category === key).length;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const seg = SITE.gamesDir ? SITE.gamesDir + '/' : '';
const gameUrl = (slug) => `/${seg}${slug}.html`;
const catUrl = (slug) => `/${seg}${slug}.html`;
const dirUrl = SITE.gamesDir ? `/${SITE.gamesDir}/` : '/all-games.html';

function write(rel, html) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
}

/* ---------- SEO helpers (carried over unchanged) ---------- */

function fit(text, tails, lo = 145, hi = 155) {
  const base = String(text).replace(/\s+/g, ' ').trim();
  for (const extra of [''].concat(tails || [])) {
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

const shortCat = (c) => c.label.split(' & ')[0];
const plainCat = (c) => c.label.replace(/ & /g, ' and ');

function catTitle(c, n) {
  const a = `Yono ${plainCat(c)} — ${n} Apps Listed | ${SITE.brand}`;
  if (a.length <= 60) return a;
  const b = `Yono ${plainCat(c)} — ${n} Apps | ${SITE.brand}`;
  return b.length <= 60 ? b : `Yono ${shortCat(c)} — ${n} Apps | ${SITE.brand}`;
}

function gameTitle(g, c) {
  const a = `${g.name} — ${shortCat(c)} App Details and Guide | ${SITE.brand}`;
  if (a.length <= 60) return a;
  const b = `${g.name} — App Details and Guide | ${SITE.brand}`;
  return b.length <= 60 ? b : `${g.name} — App Details | ${SITE.brand}`;
}

function breadcrumbSchema(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, item: SITE.origin + (t.url || ''),
    })),
  };
}

/* ---------- Images ---------- */

function logoSources(g, sizesAttr) {
  const widths = OPT[g.slug] || [];
  if (!g.logo && !widths.length) {
    return { src: '/assets/img/games/_placeholder.svg', srcset: '', sizes: '' };
  }
  if (!widths.length) return { src: '/' + g.logo, srcset: '', sizes: '' };
  return {
    src: `/assets/img/games/opt/${g.slug}-${widths[0]}.webp`,
    srcset: widths.map((w) => `/assets/img/games/opt/${g.slug}-${w}.webp ${w}w`).join(', '),
    sizes: sizesAttr,
  };
}

function logoImg(g, w, h, sizesAttr, eager) {
  const s = logoSources(g, sizesAttr);
  return `<img src="${s.src}"${s.srcset ? ` srcset="${s.srcset}" sizes="${s.sizes}"` : ''}` +
         ` alt="${esc(g.name)} logo" width="${w}" height="${h}"` +
         ` ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}

/* ---------- Chrome ---------- */

const ICON = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  left: '<path d="m14 5-7 7 7 7"/>',
  right: '<path d="m10 5 7 7-7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
};
const svg = (k, cls) => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

const NAV = [
  { href: '/', label: 'Home', key: 'home' },
  { href: dirUrl, label: 'All Games', key: 'directory' },
];

function head(o) {
  const canonical = SITE.origin + o.url;
  const robots = o.noindex ? '\n  <meta name="robots" content="noindex,follow">' : '';
  const ld = o.schema
    ? `\n  <script type="application/ld+json">\n${JSON.stringify(o.schema, null, 2)}\n  </script>` : '';
  return `<!DOCTYPE html>
<html lang="${SITE.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#070F0A">
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
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" href="/favicon.ico">${ld}
  <script>/* set theme before paint to avoid a flash */(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
${header(o.nav)}
  <main id="main">`;
}

function header(current) {
  const link = (n) =>
    `<a href="${n.href}"${current === n.key ? ' aria-current="page"' : ''}>${n.label}</a>`;
  return `  <header class="site-header">
    <div class="container header__inner">
      <a class="brand" href="/"><span class="brand__mark" aria-hidden="true">N</span>${esc(SITE.brand)}</a>
      <nav class="header__nav" aria-label="Primary">
        ${NAV.map(link).join('\n        ')}
        ${CATS.slice(0, 4).map((c) => `<a href="${catUrl(c.slug)}"${current === c.key ? ' aria-current="page"' : ''}>${esc(shortCat(c))}</a>`).join('\n        ')}
      </nav>
      <button class="icon-btn" type="button" data-search-open aria-label="Search games">${svg('search')}</button>
      <button class="icon-btn" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch theme">${svg('sun')}</button>
      <button class="icon-btn header__menu-btn" type="button" data-drawer-open aria-label="Open menu" aria-controls="drawer" aria-expanded="false">${svg('menu')}</button>
    </div>
  </header>

  <div class="drawer-scrim" id="drawerScrim" hidden-focus></div>
  <aside class="drawer" id="drawer" aria-hidden="true" aria-label="Site menu">
    <div class="drawer__head">
      <span class="brand"><span class="brand__mark" aria-hidden="true">N</span>${esc(SITE.brand)}</span>
      <button class="icon-btn" type="button" data-drawer-close aria-label="Close menu">${svg('close')}</button>
    </div>
    <div class="drawer__body">
      ${NAV.map((n) => `<a class="drawer__link" href="${n.href}"${current === n.key ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ')}
      <div class="drawer__group">
        <button class="drawer__toggle" type="button" aria-expanded="true" aria-controls="drawerCats">Categories</button>
        <div class="drawer__panel" id="drawerCats">
          ${CATS.map((c) => `<a href="${catUrl(c.slug)}"${current === c.key ? ' aria-current="page"' : ''}>${esc(c.label)}<span class="count">${countIn(c.key)}</span></a>`).join('\n          ')}
        </div>
      </div>
      <div class="drawer__group">
        <button class="drawer__toggle" type="button" aria-expanded="false" aria-controls="drawerInfo">Information</button>
        <div class="drawer__panel" id="drawerInfo" hidden>
          ${INFO_LINKS.map(([h, l]) => `<a href="${h}">${l}</a>`).join('\n          ')}
        </div>
      </div>
    </div>
  </aside>

  <div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="Search games" aria-hidden="true">
    <div class="search-overlay__bar">
      <label class="visually-hidden" for="searchField">Search games by name</label>
      <input class="search-overlay__field" id="searchField" type="search" data-search-field
             placeholder="Search games…" autocomplete="off" autocorrect="off" spellcheck="false">
      <button class="icon-btn" type="button" data-search-close aria-label="Close search">${svg('close')}</button>
    </div>
    <div class="search-overlay__body">
      <p class="search-overlay__hint" data-search-hint>Browse by category</p>
      <div class="search-results" data-search-results role="listbox" aria-label="Search results"></div>
    </div>
  </div>`;
}

const INFO_LINKS = [
  ['/pages/about.html', 'About'],
  ['/pages/contact.html', 'Contact'],
  ['/pages/responsible-gaming.html', 'Responsible Gaming'],
  ['/pages/disclaimer.html', 'Disclaimer'],
  ['/pages/privacy-policy.html', 'Privacy Policy'],
  ['/pages/terms.html', 'Terms &amp; Conditions'],
];

function bottomNav(current) {
  const item = (href, key, icon, label) =>
    `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${svg(icon)}<span>${label}</span></a>`;
  return `  <nav class="bottom-nav" aria-label="Quick navigation">
    ${item('/', 'home', 'home', 'Home')}
    ${item(dirUrl, 'directory', 'grid', 'Games')}
    <button type="button" data-search-open aria-label="Search games">${svg('search')}<span>Search</span></button>
    <button type="button" data-drawer-open aria-label="Open menu" aria-controls="drawer" aria-expanded="false">${svg('menu')}<span>Menu</span></button>
  </nav>`;
}

function footer(current, extraScripts) {
  return `  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <span class="brand"><span class="brand__mark" aria-hidden="true">N</span>${esc(SITE.brand)}</span>
          <p>An independent directory of Yono-family game apps. This site does not own, operate or
          distribute any listed application. All app names and logos are the property of their
          respective owners.</p>
        </div>
        <div class="footer__col">
          <h2 class="visually-hidden">Browse</h2>
          <button class="footer__toggle" type="button" aria-expanded="false" aria-controls="footBrowse">Browse</button>
          <ul class="footer__links" id="footBrowse" hidden>
            <li><a href="${dirUrl}">All Games</a></li>
            ${CATS.map((c) => `<li><a href="${catUrl(c.slug)}">${esc(c.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>
        <div class="footer__col">
          <h2 class="visually-hidden">Information</h2>
          <button class="footer__toggle" type="button" aria-expanded="false" aria-controls="footInfo">Information</button>
          <ul class="footer__links" id="footInfo" hidden>
            ${INFO_LINKS.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} ${esc(SITE.brand)}. 18+ only. Play responsibly.</p>
        <!-- COMPLIANCE BLOCK PENDING: jurisdiction / restricted-states notice withheld.
             See BUILD-PROMPT.md section 9 - the pre-Act six-state notice would understate the
             current restriction, so nothing ships until legal sign-off. -->
      </div>
    </div>
  </footer>

${bottomNav(current)}

  <div class="age-gate" id="ageGate" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle" aria-describedby="ageGateDesc">
    <div class="age-gate__panel">
      <h2 id="ageGateTitle">Are you 18 or older?</h2>
      <p id="ageGateDesc">This site lists gaming applications intended for adults. Please confirm your age to continue.</p>
      <div class="age-gate__actions">
        <button class="btn btn--primary btn--block" type="button" id="ageConfirm">I am 18 or older</button>
        <a class="btn btn--ghost btn--block" href="https://www.google.com" id="ageDecline">I am under 18</a>
      </div>
      <p class="age-gate__legal">By continuing you confirm you are of legal age and accept our
        <a href="/pages/terms.html">Terms</a> and <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>
    </div>
  </div>

  <div class="cookie-banner" id="cookieBanner" role="region" aria-label="Cookie notice">
    <p>We use cookies to understand how this site is used. See our <a href="/pages/privacy-policy.html">Privacy Policy</a>.</p>
    <div class="cookie-banner__actions">
      <button class="btn btn--primary btn--sm" type="button" data-consent="accepted">Accept</button>
      <button class="btn btn--ghost btn--sm" type="button" data-consent="declined">Decline</button>
    </div>
  </div>

  <script>window.__CATEGORIES=${JSON.stringify(CATS.map((c) => ({ l: c.label, u: catUrl(c.slug), n: countIn(c.key) })))};</script>
  <script src="/assets/js/main.js" defer></script>
  <script src="/assets/js/search.js" defer></script>
  <script src="/assets/js/ui.js" defer></script>
  <script src="/assets/js/components/age-gate.js" defer></script>${(extraScripts || []).map((s) => `\n  <script src="${s}" defer></script>`).join('')}
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

/* ---------- Cards ---------- */

const CARD_SIZES = '(min-width:1440px) 190px, (min-width:900px) 200px, (min-width:560px) 30vw, 44vw';

function gameCard(g, eager) {
  const c = catBy[g.category];
  return `          <li class="game-card" data-game data-cat="${g.category}" data-name="${esc(g.name.toLowerCase())}">
            <div class="game-card__media">${logoImg(g, 192, 192, CARD_SIZES, eager)}</div>
            <div class="game-card__body">
              <h3 class="game-card__title"><a href="${gameUrl(g.slug)}">${esc(g.name)}</a></h3>
              <p class="game-card__meta">${esc(c.label)}</p>
            </div>
          </li>`;
}

/* ---------- Pages ---------- */

function buildHome() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', name: SITE.brand, url: SITE.origin, inLanguage: SITE.lang,
        description: `Directory of ${GAMES.length} Yono game apps across ${CATS.length} categories.` },
      { '@type': 'Organization', name: SITE.brand, url: SITE.origin },
    ],
  };

  // Carousel sample: first title of each category, so it is deterministic and
  // not a fabricated "popular" or "featured" claim.
  const sample = CATS.map((c) => GAMES.find((g) => g.category === c.key)).filter(Boolean);

  const html = head({
    url: '/', nav: 'home', schema,
    title: `Yono Games List — ${GAMES.length} Apps by Category | ${SITE.brand}`,
    description: fit(
      `An independent directory of ${GAMES.length} Yono game apps sorted into ${CATS.length} categories, from rummy and slots to Teen Patti, arcade and bingo.`,
      ['Browse the full list.', 'Browse or search the full list by name.']),
  }) + `
    <section class="hero">
      <div class="container">
        <p class="hero__eyebrow"><b>${GAMES.length}</b> apps · <b>${CATS.length}</b> categories</p>
        <h1>Every Yono game, in one directory</h1>
        <p class="hero__lede">Browse ${GAMES.length} titles grouped by what they actually are, with
           artwork and category for each. Search by name or filter as you go.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${dirUrl}">Browse all games</a>
          <button class="btn btn--ghost" type="button" data-search-open>${svg('search')} Search games</button>
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
        <div class="section__head section__head--row">
          <div>
            <h2>One from each category</h2>
            <p>A title from every section of the directory.</p>
          </div>
          <div class="carousel__controls" data-carousel-controls>
            <button class="carousel__btn" type="button" data-carousel-prev aria-label="Scroll left">${svg('left')}</button>
            <button class="carousel__btn" type="button" data-carousel-next aria-label="Scroll right">${svg('right')}</button>
          </div>
        </div>
        <div class="carousel" data-carousel>
          <ul class="carousel__track" data-carousel-track>
${sample.map((g, i) => gameCard(g, i === 0)).join('\n')}
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <h2>Browse by category</h2>
          <p>Titles are grouped by the kind of game they are.</p>
        </div>
        <ul class="cat-grid">
${CATS.map((c) => `          <li class="cat-card">
            <span class="cat-card__count">${countIn(c.key)} ${countIn(c.key) === 1 ? 'title' : 'titles'}</span>
            <h3><a href="${catUrl(c.slug)}">${esc(c.label)}</a></h3>
            <p>${esc(c.description)}</p>
          </li>`).join('\n')}
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
` + footer('home');
  write('index.html', html);
}

function buildDirectory() {
  const url = dirUrl;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: 'All Yono Games', url: SITE.origin + url,
        isPartOf: { '@type': 'WebSite', name: SITE.brand, url: SITE.origin },
        mainEntity: { '@type': 'ItemList', numberOfItems: GAMES.length,
          itemListElement: GAMES.map((g, i) => ({ '@type': 'ListItem', position: i + 1,
            name: g.name, url: SITE.origin + gameUrl(g.slug) })) } },
      breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'All Games', url }]),
    ],
  };

  let idx = 0;
  const blocks = CATS.map((c) => {
    const list = GAMES.filter((g) => g.category === c.key);
    if (!list.length) return '';
    return `      <section class="cat-block" data-cat-block aria-labelledby="cat-${c.slug}">
        <div class="section__head section__head--row">
          <h2 id="cat-${c.slug}">${esc(c.label)}</h2>
          <a href="${catUrl(c.slug)}">View all ${esc(c.label)} &rarr;</a>
        </div>
        <ul class="game-grid">
${list.map((g) => gameCard(g, idx++ < 4)).join('\n')}
        </ul>
      </section>`;
  }).filter(Boolean).join('\n\n');

  const chips = [`<button class="chip" type="button" data-filter-cat="all" aria-pressed="true">All <span class="count">${GAMES.length}</span></button>`]
    .concat(CATS.map((c) => `<button class="chip" type="button" data-filter-cat="${c.key}" aria-pressed="false">${esc(c.label)} <span class="count">${countIn(c.key)}</span></button>`))
    .join('\n            ');

  const html = head({
    url, nav: 'directory', schema,
    title: `All Yono Games — Full List of ${GAMES.length} Apps | ${SITE.brand}`,
    description: fit(
      `Search or filter the complete list of ${GAMES.length} Yono apps by name and category. Every title is shown with its category and artwork.`,
      ['Updated as the roster changes.', 'The list is updated as the roster changes.']),
  }) + `
${breadcrumb([{ name: 'Home', url: '/' }, { name: 'All Games' }])}

    <div class="container" data-filter-root>
      <div class="section__head">
        <h1>All Yono Games</h1>
        <p>Every title in the directory, grouped by category. Search by name or use the category
           filters to narrow the list.</p>
      </div>

      <div style="margin-bottom:var(--space-6)">
        <label class="visually-hidden" for="gameSearch">Search games by name</label>
        <input class="search-overlay__field" id="gameSearch" type="search" data-filter-search
               placeholder="Search games by name…" autocomplete="off" style="width:100%;margin-bottom:var(--space-3)">
        <div class="chips" role="group" aria-label="Filter by category">
            ${chips}
        </div>
        <p class="filter__count" data-filter-count role="status" aria-live="polite"
           style="margin-top:var(--space-3);font-size:var(--text-sm);color:var(--text-muted)">Showing all ${GAMES.length} games</p>
      </div>

${blocks}

      <p data-filter-empty hidden style="padding:var(--space-12) 0;text-align:center;color:var(--text-muted)">No games match that search.</p>
    </div>
` + footer('directory');

  write(SITE.gamesDir ? `${SITE.gamesDir}/index.html` : 'all-games.html', html);
  return url;
}

function buildCategory(c) {
  const list = GAMES.filter((g) => g.category === c.key);
  const url = catUrl(c.slug);
  const trail = [{ name: 'Home', url: '/' }, { name: 'All Games', url: dirUrl }, { name: c.label, url }];
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', name: `${c.label} — Yono Games`, url: SITE.origin + url,
        isPartOf: { '@type': 'WebSite', name: SITE.brand, url: SITE.origin },
        mainEntity: { '@type': 'ItemList', numberOfItems: list.length,
          itemListElement: list.map((g, i) => ({ '@type': 'ListItem', position: i + 1,
            name: g.name, url: SITE.origin + gameUrl(g.slug) })) } },
      breadcrumbSchema(trail),
    ],
  };

  const others = CATS.filter((x) => x.key !== c.key);
  const html = head({
    url, nav: c.key, schema,
    title: catTitle(c, list.length),
    description: fit(
      `All ${list.length} ${plainCat(c).toLowerCase()} titles in the Yono app directory. ${c.description}`,
      ['Open any title for its details and related apps.',
       'Compare them here and open any title for full details and related apps.']),
  }) + `
${breadcrumb(trail)}

    <div class="container">
      <div class="section__head">
        <h1>${esc(c.label)}</h1>
        <p>${esc(c.description)} ${list.length} ${list.length === 1 ? 'title' : 'titles'} listed.</p>
      </div>

      <ul class="game-grid">
${list.map((g, i) => gameCard(g, i < 4)).join('\n')}
      </ul>

      <section class="section">
        <h2>Other categories</h2>
        <div class="chips" style="margin-top:var(--space-4)">
          ${others.map((o) => `<a class="chip" href="${catUrl(o.slug)}">${esc(o.label)} <span class="count">${countIn(o.key)}</span></a>`).join('\n          ')}
        </div>
      </section>
    </div>
` + footer(c.key);

  write(SITE.gamesDir ? `${SITE.gamesDir}/${c.slug}.html` : `${c.slug}.html`, html);
  return url;
}

function buildGame(g) {
  const c = catBy[g.category];
  const url = gameUrl(g.slug);
  const trail = [
    { name: 'Home', url: '/' }, { name: 'All Games', url: dirUrl },
    { name: c.label, url: catUrl(c.slug) }, { name: g.name, url },
  ];

  const app = { '@type': 'SoftwareApplication', name: g.name,
    applicationCategory: 'GameApplication', operatingSystem: 'ANDROID', url: SITE.origin + url };
  // No aggregateRating and no offers: the roster carries no verified values.
  if (g.blurb) app.description = g.blurb;
  const schema = { '@context': 'https://schema.org', '@graph': [app, breadcrumbSchema(trail)] };

  const specs = [
    ['Category', c.label], ['Platform', 'Android'],
    ['Version', g.version], ['File size', g.apkSize], ['Updated', g.updated],
  ].filter(([, v]) => v != null && v !== '');

  const specTable = specs.length ? `      <table class="spec-table">
        <caption class="visually-hidden">${esc(g.name)} details</caption>
        <tbody>
${specs.map(([k, v]) => `          <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n')}
        </tbody>
      </table>` : '';

  const related = GAMES.filter((x) => x.category === g.category && x.slug !== g.slug).slice(0, 6);
  const relatedBlock = related.length ? `      <section class="section">
        <div class="section__head section__head--row">
          <h2>More ${esc(c.label)}</h2>
          <a href="${catUrl(c.slug)}">View all &rarr;</a>
        </div>
        <ul class="game-grid">
${related.map((x) => gameCard(x)).join('\n')}
        </ul>
      </section>` : '';

  // Body copy is gated (section 9). When a blurb exists it renders inside a
  // read-more that only ever collapses via max-height, never display:none.
  const body = g.blurb ? `      <div class="readmore" data-readmore>
        <div class="readmore__content prose"><p>${esc(g.blurb)}</p></div>
        <button class="btn btn--ghost btn--sm readmore__btn" type="button" aria-expanded="false" hidden>Read more</button>
      </div>` : `      <div class="content-pending">
        <p><strong>Description pending.</strong> Page copy, download guidance and FAQ content for
        this title are held until the compliance question in the build spec is resolved. The page
        structure, navigation and schema are complete.</p>
      </div>`;

  const html = head({
    url, nav: c.key, schema, noindex: !COPY_APPROVED,
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
        <div class="game-hero__media">${logoImg(g, 132, 132, '132px', true)}</div>
        <div class="game-hero__meta">
          <h1>${esc(g.name)} — ${esc(shortCat(c))} App Details</h1>
          <div class="game-hero__tags">
            <span class="tag">${esc(c.label)}</span>
            <span class="tag">Android</span>
          </div>
          <div class="game-hero__actions">
            <a class="btn btn--ghost" href="${catUrl(c.slug)}">All ${esc(c.label)}</a>
            <a class="btn btn--ghost" href="${dirUrl}">All games</a>
          </div>
        </div>
      </div>

${body}
${specTable}

      <div class="ad-slot ad-slot--leaderboard" aria-hidden="true">Reserved</div>

${relatedBlock}
    </div>
` + footer(c.key);

  write(SITE.gamesDir ? `${SITE.gamesDir}/${g.slug}.html` : `${g.slug}.html`, html);
  return url;
}

/* ---------- Static pages ---------- */

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
    description: 'Responsible gaming guidance and support resources.',
    body: `      <p>Gaming should stay entertainment. If you choose to play, a few habits help keep
      it that way:</p>
      <ul>
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
  const pending = pg.pending ? `      <div class="content-pending">
        <p><strong>Content pending.</strong> This page needs copy reviewed and approved before
        publication. It is generated as a structural placeholder so navigation, breadcrumbs and
        internal links are complete and testable.</p>
      </div>` : '';

  write(`pages/${pg.slug}.html`, head({
    url, nav: pg.slug, schema, noindex: pg.pending,
    title: `${plain} | ${SITE.brand}`, description: pg.description,
  }) + `
${breadcrumb(trail)}

    <div class="container">
      <div class="prose" style="padding-bottom:var(--space-12)">
        <h1 style="margin-bottom:var(--space-5)">${pg.title}</h1>
${pg.body}
${pending}
      </div>
    </div>
` + footer(pg.slug));
}

function build404() {
  write('404.html', head({
    url: '/404.html', nav: '', noindex: true,
    title: `Page not found | ${SITE.brand}`,
    description: 'The page you were looking for does not exist.',
  }) + `
    <section class="hero">
      <div class="container">
        <h1>Page not found</h1>
        <p class="hero__lede">That page does not exist or has moved.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="${dirUrl}">Browse all games</a>
          <a class="btn btn--ghost" href="/">Go home</a>
        </div>
      </div>
    </section>
` + footer(''));
}

/* ---------- Search index + sitemap ---------- */

function buildSearchIndex() {
  const widthFor = (g) => (OPT[g.slug] || [])[0];
  const rows = GAMES.map((g) => ({
    n: g.name, u: gameUrl(g.slug), c: catBy[g.category].label,
    t: widthFor(g) ? `/assets/img/games/opt/${g.slug}-${widthFor(g)}.webp`
      : (g.logo ? '/' + g.logo : ''),
  }));
  write('assets/data/search-index.json', JSON.stringify(rows));
  return rows.length;
}

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

/* ---------- Run ---------- */

const indexable = [{ loc: '/', priority: '1.0' }];
buildHome();
build404();
STATIC_PAGES.forEach(buildStatic);
indexable.push({ loc: buildDirectory(), priority: '0.9' });
CATS.forEach((c) => indexable.push({ loc: buildCategory(c), priority: '0.8' }));

let pending = 0;
GAMES.forEach((g) => {
  const u = buildGame(g);
  if (COPY_APPROVED) indexable.push({ loc: u, priority: '0.7' });
  else pending++;
});
STATIC_PAGES.filter((p) => !p.pending)
  .forEach((p) => indexable.push({ loc: `/pages/${p.slug}.html`, priority: '0.4' }));

const n = buildSearchIndex();
buildSitemap(indexable);

console.log(`home + 404     : 2`);
console.log(`static pages   : ${STATIC_PAGES.length} (${STATIC_PAGES.filter((p) => p.pending).length} noindex, copy pending)`);
console.log(`directory      : 1`);
console.log(`category hubs  : ${CATS.length}`);
console.log(`game pages     : ${GAMES.length}  (${pending} noindex, copy pending)`);
console.log(`search index   : ${n} entries`);
console.log(`sitemap entries: ${indexable.length}`);
console.log(`logos          : ${GAMES.filter((g) => g.logo).length}/${GAMES.length}, rest on placeholder`);
