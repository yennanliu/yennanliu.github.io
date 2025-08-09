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
- CSS variables in `:root` for consistent theming (primary/secondary colors, light/dark modes)
- Bootstrap 4.5.2 for responsive grid and components
- Custom CSS for video headers, parallax effects, and portfolio galleries
- Font Awesome for icons
- AOS (Animate On Scroll) library for animations

## Deployment
- Hosted on GitHub Pages
- CNAME file maps to yennj12.js.org domain
- Jekyll blog is built and served from `yen_blog_Jeklly/_site/`
- No CI/CD pipeline - direct file commits trigger rebuilds