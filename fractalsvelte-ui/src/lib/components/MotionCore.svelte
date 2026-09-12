<script lang="ts">
	import { MotionA, MotionButton, MotionDiv, MotionNav, MotionSpan } from '@humanspeak/svelte-motion';
	import { springFeedback, tweenContent } from '#lib/motion/presets.ts';
	import CanvasMotion from './CanvasMotion.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		pattern: string;
		items?: string[];
		text?: string;
		label?: string;
		children?: Snippet;
	};

	let { pattern, items = ['Explore', 'Compose', 'Share'], text = 'Motion that belongs to your interface', label, children }: Props = $props();
	const canvasPatterns = new Set(['ascii-renderer', 'card-3d', 'dithered-image', 'fake-3d-image', 'fluid-image-reveal', 'fluid-simulation', 'glass-logo', 'glass-pane', 'glass-slideshow', 'glitter-cloth', 'globe', 'god-rays', 'halo', 'infinite-gallery', 'interactive-grid', 'lava-lamp', 'liquid-metal', 'neural-noise', 'pixelated-image', 'plasma-grid', 'rubiks-cube', 'specular-band', 'water-ripple', 'watercolor-image']);
	const isCanvas = $derived(canvasPatterns.has(pattern));
	const isText = $derived(['split-hover', 'split-reveal', 'stacking-words', 'text-repel', 'text-scramble', 'weight-wave'].includes(pattern));
	const chars = $derived(Array.from(text));

	let scrambledText = $state('');
	let isScrambling = $state(false);

	$effect(() => {
		scrambledText = text;
	});

	function triggerScramble() {
		if (isScrambling) return;
		isScrambling = true;
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		let iterations = 0;
		const interval = setInterval(() => {
			scrambledText = text
				.split('')
				.map((char, index) => {
					if (char === ' ') return ' ';
					if (index < iterations) return text[index];
					return possible[Math.floor(Math.random() * possible.length)];
				})
				.join('');
			if (iterations >= text.length) {
				clearInterval(interval);
				scrambledText = text;
				isScrambling = false;
			}
			iterations += 1 / 3;
		}, 30);
	}
</script>

{#if isCanvas}
	<CanvasMotion {pattern} {label} />
{:else if isText}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="motion-core motion-core--text"
		data-pattern={pattern}
		aria-label={label ?? text}
		onclick={pattern === 'text-scramble' ? triggerScramble : undefined}
		style="cursor: {pattern === 'text-scramble' ? 'pointer' : 'default'}; display: flex; flex-wrap: wrap; gap: 0.05em;"
	>
		{#if pattern === 'text-scramble'}
			{#each Array.from(scrambledText) as char, index (index)}
				<span>{char === ' ' ? '\u00a0' : char}</span>
			{/each}
		{:else}
			{#each chars as char, index (index)}
				<MotionSpan
					whileHover={pattern === 'split-hover' || pattern === 'text-repel' ? { y: -6, scale: 1.15, color: 'var(--theme-color)' } : {}}
					transition={springFeedback}
					style="display: inline-block;"
				>
					{char === ' ' ? '\u00a0' : char}
				</MotionSpan>
			{/each}
		{/if}
	</div>
{:else if pattern === 'macos-dock'}
	<div class="motion-core motion-core--dock" aria-label={label ?? 'Application dock'}>
		{#each items as item (item)}<MotionButton type="button" whileHover={{ y: -8, scale: 1.22 }} whileTap={{ scale: 0.94 }} transition={springFeedback} aria-label={item}>{item.slice(0, 1)}</MotionButton>{/each}
	</div>
{:else if pattern === 'video-player'}
	<MotionDiv class="motion-core motion-core--video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={tweenContent} aria-label={label ?? 'Video player'}>
		<div class="motion-core__video-screen">▶</div><div class="motion-core__video-controls"><button type="button">Play</button><input aria-label="Video progress" type="range" value="42" /><span>0:42</span></div>
	</MotionDiv>
{:else if pattern === 'floating-menu' || pattern === 'underlay-navigation'}
	<MotionNav class="motion-core motion-core--nav" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={tweenContent} aria-label={label ?? 'Motion navigation'}>{#each items as item, index (item)}<MotionA href="#motion-core" whileHover={{ x: 4 }} transition={{ ...springFeedback, delay: index * 0.03 }}>{item}</MotionA>{/each}</MotionNav>
{:else if pattern === 'flip-grid'}
	<div class="motion-core motion-core--grid" aria-label={label ?? 'Animated grid'}>{#each items.concat(items) as item, index (`${item}-${index}`)}<MotionDiv layout whileHover={{ scale: 1.04 }} transition={springFeedback}>{item}</MotionDiv>{/each}</div>
{:else if pattern === 'card-stack' || pattern === 'flip-card-stack'}
	<div class="motion-core motion-core--stack" aria-label={label ?? 'Card stack'}>{#each items as item, index (item)}<MotionDiv drag={pattern === 'flip-card-stack'} dragSnapToOrigin={pattern === 'flip-card-stack'} style={`--stack-index: ${index}`} whileHover={{ y: -5 }} transition={springFeedback}><strong>{item}</strong><span>Composable motion surface</span></MotionDiv>{/each}</div>
{:else}
	<MotionDiv class="motion-core motion-core--showcase" data-pattern={pattern} aria-label={label ?? pattern} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={tweenContent}>
		{#if children}{@render children()}{:else}{#each items as item, index (item)}<MotionDiv layout whileHover={{ y: -3, scale: 1.015 }} transition={{ ...springFeedback, delay: index * 0.04 }}><strong>{item}</strong><span>{pattern.replaceAll('-', ' ')}</span></MotionDiv>{/each}{/if}
	</MotionDiv>
{/if}
