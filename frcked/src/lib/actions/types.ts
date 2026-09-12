/**
 * Types and callback definitions for modern Svelte 5 attachments in frcked.
 */

/* -------------------------------------------------------------------------- */
/*                                   Resize                                   */
/* -------------------------------------------------------------------------- */

export type ResizeAxis = 'x' | 'y' | 'both';

export type ResizeSide =
	| 'left'
	| 'right'
	| 'top'
	| 'bottom'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right';

/**
 * Interactive Resizing detail emitted during drag/keyboard resizing.
 */
export interface ResizableDetail {
	width: number;
	height: number;
	deltaX: number;
	deltaY: number;
	isDragging: boolean;
	collapsed: boolean;
	axis: ResizeAxis;
	side: ResizeSide;
	target?: HTMLElement | null;
	event?: PointerEvent | KeyboardEvent;
}

export interface ResizableOptions {
	/**
	 * Which axis to resize:
	 * - 'x': width only (horizontal, e.g. sidebar rail)
	 * - 'y': height only (vertical, e.g. bottom panel / drawer rail)
	 * - 'both': width and height (e.g. card / window corner)
	 * @default 'x'
	 */
	axis?: ResizeAxis;

	/**
	 * Which side the rail/handle is located on:
	 * - 'right': dragging right makes it wider (+dx)
	 * - 'left': dragging left makes it wider (-dx)
	 * - 'bottom': dragging down makes it taller (+dy)
	 * - 'top': dragging up makes it taller (-dy)
	 * - 'bottom-right', etc. for 2D corner resizing
	 * @default 'right' (or 'bottom' if axis is 'y')
	 */
	side?: ResizeSide;

	/** Starting primary dimension in px (shorthand). Default 280 (width) or 200 (height). */
	initial?: number;
	/** Starting width in px. */
	initialWidth?: number;
	/** Starting height in px. */
	initialHeight?: number;

	/** Minimum primary dimension in px (shorthand). Default 120. */
	min?: number;
	/** Maximum primary dimension in px (shorthand). Default 800. */
	max?: number;

	/** Minimum width in px. */
	minWidth?: number;
	/** Maximum width in px. */
	maxWidth?: number;

	/** Minimum height in px. */
	minHeight?: number;
	/** Maximum height in px. */
	maxHeight?: number;

	/** Keyboard arrow key nudge step in px. Default 16. Shift+Arrow nudges 4x. */
	step?: number;

	/**
	 * If set, dragging below this threshold snaps the dimension to 0 (collapsed).
	 * Useful for sidebars and collapsible drawers.
	 */
	collapseBelow?: number;

	/**
	 * If provided, automatically persists the dimension in localStorage under this key.
	 */
	storageKey?: string;

	/**
	 * Name of CSS custom property to export via `cssVar`, e.g. '--sidebar-width'.
	 */
	varName?: string;

	/**
	 * Explicit target element or selector to apply width/height to.
	 * When used on a rail element, this determines which element is resized.
	 */
	target?: HTMLElement | string | null;

	/** Whether resizing is active. @default true */
	enabled?: boolean;

	/** Callbacks */
	onResize?: (detail: ResizableDetail) => void;
	onResizeStart?: (detail: ResizableDetail) => void;
	onResizeEnd?: (detail: ResizableDetail) => void;
	onCollapse?: (collapsed: boolean) => void;
}

export interface ResizeRailOptions extends ResizableOptions {
	/**
	 * Whether to automatically style the rail element with cursor and touch-action.
	 * @default true
	 */
	applyStyles?: boolean;
}

/* -------------------------------------------------------------------------- */
/*                            ResizeObserver Types                            */
/* -------------------------------------------------------------------------- */

export interface ResizeObserverDetail {
	observer: ResizeObserver;
	entry: ResizeObserverEntry;
	width: number;
	height: number;
	borderBoxWidth?: number;
	borderBoxHeight?: number;
}

export interface ResizeObserverOptions {
	enabled?: boolean;
	box?: ResizeObserverBoxOptions;
}

export type ResizeObserverCallback = (detail: ResizeObserverDetail) => void;

// Legacy aliases
export type ResizeDetail = ResizeObserverDetail;
export type ResizeOptions = ResizeObserverOptions;
export type ResizeCallback = ResizeObserverCallback;

export interface ResizeAttributes {
	'onresized'?: (event: CustomEvent<ResizeObserverDetail>) => void;
	'onresizing'?: (event: CustomEvent<ResizableDetail>) => void;
}

/* -------------------------------------------------------------------------- */
/*                                Click Outside                               */
/* -------------------------------------------------------------------------- */

export interface ClickOutsideDetail {
	event: MouseEvent | PointerEvent | TouchEvent | KeyboardEvent;
	target: EventTarget | null;
}

export interface ClickOutsideOptions {
	enabled?: boolean;
	capture?: boolean;
	events?: Array<'pointerdown' | 'mousedown' | 'click' | 'touchstart'>;
	escape?: boolean;
	exclude?: Array<HTMLElement | string | null | undefined>;
}

export type ClickOutsideCallback = (detail: ClickOutsideDetail) => void;

export interface ClickOutsideAttributes {
	'onclickoutside'?: (event: CustomEvent<ClickOutsideDetail>) => void;
	'onescape'?: (event: CustomEvent<ClickOutsideDetail>) => void;
}

/* -------------------------------------------------------------------------- */
/*                                  Intersect                                 */
/* -------------------------------------------------------------------------- */

export interface IntersectDetail {
	observer: IntersectionObserver;
	entry: IntersectionObserverEntry;
	isIntersecting: boolean;
	intersectionRatio: number;
}

export interface IntersectOptions {
	enabled?: boolean;
	root?: Element | Document | null;
	rootMargin?: string;
	threshold?: number | number[];
	once?: boolean;
}

export type IntersectCallback = (detail: IntersectDetail) => void;

export interface IntersectAttributes {
	'onintersect'?: (event: CustomEvent<IntersectDetail>) => void;
}
