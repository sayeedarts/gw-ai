# Green Wardrobe — Full Build Prompt (Version 3: Third Options)

Build a static, premium, scroll-driven home page for "Green Wardrobe" (GW) — a personalised fashion brand combining 3D body scanning, AI styling, robotics-assisted tailoring and responsible wardrobe renewal. Brand line: **Designed Around You. Not the Rack.** Match every detail exactly. The page has a preloader, a menu overlay and 10 sections.

Visual direction: the exclusivity of a luxury tailoring house with the simplicity of a modern technology brand. It must NOT look like an ordinary fashion e-commerce site or a robotics showroom. Large images, thin elegant type, one headline + one CTA per section, every section interactive and scroll-driven.

**This version uses the THIRD option for each new section:**

| Section | Variant used in this document |
| --- | --- |
| Hero text and tech chips | HERO-C (scroll-reactive marquee under the header) |
| Fashion Begins With You | BEGINS-C (wireframe-to-suit scan morph) |
| Technologies | TECH-C (giant outlined type stack) |
| The GW Experience | EXP-C (self-drawing gold path) |
| Digital Scanner | SCAN-C (drag comparison slider) |
| Imagine Your Look | IMG-C (expanding category panels) |
| Automated Machines | MACH-B (parallax diptych + magnifier lens) |
| Final Results | FINAL-C (before/after slider carousel) |

Preloader, header/menu, hero mechanics, hero blocks, ReWardrobe, final CTA and footer are identical in all three versions.

---

## 0. NON-NEGOTIABLE CODE RULES

1. **No inline styles.** No `style=""` attributes, no `<style>` blocks. All CSS lives in ONE file: `assets/css/style.css` (plus `assets/css/noscript.css` containing only `.preloader{display:none}`). GSAP/JS runtime-written styles (transforms, opacity, `setProperty` on CSS custom properties) are the only exception.
2. **No inline JavaScript.** No `<script>` blocks with code, no `on*` attributes. All JS lives in separate files under `assets/js/`, one file per module.
3. Vanilla JS only (ES6+, classic scripts, no build step, no modules so it runs from `file://`). Each module is an IIFE attaching `init()` to a shared `window.GW` namespace. HTML hooks use `js-` prefixed classes or `data-gw-*` attributes.
4. Semantic HTML5 landmarks, BEM names (`.hero__media`, `.tech-word--active`), state classes `.is-open`, `.is-active`, `.is-ready`, `.is-loading`.
5. Bootstrap 5.3 for **grid and utilities only** (`container-fluid`, `row`, `col-*`, `d-*`, `visually-hidden`); no Bootstrap JS; override its reboot in `style.css`.
6. Every colour, size, space, radius and duration comes from `:root` tokens. No one-off hex values or magic numbers in components.

### Tech stack (pin exact versions)

HTML5, CSS3, vanilla JS; GSAP 3.12.5 + ScrollTrigger (cdnjs); Lenis 1.1.x driven by the GSAP ticker (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`); Bootstrap 5.3.3 (CSS only); Font Awesome 6.5.2 Free; Google Fonts: Raleway (200,300,400,500,600) + Cormorant Garamond (italic 400,500).

### File structure

```
index.html
assets/css/style.css , assets/css/noscript.css
assets/js/boot.js          (sync, in <head>: adds .js/.is-loading, scrollRestoration manual)
assets/js/utils.js         (line splitter, text-roll builder, matchMedia helpers, count-up, typing helper, compare-slider helper)
assets/js/smooth-scroll.js (Lenis + ticker + scrollTo API)
assets/js/preloader.js     assets/js/menu.js
assets/js/hero.js          assets/js/hero-blocks.js
assets/js/begins.js        assets/js/technologies.js
assets/js/experience.js   assets/js/scanner.js
assets/js/imagine.js      assets/js/machines.js
assets/js/final-results.js
assets/js/rewardrobe.js   assets/js/cta.js
assets/js/footer.js       assets/js/main.js
assets/img/ , assets/video/
```

Script order (all `defer` except boot.js): gsap → ScrollTrigger → lenis → utils → smooth-scroll → preloader → menu → hero → hero-blocks → begins → technologies → experience → scanner → imagine → machines → final-results → rewardrobe → cta → footer → main. `main.js` initialises every module immediately but no module plays an intro until the `gw:ready` event.

---

## 1. DESIGN TOKENS (`:root`)

| Token | Value | Use |
| --- | --- | --- |
| `--gw-green` | `#032F22` (sampled from logo) | primary surface |
| `--gw-green-deep` | `#021F17` | CTA, footer, dark sections |
| `--gw-green-lit` | `#0B5A42` | lit squares, glows |
| `--gw-gold` | `#F6C214` (sampled from logo) | headlines, CTAs, accents |
| `--gw-midnight` | `#081B2A` | AI panels |
| `--gw-ivory` | `#F5F3EC` | light text |
| `--gw-stone` | `#A6A79F` | secondary text, hairlines |
| `--gw-line` | `rgba(246,194,20,0.12)` | dividers, grid lines |
| `--block-line` / `--block-gold` | `rgba(246,194,20,0.05)` / `rgba(246,194,20,0.10)` | hero squares |
| `--preloader-badge` | `#122B20` | preloader circle |
| `--scan-glow` | `0 0 24px rgba(246,194,20,0.8)` | scan lines, seams, slider handles |

Typography: `--font-display` Raleway 200–300 uppercase (thin geometric headlines); `--font-accent` Cormorant Garamond italic for ONE accent word per headline, in gold; `--font-body` Raleway 300/400. Scale: `--fs-hero: clamp(2.25rem, 6.4vw, 5.5rem)`, `--fs-h2: clamp(2rem, 5vw, 4.5rem)`, `--fs-giant: clamp(3.5rem, 11vw, 10rem)`, `--fs-lead: clamp(1rem, 1.5vw, 1.375rem)`, `--fs-body: 1rem`, `--fs-small: 0.8125rem`, `--fs-counter: clamp(4rem, 9vw, 7rem)`. Headline line-height 1.05, letter-spacing -0.01em; body line-height 1.6.

Spacing/shape: `--gutter: clamp(1rem, 6vw, 6rem)`, `--section-pad: clamp(5rem, 12vw, 10rem)`, `--header-h: 88px` (72px mobile), `--radius-card: 28px` (20px mobile), `--radius-pill: 999px`, `--block-size: clamp(56px, 8vw, 132px)`. Max content width 1440px.

Motion: `--ease-out: cubic-bezier(0.22,1,0.36,1)`, `--ease-ui: cubic-bezier(0.25,0.1,0.25,1)`, `--dur-micro: 300ms`, `--dur-ui: 500ms`, `--dur-reveal: 1000ms`, `--dur-wipe: 1200ms`. GSAP: `power3.out` (reveals), `expo.inOut` (wipes), `none` (scrubbed).

---

## 2. GLOBAL COMPONENTS & MOTION RULES

- **Page background** `--gw-green`, with a faint architectural grid on `.page-grid` (fixed, 1px `--gw-line`, 6 vertical lines + horizontal lines every 200px, pointer-events none). Hidden while the hero is active (class on `body`).
- **Primary CTA (outlined pill):** 1.5px gold border, gold 15px/500 text, padding 14px 36px. Hover: gold fills from the bottom (pseudo-element `scaleY` 0→1, 500ms `--ease-ui`), text turns green; label text-roll (duplicate label in an `overflow:hidden` 22px box, translateY -50%); `fa-arrow-right` rotates -45deg. Solid variant: gold fill, green text. Focus-visible: 2px ivory outline, 3px offset. Active: scale 0.97. Touch: pressed state only.
- **Title reveal:** `utils.js` splits text into `.line > .line__inner`; `.line` is `overflow:hidden`; inner `yPercent 110→0`, 1.1s `power3.out`, stagger 0.12s, `top 80%`, once. Accent word fades in 0.3s later. Re-split on resize (debounced 200ms).
- **Support text:** opacity 0→1, y 24→0, 0.9s `power3.out`, 0.2s after its headline.
- **Image reveal:** wrapper `clip-path: inset(100% 0 0 0)` → `inset(0)` (1.2s `expo.inOut`) while the image scales 1.25→1 (1.6s `power3.out`).
- **Compare slider helper (`utils.js`):** a reusable pointer-driven slider that writes a `--split` custom property (0–100%) via `setProperty`, supports pointer drag (`setPointerCapture`), keyboard (arrows ±2, Shift ±10, Home/End), `role="slider"` with `aria-valuenow`, and an auto-demo tween (e.g. 10%→90%→50%).
- **Scrubbed timelines:** `scrub: 0.6`, `ease: none`, `invalidateOnRefresh: true`, `anticipatePin: 1`. Animate only `transform`, `opacity`, `clip-path`, `filter` (card `width`/`border-radius` in the hero only).
- **Responsive:** `gsap.matchMedia()`; breakpoints mobile <768, tablet 768–1023, desktop ≥1024; pinned heights use `svh`.
- **Reduced motion:** disable Lenis, pins, parallax, typing, count-up, marquees and slider demos; sections render in final state with 300ms fades; video shows poster.
- **Accessibility (WCAG 2.2 AA):** skip link, gold focus ring, keyboard access everywhere, touch targets ≥44px, `aria-live="polite"` on dynamic previews, meaningful `alt`, decorative layers `aria-hidden="true"`, videos `muted playsinline`. Gold/ivory on green must pass 4.5:1.
- **Performance:** WebP/AVIF with width/height, lazy-load below the fold, hero video `preload="metadata"` with `poster`, `will-change` only while animating, `ScrollTrigger.refresh()` after fonts and images load.

---

## 3. PRELOADER

Full-screen loader. Forest-green background, centred circular GW badge, "LOADING EXPERIENCE..." beneath it in gold, a huge percentage counter bottom-left and a thick gold progress bar along the bottom edge.

**Markup (first child of `<body>`):** `div.preloader.js-preloader[role=status][aria-live=polite]` containing a `.visually-hidden.js-preloader-announce`, `.preloader__center` (`.preloader__badge` with `.preloader__ring` and `img.preloader__logo` = transparent `gw-badge.svg`; `p.preloader__text` with a line mask and animated dots), `.preloader__count` ("0%") and `.preloader__bar`. The supplied `gw-logo.png` has a white background, so a transparent badge SVG is required.

**CSS:** `.preloader` fixed inset 0, z-index 9999, `--gw-green`. Badge `clamp(160px, 15vw, 236px)` circle, `--preloader-badge` fill, 1px `rgba(246,194,20,0.18)` border; a 1px rotating gold arc ring (6s linear). Text: gold Raleway 300 uppercase `clamp(1rem, 2vw, 1.75rem)`, margin-top 24px, dots animated with CSS `steps()` (1.2s). Counter: absolute bottom-left (20px), Raleway 200 gold `--fs-counter`, tabular numerals. Bar: absolute bottom, full width, height 20px (10px mobile), gold, `transform-origin: left`, `scaleX(0)`. `html.is-loading` locks scroll.

**JS (`boot.js`, `preloader.js`):** boot.js adds `js` and `is-loading` and sets `history.scrollRestoration = 'manual'`. preloader.js: scroll to 0, stop Lenis, set `inert` on `main` and `header`. Real progress is weighted — fonts 20%, logo + hero poster 20%, hero video metadata 20%, first three above-the-fold images 20%, `window.load` 20% (failed assets count as loaded; hard timeout 8s forces 100%). The displayed value tweens toward the real value (`power2.out`, 0.6s) and never decreases; minimum visible time 1.8s. The counter shows `Math.round(value) + '%'`, the bar `scaleX(value/100)`. Announce at 25/50/75/100% only.

**Sequence:** intro (badge scale 0.8→1 + fade 0.9s; text mask rises 0.3s later; counter fades in 0.5s later; badge breathes 1→1.04, 2s, yoyo). Exit at 100% after a 0.35s hold: counter and text slide/mask out (0.5s `power3.in`); bar flips origin to the right and `scaleX 1→0` (0.7s `expo.inOut`) while the badge scales to 0.6 and fades; then the panel wipes up (`clip-path: inset(0)` → `inset(0 0 100% 0)`, 1.0s `expo.inOut`) while the page settles from scale 1.06→1 (1.4s). On complete: remove `is-loading`, remove `inert`, start Lenis, `ScrollTrigger.refresh()`, dispatch `gw:ready`, remove the preloader from the DOM, move focus to the skip-link target. Returning visitors in the same session (`sessionStorage` key `gw-preloaded`, try/catch) get a 0.6s version; `?preloader=1` forces the full one. Reduced motion: no ring or breathing, 0.4s opacity exit.

---

## 4. HEADER + FULL-SCREEN MENU (every screen size)

**Header** (fixed, z 100, height `--header-h`, padding-inline `--gutter`, transparent): LEFT — GW logo (`gw-logo.png`, 56px desktop / 44px mobile; swap for the transparent gold lockup when supplied), links to `#top`. RIGHT — hamburger: 3 gold lines (28px, 2px, 8px gap), 44×44 hit area, `aria-expanded`, `aria-controls="site-menu"`. No desktop nav links. On scroll down the header hides (translateY -100%, 0.5s); on scroll up it returns with `--gw-green` 85% + backdrop blur. It stays visible while the hero is pinned. Intro on `gw:ready`: logo slides down (0.8s), hamburger lines scale in (stagger 0.08s).

**Menu overlay** (`#site-menu`, fixed inset 0, z 200, `--gw-green-deep`): opens with a clip-path circle from the hamburger (`circle(0 at calc(100% - 3rem) 2.75rem)` → `circle(150% ...)`, 0.9s `expo.inOut`); hamburger morphs to an X (0.4s). Links (6): **Experience** (`#experience`), **Technology** (`#technology`), **AI Styling** (`#imagine`), **Final Looks** (`#final`), **ReWardrobe** (`#rewardrobe`), **Contact** (`#book`) — `--fs-h2`, weight 200, uppercase, gold, each in a line mask rising with 0.08s stagger after the circle is 40% open, with a small gold index 01–06. Hover (desktop): other links dim to 35%, hovered link shifts x +16px and a gold underline draws (0.5s); a 4:5 preview image on the right crossfades per link. Bottom row: solid gold CTA **Book Your GW Experience** + brand line in Stone. Lenis stops while open, `.is-locked` on body, focus trapped, `Esc` closes, focus returns to the hamburger. In-page anchors close the menu then `lenis.scrollTo`.

---

## 5. SECTION 1 — HERO (pinned, scroll-scrubbed) — HERO-C

Replicate the supplied screen recording: the text block occupies the top \~70% of the viewport; a media card peeks in at the bottom; on scroll the card rises and grows to full screen with its radius going to 0 while the text fades away; once the card passes the centre the video starts playing; then the pinned video performs an everyday→tailored transformation.

**Structure:** `section.hero#top` (100svh, pinned): `.hero__bg` (blocks, section 6), `.hero__marquee`, `.hero__content`, `.hero__media`, `.hero__label`. Stacking: bg 0 → content and marquee 2 → media 3 → header 100.

**Initial state:**

- `.hero__marquee` (`aria-hidden="true"`): a full-width strip directly under the header (`top: calc(var(--header-h) + 4px)`, height 32px, overflow hidden, edge fade via `mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)`). Text: `AI STYLING • BESPOKE TAILORING • SUSTAINABLE FASHION • 3D • AI • ML • ROBOTICS • QUANTUM PHYSICS • SUSTAINABLE RECYCLING •` repeated twice for a seamless loop, 12px, uppercase, letter-spacing 0.22em, gold 80%; the bullets are 4px gold dots. A `.visually-hidden` sentence carries the same content for screen readers ("AI styling, bespoke tailoring, sustainable fashion. Technologies: 3D, AI, ML, robotics, quantum physics, sustainable recycling.").
- `.hero__content`: height 70svh, centred, padding-top `calc(var(--header-h) + 40px)`. h1 (Raleway 300, uppercase, gold, `--fs-hero`, centred): "YOUR BODY. YOUR STYLE. / YOUR PERFECT WARDROBE." Subline `.hero__brand` (Cormorant italic, ivory, `--fs-lead`): "Designed Around You. Not the Rack." CTA (outlined pill): **Discover Your Look** → scrolls to `#imagine`.
- `.hero__media`: absolute, centred, width `calc(100% - 2*var(--gutter))`, height 100svh, radius `--radius-card`, `translateY(72svh)` (about 28svh visible). Layers: `<video>` (`hero.mp4`, muted, loop, playsinline, poster `hero.jpg`) as the **before** layer; `.hero__after` (finished tailored look) clipped `inset(0 100% 0 0)`; a centred ivory play ring on the poster. No chips on the card in this variant.
- Load intro on `gw:ready` (1.4s): marquee fades in (0.6s), h1 lines mask-reveal, brand line and CTA fade up (stagger 0.12s), the card slides from `translateY(100svh)` to 72svh.

**Marquee motion:** a GSAP infinite tween moves the strip `xPercent 0 → -50` over 40s, linear. A ScrollTrigger `onUpdate` sets `timeScale = 1 + min(abs(velocity)/600, 4)` and flips the direction with `self.direction`, easing back to `timeScale 1` over 0.6s when scrolling stops. It pauses whenever the hero is off-screen. Reduced motion: static strip, no movement.

**Phase A — expansion (pin `top top`, `+=100%` desktop / `+=80%` mobile, scrub 0.6):** 0→35% content and marquee opacity 1→0, y 0→-80px (marquee -20px), content scale 1→0.96. 0→100% media y 72svh→0, width → `100vw`, radius 28px→0, inner video scale 1.15→1. At progress ≥ 0.5 call `video.play()` once (pause when reversing below 0.5) and fade the play ring out.

**Phase B — transformation (pinned `+=150%` desktop / `+=120%` mobile, scrub 0.8):** `.hero__after` clip-path `inset(0 100% 0 0)` → `inset(0)` (left→right) with a 2px gold seam (`--scan-glow`) tracking the edge. `.hero__label` (bottom-left, 13px, letter-spacing 0.2em, uppercase, ivory, blurred pill) reads **BEFORE** and swaps to **AFTER** at 50% with a line-mask roll; a 2px gold progress bar tracks the wipe. Last 10%: hold, scroll cue ("Scroll" + `fa-arrow-down`) fades in; the pin releases.

Fallbacks: reduced motion or video failure → `hero.jpg`, no pin, stacked layout. Mobile: card visible \~24svh, gutter 16px, radius 20px, h1 `clamp(1.9rem, 9vw, 3rem)`, label moves to top-centre under the marquee.

---

## 6. HERO SQUARE-BLOCKS BACKGROUND

Markup, first child of `section.hero`: `<div class="hero__bg" aria-hidden="true"><div class="hero__glow"></div><div class="hero__blocks js-hero-blocks"></div><div class="hero__spotlight js-hero-spotlight"></div><div class="hero__dust js-hero-dust"></div></div>`. Squares are generated by JS (`<span class="hero__block">`).

**CSS:** `.hero__bg` absolute inset 0, z 0, overflow hidden, pointer-events none. `.hero__blocks` is a CSS grid (`grid-template-columns: repeat(auto-fill, var(--block-size))`, `grid-auto-rows: var(--block-size)`, centred) with `mask-image: linear-gradient(to bottom, transparent 0, #000 22%, #000 80%, transparent 100%)` (plus `-webkit-`). `.hero__block`: 1px inset border `--block-line`, resting opacity near 0. Lit variants: `.is-green` (`linear-gradient(145deg, var(--gw-green-lit), transparent 70%)`) and `.is-gold` (`--block-gold`). `.hero__glow`: `radial-gradient(ellipse 70% 55% at 50% 100%, rgba(11,90,66,0.65), transparent 70%)` at the bottom, breathing 0.7→1 over 6s. `.hero__spotlight`: 520px circle, `radial-gradient(circle, rgba(246,194,20,0.08), transparent 65%)`, `mix-blend-mode: screen`, hidden by default. `.hero__dust`: gold 2px dots (24 desktop / 10 mobile).

**JS (`hero-blocks.js`, exposes `GW.heroBlocks = { init, start, pause, resume, rebuild, attachToTimeline }`):**

1. **Build:** `cols = ceil(w / size)`, `rows = ceil(h / size)`; create cells in one fragment (cap 420; mobile 90); rebuild on resize (debounced 250ms) after killing tweens.
2. **Entry (on `gw:ready`):** `gsap.from(cells, { opacity: 0, scale: 0.6, duration: 0.9, ease: 'power3.out', stagger: { each: 0.004, from: 'center', grid: [rows, cols] } })`; glow fades in over 1.4s.
3. **Ambient pulse:** every 0.4–0.7s pick 5–9 random inactive cells (mobile 3–5), add `.is-green` (70%) or `.is-gold` (30%), `gsap.fromTo(cell, { opacity: 0 }, { opacity: 0.35–0.9, duration: 1.1–1.4, ease: 'sine.inOut', yoyo: true, repeat: 1 })`, clear classes on complete. Cap active cells at 16 (mobile 6); clusters of 2–3 neighbours allowed.
4. **Pointer (only `(hover: hover) and (pointer: fine)`):** spotlight follows via `gsap.quickTo` (0.6s); the cell under the pointer (computed arithmetically) lights gold and fades over 1.2s, leaving a short trail.
5. **Dust:** dots drift up 40–90px over 8–14s and twinkle (opacity yoyo 1.6–3s).
6. **Scroll link:** `attachToTimeline(phaseA)` — blocks y 0→-12%, scale 1→1.08; `.hero__bg` opacity 1→0 over 0→70%; glow flares 1→1.4 in the first 20%. At ≥ 0.7 progress `pause()` (kill loop, `visibility:hidden`); below 0.7 `resume()`. A ScrollTrigger on the hero also pauses everything when the hero is off-screen.
7. **Reduced motion:** static pattern with 8 fixed lit cells at opacity 0.5; no pulse, dust, spotlight or stagger.
8. **Responsive:** tablet `--block-size` 72px, 10 active cells, no pointer; mobile 56px, cap 90 cells, 3–5 pulses, spotlight off.

Acceptance: blocks never reduce headline contrast below 4.5:1; only opacity/transform animate; the grid rebuilds on resize without leaked tweens.

---

## 7. SECTION 2 — FASHION BEGINS WITH YOU (BEGINS-C, wireframe-to-suit scan morph)

`section#begins`, background `--gw-green`, pinned `+=260%` desktop / `+=220%` mobile (scrub 0.6).

**Copy (verbatim):** eyebrow "FASHION BEGINS WITH YOU"; h2 "FASHION BEGINS WITH *YOU.*" (`clamp(2.25rem, 6vw, 5.5rem)`, accent word in Cormorant italic gold); paragraph (`--fs-lead`, ivory 85%): "A complete styling and suit-making experience, designed around your body, your style and your moments."

**Layout (desktop, 5/7 split):** left — eyebrow, h2, paragraph. Right — the morph frame `.begins__morph` (aspect 4/5, max-height 82svh, radius `--radius-card`, overflow hidden) with two layers: `measurement.png` (wireframe) below and `final-western.png` above, clipped `inset(0 0 100% 0)`. A 2px gold scan line (`--scan-glow`) sits at the top of the frame. Beneath the frame, three chips (`.begins__chip`): **BODY**, **STYLE**, **MOMENTS** (12px, uppercase, letter-spacing 0.18em, 1px ivory 50% border, radius `--radius-pill`).

**Timeline (scrub 0.6):**

- 0–25%: h2 lines mask-reveal, then the paragraph fades up (25–45%), both tied to the scrub (not time-based).
- 20–90%: the scan line travels top→bottom while the suit layer's clip-path opens in sync (`inset(0 0 100% 0)` → `inset(0)`); the wireframe dims (brightness 1→0.5) as it is covered. This is a vertical scan wipe, deliberately different from the hero's horizontal curtain.
- Chips light gold (gold fill, green text, 0.3s) in thirds: BODY at 0–33%, STYLE at 33–66%, MOMENTS at 66–100%; they un-light on reverse.
- 90–100%: hold; the suit image brightens 1→1.05.
- Mobile: the frame sits on top (54svh), text below, pin `+=220%`. Reduced motion: no pin, the suit image shown with the three chips lit.

---

## 8. SECTION 3 — TECHNOLOGIES (TECH-C, giant outlined type stack)

`section#technology`, background `--gw-green-deep`. **Not pinned.** Eyebrow "TECHNOLOGIES" only (the type stack is the headline). The six labels, no invented descriptions: `3D`, `AI`, `ML`, `ROBOTICS`, `QUANTUM PHYSICS`, `SUSTAINABLE RECYCLING` (approved wording required before launch).

**Rows:** six `.tech-word` rows (`article`, `tabindex="0"`), each `min-height: 38svh`, 1px top border `--gw-line`, a small index "01"–"06" at the left (12px, stone) and the label set in giant Raleway 200 uppercase with a 1px gold outline (`-webkit-text-stroke: var(--stroke-outline) var(--gw-gold)`, transparent fill). Sizes: `3D`, `AI`, `ML` → `clamp(6rem, 22vw, 20rem)`; `ROBOTICS` → `clamp(4rem, 15vw, 13rem)`; `QUANTUM PHYSICS` and `SUSTAINABLE RECYCLING` → `clamp(2.25rem, 8.2vw, 7.5rem)` (one line on desktop, two lines on mobile). Each word has a duplicated overlay `.tech-word__fill` (solid gold) clipped `inset(0 100% 0 0)`.

**Peek card (`.tech-peek`):** a 260×340 card (140×180 on mobile), radius 20px, showing the active row's image: `3D` → `measurement.png`; `AI` → `blazer-selection.jpg`; `ML` → `fabric-selection.png`; `ROBOTICS` → `auto-stitching.png`; `QUANTUM PHYSICS` → `scan-hand.jpg`; `SUSTAINABLE RECYCLING` → `recycling.jpg` (to supply; temporary crop of `auto-cutting.png`).

**Motion:**

- Scroll fill: each row has its own ScrollTrigger (`start: top 70%`, `end: bottom 30%`, scrub 0.5) that opens the gold fill left→right as the row crosses the viewport centre band; rows outside the band dim to 30% opacity (0.4s).
- Peek card (desktop, pointer-fine): follows the pointer with `gsap.quickTo` (offset 24px, rotation ±6deg by pointer velocity); it appears (scale 0.8→1, opacity 0→1, 0.3s) when the pointer is over a row and swaps the image with a clip wipe. On touch devices the card is fixed at the right edge (16px, vertically centred) and wipes to the active row's image as it crosses the centre band.
- Velocity skew: the stack's `skewY` = clamp(scroll velocity / -250, -5, 5)deg, easing back to 0 over 0.5s.
- Keyboard: rows are focusable; focus shows the peek card and fills the word. Reduced motion: words filled gold, no skew, no peek movement.

---

## 9. SECTION 4 — THE GW EXPERIENCE, 8 STEPS (EXP-C, self-drawing gold path)

`section#experience`, background `--gw-green`. Header block: eyebrow "THE GW EXPERIENCE"; h2 "THE GW *EXPERIENCE*"; support line "An 8 step journey that brings together technology, design and craftsmanship."

**Path container `.experience__path`:** not pinned; height = 8 × 72svh (desktop) / 8 × 64svh (mobile). Inside: an SVG (`.experience__svg`, `aria-hidden`) with a faint track path (1px `--gw-line`) and a gold path (2px, `pathLength="1"`, `stroke-dasharray: 1`, `stroke-dashoffset: 1`). Desktop: a smooth zigzag alternating at x 30% / 70%; mobile: a straight vertical line at the left (x 10%). The gold path draws as you scroll (`start: top 60%`, `end: bottom 70%`, scrub 0.6, offset 1→0).

**Nodes and cards (8):** each node is a button (`.exp-node--1` … `.exp-node--8`, 16px circle with a number label, positions in CSS) on the path. When the draw head passes a node it becomes `.is-reached`: gold fill and a pulse ring (scale 1→2.2, opacity 0.6→0, 0.8s). Its card (`.exp-card`, aspect 4/5, width `clamp(240px, 28vw, 380px)`, radius `--radius-card`) reveals beside the node — odd steps to the right, even steps to the left — with the image reveal and x ±60→0 (1s `power3.out`). Each card shows the title and a small "See in detail" link.

| # | Title (verbatim) | Image | Detail link |
| --- | --- | --- | --- |
| 01 | 3D + ML Screening | `scanner-booth.png` | `#scanner` |
| 02 | Robotics Measurement | `measurement.png` | `#scanner` |
| 03 | ML Fabric Selection | `fabric-selection.png` | `#imagine` |
| 04 | ML + AI Styling | `blazer-selection.jpg` | `#imagine` |
| 05 | ML + AI Accessory Selection | `accessories-selection.png` | `#imagine` |
| 06 | Hair + Grooming — ML | `grooming.png` | `#imagine` |
| 07 | Automated Cutting, Precise Stitching through ML | `auto-cutting.png` | `#machines` |
| 08 | Final Result | `final-western.png` | `#final` |

**Extras:** a sticky counter (`.experience__counter`, top-right, `top: calc(var(--header-h) + 16px)`) shows "03 / 08" with a digit roll (0.5s) as nodes are reached. Hover on a node: the ring grows and its card lifts 8px. Clicking or pressing Enter on a node calls `lenis.scrollTo` to centre its card. Mobile: the line is vertical at the left and cards are full width beside it (`calc(100% - 56px)`), no zigzag. Reduced motion: path fully drawn, all nodes reached, cards visible.

---

## 10. SECTION 5 — DIGITAL SCANNER (SCAN-C, drag comparison slider)

`section#scanner`, background `--gw-green-deep`. **Not pinned.** Desktop: two columns (frame 7 / panel 5).

**Frame (`.scan__compare`, aspect 2/3, max-height 84svh, radius `--radius-card`, overflow hidden):** `scanner-booth.png` as the base and `measurement.png` (wireframe) above, clipped by `clip-path: inset(0 calc(100% - var(--split)) 0 0)` so the wireframe is revealed to the left of the handle. `--split` is a CSS custom property (default 50%) written by the compare helper. The handle (`.scan__handle`): a 2px gold line (`--scan-glow`) with a 44px circle carrying `fa-arrows-left-right`; `role="slider"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Compare the scanner photo with the measurement wireframe"`. Drag with pointer events (`setPointerCapture`); arrow keys ±2 (Shift ±10), Home/End. Corner tags: "SCAN" (left) and "PHOTO" (right). A hint "Drag to compare" fades after the first drag.

**Auto-demo:** when the frame enters (`top 60%`, once) the handle sweeps 10%→90%→50% (2.4s total, `power2.inOut`), then hands control to the user.

**Panel:** eyebrow "STEPS 01–02 · DIGITAL SCANNER"; h2 "DIGITAL *SCANNER*"; title "MEASUREMENT" (Raleway 300, letter-spacing 0.4em, ivory); then a list `.scan__list` with eight rows, each with a threshold in `data-gw-at`: HEIGHT 170 cm (10), NECK 38 cm (22), SHOULDER 46 cm (34), CHEST 98 cm (46), SLEEVE 62 cm (58), WAIST 86 cm (70), HIP 98 cm (82), INSEAM 78 cm (94). Rows start dim (ivory 30%). When the handle position passes a row's threshold the row becomes `.is-lit` (gold) and its value counts up from 0 (0.6s, once); moving the handle back below the threshold dims it again. Two small cutaway thumbnails (`scan-legs.jpg`, `scan-hand.jpg`, 16:9, radius 16px) sit under the list with a parallax y ±6% (hidden on mobile). Caption: "Sample measurements for illustration."

**Mobile:** the frame is full width on top, the list beneath, the handle circle 44px. Reduced motion: handle at 50%, no demo, all rows lit.

---

## 11. SECTION 6 — IMAGINE YOUR LOOK (IMG-C, expanding category panels)

`section#imagine`, background gradient `--gw-midnight` → `--gw-green`. **Not pinned.**

**Top block (verbatim copy):** h2 "IMAGINE YOUR *LOOK.*"; second line "SEE IT BEFORE YOU WEAR IT."; "Tell us how you want to look."; "Our AI + ML + Robotics creates a complete style direction - outfit fabric, accessories, grooming & more". A read-only brief field (`.brief__input`, blinking gold caret) types the first brief once on entry (45ms/char). Three chips (`role="tab"` group): "Investor meeting", "Wedding", "Refresh my style". Each chip carries `data-gw-brief`, `data-gw-outfit`, `data-gw-fabric`, `data-gw-accessories`, `data-gw-grooming` (placeholder copy in the HTML, never in JS). Micro-label: "Concept preview — illustrative looks."

**Panels (`.look-panels`, flex row, gap 12px, height `clamp(420px, 70svh, 640px)`):** four panels, `flex: 1` when collapsed and `flex: 4` when `.is-active` (transition 0.9s `--ease-out`): **01 Outfit** (`blazer-selection.jpg`), **02 Fabric & Colours** (`fabric-selection.png`), **03 Accessories** (`accessories-selection.png`), **04 Hair & Grooming** (`grooming.png`). Collapsed: a vertical label (`writing-mode: vertical-rl`, rotated 180deg) and the index. Active: outlined index, horizontal label, and a glass card bottom-left holding the value for the chosen brief (line-mask swap, 0.4s).

**Interaction:**

- Hover (desktop), focus, Enter or tap activates a panel. Chips retype the brief (cancel running typing, clear 0.2s, retype at 25ms/char) and swap all four values; `aria-live="polite"` announces the change. Arrow keys move between panels and chips.
- **Scroll-linked activation:** until the first manual interaction, the active panel follows scroll progress through the section (`start: top 40%`, `end: bottom 60%`, four segments); after the first interaction it stops permanently.
- Panels reveal with the image reveal, staggered 0.12s; panel images drift y ±5% (scrub).
- Mobile: a vertical accordion (container height 84svh, `flex-direction: column`; collapsed panels 76px, active panel grows). Reduced motion: no typing or scroll-linking, instant changes.
- CTA **Explore AI Styling**. Compliance: `accessories-selection.png` currently shows real luxury watch brands — replace with an unbranded version before launch.

---

## 12. SECTION 7 — AUTOMATED MACHINES (MACH-B, parallax diptych + magnifier lens)

`section#machines`, background `--gw-green-deep`. **Not pinned**; section height about 160svh. **No body copy.** Eyebrow "STEP 07"; title "AUTOMATED *MACHINES*" (outlined ivory, `--fs-giant`, centred, overlapping the top of the images, z above); labels "CUT" and "STITCH".

**Layout:** two tall frames (`.machines__col--cut` and `.machines__col--stitch`, each 46vw wide, height 90svh, radius `--radius-card`, overflow hidden, gap 4vw); the right frame is offset down by 12svh. Images: `auto-cutting.png` and `auto-stitching.png`, each 120% tall inside its frame.

**Motion:**

- Entry: both frames use the image reveal, staggered 0.2s; title letters rise through a mask; labels appear bottom-left of each frame.
- Parallax (scrub 0.6 over the whole section): the cutting image moves y +8%→-8% while the stitching image moves y -8%→+8% (opposite directions).
- **Magnifier lens (`.machines__lens`):** a 180px circle with a 1px gold border and soft shadow that follows the pointer (`gsap.quickTo`, 0.4s) over either frame. It shows a 2× magnified view using a dedicated element with the frame's image as its background (`.machines__lens--cut` / `--stitch` set the `background-image` in CSS, `background-size: 200%`), with `--lens-x` and `--lens-y` custom properties (percentages of the pointer position inside the frame) updated on `pointermove` via `setProperty`. It appears with scale 0.6→1 and opacity (0.3s) on enter and hides on leave. Touch: press-and-hold for 300ms activates the lens, drag moves it, release hides it (`touch-action: pan-y` so scrolling still works).
- Mobile: frames stack vertically (each 70svh), parallax y ±6%, lens by long-press. Reduced motion: no parallax; the lens stays available for pointer users.

---

## 13. SECTION 8 — FINAL RESULTS (FINAL-C, before/after slider carousel)

`section#final`, background `--gw-green`. **Not pinned.**

**Copy (verbatim):** eyebrow "FINAL RESULTS"; "ULTIMATE RESULT OF" (small caps, ivory); then `ROBOTICS + AI + MACHINE LEARNING` set large in Raleway 200 (`clamp(2rem, 5vw, 4.5rem)`), each word in `.final__word`. When the section enters (`top 60%`, once) the three words light from ivory 20% to gold one after another (0.5s each, 0.35s stagger).

**Carousel (`.final__carousel`):** two slides. Each slide holds a comparison slider (`.final__compare`, aspect 4/5, max-height 78svh, radius `--radius-card`) built with the same compare helper as the Scanner (`--split`, gold handle with `--scan-glow`, `role="slider"`, keyboard arrows). Corner tags: "EVERYDAY" (left) and "FINAL LOOK" (right).

- Slide 1 — **WESTERN FORMAL:** before `scanner-booth.png`, after `final-western.png`.
- Slide 2 — **TRADITIONAL INDIAN:** before `scanner-booth.png`, after `final-indian.jpg` (to supply; temporary crop of `auto-stitching.png`). A label under each slide shows the look name. Desktop: the active slide is centred (width `min(520px, 40vw)`) and the next slide peeks 12% at the edge (scale 0.9, dimmed to 55%).

**Controls and motion:**

- Previous/next buttons (48px, `fa-chevron-left` / `fa-chevron-right`), two dots, swipe on touch (pointer events; swiping is ignored while a handle is being dragged), and Left/Right arrows when focus is on the carousel but not on a handle.
- Slide change: horizontal slide (x 0→-100%, 0.9s `expo.inOut`) with the label swapping through a line mask.
- Auto-demo: when a slide becomes active its handle sweeps 20%→80%→50% (1.8s). A "Drag to compare" hint fades after the first drag.
- Scroll: the carousel uses the image reveal on entry and a parallax y ±4% on the frame.
- CTA **Book Your GW Experience** (outlined pill) below. Reduced motion: handles at 50%, no demo, slides change with a 300ms fade.

---

## 14. SECTION 9 — GW REWARDROBE (count-up + before/after reveal)

Background `--gw-green` panel, `min-height: 100svh`, noise overlay at 4%. Top row: eyebrow "GW REWARDROBE", h2 "NEW STYLE. LESS *WASTE.*", support line "Give eligible pre-loved clothes a new purpose." Centre: label "UP TO" above **25%** in gold (`clamp(8rem, 26vw, 24rem)`, weight 200, tabular figures) followed by "OFF" at 20% size. Below: a before/after band (full container width, 16:7 desktop / 4:5 mobile, radius `--radius-card`). Bottom: CTA **Explore ReWardrobe**.

**Terms line (always visible):** `.rewardrobe__terms` is `position: sticky; bottom: 0` inside the section, 12px, stone, centred, on a green gradient: "Up to 25% off eligible new purchases. Terms apply." The copy must not be altered or removed.

**Motion:** count-up when the number enters (`top 65%`, once): 0→25 over 1.8s `power2.out`, integer steps, with the number rising through a mask (1.2s) and a gold line drawing beneath it (`scaleX` 0→1). The before/after band is pinned `+=120%` desktop / `+=90%` mobile (scrub 0.6): `wardrobe-before.jpg` (desaturated 0.6) below, `wardrobe-after.jpg` above with clip-path `inset(0 100% 0 0)` → `inset(0)` and a gold seam. Captions cycle with progress through a line mask: **RETURN.** (0–33%) → **REWARD.** (33–66%) → **RENEW.** (66–100%). Reduced motion: number at 25, after image only. Do not present the rewards programme as operational beyond the supplied copy.

---

## 15. SECTION 10 — FINAL CTA

Background `--gw-green-deep` with a radial vignette (gold 6% from the right), `min-height: 100svh`, two columns (text / portrait), stacked on mobile with the portrait first (60svh). Portrait `portrait.jpg` (use `final-western.png`) in an arch-top frame (radius 220px 220px 28px 28px) with the inner image 120% tall; parallax y -10%→+10% (scrub); frame reveal via clip-path `inset(100% 0 0 0)` → `inset(0)` (1.2s). Headline (`--fs-h2`, weight 200, uppercase, gold): "YOUR NEXT LOOK / STARTS *HERE.*" with a line-mask reveal (inner yPercent 110→0, 1.1s `power4.out`, stagger 0.14s). CTA (solid gold pill **Book Your GW Experience**) fades up 0.3s later and is magnetic on pointer-fine devices (up to 12px toward the cursor, `elastic.out(1, 0.4)` on leave). Microcopy: "Appointment subject to confirmation." (12px, stone). Section id `#book`.

---

## 16. FOOTER

Background `--gw-green-deep`, id `#footer`. Row 1: Experience · Technology · AI Styling · Final Looks · ReWardrobe · Contact (14px, uppercase, letter-spacing 0.15em, ivory; hover gold with a 0.4s underline draw). Row 2: Privacy · Terms · Returns · FAQs (12px, stone). Brand line left "Designed Around You. Not the Rack."; legal right "© 2026 Green Wardrobe." Giant wordmark "GREEN WARDROBE" ("GW" on mobile), Raleway 200, `clamp(4rem, 17vw, 18rem)`, gold, cropped 12% by the viewport bottom. Motion: as the footer enters (`top 90%` → `bottom bottom`, scrubbed) letters rise from yPercent 110 to 0 in a mask (stagger 0.04s) with a gold gradient sweep (background-position 200%→0); links stagger fade up (0.08s). Optional desktop curtain: footer sticky at the bottom behind the preceding section.

---

## 17. ASSET MANIFEST (`assets/img`, `assets/video`)

| File | Source | Status |
| --- | --- | --- |
| `gw-logo.png`, `gw-badge.svg` | supplied logo / transparent badge | logo provided; **badge SVG to supply** |
| `hero.jpg`, `hero.mp4`, `hero-after.mp4/.jpg` | hero poster, everyday clip, tailored look | poster provided; **video and after layer to supply** |
| `scanner-booth.png` | `1.png` | provided |
| `scan-legs.jpg`, `scan-hand.jpg` | extract\_frame files | provided |
| `measurement.png` | `2.png` | provided |
| `fabric-selection.png` | `3.png` | provided |
| `blazer-selection.jpg` | `5.jpg` | provided |
| `accessories-selection.png` | `6.png` | provided — **replace with unbranded** |
| `grooming.png` | `7.png` | provided |
| `auto-cutting.png`, `auto-stitching.png` | `8.png`, `9.png` | provided |
| `final-western.png` | `10.png` | provided |
| `final-indian.jpg`, `recycling.jpg` | traditional final look; recycling visual | **to supply** |
| `wardrobe-before.jpg`, `wardrobe-after.jpg` | old → curated wardrobe | **to supply** |

Export as WebP/AVIF with explicit width/height; lazy-load below the fold; preload the first image of each pinned section when it is within one viewport. All copy is taken verbatim from the supplied content pages; do not invent claims, and do not present conceptual AI/robotics features as operational beyond the supplied wording.

---

## 18. QA CHECKLIST

- [ ] `grep -rn "style=" index.html` returns nothing; no `<style>` tags, no inline scripts, no `on*=` attributes; one CSS file; one JS file per module; script order as specified.
- [ ] Section order and IDs: `#top`, `#begins`, `#technology`, `#experience`, `#scanner`, `#imagine`, `#machines`, `#final`, `#rewardrobe`, `#book`, `#footer`; menu and footer links land correctly.
- [ ] Preloader: tracks real loading, never decreases, ≥1.8s on first visit, 8s hard timeout, hero intro starts on `gw:ready`.
- [ ] Hero: text ≈70% of viewport, card peeks ≈28svh; card reaches full screen with radius 0; video plays at ≥50% and pauses on reverse; wipe and BEFORE/AFTER work both ways; the marquee reverses with scroll direction and pauses off-screen; blocks pause at 70%.
- [ ] Every pinned section reverses cleanly; `ScrollTrigger.refresh()` runs after images load; no overlapping pin spacers.
- [ ] Begins: chips light in order with the scan wipe; Technologies: row fill and peek card work with pointer, touch and keyboard; Experience: path draw, node pulses and counter stay in sync; Scanner and Final sliders work by pointer, touch and keyboard with correct ARIA values; Imagine: scroll-linking stops after the first manual interaction; Machines: lens follows the pointer and long-press works on touch.
- [ ] "Terms apply" line always visible in ReWardrobe; sample-measurements caption visible in Scanner.
- [ ] `prefers-reduced-motion` fallback verified for every section; touch behaviour verified (no hover dependence).
- [ ] Lighthouse Accessibility ≥ 95, Performance ≥ 85 on mobile; tested at 375, 768, 1024, 1440, 1920 px; no horizontal scroll.
