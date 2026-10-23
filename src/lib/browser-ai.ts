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

/**
 * Ask the browser's on-device AI and stream answer chunks.
 * Throws when no session can be created (unsupported, no disk space, etc).
 */
export async function* askAi(input: string): AsyncGenerator<string, void, void> {
	const api = getModelApi()
	if (!api?.create) throw new Error('Your browser has no built-in AI (try Chrome or Edge)')

	if (session) session.destroy?.()
	session = await api.create({ stream: true })
	if (!session) throw new Error('The browser AI session could not be created')

	const stream = session.promptStreaming(input)
	for await (const chunk of stream) {
		if (chunk) yield chunk
	}
}
