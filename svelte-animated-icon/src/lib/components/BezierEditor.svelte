<script lang="ts">
	import { EASING_GROUPS, matchPreset, DEFAULT_BEZIER, EASING_PRESETS, type Bezier } from '$lib/utils/easings';

	interface Props {
		value?: Bezier;
		showPresets?: boolean;
		/** fired on any user change (drag, input, or preset) — distinguishes user edits from the initial value */
		onchange?: () => void;
	}
	let { value = $bindable<Bezier>(DEFAULT_BEZIER), showPresets = true, onchange }: Props = $props();

	// Plot mapping. x ∈ [0,1] across the inner width; y domain [-0.5,1.5] (room for Back overshoot).
	// SVG viewBox 240 × 280. Unit square: x [24,216], y [80,200].
	const xPx = (v: number) => 24 + v * 192;
	const yPx = (v: number) => 20 + (1.5 - v) * 120;

	const p1x = $derived(xPx(value[0]));
	const p1y = $derived(yPx(value[1]));
	const p2x = $derived(xPx(value[2]));
	const p2y = $derived(yPx(value[3]));
	const curveD = $derived(`M 24 200 C ${p1x} ${p1y} ${p2x} ${p2y} 216 80`);
	const active = $derived(matchPreset(value));
	const selectedPresetId = $derived(active?.id ?? '');

	const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
	const r2 = (n: number) => Math.round(n * 100) / 100;

	let svgEl: SVGSVGElement;
	let dragging = $state<0 | 1 | null>(null);

	function startDrag(which: 0 | 1, e: PointerEvent) {
		dragging = which;
		svgEl.setPointerCapture(e.pointerId);
	}

	function onMove(e: PointerEvent) {
		if (dragging === null) return;
		const rect = svgEl.getBoundingClientRect();
		const sx = ((e.clientX - rect.left) / rect.width) * 240;
		const sy = ((e.clientY - rect.top) / rect.height) * 280;
		const vx = r2(clamp((sx - 24) / 192, 0, 1));
		const vy = r2(clamp(1.5 - (sy - 20) / 120, -1, 2));
		const next: Bezier = [...value];
		if (dragging === 0) {
			next[0] = vx;
			next[1] = vy;
		} else {
			next[2] = vx;
			next[3] = vy;
		}
		value = next;
		onchange?.();
	}

	function endDrag() {
		dragging = null;
	}

	function setComp(i: number, raw: string) {
		const v = Number(raw);
		if (Number.isNaN(v)) return;
		const next: Bezier = [...value];
		next[i] = i === 0 || i === 2 ? clamp(v, 0, 1) : v;
		value = next;
		onchange?.();
	}
</script>

<div class="box bezier-editor gap16">
	<div class="box graph-box">
		<svg
			bind:this={svgEl}
			class="bezier-editor-svg"
			viewBox="0 60 240 160"
			onpointermove={onMove}
			onpointerup={endDrag}
			onpointerleave={endDrag}
			role="application"
			aria-label="Cubic bezier curve editor"
		>
			<rect class="be-grid" x="24" y="80" width="192" height="120" />
			<line class="be-grid" x1="24" y1="140" x2="216" y2="140" />
			<line class="be-grid" x1="120" y1="80" x2="120" y2="200" />
			<line class="be-diag" x1="24" y1="200" x2="216" y2="80" />
			<line class="be-guide" x1="24" y1="200" x2={p1x} y2={p1y} />
			<line class="be-guide" x1="216" y1="80" x2={p2x} y2={p2y} />
			<path class="be-curve" d={curveD} />
			<circle class="be-end" cx="24" cy="200" r="4" />
			<circle class="be-end" cx="216" cy="80" r="4" />
			<circle
				class="be-handle"
				class:be-handle--active={dragging === 0}
				cx={p1x}
				cy={p1y}
				r="8"
				role="button"
				aria-label="Control point 1"
				tabindex="0"
				onpointerdown={(e) => startDrag(0, e)}
			/>
			<circle
				class="be-handle"
				class:be-handle--active={dragging === 1}
				cx={p2x}
				cy={p2y}
				r="8"
				role="button"
				aria-label="Control point 2"
				tabindex="0"
				onpointerdown={(e) => startDrag(1, e)}
			/>
		</svg>
	</div>
	<div class="bezier-editor-inputs">
		<label class="bezier-editor-num">X₁<input type="number" min="0" max="1" step="0.01" value={value[0]} oninput={(e) => setComp(0, e.currentTarget.value)} /></label>
		<label class="bezier-editor-num">Y₁<input type="number" step="0.01" value={value[1]} oninput={(e) => setComp(1, e.currentTarget.value)} /></label>
		<label class="bezier-editor-num">X₂<input type="number" min="0" max="1" step="0.01" value={value[2]} oninput={(e) => setComp(2, e.currentTarget.value)} /></label>
		<label class="bezier-editor-num">Y₂<input type="number" step="0.01" value={value[3]} oninput={(e) => setComp(3, e.currentTarget.value)} /></label>
	</div>
	<div class="box gap4">
			<span class="text-sm col2 font20 w500">Easing Templates:</span>
		<select
			class="styled-select"
			value={selectedPresetId}
			onchange={(e) => {
				const preset = EASING_PRESETS.find((p) => p.id === e.currentTarget.value);
				if (preset) { value = [...preset.bezier]; onchange?.(); }
			}}
		>
			<option value="">Custom</option>
			{#each EASING_PRESETS as preset (preset.id)}
				<option value={preset.id}>{preset.label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.bezier-editor-svg {
		width: 100%;
		touch-action: none;
	}
	.be-grid {
		fill: none;
		stroke: var(--border-subtle, #ececec);
		stroke-width: 1;
	}
	.be-diag {
		fill: none;
		stroke: var(--border-default, #e0e0e0);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}
	.be-guide {
		stroke: var(--text-muted, #999);
		stroke-width: 1.5;
		stroke-dasharray: 2 3;
	}
	.be-curve {
		fill: none;
		stroke: var(--theme-color, #039140);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.be-end {
		fill: var(--text-muted, #999);
	}
	.be-handle {
		fill: var(--theme-color, #039140);
		stroke: var(--surface-input, #fff);
		stroke-width: 2;
		cursor: grab;
	}
	.be-handle--active {
		cursor: grabbing;
	}
	.bezier-editor-inputs {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--size8, 8px);
	}
	.bezier-editor-num {
		display: flex;
		align-items: center;
		gap: var(--size8, 8px);
		font-size: var(--text-sm, 12px);
		color: var(--text-secondary, #666);
	}
	.bezier-editor-num input {
		width: 100%;
		font-family: var(--font-mono, monospace);
	}
</style>
