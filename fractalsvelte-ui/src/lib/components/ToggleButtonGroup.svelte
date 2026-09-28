<script lang="ts">
	import type { SelectionType } from '#lib/data/componentTypes.ts';

	export interface ToggleOption<T extends string = string> {
		value: T;
		label: string;
		leading?: import('svelte').Snippet;
	}

	interface Props<T extends string = string> {
		/** 'single' (radio-like) or 'multiple' (checkbox-like). */
		type?: SelectionType;
		/** Single-select value. */
		value?: T;
		/** Multi-select values. */
		values?: T[];
		onValueChange?: (value: T) => void;
		onValuesChange?: (values: T[]) => void;
		options: ToggleOption<T>[];
		label?: string;
		class?: string;
	}

	let {
		type = 'single',
		value = $bindable<string>(''),
		values = $bindable<string[]>([]),
		onValueChange,
		onValuesChange,
		options,
		label = 'Toggle group',
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['k-toggle-group', className].filter(Boolean).join(' '));

	function isOn(v: string) {
		return type === 'single' ? value === v : values.includes(v);
	}

	function toggle(v: string) {
		if (type === 'single') {
			value = value === v ? '' : v;
			onValueChange?.(value);
		} else {
			values = values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
			onValuesChange?.(values);
		}
	}
</script>

<div class={rootClass} role="group" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="k-toggle-button"
			data-state={isOn(option.value) ? 'on' : undefined}
			aria-pressed={isOn(option.value)}
			onclick={() => toggle(option.value)}
		>
			{#if option.leading}{@render option.leading?.()}{/if}
			{option.label}
		</button>
	{/each}
</div>

<style lang="sass">
.k-toggle-group
	display: inline-flex
	gap: 4px
	flex-wrap: wrap

	.k-toggle-button
		display: inline-flex
		align-items: center
		justify-content: center
		gap: 6px
		padding: 6px 14px
		font-size: var(--text-sm)
		font-weight: 500
		border-radius: var(--radius-sm)
		border: 1px solid var(--border)
		background: var(--bg-surface)
		color: var(--text-secondary)
		cursor: pointer
		transition: background-color var(--motion-fast) ease, color var(--motion-fast) ease, border-color var(--motion-fast) ease
		&:hover
			background: var(--state-hover)
		&:focus-visible
			outline: 2px solid var(--ring)
			outline-offset: 2px
		&[data-state='on']
			background: color-mix(in srgb, var(--theme-color) 12%, var(--bg-surface))
			border-color: color-mix(in srgb, var(--theme-color) 40%, var(--border))
			color: var(--theme-color-alt)
		&:disabled
			opacity: 0.5
			cursor: not-allowed
</style>
