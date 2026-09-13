<script lang="ts">
	import type { DocsVersion } from './versions.js';

	type Item = { version: DocsVersion; href: string; current: boolean };

	type Props = {
		items: Item[];
		/** Accessible name for the control. */
		label?: string;
	};

	let { items, label = 'Documentation version' }: Props = $props();
</script>

<nav class="acrolls-docs-version-switcher" aria-label={label}>
	<ul class="acrolls-docs-version-list" role="list">
		{#each items as item (item.version.id)}
			<li>
				<a
					class="acrolls-docs-version-link"
					class:acrolls-is-active={item.current}
					href={item.href}
					aria-current={item.current ? 'page' : undefined}
				>
					<span class="acrolls-docs-version-label">{item.version.label}</span>
					{#if item.version.badge}
						<span class="acrolls-docs-version-badge">{item.version.badge}</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>
