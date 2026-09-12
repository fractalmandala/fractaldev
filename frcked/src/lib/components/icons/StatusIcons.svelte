<script lang="ts">
	import type { StatusIconName } from './types.js';

	let {
		name,
		size = 'square-16',
		class: className = ''
	}: {
		name: StatusIconName | string;
		size?: string;
		class?: string;
	} = $props();

	const iconClasses = $derived(`${size} ${className}`);
</script>

{#if name === 'error'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'warning'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
		></path>
	</svg>
{:else if name === 'info'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'loading'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="10" stroke-width="2" stroke-dasharray="32 32" stroke-linecap="round">
			<animateTransform
				attributeName="transform"
				type="rotate"
				from="0 12 12"
				to="360 12 12"
				dur="1s"
				repeatCount="indefinite"
			/>
		</circle>
	</svg>
{:else if name === 'check'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
	</svg>
{:else if name === 'x'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
		></path>
	</svg>
{:else if name === 'exclamation'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'question'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'pause'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'play'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
		></path>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
	</svg>
{:else if name === 'stop'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		></path>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
		></path>
	</svg>
{:else if name === 'connection'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
		></path>
	</svg>
{:else if name === 'offline'}
	<svg class={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M18.364 5.636l-12.728 12.728M16.243 7.757l-9.9 9.9m4.242-4.242l2.121 2.121"
		></path>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
			class="opacity-30"
		></path>
	</svg>
{:else if name === 'online'}
	<svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="3" class="text-success"></circle>
	</svg>
{:else if name === 'busy'}
	<svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="3" class="text-danger"></circle>
	</svg>
{:else if name === 'away'}
	<svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="3" class="text-warning"></circle>
	</svg>
{:else if name === 'invisible'}
	<svg class={iconClasses} fill="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="3" class="text-muted"></circle>
	</svg>
{/if}
