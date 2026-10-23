'use client'

import * as React from 'react'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command'
import {
	askAi,
	detectAi,
	destroyAiSession,
	formatAiAnswer,
	getCurrentPageContext
} from '@/lib/browser-ai'

type AiStatus = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

export default function CommandPalette() {
	const [open, setOpen] = React.useState(false)
	const [aiMode, setAiMode] = React.useState(false)
	const [aiQuestion, setAiQuestion] = React.useState('')
	const [aiAnswer, setAiAnswer] = React.useState('')
	const [aiStatus, setAiStatus] = React.useState<AiStatus>('idle')
	const [aiError, setAiError] = React.useState('')
	const [aiHint, setAiHint] = React.useState('')
	const [aiSupported, setAiSupported] = React.useState(false)
	const [moreBelow, setMoreBelow] = React.useState(false)
	const aiRef = React.useRef<number>(0)
	const listRef = React.useRef<HTMLDivElement>(null)
	const aiInputRef = React.useRef<HTMLTextAreaElement>(null)

	// Auto-grow the question textarea so long questions wrap instead of
	// scrolling out of view (capped, then it scrolls internally).
	React.useEffect(() => {
		const el = aiInputRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${Math.min(el.scrollHeight, 160)}px`
	}, [aiQuestion, aiMode])

	// "Scroll for more" cue: visible while the AI answer list actually has
	// content below the fold, hidden once the visitor reaches the end.
	const updateMoreBelow = React.useCallback(() => {
		const el = listRef.current
		setMoreBelow(Boolean(el) && el!.scrollHeight - el!.scrollTop - el!.clientHeight > 8)
	}, [])

	React.useEffect(() => {
		const id = requestAnimationFrame(updateMoreBelow)
		return () => cancelAnimationFrame(id)
	}, [aiAnswer, aiStatus, aiMode, updateMoreBelow])

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (
				e.key === 'k' &&
				(e.ctrlKey || e.metaKey) &&
				!(e.target as HTMLElement).matches('input, textarea, [contenteditable]')
			) {
				e.preventDefault()
				setOpen((open) => !open)
			}
		}
		const custom = () => setOpen(true)
		document.addEventListener('keydown', down)
		document.addEventListener('open-command-palette', custom)
		return () => {
			document.removeEventListener('keydown', down)
			document.removeEventListener('open-command-palette', custom)
		}
	}, [])

	React.useEffect(() => {
		if (!open || aiSupported) return
		void detectAi().then((result) => {
			setAiSupported(result.supported)
			if (result.supported) setAiHint(result.message ?? '')
		})
	}, [open, aiSupported])

	const resetAi = () => {
		aiRef.current += 1 // cancel in-flight streams
		setAiMode(false)
		setAiQuestion('')
		setAiAnswer('')
		setAiStatus('idle')
		setAiError('')
		setMoreBelow(false)
		destroyAiSession()
	}

	const ask = async (question: string) => {
		if (!question.trim() || aiStatus === 'thinking' || aiStatus === 'streaming') return

		aiRef.current += 1
		const runId = aiRef.current
		setAiAnswer('')
		setAiError('')
		setAiStatus('thinking')

		try {
			const context = getCurrentPageContext() // capture before the question UI changes the DOM
			for await (const chunk of askAi(question, context)) {
				if (runId !== aiRef.current) return // superseded or closed
				setAiStatus('streaming')
				setAiAnswer((prev) => prev + chunk)
			}
			if (runId === aiRef.current) setAiStatus('done')
		} catch (error) {
			if (runId !== aiRef.current) return
			setAiStatus('error')
			setAiError(error instanceof Error ? error.message : 'Something went wrong')
		}
	}

	return (
		<CommandDialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAi())}>
			{aiMode ? (
				<>
					<div className='flex items-start border-b px-3'>
						<MagnifyingGlassIcon className='mr-2 mt-3 h-4 w-4 shrink-0 opacity-50' />
						<textarea
							ref={aiInputRef}
							aria-label='Ask the browser AI'
							autoFocus
							placeholder='Ask anything… (Enter to ask, Shift+Enter for a new line)'
							rows={1}
							value={aiQuestion}
							onChange={(e) => setAiQuestion(e.target.value)}
							onKeyDown={(e) => {
								if (
									e.key === 'Enter' &&
									!e.shiftKey &&
									!(e.nativeEvent as KeyboardEvent).isComposing
								) {
									e.preventDefault()
									e.stopPropagation() // keep cmdk from selecting an action item
									void ask(aiQuestion)
								}
							}}
							className='max-h-40 min-h-[40px] w-full resize-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground'
						/>
					</div>
					<CommandList ref={listRef} onScroll={updateMoreBelow}>
						<div
							className='mb-1 whitespace-pre-wrap px-3 py-2 text-sm text-foreground'
							aria-live='polite'
						>
							{aiStatus === 'idle' && (
								<p className='text-sm text-muted-foreground'>
									Ask anything — the browser built-in AI answers on-device (private, offline, free)
									and can see the page you are viewing.
								</p>
							)}
							{aiStatus === 'thinking' && (
								<p className='text-sm text-muted-foreground'>Thinking…</p>
							)}
							{aiAnswer && (
								<blockquote className='border-l-2 border-border pl-3'>
									{formatAiAnswer(aiAnswer)}
								</blockquote>
							)}
							{aiStatus === 'error' && <p className='text-sm text-foreground'>{aiError}</p>}
						</div>
						{moreBelow && (
							<div
								aria-hidden
								className='pointer-events-none sticky bottom-0 z-10 bg-gradient-to-t from-popover to-transparent pb-1 pt-6 text-center text-xs text-muted-foreground'
							>
								<span className='inline-flex items-center gap-1'>
									Scroll for more
									<ChevronDownIcon className='h-3 w-3 animate-bounce' />
								</span>
							</div>
						)}
						{(aiStatus === 'done' || aiStatus === 'error' || aiStatus === 'streaming') && (
							<CommandGroup heading='ACTIONS'>
								{aiAnswer && (
									<CommandItem
										onSelect={() => navigator.clipboard.writeText(formatAiAnswer(aiAnswer))}
									>
										Copy Answer
									</CommandItem>
								)}
								<CommandItem onSelect={() => void ask(aiQuestion)}>Retry</CommandItem>
								<CommandItem onSelect={resetAi}>Back to Commands</CommandItem>
							</CommandGroup>
						)}
					</CommandList>
				</>
			) : (
				<>
					<CommandInput placeholder='Type a command or search...' />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading='Go To'>
							<CommandItem onSelect={() => (window.location.href = '/')}>Home</CommandItem>
							<CommandItem onSelect={() => (window.location.href = '/about')}>About</CommandItem>
							<CommandItem onSelect={() => (window.location.href = '/resume')}>Resume</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						{aiSupported && (
							<CommandGroup heading='Assistant'>
								{aiHint && <p className='px-3 pb-1 text-xs text-muted-foreground'>{aiHint}</p>}
								<CommandItem
									onSelect={() => {
										setAiMode(true)
										setAiHint('')
									}}
								>
									Ask AI…
								</CommandItem>
							</CommandGroup>
						)}
						<CommandSeparator />
						<CommandGroup heading='General'>
							<CommandItem
								onSelect={() => {
									navigator.clipboard.writeText(window.location.href)
								}}
							>
								Copy Link
							</CommandItem>
							<CommandItem
								onSelect={() =>
									(window.location.href = 'https://github.com/weslleyrichardc/weslleyrichard.dev')
								}
							>
								View Source
							</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup heading='Theme'>
							<CommandItem
								onSelect={() => {
									const current = document.documentElement.classList.contains('dark')
										? 'light'
										: 'dark'
									localStorage.setItem('theme', current)
									document.documentElement.classList.toggle('dark')
								}}
							>
								Toggle Theme
							</CommandItem>
						</CommandGroup>
					</CommandList>
				</>
			)}
		</CommandDialog>
	)
}
