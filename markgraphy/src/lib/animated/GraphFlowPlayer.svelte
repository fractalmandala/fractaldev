<script module lang="ts">
	import type { GraphProps } from "../frame/Graph.svelte";
	import Typed from './TextTyping.svelte'

	/** The frame's own props, minus the ones this component owns. */
	export type FrameProps = Omit<GraphProps, "title" | "children" | "class">;

	/** One ordered step of a process. */
	export interface FlowStep {
		/** Short name shown beside the marker. */
		label: string;
		/** Extra line revealed while the step is active. */
		detail?: string;
	}

	export interface GraphFlowPlayerProps {
		/** Caption drawn on the frame's top edge as `[ TITLE ]`. */
		title: string;
		/** Steps in playback order. */
		steps: FlowStep[];
		/** Start playing on mount. Default false. Never autoplays under reduced motion. */
		autoPlay?: boolean;
		/** Milliseconds per step. Default 1600. */
		speedMs?: number;
		/** Show the playback controls. Default true. */
		showControls?: boolean;
		/** Animate transitions and the active marker pulse. Default true. */
		animated?: boolean;
		/** Character at each corner of the frame. Default '+'. */
		corner?: string;
		/**
		 * Anything the frame itself takes — dash, motion, speed, easing, pad,
		 * pauseOnHover, cornerBlink, ink, accent. Forwarded straight to `Graph`,
		 * so the frame's whole vocabulary is reachable without this component
		 * having to restate every prop.
		 */
		frame?: FrameProps;
		class?: string;
	}
</script>

<script lang="ts">
	import Graph from "../frame/Graph.svelte";
	import GraphBody from "../frame/GraphBody.svelte";

	let {
		title,
		steps,
		autoPlay = false,
		speedMs = 1600,
		showControls = true,
		animated = true,
		corner,
		frame,
		class: className = "",
	}: GraphFlowPlayerProps = $props();

	const uid = $props.id();

	interface Seg {
		text: string;
		cls?: string;
	}

	let step = $state(0);
	let playing = $state(false);
	// svelte-ignore state_referenced_locally
	let intervalTime = $state(speedMs);

	const count = $derived(steps.length);
	const active = $derived(count === 0 ? 0 : Math.min(step, count - 1));
	const digits = $derived(Math.max(1, String(count).length));

	const motionAllowed = $derived(
		animated &&
			(typeof window === "undefined" ||
				!window.matchMedia("(prefers-reduced-motion: reduce)").matches),
	);

	// Autoplay only when motion is allowed; the controls can always start playback.
	$effect(() => {
		if (autoPlay && motionAllowed) {
			playing = true;
		}
	});

	$effect(() => {
		if (!playing || count === 0) {
			return;
		}

		const timer = window.setInterval(
			() => {
				step = (active + 1) % count;
			},
			Math.max(100, intervalTime),
		);

		return () => window.clearInterval(timer);
	});

	function handleTogglePlay() {
		if (count === 0) {
			return;
		}

		playing = !playing;
	}

	function handleNext() {
		if (count === 0) {
			return;
		}

		step = (active + 1) % count;
	}

	function handlePrev() {
		if (count === 0) {
			return;
		}

		step = (active - 1 + count) % count;
	}

	/** One entry per step — not per rendered line, so each is its own box. */
	interface Item {
		num: string;
		label: string;
		detail?: string;
		state: "todo" | "active" | "done";
	}

	const items = $derived.by((): Item[] =>
		steps.map((s, i) => ({
			num: String(i + 1).padStart(digits, " "),
			label: s.label,
			detail: s.detail,
			state: i === active ? "active" : i < active ? "done" : "todo",
		})),
	);

	// The detail sits on one shared line under the row, so a long one cannot
	// stretch its own column and shove the other steps sideways.
	const detail = $derived(items[active]?.detail ?? "");

</script>

<Graph {title} {corner} {...frame} class={className}>
	<GraphBody>
		<div class="player" class:anim={animated} class:playing>
			{#if count === 0}
				<p class="empty">( no steps )</p>
			{:else}
				<div class="viewport box gap-lg pad-md">
					<ol class="steps pad-xl gap-xs">
						{#each items as item, i (i)}
							<Graph pad="sm" class="grow ta-c panel" corner="">
							<li class="step" data-state={item.state}>
								<p class="marker text-bs">[ {item.num} ]</p>
								<div class="label"><Typed textToAnimate={item.label} active={item.state === 'active'} /></div>
							</li>
							</Graph>
						{/each}
					</ol>
					<p class="detail ta-c text-xl" aria-live="polite">{detail}</p><!-- Height is reserved even when empty, so advancing never reflows. -->
				</div>
			{/if}
			{#if showControls}
				<div class="controls">
					<div class="buttons">
						<button
							class="ctrl"
							type="button"
							onclick={handlePrev}
							aria-label="Previous step">[ ◀ ]</button
						>
						<button
							class="button ghost"
							type="button"
							onclick={() => (playing = !playing)}
							aria-label={playing ? 'Pause the flow' : 'Play the flow'}
						>
							<span class="accented">[ </span> {playing ? 'pause' : 'play'} <span class="accented"> ]</span>
						</button>
						<button
							class="ctrl"
							type="button"
							onclick={handleNext}
							aria-label="Next step">[ ▶ ]</button
						>
					</div>
				</div>
			{/if}
		</div>
	</GraphBody>
</Graph>

<style>

	.player {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.viewport {
		overflow-x: auto;
	}

	/*
	 * Steps sit in a row; each step is a column so its marker and label stack.
	 * Equal flex basis means the row never re-proportions as the active step
	 * moves along it.
	 */
	.steps {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
		min-width: 0;
	}

	.step {
		flex: 1 1 0;
		min-width: 7rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0 1rem;
	}

	.step:first-child {
		padding-left: 0;
	}

	.marker,
	.label {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.step[data-state='active'] .marker,
	.step[data-state='active'] .label {
		color: var(--text-primary, oklch(0.93 0 0));
		font-weight: 600;
	}

	.step[data-state='done'] .marker,
	.step[data-state='done'] .label {
		color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.detail,
	.empty {
		margin: 0;
		/* One line always reserved: the text changes, the layout does not. */
		min-height: 1.4em;
		color: var(--text-muted, oklch(0.3 0 0));
	}

	@media (prefers-reduced-motion: no-preference) {
		.anim .marker,
		.anim .label,
		.anim .detail,
		.anim .step {
			transition:
				color 0.25s ease,
				border-color 0.25s ease;
		}

		.anim.playing .step[data-state='active'] .marker {
			animation: pulse 1s infinite alternate;
		}

		@keyframes pulse {
			from {
				opacity: 0.7;
			}

			to {
				opacity: 1;
			}
		}
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding-top: 0.875rem;
		border-top: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.buttons {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.ctrl {
		padding: 0;
		font-size: 0.9rem;
		background: none;
		border: none;
		color: var(--text-muted);
		border-radius: 0;
		cursor: pointer;
	}

	.ctrl:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

</style>
