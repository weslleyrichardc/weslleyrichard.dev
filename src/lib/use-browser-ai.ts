'use client'

import * as React from 'react'
import {
	askAi,
	detectAi,
	destroyAiSession,
	formatAiAnswer,
	getCurrentPageContext
} from '@/lib/browser-ai'

export type AiStatus = 'idle' | 'thinking' | 'streaming' | 'done' | 'error'

export type UseBrowserAi = {
	/** Browser exposes the built-in Prompt API. */
	supported: boolean
	/** Hint shown in the palette when the model still needs downloading. */
	hint: string
	question: string
	answer: string
	status: AiStatus
	error: string
	copied: boolean
	isBusy: boolean
	setQuestion: (value: string) => void
	ask: (input: string) => Promise<void>
	retry: () => Promise<void>
	copyAnswer: () => Promise<void>
	clearHint: () => void
	/** Cancel any stream, drop the answer and destroy the model session. */
	reset: () => void
}

const COPY_FEEDBACK_MS = 1500

/**
 * React action layer for the browser's on-device AI. Owns the conversation
 * state, streaming lifecycle and session cleanup so UI components (the
 * command palette today) only render it.
 */
export function useBrowserAi(): UseBrowserAi {
	const [supported, setSupported] = React.useState(false)
	const [hint, setHint] = React.useState('')
	const [question, setQuestion] = React.useState('')
	const [answer, setAnswer] = React.useState('')
	const [status, setStatus] = React.useState<AiStatus>('idle')
	const [error, setError] = React.useState('')
	const [copied, setCopied] = React.useState(false)

	const runId = React.useRef(0)
	const busy = React.useRef(false)
	const lastPrompt = React.useRef('')
	const copyTimer = React.useRef<number | undefined>(undefined)
	const alive = React.useRef(true)

	// Probe availability once; cheap no-op on browsers without the API.
	React.useEffect(() => {
		alive.current = true
		void detectAi().then((result) => {
			if (!alive.current) return
			setSupported(result.supported)
			if (result.supported) setHint(result.message ?? '')
		})

		return () => {
			alive.current = false
			runId.current += 1
			window.clearTimeout(copyTimer.current)
			destroyAiSession()
		}
	}, [])

	const reset = React.useCallback(() => {
		runId.current += 1
		busy.current = false
		lastPrompt.current = ''
		setQuestion('')
		setAnswer('')
		setStatus('idle')
		setError('')
		setCopied(false)
		destroyAiSession()
	}, [])

	const ask = React.useCallback(async (input: string) => {
		const text = input.trim()
		if (!text || busy.current) return

		runId.current += 1
		const currentRun = runId.current
		busy.current = true
		lastPrompt.current = text
		setAnswer('')
		setError('')
		setCopied(false)
		setStatus('thinking')

		try {
			// Capture before the palette's own UI mutates the DOM.
			const context = getCurrentPageContext()
			for await (const chunk of askAi(text, context)) {
				if (currentRun !== runId.current) return
				setStatus('streaming')
				setAnswer((previous) => previous + chunk)
			}
			if (currentRun === runId.current) setStatus('done')
		} catch (cause) {
			if (currentRun !== runId.current) return
			setStatus('error')
			setError(cause instanceof Error ? cause.message : 'Something went wrong')
		} finally {
			if (currentRun === runId.current) busy.current = false
		}
	}, [])

	const retry = React.useCallback(async () => {
		if (!lastPrompt.current) return
		await ask(lastPrompt.current)
	}, [ask])

	const copyAnswer = React.useCallback(async () => {
		const text = formatAiAnswer(answer)
		if (!text) return

		try {
			await navigator.clipboard.writeText(text)
			if (!alive.current) return
			setCopied(true)
			window.clearTimeout(copyTimer.current)
			copyTimer.current = window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
		} catch {
			// Clipboard access can be denied (permissions/insecure context):
			// keep the answer visible instead of surfacing a hard failure.
		}
	}, [answer])

	const clearHint = React.useCallback(() => setHint(''), [])

	return {
		supported,
		hint,
		question,
		answer,
		status,
		error,
		copied,
		isBusy: status === 'thinking' || status === 'streaming',
		setQuestion,
		ask,
		retry,
		copyAnswer,
		clearHint,
		reset
	}
}
