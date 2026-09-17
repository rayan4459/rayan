# Curio — homepage (curiolab.me)

Homepage "experience" for the **Curio** payment ring by CurioLab: a procedurally modelled ring
(Three.js) stays fixed in the background and turns as you scroll, Apple product-page style.

Two self-contained files (HTML + CSS + JS), Three.js r128 loaded from cdnjs, page in English:

- `index.html` — dark version (black background).
- `size.html` — the on-screen ring sizer (see below).
- `index-light.html` — light version (white background), same content and behaviour with the whole
  palette adjusted: dark text, white cards with a soft shadow, darker partner logos and NFC waves,
  brighter lighting on the ring, and the hero ring placed below the wordmark instead of behind it.

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

## Ring sizer (`size.html`)

Linked from the homepage (step 01 of "How it works", the "Eight sizes" card and the footer).
Three steps, light theme, no dependencies:

1. **Calibrate** — the visitor lays a bank card on the screen and moves a slider (with ± fine tuning)
   until the dashed outline matches the card (85.6 × 53.98 mm). On narrow screens the card is shown upright.
   A "no card" fallback uses the 96 dpi estimate. The scale is saved in `localStorage`.
2. **Compare** — a true-size circle for the selected US size (6 to 13, inner diameter in mm), with
   chips, ± buttons and arrow keys. Two tips explain how to compare with an existing ring or a finger.
   A "strip of paper" fallback converts a finger circumference into the nearest size.
3. **Your size** — the result with diameter and circumference, a "Continue" button back to the homepage
   (`?size=` in the URL) and a "free sizer kit" mail link.

Sizes and diameters are in the `SIZES` array at the top of the script in `size.html`.

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

The background colour of each file is set once, at the top of `:root` (`--bg` and `--bg-rgb`, same colour
as hex and as r,g,b).

Section copy is directly in the HTML.

## Deploy

Any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages…). For GitHub Pages on curiolab.me,
add a `CNAME` file containing `curiolab.me` and point the DNS at GitHub.
