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
	toggleMode as coreToggleMode,
	onPresetChange,
	onModeChange,
	getMode,
	presetState,
	type Mode,
	type PresetAxis
} from './stylepresets.js';

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

export function toggleMode(): Mode {
	const next = coreToggleMode();
	return next;
}