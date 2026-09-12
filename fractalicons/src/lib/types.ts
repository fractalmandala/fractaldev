export interface IconData {
	name: string;
	set: string;
	viewBox: string;
	body: string;
}

export type IconSize = number | string;

/** When an animated icon plays its animation. See `Icon`'s `trigger` prop. */
export type AnimationTrigger = 'load' | 'hover' | 'click' | 'visible' | 'loop' | 'none';
