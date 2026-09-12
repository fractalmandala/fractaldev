import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const storedAnimState = browser ? JSON.parse(localStorage.getItem('animState') || 'true') : true;
export const animState = writable(storedAnimState);
export function setAnimEnabled(enabled: boolean) {
	animState.set(enabled);

	if (browser) {
		localStorage.setItem('animState', JSON.stringify(enabled));
	}
}
export function toggleAnim() {
	if (browser) {
		animState.update((mode) => {
			const newMode = !mode;
			localStorage.setItem('animState', JSON.stringify(newMode));
			return newMode;
		});
	}
}
