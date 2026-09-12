<script lang="ts">
	export interface Tab<T extends string = string> {
		value: T;
		label: string;
		leading?: import('svelte').Snippet;
		disabled?: boolean;
	}

	interface Props<T extends string = string> {
		value?: T;
		onValueChange?: (value: T) => void;
		tabs: Tab<T>[];
		orientation?: 'horizontal' | 'vertical';
		label?: string;
		/** Snippet invoked with the active value — renders the active panel. */
		panel?: import('svelte').Snippet<[T]>;
		class?: string;
	}

	let {
		value = $bindable<string>(''),
		onValueChange,
		tabs,
		orientation = 'horizontal',
		label = 'Tabs',
		panel,
		class: className = ''
	}: Props = $props();

	let tabRefs: (HTMLButtonElement | undefined)[] = $state([]);

	function select(v: string) {
		if (tabs.find((t) => t.value === v)?.disabled) return;
		value = v;
		onValueChange?.(v);
	}

	function onKeydown(e: KeyboardEvent) {
		const enabled = tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i !== -1);
		if (enabled.length === 0) return;
		let idx = enabled.indexOf(tabs.findIndex((t) => t.value === value));
		if (idx === -1) idx = 0;
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			idx = (idx + 1) % enabled.length;
			select(tabs[enabled[idx]].value);
			tabRefs[enabled[idx]]?.focus();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			idx = (idx - 1 + enabled.length) % enabled.length;
			select(tabs[enabled[idx]].value);
			tabRefs[enabled[idx]]?.focus();
		} else if (e.key === 'Home') {
			e.preventDefault();
			select(tabs[enabled[0]].value);
			tabRefs[enabled[0]]?.focus();
		} else if (e.key === 'End') {
			e.preventDefault();
			select(tabs[enabled[enabled.length - 1]].value);
			tabRefs[enabled[enabled.length - 1]]?.focus();
		}
	}
</script>

<div class="box {className}">
	<div
		class="k-tablist"
		data-orientation={orientation}
		role="tablist"
		aria-label={label}
		tabindex="-1"
		onkeydown={onKeydown}
	>
		{#each tabs as tab, i (tab.value)}
			<button
				bind:this={tabRefs[i]}
				type="button"
				class="k-tab"
				role="tab"
				id={`k-tab-${tab.value}`}
				data-state={value === tab.value ? 'active' : undefined}
				aria-selected={value === tab.value}
				aria-controls={`k-tabpanel-${tab.value}`}
				tabindex={value === tab.value ? 0 : -1}
				disabled={tab.disabled}
				onclick={() => select(tab.value)}
			>
				{#if tab.leading}{@render tab.leading()}{/if}
				{tab.label}
			</button>
		{/each}
	</div>
	{#if panel}
		<div
			class="k-tab-panel"
			id={`k-tabpanel-${value}`}
			role="tabpanel"
			aria-labelledby={`k-tab-${value}`}
		>
			{@render panel?.(value)}
		</div>
	{/if}
</div>
