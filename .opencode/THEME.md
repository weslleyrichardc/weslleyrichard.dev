# Theming System

This document outlines the theming system used in this project, including color schemes, usage guidelines, and best practices.

## Overview

The site uses a comprehensive theming system that supports both light and dark modes with CSS custom properties and Tailwind CSS classes. The theme is automatically managed based on user preferences and can be toggled manually.

## Color System

### CSS Custom Properties

The theme is built on CSS custom properties defined in `src/styles/app.css`:

```css
:root {
	--background: 210 33% 99%; /* Light background */
	--foreground: 240 10% 3.9%; /* Light text */
	--muted: 240 4.8% 95.9%; /* Light muted background */
	--muted-foreground: 240 3.8% 46.1%; /* Light muted text */
	/* ... more colors */
}

.dark {
	--background: 240 10% 3.9%; /* Dark background */
	--foreground: 0 0% 98%; /* Dark text */
	--muted: 240 3.7% 15.9%; /* Dark muted background */
	--muted-foreground: 240 5% 64.9%; /* Dark muted text */
	/* ... more colors */
}
```

### Available Color Classes

#### Text Colors

- `text-foreground` - Primary text color (main content, headings)
- `text-muted-foreground` - Secondary text color (descriptions, metadata)
- `text-primary` - Primary accent text
- `text-secondary` - Secondary accent text

#### Background Colors

- `bg-background` - Main background color
- `bg-muted` - Muted background for secondary sections
- `bg-card` - Card background color
- `bg-primary` - Primary accent background

#### Border Colors

- `border-border` - Default border color
- `border-input` - Input field borders

## Usage Guidelines

### Semantic Color Usage

#### Primary Content

Use `text-foreground` for:

- Main headings and titles
- Important text content
- Primary navigation items
- Form labels and important information

```astro
<h1 class='text-foreground'>Page Title</h1>
<p class='text-foreground'>Important content</p>
```

#### Secondary Content

Use `text-muted-foreground` for:

- Descriptions and subtitles
- Metadata (dates, categories)
- Less important information
- Placeholder text

```astro
<p class='text-muted-foreground'>Description text</p>
<span class='text-muted-foreground'>Published: Jan 1, 2024</span>
```

#### Interactive States

Use opacity variants for hover and focus states:

- `text-foreground/75` - Hover state for primary text
- `text-muted-foreground/75` - Hover state for muted text

```astro
<a class='text-foreground hover:text-foreground/75'>Link</a>
<button class='text-muted-foreground hover:text-muted-foreground/75'>Secondary action</button>
```

### Component Theming

#### Section Components

Section titles should always use `text-foreground`:

```astro
<Section title='About Me'>
	<p class='text-muted-foreground'>Description content</p>
</Section>
```

#### Navigation

Navigation items use `text-foreground` with hover states:

```astro
<a href='/about/' class='text-foreground hover:text-foreground/75'> About </a>
```

## Theme Management

### Automatic Theme Detection

The effective theme is, in order:

1. The saved choice in localStorage
2. The operating system preference (`prefers-color-scheme`)
3. Dark mode as the fallback

The OS preference is only followed while no choice is stored; once the visitor toggles the theme, the stored choice wins.

### Manual Theme Toggle

The header button and the command palette dispatch a `toggle-theme` event. `ThemeProvider.astro` is the only owner of theme state: it applies the theme, persists the choice, and keeps the UI in sync. Components must not toggle `.dark` or write localStorage themselves.

On every apply the provider also:

- sets `aria-pressed` on `#toggleDarkMode` to the effective theme
- updates both `meta[name="theme-color"]` tags so the mobile browser chrome matches the manual choice

The theme is re-applied on `astro:page-load` and `astro:after-swap`, so it survives view transitions.

### Theme Implementation

The theming is implemented in:

- `src/components/ThemeProvider.astro` - the single owner: state, persistence and application
- `src/components/ThemeToggle.astro` - header button; dispatches `toggle-theme`
- `src/components/CommandPalette.tsx` - palette action; dispatches `toggle-theme`
- `src/components/BaseHead.astro` - system-default `theme-color` tags, overwritten by the provider
- `src/styles/app.css` - CSS custom properties and base styles
- `tailwind.config.js` - Tailwind color configuration

## Best Practices

### DO ✅

- Use semantic color classes (`text-foreground`, `text-muted-foreground`)
- Test your changes in both light and dark modes
- Use opacity variants for interactive states
- Maintain consistent visual hierarchy

### DON'T ❌

- Use hardcoded colors (`text-white`, `text-black`)
- Mix semantic and non-semantic colors
- Ignore contrast ratios in either theme
- Override theme colors without good reason

## Adding New Colors

When adding new colors to the theme:

1. Add the color to both `:root` and `.dark` in `app.css`
2. Update the Tailwind config if needed
3. Test in both light and dark modes
4. Update this documentation

Example:

```css
:root {
	--accent: 240 4.8% 95.9%;
}
.dark {
	--accent: 240 3.7% 15.9%;
}
```

## Troubleshooting

### Text Not Visible in Light Mode

If text disappears in light mode:

1. Check for hardcoded `text-white` classes
2. Ensure proper semantic color usage
3. Verify CSS custom properties are loaded

### Theme Not Applying

If theme changes aren't visible:

1. Check that `ThemeProvider.astro` is included in the layout
2. Verify CSS custom properties are defined
3. Check for CSS specificity issues

## Migration Guide

When converting existing content to use the theming system:

1. Replace `text-white` with `text-foreground`
2. Replace `text-gray-500` (or similar) with `text-muted-foreground`
3. Add hover states with opacity variants
4. Test thoroughly in both themes

## Resources

- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Web Accessibility and Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
