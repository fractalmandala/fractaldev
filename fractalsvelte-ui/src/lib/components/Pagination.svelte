<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luChevronLeft, luChevronRight } from 'fractalicons/lucide';

	interface Props {
		page?: number;
		onPageChange?: (page: number) => void;
		total: number;
		/** Number of pages to show either side of the current page. */
		siblings?: number;
		class?: string;
		[key: string]: unknown;
	}

	let {
		page = $bindable(1),
		onPageChange,
		total,
		siblings = 1,
		class: className = '',
		...rest
	}: Props = $props();

	const rootClass = $derived(`k-pagination ${className}`.trim());

	const pages = $derived.by(() => {
		const set = new Set<number>([1, total, page]);
		for (let i = page - siblings; i <= page + siblings; i++) {
			if (i >= 1 && i <= total) set.add(i);
		}
		return Array.from(set).sort((a, b) => a - b);
	});

	const items = $derived.by(() => {
		const out: (number | 'ellipsis')[] = [];
		let prev = 0;
		for (const p of pages) {
			if (p - prev > 1) out.push('ellipsis');
			out.push(p);
			prev = p;
		}
		return out;
	});

	function go(p: number) {
		if (p < 1 || p > total || p === page) return;
		page = p;
		onPageChange?.(p);
	}
</script>

<nav class={rootClass} aria-label="Pagination" {...rest}>
	<button
		type="button"
		class="k-page"
		data-state={page === 1 ? 'disabled' : undefined}
		aria-label="Previous page"
		disabled={page === 1}
		onclick={() => go(page - 1)}
	>
		<Icon icon={luChevronLeft} size={16} />
	</button>
	{#each items as item, i (String(item) + i)}
		{#if item === 'ellipsis'}
			<span class="k-page" data-ellipsis="true">…</span>
		{:else}
			<button
				type="button"
				class="k-page"
				data-state={item === page ? 'active' : undefined}
				aria-current={item === page ? 'page' : undefined}
				onclick={() => go(item)}
			>
				{item}
			</button>
		{/if}
	{/each}
	<button
		type="button"
		class="k-page"
		data-state={page === total ? 'disabled' : undefined}
		aria-label="Next page"
		disabled={page === total}
		onclick={() => go(page + 1)}
	>
		<Icon icon={luChevronRight} size={16} />
	</button>
</nav>

<style lang="sass">

.k-pagination
	display: flex
	align-items: center
	gap: 4px

.k-page
	display: inline-flex
	align-items: center
	justify-content: center
	min-width: 36px
	height: 36px
	padding: 0 8px
	font-family: inherit
	font-size: var(--text-sm)
	font-weight: 500
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	background: var(--bg)
	color: var(--text-secondary)
	cursor: pointer
	transition: background var(--motionin1), border-color var(--motionin1), color var(--motionin1)

	&:hover:not([data-state='disabled']):not([data-ellipsis])
		background: var(--state-hover)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[data-state='active']
		background: var(--theme-color)
		border-color: var(--theme-color)
		color: var(--text-inverse)

	&[data-state='disabled']
		opacity: 0.4
		pointer-events: none
		cursor: not-allowed

	&[data-ellipsis='true']
		border-color: transparent
		background: transparent
		cursor: default
</style>
