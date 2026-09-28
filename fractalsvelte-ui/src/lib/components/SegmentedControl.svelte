<script lang="ts">
	export interface SegmentOption<T extends string = string> {
		value: T;
		label: string;
		leading?: import('svelte').Snippet;
	}

	interface Props<T extends string = string> {
		value?: T;
		onValueChange?: (value: T) => void;
		options: SegmentOption<T>[];
		/** Accessible name for the group. */
		label?: string;
		class?: string;
	}

	let {
		value = $bindable<string>(''),
		onValueChange,
		options,
		label = 'Segmented control',
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['k-segmented', className].filter(Boolean).join(' '));

	function select(v: string) {
		value = v;
		onValueChange?.(v);
	}
</script>

<div class={rootClass} role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="k-segmented-item"
			data-state={value === option.value ? 'selected' : undefined}
			aria-pressed={value === option.value}
			onclick={() => select(option.value)}
		>
			{#if option.leading}{@render option.leading?.()}{/if}
			{option.label}
		</button>
	{/each}
</div>

<style lang="sass">
.k-segmented
	display: inline-flex
	gap: 2px
	padding: 2px
	background: var(--bg-raised)
	border: 1px solid var(--border)
	border-radius: var(--radius-md)

	.k-segmented-item
		display: inline-flex
		align-items: center
		justify-content: center
		gap: 6px
		padding: 6px 14px
		font-size: var(--text-sm)
		font-weight: 500
		border: none
		border-radius: var(--radius-sm)
		background: transparent
		color: var(--text-secondary)
		cursor: pointer
		transition: background-color var(--motion-fast) ease, color var(--motion-fast) ease, box-shadow var(--motion-fast) ease
		&:hover
			color: var(--text-primary)
		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: 2px
		&[data-state='selected']
			background: var(--bg-surface)
			color: var(--text-primary)
			box-shadow: var(--shadow-sm)
</style>
