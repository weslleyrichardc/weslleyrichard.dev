# Design System

One place for the site's layout, typography and shared UI rules. Reach for these tokens and primitives before writing new utilities. Colors are covered in THEME.md.

## Tokens

### Color

Semantic classes only: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `bg-accent`, `border-border`, `border-input`, `ring-ring`. Never hardcode `text-white`, `text-black` or raw hex values in markup.

### Type

| Role          | Class / token                            | Use                                        |
| ------------- | ---------------------------------------- | ------------------------------------------ |
| Page title    | `.page-title`                            | The single `h1` on a page                  |
| Page intro    | `.page-lede`                             | One or two sentences under the page title  |
| Section title | `text-xl font-semibold` inside `Section` | Section headings (`h2`)                    |
| Body          | Base `0.92rem` from `BaseLayout`         | Paragraphs, lists and card descriptions    |
| Metadata      | `.meta`                                  | Dates, reading time, tags, secondary facts |
| Muted link    | `.link-muted`                            | Back links and low-emphasis navigation     |

### Layout

- Content width: `max-w-content` (60rem), set once in `BaseLayout`.
- Page rhythm: `.page` (`flex w-full flex-col gap-y-10`).
- Section rhythm: `Section` uses `gap-y-5` on mobile and two columns from `md`.
- Responsive page padding lives in `BaseLayout`; do not add another `px-*` wrapper.
- Radius comes from `--radius` (`rounded-lg`, `rounded-md`, `rounded-sm`).

### Focus

Every interactive element gets the global `:focus-visible` outline from `app.css`. Do not remove it; add a custom focus style only when a component needs a different shape.

## Primitives

| Component                 | Responsibility                                                      |
| ------------------------- | ------------------------------------------------------------------- |
| `PageHeader.astro`        | The page `h1`, optional intro, optional slot for page-level actions |
| `Section.astro`           | A titled page section; title column and content column              |
| `Label.astro`             | Icon + short text row (location, social action)                     |
| `SkillBadge.astro`        | One skill category line on the about and resume pages               |
| `ExperienceItem.astro`    | One job entry with company link and period                          |
| `SocialLink.astro`        | Footer social icon link                                             |
| `Icon.astro`              | The site's inline SVG set                                           |
| `ThemeToggle.astro`       | Header button; dispatches `toggle-theme`                            |
| `CommandPalette.tsx`      | Navigation, copy and browser-AI actions                             |
| `ui/command`, `ui/dialog` | Palette primitives                                                  |

`PageHeader` props:

```astro
<PageHeader title='Blog' description='Notes on building software.' />
<PageHeader title='Home' description='...' align='center'>
	<!-- page-level extras such as labels or a print button -->
</PageHeader>
```

`Section` usage:

```astro
<Section title='Experience'>
	<ul class='space-y-4 text-muted-foreground'>
		{experience.map((item) => <ExperienceItem {...item} />)}
	</ul>
</Section>
```

## Shared Classes

Defined in `src/styles/app.css`:

- `.page` — page stack
- `.page-header` — title/intro/actions stack
- `.page-title` — `h1` scale
- `.page-lede` — intro scale and measure
- `.meta` — small muted metadata
- `.link-muted` — small muted link with a foreground hover
- `.button-outline` — secondary button (print/save, actions)

Markup example:

```astro
<div class='page'>
	<PageHeader title='Resume' description='Backend Software Engineer' />
	<Section title='Profile'>
		<p class='text-foreground'>{profile}</p>
	</Section>
</div>
```

Metadata row:

```astro
<div class='meta flex flex-wrap items-center gap-x-3 gap-y-1'>
	<time datetime={isoDate}>{formattedDate}</time>
	<span aria-hidden='true'>·</span>
	<span>{readingTime}</span>
</div>
```

The 404 page is the only display-type exception: it keeps its oversized `h1` but still uses `.page-lede` and the shared layout width.

## Rules

1. One `h1` per page, rendered by `PageHeader`; sections use `h2` via `Section`.
2. Every page body is wrapped in `.page`.
3. Use `Section` for top-level page sections; do not recreate the two-column layout.
4. Use the shared classes above before adding a new one-off utility combination.
5. New reusable UI belongs in `src/components/`; new global classes belong in `app.css` and must be documented here.
6. Keep the page rhythm at `gap-y-10` and the section rhythm at `gap-y-5` unless the page is print-specific.
7. Use semantic colors and the global focus ring; test both themes and keyboard navigation.
8. Check narrow screens and the printed resume after changing shared classes. Print always switches to the light palette, even when the visitor is in dark mode.
