<script lang="ts">
	import { Icon } from 'fractalicons';
	import { luX, luChevronLeft, luChevronRight } from 'fractalicons/lucide';
	import IconButton from './IconButton.svelte';

	export interface LightboxImage {
		src: string;
		alt?: string;
	}

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		images: LightboxImage[];
		/** Index of the image to show. */
		index?: number;
		onIndexChange?: (index: number) => void;
		class?: string;
	}

	let {
		open = $bindable(false),
		onOpenChange,
		images,
		index = $bindable(0),
		onIndexChange,
		class: className = ''
	}: Props = $props();

	const rootClass = $derived(['k-lightbox', className].filter(Boolean).join(' '));

	let dialog: HTMLDialogElement | undefined = $state();
	const uid = Math.random().toString(36).slice(2, 8);

	const current = $derived(images[index] ?? images[0]);

	$effect(() => {
		const el = dialog;
		if (!el) return;
		if (open) {
			if (!el.open) el.showModal();
		} else if (el.open) {
			el.close();
		}
	});

	function handleClose() {
		if (!open) return;
		open = false;
		onOpenChange?.(false);
	}

	function step(dir: 1 | -1) {
		if (images.length < 2) return;
		const next = (index + dir + images.length) % images.length;
		index = next;
		onIndexChange?.(next);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') step(-1);
		else if (e.key === 'ArrowRight') step(1);
	}
</script>

<dialog
	bind:this={dialog}
	class={rootClass}
	aria-label="Image lightbox"
	aria-describedby={current?.alt ? `${uid}-desc` : undefined}
	onclose={handleClose}
	onkeydown={onKeydown}
>
	{#if current}
		<figure class="box xcenter ycenter gap-2xs full">
			<img
				class="k-lightbox-img"
				src={current.src}
				alt={current.alt ?? ''}
				id={current.alt ? `${uid}-desc` : undefined}
			/>
			{#if current.alt}<figcaption class="text-sm" style="color: var(--text-inverse)">
					{current.alt}
				</figcaption>{/if}
		</figure>
	{/if}
	<IconButton class="k-lightbox-close" label="Close lightbox" onclick={() => dialog?.close()}>
		<Icon icon={luX} size={20} />
	</IconButton>
	{#if images.length > 1}
		<IconButton class="k-lightbox-prev" label="Previous image" onclick={() => step(-1)}>
			<Icon icon={luChevronLeft} size={24} />
		</IconButton>
		<IconButton class="k-lightbox-next" label="Next image" onclick={() => step(1)}>
			<Icon icon={luChevronRight} size={24} />
		</IconButton>
	{/if}
</dialog>

<style lang="sass">
.k-lightbox
	position: relative
	display: flex
	align-items: center
	justify-content: center
	width: min(1080px, 94vw)
	height: min(80vh, 94vh)
	padding: 24px
	background: transparent
	border: none
	box-shadow: none

	&::backdrop
		background: rgba(0, 0, 0, 0.75)

	.k-lightbox-img
		max-width: 100%
		max-height: 100%
		object-fit: contain
		border-radius: var(--radius-md)
		box-shadow: var(--shadow-lg)

	:global(.k-lightbox-close)
		position: absolute
		top: 16px
		right: 16px
		color: var(--text-primary)
		background: var(--bg-button)
		border: 1px solid var(--border)
		&:hover
			background: var(--state-hover)

	:global(.k-lightbox-prev),
	:global(.k-lightbox-next)
		position: absolute
		top: 50%
		transform: translateY(-50%)
		color: var(--text-primary)
		background: var(--bg-button)
		border: 1px solid var(--border)
		&:hover
			background: var(--state-hover)

	:global(.k-lightbox-prev)
		left: 16px

	:global(.k-lightbox-next)
		right: 16px
</style>

