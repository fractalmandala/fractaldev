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

	const rootClass = $derived(`k-popover-wrap ${className}`.trim());
</script>

<span class={rootClass} bind:this={wrap}>
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

<style lang="sass">
.k-popover-wrap
	position: relative
	display: inline-flex

.k-topnav-item
	display: inline-flex
	align-items: center
	gap: 6px
	padding: 7px 12px
	font-size: var(--text-md)
	font-weight: 500
	border: none
	border-radius: var(--radius-6)
	background: transparent
	color: var(--text-secondary)
	cursor: pointer
	text-decoration: none

	&:hover
		background: var(--state-hover)
		color: var(--text-primary)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[data-state='open']
		background: var(--state-hover)
		color: var(--text-primary)

.k-megamenu
	position: absolute
	top: calc(100% + 8px)
	left: 50%
	transform: translateX(-50%)
	z-index: var(--z-modal)
	width: min(720px, 92vw)
	padding: 20px
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-12)
	box-shadow: var(--shadow-popover)

	&[data-open='false']
		display: none

.k-megamenu-grid
	display: grid
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))
	gap: 24px

.box
	display: flex
	flex-direction: column

	&.gap-3xs
		gap: var(--space-3xs)

.k-megamenu-heading
	font-size: var(--text-xs)
	font-weight: 600
	text-transform: uppercase
	letter-spacing: 0.05em
	color: var(--text-muted)

.k-megamenu-link
	display: flex
	flex-direction: column
	gap: 1px
	padding: 6px 8px
	border-radius: var(--radius-4)
	font-size: var(--text-md)
	color: var(--text-primary)
	text-decoration: none

	&:hover
		background: var(--state-hover)
		color: var(--theme-color-alt)

.k-megamenu-link-desc
	font-size: var(--text-xs)
	color: var(--text-muted)

.k-megamenu-feature
	grid-column: 1 / -1
	margin-top: 4px
</style>
