# Blog Content

Posts are Markdown files in `src/content/blog/`. The collection loader claims `**/*.md` only — an `.mdx` file is not picked up.

## Frontmatter

```md
---
title: 'A human title'
description: 'One sentence used on the blog index and as the meta description.'
publishDate: 2026-10-26
draft: false
tags: ['astro', 'performance']
ogImage: '/og/my-post.png'
---
```

| Field         | Required | Notes                                                           |
| ------------- | -------- | --------------------------------------------------------------- |
| `title`       | yes      | Post heading and page title                                     |
| `description` | yes      | Blog index summary and meta description                         |
| `publishDate` | yes      | Coerced to a date; displayed in UTC                             |
| `draft`       | no       | Defaults to `false`; drafts render in dev, not in production    |
| `tags`        | no       | Defaults to `[]`; lowercased and de-duplicated automatically    |
| `ogImage`     | no       | Path to a custom social image; falls back to `/social-card.png` |

## File name and URL

The file name is the slug: `src/content/blog/ask-ai-command-palette.md` → `/blog/ask-ai-command-palette/`.

- Always link with the trailing slash.
- On the index, post cards link to `/blog/<slug>/`.
- Back links use `/blog/`.

## Rendering

- Reading time is derived with `getReadingTime(post.body ?? '')`; the fallback keeps an empty body from throwing.
- Dates are formatted with `getFormattedDate(date, { timeZone: 'UTC' })` on post pages.
- Code blocks use the site's Expressive Code themes and follow the `.dark` class.
- Markdown images are unwrapped from paragraphs by `rehype-unwrap-images`.
- External links are rendered with `target="_blank"` and `rel="nofollow noopener noreferrer"` by `rehype-external-links`; links written inside components need that `rel` explicitly.
- Posts are sorted newest first by `publishDate`.

## Before publishing

1. The file ends in `.md` and the frontmatter validates.
2. The description is a complete sentence.
3. Internal links end in `/`.
4. `pnpm build` passes and the post appears at the expected `/blog/<slug>/` URL.
5. The post renders on a narrow screen and in both themes.
