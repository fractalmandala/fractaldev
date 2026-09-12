<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';
	import { ModalLogic, type ModalState } from '$lib/states/modal';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		closeable?: boolean;
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let {
		open = false,
		title = '',
		size = 'md',
		closeable = true,
		onclose,
		children,
		footer
	}: Props = $props();

	const logic = untrack(() => new ModalLogic({ open, title, size, closeable, onclose }));
	let state = $state<ModalState>(logic.getState());

	logic.onStateUpdate((newState) => {
		state = newState;
	});

	$effect(() => {
		logic.updateProps({ open, title, size, closeable, onclose });
	});

	onMount(() => {
		return () => {
			logic.cleanup();
		};
	});
</script>

<svelte:window onkeydown={logic.getKeydownHandler()} />

{#if state.open}
	<!-- Pure overlay modal - no body scroll interference -->
	<div
		class="min-h-100dvh fixed inset-0 z-9999 row ycenter xcenter bg-black/80 pad-8 sm:p-4"
		in:fade={{ duration: 250, easing: quintOut }}
		out:fade={{ duration: 200 }}
		style="height: 100dvh; overflow-y: auto;"
	>
		<!-- Modal Container -->
		<div
			class="relative wfull {logic.getSizeClass()} marg-y-16 overflow-hidden radius-8 border bg shadow-lg"
			style:max-height="calc(100dvh - 2rem)"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			in:fly={{ y: 32, duration: 300, easing: quintOut }}
			out:fly={{ y: 8, duration: 250, easing: quintOut }}
		>
			<!-- Header -->
			{#if state.title || state.closeable}
				<div class="row ycenter xbetween border-bottom pad-x-16 pad-y-12 sm:px-6 sm:py-4">
					{#if state.title}
						<h2 class="text-bs weight-600 text-primary sm:text-lg">
							{state.title}
						</h2>
					{:else}
						<div></div>
					{/if}

					{#if state.closeable}
						<button
							onclick={() => logic.close()}
							class="button blank radius-6 pad-6 text-muted sm:p-2"
							aria-label="Close modal"
						>
							<svg
								class="square-24 sm:h-4 sm:w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</button>
					{/if}
				</div>
			{/if}

			<!-- Content -->
			<div
				class="overflow-y-auto pad-x-16 pad-y-16 sm:px-6 sm:py-6"
				style:max-height="calc(100dvh - 9rem)"
			>
				{@render children?.()}
			</div>

			<!-- Footer -->
			{#if footer}
				<div class="border-top surface pad-x-16 pad-y-12 sm:px-6 sm:py-4">
					{@render footer?.()}
				</div>
			{/if}
		</div>
	</div>
{/if}
