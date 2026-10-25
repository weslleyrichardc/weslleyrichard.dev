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

export default function CommandPalette() {
	const [open, setOpen] = React.useState(false)

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

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput placeholder='Type a command or search...' />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading='Go To'>
					<CommandItem onSelect={() => (window.location.href = '/')}>Home</CommandItem>
					<CommandItem onSelect={() => (window.location.href = '/about')}>About</CommandItem>
					<CommandItem onSelect={() => (window.location.href = '/blog')}>Blog</CommandItem>
					<CommandItem onSelect={() => (window.location.href = '/resume')}>Resume</CommandItem>
				</CommandGroup>
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
							const current = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
							localStorage.setItem('theme', current)
							document.documentElement.classList.toggle('dark')
						}}
					>
						Toggle Theme
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}
