<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luUpload, luFile } from 'fractalicons/lucide';

	interface Props {
		accept?: string;
		multiple?: boolean;
		disabled?: boolean;
		label?: string;
		hint?: string;
		class?: string;
		onFiles?: (files: File[]) => void;
	}

	let {
		accept,
		multiple = false,
		disabled = false,
		label = 'Drop files here or click to browse',
		hint = 'Any file type, up to 10 MB',
		class: className = '',
		onFiles
	}: Props = $props();

	let input: HTMLInputElement | undefined = $state();
	let dragging = $state(false);
	let files = $state<File[]>([]);

	function handleFiles(list: FileList | null) {
		if (!list) return;
		const picked = Array.from(list);
		files = picked;
		onFiles?.(picked);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function openPicker() {
		if (input && !disabled) input.click();
	}
</script>

<div
	class="k-file {className}"
	data-state={dragging ? 'dragging' : undefined}
	role="button"
	tabindex={disabled ? -1 : 0}
	aria-disabled={disabled}
	onclick={openPicker}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openPicker();
		}
	}}
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
>
	<input
		bind:this={input}
		class="sr-only"
		type="file"
		{accept}
		{multiple}
		{disabled}
		onchange={(e) => handleFiles((e.currentTarget as HTMLInputElement).files)}
	/>
	<Icon icon={luUpload} size={28} class="muted" />
	<span class="text-md weight-500">{label}</span>
	<span class="text-sm muted">{hint}</span>
	{#if files.length > 0}
		<span class="cluster gap-2xs">
			{#each files as f (f.name + f.size)}
				<span class="k-badge" data-variant="primary">
					<Icon icon={luFile} size={12} />
					{f.name}
				</span>
			{/each}
		</span>
	{/if}
</div>
