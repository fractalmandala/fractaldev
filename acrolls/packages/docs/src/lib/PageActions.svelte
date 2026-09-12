<script lang="ts">
	// Slimmed page-actions rail. Keeps the universally useful, host-configurable
	// actions (edit-on-GitHub, copy-as-Markdown, scroll-to-top, print) and drops
	// the kit's hardcoded AI/MCP/EPUB export surfaces. Every action renders only
	// when it has what it needs, so an unconfigured shell shows just scroll/print.
	type Props = {
		/** "Edit this page" target (e.g. a GitHub blob edit URL). Omit to hide. */
		editUrl?: string;
		editLabel?: string;
		/** Raw Markdown for copy-as-Markdown. If omitted, `markdownUrl` is fetched. */
		markdown?: string;
		/** Endpoint to fetch the page Markdown from on click. */
		markdownUrl?: string;
		copyLabel?: string;
		showScrollTop?: boolean;
		showPrint?: boolean;
	};

	let {
		editUrl,
		editLabel = 'Edit this page',
		markdown,
		markdownUrl,
		copyLabel = 'Copy as Markdown',
		showScrollTop = true,
		showPrint = true
	}: Props = $props();

	let copyState = $state<'idle' | 'copied' | 'error'>('idle');

	const canCopy = $derived(markdown !== undefined || Boolean(markdownUrl));

	async function copyPage() {
		try {
			let text = markdown;
			if (text === undefined && markdownUrl) text = await (await fetch(markdownUrl)).text();
			if (text === undefined) return;
			await navigator.clipboard.writeText(text);
			copyState = 'copied';
		} catch {
			copyState = 'error';
		}
		setTimeout(() => (copyState = 'idle'), 1600);
	}

	function scrollTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function print() {
		window.print();
	}
</script>

<div class="acrolls-docs-page-actions" data-acrolls-page-actions data-pagefind-ignore>
	{#if editUrl}
		<a class="acrolls-docs-row-action" href={editUrl} rel="noreferrer" target="_blank">
			<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
				<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
			</svg>
			<span class="acrolls-docs-grow">{editLabel}</span>
		</a>
	{/if}

	{#if canCopy}
		<button class="acrolls-docs-row-action" type="button" onclick={copyPage}>
			<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
				<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
					<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
					<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
				</g>
			</svg>
			<span class="acrolls-docs-grow">
				{copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : copyLabel}
			</span>
		</button>
	{/if}

	{#if showScrollTop}
		<button class="acrolls-docs-row-action" type="button" onclick={scrollTop}>
			<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
				<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 7-7 7 7m-7 7V5" />
			</svg>
			<span class="acrolls-docs-grow">Scroll to top</span>
		</button>
	{/if}

	{#if showPrint}
		<button class="acrolls-docs-row-action" type="button" onclick={print}>
			<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
				<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
					<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
					<rect width="12" height="8" x="6" y="14" />
				</g>
			</svg>
			<span class="acrolls-docs-grow">Print</span>
		</button>
	{/if}
</div>
