<script lang="ts">
	type Props = {
		src?: string;
		alt?: string;
		name?: string;
		size?: 'sm' | 'md' | 'lg';
	};

	let { src, alt = '', name = '', size = 'md' }: Props = $props();
	let initials = $derived(name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase());
</script>

<span class="avatar" data-size={size} aria-label={alt || name}>
	{#if src}
		<img {src} {alt} />
	{:else}
		{initials || '?'}
	{/if}
</span>
