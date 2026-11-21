# Pietro's Bachelor Party — "Vice Weekend" Build Plan

**Miami · March 19–21, 2027**
Theme: GTA VI key-art / Miami Vice / 80s synthwave. Think pink-to-violet sunset gradients, palm silhouettes, neon, comic-panel art, a loading screen and a HUD.

This plan is written so several agents can build the site in parallel without editing the same files. Read **§1–4** before starting any workstream.

---

## 0. Reference & ground rules

- **Reference site:** `../mario-bachelor-party-website/` (static `index.html`, `logistica.html`, `script.js`, `styles.css`). Reuse its *behaviors*: flip cards, countdown, smooth scroll, active nav, hamburger, flight tables with FlightAware links, room table, Google Maps embed with a "Book Your Room" button. Don't copy its look.
- **Stack:** plain static HTML + CSS + vanilla JS, with no build step and no framework, same as Mario's. It must work when opened from `file://` and deploy as-is to GitHub Pages or Vercel. That means **classic `<script defer>` tags, not ES modules**.
- **Inspired by, not copied:** We're evoking the GTA VI *vibe* but not using Rockstar's assets. So:
  - No GTA logo, no "Grand Theft Auto" text, no Pricedown font, no ripped game art or screenshots.
  - The wordmark is our own, built from Google Fonts (see §2).
  - The parody title **"Grand Theft Pietro"** is fine as a joke for a private site, as long as it's set in our own type.
  - All decorative art (palms, skyline, sun, grid, stars) is hand-made inline SVG/CSS.
- **People photos:** The user will drop AI-generated cartoon portraits into `images/crew/`. Until they arrive, the site must look finished with **styled silhouette placeholders**, never broken images.

---

## 1. Information architecture

| Mario section | Pietro version | Notes |
|---|---|---|
| Nav (`MG · 2026`) | **HUD nav**: `GTP · 2027` logo, links, wanted-level stars | Stars fill in as you scroll down the page |
| Countdown bar | **HUD countdown**: GTA-style money/clock readout `DD:HH:MM:SS` | Target: Fri Mar 19 2027, 3:00 PM ET (`2027-03-19T15:00:00-04:00`, since DST is in effect) |
| *(none)* | **Loading screen** (new) | Shown on first visit per session; skippable; rotating "TIP:" lines |
| Hero | **Key-art hero**: sunset, palms, skyline, title, dates | "Grand Theft Pietro", subtitle "Vice Weekend · Miami, FL · March 19–21, 2027" |
| La Famiglia | **Most Wanted** (`#crew`) | Comic-panel collage grid. Groom gets the big hero panel. Cards flip to show epithet + bio |
| Il Programma | **Missions** (`#missions`) | Each event is a mission card. Status is computed from the date: LOCKED / ACTIVE / COMPLETE |
| Map + Book Room | **Safehouse** (`#safehouse`) | Map embed, address, check-in/out, "Book Your Room" CTA |
| La Logistica page | **`logistics.html` "Flight Plan"** | Arrivals, departures, safehouse room assignments, getting around, loadout (packing), weather and dress code |
| Footer | **Footer** | "Miami, March 2027 · What happens in Vice, stays in Vice." |

Optional stretch (only after everything else is done): **"Vice FM" radio ticker**, a marquee of made-up station/track names with no audio, plus a small Konami-code easter egg that sets wanted level to 5 stars.

---

## 2. Design system (Workstream 0 owns this)

### Palette (CSS custom properties in `css/base.css`)
```css
--sunset-1: #ff7a59;   /* horizon orange */
--sunset-2: #ff3d81;   /* hot pink */
--sunset-3: #b83dba;   /* magenta */
--sunset-4: #5b2a86;   /* violet */
--night:    #1a1033;   /* deep indigo bg */
--night-2:  #241544;   /* surface */
--ink:      #0d0820;   /* panel borders, comic outlines */
--neon-cyan:#2de2e6;   /* accents, links */
--neon-pink:#ff2a6d;
--palm:     #120a24;   /* silhouette fill */
--text:     #fff4f8;
--muted:    #c7b3d9;
--gold:     #ffd166;   /* money/HUD readouts */
```
The sunset gradient is the main background for the hero and the section dividers. Sections sit on `--night` with subtle grain and scanline overlays (CSS only).

### Type (Google Fonts only)
- **Wordmark / big headings:** `Anton` (tall condensed, poster feel). Use a white fill, a thick `--ink` outline via `-webkit-text-stroke` / `paint-order`, and a gradient-filled duplicate layer.
- **Neon script accent** (e.g. "Vice Weekend", epithets): `Yellowtail` or `Mr Dafoe`. Pick one.
- **HUD / numbers / labels:** `Rajdhani` or `Chakra Petch` (600/700).
- **Body:** `Inter` 400/600.

### Motifs & components
- **Comic panel:** thick `--ink` border (4–6px), slight inner shadow, offset hard drop shadow, and the image fills the panel. On desktop, panels sit at small random rotations (±1.5°) set by the `--tilt` variable.
- **Sunset sun:** a striped half-circle (CSS `repeating-linear-gradient` mask) behind the hero title.
- **Synthwave grid floor:** a perspective-transformed CSS grid in hero and footer, slowly scrolling. It must be disabled under `prefers-reduced-motion`.
- **Palms + skyline:** one inline SVG sprite in `images/svg/` with `<symbol>`s: `palm-a`, `palm-b`, `skyline`, `star`, `plane`.
- **Wanted stars:** 5 SVG stars in the nav. Filled count = `ceil(scrollProgress * 5)`.
- **Buttons:** pill-shaped with neon-pink glow and a hover state that "lights up". Keep focus outlines visible.
- **Section header pattern:** a small HUD label above (`// MISSION LOG`), a big Anton title, and a script subtitle beneath.

### Layout & a11y requirements (every workstream)
- Mobile first. Works at 360px wide with no horizontal scroll and a 16px gutter.
- Respect `prefers-reduced-motion`: no grid scroll, no loading animation (skip it entirely), no tilt.
- Color contrast AA for body text. Neon is for accents only, never for body copy.
- Every image has `alt`. Flip cards must be keyboard operable: `button` or `tabindex="0"`, Enter/Space toggles, `aria-pressed`.

---

## 3. File structure & ownership

Each file has exactly **one owning workstream**. Others may *read* it but must not edit it. If you need a change in someone else's file, leave a `TODO(WS-x):` note in your own file and mention it in your final report.

```
/
├── index.html                 WS0 (skeleton with empty <section> mounts) → see §4 for who fills what
├── logistics.html             WS4
├── PLAN.md                    —
├── css/
│   ├── base.css               WS0  tokens, reset, typography, utilities, nav, footer, buttons, panel
│   ├── intro-hud.css          WS1  loading screen, HUD countdown, wanted stars
│   ├── hero.css               WS1
│   ├── crew.css               WS2
│   ├── missions.css           WS3  missions + safehouse
│   └── logistics.css          WS4
├── js/
│   ├── data.js                WS0 creates the schema + placeholder rows; content filled by WS5
│   ├── core.js                WS0  nav, hamburger, smooth scroll, active nav, shared helpers (h(), fmtDate)
│   ├── intro-hud.js           WS1
│   ├── crew.js                WS2
│   ├── missions.js            WS3
│   └── logistics.js           WS4
├── images/
│   ├── crew/                  USER drops portraits here (see §6)
│   ├── svg/sprite.svg         WS1
│   ├── placeholder-crew.svg   WS2
│   ├── og-image.png           WS6 (1200×630 social preview)
│   └── favicon.svg            WS1
```

### Section mounts in `index.html` (WS0 writes these exact IDs)
```html
<div id="intro"></div>              <!-- WS1 -->
<nav id="nav">…</nav>               <!-- WS0 markup; WS1 adds stars via JS into #wanted -->
<div id="hud"></div>                <!-- WS1 countdown -->
<section id="hero"></section>       <!-- WS1 -->
<section id="crew"></section>       <!-- WS2 -->
<section id="missions"></section>   <!-- WS3 -->
<section id="safehouse"></section>  <!-- WS3 -->
<footer id="footer">…</footer>      <!-- WS0 -->
```
Hero is written as static HTML by WS1 *inside* `#hero` (WS1 may edit only between the `<!-- WS1:hero START/END -->` markers). Crew and Missions are **rendered from `js/data.js`** so content edits never touch markup.

### Script load order (all `defer`)
`data.js → core.js → intro-hud.js → crew.js → missions.js` (index) and `data.js → core.js → logistics.js` (logistics). Each feature file exposes one `init*()` function and calls itself on `DOMContentLoaded` *only if its mount element exists*.

---

## 4. Data contract — `js/data.js`

All content lives here as globals on `window.VICE`. WS0 creates this file with the schema and placeholder rows **first**, so every other workstream can build against it at once.

```js
window.VICE = {
  event: {
    title: 'Grand Theft Pietro',
    subtitle: 'Vice Weekend',
    city: 'Miami, FL',
    start: '2027-03-19T15:00:00-04:00',
    end:   '2027-03-21T23:59:00-04:00',
    dateLabel: 'March 19–21, 2027',
    footer: 'What happens in Vice, stays in Vice.',
  },

  loadingTips: [
    'TIP: SPF 50 is not optional. Pietro is not carrying you home.',
    'TIP: Hydrate between South Beach and the club. Your liver has a wanted level too.',
    'TIP: Cuban coffee is a performance-enhancing drug. Use responsibly.',
    'TIP: Never split a check eight ways at 3 AM.',
    // WS5 adds more
  ],

  crew: [
    {
      slug: 'pietro',               // → images/crew/pietro.png (fallback .jpg)
      name: 'Pietro Conte',
      role: 'The Groom',            // only groom/best man etc.
      epithet: 'The Kingpin of South Beach',
      bio: '…',
      wanted: 5,                    // 1–5 stars on card back
      isGroom: true,
      tilt: 0,
    },
    // { slug, name, epithet, bio, wanted, tilt? } for everyone else
  ],

  missions: [
    {
      id: 'arrival',
      title: 'Touchdown in Vice',
      start: '2027-03-19T15:00:00-04:00',
      end:   '2027-03-19T18:00:00-04:00',
      location: 'TBD',
      mapsQuery: 'TBD',             // used for Google Maps link
      link: null,                   // optional event link
      objectives: ['Check into the safehouse', 'Change into linen', 'Report to the pool'],
      dressCode: null,
      tbd: true,                    // renders a "CLASSIFIED" stamp
    },
    // placeholders for Fri night, Sat day (boat/beach club), Sat dinner, Sat night, Sun recovery, departure
  ],

  safehouse: {
    name: 'TBD', address: 'TBD', mapsQuery: 'Miami Beach, FL',
    checkIn: 'Fri, Mar 19 · 3:00 PM', checkOut: 'Sun, Mar 21 · 11:00 AM',
    bookingUrl: null,
  },

  flights: {
    arrivals:   [ /* { name, from, departs, to:'MIA', arrives, flight:'AA 1234', trackUrl } */ ],
    departures: [ /* same shape */ ],
  },

  rooms: [ /* { room:'Suite 1', names:['…','…'] } */ ],

  gettingAround: [ /* { title, body } e.g. MIA→South Beach ~25 min Uber, FLL alternative */ ],
  loadout: [ /* packing items: 'Linen shirt ×2', 'Sunglasses', 'Swim trunks', … */ ],
  weather: { summary: 'Mid-March Miami averages highs ~80°F, lows ~67°F, low rain.', note: '' },
};
```
Rules: dates are ISO strings with an offset. Unknown fields use `'TBD'` or `null`, and the renderers must handle both gracefully (`TBD` → "CLASSIFIED" stamp, `null` → hide that row).

---

## 5. Workstreams

### Phase 1, sequential: WS0 Foundation (1 agent, run first)
**Goal:** a skeleton every other agent can build against.
- Create the files in §3. Write `index.html` with the mounts, nav markup (logo, links to `#crew`, `#missions`, `#safehouse`, `logistics.html`; hamburger; empty `<div id="wanted">`), footer, font links and script tags.
- `css/base.css`: tokens (§2), reset, type scale, `.container`, section header pattern, `.btn`, `.panel` (comic panel), nav (sticky, translucent `--night` with blur), mobile drawer, footer, grain/scanline overlay utility, reduced-motion guard.
- `js/core.js`: port `initSmoothScroll`, `initActiveNav`, `initHamburger` from Mario's `script.js`. Add helpers `VICE_UTIL.h(tag, attrs, ...children)`, `fmtDate(iso, opts)` (always formats in `America/New_York`), `mapsUrl(query)`, `scrollProgress()`.
- `js/data.js`: the full schema from §4 with placeholder rows (6 crew placeholders including the groom, 7 mission placeholders, empty flights/rooms).
- **Done when:** `index.html` opens from `file://` with nav, empty sections with headers, footer and no console errors. Then commit it and the parallel phase starts.

### Phase 2, parallel (WS1–WS4 at the same time, WS5 alongside)

#### WS1 — Loading screen, HUD, hero, SVG art
- **Loading screen** (`#intro`): full-screen sunset gradient, "GRAND THEFT PIETRO" wordmark, a progress bar that fills over ~2.5s, and one random `loadingTips` line cycling every 2s. "Press any key / tap to skip". Show once per session (`sessionStorage`, wrapped in try/catch). Skip entirely for reduced motion. Must never block content if JS fails, so the overlay is added *by JS*, not present in the HTML.
- **HUD countdown** (`#hud`): fixed top-right on desktop, a slim bar under the nav on mobile. Gold `Rajdhani` digits with a dark outline, label "TIME UNTIL VICE". After start: "MISSION ACTIVE". After end: "MISSION PASSED" with a little respect +100 gag.
- **Wanted stars:** render 5 stars into `#wanted` and fill them with scroll progress.
- **Hero:** layered scene: sunset gradient sky, striped sun, skyline silhouette, two palm silhouettes framing the sides, a perspective grid floor, an optional plane crossing slowly. Title: "Grand Theft" small over a huge "PIETRO", with "Vice Weekend" in neon script, and the date/city line. Add a scroll cue.
- **`images/svg/sprite.svg`** (palm-a, palm-b, skyline, star, plane) and **`favicon.svg`** (a pink "P" in a star or sun).
- **Done when:** hero looks like a movie poster at 360px and 1440px, the loader is skippable, and the countdown is correct for ET.

#### WS2 — "Most Wanted" crew section
- Render from `VICE.crew`. Section header: `// PERSONS OF INTEREST`, title "MOST WANTED", subtitle "The crew making it happen".
- **Layout:** a comic-panel collage inspired by the key-art grid. The groom is a large panel (spans 2 cols × 2 rows on desktop, full width on mobile) and the rest fill a dense CSS grid (`grid-auto-flow: dense`, panels at 4:5). Each panel gets a `--tilt` from data or a deterministic pseudo-random value based on its slug.
- **Front:** portrait, name in an Anton caption box bottom-left (comic caption style), and a small "TAP TO REVEAL" hint.
- **Back (flip):** dark panel with the epithet in neon script, name, wanted stars (1–5), bio. Use Mario's flip mechanic: one open at a time, keyboard accessible.
- **Images:** try `images/crew/{slug}.png`, then `.jpg`/`.jpeg`/`.webp` via an `onerror` chain, then `images/placeholder-crew.svg` (WS2 makes it: a palm-shadow silhouette on a sunset gradient with "?" or "PHOTO PENDING").
- Fade-in on scroll (port `initCardFadeIn`).
- **Done when:** it works with 6 placeholders and with 16 entries (WS2 should test with a temporary larger array but not commit it).

#### WS3 — Missions + Safehouse
- Render from `VICE.missions`, grouped by day ("FRIDAY 3.19", "SATURDAY 3.20", "SUNDAY 3.21") with Anton day headers.
- **Mission card:** a mission number (`MISSION 03`), title, time (formatted ET), location with a Maps link, an optional event link, an objectives checklist (decorative ☐ boxes), and a dress-code tag.
- **Status from current time:** `LOCKED` (future, dimmed with a padlock), `ACTIVE` (now, pulsing pink border), `COMPLETE` (past, "MISSION PASSED" stamp). `tbd: true` → a diagonal "CLASSIFIED" rubber stamp, with the location shown as redacted black bars.
- **Safehouse section:** a split layout with the Google Maps iframe in a comic panel (from `safehouse.mapsQuery`), name/address/check-in/out in a HUD-style list, and a "BOOK YOUR ROOM" button that is hidden when `bookingUrl` is null.
- **Done when:** changing the system clock (or a `?now=2027-03-20T14:00` query param, which you should implement for testing) shows the correct statuses.

#### WS4 — `logistics.html` "Flight Plan" page
- Reuse the nav/footer markup from `index.html` (copy it; nav links point to `index.html#…`, and "Flight Plan" is active).
- Sections, all rendered from `VICE`:
  1. **Arrivals: "INBOUND TO MIA"**, styled as an airport departures board: dark rows, monospace-ish HUD font, amber text, a subtle split-flap flicker on load (skipped under reduced motion). Columns as in Mario's version. FlightAware link built from the flight number if `trackUrl` is missing. Sort by arrival time.
  2. **Departures: "OUTBOUND"**, the same treatment, sorted by departure.
  3. **Safehouse assignments**: room cards rather than a table ("SUITE 1" plus names).
  4. **Getting around**: MIA vs FLL, Uber times, valet/parking notes.
  5. **Loadout**: a packing list styled like a weapon-wheel/inventory grid of tiles with emoji or SVG icons.
  6. **Weather & dress code**: a forecast-style card.
  - Empty states: "No intel yet. Send your flight to Bill." Keep Mario's table→card mobile transform (`data-label`).
- **Done when:** the page works with empty arrays and with sample rows (test locally, don't commit fake people).

#### WS5 — Content & copy (can run alongside WS1–4; only edits `js/data.js` content, not schema)
- Write in-voice copy: loading tips (10–15), mission titles (crime-caper names for real events, e.g. "The Yacht Job", "Operation Stone Crab", "Brunch Heist"), objectives, footer lines, empty-state lines.
- **Crew bios:** draft only for people the user has confirmed. Pietro's Mario-site bio is a starting point: "A true Italian OG from the formidable streets of Addison, Illinois… best-dressed man in Marina Del Rey." Leave others as `TODO` until the user supplies names and facts (see §8). Epithets should be GTA-flavored ("The Getaway Driver", "The Wheelman", "The Fixer", "Mr. Vice"), and we should avoid reusing Mario-site epithets.
- Itinerary content stays `tbd: true` until the user confirms venues. Suggest candidates in a comment block (e.g. a boat day on Biscayne Bay, a South Beach pool party, a steakhouse dinner, a Wynwood walk, LIV / E11EVEN) but don't present any as booked.

### Phase 3, sequential: WS6 Integration & QA (1 agent)
- Pull everything together and fix seams: z-index between nav/HUD/intro, consistent spacing, unified section header usage, no duplicated styles across CSS files.
- Check at 360 / 768 / 1024 / 1440, in light and dark OS settings (the site is always dark, but make sure nothing breaks), and with reduced motion.
- Accessibility: keyboard through nav, flip cards and skip loader. Alt text. Contrast.
- Performance: portraits at most ~300KB each (add a `scripts/optimize-images.sh` using `sips` on macOS, 1000px long edge, WebP or JPEG q80), `loading="lazy"` on all but the groom, preconnect fonts. Target Lighthouse ≥90 for Performance and Accessibility.
- `og-image.png` (1200×630) plus meta tags (title, description, `og:image`) so the link previews nicely in the group chat.
- Verify zero console errors on both pages from `file://` *and* from a local server (`npx serve .`).
- `README.md` covering how to add a crew member, add a flight, drop in photos, and deploy.
- Deploy: create the GitHub repo `pietros-bachelor-party-website` and GitHub Pages (to match Mario's setup), or Vercel. **Ask the user before creating the repo or deploying.**

---

## 6. Portrait spec (for the user's AI-generated images)

So the cards look consistent:
- **Filename:** `images/crew/{slug}.png`, where `slug` matches `data.js` (lowercase first name, or `firstlast` for duplicates, e.g. `joetoia`).
- **Aspect:** 4:5 portrait, ≥1000×1250. Subject framed chest-up, centered, with some headroom (the name caption covers the bottom ~18%).
- **Style prompt template:**
  > Illustrated portrait in the style of 2020s crime-game key art: bold clean linework, cel-shaded, saturated colors. Miami at sunset behind the subject, pink-orange-violet gradient sky, palm tree silhouettes. Confident pose, [outfit/prop: linen shirt, sunglasses, cigar, etc.]. No text, no logos.
- **Groom (Pietro):** one extra-wide hero image optional, `images/crew/pietro-wide.png` at 16:9, used as a background on the groom panel at desktop sizes if present.
- Keep backgrounds similar (sunset) so the grid reads as one set, and vary the props for personality.

---

## 7. Agent kickoff prompts (copy-paste)

Each agent gets: *"Read `PLAN.md` §0–4 and your workstream section. Only edit files you own (§3). Don't change the `window.VICE` schema; if you need a new field, add it as optional with a fallback and report it. Verify in a browser at 360px and 1440px before finishing. Report: files changed, anything left TODO, and any cross-workstream requests."*

| Order | Agent | Brief |
|---|---|---|
| 1 | WS0 | Foundation (§5 Phase 1) |
| 2 (parallel) | WS1, WS2, WS3, WS4, WS5 | §5 Phase 2 |
| 3 | WS6 | Integration & QA (§5 Phase 3) |

Git: `git init` in WS0 with one commit per workstream. Parallel agents should use separate worktrees/branches (`ws1-hero`, `ws2-crew`, …). Because file ownership doesn't overlap, merges should be conflict-free except `index.html`, where only WS1 edits inside its hero markers.

---

## 8. Open questions for the user (fill in before WS5/WS6)

1. **Crew list:** names, slugs and any fun facts or inside jokes for bios/epithets. Is it the same group as Mario's party?
2. **Where are we staying?** Hotel or rental name and address, plus a booking link if people book their own rooms.
3. **Confirmed events:** boat day, dinner reservation, clubs or day parties, with times.
4. **Arrival airport:** is everyone flying into MIA, or is FLL fine too?
5. **Who's the point of contact** for "send your flight to ___"? (Bill on Mario's site.)
6. **Deploy target:** GitHub Pages (like Mario's) or Vercel? Should the site be unlisted or password-protected?
7. **Title check:** are you happy with "Grand Theft Pietro" / "Vice Weekend", or do you prefer something else ("Pietro's Vice", "Grand Theft Groom")?
