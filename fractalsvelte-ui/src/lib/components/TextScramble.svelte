<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		text: string;
		trigger?: 'hover' | 'click' | 'mount';
		speed?: number;
		charset?: string;
		oncomplete?: () => void;
	};

	let {
		text,
		trigger = 'hover',
		speed = 30,
		charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
		oncomplete
	}: Props = $props();

	let displayText = $state('');
	let isScrambling = $state(false);

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
		class="text-scramble"
		aria-label={text}
		onclick={scramble}
		style="cursor: pointer; background: none; border: none; padding: 0; font: inherit; text-align: inherit;"
	>
		{displayText}
	</button>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="text-scramble"
		aria-label={text}
		onpointerenter={trigger === 'hover' ? scramble : undefined}
		style="cursor: {trigger === 'hover' ? 'pointer' : 'default'};"
	>
		{displayText}
	</span>
{/if}

