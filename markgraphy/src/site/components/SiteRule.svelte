<script lang="ts">
	let {
		orientation = 'x',
		placement = 'top'
	}: {
		orientation?: 'x' | 'y';
		placement?: 'top' | 'bottom' | 'left' | 'right';
	} = $props();
</script>

<span
	class="rule"
	class:x={orientation === 'x'}
	class:y={orientation === 'y'}
	class:top={placement === 'top'}
	class:bottom={placement === 'bottom'}
	class:left={placement === 'left'}
	class:right={placement === 'right'}
	aria-hidden="true"
></span>

<style>
	.rule {
		position: absolute;
		z-index: 10;
		pointer-events: none;
	}

	.x {
		right: 0;
		left: 0;
		height: 1px;
		background-image: repeating-linear-gradient(
			to right,
			var(--border) 0 2px,
			transparent 2px 7px
		);
	}

	.y {
		top: 0;
		bottom: 0;
		width: 1px;
		background-image: repeating-linear-gradient(
			to bottom,
			var(--border) 0 2px,
			transparent 2px 7px
		);
	}

	.top {
		top: 0;
	}

	.bottom {
		bottom: 0;
	}

	.left {
		left: 0;
	}

	.right {
		right: 0;
	}
</style>
