---
name: portfolio-layouts
description: Creates responsive portfolio galleries, project showcases, and image grid layouts. Use when building portfolio pages, creating image galleries, or designing project showcase sections. Handles lazy loading and responsive image optimization.
allowed-tools: Read, Glob, Grep
---

# Portfolio and Gallery Layouts

## Responsive Grid Layouts
- Use CSS Grid for gallery layouts: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`
- Flexbox for flexible card layouts
- Adjust columns per breakpoint:
  - Mobile (< 768px): 1-2 columns
  - Tablet (768px-1024px): 2-3 columns
  - Desktop (> 1024px): 3-4 columns

## Image Optimization
- Use picture element for art direction
- Lazy load with: `loading="lazy"`
- Size images appropriately (max 200KB for thumbnails)
- Use WebP with JPG fallback

## Portfolio Card Structure
```html
<div class="portfolio-card">
  <div class="image-wrapper">
    <img src="thumb.jpg" loading="lazy" alt="Project name">
  </div>
  <div class="card-content">
    <h3>Project Title</h3>
    <p>Description</p>
    <a href="#">Learn More</a>
  </div>
</div>
```

## Hover/Animation Effects
- Use CSS transitions for smooth effects
- AOS (Animate On Scroll) library integration
- Parallax effects on hero sections
- Keep animations under 300ms for responsiveness

## Gallery Best Practices
- Maintain consistent aspect ratios across gallery
- Provide loading states for images
- Include alt text for all images
- Consider using modal/lightbox for full-size views
- Implement filter/sort functionality for large portfolios
