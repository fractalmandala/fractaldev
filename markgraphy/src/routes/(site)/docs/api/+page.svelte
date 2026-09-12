<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const components = Object.entries(data.metadata).sort(([, a], [, b]) => a.file.localeCompare(b.file));

	const categories = {
		frame: 'Frame',
		graphs: 'Graphs',
		animated: 'Animated',
		diagram: 'Diagrams'
	};
</script>

<svelte:head>
	<title>Component API Reference — Markgraphy</title>
</svelte:head>

<div class="page fg-prose">
	<h1>Component API Reference</h1>
	<p class="lead">Complete prop documentation for all {components.length} components.</p>

	{#each Object.entries(categories) as [key, label]}
		{@const group = components.filter(([, info]) => info.file.startsWith(key + '/') || (key === 'animated' && info.file.startsWith('animated/')))}
		{#if group.length > 0}
			<section>
				<h2>{label}</h2>
				{#each group as [name, info]}
					<div class="component">
						<h3 id={name}>
							<a href="#{name}">{name}</a>
						</h3>
						{#if info.description}
							<p class="description">{info.description}</p>
						{/if}
						<p class="file"><code>{info.file}</code></p>

						{#if info.props.length > 0}
							<table>
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Default</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									{#each info.props as prop}
										<tr>
											<td>
												<code>{prop.name}</code>
												{#if prop.optional}<span class="optional">?</span>{/if}
											</td>
											<td><code>{prop.type || '—'}</code></td>
											<td>{prop.default ? `<code>{prop.default}</code>` : '—'}</td>
											<td>{prop.description || '—'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}

						{#if info.moduleExports.length > 0}
							<div class="exports">
								<strong>Exported types:</strong>
								{#each info.moduleExports as exp}
									<code>{exp.name}</code>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</section>
		{/if}
	{/each}
</div>

<style>
	.page {
		max-width: 56rem;
		margin: 0 auto;
		padding: 2rem var(--pad) 5rem;
	}

	.lead {
		color: var(--text-secondary);
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 3rem;
	}

	h2 {
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.component {
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 1px dashed var(--border);
	}

	.component:last-child {
		border-bottom: none;
	}

	h3 {
		margin: 0 0 0.5rem;
		font-size: 1.2rem;
	}

	h3 a {
		color: var(--text-primary);
		text-decoration: none;
	}

	h3 a:hover {
		color: var(--graph-accent);
	}

	.description {
		color: var(--text-secondary);
		margin: 0.5rem 0;
	}

	.file {
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0.5rem 0 1rem;
	}

	.file code {
		background: var(--bg-surface);
		padding: 0.2rem 0.4rem;
		border-radius: 0.25rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
		margin: 1rem 0;
	}

	th {
		text-align: left;
		padding: 0.5rem;
		border-bottom: 2px solid var(--border);
		color: var(--text-secondary);
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	td {
		padding: 0.5rem;
		border-bottom: 1px solid var(--border-subtle);
		vertical-align: top;
	}

	code {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		background: var(--bg-surface);
		padding: 0.15rem 0.3rem;
		border-radius: 0.2rem;
	}

	.optional {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.exports {
		margin-top: 0.75rem;
		font-size: 0.85rem;
		color: var(--text-secondary);
	}

	.exports code {
		margin-left: 0.5rem;
	}
</style>
