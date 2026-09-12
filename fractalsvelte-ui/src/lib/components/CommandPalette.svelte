<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luSearch, luCornerDownLeft } from 'fractalicons/lucide';

	export interface CommandItem {
		id: string;
		label: string;
		description?: string;
		leading?: import('svelte').Snippet;
		onSelect?: () => void;
	}

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		items: CommandItem[];
		placeholder?: string;
		label?: string;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		items,
		placeholder = 'Type a command or search…',
		label = 'Command palette',
		class: className = ''
	}: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let query = $state('');
	let active = $state(0);
	const uid = Math.random().toString(36).slice(2, 8);

	const filtered = $derived(
		items.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
	);

	$effect(() => {
		const el = dialog;
		if (!el) return;
		if (open) {
			if (!el.open) el.showModal();
			active = 0;
		} else if (el.open) {
			el.close();
		}
	});

	function handleClose() {
		if (!open) return;
		open = false;
		onOpenChange?.(false);
		query = '';
	}

	function onKeydown(e: KeyboardEvent) {
		if (filtered.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			active = (active + 1) % filtered.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			active = (active - 1 + filtered.length) % filtered.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			filtered[active]?.onSelect?.();
			dialog?.close();
		}
	}
</script>

<dialog bind:this={dialog} class="k-command {className}" aria-label={label} onclose={handleClose}>
	<div class="k-command-input-wrap">
		<Icon icon={luSearch} size={18} class="muted" />
		<input
			id={`${uid}-input`}
			class="k-command-input"
			type="text"
			{placeholder}
			bind:value={query}
			onkeydown={onKeydown}
		/>
	</div>
	<div class="k-command-list" role="listbox" aria-label="Commands">
		{#if filtered.length === 0}
			<div class="k-command-empty">No results for “{query}”.</div>
		{:else}
			{#each filtered as item, i (item.id)}
				<button
					type="button"
					class="k-command-item"
					role="option"
					aria-selected={active === i}
					data-highlighted={active === i ? 'true' : undefined}
					onmouseenter={() => (active = i)}
					onclick={() => {
						item.onSelect?.();
						dialog?.close();
					}}
				>
					{#if item.leading}{@render item.leading?.()}{/if}
					<span class="box gap-3xs grow">
						<span>{item.label}</span>
						{#if item.description}<span class="text-xs muted">{item.description}</span>{/if}
					</span>
					{#if active === i}<Icon icon={luCornerDownLeft} size={14} class="muted" />{/if}
				</button>
			{/each}
		{/if}
	</div>
</dialog>
