<script lang="ts">
	import { ACCENT_EVENT, accents, currentAccentId, DEFAULT_ACCENT_ID, setAccent } from '$site/lib/accents';

	let { compact = false }: { compact?: boolean } = $props();

	let current = $state(DEFAULT_ACCENT_ID);

	function sync() {
		current = currentAccentId();
	}

	$effect(() => {
		sync();
		window.addEventListener(ACCENT_EVENT, sync);
		return () => window.removeEventListener(ACCENT_EVENT, sync);
	});
</script>

{#if !compact}
	<p class="label">Accent</p>
{/if}
<div class="group" class:compact role="radiogroup" aria-label="Accent color">
	{#each accents as accent (accent.id)}
		<button
			type="button"
			role="radio"
			aria-checked={accent.id === current}
			aria-label={accent.label}
			class="swatch"
			class:selected={accent.id === current}
			onclick={() => setAccent(accent.id)}
		>
			<span
				aria-hidden="true"
				class="dot"
				style:background={accent.swatch}
			></span>
		</button>
	{/each}
</div>

<style>
	.label {
		margin: 0;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}

	.swatch {
		position: relative;
		display: flex;
		width: 1.75rem;
		height: 1.75rem;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
	}

	.swatch.selected {
		background: var(--text-muted);
	}

	.dot {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		overflow: hidden;
	}

</style>
