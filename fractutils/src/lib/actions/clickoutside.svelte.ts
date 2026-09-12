import type { ActionReturn } from 'svelte/action';

interface Attributes {
	onclickoutside?: (e: CustomEvent<void>) => void;
	onescape?: (e: CustomEvent<void>) => void;
}

type Callback = () => unknown;

export function clickOutsideAction(
	node: HTMLElement,
	callback?: Callback
): ActionReturn<{}, Attributes> {
	const close = () => {
		callback?.();
	};

	const handleClick = (event: Event) => {
		if (event.target !== null && !node.contains(event.target as Node)) {
			node.dispatchEvent(new CustomEvent('clickoutside'));
			close();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;

		node.dispatchEvent(new CustomEvent('escape'));
		close();
	};

	document.addEventListener('click', handleClick, true);
	document.addEventListener('keydown', handleKeydown, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('keydown', handleKeydown, true);
		}
	};
}
