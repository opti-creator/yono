# yono

Planning repo for a **Yono games directory site** — green design system, ~90 game pages, SEO-first.

Nothing is built yet. This repo holds the build spec, the game roster, and the arranged artwork.

**Artwork status: 57 of 90 games have logos.** The 62 files uploaded to `main` were renamed to
match their roster slug and moved into `assets/img/games/`. See `assets/README.md` for the missing
list and the one file still needing a decision.

## What's here

| Path | What it is |
|---|---|
| `BUILD-PROMPT.md` | **The deliverable.** A complete, copy-paste prompt for a coding agent to build the whole site. Fill in §1 first. |
| `data/games.json` | Canonical roster — 90 games across 7 categories, with slugs the build keys off. |
| `assets/README.md` | Artwork status: what's in place, the 33 missing logos, and naming rules. |
| `assets/img/games/` | 57 game logos, slug-named, plus a green `_placeholder.svg`. |

## How to use it

1. Fill in the `«FILL»` fields in **`BUILD-PROMPT.md` §1** — domain, brand, primary keyword,
   support email, and the real-money-gambling yes/no (that one changes the compliance rules).
2. Drop logo files into `assets/img/games/` following `assets/README.md`. Missing logos are fine —
   the build falls back to a placeholder and reports the gaps.
3. Paste `BUILD-PROMPT.md` as the prompt.

## Notes on the data

The roster was cross-checked against several public Yono directory sites. Their **bonus amounts,
ratings and app specs contradict each other heavily** (the same game is listed at ₹51, ₹320 and
₹1,500 across three sources), so every numeric field in `data/games.json` is deliberately `null`.
The build prompt instructs the agent not to invent them, and not to emit `aggregateRating` or
`offers` schema without verified values. Supply real figures before switching those rows on.

`https://moreyonogames.com/` is referenced in the prompt for **scope only** — what kind of site this
is. The design and all copy are specified as original work, not a reproduction of that site.

## Legal

The compliance templates referenced in the prompt (age gate, restricted-states notice, responsible
gaming, disclaimers) reflect common industry practice for India-facing gaming sites. They are **not
legal advice** — have a qualified professional review them before launch.
