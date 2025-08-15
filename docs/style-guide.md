# Style Guide

## CSS Class Naming Conventions
- Use BEM (Block, Element, Modifier) naming for CSS classes
- Blocks: Top-level components (e.g., `bin-header`)
- Elements: Parts of a block (e.g., `bin-header__title`)
- Modifiers: Variations of a block or element (e.g., `bin-header--error`)
- Use descriptive names that reflect the purpose of the element
- Use hyphens to separate words in class names (e.g., `item-description`)
- Avoid abbreviations unless they are widely understood

## JavaScript Coding Standards
- Use ES6+ syntax with `const` and `let` for variable declarations
- Follow a consistent indentation style (2 spaces)
- Use descriptive variable and function names
- Add comments to explain complex logic
- Use arrow functions for concise syntax
- Avoid global variables and use modules to encapsulate code
- Handle errors gracefully with try-catch blocks
- Use strict equality (`===` and `!==`) for comparisons
- Keep functions short and focused on a single task

## HTML Structure Guidelines
- Use semantic HTML5 elements (e.g., `<header>`, `<nav>`, `<article>`, `<aside>`, `<footer>`)
- Ensure proper nesting of elements
- Use appropriate heading levels (<h1> to <h6>)
- Add `alt` attributes to `<img>` elements for accessibility
- Use `<label>` elements for form inputs
- Use ARIA attributes to enhance accessibility for dynamic content
- Provide a skip link for screen readers

## Accessibility Requirements
- Ensure all content is accessible to users with disabilities
- Use semantic HTML to provide a clear document structure
- Provide alternative text for images
- Use appropriate ARIA attributes for dynamic content
- Ensure sufficient color contrast
- Make sure the application is keyboard navigable
- Test with screen readers

## Responsive Design Breakpoints
- Mobile: Up to 768px
- Tablet: 769px to 1024px
- Desktop: 1025px and above
- Use media queries to adapt the layout and styling for different screen sizes
- Use flexible units (e.g., percentages, `em`, `rem`) for sizing and spacing

## Color Palette and Typography
- Primary Color: #10b981 (Green)
- Secondary Color: #3b82f6 (Blue)
- Accent Color: #8b5cf6 (Purple)
- Font Family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
- Use a consistent color palette and typography throughout the application

## Icon Usage Guidelines
- Use Font Awesome icons for visual elements
- Use semantic class names for icons (e.g., `fa-recycle` for a recycle icon)
- Ensure icons are accessible by providing appropriate `aria-label` attributes
- Use icons consistently throughout the application