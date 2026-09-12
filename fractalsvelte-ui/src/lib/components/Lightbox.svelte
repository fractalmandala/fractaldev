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
	class="k-lightbox {className}"
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
