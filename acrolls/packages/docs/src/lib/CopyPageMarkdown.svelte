<script lang="ts">
	// Copy-as-Markdown button. Give it the page's raw Markdown (from
	// `docsPageMarkdown`) or a `.md` endpoint href to fetch on click.
	type Props = {
		markdown?: string;
		/** Optional endpoint to fetch the Markdown from if `markdown` is not provided. */
		href?: string;
		label?: string;
		copiedLabel?: string;
		class?: string;
	};

	let {
		markdown,
		href,
		label = 'Copy as Markdown',
		copiedLabel = 'Copied',
		class: className = ''
	}: Props = $props();

	let state = $state<'idle' | 'copied' | 'error'>('idle');

	async function copy() {
		try {
			let text = markdown;
			if (text === undefined && href) text = await (await fetch(href)).text();
			if (text === undefined) return;
			await navigator.clipboard.writeText(text);
			state = 'copied';
		} catch {
			state = 'error';
		}
		setTimeout(() => (state = 'idle'), 1600);
	}
</script>

<button
	type="button"
	class={`acrolls-copy-md ${className}`}
	data-state={state}
	data-pagefind-ignore
	onclick={copy}
	disabled={markdown === undefined && !href}
>
	{state === 'copied' ? copiedLabel : state === 'error' ? 'Copy failed' : label}
</button>
