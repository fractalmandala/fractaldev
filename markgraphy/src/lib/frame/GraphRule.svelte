<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<div class="rule {className}" aria-hidden="true"></div>

<style>
	.rule {
		width: 100%;
		height: 1px;
		background-image: repeating-linear-gradient(
			to right,
			var(--border, oklch(0.6 0 0 / 0.5)) 0 2px,
			transparent 2px 7px
		);
	}
</style>
