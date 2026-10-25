'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatAiAnswer } from '@/lib/browser-ai'

/**
 * Rendered on demand through a lazy import in CommandPalette, so the markdown
 * pipeline (react-markdown + remark-gfm) is code-split out of the initial
 * island bundle and only fetched when the browser AI actually answers.
 */
export default function AiAnswer({ answer }: { answer: string }) {
	return (
		<div className='border-l-2 border-border pl-3 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:my-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-sm [&_h4]:mt-2 [&_h4]:text-sm [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{formatAiAnswer(answer)}</ReactMarkdown>
		</div>
	)
}
