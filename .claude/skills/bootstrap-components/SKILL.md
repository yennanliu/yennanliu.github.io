---
name: bootstrap-components
description: Guides proper usage of Bootstrap 4.5.2 components (navbar, cards, buttons, modals, forms). Use when styling navigation, creating card layouts, building forms, or customizing Bootstrap components. Includes override patterns for custom styling.
allowed-tools: Read, Grep
---

# Bootstrap Component Usage

## Navbar Configuration
- Use Bootstrap navbar for responsive navigation
- Mobile hamburger menu with collapse
- Sticky or fixed positioning for persistent navigation
- Dark/light variants for theming

Example structure:
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
  <a class="navbar-brand" href="#">Brand</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav ml-auto">
      <li class="nav-item"><a class="nav-link" href="#">Home</a></li>
    </ul>
  </div>
</nav>
```

## Card Components
- Bootstrap card for uniform layouts
- Combines well with grid for responsive galleries
- Use card-deck for equal-height cards
- Custom footer for CTA buttons

Example:
```html
<div class="card">
  <img class="card-img-top" src="image.jpg" alt="Card image">
  <div class="card-body">
    <h5 class="card-title">Card Title</h5>
    <p class="card-text">Description text</p>
    <a href="#" class="btn btn-primary">Learn More</a>
  </div>
</div>
```

## Button Styling
- Use Bootstrap button classes: btn, btn-primary, btn-secondary
- Size variants: btn-sm, btn-lg
- State management: active, disabled, loading states
- Custom hover colors with CSS variables

## Form Components
- Use Bootstrap form groups
- Validation states (is-valid, is-invalid)
- Floating labels for modern UI
- Accessible input types and labels

Example:
```html
<form>
  <div class="form-group">
    <label for="email">Email address</label>
    <input type="email" class="form-control" id="email" placeholder="name@example.com">
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

## Grid System
- 12-column Bootstrap grid
- Responsive classes: col-xs, col-sm, col-md, col-lg, col-xl
- Utilities: gutter spacing, alignment
- Nesting for complex layouts

Example:
```html
<div class="container">
  <div class="row">
    <div class="col-md-6 col-lg-4">Column 1</div>
    <div class="col-md-6 col-lg-4">Column 2</div>
    <div class="col-md-12 col-lg-4">Column 3</div>
  </div>
</div>
```

## Modal Components
- Use Bootstrap modals for overlays
- Fade animation for smooth transitions
- Centered or scrollable variants
- Proper accessibility (aria-labelledby, aria-hidden)

## Custom Bootstrap Overrides
- Override Bootstrap variables before importing
- Use CSS variables for runtime theming
- Add custom classes alongside Bootstrap classes
- Avoid !important - use more specific selectors instead
