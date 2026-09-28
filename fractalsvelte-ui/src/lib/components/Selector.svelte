<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luCheck } from 'fractalicons/lucide';
	import RadioIndicator from './RadioIndicator.svelte';
	import type { SelectionType } from '#lib/data/componentTypes.ts';

	export interface SelectorOption<T extends string = string> {
		value: T;
		label: string;
		description?: string;
		disabled?: boolean;
	}

	interface Props<T extends string = string> {
		value?: T;
		onValueChange?: (value: T) => void;
		options: SelectorOption<T>[];
		/** 'single' shows a radio indicator, 'multiple' shows a check. */
		type?: SelectionType;
		values?: T[];
		onValuesChange?: (values: T[]) => void;
		label?: string;
		class?: string;
	}

	let {
		value = $bindable<string>(''),
		onValueChange,
		options,
		type = 'single',
		values = $bindable<string[]>([]),
		onValuesChange,
		label = 'Select an option',
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['box', 'gap-2xs', className].filter(Boolean).join(' '));

	function isSelected(v: string) {
		return type === 'single' ? value === v : values.includes(v);
	}

	function toggle(v: string) {
		if (type === 'single') {
			value = v;
			onValueChange?.(v);
		} else {
			values = values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
			onValuesChange?.(values);
		}
	}
</script>

<div class={rootClass} role="radiogroup" aria-label={label}>
	{#each options as option (option.value)}
		<button
			type="button"
			class="k-selector"
			data-state={isSelected(option.value) ? 'selected' : undefined}
			role={type === 'single' ? 'radio' : 'checkbox'}
			aria-checked={isSelected(option.value)}
			disabled={option.disabled}
			onclick={() => toggle(option.value)}
		>
			{#if type === 'single'}
				<RadioIndicator
					state={isSelected(option.value) ? 'checked' : 'unchecked'}
					disabled={option.disabled}
				/>
			{:else}
				<span class="k-check" data-state={isSelected(option.value) ? 'checked' : 'unchecked'}>
					{#if isSelected(option.value)}<Icon icon={luCheck} size={13} />{/if}
				</span>
			{/if}
			<span class="box gap-3xs grow">
				<span class="k-selector-title">{option.label}</span>
				{#if option.description}<span class="k-selector-desc">{option.description}</span>{/if}
			</span>
		</button>
	{/each}
</div>

<style lang="sass">
.k-selector
	display: flex
	align-items: center
	gap: 12px
	width: 100%
	padding: 10px 14px
	border: 1px solid var(--border)
	border-radius: var(--radius-sm)
	background: var(--bg-surface)
	color: var(--text-primary)
	cursor: pointer
	text-align: left
	transition: border-color var(--motion-fast) ease, background-color var(--motion-fast) ease
	&:hover
		background: var(--state-hover)
	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px
	&[data-state='selected']
		border-color: var(--theme-color)
		background: color-mix(in srgb, var(--theme-color) 6%, var(--bg-surface))
	&:disabled
		opacity: 0.5
		cursor: not-allowed

.k-selector-title
	font-size: var(--text-md)
	font-weight: 500

.k-selector-desc
	font-size: var(--text-sm)
	color: var(--text-muted)

.k-check
	display: inline-flex
	align-items: center
	justify-content: center
	width: 18px
	height: 18px
	flex-shrink: 0
	border: 1.5px solid var(--border-strong)
	border-radius: var(--radius-xs)
	background: var(--bg-input)
	color: var(--text-inverse)
	transition: background-color var(--motion-fast) ease, border-color var(--motion-fast) ease
	&[data-state='checked'],
	&[data-state='indeterminate']
		background: var(--theme-color)
		border-color: var(--theme-color)
	&[data-state='disabled']
		opacity: 0.5
</style>

