<script lang="ts">
	type Tab = { id: string; label: string; content: string };
	type Props = {
		tabs: Tab[];
		active?: string;
	};

	let { tabs, active = $bindable(tabs[0]?.id ?? '') }: Props = $props();
	let current = $derived(tabs.find((tab) => tab.id === active));
</script>

<div class="tabs">
	<div class="tab-list" role="tablist" aria-label="Tabs">
		{#each tabs as tab}
			<button class="tab-btn" class:active={active === tab.id} data-state={active === tab.id ? 'active' : 'inactive'} role="tab" aria-selected={active === tab.id} onclick={() => active = tab.id}>{tab.label}</button>
		{/each}
	</div>
	<div class="tab-panel" role="tabpanel">{current?.content}</div>
</div>
