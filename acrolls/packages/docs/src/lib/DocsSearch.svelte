<script lang="ts">
	import { onMount } from 'svelte';

	// Full-text search over the Pagefind index, presented as a header trigger
	// that opens a modal dialog (⌘K / Ctrl+K). Acrolls takes no pagefind
	// dependency — this loads the runtime that the host's post-build `pagefind`
	// step emits into the served output (default `/pagefind/pagefind.js`). When
	// the index is absent (e.g. `vite dev` before a build), the dialog degrades
	// to a note instead of throwing.

	type PagefindResult = { id: string; data: () => Promise<PagefindDocument> };
	type PagefindDocument = {
		url: string;
		excerpt: string;
		meta?: { title?: string } & Record<string, string>;
	};
	type PagefindApi = {
		init?: () => Promise<void>;
		search: (query: string) => Promise<{ results: PagefindResult[] }>;
	};

	type Props = {
		/** URL of the Pagefind runtime emitted by the post-build step. */
		bundlePath?: string;
		placeholder?: string;
		maxResults?: number;
		label?: string;
		triggerLabel?: string;
	};

	let {
		bundlePath = '/pagefind/pagefind.js',
		placeholder = 'Search documentation…',
		maxResults = 8,
		label = 'Search documentation',
		triggerLabel = 'Search'
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let query = $state('');
	let results = $state<PagefindDocument[]>([]);
	let status = $state<'idle' | 'loading' | 'ready' | 'searching' | 'unavailable'>('idle');
	let active = $state(-1);
	let kbd = $state('Ctrl K');
	let triggerEl = $state<HTMLButtonElement | null>(null);

	// A polite live region announces result counts to assistive tech; the visible
	// messages below stay for sighted users.
	let liveMessage = $derived(
		status === 'unavailable'
			? 'Search index not available.'
			: status === 'searching'
				? 'Searching…'
				: query.trim() && results.length === 0
					? `No results for ${query.trim()}.`
					: query.trim()
						? `${results.length} result${results.length === 1 ? '' : 's'} found.`
						: ''
	);

	let pagefind: PagefindApi | null = null;
	let token = 0;
	let debounce: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		if (/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)) kbd = '⌘K';
	});

	async function ensureLoaded(): Promise<PagefindApi | null> {
		if (pagefind) return pagefind;
		status = 'loading';
		try {
			const mod = (await import(/* @vite-ignore */ bundlePath)) as PagefindApi;
			await mod.init?.();
			pagefind = mod;
			status = 'ready';
			return mod;
		} catch {
			status = 'unavailable';
			return null;
		}
	}

	function onInput() {
		clearTimeout(debounce);
		active = -1;
		const current = query.trim();
		if (!current) {
			results = [];
			if (status === 'searching') status = 'ready';
			return;
		}
		debounce = setTimeout(() => void run(current), 160);
	}

	async function run(current: string) {
		const api = await ensureLoaded();
		if (!api) return;
		const mine = ++token;
		status = 'searching';
		const search = await api.search(current);
		if (mine !== token) return; // a newer query superseded this one
		const docs = await Promise.all(search.results.slice(0, maxResults).map((r) => r.data()));
		if (mine !== token) return;
		results = docs;
		status = 'ready';
	}

	function open() {
		dialog?.showModal();
		void ensureLoaded();
		requestAnimationFrame(() => inputEl?.focus());
	}

	function close() {
		dialog?.close();
		// Focus restore is handled by the dialog's `close` event (see restoreFocus), so it fires
		// no matter how the dialog closed — Escape, backdrop, or a result navigation.
	}

	function restoreFocus() {
		// Return focus to the trigger so keyboard users aren't dropped at the top of the doc.
		triggerEl?.focus();
	}

	function closeIfBackdrop(event: MouseEvent) {
		if (event.target === dialog) close();
	}

	function goto(url: string) {
		close();
		if (typeof window !== 'undefined') window.location.assign(normalizeUrl(url));
	}

	// Pagefind indexes built file paths (e.g. `/docs/guides/install.html`), but the site is
	// served on clean URLs. Strip the `.html` and collapse `/index.html` so a result resolves
	// to a real route instead of an in-app 404.
	function normalizeUrl(url: string): string {
		let path = url.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
		if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
		return path || '/';
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (dialog?.open) close();
			else open();
		}
	}

	function onInputKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = Math.min(active + 1, results.length - 1);
			scrollActiveIntoView();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = Math.max(active - 1, 0);
			scrollActiveIntoView();
		} else if (event.key === 'Enter') {
			const hit = results[active];
			if (hit) {
				event.preventDefault();
				goto(hit.url);
			}
		}
	}

	function scrollActiveIntoView() {
		requestAnimationFrame(() => {
			dialog?.querySelector<HTMLElement>("[data-selected='true']")?.scrollIntoView({ block: 'nearest' });
		});
	}
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<button
	aria-label={label}
	class="acrolls-docs-search-trigger"
	data-acrolls-search-open
	type="button"
	bind:this={triggerEl}
	onclick={open}
>
	<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
		<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
			<path d="m21 21-4.34-4.34" />
			<circle cx="11" cy="11" r="8" />
		</g>
	</svg>
	<span class="acrolls-docs-grow">{triggerLabel}</span>
	<kbd class="acrolls-docs-kbd">{kbd}</kbd>
</button>

<dialog
	aria-label={label}
	data-acrolls-search-dialog
	bind:this={dialog}
	onclick={closeIfBackdrop}
	onclose={restoreFocus}
>
	<div class="acrolls-docs-search-bar">
		<svg aria-hidden="true" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
			<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
				<path d="m21 21-4.34-4.34" />
				<circle cx="11" cy="11" r="8" />
			</g>
		</svg>
		<input
			aria-activedescendant={active >= 0 ? `acrolls-search-option-${active}` : undefined}
			aria-autocomplete="list"
			aria-controls="acrolls-search-listbox"
			aria-expanded={results.length > 0}
			aria-label={label}
			autocomplete="off"
			bind:this={inputEl}
			bind:value={query}
			oninput={onInput}
			onkeydown={onInputKeydown}
			{placeholder}
			role="combobox"
			type="search"
		/>
		<kbd class="acrolls-docs-kbd">Esc</kbd>
	</div>

	<div class="acrolls-docs-search-grid">
		<div class="acrolls-docs-search-left">
			<ul id="acrolls-search-listbox" role="listbox" aria-label={label} data-acrolls-search-results>
				{#each results as result, i (result.url)}
					<li
						id={`acrolls-search-option-${i}`}
						class="acrolls-docs-search-result"
						role="option"
						aria-selected={i === active}
						data-selected={i === active}
					>
						<a
							href={normalizeUrl(result.url)}
							onclick={(e) => {
								e.preventDefault();
								goto(result.url);
							}}
							onmouseenter={() => (active = i)}
						>
							<span class="acrolls-docs-search-result-title">{result.meta?.title ?? normalizeUrl(result.url)}</span>
							<!-- Pagefind returns an HTML excerpt with <mark> highlights -->
							<span class="acrolls-docs-search-result-excerpt">{@html result.excerpt}</span>
						</a>
					</li>
				{/each}
			</ul>

			{#if status === 'unavailable'}
				<p data-acrolls-search-message>Search index not built yet. Run the production build, then reload.</p>
			{:else if query.trim() && status === 'ready' && results.length === 0}
				<p data-acrolls-search-message>No results for “{query.trim()}”.</p>
			{:else if status === 'loading' || status === 'searching'}
				<p data-acrolls-search-message>Searching…</p>
			{:else if !query.trim()}
				<p data-acrolls-search-message>Type to search across every page.</p>
			{/if}
			<p class="visually-hidden" role="status" aria-live="polite">{liveMessage}</p>
		</div>
	</div>

	<div class="acrolls-docs-search-footer">
		<span class="acrolls-docs-hints">
			<span class="acrolls-docs-hint"><kbd class="acrolls-docs-kbd acrolls-docs-kbd--sm">↑</kbd><kbd class="acrolls-docs-kbd acrolls-docs-kbd--sm">↓</kbd> navigate</span>
			<span class="acrolls-docs-hint"><kbd class="acrolls-docs-kbd acrolls-docs-kbd--sm">↵</kbd> open</span>
		</span>
		<span class="acrolls-docs-hints">
			<span class="acrolls-docs-hint"><kbd class="acrolls-docs-kbd acrolls-docs-kbd--sm">Esc</kbd> close</span>
		</span>
	</div>
</dialog>
