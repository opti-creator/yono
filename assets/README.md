# Assets — drop instructions

Everything the build needs from you goes here. Filenames matter: the build matches
images to games **by slug**, so a file named `yono-rummy.webp` lands on the Yono Rummy
page automatically. A misnamed file is simply not found — no error, just a placeholder.

## Folders

```
assets/img/games/    <slug>.webp + <slug>.png   256x256, one pair per game
assets/img/games/    _placeholder.svg           shown when a logo is missing
assets/img/hero/     hero art for the home page
assets/img/og/       1200x630 social cards (home + one per category)
assets/img/icons/    icon-192.png, icon-512.png, logo.png, favicon.ico
assets/fonts/        self-hosted WOFF2
```

## Rules

- **WebP primary, PNG fallback.** Same slug, both extensions. PNG alone works; the build
  just skips the `<source>`.
- **256x256**, square, transparent or dark-safe background — the site ground is near-black
  green (`#0A1A0F`), so a logo baked onto white will look like a white tile.
- **Keep each file well under 100KB.** 90 logos on the directory page is the heaviest view.
- **Lowercase filenames**, hyphens only, no spaces and no `(1)` suffixes.
- Missing a logo is fine — the placeholder covers it. Never substitute another game's logo.

## Checklist — 90 logo slots

Tick as you drop each file in `assets/img/games/`.

### Rummy (26)

- [ ] `abc-rummy.webp` / `abc-rummy.png` — ABC Rummy
- [ ] `boss-rummy.webp` / `boss-rummy.png` — Boss Rummy
- [ ] `game-rummy.webp` / `game-rummy.png` — Game Rummy
- [ ] `gogo-rummy.webp` / `gogo-rummy.png` — GoGo Rummy
- [ ] `gold-rummy.webp` / `gold-rummy.png` — Gold Rummy
- [ ] `hi-rummy.webp` / `hi-rummy.png` — Hi Rummy
- [ ] `ind-rummy.webp` / `ind-rummy.png` — Ind Rummy
- [ ] `inr-rummy.webp` / `inr-rummy.png` — INR Rummy
- [ ] `jaiho-rummy.webp` / `jaiho-rummy.png` — JaiHo Rummy
- [ ] `joy-rummy.webp` / `joy-rummy.png` — Joy Rummy
- [ ] `love-rummy.webp` / `love-rummy.png` — Love Rummy
- [ ] `max-rummy.webp` / `max-rummy.png` — Max Rummy
- [ ] `money-rummy.webp` / `money-rummy.png` — Money Rummy
- [ ] `ok-rummy.webp` / `ok-rummy.png` — OK Rummy
- [ ] `rumble-rummy.webp` / `rumble-rummy.png` — Rumble Rummy
- [ ] `rummy-365.webp` / `rummy-365.png` — Rummy 365
- [ ] `rummy-77.webp` / `rummy-77.png` — Rummy 77
- [ ] `rummy-888.webp` / `rummy-888.png` — Rummy 888
- [ ] `rummy-91.webp` / `rummy-91.png` — Rummy 91
- [ ] `rummy-yono.webp` / `rummy-yono.png` — Rummy Yono
- [ ] `rummy-zip.webp` / `rummy-zip.png` — Rummy Zip
- [ ] `top-rummy.webp` / `top-rummy.png` — Top Rummy
- [ ] `win-rummy.webp` / `win-rummy.png` — Win Rummy
- [ ] `winzo-rummy.webp` / `winzo-rummy.png` — Winzo Rummy
- [ ] `yn-rummy.webp` / `yn-rummy.png` — YN Rummy
- [ ] `yono-rummy.webp` / `yono-rummy.png` — Yono Rummy

### Slots & 777 (35)

- [ ] `101z.webp` / `101z.png` — 101z
- [ ] `567-slots.webp` / `567-slots.png` — 567 Slots
- [ ] `777-game.webp` / `777-game.png` — 777 Game
- [ ] `789-jackpot.webp` / `789-jackpot.png` — 789 Jackpot
- [ ] `bet-213-slots.webp` / `bet-213-slots.png` — Bet 213 Slots
- [ ] `diwa-777.webp` / `diwa-777.png` — Diwa 777
- [ ] `diwa-slots.webp` / `diwa-slots.png` — Diwa Slots
- [ ] `ever-777.webp` / `ever-777.png` — Ever 777
- [ ] `goa-spin.webp` / `goa-spin.png` — Goa Spin
- [ ] `good-slots.webp` / `good-slots.png` — Good Slots
- [ ] `hindi-777.webp` / `hindi-777.png` — Hindi 777
- [ ] `ind-slots.webp` / `ind-slots.png` — Ind Slots
- [ ] `inr-slots.webp` / `inr-slots.png` — INR Slots
- [ ] `jaiho-777.webp` / `jaiho-777.png` — JaiHo 777
- [ ] `jaiho-91.webp` / `jaiho-91.png` — JaiHo 91
- [ ] `jaiho-slots.webp` / `jaiho-slots.png` — JaiHo Slots
- [ ] `jaiho-spin.webp` / `jaiho-spin.png` — JaiHo Spin
- [ ] `my-777.webp` / `my-777.png` — My 777
- [ ] `rani-slots.webp` / `rani-slots.png` — Rani Slots
- [ ] `saga-slots.webp` / `saga-slots.png` — Saga Slots
- [ ] `share-slots.webp` / `share-slots.png` — Share Slots
- [ ] `slots-spin.webp` / `slots-spin.png` — Slots Spin
- [ ] `slots-winner.webp` / `slots-winner.png` — Slots Winner
- [ ] `spin-101.webp` / `spin-101.png` — Spin 101
- [ ] `spin-777.webp` / `spin-777.png` — Spin 777
- [ ] `spin-crush.webp` / `spin-crush.png` — Spin Crush
- [ ] `spin-gold.webp` / `spin-gold.png` — Spin Gold
- [ ] `spin-lucky.webp` / `spin-lucky.png` — Spin Lucky
- [ ] `spin-winner.webp` / `spin-winner.png` — Spin Winner
- [ ] `svip-777.webp` / `svip-777.png` — SVIP 777
- [ ] `yes-spin.webp` / `yes-spin.png` — Yes Spin
- [ ] `yn-777.webp` / `yn-777.png` — YN 777
- [ ] `yono-777.webp` / `yono-777.png` — Yono 777
- [ ] `yono-slots.webp` / `yono-slots.png` — Yono Slots
- [ ] `yoyo-slots.webp` / `yoyo-slots.png` — YoYo Slots

### Teen Patti & VIP Club (7)

- [ ] `club-inr.webp` / `club-inr.png` — Club INR
- [ ] `diwa-vip.webp` / `diwa-vip.png` — Diwa VIP
- [ ] `ind-club.webp` / `ind-club.png` — Ind Club
- [ ] `jai-club.webp` / `jai-club.png` — Jai Club
- [ ] `neta-vip.webp` / `neta-vip.png` — Neta VIP
- [ ] `teen-patti-master.webp` / `teen-patti-master.png` — Teen Patti Master
- [ ] `yono-vip.webp` / `yono-vip.png` — Yono VIP

### Arcade & Casual (13)

- [ ] `dhan-game.webp` / `dhan-game.png` — Dhan Game
- [ ] `diwa-game.webp` / `diwa-game.png` — Diwa Game
- [ ] `diwa-king.webp` / `diwa-king.png` — Diwa King
- [ ] `diwa-lucky.webp` / `diwa-lucky.png` — Diwa Lucky
- [ ] `diwa-play.webp` / `diwa-play.png` — Diwa Play
- [ ] `diwa-top.webp` / `diwa-top.png` — Diwa Top
- [ ] `diwa-win.webp` / `diwa-win.png` — Diwa Win
- [ ] `jaiho-arcade.webp` / `jaiho-arcade.png` — JaiHo Arcade
- [ ] `jaiho-win.webp` / `jaiho-win.png` — JaiHo Win
- [ ] `maha-games.webp` / `maha-games.png` — Maha Games
- [ ] `raja-luck.webp` / `raja-luck.png` — Raja Luck
- [ ] `yono-arcade.webp` / `yono-arcade.png` — Yono Arcade
- [ ] `yono-games.webp` / `yono-games.png` — Yono Games

### Multi-Game Platforms (6)

- [ ] `en-365.webp` / `en-365.png` — EN 365
- [ ] `mbm-bet.webp` / `mbm-bet.png` — MBM Bet
- [ ] `mdm-bet.webp` / `mdm-bet.png` — MDM Bet
- [ ] `mkm-bet.webp` / `mkm-bet.png` — MKM Bet
- [ ] `mqm-bet.webp` / `mqm-bet.png` — MQM Bet
- [ ] `mwm-bet.webp` / `mwm-bet.png` — MWM Bet

### Bingo (2)

- [ ] `bingo-101.webp` / `bingo-101.png` — Bingo 101
- [ ] `ind-bingo.webp` / `ind-bingo.png` — Ind Bingo

### Ludo & Board (1)

- [ ] `rummy-ludo.webp` / `rummy-ludo.png` — Rummy Ludo

---

Anything not in this list that the build asks for (OG cards, hero art, fonts) is called out
in `BUILD-PROMPT.md` §7. The build agent reports missing files before it starts, so you get
an exact gap list rather than discovering holes page by page.
