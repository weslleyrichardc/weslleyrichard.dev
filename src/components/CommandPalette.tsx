'use client'

import * as React from 'react'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command'
import { askAi, detectAi, destroyAiSession } from '@/lib/browser-ai'

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
	const aiRef = React.useRef<number>(0)

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
			for await (const chunk of askAi(question)) {
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
					<CommandInput
						placeholder='Ask anything…'
						value={aiQuestion}
						onValueChange={setAiQuestion}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !(e.nativeEvent as KeyboardEvent).isComposing) {
								e.preventDefault()
								void ask(aiQuestion)
							}
						}}
					/>
					<CommandList>
						<div className='px-3 py-2' aria-live='polite'>
							{aiStatus === 'idle' && (
								<p className='text-sm text-muted-foreground'>
									Ask a question and the browser built-in AI answers on-device — private, offline,
									free.
								</p>
							)}
							{aiStatus === 'thinking' && (
								<p className='text-sm text-muted-foreground'>Thinking…</p>
							)}
							{aiAnswer && (
								<div className='max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-foreground'>
									{aiAnswer}
								</div>
							)}
							{aiStatus === 'error' && <p className='text-sm text-foreground'>{aiError}</p>}
						</div>
						{(aiStatus === 'done' || aiStatus === 'error' || aiStatus === 'streaming') && (
							<CommandGroup heading='ACTIONS'>
								{aiAnswer && (
									<CommandItem onSelect={() => navigator.clipboard.writeText(aiAnswer)}>
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
