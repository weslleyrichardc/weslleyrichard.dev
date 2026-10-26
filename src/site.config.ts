import type { SiteConfig } from '@/types'
import type { AstroExpressiveCodeOptions } from 'astro-expressive-code'

export const siteConfig: SiteConfig = {
	// Used as the meta author and article:author property (src/components/BaseHead.astro)
	author: 'Weslley Richard',
	// Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
	title: 'Weslley Richard',
	// Meta property used as the default description meta property
	description:
		'Backend Software Engineer focused on PHP, Laravel, Symfony, AWS and Docker. Based in Tbilisi, Georgia.',
	// Alt text for the social card image (og:image:alt / twitter:image:alt)
	socialImageAlt:
		'Weslley Richard — backend engineer. Distributed systems in PHP with Symfony, Laravel, AWS, Kafka and Docker',
	// HTML lang property, found in src/layouts/BaseLayout.astro
	lang: 'en-US',
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: 'en_US',
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: 'en-US',
		options: {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}
	},
	socialLinks: {
		linkedin: 'https://www.linkedin.com/in/weslleyrichardc',
		github: 'https://github.com/weslleyrichardc',
		email: 'mailto:weslleyrichardc@gmail.com'
	}
}

export const menuLinks: Array<{ title: string; path: string }> = [
	{
		title: 'Home',
		path: '/'
	},
	{
		title: 'About Me',
		path: '/about/'
	},
	{
		title: 'Blog',
		path: '/blog/'
	},
	{
		title: 'Resume',
		path: '/resume/'
	}
]

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ['dracula', 'github-light'],
	themeCssSelector(theme, { styleVariants }) {
		// One dark and one light theme are available. Tie the code theme to the
		// same `.dark` class the rest of the site uses, so the header toggle and
		// the command palette both switch code blocks without extra JS.
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme
			if (theme === baseTheme || theme === altTheme) {
				return theme.type === 'dark' ? '.dark' : ':root:not(.dark)'
			}
		}
		// return default selector
		return `[data-theme="${theme.name}"]`
	},
	useThemedScrollbars: false,
	styleOverrides: {
		frames: {
			frameBoxShadowCssValue: 'none'
		},
		uiLineHeight: 'inherit',
		codeFontSize: '0.875rem',
		codeLineHeight: '1.7142857rem',
		borderRadius: '4px',
		codePaddingInline: '1rem',
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;'
	}
}
