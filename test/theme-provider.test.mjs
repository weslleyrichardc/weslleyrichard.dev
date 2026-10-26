import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

// Run the real inline script from the component, not a copy: the theme script
// is inline on purpose (it must apply before paint), so this is the only way
// to test what ships.
const source = readFileSync(
	new URL('../src/components/ThemeProvider.astro', import.meta.url),
	'utf8'
)
const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1]
assert.ok(script, 'ThemeProvider.astro has no inline script')

function createPage({ stored, prefersLight = false } = {}) {
	const classes = new Set()
	const listeners = new Map()
	const storedTheme = new Map(stored ? [['theme', stored]] : [])
	const mediaListeners = []

	const document = {
		documentElement: {
			classList: {
				contains: (name) => classes.has(name),
				toggle: (name) => {
					if (classes.has(name)) {
						classes.delete(name)
						return false
					}
					classes.add(name)
					return true
				}
			}
		},
		addEventListener: (type, handler) =>
			listeners.set(type, [...(listeners.get(type) ?? []), handler])
	}

	const window = {
		matchMedia: () => ({
			matches: prefersLight,
			addEventListener: (_type, handler) => mediaListeners.push(handler)
		})
	}

	const localStorage = {
		getItem: (key) => storedTheme.get(key) ?? null,
		setItem: (key, value) => storedTheme.set(key, value)
	}

	const context = vm.createContext({ console, document, window, localStorage })

	return {
		classes,
		window,
		storedTheme,
		mediaListeners,
		run: () => vm.runInContext(script, context),
		fire: (type, event = {}) => (listeners.get(type) ?? []).forEach((handler) => handler(event)),
		count: (type) => (listeners.get(type) ?? []).length,
		flipOs: (light) => mediaListeners.forEach((handler) => handler({ matches: light }))
	}
}

test('a fresh visitor follows the operating system', () => {
	const light = createPage({ prefersLight: true })
	light.run()
	assert.equal(light.classes.has('dark'), false)

	const dark = createPage({ prefersLight: false })
	dark.run()
	assert.equal(dark.classes.has('dark'), true)
})

test('two toggles persist the choice, and a reload restores it', () => {
	const page = createPage()
	page.run()

	page.fire('toggle-theme')
	assert.equal(page.storedTheme.get('theme'), 'light')

	page.fire('toggle-theme')
	assert.equal(page.storedTheme.get('theme'), 'dark')

	const reload = createPage({ stored: 'dark', prefersLight: true })
	reload.run()
	assert.equal(reload.classes.has('dark'), true)
})

test('the OS only changes the theme while no choice is stored', () => {
	const page = createPage()
	page.run()

	page.flipOs(true)
	assert.equal(page.classes.has('dark'), false)

	page.fire('toggle-theme')
	page.flipOs(true)
	assert.equal(page.classes.has('dark'), true)
})

test('re-running the script on view transitions keeps one listener of each kind', () => {
	const page = createPage()
	page.run()
	page.run()
	page.run()

	assert.equal(page.window.__themeInit, true)
	assert.equal(page.count('astro:after-swap'), 1)
	assert.equal(page.count('toggle-theme'), 1)
	assert.equal(page.mediaListeners.length, 1)
})
