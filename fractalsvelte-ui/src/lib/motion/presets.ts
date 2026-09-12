import type { MotionTransition } from '@humanspeak/svelte-motion';

export const springFeedback: MotionTransition = {
	type: 'spring',
	stiffness: 400,
	damping: 25
};

export const springPresence: MotionTransition = {
	type: 'spring',
	stiffness: 300,
	damping: 25
};

export const tweenContent: MotionTransition = {
	duration: 0.3,
	ease: 'easeOut'
};

export const fadeUp = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 8 }
};
