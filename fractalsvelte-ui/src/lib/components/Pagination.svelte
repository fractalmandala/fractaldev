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
	}

	let {
		page = $bindable(1),
		onPageChange,
		total,
		siblings = 1,
		class: className = ''
	}: Props = $props();

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

<nav class="k-pagination {className}" aria-label="Pagination">
	<button
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
			<span class="k-page k-page-ellipsis">…</span>
		{:else}
			<button
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
		class="k-page"
		data-state={page === total ? 'disabled' : undefined}
		aria-label="Next page"
		disabled={page === total}
		onclick={() => go(page + 1)}
	>
		<Icon icon={luChevronRight} size={16} />
	</button>
</nav>
