<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCookie } from 'fractalicons/lucide';

	interface Props {
		title?: string;
		description?: string;
		acceptLabel?: string;
		rejectLabel?: string;
		/** localStorage key remembering the decision. */
		storageKey?: string;
		position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
		/** Extra content between the description and the actions (e.g. a "learn more" link). */
		children?: Snippet;
		/** Fires once per fresh decision — not on restored sessions. */
		onDecision?: (decision: 'accepted' | 'rejected') => void;
		class?: string;
	}

	let {
		title = 'We value your privacy',
		description = 'We use cookies to improve your experience. Choose which ones you allow.',
		acceptLabel = 'Accept all',
		rejectLabel = 'Reject non-essential',
		storageKey = 'fx-cookie-consent',
		position = 'bottom-right',
		children,
		onDecision,
		class: className
	}: Props = $props();

	const reduce = useReducedMotion();

	let visible = $state(false);

	onMount(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(storageKey);
		} catch {}
		// Only surface for visitors who have not decided yet (no SSR flash —
		// the banner mounts client-side after the check).
		if (stored !== 'accepted' && stored !== 'rejected') visible = true;
	});

	function decide(decision: 'accepted' | 'rejected') {
		try {
			localStorage.setItem(storageKey, decision);
		} catch {}
		visible = false;
		onDecision?.(decision);
	}
</script>

<AnimatePresence>
	{#if visible}
		<motion.section
			class={className}
			data-slot="consent-root"
			data-position={position}
			role="region"
			aria-label={title}
			initial={reduce.current ? false : { opacity: 0, y: 24, scale: 0.97 }}
			animate={reduce.current ? undefined : { opacity: 1, y: 0, scale: 1 }}
			exit={reduce.current ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
			transition={{ duration: 0.32, ease: EASE_OUT }}
		>
			<span data-slot="consent-icon"><Icon icon={luCookie} aria-hidden="true" /></span>
			<div data-slot="consent-body">
				<p data-slot="consent-title">{title}</p>
				<p data-slot="consent-description">{description}</p>
				{#if children}{@render children()}{/if}
				<div data-slot="consent-actions">
					<button type="button" data-slot="consent-reject" onclick={() => decide('rejected')}>
						{rejectLabel}
					</button>
					<button type="button" data-slot="consent-accept" onclick={() => decide('accepted')}>
						{acceptLabel}
					</button>
				</div>
			</div>
		</motion.section>
	{/if}
</AnimatePresence>
