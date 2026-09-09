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

The whole site runs on one design system, adapted from finlab.finance:
a quiet, light research-desk look. Two shared stylesheets carry it.

- `css/finlab.css` — tokens (`--fl-*`) plus base and primitives. Load it
  **before** a page's own `<style>` block.
- `css/finlab-theme.css` — the normalisation layer: type, weight, radius,
  shadow and nav appearance. Load it **after** the page's `<style>` block
  so it wins the cascade. It never sets layout properties.

The rules the system is built on:

- **Two weights only** — 300 for display, 400 for everything else. Nothing
  on the site is bold; hierarchy comes from size and colour.
- **A capped scale** — 2.5rem is the largest character on any page; body
  is 1rem at line-height 1.7; the floor is 12px.
- **Space Grotesk** display, **DM Sans** body, system mono for figures
  and chrome. Reference them as `var(--fl-display|body|mono)`.
- **Hairline rules, not shadows** — 1px `--fl-hair` does the structural
  work; the four shadow tokens are a whisper.
- **Flat surfaces** — no gradients. The ground steps
  `#fff` → `#fbfcfe` → `#f8fafc` → `#f5f5f7`.
- **One blue for action** (`--fl-link`), ink for the single filled button
  per view; green/red are reserved for data that moves.
- **Light is the default.** Dark is opt-in; no page follows the OS
  preference any more.
- 0.16s ease for state changes, and `prefers-reduced-motion` honoured.

### The landing page

`index.html` alone carries a signature layer on top of the system —
`css/index-signature.css` and `js/index-signature.js`, both loaded last
and only there. The front door is allowed to speak up; the rest of the
site stays quiet.

It keeps the palette, the hairlines, the two weights and the mono. What
it changes is scale, composition and responsiveness:

- The hero headline is **the one deliberate break of the 2.5rem cap** —
  it goes to 5.25rem at weight 300. If you raise the cap anywhere else,
  the break stops reading as intentional.
- A pipeline rail down the left edge marks the five sections and fills
  as you scroll; a hairline across the top tracks read progress.
- Each section gets an oversized outline numeral in the margin
  (`data-sig="02"` on the `<section>`), drawn as a stroke so it stays
  texture rather than hierarchy.
- The hero topology is wired to the confidence bars beneath it: each
  `.topo .node[data-skill="n"]` lights `.tc-skill` number `n`. It adds no
  new labels — it only makes a correspondence the card already had
  visible.
- The six layers are a **stack**, not a marquee: six plates offset into
  a staircase, one open at a time, wired to its detail panel by a
  hairline that tracks whichever plate you took. It is a real tablist —
  arrow keys, Home/End, one tab stop.
- The trajectory chart is an instrument, not a picture: the scope fills
  only as far as the era you take, a lead path carries the accent up to
  that point over a ghost of the whole curve, a packet runs the path on
  a loop, and the panel's figures count up. Where a year sits along the
  curve is measured off the path with `getPointAtLength`, never
  hard-coded, so the numbers stay right if the curve is redrawn.
- Pointer spotlight on the hero grid.

Two rules the stack exists to respect, worth keeping if you extend it:

- **Decoration must never be able to hide content.** The entrance is a
  transition, not a filled keyframe animation (`animation-fill-mode:
  both` pins the *from* state until the animation runs, so a stalled
  clock leaves the text invisible), and the class driving it is removed
  once it has played.
- **Script subtracts, markup is complete.** Nothing starts with `hidden`
  or `opacity: 0` in the HTML/CSS; the script adds those once it is
  running, so no-JS or a failed observer degrades to everything visible.

All of it is additive: the page works with the JS removed, and every
motion-driven part is skipped under `prefers-reduced-motion`.

### Dark

Every page's dark switch resolves to one palette, declared once in
`finlab.css` under all three selectors the site uses:

```css
:root[data-theme="dark"],   /* index, portfolios */
:root[data-mode="ink"],     /* ai_builder        */
body.dark-mode              /* the Bootstrap pages */
```

It is a true near-black ground (`#0a0a0b`) with the ink/surface ramp
turned inside out. Two things to know when adding to it:

- **Use `--fl-on-ink`, never `#fff`,** for text on an ink-filled control.
  `--fl-ink` inverts, so a hardcoded white foreground goes ink-on-ink and
  disappears.
- Pages driven by their own tokens need a `body.dark-mode { … }` block
  re-pointing those tokens; `finlab.css` cannot reach them.

All pages share the `theme` localStorage key (`light` / `dark`), so a
choice follows the reader across the site.

### Navigation and the theme switch

One bar on every page: `<nav class="site-nav">` plus `css/site-nav.css`
and `js/site-nav.js`. Before this there were five nav implementations at
four different heights, and one page had none.

- It is **sticky, not fixed**. That is the detail that makes it
  portable — a sticky bar takes up layout space, so no page needs a
  `body { padding-top }` to compensate. `site-nav.css` zeroes any that
  are left over.
- `site-nav.css` loads **last**, after the page's own `<style>`, because
  it has to win over the nav rules it replaces.
- The switch sets **all three** dark mechanisms at once
  (`data-theme`, `data-mode`, `body.dark-mode`), so each page's existing
  dark CSS keeps working without being rewritten.
- Theme is applied by a small **inline, synchronous** script in each
  `<head>`. It has to run before first paint; a deferred script lets the
  page flash light before turning dark.

If you add a page, copy the nav block, the inline head script, and the
two file references. Do not write a fifth nav.

Per-page `:root` blocks still exist and still drive each page's own CSS —
they now hold FinLab values, so retheming a page means editing its tokens
rather than hunting colour literals.

Also in use: Bootstrap 4.5.2 for grid and components, Font Awesome for
icons, AOS for scroll animations.

## Deployment
- Hosted on GitHub Pages
- CNAME file maps to yennj12.js.org domain
- Jekyll blog is built and served from `yen_blog_Jeklly/_site/`
- No CI/CD pipeline - direct file commits trigger rebuilds