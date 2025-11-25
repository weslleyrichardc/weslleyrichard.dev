# Weslley Richard - Personal Portfolio

Welcome to the repository for my personal website and portfolio. This project showcases my professional experience, technical skills, and background as a Backend Software Engineer. Below you'll find instructions on how to set up, customize, and deploy the website.

## Project Overview

This is a modern, responsive personal portfolio website built with Astro and Tailwind CSS. It features:

- **Home Page:** Introduction, location, and contact links
- **About Page:** Detailed professional experience and technical stack
- **Responsive Design:** Optimized for all devices
- **Dark/Light Theme:** Full theme support with automatic system preference detection
- **Semantic Theming:** Consistent color system using CSS custom properties

The website serves as an online resume and a way for potential employers and collaborators to learn more about my work in backend development, microservices, and cloud technologies.

## Technologies Used

- **Framework:** [Astro](https://astro.build/) - Static site generator
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language:** TypeScript, JavaScript
- **Deployment:** Vercel (configured for static hosting)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/weslleyrichard.dev.git
   cd weslleyrichard.dev
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Development Workflow

Before committing changes, ensure the project builds successfully:

```bash
pnpm run build
```

This command runs type checking and builds the project to catch any errors early.

## Customization

- **Content:** Edit pages in `src/pages/` and components in `src/components/`
- **Styling:** Modify Tailwind classes or update `tailwind.config.js`
- **Site Config:** Update `src/site.config.ts` for site-wide settings
- **Theming:** See [.opencode/THEME.md](./.opencode/THEME.md) for comprehensive theming documentation

### Theming System

The site includes a comprehensive theming system that supports both light and dark modes:

- **Automatic Theme Detection:** Respects user's system preference
- **Manual Toggle:** Theme switcher in the header
- **Semantic Colors:** Uses `text-foreground`, `text-muted-foreground`, etc.
- **Persistent Preference:** Saves user choice to localStorage

For detailed theming guidelines, color usage, and best practices, refer to [.opencode/THEME.md](./.opencode/THEME.md).

## Deployment

The site is configured for deployment on Vercel. Push to your repository and connect it to Vercel for automatic deployments.

## Credits

- **Template:** Based on [Astro Resume Theme](https://astro.build/themes/details/resume/)
- **Icons:** Astro Icon component
- **Fonts:** Custom fonts in `public/fonts/`
