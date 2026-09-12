// Shared-layout morph: the trigger box grows into the panel and back, one
// surface. Shared by the trigger and content so the morph never snaps.
export const MORPH = { type: 'spring', duration: 0.5, bounce: 0.22 } as const;

/** Staggered entrance for the item list. */
export const LIST = {
	hidden: {},
	show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } }
} as const;

/** Per-item entrance. */
export const ITEM = {
	hidden: { opacity: 0, y: -6, filter: 'blur(3px)' },
	show: { opacity: 1, y: 0, filter: 'blur(0px)' }
} as const;
