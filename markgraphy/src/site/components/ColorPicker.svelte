<script lang="ts">
	import { setCustomAccent } from '$site/lib/accents';

	let { value = '#ff3e00' }: { value?: string } = $props();

	let hex = $state(value);
	let hue = $state(12);
	let sat = $state(100);
	let bri = $state(100);

	let draggingSb = $state(false);
	let draggingHue = $state(false);

	function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
		s /= 100; v /= 100;
		const c = v * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = v - c;
		let r = 0, g = 0, b = 0;
		if (h < 60) { r = c; g = x; }
		else if (h < 120) { r = x; g = c; }
		else if (h < 180) { g = c; b = x; }
		else if (h < 240) { g = x; b = c; }
		else if (h < 300) { r = x; b = c; }
		else { r = c; b = x; }
		return [
			Math.round((r + m) * 255),
			Math.round((g + m) * 255),
			Math.round((b + m) * 255)
		];
	}

	function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
		r /= 255; g /= 255; b /= 255;
		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		const d = max - min;
		let h = 0;
		const s = max === 0 ? 0 : d / max;
		const v = max;
		if (d !== 0) {
			if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
			else if (max === g) h = ((b - r) / d + 2) * 60;
			else h = ((r - g) / d + 4) * 60;
		}
		return [h, s * 100, v * 100];
	}

	function rgbToHex(r: number, g: number, b: number): string {
		return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
	}

	function hexToRgb(hex: string): [number, number, number] | null {
		const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
	}

	function syncFromHsv() {
		const [r, g, b] = hsvToRgb(hue, sat, bri);
		hex = rgbToHex(r, g, b);
	}

	function syncFromHex() {
		const rgb = hexToRgb(hex);
		if (!rgb) return;
		[hue, sat, bri] = rgbToHsv(...rgb);
	}

	function apply() {
		setCustomAccent(hex);
	}

	function onSbDown(e: MouseEvent) {
		e.preventDefault();
		draggingSb = true;
		updateSb(e);
		const onMove = (ev: MouseEvent) => { if (draggingSb) updateSb(ev); };
		const onUp = () => {
			draggingSb = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	function updateSb(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		sat = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
		bri = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
		syncFromHsv();
	}

	function onHueDown(e: MouseEvent) {
		e.preventDefault();
		draggingHue = true;
		updateHue(e);
		const onMove = (ev: MouseEvent) => { if (draggingHue) updateHue(ev); };
		const onUp = () => {
			draggingHue = false;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	function updateHue(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		hue = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
		syncFromHsv();
	}

	function onHexInput(e: Event) {
		const v = '#' + (e.target as HTMLInputElement).value;
		if (/^#[a-f\d]{6}$/i.test(v)) {
			hex = v;
			syncFromHex();
		}
	}

	function onHexKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') apply();
	}

	function onNativePick(e: Event) {
		hex = (e.target as HTMLInputElement).value;
		syncFromHex();
	}
</script>

<div class="picker" onmousedown={(e) => e.stopPropagation()}>
	<!-- Saturation/Brightness square -->
	<div
		class="sb-square"
		style:background-color={`hsl(${hue}, 100%, 50%)`}
		onmousedown={onSbDown}
	>
		<div
			class="sb-handle"
			style:left={`${sat}%`}
			style:top={`${100 - bri}%`}
		></div>
	</div>

	<!-- Hue slider -->
	<div class="hue-track" onmousedown={onHueDown}>
		<div
			class="hue-handle"
			style:left={`${(hue / 360) * 100}%`}
		></div>
	</div>

	<!-- Hex input -->
	<div class="hex-row">
		<span class="hex-label">#</span>
		<input
			class="hex-input"
			type="text"
			value={hex.slice(1)}
			maxlength="6"
			oninput={onHexInput}
			onkeydown={onHexKeydown}
			spellcheck="false"
		/>
	</div>

	<!-- Set button -->
	<button class="set-btn" type="button" onclick={apply}>Set</button>

	<!-- Native color input (accessible fallback) -->
	<input
		class="native-picker"
		type="color"
		value={hex}
		oninput={onNativePick}
		aria-label="Custom accent color"
	/>
</div>

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 0.75rem;
		user-select: none;
	}

	.sb-square {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		cursor: crosshair;
		background-color: hsl(0, 100%, 50%);
		background-image:
			linear-gradient(to right, #fff, transparent),
			linear-gradient(to top, #000, transparent);
	}

	.sb-handle {
		position: absolute;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid #fff;
		box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.hue-track {
		position: relative;
		width: 100%;
		height: 14px;
		border-radius: 7px;
		cursor: pointer;
		background: linear-gradient(
			to right,
			hsl(0,100%,50%),
			hsl(60,100%,50%),
			hsl(120,100%,50%),
			hsl(180,100%,50%),
			hsl(240,100%,50%),
			hsl(300,100%,50%),
			hsl(360,100%,50%)
		);
	}

	.hue-handle {
		position: absolute;
		top: 50%;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid #fff;
		box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.hex-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.hex-label {
		font-size: 0.8rem;
		color: var(--text-secondary);
		font-family: var(--font-mono);
	}

	.hex-input {
		flex: 1;
		background: var(--bg-surface, #1a1a1a);
		border: 1px solid var(--border, #333);
		border-radius: 0.375rem;
		padding: 0.3rem 0.5rem;
		font-size: 0.8rem;
		font-family: var(--font-mono);
		color: var(--text-primary);
		outline: none;
		min-width: 0;
	}

	.hex-input:focus {
		border-color: var(--graph-accent);
	}

	.set-btn {
		width: 100%;
		padding: 0.45rem;
		border: 0;
		border-radius: 0.5rem;
		background: var(--graph-accent, #ff3e00);
		color: #fff;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		letter-spacing: 0.02em;
	}

	.set-btn:hover {
		filter: brightness(1.1);
	}

	.set-btn:active {
		filter: brightness(0.95);
	}

	.native-picker {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
	}

</style>
