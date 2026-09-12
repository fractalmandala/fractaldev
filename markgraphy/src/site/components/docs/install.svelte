<script lang="ts">
	const managers = [
		{ id: 'pnpm', cmd: 'pnpm add markgraphy' },
		{ id: 'npm', cmd: 'npm install markgraphy' },
		{ id: 'bun', cmd: 'bun add markgraphy' }
	];

	let current = $state(managers[0]);
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => () => clearTimeout(timer));

	async function copy() {
		try {
			await navigator.clipboard.writeText(current.cmd);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1400);
	}
</script>

<div class="install">
	<div class="pkg" role="group" aria-label="Package manager">
		{#each managers as pm (pm.id)}
			<button
				type="button"
				class="tab"
				aria-pressed={pm.id === current.id}
				onclick={() => (current = pm)}
			>
				{pm.id}
			</button>
		{/each}
	</div>
	<div class="cmd">
		<code>{current.cmd}</code>
		<button class="primo" type="button" onclick={copy}>{copied ? 'Copied' : 'Copy'}</button>
	</div>
</div>

<style>
	.install {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.pkg {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}

	.tab {
		min-height: 32px;
		padding: 0 0.7rem;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.tab:hover {
		color: var(--text-primary);
		border-color: var(--text-primary);
	}

	.tab[aria-pressed='true'] {
		color: var(--bg);
		background: var(--text-primary);
		border-color: var(--text-primary);
	}

	.cmd {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		padding: 0.85rem 0.9rem;
		border: 1px solid var(--border);
		background: var(--bg-terminal, #0c0c0c);
	}

	.cmd code {
		font-size: 0.84rem;
		white-space: nowrap;
	}
</style>
