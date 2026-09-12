<script module lang="ts">
	export type Corner = 'tl' | 'tr' | 'bl' | 'br';
</script>

<script lang="ts">
	let {
		corners = ['tl', 'tr', 'bl', 'br'],
		mark = '+',
		tone = 'rail'
	}: {
		corners?: Corner[];
		mark?: string;
		tone?: 'rail' | 'frame';
	} = $props();
</script>

{#each corners as corner (corner)}
	<span
		class="mark"
		class:tl={corner === 'tl'}
		class:tr={corner === 'tr'}
		class:bl={corner === 'bl'}
		class:br={corner === 'br'}
		class:rail={tone === 'rail'}
		class:frame={tone === 'frame'}
		aria-hidden="true"
	>
		{mark}
	</span>
{/each}

<style>
	.mark {
		position: absolute;
		z-index: 20;
		display: flex;
		width: 1rem;
		height: 1rem;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		font-size: 0.875rem;
		line-height: 1;
		user-select: none;
		pointer-events: none;
	}

	.rail {
		color: var(--border);
	}

	.frame {
		color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.tl {
		top: 0;
		left: 0;
		transform: translate(-50%, -50%);
	}

	.tr {
		top: 0;
		right: 0;
		transform: translate(50%, -50%);
	}

	.bl {
		bottom: 0;
		left: 0;
		transform: translate(-50%, 50%);
	}

	.br {
		right: 0;
		bottom: 0;
		transform: translate(50%, 50%);
	}
</style>
