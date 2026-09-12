<script lang="ts">
	import type { DocsCrumb } from './types.js';

	type Props = {
		crumbs: DocsCrumb[];
		/** Accessible name for the nav landmark */
		label?: string;
		class?: string;
	};

	let { crumbs, label = 'Breadcrumb', class: className = '' }: Props = $props();
</script>

<nav
	class={['acrolls-docs-breadcrumb', className].filter(Boolean).join(' ')}
	aria-label={label}
	data-pagefind-ignore
>
	<ol class="acrolls-docs-breadcrumb-list">
		{#each crumbs as crumb, i (i)}
			<li class="acrolls-docs-breadcrumb-item">
				{#if i > 0}
					<span class="acrolls-docs-breadcrumb-sep" aria-hidden="true">/</span>
				{/if}
				{#if crumb.href && i < crumbs.length - 1}
					<a class="acrolls-docs-breadcrumb-link" href={crumb.href}>{crumb.label}</a>
				{:else}
					<span
						class="acrolls-docs-breadcrumb-current"
						aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span
					>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
