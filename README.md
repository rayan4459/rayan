# Curio — homepage (curiolab.me)

Homepage "experience" for the **Curio** payment ring by CurioLab: a procedurally modelled ring
(Three.js) stays fixed in the background and turns as you scroll, Apple product-page style.

Everything lives in one file, `index.html` (HTML + CSS + JS). Three.js r128 is loaded from cdnjs.
The page is in English.

## Sections

1. **Hero** — Curio✦ wordmark, ring face on.
2. **Why Businesses Trust Our Expertise** — intro, "Get In Touch", and three cards (Our Expertise,
   Strong And Reliable Partnerships, Proven Track Record). The ring peeks in under the text.
3. **Our Partners** — Digiseq, Universal Smart Cards, Mastercard, Visa, Infineon, NXP
   (text wordmarks; swap in real logo images inside `.logos` when available).
4. **Discover the ring** — feature list on the left (pills, up/down arrows); on click the card unfolds
   and the ring turns / zooms on the detail: finishes (swatches recolour the ring), brushed ceramic,
   mirror-polished bevels, inner engraving, contactless payment (NFC waves), no battery, sizes.
5. **How it works** — three steps.
6. **From Your Idea To Implementation Of Every Aspect** — six service cards + "Learn More".
7. **Take a closer look** — drag the ring with mouse or finger (also works in the explorer).
8. **Footer** — address, email, legal.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Customise

At the top of the script in `index.html`:

- `ENGRAVING` — text engraved inside the ring.
- `FINISHES` — finishes (band, bevels, engraving, swatch colours).
- `SIZES` — available sizes.
- `FEATURES` — explorer features, each with its ring view
  (`z` camera distance, `rx` tilt, `ry` turn, `rz` roll, `fx`/`fy` offset in the frame, `spin` frozen angle, `nfc` waves).
- `VIEWS` — ring framing for every other section (hero, why, partners, how, idea, closer).

Section copy is directly in the HTML.

## Deploy

Any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages…). For GitHub Pages on curiolab.me,
add a `CNAME` file containing `curiolab.me` and point the DNS at GitHub.
