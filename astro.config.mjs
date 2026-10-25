import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import expressiveCode from 'astro-expressive-code'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import { unified } from '@astrojs/markdown-remark'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeUnwrapImages from 'rehype-unwrap-images'
import { expressiveCodeOptions } from './src/site.config'
import { remarkReadingTime } from './src/utils/remarkReadingTime.ts'

import vercel from '@astrojs/vercel'

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    // Vercel's primary domain is www (apex 308-redirects to it); keep the
    // canonical URLs emitted by the site on the served variant.
    site: 'https://www.weslleyrichard.dev',
    prefetch: true,
    compressHTML: true,
    integrations: [expressiveCode(expressiveCodeOptions), tailwind({
        applyBaseStyles: false
		}), sitemap(), icon(), react()],
    markdown: {
        processor: unified({
            remarkPlugins: [remarkReadingTime],
            rehypePlugins: [
                rehypeUnwrapImages,
                [
                    rehypeExternalLinks,
                    {
                        target: '_blank',
                        rel: ['nofollow', 'noopener', 'noreferrer']
                    }
                ]
            ],
            remarkRehype: {
                footnoteLabelProperties: {
                    className: ['']
                }
            }
        })
    },
    output: 'static',
    adapter: vercel({
        webAnalytics: { enabled: true }
    })
})