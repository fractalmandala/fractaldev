<script module lang="ts">
	import type { GraphDash, GraphMotion, GraphPad } from '$lib/frame/Graph.svelte';
	import type { EasingName } from '$lib';

	/** Every knob the frame exposes, in one bindable object. */
	export interface FrameSettings {
		dash: GraphDash;
		motion: GraphMotion;
		speed: number;
		easing: EasingName;
		pad: GraphPad;
		corner: string;
		cornerBlink: boolean;
		pauseOnHover: boolean;
	}

	export const FRAME_DEFAULTS: FrameSettings = {
		dash: 'token',
		motion: 'march',
		speed: 0.7,
		easing: 'in-out',
		pad: 'none',
		corner: '+',
		cornerBlink: false,
		pauseOnHover: false
	};

	const DASHES: GraphDash[] = ['token', 'std', 'gap', 'long', 'short', 'dot', 'alt', 'solid'];
	const MOTIONS: GraphMotion[] = [
		'none',
		'march',
		'reverse',
		'pulse',
		'scan',
		'draw'
	];
	const EASINGS: EasingName[] = [
		'linear',
		'out-quad',
		'out-cubic',
		'out-expo',
		'out-back',
		'in-out',
		'in-cubic',
		'stepped'
	];
	const PADS: GraphPad[] = ['none', 'sm', 'md', 'lg'];
	const CORNERS = ['+', '·', '◆', '×', '□', '*'];
</script>

<script lang="ts">
	let { settings = $bindable() }: { settings: FrameSettings } = $props();

	const uid = $props.id();

	/** Only `none` has nothing to time — `draw` paces its hover reveal. */
	const paced = $derived(settings.motion !== 'none');

	/** Pausing on hover needs a loop to pause; `draw` *is* the hover. */
	const pausable = $derived(paced && settings.motion !== 'draw');
</script>

<div class="box gap-sm xcenter ta-c" style="margin-inline: auto">
	<div class="knob">
		<span class="key shrink-0" id="{uid}-dash">dash type</span>
		<div class="row gap-sm wrap" role="group" aria-labelledby="{uid}-dash">
			{#each DASHES as value (value)}
				<button
					type="button"
					class="button small"
					class:active={settings.dash === value}
					aria-pressed={settings.dash === value}
					onclick={() => (settings.dash = value)}>{value}</button
				>
			{/each}
		</div>
	</div>

	<div class="knob">
		<span class="key shrink-0" id="{uid}-motion">motion</span>
		<div class="row gap-sm wrap" role="group" aria-labelledby="{uid}-motion">
			{#each MOTIONS as value (value)}
				<button
					type="button"
					class="button small"
					class:active={settings.motion === value}
					aria-pressed={settings.motion === value}
					onclick={() => (settings.motion = value)}>{value}</button
				>
			{/each}
		</div>
	</div>

	<div class="row ycenter gap-sm">
		<label class="key" for="{uid}-speed">speed</label>
		<div class="slider">
			<input
				id="{uid}-speed"
				type="range"
				min="0.2"
				max="4"
				step="0.1"
				disabled={!paced}
				style="--fill:{((settings.speed - 0.2) / 3.8) * 100}%"
				bind:value={settings.speed}
			/>
			<span class="val">{settings.speed.toFixed(1)}s</span>
		</div>
		<div class="row ycenter gap-sm xleft" style="margin-right: auto">
		<label class="key" for="{uid}-easing">easing</label>
		<select id="{uid}-easing" class="select" bind:value={settings.easing}>
			{#each EASINGS as value (value)}
				<option {value}>{value}</option>
			{/each}
		</select>
		</div>
	</div>
	<div class="knob">
		<span class="key shrink-0" id="{uid}-pad">pad</span>
		<div class="row gap-sm wrap" role="group" aria-labelledby="{uid}-pad">
			{#each PADS as value (value)}
				<button
					type="button"
					class="button small"
					class:active={settings.pad === value}
					aria-pressed={settings.pad === value}
					onclick={() => (settings.pad = value)}>{value}</button
				>
			{/each}
		</div>
	</div>

	<div class="knob">
		<span class="key shrink-0" id="{uid}-corner">corner</span>
		<div class="row gap-sm wrap" role="group" aria-labelledby="{uid}-corner">
			{#each CORNERS as value (value)}
				<button
					type="button"
					class="button small"
					class:active={settings.corner === value}
					aria-pressed={settings.corner === value}
					aria-label="Corner {value}"
					onclick={() => (settings.corner = value)}>{value}</button
				>
			{/each}
		</div>
	</div>

	<div class="knob toggles">
		<label class="toggle">
			<input type="checkbox" bind:checked={settings.cornerBlink} />
			<span>corner blink</span>
		</label>
		<label class="toggle">
			<input type="checkbox" bind:checked={settings.pauseOnHover} disabled={!pausable} />
			<span>pause on hover</span>
		</label>
		<button type="button" class="chip reset" onclick={() => (settings = { ...FRAME_DEFAULTS })}>
			reset
		</button>
	</div>
</div>

<style>

	.knob {
		display: grid;
		grid-template-columns: 7rem 1fr;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
		width: max-content;
		place-self: center;
	}

	.key {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.chip {
		padding: 0.2rem 0.5rem;
		font: inherit;
		font-size: 0.7rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}

	.chip:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

	.reset {
		margin-left: auto;
	}

	.select {
		padding: 0.2rem 0.4rem;
		font: inherit;
		font-size: 0.7rem;
		color: var(--text-primary, oklch(0.93 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		justify-self: start;
	}

	.slider {
		display: grid;
		grid-template-columns: minmax(0, 12rem) 3rem;
		align-items: center;
		gap: 0.5rem;
	}

	.val {
		font-variant-numeric: tabular-nums;
		color: var(--text-primary, oklch(0.93 0 0));
	}

	/* Bare track, matching the sliders elsewhere: no UA border, explicit fill. */
	.slider input {
		appearance: none;
		-webkit-appearance: none;
		width: 100%;
		min-width: 0;
		height: 1rem;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.slider input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.slider input::-webkit-slider-runnable-track {
		height: 0.375rem;
		border: 0;
		border-radius: 999px;
		background: var(--text-muted, oklch(0.85 0 0));
		background-image: linear-gradient(
			to right,
			var(--graph-accent, oklch(0.78 0.17 155)) 0 var(--fill),
			transparent var(--fill) 100%
		);
	}

	.slider input::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: 0.85rem;
		height: 0.85rem;
		margin-top: calc((0.375rem - 0.85rem) / 2);
		border: 0;
		border-radius: 999px;
		background: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.slider input::-moz-range-track {
		height: 0.375rem;
		border: 0;
		border-radius: 999px;
		background: var(--text-muted, oklch(0.85 0 0));
		background-image: linear-gradient(
			to right,
			var(--graph-accent, oklch(0.78 0.17 155)) 0 var(--fill),
			transparent var(--fill) 100%
		);
	}

	.slider input::-moz-range-progress {
		background: transparent;
	}

	.slider input::-moz-range-thumb {
		width: 0.85rem;
		height: 0.85rem;
		border: 0;
		border-radius: 999px;
		background: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.toggles {
		grid-template-columns: 1fr;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		cursor: pointer;
	}

	.toggle input {
		accent-color: var(--graph-accent, oklch(0.78 0.17 155));
		cursor: pointer;
	}

	.toggle:has(input:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	@media (max-width: 1024px) {
		.knob {
			width: 100%;
			place-self: stretch;
		}

		.slider {
			grid-template-columns: minmax(0, 1fr) 3rem;
		}
	}

	@media (max-width: 700px) {
		.knob {
			grid-template-columns: 1fr;
			gap: 0.3rem;
		}
	}
</style>
