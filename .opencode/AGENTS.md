# Agent Guidelines for weslleyrichard.dev

## Commands

- **Install**: `pnpm install` — pnpm is pinned via `packageManager`, Node is `24.x`
- **Dev**: `pnpm dev` — plain `astro dev`
- **Build**: `pnpm build` — `astro check && astro build`
- **Lint**: `pnpm lint` — Prettier `--write` then ESLint `--fix`
- **Test**: `pnpm test` — `node --test`, tests live in `test/*.test.mjs`
- **Pre-commit** (husky): `prettier --check`, `eslint`, `astro check`. Never pass `--no-verify`.

## Configuration

- **site.config.ts**: site-wide author, title, description, language, social links and date formatting.
  - `menuLinks` is the single source for the header nav and the command palette.
  - `expressiveCodeOptions` is consumed by `astro.config.mjs`; code themes follow the same `.dark` class as the rest of the site.
- **astro.config.mjs**: static output on Vercel, canonical `site` is the `www` domain, sitemap, prefetch, React, Tailwind and Expressive Code. Markdown external links get `rel="nofollow noopener noreferrer"`.
- **content.config.ts**: blog collection loads `**/*.md` only. See CONTENT.md.
- **src/data/resume.ts**: single source for profile, availability, experience, education and skills (home, about and resume pages).
- **Styles**: `src/styles/app.css` holds the CSS custom properties; `tailwind.config.js` maps them to semantic classes.

## Project Rules

### Theme

- `ThemeProvider.astro` is the only owner of theme state. The header button and the palette dispatch `toggle-theme`; they never write `localStorage` or toggle `.dark` themselves.
- The provider is the only place that persists the choice. It follows the OS only while no choice is stored.
- Re-apply the theme on `astro:page-load` and `astro:after-swap`; inline scripts must be safe to re-run on view transitions.
- Keep `aria-pressed` on `#toggleDarkMode` and both `meta[name="theme-color"]` tags in sync with the effective theme.
- Test every theme change in light and dark. See THEME.md.

### Links and URLs

- Every internal link ends with `/` to match the canonical URLs Astro emits: `/blog/`, `/blog/<slug>/`, `/about/`, `/resume/`.
- Add the trailing slash when adding a new page, a `menuLinks` entry or a link in content.
- Canonical URLs use the `www` host declared in `astro.config.mjs`; do not emit the apex domain.

### Accessibility

- Keep the visible keyboard shortcut in the trigger's accessible name (WCAG 2.5.3).
- `eslint-plugin-jsx-a11y` recommended rules run on `**/*.tsx`. Fix findings; do not disable them.
- Do not use `autoFocus`; move focus with an effect or a ref (see the Ask AI textarea).
- SVG icons are decorative unless labelled: `aria-hidden="true"` and `focusable="false"`.
- Keep the palette openable with both Ctrl+K and Cmd+K, closable with Esc, and usable from the keyboard.

### Command palette

- Hydrate with `client:idle={{ timeout: 800 }}` so React stays off the critical path but the palette is ready before Ctrl/Cmd+K.
- Keep the closed dialog cheap; do not eagerly render the AI answer or markdown parser.
- Give copy actions visible success feedback and keep the dialog's focus handling intact.
- Pass `menuLinks` from `site.config.ts` as a prop; do not duplicate the list.

### Dependencies and dead code

- Do not add a dependency for a few lines; use the platform, an existing helper, or a small local function.
- Delete unused components, icons, exports, schema fields and dependencies instead of keeping them "for later".
- There is exactly one `cn()` helper: `import { cn } from '@/lib/utils'`.
- `@/utils` exports only `getFormattedDate`; use `@/lib/utils` for classes.

### Layout and markup

- Use `w-full`, not `w-screen`; the layout already centers content.
- Footer year is rendered client-side; do not hardcode it in markup.
- Blog reading time uses `getReadingTime(post.body ?? '')`, so an empty body does not crash the page.

## Code Style

- **TypeScript**: strict mode, explicit types, handle null/undefined.
- **Imports**: path aliases (`@/components/*`, `@/lib/*`, `@/data/*`, `@/types`, `@/site-config`, `@/utils`).
- **Formatting**: Prettier config — tabs, single quotes, no trailing commas, 100 char width, Tailwind class sorting.
- **Naming**: camelCase functions, PascalCase components, kebab-case files.
- **Components**: Astro with TypeScript; destructure props; use `cn()` for conditional classes.
- **Styling**: semantic Tailwind classes (`text-foreground`, `text-muted-foreground`). Never hardcode `text-white`/`text-black`. See THEME.md.
- **Comments**: explain why, not what. Keep the existing `shortcut:`/known-limit notes.

## Content

- Blog posts are `.md` files in `src/content/blog/`; the loader does not claim `.mdx`.
- Required frontmatter: `title`, `description`, `publishDate`. Optional: `draft`, `tags`, `ogImage`.
- Drafts render in dev and are excluded from production builds. The file name is the slug and the URL is `/blog/<slug>/`.
- See CONTENT.md for the authoring checklist.

## Git Workflow

- **Always create a branch** from `main`; never commit directly to `main`.
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`, `test:`.
- **Open a PR** with `gh pr create`, wait for the Vercel checks, then wait to be asked to merge with `gh pr merge <n> --merge`.
- Keep `main` in sync with `git pull --ff-only` after a merge.
- Do not force-push `main`; the only force-updated ref is the `latest` tag during a release.

## Testing

- **Run tests on every change** before pushing or opening a PR:
  1. `pnpm test` — theme provider checks
  2. `pnpm build` — type checking plus the full build
  3. `pnpm lint` — formatting and lint fixes
  4. Pre-commit hooks run automatically; do not skip them
- New non-trivial logic (branches, loops, parsing, theme/state, security) needs a small `node:test` case in `test/`. Trivial changes do not.
- For link, canonical or markup changes, inspect the built HTML in `dist/`, not only the source.
- A change is ready for review once all of the above pass.

## Releases

See RELEASING.md. Short version: bump `package.json`, merge to `main`, create annotated `vX.Y`, move and force-push `latest`, and verify both point at the release commit.
