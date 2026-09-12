<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { TABS, tabLabels, tabSlug, type TabItem } from './tabs-context.js';

	// Accessible tabs (WAI-ARIA APG): a `role="tablist"` of `role="tab"` buttons
	// with roving tabindex + arrow/Home/End navigation, and `role="tabpanel"`
	// children rendered by `<Tab>`. SSR-safe — the tablist is built from the
	// `items` prop (not from child registration), so labels and ARIA links are
	// present in the server HTML and indexed by Pagefind.
	type Props = {
		/** Tab labels, in the same order as the `<Tab>` children. */
		items: TabItem[];
		/** Stable id prefix for tab/panel ARIA linkage. Derived from labels if omitted. */
		id?: string;
		/** Accessible name for the tablist. */
		label?: string;
		/** Index of the tab selected on first render. */
		defaultIndex?: number;
		/** `code` renders the compact code-group chrome. */
		variant?: 'default' | 'code';
		children?: Snippet;
	};

	let {
		items,
		id,
		label = 'Tabs',
		defaultIndex = 0,
		variant = 'default',
		children
	}: Props = $props();

	const labels = $derived(tabLabels(items));
	const groupId = $derived(id ?? tabSlug(labels.join('-')));

	// `defaultIndex` is an *initial* value only: the tabs are uncontrolled after
	// mount, so we intentionally capture it once rather than tracking the prop.
	// svelte-ignore state_referenced_locally
	let active = $state(defaultIndex);
	let listEl = $state<HTMLDivElement | null>(null);

	// Index counter is per-instance (not module-level) so SSR never drifts across
	// requests; each `<Tab>` claims its index once, in document order.
	let nextIndex = 0;

	setContext(TABS, {
		get groupId() {
			return groupId;
		},
		claim: () => nextIndex++,
		isActive: (index: number) => active === index
	});

	function select(index: number) {
		active = index;
	}

	function focusTab(index: number) {
		listEl?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
	}

	function onKeydown(event: KeyboardEvent) {
		const n = labels.length;
		if (n === 0) return;
		let next = active;
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				next = (active + 1) % n;
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				next = (active - 1 + n) % n;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = n - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		select(next);
		focusTab(next);
	}
</script>

<div class="acrolls-tabs" data-variant={variant}>
	<!-- Composite widget: focus lives on the child [role=tab] buttons via roving
	     tabindex (WAI-ARIA APG), not on the tablist container itself. -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="acrolls-tabs__list"
		role="tablist"
		aria-label={label}
		aria-orientation="horizontal"
		bind:this={listEl}
		onkeydown={onKeydown}
	>
		{#each labels as text, i (i)}
			<button
				type="button"
				role="tab"
				class="acrolls-tabs__tab"
				id="{groupId}-tab-{i}"
				aria-controls="{groupId}-panel-{i}"
				aria-selected={active === i}
				tabindex={active === i ? 0 : -1}
				data-active={active === i ? 'true' : undefined}
				onclick={() => select(i)}
			>
				{text}
			</button>
		{/each}
	</div>
	{@render children?.()}
</div>
