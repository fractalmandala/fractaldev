---
name: svelte-accessibility
description: Accessibility patterns for Svelte and SvelteKit — semantic HTML, ARIA attributes, form labeling, keyboard navigation, focus management, and screen reader support. Use when building any interactive UI component or form.
---

# Svelte Accessibility

Accessibility (WCAG 2.2 AA) patterns for Svelte 5 components and SvelteKit apps. Svelte's compiler emits `a11y-*` warnings — treat them as errors, not noise.

## When to Activate

- Building any interactive component (buttons, dialogs, menus, tabs)
- Building forms and inputs
- Managing focus across route changes or modal open/close
- Reviewing components for screen reader and keyboard support
- User asks for an "accessibility pass" or "aria pass" on a component/page/project.

## Semantic HTML First

```svelte
<!-- PASS: GOOD: Native elements carry behavior for free -->
<button onclick={save}>Save</button>
<a href="/entries">Entries</a>

<!-- FAIL: BAD: Divs pretending to be controls -->
<!-- <div onclick={save}>Save</div> -->
```

Landmarks and headings:

```svelte
<header>…</header>
<nav aria-label="Primary">…</nav>
<main>
	<h1>{title}</h1>
</main>
<aside aria-label="Metadata">…</aside>
```

## Forms and Labeling

```svelte
<!-- PASS: GOOD: Explicit label association -->
<label for="entry-title">Title</label>
<input id="entry-title" name="title" bind:value={title}
	aria-invalid={error ? true : undefined}
	aria-describedby={error ? 'title-error' : undefined} />
{#if error}<p id="title-error" role="alert">{error}</p>{/if}
```

- Every input gets a visible label (or `aria-label` only when a visible one is truly impossible).
- Error messages are linked via `aria-describedby` and announced via `role="alert"` or a live region.
- Never rely on placeholder text as the only label.

## Keyboard Support

```svelte
<!-- PASS: GOOD: Interactive elements are focusable and operable by key -->
<button onkeydown={(e) => e.key === 'Escape' && close()}>…</button>
```

Rules:

- Anything clickable must be focusable — use real `<button>`/`<a>`/form controls, not `tabindex` hacks on divs.
- Do not set `tabindex` > 0.
- Custom widgets follow the APG pattern: `role`, keyboard bindings, and focus management together.

### Focus Trap for Dialogs

```svelte
<script lang="ts">
	import { focusTrap } from '$lib/actions/focus-trap'; // project action
	let open = $state(false);
	let dialog: HTMLElement | undefined = $state();
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div role="dialog" aria-modal="true" aria-labelledby="dlg-title"
		bind:this={dialog} use:focusTrap onkeydown={(e) => e.key === 'Escape' && (open = false)}>
		<h2 id="dlg-title">Confirm</h2>
		…
	</div>
{/if}
```

Prefer the native `<dialog>` element where browser support is acceptable — it handles focus and `Escape` for you.

## Focus Management on Route Change

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import { untrack } from 'svelte';

	let main: HTMLElement | undefined = $state();

	$effect(() => {
		page.url.pathname; // dependency
		untrack(() => {
			main?.focus({ preventScroll: true }); // target has tabindex="-1"
		});
	});
</script>

<main bind:this={main} tabindex="-1">
	{@render children()}
</main>
```

After modal close, return focus to the element that opened it.

## Live Regions for Async Feedback

```svelte
<!-- PASS: GOOD: Screen readers hear status changes -->
<span class="sr-only" role="status" aria-live="polite">
	{#if saving}Saving…{:else if saved}Saved{/if}
</span>
```

Use `aria-live="assertive"` only for errors that need immediate attention.

## Images and Media

```svelte
<img src={cover} alt="{title} cover" />
<img src={divider} alt="" role="presentation" />  <!-- decorative -->
```

- Meaningful images: descriptive `alt`.
- Decorative images: empty `alt`.
- Video/audio: captions/transcripts; respect `prefers-reduced-motion` for animation.

## Svelte-Specific Notes

| Topic | Guidance |
|---|---|
| Compiler warnings | Fix `a11y-*` warnings; ignore only with an explicit `svelte-ignore` plus reason |
| `{@html}` | Sanitize; injected markup bypasses semantic checks |
| Snippets rendered into widgets | ARIA attributes must live on the element, not the snippet wrapper |
| Transitions | Gate non-essential transitions behind `prefers-reduced-motion` |
| `bind:this` focus calls | Focus after the element exists — inside `$effect`, not during render |
| Scoped styles and `:focus-visible` | Ship visible focus indicators; never `outline: none` without a replacement |

## Contrast and Visual Design

- Text ≥ 4.5:1, large text ≥ 3:1 (WCAG AA).
- Do not encode meaning in color alone — pair with icon/text.
- Hit targets ≥ 24×24 px (44 px preferred for primary actions).
- Respect user settings: `prefers-reduced-motion`, `prefers-color-scheme`, text zoom to 200%.

## Review Checklist

1. Every control keyboard-reachable and operable (Tab, Enter/Space, arrows, Escape).
2. Every input labeled; every error linked and announced.
3. Focus visible, trapped in modals, and restored on close.
4. Headings form a logical outline; landmarks present once per role.
5. Dynamic updates announced via live regions.
6. No `a11y-*` compiler warnings without justified `svelte-ignore`.
7. Passes automated scan (axe) plus one manual keyboard-only pass.

## Reference

See `aria-reference-log.md` for a complete referene.
