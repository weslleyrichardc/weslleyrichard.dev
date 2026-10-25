# Weslley Richard - Personal Portfolio

Welcome to the repository for my personal website and portfolio. This project showcases my professional experience, technical skills, and background as a Backend Software Engineer. Below you'll find instructions on how to set up, customize, and deploy the website.

## Project Overview

This is a modern, responsive personal portfolio website built with Astro and Tailwind CSS. It features:

- **Home Page:** Introduction, location, and contact links
- **About Page:** Detailed professional experience and technical stack
- **Blog:** Markdown posts rendered with Astro content collections, code highlighting, and reading time
- **Command Palette:** Quick navigation and actions with Ctrl+K shortcut, including Go To pages, Copy Link, View Source, and theme toggle
- **Responsive Design:** Optimized for all devices
- **Dark/Light Theme:** Full theme support with automatic system preference detection
- **Semantic Theming:** Consistent color system using CSS custom properties

The website serves as an online resume and a way for potential employers and collaborators to learn more about my work in backend development, microservices, and cloud technologies.

## Technologies Used

- **Framework:** [Astro](https://astro.build/) - Web framework, statically generated (SSG)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language:** TypeScript, JavaScript
- **Deployment:** Vercel (serverless, via the `@astrojs/vercel` adapter)

## Getting Started

### Prerequisites

- Node.js (v22.22.0 or higher)
- pnpm (v11.28.7, pinned in `package.json` via `packageManager`)

  If `pnpm --version` does not match the pinned version, enable Corepack:

  ```bash
  corepack enable
  ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/weslleyrichard.dev.git
   cd weslleyrichard.dev
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build for Production

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

### Development Workflow

Before committing changes, run the following commands to ensure code quality and build success:

1. **Lint and format code:**

   ```bash
   pnpm run lint
   ```

   This formats files with Prettier and fixes ESLint issues.

2. **Build the project:**
   ```bash
   pnpm run build
   ```
   This runs type checking and builds the project to catch any errors early.

## Customization

- **Content:** Edit pages in `src/pages/` and components in `src/components/`
- **Styling:** Modify Tailwind classes or update `tailwind.config.js`
- **Site Config:** Update `src/site.config.ts` for site-wide settings
- **Theming:** See [.opencode/THEME.md](./.opencode/THEME.md) for comprehensive theming documentation

### Writing a post

Add a Markdown file to `src/content/blog/` with `title`, `description`, `publishDate`, `tags`, and `draft` frontmatter. Posts with `draft: true` are available in development and excluded from production builds.

### Theming System

The site includes a comprehensive theming system that supports both light and dark modes:

- **Automatic Theme Detection:** Respects user's system preference
- **Manual Toggle:** Theme switcher in the header
- **Semantic Colors:** Uses `text-foreground`, `text-muted-foreground`, etc.
- **Persistent Preference:** Saves user choice to localStorage

For detailed theming guidelines, color usage, and best practices, refer to [.opencode/THEME.md](./.opencode/THEME.md).

## Deployment

The site is configured for deployment on Vercel as a statically generated build (`output: 'static'`), served from the CDN with no serverless functions. Push to your repository and connect it to Vercel for automatic deployments.

## Credits

- **Template:** Based on [Astro Resume Theme](https://astro.build/themes/details/resume/)
- **Icons:** Astro Icon component
- **Fonts:** Custom fonts in `public/fonts/`
