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

export function CommandPalette() {
	const [open, setOpen] = React.useState(false)

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (
				e.key === '/' &&
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
				<CommandGroup heading='Navigation'>
					<CommandItem onSelect={() => (window.location.href = '/')}>Home</CommandItem>
					<CommandItem onSelect={() => (window.location.href = '/about')}>About</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading='Theme'>
					<CommandItem onSelect={() => document.documentElement.classList.toggle('dark')}>
						Toggle Theme
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}
