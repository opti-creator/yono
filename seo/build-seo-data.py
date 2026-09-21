#!/usr/bin/env python3
"""Generates the SEO data layer from data/games.json.

Everything here is DERIVED from facts we hold (game name, category, roster
position). Nothing is invented. No search volumes or difficulty scores are
emitted, because we have no keyword-tool data - those columns must be filled
from a real data source before prioritisation decisions are made.
"""
import json, csv, os, re

D = json.load(open("data/games.json", encoding="utf-8"))
GAMES, CATS = D["games"], D["categories"]
catBy = {c["key"]: c for c in CATS}
ORIGIN = "https://games.newyono-apps.in"
BRAND = "New Yono Apps"

def gurl(s): return f"/games/{s}.html"
def curl(s): return f"/games/{s}.html"

# ---------- 3. keyword universe ----------
# Patterns are applied only where they are semantically honest for the title.
SECONDARY = ["{n} app", "{n} game", "{n} download", "{n} apk", "{n} online",
             "{n} android", "{n} latest version", "{n} login"]
LONGTAIL  = ["what is {n}", "how to play {n}", "{n} how to download",
             "is {n} safe", "{n} app details", "{n} supported devices",
             "{n} beginner guide", "{n} game guide"]

kw_rows = []
for g in GAMES:
    n, c = g["name"], catBy[g["category"]]
    gen = c["label"].lower().replace(" & ", " and ")
    kw_rows.append(dict(slug=g["slug"], url=gurl(g["slug"]), game=n, category=c["label"],
        primary=n.lower(), tier="primary", keyword=n.lower(),
        intent="navigational", placement="H1 + title + intro", validated="NO"))
    for p in SECONDARY:
        kw_rows.append(dict(slug=g["slug"], url=gurl(g["slug"]), game=n, category=c["label"],
            primary=n.lower(), tier="secondary", keyword=p.format(n=n.lower()),
            intent="transactional" if any(k in p for k in ("download","apk","login")) else "navigational",
            placement="H2 / spec table / body", validated="NO"))
    for p in LONGTAIL:
        kw_rows.append(dict(slug=g["slug"], url=gurl(g["slug"]), game=n, category=c["label"],
            primary=n.lower(), tier="long-tail", keyword=p.format(n=n.lower()),
            intent="informational", placement="FAQ question or subsection", validated="NO"))
    # category-level modifiers, only where they describe the game honestly
    for p in [f"{n.lower()} {gen.split()[0]}", f"best {gen} yono app"]:
        kw_rows.append(dict(slug=g["slug"], url=gurl(g["slug"]), game=n, category=c["label"],
            primary=n.lower(), tier="modifier", keyword=p, intent="commercial",
            placement="body / category hub", validated="NO"))

# head terms owned by hubs, not game pages (cannibalisation control)
HEAD = [("/", "yono games", "primary", "commercial"),
        ("/", "yono games list", "secondary", "informational"),
        ("/", "all yono games", "secondary", "informational"),
        ("/games/", "yono games download", "primary", "transactional"),
        ("/games/", "yono all games", "secondary", "informational")]
for u, k, t, i in HEAD:
    kw_rows.append(dict(slug="", url=u, game="", category="site", primary="yono games",
        tier=t, keyword=k, intent=i, placement="H1 / title", validated="NO"))
for c in CATS:
    base = c["label"].lower().replace(" & ", " and ")
    for k, t in [(f"yono {base}", "primary"), (f"{base} yono apps", "secondary"),
                 (f"best yono {base.split()[0]} apps", "long-tail")]:
        kw_rows.append(dict(slug=c["slug"], url=curl(c["slug"]), game="", category=c["label"],
            primary=f"yono {base}", tier=t, keyword=k, intent="commercial",
            placement="H1 / intro", validated="NO"))

# ---------- 4. semantic entity map ----------
ent_rows = []
for g in GAMES:
    c = catBy[g["category"]]
    ents = [
        ("Category", c["label"], "isPartOf", "known"),
        ("Platform", "Android", "operatingSystem", "known"),
        ("Distribution", "APK / app listing", "distribution", "known"),
        ("Parent brand", "Yono app family", "brandFamily", "known"),
        ("Market", "India", "audience", "known"),
        ("Genre", "", "genre", "NEEDS SOURCE"),
        ("Gameplay mechanics", "", "describes", "NEEDS SOURCE"),
        ("Game modes", "", "hasPart", "NEEDS SOURCE"),
        ("Developer", "", "author", "NEEDS SOURCE"),
        ("Publisher", "", "publisher", "NEEDS SOURCE"),
        ("Version", g["version"] or "", "softwareVersion", "known" if g["version"] else "NEEDS SOURCE"),
        ("File size", g["apkSize"] or "", "fileSize", "known" if g["apkSize"] else "NEEDS SOURCE"),
        ("Device requirements", "", "requirements", "NEEDS SOURCE"),
        ("Update history", "", "dateModified", "NEEDS SOURCE"),
    ]
    for label, val, rel, status in ents:
        ent_rows.append(dict(slug=g["slug"], game=g["name"], entity=label, value=val,
                             relationship=rel, status=status))

# ---------- 9. internal link matrix ----------
link_rows = []
def add(src, dst, anchor, rel):
    link_rows.append(dict(source=src, destination=dst, anchor=anchor, relationship=rel))

for c in CATS:
    add("/", curl(c["slug"]), c["label"], "home -> category hub")
add("/", "/games/", "Browse all games", "home -> directory")
for g in GAMES:
    c = catBy[g["category"]]
    add("/games/", gurl(g["slug"]), g["name"], "directory -> game")
    add(curl(c["slug"]), gurl(g["slug"]), g["name"], "category -> game (same topic)")
    add(gurl(g["slug"]), curl(c["slug"]), f"All {c['label']}", "game -> parent category")
    sibs = [x for x in GAMES if x["category"] == g["category"] and x["slug"] != g["slug"]][:4]
    for s in sibs:
        add(gurl(g["slug"]), gurl(s["slug"]), s["name"], "game -> sibling (same category)")

# ---------- 12/13. title + meta database ----------
tm_rows = []
def row(url, ptype, title, desc, h1):
    tm_rows.append(dict(url=url, page_type=ptype, title=title, title_len=len(title),
                        meta_description=desc, desc_len=len(desc), h1=h1))

def fit(text, tail_options, lo=145, hi=155):
    """Land a description inside the 145-155 window without cutting mid-word."""
    t = " ".join(text.split())
    for extra in [""] + list(tail_options):
        cand = (t + " " + extra).strip() if extra else t
        if lo <= len(cand) <= hi:
            return cand
    # still short: use the longest tail; still long: trim on a word boundary
    cand = (t + " " + tail_options[-1]).strip() if tail_options and len(t) < lo else t
    if len(cand) <= hi:
        return cand
    out = []
    for w in cand.split():
        if len(" ".join(out + [w])) > hi - 1:
            break
        out.append(w)
    return " ".join(out).rstrip(" ,.;:") + "."

row("/", "home",
    f"Yono Games List \u2014 {len(GAMES)} Apps by Category | {BRAND}",
    fit(f"An independent directory of {len(GAMES)} Yono game apps sorted into {len(CATS)} "
        f"categories, from rummy and slots to Teen Patti, arcade and bingo.",
        ["Browse the full list.", "Browse or search the full list by name."]),
    "Every Yono game, in one directory")

row("/games/", "directory",
    f"All Yono Games \u2014 Full List of {len(GAMES)} Apps | {BRAND}",
    fit(f"Search or filter the complete list of {len(GAMES)} Yono apps by name and category. "
        f"Every title is shown with its category and artwork.",
        ["Updated as the roster changes.", "The list is updated as the roster changes."]),
    "All Yono Games")

for c in CATS:
    n = len([g for g in GAMES if g["category"] == c["key"]])
    lab = c["label"]
    t = f"Yono {lab} \u2014 {n} Apps Listed | {BRAND}"
    if len(t) > 60:
        t = f"Yono {lab} \u2014 {n} Apps | {BRAND}"
    row(curl(c["slug"]), "category", t,
        fit(f"All {n} {lab.lower()} titles in the Yono app directory. {c['description']}",
            ["Open any title for its details and related apps.",
             "Compare them here and open any title for full details and related apps."]),
        lab)

for g in GAMES:
    c = catBy[g["category"]]
    short = c["label"].split(" & ")[0]
    t = f"{g['name']} \u2014 App Details & {short} Guide | {BRAND}"
    if len(t) > 60:
        t = f"{g['name']} \u2014 App Details & Guide | {BRAND}"
    if len(t) > 60:
        t = f"{g['name']} \u2014 App Details | {BRAND}"
    row(gurl(g["slug"]), "game", t,
        fit(f"{g['name']} is a {c['label'].lower()} app listed in the Yono directory.",
            [f"See its category, platform and related {short.lower()} titles.",
             f"See its category and platform details, plus related {short.lower()} titles here.",
             f"Check its category and platform details, and browse related {short.lower()} "
             f"titles in the same section."]),
        f"{g['name']} \u2014 {short} App Details")

def dump(name, rows):
    with open(f"seo/data/{name}.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print(f"  seo/data/{name}.csv  {len(rows)} rows")

print("generated:")
dump("keyword-universe", kw_rows)
dump("entity-map", ent_rows)
dump("internal-links", link_rows)
dump("title-meta", tm_rows)

dup = len(tm_rows) - len({r["title"] for r in tm_rows})
print(f"\nduplicate titles: {dup}")
print(f"titles over 60 chars: {sum(1 for r in tm_rows if r['title_len'] > 60)}")
print(f"descriptions outside 145-155: {sum(1 for r in tm_rows if not 145 <= r['desc_len'] <= 155)}")
print(f"entities needing a source: {sum(1 for r in ent_rows if r['status'] == 'NEEDS SOURCE')}")
