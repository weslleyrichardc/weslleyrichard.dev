# Agent Guidelines for weslleyrichard.dev

## Commands

- **Build**: `astro check && astro build`
- **Lint**: `prettier --write "**/*.{js,jsx,ts,tsx,md,mdx,svelte,astro}" && eslint --fix "src/**/*.{js,ts,jsx,tsx,svelte,astro}"`
- **Dev**: `astro check --watch & astro dev`
- **Pre-commit**: `prettier --check "**/*.{js,jsx,ts,tsx,md,mdx,svelte,astro}" && eslint "src/**/*.{js,ts,jsx,tsx,svelte,astro}"`
- **No test framework** - run lint after changes to verify

## Code Style

- **TypeScript**: Strict mode enabled, use explicit types
- **Imports**: Use path aliases (@/components, @/utils, @/types, etc.)
- **Formatting**: Tabs, single quotes, no trailing commas, 100 char width
- **Naming**: camelCase functions, PascalCase components, kebab-case files
- **Components**: Astro with TypeScript, destructure props, use cn() for classes
- **Error Handling**: TypeScript strict null checks, handle edge cases
- **Theme Testing**: Always test changes in both light and dark modes using the theme toggle
- **Styling**: Tailwind CSS with clsx/cn utility for conditional classes
- **Theming**: Use semantic color classes (text-foreground, text-muted-foreground). Never use hardcoded colors like text-white. See THEME.md in this directory for comprehensive theming guidelines.
