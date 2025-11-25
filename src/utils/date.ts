import { siteConfig } from '@/site-config'

const dateFormat = new Intl.DateTimeFormat(siteConfig.date.locale, siteConfig.date.options)

/**
 * Formats a date using the site's configured locale and options.
 * @param date - The date to format
 * @param options - Optional formatting options to override defaults
 * @returns The formatted date string
 */
export function getFormattedDate(
	date: string | number | Date,
	options?: Intl.DateTimeFormatOptions
) {
	if (typeof options !== 'undefined') {
		return new Date(date).toLocaleDateString(siteConfig.date.locale, {
			...(siteConfig.date.options as Intl.DateTimeFormatOptions),
			...options
		})
	}

	return dateFormat.format(new Date(date))
}
