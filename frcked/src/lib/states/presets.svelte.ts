// Svelte wrapper over the framework-free runtime in presets.core.ts.
//
// The logic lives there so the vanilla CSS distribution and the Svelte package
// share one implementation. All this adds is a reactive mirror of the state so
// the bundled pickers re-render.

import {
	presetAxes,
	presetDefaults,
	initPresets as coreInit,
	setPreset as coreSet,
	setMode as coreSetMode,
	onPresetChange,
	onModeChange,
	getMode,
	presetState,
	type Mode,
	type PresetAxis
} from './stylepresets.js';

import { startViewTransition } from '$lib/utilities/viewTransitions';

// Re-exported unchanged. Everything that MUTATES state is wrapped below so the
// reactive mirror stays in step; everything else passes straight through.
export {
	presetAxes,
	presetDefaults,
	getPreset,
	getMode,
	isDark,
	cyclePreset,
	scopePreset,
	getPresetScript,
	onModeChange,
	onPresetChange,
	type Mode,
	type PresetAxis
} from './stylepresets.js';

/**
 * Reactive mirror of the whole runtime — the four preset axes plus `mode` and
 * `theme`. Read it straight in a template:
 *
 *   {#if presets.mode === 'dark'} … {/if}
 *
 * It stays correct however the change was made: a picker, setTheme(), the OS
 * preference at load, or another component entirely.
 */
export const presets = $state<
	Record<PresetAxis, string> & { mode: Mode; theme: string | null }
>({ ...presetDefaults, mode: 'light', theme: null });

// Keep the mirror in step with the core, however the core was driven.
onPresetChange((axis, value) => {
	presets[axis] = value;
});
onModeChange((mode) => {
	presets.mode = mode;
});

function sync(): void {
	for (const axis of Object.keys(presetAxes) as PresetAxis[]) presets[axis] = presetState[axis];
	presets.mode = getMode();
}

export function initPresets(): void {
	coreInit();
	sync();
}

export function setPreset(axis: PresetAxis, value: string): void {
	coreSet(axis, value);
}

export function setMode(mode: Mode | null): void {
	coreSetMode(mode);
}

/**
 * Flip light/dark.
 *
 * The swap runs inside a view transition so the `[data-mode-switch]` wipe in
 * styles/_08_own.sass has something to animate — without a transition the
 * browser just repaints and the ::view-transition pseudo-elements never exist.
 * The attribute scopes that wipe to mode changes, so page navigations keep
 * their own transition; it is removed once the animation settles.
 *
 * startViewTransition() already falls back to running the callback directly
 * when the API is unsupported, animations are off, or the user prefers reduced
 * motion, so the mode still changes in every case.
 *
 * Returns the mode being switched to. The DOM lands a frame later (the API
 * snapshots first), so read `presets.mode` if you need the applied value.
 */
export function toggleMode(): Mode {
	const next: Mode = getMode() === 'dark' ? 'light' : 'dark';

	if (typeof document === 'undefined') {
		coreSetMode(next);
		return next;
	}

	const root = document.documentElement;
	root.setAttribute('data-mode-switch', '');

	void startViewTransition(() => {
		coreSetMode(next);
	}).finally(() => {
		root.removeAttribute('data-mode-switch');
	});

	return next;
}