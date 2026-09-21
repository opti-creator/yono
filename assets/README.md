# Assets — status and drop instructions

**Current coverage: 57 of 90 games have artwork. 33 still missing.**

The 62 files uploaded to `main` have been renamed to their game slug and moved into
`assets/img/games/`. The build reads paths from `data/games.json` (`logo` / `logoFallback`)
— it does **not** guess filenames, so extensions can differ per game.

## What's in place

| Path | Contents |
|---|---|
| `assets/img/games/<slug>.<ext>` | 57 game logos (mixed `.webp`, `.png`, `.jpg`) |
| `assets/img/games/_placeholder.svg` | Green placeholder for the 33 games with no logo |
| `assets/img/icons/logo.jpg` | Site brand mark ("ALL Diwa GAMES") |
| `assets/img/icons/icon-controller.svg`, `icon-trophy.svg`, `icon-players.svg` | UI icons |
| `assets/img/_unsorted/diwa-x.webp` | **Unidentified** — see below |

## Still needed

- Logos for the 33 games listed below.
- `assets/img/og/` social cards, 1200x630 (home + one per category).
- `assets/img/icons/icon-192.png`, `icon-512.png`, `favicon.ico`.
- `assets/fonts/` self-hosted WOFF2.

## Naming rules for anything you add

- Filename = the game's `slug` from `data/games.json`, e.g. `spin-crush.webp`.
- Square, 256x256 or larger. Transparent or dark-safe — the site ground is `#0A1A0F`,
  so a logo baked onto white becomes a white tile.
- Keep each file well under 100KB; 90 logos share one directory page.
- Lowercase, hyphens only, no spaces, no `(1)` suffixes.
- After adding files, re-run the arrange step so `data/games.json` picks up the new paths.

## One file needs your call

`assets/img/_unsorted/diwa-x.webp` is a **DiwaX.com** brand logo. It is not one of the 90
games in the roster. Tell me whether it is a separate brand, an additional game to add, or
an alternate site mark, and I will file it.

---

## Missing logos — 33 games

### Rummy (12 missing)

- [ ] `game-rummy` — Game Rummy
- [ ] `gold-rummy` — Gold Rummy
- [ ] `inr-rummy` — INR Rummy
- [ ] `joy-rummy` — Joy Rummy
- [ ] `love-rummy` — Love Rummy
- [ ] `money-rummy` — Money Rummy
- [ ] `ok-rummy` — OK Rummy
- [ ] `rumble-rummy` — Rumble Rummy
- [ ] `rummy-77` — Rummy 77
- [ ] `rummy-91` — Rummy 91
- [ ] `rummy-yono` — Rummy Yono
- [ ] `win-rummy` — Win Rummy

### Slots & 777 (12 missing)

- [ ] `777-game` — 777 Game
- [ ] `diwa-777` — Diwa 777
- [ ] `diwa-slots` — Diwa Slots
- [ ] `good-slots` — Good Slots
- [ ] `ind-slots` — Ind Slots
- [ ] `inr-slots` — INR Slots
- [ ] `rani-slots` — Rani Slots
- [ ] `slots-spin` — Slots Spin
- [ ] `slots-winner` — Slots Winner
- [ ] `spin-777` — Spin 777
- [ ] `yn-777` — YN 777
- [ ] `yono-slots` — Yono Slots

### Teen Patti & VIP Club (5 missing)

- [ ] `club-inr` — Club INR
- [ ] `diwa-vip` — Diwa VIP
- [ ] `jai-club` — Jai Club
- [ ] `neta-vip` — Neta VIP
- [ ] `teen-patti-master` — Teen Patti Master

### Arcade & Casual (4 missing)

- [ ] `diwa-game` — Diwa Game
- [ ] `diwa-top` — Diwa Top
- [ ] `diwa-win` — Diwa Win
- [ ] `raja-luck` — Raja Luck

---

## Supplied — 57 games

### Rummy (14)

- [x] `abc-rummy.webp` — ABC Rummy
- [x] `boss-rummy.webp` — Boss Rummy
- [x] `gogo-rummy.png` — GoGo Rummy
- [x] `hi-rummy.webp` — Hi Rummy
- [x] `ind-rummy.webp` — Ind Rummy
- [x] `jaiho-rummy.webp` — JaiHo Rummy
- [x] `max-rummy.webp` — Max Rummy
- [x] `rummy-365.png` — Rummy 365
- [x] `rummy-888.webp` — Rummy 888
- [x] `rummy-zip.webp` — Rummy Zip
- [x] `top-rummy.webp` — Top Rummy
- [x] `winzo-rummy.webp` — Winzo Rummy
- [x] `yn-rummy.webp` — YN Rummy
- [x] `yono-rummy.png` — Yono Rummy

### Slots & 777 (23)

- [x] `101z.png` — 101z
- [x] `567-slots.webp` — 567 Slots
- [x] `789-jackpots.png` — 789 Jackpots
- [x] `bet-213-slots.webp` — Bet 213 Slots
- [x] `ever-777.webp` — Ever 777
- [x] `goa-spin.webp` — Goa Spin
- [x] `hindi-777.webp` — Hindi 777
- [x] `jaiho-777.png` — JaiHo 777
- [x] `jaiho-91.png` — JaiHo 91
- [x] `jaiho-slots.webp` — JaiHo Slots
- [x] `jaiho-spin.webp` — JaiHo Spin
- [x] `my-777.png` — My 777
- [x] `saga-slots.webp` — Saga Slots
- [x] `share-slots.webp` — Share Slots
- [x] `spin-101.webp` — Spin 101
- [x] `spin-crush.webp` — Spin Crush
- [x] `spin-gold.webp` — Spin Gold
- [x] `spin-lucky.png` — Spin Lucky
- [x] `spin-winner.png` — Spin Winner
- [x] `svip-777.webp` — SVIP 777
- [x] `yes-spin.webp` — Yes Spin
- [x] `yono-777.png` — Yono 777
- [x] `yoyo-slots.webp` — YoYo Slots

### Teen Patti & VIP Club (2)

- [x] `ind-club.webp` — Ind Club
- [x] `yono-vip.webp` — Yono VIP

### Arcade & Casual (9)

- [x] `dhan-game.jpg` — Dhan Game
- [x] `diwa-king.webp` — Diwa King
- [x] `diwa-lucky.webp` — Diwa Lucky
- [x] `diwa-play.webp` — Diwa Play
- [x] `jaiho-arcade.png` — JaiHo Arcade
- [x] `jaiho-win.webp` — JaiHo Win
- [x] `maha-games.png` — Maha Games
- [x] `yono-arcade.webp` — Yono Arcade
- [x] `yono-games.webp` — Yono Games

### Multi-Game Platforms (6)

- [x] `en-365.webp` — EN 365
- [x] `mbm-bet.png` — MBM Bet
- [x] `mdm-bet.webp` — MDM Bet
- [x] `mkm-bet.png` — MKM Bet
- [x] `mqm-bet.webp` — MQM Bet
- [x] `mwm-bet.webp` — MWM Bet

### Bingo (2)

- [x] `bingo-101.webp` — Bingo 101
- [x] `ind-bingo.webp` — Ind Bingo

### Ludo & Board (1)

- [x] `rummy-ludo.webp` — Rummy Ludo

