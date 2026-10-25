import { getCollection, type CollectionEntry } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

/**
 * Returns published posts, newest first.
 *
 * Drafts are available while running the dev server, but are excluded from
 * production builds.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
	const posts = await getCollection('blog', ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true
	})

	return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
}
