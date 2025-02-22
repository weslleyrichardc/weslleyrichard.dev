import { siteConfig } from '@/site-config'
import rss from '@astrojs/rss'

export const GET = async () => {
	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
	})
}
