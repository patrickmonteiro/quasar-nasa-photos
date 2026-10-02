# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Quasar **v1** (Vue **2**, Options API) app built with `@quasar/app` v2 (webpack). Use Quasar v1 / Vue 2 APIs: `v-model` on Quasar components emits `@input` (not `@update:model-value`), `q-table` takes `:data` (not `:rows`), `:value` on `q-dialog`, `Vue.prototype` for globals. Do not apply Quasar v2 / Vue 3 patterns.

## Commands

```bash
yarn                 # install deps (yarn.lock is the lockfile)
yarn dev             # quasar dev -m pwa on :8080 (hash router)
yarn build           # quasar build -m pwa -> dist/pwa
yarn lint            # eslint (standard + plugin:vue) over .js/.vue
```

`dev`/`build` set `NODE_OPTIONS=--openssl-legacy-provider`: `@quasar/app` v2 uses webpack 4, which fails on Node 17+ with `error:0308010C` without it. Calling `quasar dev`/`quasar build` directly hits that error.

There is no test suite (`yarn test` is a no-op). ESLint also runs during dev/build via `eslint-webpack-plugin` in `quasar.conf.js`, so lint errors surface as build errors.

## Configuration

- `.env` (git-ignored, see `.env.example`) holds `MARSVISTA_API_KEY`. `quasar.conf.js` loads it with `dotenv` and exposes it through `build.env`, so it is inlined into the client bundle as `process.env.MARSVISTA_API_KEY`. The deploy environment (Netlify) needs the same variable at build time.
- **Design system ("Quasar NASA")** — follow it for any UI work:
  - `src/css/qn-tokens.css`: color tokens for two themes (dark "Deep Space" default, light "Lunar" via `body--light` / `data-theme`), spacing, radii, fonts, typography classes (`.display-xl`, `.display-l`, `.title`, `.overline`, `.data`…).
  - `src/css/qn-components.css`: `qn-*` component classes (Button, AppBar, Nav, BottomNav, Field, Chip, Badge, Banner, RoverPicker, PhotoCard, SectionHeader, StatTile, Hero, EmptyState, Skeleton), copied from the design system bundle.
  - `src/css/app.css`: adapters that make Quasar components (`q-btn.qn-btn`, `q-input/q-select.qn-field` with `stack-label`, menus, header/drawer) match the tokens, plus page layout.
  - Use `var(--token)` rather than hex. One `qn-btn--primary` (ignition) per screen. Telemetry (sol, dates, counts, IDs) in mono. UI copy in English, sentence case; "Sol N"; Earth dates stay ISO (`YYYY-MM-DD`). No NASA logos/insignia.
  - Theme switching lives in `src/boot/theme.js` (`setTheme`): `Dark.set`, `data-theme` on `<html>`, and `colors.setBrand` with per-theme brand values (Quasar v1 sets brand CSS vars inline on `body`, so CSS alone can't override them). Keep its `BRAND` map in sync with the tokens and `quasar.conf.js`.
- Icons: Material Symbols Outlined (`@quasar/extras` + `iconSet`). In Quasar v1 icon names need the `sym_o_` prefix (`sym_o_rocket_launch`); bare names fall back to the unloaded `material-icons` font. Fonts: Chakra Petch (display), IBM Plex Sans (body), IBM Plex Mono (data), from Google Fonts in `src/index.template.html`.

## Architecture

- **API**: [Mars Vista API](https://api.marsvista.dev/swagger/index.html), an open source drop-in replacement for the archived NASA Mars Rover Photos API. `src/boot/axios.js` creates the axios instance (`baseURL https://api.marsvista.dev/api/v1/`, `X-API-Key` header; requests without it get 401) and exports it as `api` (also `this.$axios`). All endpoint calls go through `src/services/marsvista.js` (`getRovers`, `getRover`, `getManifest`, `getPhotos`, `getLatestPhotos`, `errorMessage`). Photo list responses include `pagination: { total_count, page, per_page, total_pages }`; `per_page` max is 100. All four rovers (perseverance, curiosity, opportunity, spirit) have data.
- **Home (`src/pages/Index.vue`)**: Hero, StatTiles computed from `/rovers` (never invented numbers), and a "Latest transmission" grid from `/rovers/{name}/latest` for the most recently active rover (preferring terrain cameras over Mastcam, which often shoots the sky). `getRovers()` is memoized in the service, so Home/Rovers/Photos share one request.
- **Rovers (`src/pages/Rovers.vue`)**: fleet cards linking to `/photos?rover=`.
- **Photos (`src/pages/Photos.vue`)**: RoverPicker (radiogroup, arrow keys), Sol/Camera fields, collapsible image settings (CDN chips/fields), SectionHeader, PhotoCard grid, Skeleton while loading, EmptyState with one recovery action, error Banner. Selection state is mirrored in the route query (`?rover=&sol=&camera=&page=`) through `syncQuery()`, and a `$route.query` watcher reloads when the query changes without remounting (back/forward, deep links). Requests are tagged with `requestId` so stale responses are dropped. Defaults to the newest sol when none is given.
- **Components**: `PhotoCard` (4:3 card, falls back to raw `img_src` if the CDN fails), `PhotoViewer` (maximized lightbox, `v-model` plus `:index.sync`, arrow keys, shows the original image and NASA/JPL-Caltech credit), `RoverBadge` (status as icon + word).
- **Image CDN**: thumbnails go through the Netlify Image CDN via `cdnUrl()` in `src/utils/image-cdn.js` (absolute `https://quasar-nasa-photos.netlify.app/.netlify/images?...`). Source hosts must be allow-listed (as regexes) in `netlify.toml` `[images] remote_images`: currently `mars.nasa.gov`, `mars.jpl.nasa.gov` and `planetarydata.jpl.nasa.gov` (Spirit/Opportunity). Default thumbnail is 480x360 (4:3).
- **Layout**: `MainLayout` has the AppBar (rocket wordmark + theme toggle), a `q-drawer` nav at ≥1024px and a BottomNav `q-footer` below that (`$q.screen.lt.md`). Routes: `home`, `photos`, `rovers` (`src/router/routes.js`).
- **PWA**: configured in `quasar.conf.js` (`GenerateSW`, `skipWaiting`/`clientsClaim`). `src-pwa/register-service-worker.js` shows a (Portuguese) Quasar `Dialog` prompting reload when an update is found. `netlify.toml` disables caching of `service-worker.js`. Dev runs in PWA mode too, so a stale service worker can serve old CSS/JS in the browser; unregister it (DevTools → Application) if changes don't show up.

## Quasar docs

The Quasar MCP server (`@quasar/mcp`) is registered for this project, but its bundled docs target Quasar v2.33+. For this v1 app, use https://v1.quasar.dev for component APIs.

## Deployment

Hosted on Netlify (`quasar-nasa-photos.netlify.app`). Config lives in the root `netlify.toml` (build command `yarn build`, publish `dist/pwa`, headers, image CDN allow-list) and overrides the Netlify UI build settings. `MARSVISTA_API_KEY` must be set in the Netlify environment variables.
