<script lang="ts">
	type Props = {
		src: string;
		alt: string;
		zoom?: boolean;
		class?: string;
	};

	let { src, alt, zoom = true, class: className = '' }: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	function open() {
		if (!zoom) return;
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	// Opt-out via #nozoom fragment on src
	const effectiveZoom = $derived(zoom && !src.includes('#nozoom'));
	const cleanSrc = $derived(src.replace(/#nozoom$/, ''));
</script>

{#if effectiveZoom}
	<button type="button" class={['acrolls-zoom-trigger', className].filter(Boolean).join(' ')} onclick={open}>
		<img src={cleanSrc} {alt} />
	</button>
	<dialog class="acrolls-zoom-dialog" bind:this={dialog} onclick={(e) => e.target === dialog && close()}>
		<form method="dialog">
			<button type="submit" class="acrolls-code-frame__btn">Close</button>
		</form>
		<img src={cleanSrc} {alt} />
		{#if alt}
			<p>{alt}</p>
		{/if}
	</dialog>
{:else}
	<img class={className} src={cleanSrc} {alt} />
{/if}
