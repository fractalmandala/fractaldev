<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luMenu, luX } from 'fractalicons/lucide';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		label?: string;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		label = 'Toggle navigation',
		class: className = ''
	}: Props = $props();

	function toggle() {
		open = !open;
		onOpenChange?.(open);
	}
</script>

<button
	type="button"
	class="k-icon-button {className}"
	data-variant="outline"
	aria-label={label}
	aria-expanded={open}
	aria-controls="k-mobile-nav"
	onclick={toggle}
>
	{#if open}<Icon icon={luX} size={18} />{:else}<Icon icon={luMenu} size={18} />{/if}
</button>
