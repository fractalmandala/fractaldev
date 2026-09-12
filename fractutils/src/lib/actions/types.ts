/**
 * Types and callback definitions for the modern Svelte 5 resize attachment.
 */

export interface ResizeDetail {
	observer: ResizeObserver;
	entry: ResizeObserverEntry;
	width: number;
	height: number;
	borderBoxWidth?: number;
	borderBoxHeight?: number;
}

export interface ResizeOptions {
	enabled?: boolean;
	box?: ResizeObserverBoxOptions;
}

export type ResizeCallback = (detail: ResizeDetail) => void;

export interface ResizeAttributes {
	'onresized'?: (event: CustomEvent<ResizeDetail>) => void;
}


