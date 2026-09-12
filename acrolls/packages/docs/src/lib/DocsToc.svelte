<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { DocsTocItem } from './types.js';
	import { scanHeadings } from './toc.js';

	type Props = {
		/**
		 * Headings resolved at compile time (from `metadata.headings`). When provided, they render
		 * server-side with no DOM scan or mount flash; the DOM fallback below is skipped entirely.
		 */
		headings?: DocsTocItem[];
		/** Element that contains the article headings */
		contentEl?: HTMLElement | null;
		/** Or pass a CSS selector resolved under document */
		contentSelector?: string;
		minLevel?: number;
		maxLevel?: number;
		title?: string;
		/** Re-scan when this changes (e.g. pathname) */
		watch?: unknown;
		/** `rail` = sticky right rail; `mobile` = collapsible <details> inside the article column */
		variant?: 'rail' | 'mobile';
		class?: string;
	};

	let {
		headings,
		contentEl = null,
		contentSelector = '#acrolls-content',
		minLevel = 2,
		maxLevel = 3,
		title = 'On this page',
		watch,
		variant = 'rail',
		class: className = ''
	}: Props = $props();

	/** Compile-time headings win; the DOM scan is the fallback for hosts not on that pipeline. */
	const provided = $derived(
		headings?.filter((h) => h.level >= minLevel && h.level <= maxLevel) ?? null
	);

	let scanned = $state<DocsTocItem[]>([]);
	const items = $derived(provided ?? scanned);
	let activeId = $state<string | null>(null);

	async function rescan() {
		if (provided) {
			scanned = [];
			return;
		}
		await tick();
		const root =
			contentEl ??
			(typeof document !== 'undefined'
				? document.querySelector<HTMLElement>(contentSelector)
				: null);
		if (!root) {
			scanned = [];
			return;
		}
		scanned = scanHeadings({ root, minLevel, maxLevel, ensureIds: true });
	}

	onMount(() => {
		void rescan();
		const onScroll = () => {
			if (!items.length) return;
			const offset = 96;
			let current: string | null = null;
			for (const item of items) {
				const el = document.getElementById(item.id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= offset) current = item.id;
			}
			activeId = current ?? items[0]?.id ?? null;
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		watch;
		contentEl;
		void rescan();
	});
</script>

{#if items.length > 0}
	{#if variant === 'mobile'}
		<details class={['acrolls-docs-mobile-toc', className].filter(Boolean).join(' ')}>
			<summary>
				<span>{title}</span>
				<svg class="acrolls-docs-mobile-toc-icon" aria-hidden="true" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
					<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
				</svg>
			</summary>
			<nav aria-label={title}>
				<ul class="acrolls-docs-toc-list">
					{#each items as item (item.id)}
						<li class="acrolls-docs-toc-item" data-level={item.level}>
							<a
								class="acrolls-docs-toc-link"
								href="#{item.id}"
								aria-current={activeId === item.id ? 'location' : undefined}>{item.text}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
		</details>
	{:else}
		<nav class={['acrolls-docs-toc', className].filter(Boolean).join(' ')} aria-label={title}>
			<p class="acrolls-docs-toc-title">{title}</p>
			<ul class="acrolls-docs-toc-list">
				{#each items as item (item.id)}
					<li class="acrolls-docs-toc-item" data-level={item.level}>
						<a
							class="acrolls-docs-toc-link"
							href="#{item.id}"
							aria-current={activeId === item.id ? 'location' : undefined}>{item.text}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
{/if}
