<script lang="ts">
	interface Props {
		src?: string;
		alt?: string;
		/** Fallback text (e.g. initials) shown while the image is missing. */
		fallback?: string;
		shape?: 'square' | 'round';
		width?: string;
		height?: string;
		class?: string;
	}

	let {
		src,
		alt = '',
		fallback = '?',
		shape = 'square',
		width = '96px',
		height = '96px',
		class: className = ''
	}: Props = $props();

	let failed = $state(false);
</script>

<span
	class="k-thumbnail {className}"
	data-shape={shape}
	style={`--k-thumb-w:${width};--k-thumb-h:${height}`}
>
	{#if src && !failed}
		<img {src} {alt} onerror={() => (failed = true)} />
	{:else}
		<span class="center full muted weight-600">{fallback}</span>
	{/if}
</span>
