<script lang="ts">
	import { useReducedMotion } from '@humanspeak/svelte-motion';

	interface FireOptions {
		/** Horizontal origin as a fraction of viewport width (0..1). */
		x?: number;
		/** Vertical origin as a fraction of viewport height (0..1). */
		y?: number;
		/** Piece count. */
		count?: number;
		/** Total flight time in ms. */
		duration?: number;
	}

	interface Props {
		/** Fixed palette override; defaults to the active theme tokens. */
		colors?: string[];
		class?: string;
	}

	let { colors, class: className }: Props = $props();

	const reduce = useReducedMotion();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let ctx: CanvasRenderingContext2D | null = null;

	interface Piece {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		color: string;
		shape: 'rect' | 'circle';
		rotation: number;
		rotationSpeed: number;
		born: number;
		life: number;
	}

	let pieces: Piece[] = [];
	let raf = 0;

	// Resolved at fire time so a theme switch applies to the next burst.
	function themeColors(): string[] {
		if (colors && colors.length > 0) return colors;
		const css = getComputedStyle(canvasEl as HTMLCanvasElement);
		const pick = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
		return [
			pick('--theme-color', '#04825b'),
			pick('--danger', '#ef4444'),
			pick('--success', '#10b981'),
			pick('--warning', '#f59e0b'),
			pick('--info', '#3b82f6')
		];
	}

	function sizeCanvas() {
		const canvas = canvasEl;
		if (!canvas) return;
		const dpr = window.devicePixelRatio || 1;
		canvas.width = Math.round(window.innerWidth * dpr);
		canvas.height = Math.round(window.innerHeight * dpr);
		ctx = canvas.getContext('2d');
		ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	/** Fire a burst. Coordinates are viewport fractions (default 0.5 / 0.45). */
	export function fire(opts: FireOptions = {}) {
		if (reduce.current || !canvasEl) return;
		sizeCanvas();
		const count = opts.count ?? 90;
		const duration = opts.duration ?? 2600;
		const ox = (opts.x ?? 0.5) * window.innerWidth;
		const oy = (opts.y ?? 0.45) * window.innerHeight;
		const palette = themeColors();
		const born = performance.now();
		for (let i = 0; i < count; i++) {
			const angle = ((-90 + (Math.random() - 0.5) * 70) * Math.PI) / 180;
			const speed = 7 + Math.random() * 8;
			pieces.push({
				x: ox,
				y: oy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: 3 + Math.random() * 4,
				color: palette[Math.floor(Math.random() * palette.length)],
				shape: Math.random() > 0.4 ? 'rect' : 'circle',
				rotation: Math.random() * Math.PI,
				rotationSpeed: (Math.random() - 0.5) * 0.3,
				born,
				life: duration * (0.7 + Math.random() * 0.3)
			});
		}
		if (!raf) raf = requestAnimationFrame(tick);
	}

	function tick(time: number) {
		const canvas = canvasEl;
		if (!canvas || !ctx) {
			raf = 0;
			return;
		}
		const w = window.innerWidth;
		const h = window.innerHeight;
		ctx.clearRect(0, 0, w, h);
		pieces = pieces.filter((p) => time - p.born < p.life && p.y < h + 40);
		for (const p of pieces) {
			p.vy += 0.18; // gravity
			p.vx *= 0.99; // drag
			p.vy *= 0.995;
			p.x += p.vx;
			p.y += p.vy;
			p.rotation += p.rotationSpeed;
			const age = (time - p.born) / p.life;
			ctx.save();
			ctx.globalAlpha = age > 0.75 ? Math.max(0, 1 - (age - 0.75) / 0.25) : 1;
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rotation);
			ctx.fillStyle = p.color;
			if (p.shape === 'rect') {
				ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
			} else {
				ctx.beginPath();
				ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}
		if (pieces.length > 0) {
			raf = requestAnimationFrame(tick);
		} else {
			raf = 0;
			ctx.clearRect(0, 0, w, h);
		}
	}

	$effect(() => {
		return () => {
			if (raf) cancelAnimationFrame(raf);
			raf = 0;
		};
	});
</script>

<canvas bind:this={canvasEl} class={className} data-slot="confetti-canvas" aria-hidden="true"></canvas>
