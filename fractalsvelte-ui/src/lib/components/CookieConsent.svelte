<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '../ease.js';
	import { Icon } from 'fractalicons';
	import { luCookie } from 'fractalicons/lucide';
	import type { CookieConsentPosition, CookieConsentDecision } from '#lib/data/componentTypes.ts';

	interface Props {
		title?: string;
		description?: string;
		acceptLabel?: string;
		rejectLabel?: string;
		/** localStorage key remembering the decision. */
		storageKey?: string;
		position?: CookieConsentPosition;
		/** Extra content between the description and the actions (e.g. a "learn more" link). */
		children?: Snippet;
		/** Fires once per fresh decision — not on restored sessions. */
		onDecision?: (decision: CookieConsentDecision) => void;
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

	const rootClass = $derived(['cookie-consent', className].filter(Boolean).join(' '));

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

	function decide(decision: CookieConsentDecision) {
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
			key="consent"
			class={rootClass}
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

<style lang="sass">
:global(.cookie-consent)
	position: relative
	display: flex
	align-items: flex-start
	gap: var(--space-sm)
	width: min(440px, 94vw)
	padding: var(--space-md)
	background: var(--bg-popover)
	border: 1px solid var(--border)
	border-radius: var(--radius-lg)
	box-shadow: var(--shadow-lg)

	[data-slot='consent-icon']
		display: inline-flex
		align-items: center
		justify-content: center
		width: 36px
		height: 36px
		border-radius: var(--radius-full)
		background: color-mix(in srgb, var(--theme-color) 14%, transparent)
		color: var(--theme-color)
		font-size: var(--text-lg)
		flex-shrink: 0

	[data-slot='consent-body']
		flex: 1
		display: flex
		flex-direction: column
		gap: var(--space-3xs)
		min-width: 0

	[data-slot='consent-title']
		margin: 0
		font-size: var(--text-md)
		font-weight: 600
		color: var(--text-primary)
		line-height: 1.3

	[data-slot='consent-description']
		margin: 0
		font-size: var(--text-sm)
		color: var(--text-secondary)
		line-height: 1.45

	[data-slot='consent-actions']
		display: flex
		align-items: center
		justify-content: flex-end
		gap: var(--space-xs)
		margin-top: var(--space-xs)

	[data-slot='consent-reject']
		padding: var(--space-2xs) var(--space-sm)
		font-size: var(--text-xs)
		font-weight: 500
		color: var(--text-secondary)
		background: var(--bg-surface)
		border: 1px solid var(--border)
		border-radius: var(--radius-sm)
		cursor: pointer
		transition: all var(--motion-fast) ease
		&:hover
			background: var(--state-hover)
			color: var(--text-primary)

	[data-slot='consent-accept']
		padding: var(--space-2xs) var(--space-sm)
		font-size: var(--text-xs)
		font-weight: 500
		color: var(--text-inverse)
		background: var(--theme-color)
		border: 1px solid var(--theme-color)
		border-radius: var(--radius-sm)
		cursor: pointer
		transition: all var(--motion-fast) ease
		&:hover
			background: var(--theme-color-alt)
</style>
