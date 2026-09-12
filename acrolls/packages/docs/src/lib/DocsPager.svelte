<script lang="ts">
	import type { DocsPagerLink } from './types.js';

	type Props = {
		previous: DocsPagerLink;
		next: DocsPagerLink;
		label?: string;
	};

	let { previous, next, label = 'Pagination' }: Props = $props();
</script>

{#if previous || next}
	<nav class="acrolls-docs-pagination" aria-label={label} data-pagefind-ignore>
		{#if previous}
			<a class="acrolls-docs-page-link acrolls-docs-page-link--prev" href={previous.href}>
				<svg class="acrolls-docs-page-arrow" aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 19-7-7 7-7m7 7H5" />
				</svg>
				<span class="acrolls-docs-page-text">
					<span class="acrolls-docs-page-eyebrow">Previous</span>
					<span class="acrolls-docs-page-title">{previous.title}</span>
				</span>
			</a>
		{/if}
		{#if next}
			<a class="acrolls-docs-page-link acrolls-docs-page-link--next" href={next.href}>
				<span class="acrolls-docs-page-text">
					<span class="acrolls-docs-page-eyebrow">Next</span>
					<span class="acrolls-docs-page-title">{next.title}</span>
				</span>
				<svg class="acrolls-docs-page-arrow" aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7 7 7-7 7" />
				</svg>
			</a>
		{/if}
	</nav>
{/if}
