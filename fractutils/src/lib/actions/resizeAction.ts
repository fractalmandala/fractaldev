import type { Attachment } from 'svelte/attachments';
import type { Action } from 'svelte/action';
import type {
	ResizeDetail,
	ResizeOptions,
	ResizeCallback,
	ResizeAttributes
} from './types.js';

export * from './types.js';

/**
 * Modern Svelte 5 `{@attach}` attachment for tracking element resizing via `ResizeObserver`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { resize } from '$lib/actions/resizeAction.js';
 *   let width = $state(0);
 * </script>
 *
 * <div {@attach resize((d) => width = d.width)}>
 *   Width: {width}px
 * </div>
 * ```
 */
export function resize(
	callback: ResizeCallback,
	options: ResizeOptions = {}
): Attachment<HTMLElement> {
	return (element: HTMLElement) => {
		if (options.enabled === false) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const width = entry.contentRect.width;
				const height = entry.contentRect.height;
				const borderBoxSize = entry.borderBoxSize?.[0];

				callback({
					observer,
					entry,
					width,
					height,
					borderBoxWidth: borderBoxSize?.inlineSize,
					borderBoxHeight: borderBoxSize?.blockSize
				});
			}
		});

		observer.observe(element, { box: options.box ?? 'content-box' });

		return () => {
			observer.disconnect();
		};
	};
}

/**
 * Legacy Svelte action wrapper (for backwards compatibility with `use:resizeAction`).
 */
export const resizeAction: Action<HTMLElement, ResizeOptions | undefined, ResizeAttributes> = (
	node,
	options = {}
) => {
	let enabled = options?.enabled ?? true;

	const observer = new ResizeObserver((entries) => {
		if (!enabled) return;
		for (const entry of entries) {
			const width = entry.contentRect.width;
			const height = entry.contentRect.height;
			const borderBoxSize = entry.borderBoxSize?.[0];

			node.dispatchEvent(
				new CustomEvent<ResizeDetail>('resized', {
					detail: {
						observer,
						entry,
						width,
						height,
						borderBoxWidth: borderBoxSize?.inlineSize,
						borderBoxHeight: borderBoxSize?.blockSize
					}
				})
			);
		}
	});

	if (enabled) {
		observer.observe(node, { box: options?.box ?? 'content-box' });
	}

	return {
		update(newOptions) {
			enabled = newOptions?.enabled ?? true;
			observer.disconnect();
			if (enabled) {
				observer.observe(node, { box: newOptions?.box ?? 'content-box' });
			}
		},
		destroy() {
			observer.disconnect();
		}
	};
};

export default resize;


