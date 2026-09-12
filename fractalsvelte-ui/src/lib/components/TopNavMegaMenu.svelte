<script lang="ts">
	import { onMount } from 'svelte';
	import { Icon } from 'fractalicons';
	import { luChevronDown } from 'fractalicons/lucide';

	export interface MegaMenuColumn {
		heading?: string;
		links: { label: string; href?: string; description?: string }[];
	}

	interface Props {
		label: string;
		columns: MegaMenuColumn[];
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		class?: string;
		/** Optional extra content rendered after the columns (e.g. a featured card). */
		children?: import('svelte').Snippet;
	}

	let {
		label,
		columns,
		open = $bindable(false),
		onOpenChange,
		class: className = '',
		children
	}: Props = $props();

	let wrap: HTMLSpanElement | undefined = $state();

	function setOpen(v: boolean) {
		if (open === v) return;
		open = v;
		onOpenChange?.(v);
	}

	onMount(() => {
		function onDocClick(e: MouseEvent) {
			if (open && !wrap?.contains(e.target as Node)) setOpen(false);
		}
		function onDocKey(e: KeyboardEvent) {
			if (open && e.key === 'Escape') setOpen(false);
		}
		document.addEventListener('click', onDocClick);
		document.addEventListener('keydown', onDocKey);
		return () => {
			document.removeEventListener('click', onDocClick);
			document.removeEventListener('keydown', onDocKey);
		};
	});
</script>

<span class="k-popover-wrap {className}" bind:this={wrap}>
	<button
		class="k-topnav-item"
		data-state={open ? 'open' : undefined}
		aria-haspopup="true"
		aria-expanded={open}
		onclick={() => setOpen(!open)}
	>
		{label}
		<Icon icon={luChevronDown} size={14} />
	</button>
	<div
		class="k-megamenu"
		data-open={open}
		hidden={!open}
		role="region"
		aria-label={`${label} menu`}
	>
		<div class="k-megamenu-grid">
			{#each columns as column (column.heading ?? column.links.map((l) => l.label).join())}
				<div class="box gap-3xs">
					{#if column.heading}<span class="k-megamenu-heading">{column.heading}</span>{/if}
					{#each column.links as link (link.label)}
						<a class="k-megamenu-link" href={link.href}>
							{link.label}
							{#if link.description}<span class="k-megamenu-link-desc">{link.description}</span
								>{/if}
						</a>
					{/each}
				</div>
			{/each}
			{#if children}<div class="k-megamenu-feature">{@render children?.()}</div>{/if}
		</div>
	</div>
</span>
