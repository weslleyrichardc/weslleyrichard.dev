---
title: The browser already has an LLM. I put it in my command palette.
description: "Chrome and Edge ship an on-device model. I wired it into my portfolio's command palette, and the model turned out to be the easy part."
publishDate: 2026-10-25
tags:
  - webdev
  - ai
  - javascript
  - astro
draft: false
---

Chrome can answer a question about the page you're reading without sending the page anywhere. This week I added **Ask AI…** to my portfolio's ⌘K palette.

There is no API key, no backend, and no prompt leaving the laptop. The model is the one Chrome or Edge already ships, running on your machine. The site is a static Astro build on Vercel, and it stays that way.

I wanted to see whether a browser feature could carry a real product interaction without adding a server, an account, or a monthly bill. It can. But most of the work was not about the model.

## The API is small

Chrome and Edge expose the built-in model through the Prompt API. There are two globals in the wild — `LanguageModel` in current builds and `ai.languageModel` in older ones — so the first step is finding one:

```ts
function getApi() {
	return window.LanguageModel ?? window.ai?.languageModel
}
```

Availability isn't binary. The model may be missing, already installed, or available but not downloaded yet:

```ts
const status = await api.availability()
// 'unavailable' | 'downloadable' | 'downloading' | 'available'
```

A downloadable model is a real state, not an edge case: the first prompt can trigger a large download. My palette hides the item when the API is unavailable and shows a one-line hint while the model still needs to download. On Firefox and Zen, which don't implement the API, the command does not exist. No disabled button, no “coming soon” — it's simply absent.

Creating a session is one call. Streaming is an async iterable:

```ts
const session = await api.create({
	initialPrompts: [{ role: 'system', content: pageContext }]
})

for await (const chunk of session.promptStreaming(question)) {
	setAnswer((current) => current + chunk)
}

session.destroy()
```

That's the core. The rest is the part I underestimated.

## The context is the feature

A general answer from a local model is not interesting. “Summarize this page” only works if the model can see the page.

So every question starts with a system prompt built from the current document:

```ts
const source = document.querySelector('main') ?? document.body
const clone = source.cloneNode(true) as HTMLElement
clone.querySelectorAll('[role="dialog"]').forEach((node) => node.remove())

const text = (clone.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 6000)

const system = `
  CURRENT PAGE: ${location.href} — ${document.title}
  PAGE CONTENT: """
  ${text}
  """
`
```

Two details matter more than they look. First, I clone the main element and strip `[role="dialog"]`, because the palette itself is a dialog and I don't want its UI text in the prompt. Second, 6,000 characters is a ceiling, not a target. It is enough for a portfolio page and well below the input quota. A long article would need chunking or retrieval; a bio page does not.

The dialog selector was also a bug in an earlier version. The palette is a plain Radix dialog, not cmdk's `Command.Dialog`, so my `[cmdk-dialog]` selector matched nothing. The page text included the palette's own labels — not what you want in a prompt about the page.

## The fallback ladder

Chrome's Prompt API is still moving. Builds disagree about which session options they accept. `expectedInputs` and `expectedOutputs` declare the input and answer languages, and current Chrome warns when the output language is missing. Older builds reject those keys entirely.

The first version retried with a bare `create()` when the options failed. That also dropped the system prompt, so the model answered “please provide the page” to questions about the page. The fix keeps the context at every step (simplified from the real service):

```ts
let session: LanguageModelSession
let firstPrompt = question

try {
	session = await api.create({
		initialPrompts: [{ role: 'system', content: system }],
		expectedInputs: [{ type: 'language', language: 'en' }],
		expectedOutputs: [{ type: 'language', language: 'en' }]
	})
} catch {
	try {
		// Older builds reject the language keys; keep the context.
		session = await api.create({
			initialPrompts: [{ role: 'system', content: system }]
		})
	} catch {
		// Last resort: no options at all, so inline the context in the prompt.
		session = await api.create()
		firstPrompt = `${system}\n\nUSER QUESTION: ${question}`
	}
}

for await (const chunk of session.promptStreaming(firstPrompt)) {
	yield chunk
}
```

The lesson is general: when an API has a fallback path, test that path. My happy path was fine. The browser build that rejected the language hints was the one that made the feature look broken.

## Streaming into React

The service is a framework-agnostic async generator. The palette is React. A hook owns the state and a run id:

```ts
const run = ++runId.current
for await (const chunk of askAi(question, context)) {
	if (run !== runId.current) return // a newer question won
	setAnswer((current) => current + chunk)
}
```

Without the run id, a slow first answer can keep appending after you press Retry. Closing the palette increments the same counter, so the stream stops writing to a view that is already gone.

Answers render as Markdown. `react-markdown` plus `remark-gfm` is not small — 46 KB gzip — so it is not in the palette's initial bundle. The component is lazy-loaded and the chunk is warmed when you enter the AI view:

```tsx
const AiAnswer = React.lazy(() => import('./AiAnswer'))
```

The palette island went from 75 KB to 29 KB gzip. The Markdown renderer loads only when the feature is actually used, which is the right trade for a command most visitors will never open.

## The UI took longer than the model

The first working version was a text input, a spinner, and a block of text. Then I used it on a real page and started fixing things.

**The question field.** A single-line input scrolls long questions out of view. It's now a textarea that grows to two lines, then scrolls internally with the scrollbar hidden. Enter asks; the caret follows the text. Two lines is a deliberate cap: the palette has a fixed visual rhythm, and a seven-line question breaks it.

**The actions.** Copy, Retry, and Back were originally a list at the bottom of the answer, which meant scrolling to reach them. They're now a fixed icon row above the answer, with labels for screen readers. Copy flips to a check for a moment so you know it worked.

**The scroll cue.** When an answer is longer than the palette, a gradient with a small chevron appears at the bottom. It disappears when you reach the end. It's a small thing, but without it people assume the answer was cut off.

**Dismissal.** This is where the real bug lived. Ctrl/Cmd+K opens the palette. It should also close it. Esc should close the palette at the top level, and go back one level from Ask AI. Clicking outside should close it. The ✕ should clear the text first, then close when there's nothing to clear.

Only some of that worked. The root cause was one missing line in a controlled Radix dialog:

```tsx
<Dialog
  open={open}
  onOpenChange={(next) => {
    if (!next) resetAi()
    // ...and never setOpen(false)
  }}
>
```

`resetAi()` cleared the conversation, so it looked like the close handler ran. The dialog stayed open because its `open` prop never changed. Every dismissal path went through the same dead end.

There was a second one: a keydown handler ignored Ctrl/Cmd+K when the event target was an input or textarea. That guard made sense for a search field, but the palette focuses its own input, so the shortcut died exactly when you needed it. Removing the guard and checking the modifier keys fixed it.

I wrote the dismissal rules down before touching the code:

- Ctrl/Cmd+K toggles the palette from anywhere, including inside it.
- Esc goes back one level inside Ask AI, and closes at the first level.
- Clicking outside closes.
- ✕ clears the query or question, keeps the view open, and closes only when there is nothing to clear.

Then I tested each path in a headless browser. More on that below.

## The Astro parts

The site is static Astro with one React island for the palette. Three framework details were worth the time:

**Navigation.** The palette's Home/About/Resume commands used `window.location.href`, which forced a full reload and threw away the view transition. They now use `navigate()` from `astro:transitions/client`, and the palette closes one frame before navigating so the modal never ends up in the transition snapshot.

**Hydration.** I kept `client:load` rather than `client:idle`. The palette advertises Ctrl/Cmd+K in the header, so it has to answer the first shortcut. When closed it renders no dialog, so the initial DOM cost is negligible. The 46 KB Markdown chunk is the part that needed deferring, not the island itself.

**No `transition:persist`.** It is tempting to persist the palette across client-side navigation, and the docs suggest it for persistent UI. But the dialog is a Radix portal into `document.body`. Astro replaces the body during a view transition, and the portal does not come along cleanly. Re-hydrating a closed island is cheap and works; a portal that outlives its body does not.

## Accessibility is part of "it works"

Two fixes came from testing rather than from the model:

- Radix warns when a dialog has no description. The palette now has an sr-only `DialogDescription`, so screen readers get context instead of an unnamed dialog.
- An accessibility audit flagged the header trigger for WCAG 2.5.3, Label in Name. The button showed `Ctrl+K` but had `aria-label="Open command palette"`, which replaced the visible text in the accessible name. The fix is to label it with its content:

```html
<button aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K">
	<span class="sr-only">Open command palette</span>
	<kbd>Ctrl+K</kbd>
</button>
```

The accessible name becomes "Open command palette Ctrl+K". On macOS a small script swaps the visible text to ⌘K, and the name follows. `aria-label` is not a free upgrade for a button that already has text; it's an override.

## Testing a feature whose model you can't run

The CI-friendly part is a stub. In headless Chrome I replace `window.LanguageModel` with a fake that returns a fixed stream, then drive the palette with CDP (Chrome DevTools Protocol): open, close, type, ask, navigate, and check the DOM and console. The suite covers the four dismissal paths, the AI view, streaming, and client-side navigation. It is not a substitute for using the thing.

The stub cannot tell you whether the answers are good. That still needs a real Chrome install with the model available. I ran that pass with Gemini Nano while building it: ask a question, watch it stream, use Copy and Retry, press Esc twice, clear the question. It worked, and it surfaced the visual issues the stub could never show.

If you're testing something similar, budget time for both. The stub protects the plumbing. The real model is the only way to see the feature.

## What I'd tell someone starting this

The browser model is good enough for small, page-aware tasks: summarize, explain a term on this page, rewrite a paragraph. It is not a reason to remove your backend. Availability is uneven, the API is still changing, and "downloadable" can mean a long wait on a metered connection.

But when it fits, the shape is pleasant: static site, no keys, no server, and the prompt never leaves the device. The model is the easy part. The session lifecycle, the fallbacks, the streaming cancellation, and the four ways to close a dialog are the actual feature.

The code is in [weslleyrichardc/weslleyrichard.dev](https://github.com/weslleyrichardc/weslleyrichard.dev), PR [#12](https://github.com/weslleyrichardc/weslleyrichard.dev/pull/12). The palette is open source; the model may already be on your machine.
