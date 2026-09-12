/**
 * Drag-to-resize panels, for sidebars whose width is a grid column.
 *
 * Pairs with the layout you already write — the store owns a number, and
 * `cssVar` hands it to the grid:
 *
 *   .shell { grid-template-columns: var(--sidebar-width) minmax(0, 1fr); }
 *
 * Uses Pointer Events with capture rather than document-level mousemove, so a
 * drag keeps tracking past the window edge and works for touch and pen. Also
 * keyboard-operable, which drag handles almost never are.
 */

export interface ResizableOptions {
	/** Starting width in px. Default 280. */
	initial?: number;
	/** Default 180. */
	min?: number;
	/** Default 560. */
	max?: number;
	/** Which side the panel sits on — decides which way "wider" is. Default 'left'. */
	side?: 'left' | 'right';
	/** Persist across reloads under this localStorage key. */
	storageKey?: string;
	/** px per arrow-key press. Default 16. */
	step?: number;
	/**
	 * Dragging narrower than this snaps to 0 and sets `collapsed`. Off by
	 * default; set e.g. 120 to let a hard drag tuck the panel away.
	 */
	collapseBelow?: number;
	/** Name of the custom property `cssVar` emits. Default '--sidebar-width'. */
	varName?: string;
}

class Resizable {
	#min: number;
	#max: number;
	#side: 'left' | 'right';
	#step: number;
	#collapseBelow: number | undefined;
	#storageKey: string | undefined;
	#varName: string;
	#initial: number;

	width = $state(280);

	/** True while a drag is in flight — for a `.dragging` class on the shell. */
	dragging = $state(false);

	/** Set when a drag crossed `collapseBelow`. `width` reads 0. */
	collapsed = $state(false);

	constructor(options: ResizableOptions = {}) {
		const {
			initial = 280,
			min = 180,
			max = 560,
			side = 'left',
			step = 16,
			collapseBelow,
			storageKey,
			varName = '--sidebar-width'
		} = options;

		this.#min = min;
		this.#max = max;
		this.#side = side;
		this.#step = step;
		this.#collapseBelow = collapseBelow;
		this.#storageKey = storageKey;
		this.#varName = varName;
		this.#initial = initial;
		this.width = initial;

		if (typeof window === 'undefined' || !storageKey) return;

		try {
			const stored = Number(localStorage.getItem(storageKey));

			// Guard against a hand-edited or stale value putting the panel
			// somewhere unusable.
			if (Number.isFinite(stored) && stored > 0) this.width = this.#clamp(stored);
			else if (stored === 0) this.collapsed = true;
		} catch {
			/* private mode — the width just will not persist */
		}
	}

	#clamp(value: number): number {
		return Math.min(this.#max, Math.max(this.#min, value));
	}

	#persist(): void {
		if (!this.#storageKey) return;

		try {
			localStorage.setItem(this.#storageKey, String(this.collapsed ? 0 : this.width));
		} catch {
			/* private mode or quota */
		}
	}

	/** Width for the grid column — 0 while collapsed. */
	get current(): number {
		return this.collapsed ? 0 : this.width;
	}

	/** `style={sidebar.cssVar}` on the shell element. */
	get cssVar(): string {
		return `${this.#varName}:${this.current}px`;
	}

	/** ARIA for the handle. Spread it on, or let `resizeHandle` apply it. */
	get separator() {
		return {
			role: 'separator' as const,
			tabindex: 0,
			'aria-orientation': 'vertical' as const,
			'aria-valuenow': Math.round(this.current),
			'aria-valuemin': this.#min,
			'aria-valuemax': this.#max,
			'aria-label': 'Resize panel'
		};
	}

	set(value: number): void {
		if (this.#collapseBelow !== undefined && value < this.#collapseBelow) {
			this.collapsed = true;
			this.#persist();

			return;
		}

		this.collapsed = false;
		this.width = this.#clamp(value);
		this.#persist();
	}

	nudge(delta: number): void {
		this.set((this.collapsed ? this.#min : this.width) + delta);
	}

	reset(): void {
		this.collapsed = false;
		this.width = this.#clamp(this.#initial);
		this.#persist();
	}

	toggle(): void {
		this.collapsed = !this.collapsed;
		this.#persist();
	}

	/** @internal — used by the `resizeHandle` action. */
	get config() {
		return { side: this.#side, step: this.#step, min: this.#min, max: this.#max };
	}
}

export interface HandleAction {
	destroy(): void;
}

/**
 * The drag handle. Put it on the grip element beside the panel.
 *
 * ```svelte
 * <aside style="width: {sidebar.current}px">…</aside>
 * <div class="grip" use:resizeHandle={sidebar} {...sidebar.separator}></div>
 * ```
 *
 * Drag to resize, arrow keys to nudge, Home/End for min/max, double-click to
 * reset, Enter to collapse and restore.
 */
export function resizeHandle(node: HTMLElement, store: Resizable): HandleAction {
	let startX = 0;
	let startWidth = 0;
	let pointer = -1;

	const { side, step, min, max } = store.config;
	// On a right-hand panel, dragging right makes it narrower.
	const sign = side === 'left' ? 1 : -1;

	const onPointerDown = (event: PointerEvent): void => {
		if (event.button !== 0) return;

		pointer = event.pointerId;
		startX = event.clientX;
		startWidth = store.current || min;
		store.dragging = true;

		// Capture keeps the drag alive past the window edge and over iframes.
		node.setPointerCapture(pointer);
		// Stop the drag from selecting text across the page.
		event.preventDefault();
	};

	const onPointerMove = (event: PointerEvent): void => {
		if (!store.dragging || event.pointerId !== pointer) return;

		store.set(startWidth + (event.clientX - startX) * sign);
	};

	const onPointerUp = (event: PointerEvent): void => {
		if (event.pointerId !== pointer) return;

		store.dragging = false;
		pointer = -1;

		if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
	};

	const onKeyDown = (event: KeyboardEvent): void => {
		const amount = event.shiftKey ? step * 4 : step;

		switch (event.key) {
			case 'ArrowLeft':
				store.nudge(-amount * sign);
				break;
			case 'ArrowRight':
				store.nudge(amount * sign);
				break;
			case 'Home':
				store.set(min);
				break;
			case 'End':
				store.set(max);
				break;
			case 'Enter':
			case ' ':
				store.toggle();
				break;
			default:
				return;
		}

		event.preventDefault();
	};

	const onDoubleClick = (): void => store.reset();

	node.addEventListener('pointerdown', onPointerDown);
	node.addEventListener('pointermove', onPointerMove);
	node.addEventListener('pointerup', onPointerUp);
	node.addEventListener('pointercancel', onPointerUp);
	node.addEventListener('keydown', onKeyDown);
	node.addEventListener('dblclick', onDoubleClick);

	if (!node.style.touchAction) node.style.touchAction = 'none';
	if (!node.style.cursor) node.style.cursor = 'col-resize';

	return {
		destroy() {
			node.removeEventListener('pointerdown', onPointerDown);
			node.removeEventListener('pointermove', onPointerMove);
			node.removeEventListener('pointerup', onPointerUp);
			node.removeEventListener('pointercancel', onPointerUp);
			node.removeEventListener('keydown', onKeyDown);
			node.removeEventListener('dblclick', onDoubleClick);
		}
	};
}

/**
 * ```ts
 * const sidebar = resizable({ initial: 280, min: 200, max: 520, storageKey: 'nav-w' });
 * ```
 */
export function resizable(options?: ResizableOptions): Resizable {
	return new Resizable(options);
}
