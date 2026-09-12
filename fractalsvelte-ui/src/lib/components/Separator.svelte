<script lang="ts">
	type Props = { orientation?: 'horizontal' | 'vertical' };
	let { orientation = 'horizontal' }: Props = $props();
</script>

<hr class="divider" data-orientation={orientation} />
