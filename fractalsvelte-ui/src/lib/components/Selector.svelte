<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luCheck } from 'fractalicons/lucide';
	import RadioIndicator from './RadioIndicator.svelte';

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
		type?: 'single' | 'multiple';
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

<div class="box gap-2xs {className}" role="radiogroup" aria-label={label}>
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
