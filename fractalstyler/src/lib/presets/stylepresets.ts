export const presetAxes = {
	layout: ['zero','tight', 'comfortable', 'sprawling'],
	shape: ['round', 'curved', 'pro', 'sharp','zero'],
	color: ['clean','vibrant','zero'],
	motion: ['reduced', 'heavy', 'active', 'springy'],
	// Shell composition — a featural value naming the OPTIONAL regions present:
	// l = left rail (nav), r = right rail (TOC), f = footer, a = the constrained
	// app-content article (docs column) in place of the full-bleed PageShell.
	// Absent = full (lrf); c = content-only (none). This is the sanctioned set
	// (the paribhāṣā): the full cube is NOT exposed — e.g. TOC-without-nav is
	// deliberately absent. Letters stay disjoint so substring matching is safe.
	shell: ['lrf', 'lrfa', 'lr', 'lra', 'lf', 'lfa', 'l', 'la', 'f', 'fa', 'c', 'ca']
} as const;

export const presetDefaults = {
	layout: 'zero',
	shape: 'zero',
	color: 'zero',
	motion: 'active',
	shell: 'lrf'
} as const;

export type Mode = 'light' | 'dark';

export type PresetAxis = keyof typeof presetAxes;

export const STORAGE_KEY = 'futils.presets';
export const MODE_KEY = 'futils.mode';

/** Current value of every axis. Read it; mutate through setPreset. */
export const presetState: Record<PresetAxis, string> = { ...presetDefaults };

type Listener = (axis: PresetAxis, value: string) => void;
const listeners = new Set<Listener>();

/** Subscribe to preset changes — for hand-rolled pickers. Returns an unsubscribe. */
export function onPresetChange(fn: Listener): () => void {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

export function isDefault(axis: PresetAxis, value: string): boolean {
	return value === presetDefaults[axis];
}

function isValid(axis: PresetAxis, value: string): boolean {
	return (presetAxes[axis] as readonly string[]).includes(value);
}

/** Default values remove the attribute — absent IS the default. */
function applyAttr(axis: PresetAxis, value: string): void {
	const root = document.documentElement;
	if (isDefault(axis, value)) root.removeAttribute(`data-${axis}`);
	else root.setAttribute(`data-${axis}`, value);
}

function persist(): void {
	const nonDefaults: Record<string, string> = {};
	for (const axis of Object.keys(presetAxes) as PresetAxis[]) {
		if (!isDefault(axis, presetState[axis])) nonDefaults[axis] = presetState[axis];
	}
	try {
		if (Object.keys(nonDefaults).length)
			localStorage.setItem(STORAGE_KEY, JSON.stringify(nonDefaults));
		else localStorage.removeItem(STORAGE_KEY);
	} catch {
		/* storage unavailable — presets stay session-local */
	}
}

/** Read the saved blob and apply it. Call once, on load. */
export function initPresets(): void {
	if (typeof document === 'undefined') return;
	try {
		const savedMode = localStorage.getItem(MODE_KEY);
		if (savedMode === 'dark' || savedMode === 'light') setMode(savedMode);
	} catch {
		/* storage unavailable — defaults stand */
	}
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
		for (const axis of Object.keys(presetAxes) as PresetAxis[]) {
			// A page/layout scope outranks the stored value while it is active.
			if (scoped.has(axis)) continue;
			const v = saved[axis];
			if (v && isValid(axis, v)) {
				presetState[axis] = v;
				applyAttr(axis, v);
				for (const fn of listeners) fn(axis, v);
			}
		}
	} catch {
		/* corrupt blob — defaults stand */
	}
}

/** Set one axis. Ignores values outside the axis. */
export function setPreset(axis: PresetAxis, value: string): void {
	if (typeof document === 'undefined') return;
	if (!isValid(axis, value)) return;
	presetState[axis] = value;
	applyAttr(axis, value);
	persist();
	for (const fn of listeners) fn(axis, value);
}

export function getPreset(axis: PresetAxis): string {
	return presetState[axis];
}

/** Axes currently held by a page/layout scope — initPresets must not clobber these. */
const scoped = new Set<PresetAxis>();

/**
 * Set an axis for the lifetime of a page or layout, WITHOUT persisting it.
 *
 * This is the per-page form of `setPreset`: the user's saved choice is left
 * untouched and restored when the scope ends. Returns the restore function, so
 * in Svelte it is simply:
 *
 *   $effect(() => scopePreset('shell', 'c'));
 *
 * — the returned function becomes the effect's cleanup and runs on navigate.
 */
export function scopePreset(axis: PresetAxis, value: string): () => void {
	if (typeof document === 'undefined') return () => {};
	if (!isValid(axis, value)) return () => {};

	const previous = presetState[axis];
	scoped.add(axis);
	presetState[axis] = value;
	applyAttr(axis, value);
	for (const fn of listeners) fn(axis, value);

	return () => {
		scoped.delete(axis);
		presetState[axis] = previous;
		applyAttr(axis, previous);
		for (const fn of listeners) fn(axis, previous);
	};
}

/** Cycle an axis to its next value — what a single toggle button wants. */
export function cyclePreset(axis: PresetAxis): string {
	const values = presetAxes[axis] as readonly string[];
	const next = values[(values.indexOf(presetState[axis]) + 1) % values.length];
	setPreset(axis, next);
	return next;
}

/** Inline head script — stamps saved presets before first paint (no flicker).
 *  Axes and defaults are derived from the constants above — one source, no
 *  second hardcoded copy to drift. */
export function getPresetScript(): string {
	const axes = JSON.stringify(presetAxes).replaceAll('"', "'");
	const defs = JSON.stringify(presetDefaults).replaceAll('"', "'");
	return `(function(){try{var v=${axes};var d=${defs};var r=document.documentElement;var s=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');for(var k in v){var val=s[k];if(val&&val!==d[k])r.setAttribute('data-'+k,val);}var m=localStorage.getItem('${MODE_KEY}');if(m==='dark'||m==='light')r.setAttribute('data-mode',m);}catch(e){}})();`;
}

/**
 * Set the colour mode. Persists, so it survives reload — light/dark is the most
 * basic thing a user toggles and it has no business forgetting itself.
 *
 * Pass null to clear the choice and fall back to the OS preference.
 */
export function setMode(mode: Mode | null): void {
	if (typeof document === 'undefined') return;
	const root = document.documentElement;
	if (mode === null) {
		root.removeAttribute('data-mode');
		try {
			localStorage.removeItem(MODE_KEY);
		} catch {
			/* storage unavailable */
		}
	} else {
		root.setAttribute('data-mode', mode);
		try {
			localStorage.setItem(MODE_KEY, mode);
		} catch {
			/* storage unavailable — the choice stays session-local */
		}
	}
	for (const fn of modeListeners) fn(getMode());
}

/** The active mode. Falls back to the OS preference when nothing is chosen. */
export function getMode(): Mode {
	if (typeof document === 'undefined') return 'light';
	const attr = document.documentElement.getAttribute('data-mode');
	if (attr === 'dark' || attr === 'light') return attr;
	return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
}

/** True when the page is currently rendering dark. */
export function isDark(): boolean {
	return getMode() === 'dark';
}

export function toggleMode(): Mode {
	const next: Mode = getMode() === 'dark' ? 'light' : 'dark';
	setMode(next);
	return next;
}

type ModeListener = (mode: Mode) => void;
const modeListeners = new Set<ModeListener>();

/** Subscribe to mode changes — however they were made. Returns an unsubscribe. */
export function onModeChange(fn: ModeListener): () => void {
	modeListeners.add(fn);
	return () => modeListeners.delete(fn);
}
