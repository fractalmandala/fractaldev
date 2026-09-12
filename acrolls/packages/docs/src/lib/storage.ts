import { browser } from './browser.js';

const PREFIX = 'acrolls-docs:open:';

/** Read persisted open-id map for a nav surface. */
export function readOpenState(storageKey: string): Record<string, boolean> {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(PREFIX + storageKey);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object') return {};
		const out: Record<string, boolean> = {};
		for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
			if (typeof v === 'boolean') out[k] = v;
		}
		return out;
	} catch {
		return {};
	}
}

/** Persist a single accordion id open/closed. */
export function writeOpenState(
	storageKey: string,
	id: string,
	open: boolean
): Record<string, boolean> {
	const next = { ...readOpenState(storageKey), [id]: open };
	if (!browser) return next;
	try {
		localStorage.setItem(PREFIX + storageKey, JSON.stringify(next));
	} catch {
		/* quota / private mode */
	}
	return next;
}

export function clearOpenState(storageKey: string) {
	if (!browser) return;
	try {
		localStorage.removeItem(PREFIX + storageKey);
	} catch {
		/* */
	}
}
