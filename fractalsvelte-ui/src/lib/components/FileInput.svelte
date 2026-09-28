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
		[key: string]: unknown;
	}

	let {
		accept,
		multiple = false,
		disabled = false,
		label = 'Drop files here or click to browse',
		hint = 'Any file type, up to 10 MB',
		class: className = '',
		onFiles,
		...rest
	}: Props = $props();

	let input: HTMLInputElement | undefined = $state();
	let dragging = $state(false);
	let files = $state<File[]>([]);
	const rootClass = $derived(`k-file ${className}`.trim());

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
	class={rootClass}
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
	{...rest}
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
	<span class="k-file-label">{label}</span>
	<span class="k-file-hint">{hint}</span>
	{#if files.length > 0}
		<span class="k-file-chips">
			{#each files as f (f.name + f.size)}
				<span class="k-file-chip">
					<Icon icon={luFile} size={12} />
					<span>{f.name}</span>
				</span>
			{/each}
		</span>
	{/if}
</div>

<style lang="sass">

.k-file
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	gap: 8px
	padding: 24px
	border: 1.5px dashed var(--border-strong)
	border-radius: var(--radius-md)
	background: var(--bg-surface)
	color: var(--text-secondary)
	text-align: center
	cursor: pointer
	transition: border-color var(--motionin1), background-color var(--motionin1)

	&:hover:not([aria-disabled='true'])
		border-color: var(--theme-color)

	&:focus-visible
		outline: 2px solid var(--ring)
		outline-offset: 2px

	&[aria-disabled='true']
		opacity: 0.5
		cursor: not-allowed

	&[data-state='dragging']
		border-color: var(--theme-color)
		background: color-mix(in srgb, var(--theme-color) 8%, var(--bg-surface))

	.sr-only
		position: absolute
		width: 1px
		height: 1px
		padding: 0
		margin: -1px
		overflow: hidden
		clip: rect(0, 0, 0, 0)
		white-space: nowrap
		border: 0

	&-label
		font-size: var(--text-md)
		font-weight: 500
		color: var(--text-primary)

	&-hint
		font-size: var(--text-sm)
		color: var(--text-muted)

	&-chips
		display: inline-flex
		flex-wrap: wrap
		gap: 6px
		margin-top: 4px

	&-chip
		display: inline-flex
		align-items: center
		gap: 4px
		padding: 2px 8px
		font-size: var(--text-xs)
		border-radius: var(--radius-sm)
		background: color-mix(in srgb, var(--theme-color) 14%, transparent)
		border: 1px solid color-mix(in srgb, var(--theme-color) 35%, transparent)
		color: var(--theme-color-alt)
</style>
