import { EASE_OUT } from '../../ease.js';

// Local springs keep the accordion's connected groups moving together while
// avoiding scale projection on text-heavy row contents.
// Gap spring: must not overshoot y — positive y overshoot drifts items below
// their .75rem resting point and briefly overlaps the next item.
export const ROW_TRANSITION = { type: 'spring', duration: 0.55, bounce: 0.38 } as const;

export const CONTENT_OPEN_TRANSITION = { type: 'spring', duration: 0.58, bounce: 0.32 } as const;

export const CONTENT_CLOSE_TRANSITION = { type: 'spring', duration: 0.46, bounce: 0.26 } as const;

export const DESCRIPTION_TRANSITION = { duration: 0.18, ease: EASE_OUT } as const;

export const CHEVRON_TRANSITION = { type: 'spring', duration: 0.42, bounce: 0.28 } as const;
