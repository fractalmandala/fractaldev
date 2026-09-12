<script module lang="ts">
	import {
		cubicOut,
		quadOut,
		cubicInOut,
		sineOut,
		expoOut,
		circOut,
		backOut,
		elasticOut,
		bounceOut
	} from 'svelte/easing';

	type EasingFunction = (t: number) => number;

	const EASINGS: Record<string, EasingFunction> = {
		'power1.out': quadOut,
		'power2.out': cubicOut,
		'power3.out': cubicOut,
		'power4.out': expoOut,
		'power2.inOut': cubicInOut,
		'power3.inOut': cubicInOut,
		'sine.out': sineOut,
		'expo.out': expoOut,
		'circ.out': circOut,
		'back.out': backOut,
		'elastic.out': elasticOut,
		'bounce.out': bounceOut,
		linear: (t: number) => t
	};

	function resolveEase(e: string | EasingFunction): EasingFunction {
		if (typeof e === 'function') return e;
		return EASINGS[e] ?? cubicOut;
	}

	export type ShuffleDirection = 'left' | 'right' | 'up' | 'down';
	export type AnimationMode = 'evenodd' | 'random';
	export type TagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

	export interface ShuffleTextProps {
		text: string;
		class?: string;
		style?: string;
		shuffleDirection?: ShuffleDirection;
		duration?: number;
		maxDelay?: number;
		ease?: string | EasingFunction;
		threshold?: number;
		rootMargin?: string;
		tag?: TagName;
		textAlign?: string;
		onShuffleComplete?: () => void;
		shuffleTimes?: number;
		animationMode?: AnimationMode;
		loop?: boolean;
		loopDelay?: number;
		stagger?: number;
		scrambleCharset?: string;
		colorFrom?: string;
		colorTo?: string;
		triggerOnce?: boolean;
		respectReducedMotion?: boolean;
		triggerOnHover?: boolean;
	}
</script>

<script lang="ts">
	let {
		text,
		class: className = '',
		style = '',
		shuffleDirection = 'right',
		duration = 0.35,
		maxDelay = 0,
		ease = 'power3.out',
		threshold = 0.1,
		rootMargin = '-100px',
		tag = 'p',
		textAlign = 'center',
		onShuffleComplete,
		shuffleTimes = 1,
		animationMode = 'evenodd',
		loop = false,
		loopDelay = 0,
		stagger = 0.03,
		scrambleCharset = '',
		colorFrom,
		colorTo,
		triggerOnce = true,
		respectReducedMotion = true,
		triggerOnHover = true
	}: ShuffleTextProps = $props();

	let el: HTMLElement | undefined = $state();
	let fontsLoaded = $state(false);
	let ready = $state(false);

	// ── Animation loop state ──
	let currentRaf: number | null = null;
	let loopTimeout: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (typeof document === 'undefined') return;
		if ('fonts' in document) {
			if (document.fonts.status === 'loaded') fontsLoaded = true;
			else document.fonts.ready.then(() => (fontsLoaded = true));
		} else {
			fontsLoaded = true;
		}
	});

	$effect(() => {
		if (!el || !text || !fontsLoaded) return;

		// Track all reactive props so the effect rebuilds on change
		const dur = duration;
		const md = maxDelay;
		const ea = ease;
		const dir = shuffleDirection;
		const rolls = Math.max(1, Math.floor(shuffleTimes));
		const mode = animationMode;
		const doLoop = loop;
		const lDelay = loopDelay;
		const stag = stagger;
		const charset = scrambleCharset;
		const cFrom = colorFrom;
		const cTo = colorTo;
		const once = triggerOnce;
		const reduced = respectReducedMotion;
		const hover = triggerOnHover;
		const txt = text;
		const onComplete = onShuffleComplete;

		const root = el;

		// ── Reduced motion: show plain text immediately ──
		if (reduced && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
			ready = true;
			onComplete?.();
			return;
		}

		// ── Per-character animation targets ──
		type Strip = { inner: HTMLElement; start: number; end: number; delay: number };
		let strips: Strip[] = [];
		let wrappers: HTMLElement[] = [];
		let playing = false;
		let hoverHandler: (() => void) | null = null;
		let observer: IntersectionObserver | null = null;
		const easingFn = resolveEase(ea);
		const isVertical = dir === 'up' || dir === 'down';

		// ── requestAnimationFrame animation loop ──
		const stopLoop = () => {
			if (currentRaf !== null) {
				cancelAnimationFrame(currentRaf);
				currentRaf = null;
			}
			if (loopTimeout !== null) {
				clearTimeout(loopTimeout);
				loopTimeout = null;
			}
		};

		const randomizeClones = () => {
			if (!charset) return;
			const len = charset.length;
			if (!len) return;
			for (const w of wrappers) {
				const strip = w.firstElementChild;
				if (!strip) continue;
				const kids = strip.children;
				for (let k = 1; k < kids.length - 1; k++) {
					kids[k].textContent = charset.charAt(Math.floor(Math.random() * len));
				}
			}
		};

		const resetPositions = () => {
			for (const s of strips) {
				s.inner.style.transform = isVertical
					? `translateY(${s.start}px)`
					: `translateX(${s.start}px)`;
			}
		};

		const cleanupToStill = () => {
			for (const w of wrappers) {
				const strip = w.firstElementChild as HTMLElement | null;
				if (!strip) continue;
				const real = strip.querySelector('[data-orig="1"]');
				if (real) {
					strip.replaceChildren(real);
					strip.style.transform = 'none';
					strip.style.willChange = 'auto';
				}
			}
		};

		const removeHover = () => {
			if (hoverHandler) {
				root.removeEventListener('mouseenter', hoverHandler);
				hoverHandler = null;
			}
		};

		const teardown = () => {
			stopLoop();
			removeHover();
			for (const w of wrappers) {
				const inner = w.firstElementChild;
				const orig = inner?.querySelector('[data-orig="1"]');
				if (orig && w.parentNode) w.parentNode.replaceChild(orig, w);
			}
			wrappers = [];
			strips = [];
			playing = false;
		};

		// ── Build character wrapper DOM ──
		const build = () => {
			teardown();

			// Clear all children (Svelte text nodes, leftover wrappers) and
			// rebuild from the current text prop — avoids DOM/Svelte desync.
			root.replaceChildren();

			const chars = Array.from(txt);
			for (const ch of chars) {
				const span = document.createElement('span');
				span.className = 'mg-shuffle-char';
				span.textContent = ch;
				root.appendChild(span);
			}

			const charEls = root.querySelectorAll<HTMLElement>('.mg-shuffle-char');
			wrappers = [];
			strips = [];

			const rand = (set: string) => set.charAt(Math.floor(Math.random() * set.length)) || '';

			charEls.forEach((charEl) => {
				const parent = charEl.parentElement;
				if (!parent) return;

				const w = charEl.getBoundingClientRect().width;
				const h = charEl.getBoundingClientRect().height;
				if (!w) return;

				// Overflow-hidden wrapper
				const wrap = document.createElement('span');
				Object.assign(wrap.style, {
					display: 'inline-block',
					overflow: 'hidden',
					width: w + 'px',
					height: isVertical ? h + 'px' : 'auto',
					verticalAlign: 'bottom'
				});

				// Sliding strip
				const inner = document.createElement('span');
				Object.assign(inner.style, {
					display: 'inline-block',
					whiteSpace: isVertical ? 'normal' : 'nowrap',
					willChange: 'transform'
				});

				parent.insertBefore(wrap, charEl);
				wrap.appendChild(inner);

				const steps = rolls + 1;
				const charDisplay = isVertical ? 'block' : 'inline-block';

				// Original (first copy, hidden among clones)
				const firstOrig = charEl.cloneNode(true) as HTMLElement;
				Object.assign(firstOrig.style, { display: charDisplay, width: w + 'px', textAlign: 'center' });

				// Mark the real character
				charEl.setAttribute('data-orig', '1');
				Object.assign(charEl.style, { display: charDisplay, width: w + 'px', textAlign: 'center' });

				// Assemble strip: firstOrig → scramble clones → real charEl
				inner.appendChild(firstOrig);
				for (let k = 0; k < rolls; k++) {
					const c = charEl.cloneNode(true) as HTMLElement;
					if (charset) c.textContent = rand(charset);
					Object.assign(c.style, { display: charDisplay, width: w + 'px', textAlign: 'center' });
					inner.appendChild(c);
				}
				inner.appendChild(charEl);

				// For right/down: move real to front, first copy to back
				if (dir === 'right' || dir === 'down') {
					const firstCopy = inner.firstElementChild;
					const real = inner.lastElementChild;
					if (real) inner.insertBefore(real, inner.firstChild);
					if (firstCopy) inner.appendChild(firstCopy);
				}

				// Compute start/end positions
				let start = 0;
				let end = 0;
				if (dir === 'right') {
					start = -steps * w;
					end = 0;
				} else if (dir === 'left') {
					start = 0;
					end = -steps * w;
				} else if (dir === 'down') {
					start = -steps * h;
					end = 0;
				} else {
					// up
					start = 0;
					end = -steps * h;
				}

				// Set initial transform
				inner.style.transform = isVertical
					? `translateY(${start}px)`
					: `translateX(${start}px)`;

				if (cFrom) inner.style.color = cFrom;

				wrappers.push(wrap);
				strips.push({ inner, start, end, delay: 0 });
			});

			// Compute stagger delays
			if (mode === 'evenodd') {
				const oddCount = strips.filter((_, i) => i % 2 === 1).length;
				const evenStart = oddCount > 0 ? (dur + (oddCount - 1) * stag) * 0.7 : 0;
				strips.forEach((s, i) => {
					if (i % 2 === 1) {
						// odd group: sequential stagger from 0
						s.delay = Math.floor(i / 2) * stag;
					} else {
						// even group: sequential stagger from evenStart
						s.delay = evenStart + Math.floor(i / 2) * stag;
					}
				});
			} else {
				// random mode
				strips.forEach((s) => {
					s.delay = Math.random() * md;
				});
			}
		};

		// ── Colour interpolation cache (rebuilt per play) ──
		let fromRGB: [number, number, number] | null = null;
		let toRGB: [number, number, number] | null = null;

		// ── Single animation cycle: tweens every strip from start → end ──
		const runCycle = (onDone: () => void) => {
			const startTime = performance.now();

			const tick = (now: number) => {
				const elapsed = (now - startTime) / 1000;
				let allDone = true;

				for (const strip of strips) {
					const local = elapsed - strip.delay;
					if (local < 0) {
						allDone = false;
						continue;
					}
					const rawT = Math.min(1, local / dur);
					const t = easingFn(rawT);

					const val = strip.start + (strip.end - strip.start) * t;
					strip.inner.style.transform = isVertical
						? `translateY(${val}px)`
						: `translateX(${val}px)`;

					if (fromRGB && toRGB) {
						const r = Math.round(fromRGB[0] + (toRGB[0] - fromRGB[0]) * t);
						const g = Math.round(fromRGB[1] + (toRGB[1] - fromRGB[1]) * t);
						const b = Math.round(fromRGB[2] + (toRGB[2] - fromRGB[2]) * t);
						strip.inner.style.color = `rgb(${r},${g},${b})`;
					}

					if (rawT < 1) allDone = false;
				}

				if (allDone) {
					onDone();
					return;
				}
				currentRaf = requestAnimationFrame(tick);
			};

			currentRaf = requestAnimationFrame(tick);
		};

		// ── Play: runs one cycle, then either loops or finishes ──
		const play = () => {
			stopLoop();
			if (!strips.length) return;
			playing = true;

			if (cFrom && cTo) {
				fromRGB = parseColor(cFrom);
				toRGB = parseColor(cTo);
			}

			const onCycleComplete = () => {
				if (doLoop) {
					randomizeClones();
					resetPositions();
					onComplete?.();
					if (lDelay > 0) {
						loopTimeout = setTimeout(() => {
							loopTimeout = null;
							runCycle(onCycleComplete);
						}, lDelay * 1000);
					} else {
						runCycle(onCycleComplete);
					}
					return;
				}

				playing = false;
				cleanupToStill();
				if (cTo) {
					for (const s of strips) s.inner.style.color = cTo;
				}
				onComplete?.();
				armHover();
			};

			runCycle(onCycleComplete);
		};

		// ── Arm hover re-trigger ──
		const armHover = () => {
			if (!hover) return;
			removeHover();
			const handler = () => {
				if (playing) return;
				build();
				randomizeClones();
				play();
			};
			hoverHandler = handler;
			root.addEventListener('mouseenter', handler);
		};

		// ── IntersectionObserver (replaces GSAP ScrollTrigger) ──
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						build();
						randomizeClones();
						play();
						if (once) observer?.disconnect();
					}
				}
			},
			{
				rootMargin: rootMargin || '0px',
				threshold: [threshold]
			}
		);
		observer.observe(root);

		ready = true;

		return () => {
			stopLoop();
			removeHover();
			observer?.disconnect();
			teardown();
			ready = false;
		};
	});

	// ── Helpers ──

	/** Parse a CSS color string to [r, g, b] via a temporary canvas. */
	function parseColor(color: string): [number, number, number] {
		if (typeof document === 'undefined') return [0, 0, 0];
		const ctx = document.createElement('canvas').getContext('2d');
		if (!ctx) return [0, 0, 0];
		ctx.fillStyle = color;
		const hex = ctx.fillStyle; // normalised to #rrggbb
		const m = /^#([0-9a-f]{6})$/i.exec(hex);
		if (!m) return [0, 0, 0];
		const n = parseInt(m[1], 16);
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
	}
</script>

<svelte:element
	this={tag}
	bind:this={el}
	class="mg-shuffle-parent {ready ? 'is-ready' : ''} {className}"
	style="text-align:{textAlign};{style}"
>
	{text}
</svelte:element>

<style>
	:global(.mg-shuffle-parent) {
		display: inline-block;
		white-space: normal;
		word-wrap: break-word;
		will-change: transform;
		line-height: 1;
		font-size: 4rem;
		font-family: var(--font-sans);
		text-transform: uppercase;
		visibility: hidden;
	}

	:global(.mg-shuffle-parent.is-ready) {
		visibility: visible;
	}

	:global(.mg-shuffle-char) {
		line-height: 1;
		display: inline-block;
		text-align: center;
	}
</style>
