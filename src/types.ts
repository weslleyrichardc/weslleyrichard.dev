export type SiteConfig = {
	author: string
	title: string
	description: string
	lang: string
	ogLocale: string
	date: {
		locale: string | string[] | undefined
		options: Intl.DateTimeFormatOptions
	}
	socialLinks: {
		linkedin: string
		github: string
		email: string
	}
	socialImageAlt: string
}

export type SiteMeta = {
	title: string
	description?: string
	ogImage?: string | undefined
	articleDate?: string | undefined
}
