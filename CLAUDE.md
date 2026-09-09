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
- **Light is the default.** Pages with a toggle opt in to dark; none of
  them follow the OS preference any more.
- 0.16s ease for state changes, and `prefers-reduced-motion` honoured.

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