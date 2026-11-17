# The Ira Express

A birthday train ride for Ira (18 November). One page, nine stations, no reloads.
Vite + vanilla JS + GSAP 3.15.1. Works with mouse, touch and keyboard (Enter / Space = main action).

## 1. Add the photos (required)

The photos are **not in git** on purpose: this repo is public. Put the originals in `ira-express/photos/`
with these names (jpg, jpeg, png or webp, any size):

| file | station | caption |
|---|---|---|
| `office` | RizeUp | RizeUp, where it started |
| `tongue`, `angry`, `einstein` | Ragebait | no filter / ragebait mode / sticker |
| `sleep` | Sleep | evidence 👀 |
| `stress` | Focus | too many texts |
| `river`, `street`, `cake` | Happy | river days / street walks / cake first (*) |
| `smile` | Good soul | this smile (*) |
| `conference` | Promise | we will shine |
| `hearts` | 18 November | 18 November (*) |

(*) captions I wrote because the brief had none. Change them in `src/content.js`.
iPhone `.heic` files must be converted to `.jpg` first.

`npm run build` resizes everything to max 1200px into `public/photos/` and cuts the grey background
off `einstein` to make a die-cut sticker. **It refuses to build if a photo is missing**, so she never
gets a gift with holes in it. (`ALLOW_MISSING_PHOTOS=1 npm run build` overrides that.)

## 2. Music (optional)

Put a file at `ira-express/public/music.mp3`. The music button only appears when that file exists,
and it is off by default (browsers block autoplay anyway). Not committed to git.

## 3. Run it

```bash
cd ira-express
npm install
npm run dev
```

Open the printed URL. Handy for testing: `?at=6` jumps straight to station 6.

## 4. Deploy (one link to send her)

Netlify, from your own computer (so the photos are included):

```bash
cd ira-express
npm run build
npx netlify-cli login
npx netlify-cli deploy --dir=dist --prod --no-build
```

The first deploy asks you to create a new site; pick a name like `ira-express-1811`.
The command prints the live URL (`https://<name>.netlify.app`). That is the link.

Do not use anonymous Netlify Drop without logging in: unclaimed Drop sites get deleted.
Dragging the `dist` folder onto Netlify while logged in is fine.

Connecting this GitHub repo to Netlify will **not** work as-is, because the photos are not in git.

## 5. Edit the words

All copy lives in `src/content.js`. Station logic is in `src/stations/`, one file per station.

## How it is built

- `src/world/`: the always-moving window view. Parallax hills, poles and track are drawn into one
  canvas from pre-rendered tiles. Sky changes are cross-fades. The canvas only repaints when
  something moved.
- `src/core/director.js`: the scene manager. Every change of station is a camera move with a
  chapter title, never a cut.
- Animations use transform and opacity only. `prefers-reduced-motion` swaps movement for fades.
- If frames are slow for a few seconds, it drops to a low-power mode (lower canvas resolution, no grain).
