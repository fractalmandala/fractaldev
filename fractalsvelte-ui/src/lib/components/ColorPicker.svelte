<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		/** Controlled hex color (#rgb or #rrggbb). */
		value?: string;
		/** Uncontrolled initial color. */
		defaultValue?: string;
		/** Preset swatches rendered under the area. */
		swatches?: string[];
		disabled?: boolean;
		id?: string;
		ariaLabel?: string;
		onValueChange?: (value: string) => void;
		class?: string;
	}

	let {
		value,
		defaultValue = '#3b82f6',
		swatches = [],
		disabled = false,
		id,
		ariaLabel = 'Color picker',
		onValueChange,
		class: className
	}: Props = $props();

	let internal = $state(untrack(() => defaultValue));
	const controlled = $derived(value !== undefined);
	// Narrowed inline so `current` is a string, not string | undefined.
	const current = $derived(value === undefined ? internal : value);

	interface Hsv {
		h: number; // 0–360
		s: number; // 0–1
		v: number; // 0–1
	}

	function hexToRgb(hex: string): [number, number, number] | null {
		let clean = hex.replace('#', '').trim();
		if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
		if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
		const num = parseInt(clean, 16);
		return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
	}

	function rgbToHex(r: number, g: number, b: number): string {
		const to = (x: number) =>
			Math.round(Math.max(0, Math.min(255, x)))
				.toString(16)
				.padStart(2, '0');
		return `#${to(r)}${to(g)}${to(b)}`;
	}

	function rgbToHsv(r: number, g: number, b: number): Hsv {
		const rr = r / 255;
		const gg = g / 255;
		const bb = b / 255;
		const max = Math.max(rr, gg, bb);
		const min = Math.min(rr, gg, bb);
		const d = max - min;
		let h = 0;
		if (d !== 0) {
			if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
			else if (max === gg) h = (bb - rr) / d + 2;
			else h = (rr - gg) / d + 4;
			h *= 60;
		}
		return { h, s: max === 0 ? 0 : d / max, v: max };
	}

	function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
		const c = v * s;
		const hp = h / 60;
		const x = c * (1 - Math.abs((hp % 2) - 1));
		let r = 0;
		let g = 0;
		let b = 0;
		if (hp < 1) [r, g, b] = [c, x, 0];
		else if (hp < 2) [r, g, b] = [x, c, 0];
		else if (hp < 3) [r, g, b] = [0, c, x];
		else if (hp < 4) [r, g, b] = [0, x, c];
		else if (hp < 5) [r, g, b] = [x, 0, c];
		else [r, g, b] = [c, 0, x];
		const m = v - c;
		return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
	}

	// Local HSV is authoritative during a drag; $effect re-syncs it whenever the
	// value changes from outside (or from a swatch/hex commit) between drags.
	let hsv = $state<Hsv>(
		untrack(() => {
			const rgb = hexToRgb(defaultValue);
			return rgb ? rgbToHsv(rgb[0], rgb[1], rgb[2]) : { h: 0, s: 0, v: 0 };
		})
	);
	let dragging = $state(false);

	$effect(() => {
		if (dragging) return;
		const rgb = hexToRgb(current);
		if (rgb) hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
	});

	function commit(next: string) {
		if (!controlled) internal = next;
		onValueChange?.(next);
	}

	function emitHsv(next: Hsv) {
		hsv = next;
		const [r, g, b] = hsvToRgb(next);
		commit(rgbToHex(r, g, b));
	}

	// ── Saturation/brightness area (2D pointer + arrow keys) ──
	let areaEl = $state<HTMLDivElement | null>(null);

	function applyPointer(e: PointerEvent) {
		const el = areaEl;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const s = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
		const v = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / rect.height));
		emitHsv({ ...hsv, s, v });
	}

	function onAreaPointerdown(e: PointerEvent) {
		if (disabled) return;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		dragging = true;
		applyPointer(e);
	}

	function onAreaPointermove(e: PointerEvent) {
		if (!dragging) return;
		applyPointer(e);
	}

	function onAreaPointerup(e: PointerEvent) {
		dragging = false;
		(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
	}

	const STEP = 0.05;
	function onAreaKeydown(e: KeyboardEvent) {
		if (disabled) return;
		const fine = e.shiftKey ? STEP * 4 : STEP;
		if (e.key === 'ArrowLeft') emitHsv({ ...hsv, s: Math.max(0, hsv.s - fine) });
		else if (e.key === 'ArrowRight') emitHsv({ ...hsv, s: Math.min(1, hsv.s + fine) });
		else if (e.key === 'ArrowUp') emitHsv({ ...hsv, v: Math.min(1, hsv.v + fine) });
		else if (e.key === 'ArrowDown') emitHsv({ ...hsv, v: Math.max(0, hsv.v - fine) });
		else return;
		e.preventDefault();
	}

	// ── Hue (native range under a drawn track, so keyboard comes free) ──
	function onHueInput(e: Event) {
		if (disabled) return;
		const h = Number((e.target as HTMLInputElement).value);
		emitHsv({ ...hsv, h });
	}

	// ── Hex field (draft keeps partial input editable; valid input commits live) ──
	let hexDraft = $state<string | null>(null);

	const hexDisplay = $derived(hexDraft ?? current);

	function onHexInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		hexDraft = raw;
		const rgb = hexToRgb(raw);
		if (rgb && !disabled) commit(rgbToHex(rgb[0], rgb[1], rgb[2]));
	}

	function onHexChange(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		const rgb = hexToRgb(raw);
		if (rgb && !disabled) commit(rgbToHex(rgb[0], rgb[1], rgb[2]));
		hexDraft = null;
	}

	function commitSwatch(sw: string) {
		if (disabled) return;
		const rgb = hexToRgb(sw);
		if (!rgb) return;
		hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]);
		commit(rgbToHex(rgb[0], rgb[1], rgb[2]));
	}

	const isActive = (sw: string) => sw.toLowerCase() === current.toLowerCase();
</script>

<div class={className} id={id} data-slot="colorpicker" data-disabled={disabled || undefined}>
	<div
		bind:this={areaEl}
		data-slot="colorpicker-area"
		style={`background: linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`}
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-label="Saturation and brightness"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(hsv.s * 100)}
		aria-valuetext={`saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
		onpointerdown={onAreaPointerdown}
		onpointermove={onAreaPointermove}
		onpointerup={onAreaPointerup}
		onpointercancel={onAreaPointerup}
		onkeydown={onAreaKeydown}
	>
		<span
			data-slot="colorpicker-area-thumb"
			style={`left: ${hsv.s * 100}%; top: ${(1 - hsv.v) * 100}%; background: ${current}`}
		></span>
	</div>

	<div data-slot="colorpicker-hue">
		<span data-slot="colorpicker-hue-track" aria-hidden="true"></span>
		<span
			data-slot="colorpicker-hue-thumb"
			aria-hidden="true"
			style={`left: ${(hsv.h / 360) * 100}%; background: hsl(${hsv.h} 100% 50%)`}
		></span>
		<input
			data-slot="colorpicker-hue-input"
			type="range"
			min="0"
			max="360"
			step="1"
			value={Math.round(hsv.h)}
			aria-label="Hue"
			disabled={disabled}
			oninput={onHueInput}
		/>
	</div>

	<div data-slot="colorpicker-row">
		<span data-slot="colorpicker-preview" style={`background: ${current}`} aria-hidden="true"></span>
		<input
			data-slot="colorpicker-hex"
			type="text"
			spellcheck="false"
			maxlength={7}
			aria-label="Hex color"
			value={hexDisplay}
			disabled={disabled}
			oninput={onHexInput}
			onchange={onHexChange}
		/>
	</div>

	{#if swatches.length}
		<div data-slot="colorpicker-swatches">
			{#each swatches as sw (sw)}
				<button
					type="button"
					data-slot="colorpicker-swatch"
					style={`background: ${sw}`}
					data-active={isActive(sw) || undefined}
					aria-label="Set color {sw}"
					aria-pressed={isActive(sw)}
					disabled={disabled}
					onclick={() => commitSwatch(sw)}
				></button>
			{/each}
		</div>
	{/if}
</div>
