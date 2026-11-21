# Grand Theft Pietro 🌴

Pietro's bachelor party site for Miami, March 19–21, 2027. It's plain HTML/CSS/JS with no build step. You can open `index.html` straight from disk.

## Editing content
**All content lives in [`js/data.js`](js/data.js).** You never need to touch the HTML.

| To… | Edit in `data.js` |
|---|---|
| Add a crew member | Add an object to `crew: [...]`: `{ slug, name, epithet, bio, wanted: 1–5, photo }`. There's an epithet bank in the comment above it. |
| Add a portrait | Drop it in `images/crew/` and set `photo: 'images/crew/<name>.jpg'`. Use `photo: null` to show the "PHOTO PENDING" card. Generation prompts are in [PORTRAIT_PROMPTS.md](PORTRAIT_PROMPTS.md). |
| Confirm an event | Fill in the mission's `title`, `location`, `mapsQuery`, `objectives` and `dressCode`, then set `tbd: false`. Ready-made caper titles are in the comment block. |
| Add a flight | `flights.arrivals` / `flights.departures`: `{ name, from, departs:'2027-03-19T12:05:00-04:00', to:'MIA', arrives:'…', flight:'AA 1234' }`. The FlightAware link is built automatically. |
| Rooms | `rooms: [{ room:'Suite 1', names:['…','…'] }]` |
| Hotel | `safehouse`: `name`, `address`, `mapsQuery`, `bookingUrl` |

Write dates as ISO strings with the `-04:00` offset (Miami in March). `'TBD'` shows a CLASSIFIED stamp, and `null` hides that field.

### Optimizing a new portrait (macOS)
```sh
sips -s format jpeg -s formatOptions 82 --resampleWidth 800 images/crew/raw.jpeg --out images/crew/name.jpg
```

## Testing tricks
- `?nointro`: skip the loading screen. `?intro` forces it.
- `?now=2027-03-20T14:00`: pretend it's that time (Miami). Mission statuses and the countdown update accordingly.

## Structure
- `index.html`: hero, Most Wanted, Missions, Safehouse
- `logistics.html`: Flight Plan page
- `css/base.css` and `js/core.js`: shared tokens, nav, footer and helpers. Each section has its own CSS/JS file.

## Deploying
This is a static site, so GitHub Pages or Vercel works with no config. After deploying, change `og:image` in `index.html` to the **absolute** URL (e.g. `https://…/images/og-image.png`) so the group-chat link preview shows the poster.
