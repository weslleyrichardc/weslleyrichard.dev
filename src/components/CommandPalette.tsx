'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
	ArrowLeftIcon,
	CheckIcon,
	ChevronDownIcon,
	CopyIcon,
	Cross2Icon,
	MagnifyingGlassIcon,
	ReloadIcon
} from '@radix-ui/react-icons'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command'
import { formatAiAnswer } from '@/lib/browser-ai'
import { useBrowserAi } from '@/lib/use-browser-ai'

export default function CommandPalette() {
	const [open, setOpen] = React.useState(false)
	const [aiMode, setAiMode] = React.useState(false)
	const [search, setSearch] = React.useState('')
	const [moreBelow, setMoreBelow] = React.useState(false)
	const ai = useBrowserAi()
	const { reset: resetAi } = ai
	const listRef = React.useRef<HTMLDivElement>(null)
	const aiInputRef = React.useRef<HTMLTextAreaElement>(null)
	const searchRef = React.useRef<HTMLInputElement>(null)

	const resetPalette = React.useCallback(() => {
		setAiMode(false)
		setSearch('')
		resetAi()
	}, [resetAi])

	const closePalette = React.useCallback(() => {
		setOpen(false)
		resetPalette()
	}, [resetPalette])

	const backToCommands = React.useCallback(() => {
		setAiMode(false)
		resetAi()
	}, [resetAi])

	// Ctrl/Cmd+K toggles the palette from anywhere — including while the
	// palette or its AI question box has focus (the old input/textarea guard
	// made it stop working once the palette stole focus).
	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const isToggle =
				(event.ctrlKey || event.metaKey) &&
				!event.altKey &&
				(event.key.toLowerCase() === 'k' || event.code === 'KeyK')
			if (!isToggle) return

			event.preventDefault()
			if (open) closePalette()
			else setOpen(true)
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, closePalette])

	React.useEffect(() => {
		const openPalette = () => setOpen(true)
		document.addEventListener('open-command-palette', openPalette)
		return () => document.removeEventListener('open-command-palette', openPalette)
	}, [])

	// Auto-grow the question textarea up to exactly 2 lines; content past
	// that is still accepted but the view stays clamped and the caret
	// follows the typing (no scrollbar, no clipped sliver of line 3).
	React.useEffect(() => {
		const el = aiInputRef.current
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${Math.min(el.scrollHeight, 64)}px`
		el.scrollTop = el.scrollHeight
	}, [ai.question, aiMode])

	// "Scroll for more" cue: visible while the AI answer list actually has
	// content below the fold, hidden once the visitor reaches the end.
	const updateMoreBelow = React.useCallback(() => {
		const el = listRef.current
		setMoreBelow(Boolean(el) && el!.scrollHeight - el!.scrollTop - el!.clientHeight > 8)
	}, [])

	React.useEffect(() => {
		const id = requestAnimationFrame(updateMoreBelow)
		return () => cancelAnimationFrame(id)
	}, [ai.answer, ai.status, aiMode, updateMoreBelow])

	// The close ✕ clears whatever is typed first; with nothing to clear it
	// closes the palette. It never leaves the AI view half-reset.
	const hasText = aiMode ? ai.question.length > 0 : search.length > 0
	const clearTextOrClose = () => {
		if (!hasText) {
			closePalette()
			return
		}
		if (aiMode) {
			ai.setQuestion('')
			aiInputRef.current?.focus()
		} else {
			setSearch('')
			searchRef.current?.focus()
		}
	}

	return (
		<CommandDialog
			open={open}
			onOpenChange={(next) => (next ? setOpen(true) : closePalette())}
			// Esc goes back one level from Ask AI, and closes at the first level.
			onEscapeKeyDown={(event) => {
				if (!aiMode) return
				event.preventDefault()
				backToCommands()
			}}
			showCloseButton={false}
		>
			{aiMode ? (
				<>
					<div className='flex items-start border-b px-3 pr-10'>
						<MagnifyingGlassIcon className='mr-2 mt-3.5 h-4 w-4 shrink-0 opacity-50' />
						<textarea
							ref={aiInputRef}
							aria-label='Ask the browser AI'
							autoFocus
							placeholder='Ask anything… (Enter to ask)'
							rows={1}
							value={ai.question}
							onChange={(e) => ai.setQuestion(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !(e.nativeEvent as KeyboardEvent).isComposing) {
									e.preventDefault()
									e.stopPropagation() // keep cmdk from selecting an action item
									void ai.ask(ai.question)
								}
							}}
							className='scrollbar-hide max-h-16 min-h-[40px] w-full resize-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground'
						/>
					</div>
					<div className='flex items-center justify-between border-b px-3 py-1.5'>
						<span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
							{ai.isBusy ? 'Thinking…' : 'Assistant'}
						</span>
						<div className='flex items-center gap-0.5'>
							{ai.answer && (ai.status === 'done' || ai.status === 'streaming') && (
								<button
									type='button'
									title={ai.copied ? 'Copied!' : 'Copy answer'}
									aria-label='Copy answer'
									onClick={() => void ai.copyAnswer()}
									className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
								>
									{ai.copied ? (
										<CheckIcon className='h-4 w-4 text-green-600 dark:text-green-400' />
									) : (
										<CopyIcon className='h-4 w-4' />
									)}
								</button>
							)}
							{ai.status !== 'idle' && !ai.isBusy && (
								<button
									type='button'
									title='Retry'
									aria-label='Retry'
									onClick={() => void ai.retry()}
									className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
								>
									<ReloadIcon className='h-4 w-4' />
								</button>
							)}
							<button
								type='button'
								title='Back to commands'
								aria-label='Back to commands'
								onClick={backToCommands}
								className='rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
							>
								<ArrowLeftIcon className='h-4 w-4' />
							</button>
						</div>
					</div>
					<CommandList ref={listRef} onScroll={updateMoreBelow}>
						<div className='mb-1 px-3 py-2 text-sm text-foreground' aria-live='polite'>
							{ai.status === 'idle' && (
								<p className='text-sm text-muted-foreground'>
									Ask anything — the browser built-in AI answers on-device (private, offline, free)
									and can see the page you are viewing.
								</p>
							)}
							{ai.answer && (
								<div
									className='border-l-2 border-border pl-3 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.875em] [&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:my-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:text-sm [&_h4]:mt-2 [&_h4]:text-sm [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_p]:first:mt-0 [&_p]:last:mb-0 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5'
									aria-live='polite'
								>
									<ReactMarkdown remarkPlugins={[remarkGfm]}>
										{formatAiAnswer(ai.answer)}
									</ReactMarkdown>
								</div>
							)}
							{ai.status === 'error' && <p className='text-sm text-foreground'>{ai.error}</p>}
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
					</CommandList>
				</>
			) : (
				<>
					<CommandInput
						ref={searchRef}
						value={search}
						onValueChange={setSearch}
						placeholder='Type a command or search...'
						className='pr-8'
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading='Go To'>
							<CommandItem onSelect={() => (window.location.href = '/')}>Home</CommandItem>
							<CommandItem onSelect={() => (window.location.href = '/about')}>About</CommandItem>
							<CommandItem onSelect={() => (window.location.href = '/resume')}>Resume</CommandItem>
						</CommandGroup>
						<CommandSeparator />
						{ai.supported && (
							<CommandGroup heading='Assistant'>
								{ai.hint && <p className='px-3 pb-1 text-xs text-muted-foreground'>{ai.hint}</p>}
								<CommandItem
									onSelect={() => {
										ai.clearHint()
										setAiMode(true)
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
			{/* Last in the DOM so the palette input keeps focus on open; pinned
			    to the top-right corner like the dialog's default close button. */}
			<button
				type='button'
				onClick={clearTextOrClose}
				title={hasText ? 'Clear text' : 'Close'}
				aria-label={hasText ? 'Clear text' : 'Close'}
				className='absolute right-4 top-3.5 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
			>
				<Cross2Icon className='h-4 w-4' />
			</button>
		</CommandDialog>
	)
}
