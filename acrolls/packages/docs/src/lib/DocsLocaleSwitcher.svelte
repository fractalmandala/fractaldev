<script lang="ts">
	import type { DocsLocale } from './i18n.js';

	type Item = { locale: DocsLocale; href: string; current: boolean };

	type Props = {
		items: Item[];
		label?: string;
	};

	let { items, label = 'Language' }: Props = $props();
</script>

<nav class="acrolls-docs-locale-switcher" aria-label={label}>
	<ul class="acrolls-docs-locale-list" role="list">
		{#each items as item (item.locale.id)}
			<li>
				<a
					class="acrolls-docs-locale-link"
					class:acrolls-is-active={item.current}
					href={item.href}
					aria-current={item.current ? 'page' : undefined}
					hreflang={item.locale.lang ?? item.locale.id}
				>
					{item.locale.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
