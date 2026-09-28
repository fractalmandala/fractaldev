<script lang="ts">
	type Tab = { id: string; label: string; content: string };
	type Props = {
		tabs: Tab[];
		active?: string;
		class?: string;
		[key: string]: unknown;
	};

	let { tabs, active = $bindable(tabs[0]?.id ?? ''), class: className = '', ...rest }: Props = $props();
	let current = $derived(tabs.find((tab) => tab.id === active));
	const rootClass = $derived(`tabs ${className}`.trim());
</script>

<div class={rootClass} {...rest}>
	<div class="tab-list" role="tablist" aria-label="Tabs">
		{#each tabs as tab}
			<button
				class="tab-btn"
				data-state={active === tab.id ? 'active' : 'inactive'}
				role="tab"
				aria-selected={active === tab.id}
				onclick={() => (active = tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	<div class="tab-panel" role="tabpanel">{current?.content}</div>
</div>

<style lang="sass">

.tabs
	display: flex
	flex-direction: column
	gap: calc(var(--space-xs) * var(--gap-scale, 1))
	width: 100%
	max-width: 480px

.tab-list
	display: flex
	flex-direction: row
	gap: calc(var(--space-3xs) * var(--gap-scale, 1))
	border-bottom: 1px solid var(--border)

.tab-btn
	padding: calc(var(--space-2xs) * var(--pad-scale, 1)) calc(var(--space-xs) * var(--pad-scale, 1))
	font-family: inherit
	font-size: var(--text-sm)
	color: var(--text-secondary)
	background: transparent
	border: 0
	border-bottom: 2px solid transparent
	margin-bottom: -1px
	cursor: pointer
	transition: color var(--motionin1), border-color var(--motionin1)

	&:hover
		color: var(--text-primary)

	&[data-state='active']
		color: var(--theme-color)
		border-bottom-color: var(--theme-color)
		font-weight: 500

.tab-panel
	padding: calc(var(--space-2xs) * var(--pad-scale, 1)) 0
	font-family: inherit
	font-size: var(--text-sm)
	color: var(--text-secondary)
</style>
