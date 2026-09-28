<script lang="ts">
	import { onMount } from 'svelte';
	import type { TextAnimationTrigger } from '#lib/data/componentTypes.ts';

	type Props = {
		text: string;
		trigger?: TextAnimationTrigger;
		speed?: number;
		charset?: string;
		class?: string;
		oncomplete?: () => void;
		[key: string]: unknown;
	};

	let {
		text,
		trigger = 'hover',
		speed = 30,
		charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
		class: className = '',
		oncomplete,
		...rest
	}: Props = $props();

	let displayText = $state('');
	let isScrambling = $state(false);
	const rootClass = $derived(`text-scramble ${className}`.trim());

	$effect(() => {
		displayText = text;
	});

	function scramble() {
		if (isScrambling) return;
		isScrambling = true;

		let iteration = 0;
		const totalLength = text.length;

		const interval = setInterval(() => {
			displayText = text
				.split('')
				.map((char, index) => {
					if (char === ' ' || char === '\t' || char === '\n') return char;
					if (index < iteration) return text[index];
					return charset[Math.floor(Math.random() * charset.length)];
				})
				.join('');

			if (iteration >= totalLength) {
				clearInterval(interval);
				displayText = text;
				isScrambling = false;
				oncomplete?.();
			}

			iteration += 1 / 3;
		}, speed);
	}

	onMount(() => {
		if (trigger === 'mount') {
			scramble();
		}
	});
</script>

{#if trigger === 'click'}
	<button
		type="button"
		class={rootClass}
		data-trigger="click"
		aria-label={text}
		onclick={scramble}
		{...rest}
	>
		{displayText}
	</button>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class={rootClass}
		data-trigger={trigger}
		aria-label={text}
		onpointerenter={trigger === 'hover' ? scramble : undefined}
		{...rest}
	>
		{displayText}
	</span>
{/if}

<style lang="sass">

.text-scramble
	font-family: inherit
	font-variant-numeric: tabular-nums
	display: inline-block
	background: none
	border: none
	padding: 0
	color: inherit
	text-align: inherit

	&[data-trigger='hover']
		cursor: pointer

	&[data-trigger='click']
		cursor: pointer

	&[data-trigger='mount']
		cursor: default
</style>
