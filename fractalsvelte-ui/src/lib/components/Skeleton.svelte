<script lang="ts">
	type Props = {
		width?: string;
		height?: string;
		circle?: boolean;
	};

	let { width = '100%', height = '1rem', circle = false }: Props = $props();
</script>

<span class="skeleton" data-circle={circle || undefined} style:width style:height aria-label="Loading"></span>
