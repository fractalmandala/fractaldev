<script lang="ts">
	export interface ToggleOption<T extends string = string> {
		value: T;
		label: string;
		leading?: import('svelte').Snippet;
	}

	interface Props<T extends string = string> {
		/** 'single' (radio-like) or 'multiple' (checkbox-like). */
		type?: 'single' | 'multiple';
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

<div class="k-toggle-group {className}" role="group" aria-label={label}>
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
