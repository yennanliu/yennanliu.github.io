---
name: web-design-standards
description: Provides guidance on HTML/CSS best practices for responsive web design, Bootstrap integration, accessibility, and performance optimization. Use when building web pages, styling components, or improving web design quality.
allowed-tools: Read, Grep, Glob
---

# Web Design Standards

## Bootstrap 4.5.2 Integration
- Use Bootstrap grid system for responsive layouts
- Leverage Bootstrap components (navbar, cards, buttons) before custom styling
- CSS variables for consistent theming (primary/secondary colors, light/dark modes)

## Responsive Design Principles
1. Mobile-first approach
2. Test at breakpoints: 320px, 768px, 1024px, 1366px
3. Use flexbox for layouts
4. Ensure touch-friendly targets (min 44px)

## Accessibility Standards
- Semantic HTML5 elements (header, nav, main, footer, section, article)
- ARIA labels for screen readers
- Color contrast ratios: WCAG AA (4.5:1 for text)
- Keyboard navigation support

## Performance Optimization
- Lazy load images with loading="lazy"
- Minify CSS and JavaScript
- Use CSS variables to reduce duplication
- Optimize image sizes (WebP format when possible)

## CSS Architecture
- Use CSS variables in :root for theming
- Organize CSS: layout, components, utilities
- Avoid inline styles
- Use meaningful class names (BEM or similar)

## Form Design
- Label all inputs
- Clear error messages
- Success feedback
- Mobile-friendly input types (email, tel, number)
