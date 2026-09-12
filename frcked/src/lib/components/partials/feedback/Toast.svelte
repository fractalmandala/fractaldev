<script lang="ts">
	import { browser } from '$app/environment';
	import { slide } from 'svelte/transition';
	import { quintOut, backOut } from 'svelte/easing';
	import { StatusIcons, NavigationIcons } from '$lib/components/icons';
	import { toastState, dismiss } from '$lib/utils';

	const toasts = $derived(toastState.toasts);

	const typeStyles = {
		error: {
			container: 'bg text-primary shadow-md border',
			icon: 'text-danger',
			message: 'text-secondary',
			button: 'text-muted radius-md hover:text-gray-600 hover:bg-gray-100',
			actionButton: 'text-danger border'
		},
		warning: {
			container: 'bg text-primary shadow-md border',
			icon: 'text-warning',
			message: 'text-secondary',
			button: 'text-muted radius-md hover:text-gray-600 hover:bg-gray-100',
			actionButton: 'text-warning border'
		},
		info: {
			container: 'bg text-primary shadow-md border',
			icon: 'text-info',
			message: 'text-secondary',
			button: 'text-muted radius-md hover:text-gray-600 hover:bg-gray-100',
			actionButton: 'text-theme border'
		},
		success: {
			container: 'bg text-primary shadow-md border',
			icon: 'text-success',
			message: 'text-secondary',
			button: 'text-muted radius-md hover:text-gray-600 hover:bg-gray-100',
			actionButton: 'text-success border'
		}
	};

	// Icon mapping for different toast types
	const iconMap = {
		error: 'error',
		warning: 'warning',
		info: 'info',
		success: 'success'
	} as const;

	function handleDismiss(toastId: string) {
		dismiss(toastId);
	}

	function handleActionClick(toastId: string, action: () => void) {
		action();
		dismiss(toastId);
	}
</script>

<!-- Toast Container -->
{#if browser && toasts.length > 0}
	<div
		class="pointer-events-none fixed right-4 bottom-4 left-4 z-900 box gap-sm sm:left-auto sm:w-80"
	>
		{#each toasts as toastItem, index (toastItem.id)}
			{@const styles = typeStyles[toastItem.type]}
			{@const iconName = iconMap[toastItem.type]}
			<div
				class="pointer-events-auto"
				in:slide={{ duration: 400, easing: backOut, delay: index * 100 }}
				out:slide={{ duration: 300, easing: quintOut }}
			>
				<div
					class="radius-md pad-12 {styles.container} {toastItem.class || ''}"
					role="alert"
					aria-live="polite"
				>
					<div class="row ytop gap-md">
						<!-- Icon -->
						<div class="marg-top-2 shrink-0">
							<span class="text-sm {styles.icon}">
								<StatusIcons name={iconName} />
							</span>
						</div>

						<!-- Content -->
						<div class="min0 grow">
							<p class="text-sm lh15 {styles.message}">
								{toastItem.message}
							</p>

							<!-- Action Button -->
							{#if toastItem.action}
								<div class="marg-top-8">
									<button
										onclick={() => handleActionClick(toastItem.id, toastItem.action!.onClick)}
										class="button text-xs weight-500 {styles.actionButton}"
									>
										{toastItem.action.label}
									</button>
								</div>
							{/if}
						</div>

						<!-- Dismiss Button -->
						{#if toastItem.dismissible}
							<button
								onclick={() => handleDismiss(toastItem.id)}
								class="button blank shrink-0 pad-4 marg-top-2 {styles.button}"
								aria-label="Dismiss notification"
							>
								<NavigationIcons name="close" size="square-16" />
							</button>
						{/if}
					</div>

					<!-- Progress Bar (shown for all toasts) -->
					<div class="marg-top-8 h-6 overflow-hidden radius-full raised">
						<div
							class="progress-bar hfull radius-full"
							class:bg-danger={toastItem.type === 'error'}
							class:bg-warning={toastItem.type === 'warning'}
							class:bg-info={toastItem.type === 'info'}
							class:bg-success={toastItem.type === 'success'}
							class:opacity-100={toastItem.duration > 0}
							class:opacity-30={toastItem.duration === 0}
							class:static={toastItem.duration === 0}
							style="--toast-duration: {toastItem.duration}ms"
						></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style lang="sass">
@keyframes toast-progress
	from
		transform: scaleX(0)
	to
		transform: scaleX(1)

.progress-bar
	animation: toast-progress var(--toast-duration, 5000ms) linear forwards
	animation-play-state: running
	transform-origin: left

	&.static
		animation-play-state: paused
		transform: scaleX(1)

[role='alert']
	transform-origin: bottom
	animation: toast-enter 0.3s ease-out

@keyframes toast-enter
	0%
		opacity: 0
		transform: translateY(100%) scale(0.95)
	100%
		opacity: 1
		transform: translateY(0%) scale(1)

button:focus-visible
	outline: 2px solid rgba(255, 255, 255, 0.8)
	outline-offset: 2px

@media (max-width: 640px)
	[role='alert']
		margin-left: 0
		margin-right: 0

@media (prefers-reduced-motion: reduce)
	[role='alert']
		animation: none

	.toast-progress
		animation: none !important
</style>
