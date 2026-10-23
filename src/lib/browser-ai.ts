// Types for the Browser Prompt API (Chrome/Edge built-in on-device model,
// "Gemini Nano"). Deliberately minimal for the command palette use case.
interface LanguageModelSession {
	prompt(input: string): Promise<string>
	promptStreaming(input: string): AsyncIterable<string> & {
		getReader?: () => {
			read: () => Promise<{ value?: string; done: boolean }>
		}
	}
	destroy?(): void
}

type LanguageModelApi = {
	availability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>
	create(options?: { [key: string]: unknown }): Promise<LanguageModelSession>
}

declare global {
	interface Window {
		LanguageModel?: LanguageModelApi
		ai?: { languageModel?: LanguageModelApi }
	}
}

export type AiAvailability =
	| { supported: false; status: 'unavailable' }
	| { supported: true; status: 'available' | 'downloadable' | 'downloading'; message?: string }

/** Resolve the on-device model API, preferring the modern global. */
function getModelApi(): LanguageModelApi | undefined {
	return window.LanguageModel ?? window.ai?.languageModel
}

/** Feature-detect the browser's built-in Prompt API. */
export async function detectAi(): Promise<AiAvailability> {
	const api = getModelApi()
	if (!api?.availability) return { supported: false, status: 'unavailable' }

	try {
		const status = await api.availability()
		if (status === 'unavailable') return { supported: false, status }
		return {
			supported: true,
			status,
			message: status === 'downloadable' ? 'On-device model downloads on first use' : undefined
		}
	} catch {
		return { supported: false, status: 'unavailable' }
	}
}

let session: LanguageModelSession | undefined

export function destroyAiSession(): void {
	session?.destroy?.()
	session = undefined
}

const SUPPORTED_OUTPUT_LANGUAGES = new Set(['de', 'en', 'es', 'fr', 'ja'])

/**
 * Build session create options declaring the expected output language(s),
 * which Chrome requires for output quality/attestation. Falls back silently
 * when the browser rejects the hints.
 */
function createOptions(system?: string): { [key: string]: unknown } {
	const primary = (navigator.language?.split('-')[0] || 'en').toLowerCase()
	const outputs = SUPPORTED_OUTPUT_LANGUAGES.has(primary) ? [primary, 'en'] : ['en']
	const options: { [key: string]: unknown } = {
		expectedInputs: [{ type: 'language', language: 'en' }],
		expectedOutputs: [...new Set(outputs)].map((language) => ({
			type: 'language',
			language
		}))
	}
	if (system) options.initialPrompts = [{ role: 'system', content: system }]
	return options
}

/**
 * Snapshot of the page the visitor is reading, passed to the model as a
 * system prompt. Strips the open command dialog so its own UI text does
 * not leak into the context, and caps the extract for the input quota.
 */
export function getCurrentPageContext(limit = 8000): string | undefined {
	try {
		const body = document.body.cloneNode(true) as HTMLElement
		body.querySelectorAll('[cmdk-dialog]').forEach((node) => node.remove())
		const content = (body.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, limit)
		if (!content) return undefined
		return [
			'The assistant is embedded in the command palette of weslleyrichard.dev,',
			'a portfolio site for Weslley Richard (backend PHP/Laravel/Symfony engineer).',
			'Use the CURRENT PAGE context when relevant; otherwise answer generally.',
			`CURRENT PAGE: ${window.location.href} — ${document.title}`,
			`PAGE CONTENT: """\n${content}\n"""`
		].join('\n')
	} catch {
		return undefined
	}
}

/**
 * Ask the browser's on-device AI and stream answer chunks.
 * Throws when no session can be created (unsupported, no disk space, etc).
 */
export async function* askAi(input: string, system?: string): AsyncGenerator<string, void, void> {
	const api = getModelApi()
	if (!api?.create) throw new Error('Your browser has no built-in AI (try Chrome or Edge)')

	if (session) session.destroy?.()
	session = undefined
	try {
		session = await api.create(createOptions(system))
	} catch {
		// Rejects when the device language is unsupported by the model —
		// retry without language hints.
		session = await api.create()
	}
	if (!session) throw new Error('The browser AI session could not be created')

	const stream = session.promptStreaming(input)
	for await (const chunk of stream) {
		if (chunk) yield chunk
	}
}
