<script module lang="ts">
	export interface GraphCronProps {
		/** Caption drawn on the top edge as `[ TITLE ]`. */
		title: string;
		/** Standard 5-field cron expression: `min hour dom mon dow`. */
		expr: string;
		/** Number of next runs to render on the tick timeline. Default 8. */
		count?: number;
		/** Base time as ms since epoch; next runs are computed from this point. Default now. */
		baseTime?: number;
		/** Scene width in characters. Default 60. */
		cols?: number;
		/** Scene height in rows. Default 12. */
		rows?: number;
		/** Animate the tick highlight. Default true. Reduced motion freezes on first run. */
		animated?: boolean;
		/** Milliseconds per tick. Default 220. */
		speedMs?: number;
		/** Caption rendered muted under the timeline. */
		label?: string;
		class?: string;
	}

	interface ParsedCron {
		minutes: Set<number>;
		hours: Set<number>;
		doms: Set<number>;
		months: Set<number>;
		dows: Set<number>;
		/** True when both DOM and DOW are restricted — the OR-match rule applies. */
		bothRestricted: boolean;
	}

	interface RunRow {
		ms: number;
		hourMin: string;
		date: string;
	}

	interface Seg {
		text: string;
		cls?: string;
	}

	const MONTH_NAMES: Record<string, number> = {
		jan: 1,
		feb: 2,
		mar: 3,
		apr: 4,
		may: 5,
		jun: 6,
		jul: 7,
		aug: 8,
		sep: 9,
		oct: 10,
		nov: 11,
		dec: 12
	};
	const DOW_NAMES: Record<string, number> = {
		sun: 0,
		mon: 1,
		tue: 2,
		wed: 3,
		thu: 4,
		fri: 5,
		sat: 6
	};

	/** Parse a single cron field into a set of allowed integer values. */
	function parseField(
		raw: string,
		min: number,
		max: number,
		names?: Record<string, number>
	): Set<number> {
		const out = new Set<number>();
		const parts = raw.split(',');
		for (const partRaw of parts) {
			const part = partRaw.trim().toLowerCase();
			if (part === '' || part === '*') {
				for (let v = min; v <= max; v++) out.add(v);
				continue;
			}

			const stepSplit = part.split('/');
			const step = stepSplit.length > 1 ? parseInt(stepSplit[1], 10) : 1;
			if (!Number.isFinite(step) || step <= 0) {
				throw new Error(`invalid step in field: ${raw}`);
			}

			let rangeStr = stepSplit[0];
			let lo = min;
			let hi = max;
			if (rangeStr !== '*' && rangeStr !== '') {
				const rangeParts = rangeStr.split('-');
				const a = rangeParts[0];
				const b = rangeParts[1];
				lo = parseToken(a, min, max, names);
				hi = rangeParts.length > 1 && b !== undefined ? parseToken(b, min, max, names) : lo;
				if (lo > hi) {
					const tmp = lo;
					lo = hi;
					hi = tmp;
				}
			}
			for (let v = lo; v <= hi; v += step) out.add(v);
		}
		return out;
	}

	function parseToken(token: string, min: number, max: number, names?: Record<string, number>): number {
		const t = token.trim().toLowerCase();
		if (names && names[t] !== undefined) return names[t];
		const n = parseInt(t, 10);
		if (!Number.isFinite(n)) {
			throw new Error(`invalid token: ${token}`);
		}
		return Math.max(min, Math.min(max, n));
	}

	/** Parse a 5-field cron expression. Throws on invalid input. */
	export function parseCron(expr: string): ParsedCron {
		const trimmed = expr.trim();
		if (!trimmed) throw new Error('empty cron expression');
		const fields = trimmed.split(/\s+/);
		if (fields.length !== 5) {
			throw new Error(`expected 5 fields, got ${fields.length}`);
		}
		const [minF, hourF, domF, monF, dowF] = fields;
		const minutes = parseField(minF, 0, 59);
		const hours = parseField(hourF, 0, 23);
		const doms = parseField(domF, 1, 31);
		const months = parseField(monF, 1, 12, MONTH_NAMES);
		// DOW range is 0-6; treat 7 as 0 (Sunday) like Vixie cron.
		const dows = parseField(dowF, 0, 7, DOW_NAMES);
		if (dows.has(7)) {
			dows.delete(7);
			dows.add(0);
		}
		const domRestricted = domF.trim() !== '*';
		const dowRestricted = dowF.trim() !== '*';
		const bothRestricted = domRestricted && dowRestricted;
		return { minutes, hours, doms, months, dows, bothRestricted };
	}

	/** True when the given Date matches a parsed cron expression. */
	function matches(parsed: ParsedCron, d: Date): boolean {
		if (!parsed.minutes.has(d.getMinutes())) return false;
		if (!parsed.hours.has(d.getHours())) return false;
		if (!parsed.months.has(d.getMonth() + 1)) return false;
		const day = d.getDate();
		const dow = d.getDay();
		if (parsed.bothRestricted) {
			if (!parsed.doms.has(day) && !parsed.dows.has(dow)) return false;
		} else {
			if (!parsed.doms.has(day)) return false;
			if (!parsed.dows.has(dow)) return false;
		}
		return true;
	}

	/** Compute the next N run times strictly after `from` (ms). */
	export function nextRuns(expr: string, from: number, count: number): RunRow[] {
		const parsed = parseCron(expr);
		const out: RunRow[] = [];
		// Start one minute after `from` so we get strictly later runs.
		const cursor = new Date(from);
		cursor.setSeconds(0, 0);
		cursor.setMinutes(cursor.getMinutes() + 1);
		// Cap the search to four years of minutes to avoid runaway loops.
		const maxIter = 4 * 366 * 24 * 60;
		for (let i = 0; i < maxIter && out.length < count; i++) {
			if (matches(parsed, cursor)) {
				out.push(formatRun(cursor));
				cursor.setMinutes(cursor.getMinutes() + 1);
				continue;
			}
			cursor.setMinutes(cursor.getMinutes() + 1);
		}
		return out;
	}

	function pad2(n: number): string {
		return n < 10 ? `0${n}` : String(n);
	}

	function formatRun(d: Date): RunRow {
		const hourMin = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
		const month = pad2(d.getMonth() + 1);
		const day = pad2(d.getDate());
		return { ms: d.getTime(), hourMin, date: `${d.getFullYear()}-${month}-${day}` };
	}

	/** Run-length encode a row of run markers into classed segments. */
	function tickSegs(
		count: number,
		active: number,
		cols: number,
		nowCol: number,
		showNow: boolean
	): Seg[] {
		if (count <= 0 || cols <= 0) return [];
		const segs: Seg[] = [];
		// Build a string of `cols` characters where each run is a marker.

		let buf = '';
		let cls: string | undefined;

		for (let i = 0; i < cols; i++) {
			// Which run (if any) lands on this column?
			let runAt = -1;
			for (let r = 0; r < count; r++) {
				if (Math.round((r / Math.max(1, count - 1)) * (cols - 1)) === i) {
					runAt = r;
					break;
				}
			}
			let next: { ch: string; cls: string | undefined };
			if (showNow && i === nowCol) next = { ch: '|', cls: 'now' };
			else if (runAt >= 0 && runAt === active) next = { ch: '●', cls: 'hot' };
			else if (runAt >= 0) next = { ch: '·', cls: 'faint' };
			else next = { ch: ' ', cls: undefined };

			if (next.cls === cls) {
				buf += next.ch;
			} else {
				if (buf.length > 0) segs.push({ text: buf, cls });
				cls = next.cls;
				buf = next.ch;
			}
		}
		if (buf.length > 0) segs.push({ text: buf, cls });
		return segs;
	}
</script>

<script lang="ts">
	import Graph from '../frame/Graph.svelte';
	import GraphBody from '../frame/GraphBody.svelte';

	let {
		title,
		expr,
		count = 8,
		baseTime,
		cols = 60,
		rows = 12,
		animated = true,
		speedMs = 220,
		label = '',
		class: className = ''
	}: GraphCronProps = $props();

	// svelte-ignore state_referenced_locally
	const width = Math.max(20, cols);
	// svelte-ignore state_referenced_locally
	const runCount = Math.max(1, Math.min(64, count));

	const moving = $derived(
		animated &&
			(typeof window === 'undefined' ||
				!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	const parsed = $derived.by(() => {
		try {
			return { ok: true as const, value: parseCron(expr) };
		} catch (err) {
			return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
		}
	});

	const runs = $derived.by((): RunRow[] => {
		if (!parsed.ok) return [];
		const base = baseTime ?? Date.now();
		try {
			return nextRuns(expr, base, runCount);
		} catch {
			return [];
		}
	});

	// Tick: when animated, advance which run is "active" on the timeline.
	let tick = $state(0);
	$effect(() => {
		if (!moving || runs.length < 2) {
			tick = 0;
			return;
		}
		const timer = window.setInterval(() => {
			tick = (tick + 1) % runs.length;
		}, Math.max(60, speedMs));
		return () => window.clearInterval(timer);
	});

	// Frozen state: highlight the first run.
	const active = $derived(moving ? tick : 0);

	// "Now" indicator column — the cursor that sweeps across.
	const nowCol = $derived.by(() => {
		if (runs.length < 2) return -1;
		const spanMs = runs[runs.length - 1].ms - runs[0].ms;
		if (spanMs <= 0) return 0;
		// Sweep one slot per (spanMs / count) of the way per tick.
		const totalTicks = runs.length;
		const slot = Math.min(totalTicks - 1, Math.floor((tick / totalTicks) * totalTicks));
		return Math.round((slot / Math.max(1, runs.length - 1)) * (width - 1));
	});

	// Build the row-by-row view: row 0 = cron expression echo,
	// row 1 = the tick timeline, row 2 = date ribbon, row 3 = hour:min labels,
	// row 4 = next/now caption.
	const headerLine = $derived(
		parsed.ok ? `${expr}` : `error: ${parsed.error}`
	);
	const headerPad = $derived(
		' '.repeat(Math.max(0, Math.floor((width - headerLine.length) / 2)))
	);
	const headerRightPad = $derived(
		' '.repeat(Math.max(0, width - headerLine.length - headerPad.length))
	);

	const tickRow = $derived(tickSegs(runs.length, active, width, nowCol, moving));

	// Date ribbon under the tick line, left-aligned to the markers.
	const dateRow = $derived.by((): Seg[] => {
		if (runs.length === 0) return [{ text: ' '.repeat(width) }];
		const slots = runs.map((r) => r.date);
		const segs: Seg[] = [];
		const cells = width;
		for (let i = 0; i < cells; i++) {
			// Which run (if any) maps to this column?
			let runAt = -1;
			for (let r = 0; r < runs.length; r++) {
				if (Math.round((r / Math.max(1, runs.length - 1)) * (cells - 1)) === i) {
					runAt = r;
					break;
				}
			}
			const ch = runAt >= 0 ? slots[runAt].slice(-2) : ' ';
			const cls = runAt === active ? 'hot' : runAt >= 0 ? 'faint' : undefined;
			if (segs.length === 0 || segs[segs.length - 1].cls !== cls) {
				segs.push({ text: ch, cls });
			} else {
				segs[segs.length - 1] = { text: segs[segs.length - 1].text + ch, cls };
			}
		}
		return segs;
	});

	// Hour:min ribbon.
	const hourMinRow = $derived.by((): Seg[] => {
		if (runs.length === 0) return [{ text: ' '.repeat(width) }];
		const segs: Seg[] = [];
		for (let i = 0; i < width; i++) {
			let runAt = -1;
			for (let r = 0; r < runs.length; r++) {
				if (Math.round((r / Math.max(1, runs.length - 1)) * (width - 1)) === i) {
					runAt = r;
					break;
				}
			}
			const ch = runAt >= 0 ? runs[runAt].hourMin : ' ';
			const cls = runAt === active ? 'hot' : runAt >= 0 ? 'faint' : undefined;
			if (segs.length === 0 || segs[segs.length - 1].cls !== cls) {
				segs.push({ text: ch, cls });
			} else {
				segs[segs.length - 1] = { text: segs[segs.length - 1].text + ch, cls };
			}
		}
		return segs;
	});

	// "next: 2026-09-06 12:30" caption.
	const captionText = $derived.by(() => {
		if (runs.length === 0) return 'no runs match this expression';
		const r = runs[active] ?? runs[0];
		return `next: ${r.date} ${r.hourMin}`;
	});

	const captionRow = $derived.by((): Seg[] => {
		const text = ` ${captionText}`;
		const pad = Math.max(0, width - text.length);
		return [{ text: text + ' '.repeat(pad), cls: 'ax' }];
	});

	const headerRow = $derived.by((): Seg[] => {
		const text = `${headerPad}${headerLine}${headerRightPad}`;
		return [{ text, cls: parsed.ok ? 'ax' : 'warn' }];
	});
</script>

<Graph {title} class={className}>
	<GraphBody>
		<div class="viewport">
			<pre class="art" aria-hidden="true"><code>{#each [headerRow] as row, r (r)}{#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{'\n'}{/each}{#each [tickRow] as row, r (r)}{#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{'\n'}{/each}{#each [dateRow] as row, r (r)}{#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{'\n'}{/each}{#each [hourMinRow] as row, r (r)}{#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{'\n'}{/each}{#each [captionRow] as row, r (r)}{#each row as seg, j (j)}{#if seg.cls}<span class={seg.cls}>{seg.text}</span>{:else}{seg.text}{/if}{/each}{/each}</code></pre>
			{#if label}
				<p class="caption">{label}</p>
			{/if}
			<span class="sr-only">
				Cron timeline. Expression: {parsed.ok ? expr : `error: ${parsed.error}`}. {runs.length} runs.
			</span>
		</div>
	</GraphBody>
</Graph>

<style>
	.viewport {
		overflow-x: auto;
	}

	.art {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.35;
		color: var(--text-primary, oklch(0.93 0 0));
		white-space: pre;
		font-variant-numeric: tabular-nums;
	}

	.hot {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		font-weight: 600;
	}

	.faint {
		color: var(--text-muted, oklch(0.3 0 0));
	}

	.now {
		color: var(--graph-accent-2, oklch(0.78 0.12 70));
	}

	.ax {
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.warn {
		color: var(--graph-accent-3, oklch(0.72 0.13 30));
	}

	.caption {
		margin: 0.4rem 0 0;
		font-size: 0.78rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border-width: 0;
	}
</style>
