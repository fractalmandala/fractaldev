<script lang="ts">
	/**
	 * The philosophy deck — an eight-slide orientation to the two roots of this
	 * system: Pāṇini's compression-by-context, and ṛta's self-similarity at every
	 * scale. Styling lives in `_09_deck.sass` (scoped to `.pdeck`).
	 *
	 * The shell composer on slide 6 validates against the REAL sanctioned set from
	 * the preset system, so the demo cannot drift from the grammar it advertises.
	 */
	import { untrack } from 'svelte';
	import { presetAxes } from '$lib/ui/presets.svelte';

	interface Props {
		/** Extra classes on the root. */
		class?: string;
		/** Slide to open on (0-indexed). */
		start?: number;
	}

	let { class: className = '', start = 0 }: Props = $props();

	// --- navigation ---------------------------------------------------------
	const COUNT = 8;
	// `start` seeds the deck once; later changes to the prop don't yank the viewer
	// to another slide, so the initial read is deliberately untracked.
	let index = $state(untrack(() => start));

	function go(n: number): void {
		index = (n + COUNT) % COUNT;
	}

	function onKeydown(e: KeyboardEvent): void {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
			e.preventDefault();
			go(index + 1);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			go(index - 1);
		}
	}

	let touchX: number | null = null;

	function onTouchStart(e: TouchEvent): void {
		touchX = e.changedTouches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent): void {
		if (touchX === null) return;
		const dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
		touchX = null;
	}

	// --- slide 1 · the collapse ---------------------------------------------
	// The spaces become the hyphens; every other dropped glyph collapses to zero
	// width. `to` is the character a surviving glyph becomes once collapsed.
	const SOURCE = 'border pad-sm gap-lg';
	const SURVIVORS: Record<number, string> = { 0: 'b', 6: '-', 7: 'p', 11: 's', 13: '-', 14: 'g', 18: 'l' };

	const glyphs = [...SOURCE].map((ch, n) => ({ ch, keep: n in SURVIVORS, to: SURVIVORS[n] ?? '' }));

	let collapsed = $state(false);
	let caption = $state('');

	$effect(() => {
		if (index !== 0) return;
		collapsed = false;
		caption = '';
		const toCollapse = setTimeout(() => (collapsed = true), 1100);
		const toCaption = setTimeout(() => (caption = 'b-ps-gl'), 1660);
		return () => {
			clearTimeout(toCollapse);
			clearTimeout(toCaption);
		};
	});

	// --- slide 3 · the three devices ----------------------------------------
	const DEVICES = [
		{ dv: 'अधिकार', tr: 'adhikāra', ds: 'A heading governs everything beneath it. Declare once, at the boundary.' },
		{ dv: 'अनुवृत्ति', tr: 'anuvṛtti', ds: 'What came before continues. Nothing is restated to stay true.' },
		{ dv: 'अपवाद', tr: 'apavāda', ds: 'The general rule holds. You write only the exception.' }
	];

	// --- slide 5 · the ladder -----------------------------------------------
	const LADDER = [
		{ lv: 'L0', nm: 'tokens', ds: 'colour · size · type', w: 44 },
		{ lv: 'L1', nm: 'dimensions', ds: 'gap · padding · margin', w: 54 },
		{ lv: 'L2', nm: 'containers', ds: 'boxes · cards · controls', w: 65 },
		{ lv: 'L3', nm: 'layouts', ds: 'grids · sections · pages', w: 77 },
		{ lv: 'L4', nm: 'shells', ds: 'the frame around it all', w: 89 },
		{ lv: 'L5', nm: 'visuals', ds: 'surface · state · motion', w: 100 }
	];

	// --- slide 6 · the live composer ----------------------------------------
	const REGIONS = [
		{ k: 'l', nm: 'nav rail' },
		{ k: 'r', nm: 'toc rail' },
		{ k: 'f', nm: 'footer' },
		{ k: 'a', nm: 'article' }
	] as const;

	const SHELL_NAMES: Record<string, string> = {
		lrf: 'full',
		lrfa: 'docs',
		lr: 'no footer',
		lra: 'docs, no footer',
		lf: 'no toc',
		l: 'nav only',
		f: 'no rails',
		c: 'bare'
	};

	let shell = $state<Record<string, boolean>>({ l: true, r: true, f: true, a: false });

	// Canonical spelling: letters in declared order; no region at all reads `c`.
	const value = $derived(REGIONS.map((r) => r.k).filter((k) => shell[k]).join('') || 'c');
	// Validated against the shipped axis — an unsanctioned spelling says so.
	const sanctioned = $derived((presetAxes.shell as readonly string[]).includes(value));
	const valueName = $derived(sanctioned ? (SHELL_NAMES[value] ?? value) : 'unsanctioned');

	function toggle(k: string): void {
		shell[k] = !shell[k];
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div
	class="pdeck {className}"
	role="group"
	aria-roledescription="carousel"
	aria-label="fractutils philosophy deck"
	ontouchstart={onTouchStart}
	ontouchend={onTouchEnd}
>
	<div class="pd-idx">{String(index + 1).padStart(2, '0')} — 08</div>
	<div class="pd-brand">fractutils</div>

	<!-- 1 · the collapse -->
	<section class="pd-slide" class:active={index === 0}>
		<div class="pd-tag">the collapse</div>
		<div class="pd-collapse" class:done={collapsed}>
			{#each glyphs as g}
				<span class:keep={g.keep} class:drop={!g.keep}>{collapsed && g.to ? g.to : g.ch}</span>
			{/each}
		</div>
		<div class="pd-cap">{caption}</div>
		<p>
			Same meaning. Same output. <b>Seven characters.</b> Nothing was abbreviated into a private
			code — the system simply stopped asking you to repeat what it already knows.
		</p>
	</section>

	<!-- 2 · Pāṇini -->
	<section class="pd-slide" class:active={index === 1}>
		<div class="pd-tag">2,500 years ago</div>
		<h1>One grammarian<br /><u>solved</u> it.</h1>
		<p>
			Pāṇini compressed the whole of Sanskrit into four thousand rules — not by shortening words,
			but by building a system precise enough that
			<b>a rule need only state what the rule before it did not.</b>
		</p>
		<div class="pd-strip">
			<span class="pd-dv">अष्टाध्यायी</span> &nbsp;·&nbsp; 8 chapters &nbsp;·&nbsp; 4,000 sūtras
			&nbsp;·&nbsp; 0 repetition
		</div>
	</section>

	<!-- 3 · the three devices -->
	<section class="pd-slide" class:active={index === 2}>
		<div class="pd-tag">three devices</div>
		<h2>Meaning, carried by <u>context</u>.</h2>
		<div class="pd-devices">
			{#each DEVICES as d}
				<div class="pd-device">
					<div class="pd-dv">{d.dv}</div>
					<div class="pd-tr">{d.tr}</div>
					<div class="pd-ds">{d.ds}</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- 4 · ṛta · the fractal root -->
	<section class="pd-slide" class:active={index === 3}>
		<div class="pd-tag"><span class="pd-dv">ऋत</span> — the order of reality</div>
		<div class="pd-verse">यथा पिण्डे तथा ब्रह्माण्डे<br />यथा ब्रह्माण्डे तथा पिण्डे</div>
		<div class="pd-translit">yathā piṇḍe tathā brahmāṇḍe | yathā brahmāṇḍe tathā piṇḍe</div>
		<div class="pd-micmac">
			<figure class="pd-mm">
				<div class="pd-q sm"><i></i><i class="hot"></i><i></i><i></i></div>
				<figcaption><b>पिण्ड</b>piṇḍa · the atom</figcaption>
			</figure>
			<div class="pd-eq">&#8596;</div>
			<figure class="pd-mm">
				<div class="pd-q lg">
					{#each [0, 1, 2, 3] as _}
						<div class="pd-cell"><i></i><i class="hot"></i><i></i><i></i></div>
					{/each}
				</div>
				<figcaption><b>ब्रह्माण्ड</b>brahmāṇḍa · the cosmos</figcaption>
			</figure>
		</div>
		<p>
			The Upaniṣads' oldest ordering principle: <b>as in the atom, so in the cosmos.</b> The great
			design is fractal — so why should a styling system be anything else?
		</p>
	</section>

	<!-- 5 · the ladder -->
	<section class="pd-slide" class:active={index === 4}>
		<div class="pd-tag">everything is a fractal</div>
		<h2>One layer <u>seeds</u> the next.</h2>
		<div class="pd-ladder">
			{#each LADDER as rung, n}
				<div class="pd-rung" style="width:{rung.w}%;animation-delay:{0.15 + n * 0.1}s">
					<span class="pd-lv">{rung.lv}</span>
					<span class="pd-nm">{rung.nm}</span>
					<span class="pd-ds">{rung.ds}</span>
				</div>
			{/each}
		</div>
		<p>
			Tokens and dimensions fill containers and layouts <b>from within</b>; in the very same syntax,
			shells wrap them <b>from outside</b>. At every level, the structure mirrors itself.
		</p>
	</section>

	<!-- 6 · the live composer -->
	<section class="pd-slide" class:active={index === 5}>
		<div class="pd-tag">compose, don't configure</div>
		<h2>The shell is a word<br />you <u>spell</u>.</h2>
		<div class="pd-composer">
			<div class="pd-keys">
				{#each REGIONS as r}
					<button
						type="button"
						class="pd-key"
						aria-pressed={shell[r.k]}
						onclick={() => toggle(r.k)}
					>
						<span class="pd-ltr">{r.k}</span>
						<span class="pd-nm">{r.nm}</span>
					</button>
				{/each}
			</div>
			<div class="pd-wire">
				<div class="pd-head">header</div>
				<div class="pd-bodyrow">
					<div class="pd-rail" class:off={!shell.l}>nav</div>
					<div class="pd-mainrow">
						<div class="pd-art" class:wide={!shell.a}>
							{#if shell.a}<span>article</span><b>max 640</b>{:else}<span>content</span>{/if}
						</div>
					</div>
					<div class="pd-rail r" class:off={!shell.r}>toc</div>
				</div>
				<div class="pd-foot" class:off={!shell.f}>footer</div>
			</div>
		</div>
		<div class="pd-value">
			<s>data-shell=&quot;</s><b>{value}</b><s>&quot;</s>
			<i>{valueName}</i>
		</div>
	</section>

	<!-- 7 · the arithmetic -->
	<section class="pd-slide" class:active={index === 6}>
		<div class="pd-tag">the arithmetic</div>
		<h1>A vocabulary that <u>prunes</u> itself.</h1>
		<div class="pd-figs">
			<div class="pd-f"><b>31,968</b><i>expressible</i></div>
			<div class="pd-f"><b class="hot">12 KB</b><i>actually shipped</i></div>
			<div class="pd-f"><b>1</b><i>grammar</i></div>
		</div>
	</section>

	<!-- 8 · close -->
	<section class="pd-slide" class:active={index === 7}>
		<div class="pd-tag">two roots, one system</div>
		<h1>Write only the<br />distinction that <u>matters</u>.</h1>
		<div class="pd-mark">fract<span>utils</span></div>
		<p>
			From Pāṇini, <b>compression by context</b> — say it once, let scope carry the rest. From ṛta,
			<b>self-similarity at every scale</b> — as in the atom, so in the cosmos. This is both,
			wearing CSS.
		</p>
	</section>

	<button class="pd-nav prev" aria-label="Previous slide" onclick={() => go(index - 1)}>
		&#8249;
	</button>
	<button class="pd-nav next" aria-label="Next slide" onclick={() => go(index + 1)}>
		&#8250;
	</button>

	<div class="pd-dots">
		{#each { length: COUNT } as _, n}
			<button
				type="button"
				class="pd-dot"
				class:on={index === n}
				aria-label="Slide {n + 1}"
				onclick={() => go(n)}
			></button>
		{/each}
	</div>
</div>
