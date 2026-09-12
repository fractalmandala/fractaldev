<script lang="ts">
	import { untrack } from 'svelte';
	import { deck as defaultDeck, slides as defaultSlides } from '$site/data/orientationdata.js';
	import { renderFigure, CENTRE, VIEWBOX } from '$site/data/figures.js';
	import type { Deck, Slide } from '$site/types.js';
	import Revealer from '$lib/motion/comps/RevealSvelteMotion.svelte';
	import SlideM from '$lib/motion/comps/SlideSvelteMotion.svelte';

	interface Props {
		slides?: Slide[];
		deck?: Deck;
	}

	let { slides = defaultSlides, deck = defaultDeck }: Props = $props();

	let current = $state(0);
	/* The dials own this from here on: `deck.seed` is the STARTING position, not a
	   binding. Reading it bare would warn (state_referenced_locally) because only
	   the initial value is captured — which is precisely the intent, so untrack
	   says so rather than leaving a warning that reads like an oversight. A
	   $derived is not an option: bind:value writes straight into this object. */
	let seed = $state(untrack(() => ({ ...deck.seed })));

	let figureEl = $state<SVGSVGElement | null>(null);

	const slide = $derived(slides[current]);
	const figureMarkup = $derived(renderFigure(slide.graphic, seed));
	const nextLabel = $derived(
		current === 0 ? 'Begin' : current === slides.length - 1 ? 'Again' : 'Continue'
	);

	/* — inline markup: {emphasis} and *strong* — */
	const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
	const esc = (s: string): string => s.replace(/[&<>]/g, (c) => ENTITIES[c]);
	const fmt = (s: string): string =>
		esc(s)
			// emphasis and strong carry registry classes, so the formatter needs
			// no stylesheet of its own
			.replace(/\{([^}]+)\}/g, '<span class="text-theme">$1</span>')
			.replace(/\*([^*]+)\*/g, '<span class="weight-600 text-primary">$1</span>');
	const codefmt = (s: string): string =>
		esc(s).replace(/\[\[([^\]]+)\]\]/g, '<span class="text-muted">⟨$1⟩</span>');

	const go = (i: number): void => {
		current = (i + slides.length) % slides.length;
	};

	function handleKeydown(event: KeyboardEvent): void {
		if (event.target instanceof HTMLInputElement) return;
		if (event.key === 'ArrowRight' && current < slides.length - 1) current += 1;
		if (event.key === 'ArrowLeft' && current > 0) current -= 1;
	}

	/* — rotation: one persistent clock, so dial drags never snap the figure — */
	let spinning: SVGGraphicsElement[] = [];
	const reduceMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const EASE = 'cubic-bezier(.2,.8,.2,1)';

	$effect(() => {
		figureMarkup;
		spinning = figureEl
			? Array.from(figureEl.querySelectorAll<SVGGraphicsElement>('[data-spin]'))
			: [];
	});

	/* Staging: each accretion arrives in order (rings → spokes → minis →
	   enclosure draw-on → seed + callout). Slide changes only — dial scrubs
	   re-render instantly with no replay, so sliders stay realtime.
	   Static-first: markup is complete without JS; this only enhances.
	   Skipped under reduced motion. */
	let stagedKey = '';
	$effect(() => {
		figureMarkup;
		const key = slide.id;
		if (!figureEl || reduceMotion() || key === stagedKey) return;
		stagedKey = key;
		const stages = Array.from(figureEl.querySelectorAll<SVGGraphicsElement>('[data-stage]'));
		const draw = figureEl.querySelector<SVGCircleElement>('[data-draw]');
		const animations: Animation[] = [];
		const byStage = new Map<number, SVGGraphicsElement[]>();
		for (const el of stages) {
			const n = Number((el as SVGGraphicsElement).dataset.stage);
			if (!byStage.has(n)) byStage.set(n, []);
			byStage.get(n)?.push(el as SVGGraphicsElement);
		}
		for (const [n, els] of byStage)
			for (const el of els)
				animations.push(
					el.animate(
						[
							{ opacity: '0', transform: 'translateY(8px)' },
							{ opacity: '1', transform: 'translateY(0)' }
						],
						{ duration: 480, delay: (n - 1) * 140, easing: EASE, fill: 'backwards' }
					)
				);
		/* Enclosure draw-on: markup stays visible without JS (dashoffset 0);
		   JS rewinds to 1 and draws to 0. One path, per the motion budget. */
		if (draw) {
			draw.setAttribute('stroke-dasharray', '1');
			draw.setAttribute('stroke-dashoffset', '1');
			const a = draw.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
				duration: 900,
				delay: 4 * 140,
				easing: EASE,
				fill: 'forwards'
			});
			a.onfinish = (): void => {
				draw.removeAttribute('stroke-dasharray');
				draw.removeAttribute('stroke-dashoffset');
			};
			animations.push(a);
		}
		return () => {
			for (const a of animations) a.cancel();
		};
	});

	/* Instrument: dials stay realtime (instant re-render, unbroken clock).
	   A single soft landing pulse fires once the scrub settles (debounced),
	   never per-tick. Skipped on first run. */
	let pulsed = false;
	let settle: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		seed.sides;
		seed.ratio;
		if (!figureEl || !pulsed || reduceMotion()) {
			pulsed = true;
			return;
		}
		clearTimeout(settle);
		settle = setTimeout(() => {
			if (!figureEl) return;
			figureEl.style.transformBox = 'fill-box';
			figureEl.style.transformOrigin = 'center';
			figureEl.animate(
				[{ transform: 'scale(1)' }, { transform: 'scale(1.015)' }, { transform: 'scale(1)' }],
				{ duration: 320, easing: EASE }
			);
		}, 180);
		return () => clearTimeout(settle);
	});

	/* Instrument: hovering an enclosure vertex lights its echo/cluster copy.
	   Dots carry data-vtx, minis carry data-echo / data-cluster. */
	$effect(() => {
		figureMarkup;
		if (!figureEl || reduceMotion()) return;
		const cleanups: Array<() => void> = [];
		const dots = Array.from(figureEl.querySelectorAll<SVGCircleElement>('[data-vtx]'));
		for (const dot of dots) {
			const k = Number(dot.dataset.vtx) % Math.max(seed.sides, 1);
			const targets = Array.from(
				figureEl.querySelectorAll(`[data-echo="${k}"],[data-cluster="${k}"]`)
			);
			if (!targets.length) continue;
			const origR = dot.getAttribute('r') ?? '1.6';
			dot.dataset.fill ??= dot.getAttribute('fill') ?? '';
			const on = (): void => {
				dot.setAttribute('r', '2.6');
				dot.setAttribute('fill', 'var(--theme-color)');
				for (const t of targets) {
					for (const p of Array.from(t.querySelectorAll('polygon'))) {
						p.dataset.origStroke ??= p.getAttribute('stroke') ?? '';
						p.dataset.origOp ??= p.getAttribute('opacity') ?? '';
						p.setAttribute('stroke', 'var(--theme-color)');
						p.setAttribute('opacity', '0.95');
					}
				}
			};
			const off = (): void => {
				dot.setAttribute('r', origR);
				if (dot.dataset.fill) dot.setAttribute('fill', dot.dataset.fill);
				for (const t of targets)
					for (const p of Array.from(t.querySelectorAll('polygon'))) {
						if (p.dataset.origStroke) p.setAttribute('stroke', p.dataset.origStroke);
						if (p.dataset.origOp) p.setAttribute('opacity', p.dataset.origOp);
						delete p.dataset.origStroke;
						delete p.dataset.origOp;
					}
			};
			dot.addEventListener('mouseenter', on);
			dot.addEventListener('mouseleave', off);
			cleanups.push(() => {
				dot.removeEventListener('mouseenter', on);
				dot.removeEventListener('mouseleave', off);
			});
		}
		return () => {
			for (const fn of cleanups) fn();
		};
	});

	$effect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let t = 0;
		let frame = 0;

		/* Quiet loop token (diagram-design animation.md: one decorative loop,
		   ≥3s cycle, static-first — markup alone already reads complete). */
		const orbit = (): void => {
			if (document.visibilityState !== 'hidden') {
				t += 0.02;
				for (const group of spinning) {
					const rate = Number(group.dataset.spin);
					group.setAttribute('transform', `rotate(${t * rate} ${CENTRE} ${CENTRE})`);
				}
			}
			frame = requestAnimationFrame(orbit);
		};

		frame = requestAnimationFrame(orbit);
		return () => cancelAnimationFrame(frame);
	});
</script>

<svelte:head>
	<title>{deck.wordmark}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="box gap-lg ycenter">
	<div class="grid-2 gap-xl ycenter">
		<section class="box ycenter">
			<SlideM direction="down" distance={40}>
					<div class="box gap-md">
						<span class="eyebrow text-theme">{slide.step}</span>
						{#if slide.sanskrit}
							<p class="text-4xl text-theme">{slide.sanskrit}</p>
						{/if}
						{#if slide.translit}
							<p class="text-2xl text-secondary">{slide.translit}</p>
						{/if}
						{#if slide.heading}
							<h1 class="text-5xl weight-700 lh11">{@html fmt(slide.heading)}</h1>
						{/if}
						{#if slide.heuristic}
							<div class="box gap-2xs">
								{#each slide.heuristic as line}
									<span class="text-xl weight-600">{@html fmt(line)}</span>
								{/each}
							</div>
						{/if}
						{#if slide.body}
							<div class="box gap-sm">
								{#each slide.body as para}
									<p class="text-md text-secondary">{@html fmt(para)}</p>
								{/each}
							</div>
						{/if}
						{#if slide.dials}
							<div class="box gap-sm">
								<div class="box gap-2xs">
									<div class="row ycenter xbetween">
										<span class="text-xs text-muted tt-u weight-600">{deck.dialLabels.sides}</span>
										<span class="text-md text-theme mono">{seed.sides}</span>
									</div>
									<input
										type="range"
										min="3"
										max="12"
										bind:value={seed.sides}
										aria-label={deck.dialLabels.sides}
									/>
								</div>
								<div class="box gap-2xs">
									<div class="row ycenter xbetween">
										<span class="text-xs text-muted tt-u weight-600">{deck.dialLabels.ratio}</span>
										<span class="text-md text-theme mono">{seed.ratio.toFixed(2)}</span>
									</div>
									<input
										type="range"
										min="1.15"
										max="1.75"
										step="0.01"
										bind:value={seed.ratio}
										aria-label={deck.dialLabels.ratio}
									/>
								</div>
								<p class="text-xs text-muted">{deck.dialNote}</p>
							</div>
						{/if}
						{#if slide.footnote}
							<div class="box gap-2xs pad-top-sm border-top">
								<span class="text-xs text-muted tt-u weight-600">{slide.footnote.label}</span>
								<p class="text-sm text-secondary">{@html fmt(slide.footnote.text)}</p>
							</div>
						{/if}

						{#if slide.example}
							<div class="box gap-2xs">
								<span class="text-xs text-theme tt-u weight-600 mono">{slide.example.label}</span>
								<pre class="terminal text-inverse pad-sm radius-sm text-xs mono">{@html codefmt(
										slide.example.code
									)}</pre>
							</div>
						{/if}
					</div>
							<div class="row ycenter gap-sm">
					<button class="button ghost" disabled={current === 0} onclick={() => go(current - 1)}
						>← Back</button
					>
					<button class="button primary" onclick={() => go(current + 1)}>{nextLabel} →</button>
				</div>
			</SlideM>
		</section>
		<section class="box xcenter ycenter gap-sm wfull">
			<Revealer
				propClass="box xcenter wfull"
				scrub={false}
				direction="left"
				duration={1.1}
				ease="circOut"
			>
				<div class="box" style="width: 100%; height: 100%">
					<svg
						viewBox={VIEWBOX}
						bind:this={figureEl}
						role="img"
						aria-labelledby="fig-title fig-desc"
						data-motion-root
						data-frame="static"
					>
						{@html figureMarkup}
					</svg>
					<span class="text-xs text-muted tt-u">{slide.caption}</span>
				</div>
			</Revealer>
		</section>
	</div>
</div>
