# Curio — curiolab.me

Website of the **Curio** payment ring by CurioLab (in partnership with Digiseq). A procedurally modelled
ring (Three.js) turns behind the pages; the homepage speaks to the person who will wear it, the
products page to brands and issuers.

Static site, no build step, English copy. **Light by default, with a dark mode** switched from the two
buttons in the header (sun / moon): the choice is stored in `localStorage` (`curio-theme`), applied before
paint by a one-line script in each `<head>`, and the 3D scenes listen to the `curio-theme` event. Tokens
for both palettes live at the top of `assets/site.css`. Switching plays a diagonal curtain (top-left →
bottom-right, `.themeWipe` / `.themeCrest` in site.css, driven by `CurioTheme.set` in nav.js); it is skipped
under `prefers-reduced-motion`.

## Files

| File | What it is |
|---|---|
| `index.html` | Homepage, consumer-facing ("for you"). |
| `products.html` | For business: NFC wearables, why trust us, services, consultation. |
| `mobile-app.html` | The Manage-Mii app, with a simulated phone walkthrough. |
| `size.html` | On-screen ring sizer (US / EU / UK). |
| `contact.html` | The one place every CTA lands: form with "for me / for my brand" modes. |
| `legal.html` | Legal notice, privacy policy, local-storage note (`noindex`). Highlighted placeholders to complete. |
| `assets/site.css` | Shared tokens, menu bar, footer, buttons, cards, type, reveal. |
| `assets/nav.js` | Menu burger, footer year, reveal, remembered size badge, the **size table** (`CurioSizes`) and `CurioMemory` (localStorage). |
| `assets/ring.js` | The ring, once: `CurioRing.build(renderer, opts)`, studio environment, lights, finishes. |
| `assets/fonts.css` + `assets/fonts/` | Cormorant Garamond and Outfit, self-hosted variable fonts (one file per style and subset, 159 KB in all). |
| `assets/three.min.js` | Three.js r128, self-hosted. |
| `assets/favicon.svg`, `assets/og.png` | Tab icon and social sharing image. |
| `assets/products/*.jpg` | Product photos (frames cropped from a screen recording of the previous site — replace with originals, same names). |
| `robots.txt`, `sitemap.xml` | For search engines. |

**Screen sizes.** Checked at 360, 768, 1024, 1280, 1920 and 2560 px. Breakpoints: ≤ 760 burger menu;
≤ 900 the ring explorer stacks (ring above the panel), single-column steps, walkthrough phone first;
≤ 680 the orbit becomes a list and the sizer card goes upright; 761–1100 the "Your size" badge is hidden
from the bar (it stays in the burger menu); ≥ 1600 wider `.wrap` (1320 px), three product columns, bigger
walkthrough column; ≥ 1800 slightly larger type and a larger orbit; ≥ 2200 `.wrap` 1480 px. Homepage
sections are capped at 1480 px so cards never stretch across a very wide screen.

Every page repeats the same `<header class="nav">` and `<footer class="site">` markup — when you change
the menu or the footer, change it in all five files. The CSS for both lives once in `assets/site.css`.

## Pages

### Homepage (`index.html`)
1. **Hero** — wordmark, tagline, "Find your size" / "Discover the ring", ring below.
2. **Made for every day** — three consumer benefits, "Get yours", and a strip pointing brands to `products.html`.
3. **Trusted technology** — partner wordmarks (Digiseq, Universal Smart Cards, Mastercard, Visa, Infineon, NXP).
4. **Discover the ring** — explorer: finishes (swatches recolour the ring), ceramic, bevels, engraving,
   payment (NFC waves), no battery, sizes (US + EU/UK conversion, "Order this size" → contact prefilled).
   Reads `?size=9` (from the sizer) and `?finish=rose` from the URL and preselects them.
5. **How it works** — three steps, step 2 links to the app walkthrough.
6. **Everything around your ring** — the ring sits at the centre and six topics orbit it (pause on hover);
   hovering a topic unfolds its text and a link in the middle of the ring. List with tap-to-unfold on phones.
7. **Take a closer look** — drag the ring.

Ring choreography: `VIEWS` (framing per section), `FEATURES` (explorer views) at the top of the script.

### Products (`products.html`)
Short hero, "Why businesses trust our expertise", **filter chips** (Fitness, PromoReady, Events, Premium
materials, No jewellery — driven by `data-tags` on each product), five products (each with "Ask about
this →" prefilling the contact form), a **comparison table**, six services, consultation card.
All CTAs → `contact.html?who=business`.

### Mobile app (`mobile-app.html`)
A simulated phone plays the five steps (account, add a wearable, add your card, token provisioning,
activation) with a progress bar per step, pause on hover, Pause / Replay. When it ends the app is live:
the toggle freezes/unfreezes the card, back arrow, services, "Remove card" restarts from step 3.
`STEP_MS` sets the pace; screens are the `.scr` sections mapped by `SCREEN_OF`.
Then **"Is my bank supported?"** — fill the `BANKS` array in the script (`{ name, country, status:'live'|'soon' }`);
while it is empty every search ends on "we check for you", which sends the bank's name to the contact
form (`?bank=`). Then a **FAQ** (`<details>`, no JS), linked as `mobile-app.html#faq` from every footer.

### Ring sizer (`size.html`)
1. **Calibrate** — bank card outline (85.6 × 53.98 mm), slider + ± buttons. Orientation is decided from
   the screen width (never flips while sliding); the slider maximum is capped so the card always fits.
2. **Compare** — the ring in 3D at true size (orthographic camera, 1 unit = 1 mm), in the finish
   remembered from the homepage (swatches under the ring), chips US / EU / mm, paper-strip fallback.
3. **Your size** — US with EU and UK, "Order this size" → contact prefilled, "See it on the homepage"
   (`index.html?size=`). The result is remembered and shown as "Your size · US 9" in the menu bar.

### Contact (`contact.html`)
"For me" (order, sizer kit, app, question · size · finish) or "For my brand" (company, product, volume).
Prefilled from the URL: `?who=business`, `?interest=ring`, `?subject=order|sizer|app|question`,
`?size=9`, `?finish=black|titanium|rose|night`, `?product=wristbands` — and from the sizer's saved result.

**Sending:** set `data-endpoint` on the `<form>` to a Formspree (or similar) URL and the form POSTs JSON
there. With no endpoint it opens the visitor's mail client with everything prefilled (`mailto:`).

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Customise

- Finishes: `FINISHES` in `assets/ring.js` (band, bevels, engraving, swatch colours).
- Sizes (US / mm / EU / UK): `CurioSizes` in `assets/nav.js`.
- Colours: the `:root` tokens at the top of `assets/site.css`.
- Engraving text, explorer features and section framing: top of the script in `index.html`.
- Social image: `assets/og.png` is rendered from `_og.html` (see git history) — regenerate it if the
  wordmark or tagline changes.

## Deploy

Any static host. The repo is connected to **Cloudflare Workers** (Workers & Pages → project `rayan`):
`wrangler.jsonc` tells it to serve the folder as static assets (no build command, deploy command
`npx wrangler deploy`). The shareable URL is the `*.workers.dev` address on the project's **Domains**
tab (enable the workers.dev route if it is off); add `curiolab.me` there later as a custom domain.
`sitemap.xml` and the `og:`/`canonical` tags already use `https://curiolab.me/`.
