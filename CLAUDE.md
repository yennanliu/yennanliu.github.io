# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a personal portfolio website (yennj12.js.org) built with static HTML/CSS/JavaScript and Bootstrap. It includes:
- Landing page with video header and responsive design
- Portfolio showcase with project galleries
- About me section
- Contact page
- Jekyll blog subdirectory (yen_blog_Jeklly) with separate configuration

## Architecture
- **Static Site**: Pure HTML/CSS/JS with no build process for main site
- **Frontend Framework**: Bootstrap 4.5.2 with custom CSS
- **Styling**: CSS variables for theming, AOS animation library
- **Jekyll Blog**: Separate Jekyll installation in `yen_blog_Jeklly/` directory
- **Assets**: Images in `img/`, fonts in `fonts/` and `font-awesome/`, CSS in `css/`, JS in `js/`

## Development Commands

### Main Site (Static)
No build process required. Simply edit HTML/CSS/JS files directly and serve locally:
```bash
# Serve locally (Python 3)
python -m http.server 8000

# Serve locally (Python 2) 
python -m SimpleHTTPServer 8000
```

### Jekyll Blog (yen_blog_Jeklly subdirectory)
```bash
cd yen_blog_Jeklly
bundle install
bundle exec jekyll serve
```

## Key Files Structure
- `index.html` - Main landing page with video header and portfolio preview
- `portfolios.html` - Full portfolio showcase page
- `about_me.html` - About section
- `contact.html` - Contact page with Google Maps integration
- `navigation.html` - Shared navigation component
- `footer.html` - Shared footer component
- `utility.js` - Shared JavaScript utilities
- `locations.json` - Data for Google Maps markers
- `yen_blog_Jeklly/` - Jekyll blog with separate Gemfile and _config.yml

## Styling System

The whole site runs on one design system: two inks and one typeface. Two
shared stylesheets carry it. The files keep their historical names
(`finlab.css`, `--fl-*`) because every page is written against those
names; the values are the black-and-white system described here.

- `css/finlab.css` — tokens (`--fl-*`) plus base and primitives. Load it
  **before** a page's own `<style>` block.
- `css/finlab-theme.css` — the normalisation layer: face, width, weight,
  radius, shadow, button and label appearance. Load it **after** the
  page's `<style>` block so it wins the cascade. It never sets layout
  properties.

The rules the system is built on:

- **Two inks, no third.** `#000` and `#fff` plus a short neutral grey
  ramp. Nothing is tinted (no `#0b0b0b`, no slate). There is no accent
  colour: emphasis is inversion — a black band, an ink-filled row on
  hover, one filled button. The "signal" and categorical tokens still
  exist by name and resolve to greys.
- **One family, three widths.** Archivo variable, loaded from Google
  Fonts with `wdth,wght@62..125,100..900`. Display type is wide
  (`--fl-wide`, 118%) and light (300); body is normal width at 400;
  small interface text and captions are narrow (`--fl-narrow`, 82%) at
  500. The width axis does the work a second typeface would have done.
  Reference faces as `var(--fl-display|body|mono)`; mono is for repo
  names and code identifiers only.
- **Three weights only** — 300 / 400 / 500. Nothing is bold.
- **Sentence case everywhere.** No tracked capitals, no eyebrow labels
  over every heading, no `01 / 02 / 03` numbering unless the content is
  actually a sequence (the career path is; the six layers are not), no
  middle dots or arrows inside link text.
- **Scale:** body 1.0625rem at line-height 1.6; section heading
  `--fl-fs-title`; page heading `--fl-fs-zone`; `--fl-fs-xl` is the front
  door's headline and the closing statement, and needs the `xl` class on
  an `h1` to escape the normalisation layer's size rule.
- **Square panels, pill controls.** Large surfaces and images have no
  radius; buttons and tags are pills; inputs are 4px. Nothing casts a
  shadow — structure comes from 1px rules: `--fl-hair` (soft grey) inside
  lists, `--fl-line` (ink) between sections.
- **Photographs are greyscale until touched.** `finlab.css` applies
  `filter: grayscale(1)` to every `img`/`video` and lifts it on hover or
  focus of the image, its link, or its figure. Inline SVG is drawn from
  the tokens and is exempt.
- **Motion answers an action.** Row and block hovers invert; images
  regain colour; accordions open. The one non-triggered sequence on the
  site is the landing page's hero entrance. No per-section fade-ups, no
  counters, no marquees, no typewriters. `prefers-reduced-motion` is
  honoured everywhere.
- **Light is the default.** Dark is the same ramp read from the other
  end (see below).

### The landing page

`index.html` carries no extra stylesheet; its `<style>` block is the
whole page. The one deliberately loud element is the hero headline: a
black band starts two and a quarter lines into it, and everything in the
hero is drawn white with `mix-blend-mode: difference`, so the type is
black on the paper, white on the band, and the third line is half of
each. Two additive scripts, both skipped under reduced motion: the band
rises into place on load, and the seam climbs a little with the scroll.
The markup is complete without them — the band sits at rest in CSS and
the script only adds the offset it then removes.

The seam is computed from the headline size (`--seam: calc(var(--pt) +
var(--xl) * 2.2)`), so change `--xl` on `.hero`, never the `h1`'s
`font-size` directly, or the band will stop lining up.

Below the hero: six hairline rows for the layers (the ink fill on hover
bleeds into the page margin through a `::before`; the rules do not),
a contact sheet of six greyscale plates linking into the portfolio
records, two large blocks for the deeper pages, the career path (the one
numbered-by-years sequence), and a black closing band that runs into the
black footer.

### The AI-builder diagrams

`ai_builder.html` carries its own set of explanatory panels below the
run graph — KV cache, retrieval, the agent loop, harness engineering.
They share the fan graph's vocabulary and add nothing new to the
palette: hairlines and ink in four flat tints (`--tint` through
`--tint-4`), mono only for the numeric readouts.

- **Every figure on them is a model of a mechanism, not a measurement**,
  and each panel says so in a `.note` under the chart. Keep that line
  when you change the numbers. The cache arithmetic is the only part
  that is real: published input and cache-read rates, ten to one.
- The three toggles are one control, `.seg`. Adding a fourth panel
  means reusing it, not inventing another switch.
- Figures animate through `tween()`, which reads the current value off
  the node's `data-v` — so repeated switches interpolate instead of
  jumping, and `prefers-reduced-motion` snaps straight to the value.
- A `.note` is a `<div>`, never a `<p>`: `finlab-theme.css` forces body
  face and base size onto `p` with `!important`, which would undo the
  small caption.
- Rows that reorder (`.rank-i`) are positioned by a `--p` index against
  a `--rh` row height, both declared in the markup, so the list is in
  the right order before the script runs and stays right when the row
  height changes at a breakpoint.

The run graph's architecture drawing is the same ASCII art it always
was, plus a drawn version of it — `.arch`, an SVG of the same five rows
with traffic on the edges. A box lights everything that touches it
because each edge names the two boxes it joins (`data-k="sched email"`),
and the readout under the drawing says what the box is. The `.seg`
toggle switches the two views; **both ship visible and the script
hides one**, so no-JS gets the schematic with the ASCII under it rather
than an empty panel. The SVG keeps a `min-width` inside an
`overflow-x: auto` wrapper — it scrolls on a phone instead of shrinking
the type to nothing.

### Dark

Every page's dark switch resolves to one palette, declared once in
`finlab.css` under all three selectors the site uses:

```css
:root[data-theme="dark"],   /* index, portfolios */
:root[data-mode="ink"],     /* ai_builder        */
body.dark-mode              /* the Bootstrap-era pages */
```

It is the same ramp swapped end for end: `--fl-ink` becomes `#fff`,
`--fl-surface` becomes `#000`, and the black bands (hero band, closing
band, footer) turn white. Two things to know when adding to it:

- **Use `--fl-on-ink`, never `#fff`,** for text on an ink-filled control.
  `--fl-ink` inverts, so a hardcoded white foreground goes ink-on-ink and
  disappears. The landing page's hero is the one exception: its content
  is literally `#fff` because the difference blend does the inverting.
- Pages driven by their own tokens need a `body.dark-mode { … }` block
  re-pointing those tokens; `finlab.css` cannot reach them. Prefer
  pointing page tokens at `var(--fl-*)` so this happens for free.

All pages share the `theme` localStorage key (`light` / `dark`), so a
choice follows the reader across the site.

### Navigation and the theme switch

One bar on every page: `<nav class="site-nav">` plus `css/site-nav.css`
and `js/site-nav.js`.

- It is **sticky, not fixed**. A sticky bar takes up layout space, so no
  page needs a `body { padding-top }` to compensate. `site-nav.css`
  zeroes any that are left over.
- `site-nav.css` loads **last**, after the page's own `<style>`, because
  it has to win over the nav rules it replaces.
- The brand is the word `Yen` in the wide display face. The CTA is a
  filled pill reading `Contact`. The theme switch is a disc, half ink
  and half paper, that turns over when switched; the old `☀/☾` glyph
  span is still in the markup and hidden by CSS.
- The switch sets **all three** dark mechanisms at once
  (`data-theme`, `data-mode`, `body.dark-mode`), so each page's existing
  dark CSS keeps working without being rewritten.
- Theme is applied by a small **inline, synchronous** script in each
  `<head>`. It has to run before first paint; a deferred script lets the
  page flash light before turning dark.

If you add a page, copy the nav block, the inline head script, and the
two file references. Do not write another nav.

### The footer

`<footer class="site-footer" id="site-footer">` plus `css/site-footer.css`.
It is the black base every page stands on: ink ground, paper type, the
wordmark in the wide display face, three columns (Work / Navigate /
Connect) with hairline heads, and a lower bar. In dark it turns white.

**It goes on the six pages the nav bar reaches, and only those:**
`index`, `about_me`, `portfolios`, `ai_builder`, `aws_architecture`,
`contact`. The pages off the nav — `codejob`, `tutor`, `main_project`,
`nobody` — keep whatever footer they had. That boundary is deliberate;
do not widen it without being asked.

- It **brings its own container** (`.ft-wrap`), so it does not care what
  a page calls its wrapper or whether Bootstrap's `.container` is in
  play.
- It **anchors its own em ladder at 16px** rather than inheriting the
  root size, since `css/bootstrap.css` sets `html { font-size: 10px }`
  on the oldest pages.
- Every rule is scoped to `.site-footer`.
- `footer.html` holds the same block as a reference copy. Nothing loads
  it at runtime; keep it in step when the markup changes.

If you add a page to the nav, give it this footer too.

### Reviewing a page

Headless Chrome is enough to look at a page: a CDP-driven screenshot
script that can emulate a phone, force dark via localStorage, hover an
element and report horizontally overflowing elements was used for this
redesign. Serve the repo with `python3 -m http.server` and check every
page in light, dark and at 390px before committing.

## Deployment
- Hosted on GitHub Pages
- CNAME file maps to yennj12.js.org domain
- Jekyll blog is built and served from `yen_blog_Jeklly/_site/`
- No CI/CD pipeline - direct file commits trigger rebuilds