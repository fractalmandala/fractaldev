<script lang="ts">
	import MainSection from '$lib/components/shell/MainSection.svelte';
	import Logo from '$lib/icons/fslogobig.svelte';
	import Heart from '$lib/icons/heart.svelte';
	import { packFeatures } from '$lib/data/features';
	import '$lib/transitions/reveal.css';
	import { Divider } from '$lib/components/wa/divider';
	let sY = $state(0);

	const stack = [
		[
			'fractalstyler · the contract',
			'250 classes, 41 palettes, four preset dials. Plain CSS or editable SASS.'
		],
		[
			'fractalsvelte · 196 components',
			'Buttons through command palettes and morphing modals. No style props — they read the contract, so one theme change moves all of them.'
		],
		[
			'fractalthemer · atmosphere',
			'GPU auras, patterns, gradients, and a studio for building your own palettes.'
		],
		[
			'fractalicons · 9,869 icons',
			'Nine families, one component. They paint with currentColor at 1em, so the type and ink classes style them for free.'
		],
		['svelte-animated-icon · 22 motions', 'Native Web Animations API. No animation dependency.'],
		['fractalgraphy · diagrams', 'ASCII-framed graphs for markdown. Zero dependencies.']
	];

	const stackLines = [
		['Tailwind + shadcn, or this. Both are complete. Only one is yours.', 'Hero'],
		["Components that read your tokens, not someone else's utilities.", 'Stack'],
		['196 components. Change one token, move all of them.', 'Stack'],
		['A whole stack with no framework underneath it.', 'Stack']
	];

	const taglines = [
		['Compose in markup. Write no stylesheet.', 'Primary'],
		['A scaffold and a harness.', 'Primary'],
		['It decides proportion. You decide everything else.', 'Primary'],
		['Maximum consistency, minimum opinionation.', 'Positioning'],
		['The class registry is the API.', 'Technical'],
		['x is always horizontal. Always.', 'Feature'],
		['Six goes to three, then two. Never five.', 'Feature'],
		["Harmony is arithmetic before it's taste.", 'Feature'],
		['Your system, not mine.', 'Positioning'],
		['One stylesheet. No build step. No opinions about your colours.', 'Meta'],
		['Everything is a fractal.', 'Brand'],
		['Learn the rule once. It holds at every scale.', 'Brand'],
		['Delete it by deleting one file.', 'Trust'],
		["Built so your agent can't improvise.", 'Agent']
	];

	const hooks = [
		[
			'No build step, no exceptions',
			'One compiled stylesheet, 23kb gzipped. Link it and start. The SASS source is there if you ever want to retune the generators — most people never will.'
		],
		[
			"Grids that can't strand a card",
			'Six steps to three, then two, then one. Never five, never four. The stepping is built from divisors, so no row is ever left holding one item.'
		],
		[
			'Alignment you stop thinking about',
			'x is horizontal and y is vertical in every container. Flip a box to a row and the class names don’t change.'
		],
		[
			'Type and space that already scale',
			'Fluid clamps between 360 and 1240. One class is correct at every width — no breakpoints to maintain, nothing to re-decide.'
		],
		[
			'Forty-one palettes, four dials',
			'Shape, density, contrast, motion — attributes on one element. Same markup, wholly different product. All of it works with JavaScript off.'
		],
		[
			'A shell that retracts itself',
			'Copy the canonical markup and the rails retract, the drawer opens, the table of contents folds. You author no breakpoints.'
		],
		[
			'Agents get a contract, not a vibe',
			"A grepable registry, an MCP server, and a linter that rejects invented class names. The tooling catches what the model's priors get wrong."
		],
		[
			'Leaves no marks',
			'Plain classes, no runtime, no build coupling. Removing it means deleting one file. Nothing in your app imports it.'
		]
	];

	// Hero sequence. The Revealer above runs duration 0.9 with stagger 0.3 over
	// three children, landing near 1.5s — the pills pick up just after it, then
	// the sign-off after them. Delays are explicit rather than leaning on
	// reveal.css's nth-child rules, which only run to :nth-child(6).
	const pills = [
		'build step',
		'config file',
		'purge pass',
		'postcss plugin',
		'content globs',
		'canon layouts',
		'skills and scaffolds'
	];
	const PILLS_AT = 1.45;
	const PILL_STEP = 0.07;
	const SIGNOFF_AT = PILLS_AT + PILL_STEP * pills.length + 0.15;

	const absences = [
		'build step',
		'config file',
		'purge pass',
		'postcss plugin',
		'content globs',
		'runtime',
		'dependencies'
	];
</script>

<svelte:window bind:scrollY={sY} />

<section class="main-section grow">
	<div class="content-section">
		<div class="marg-auto ycenter box gap-xl h88-vh">
			<div class="grid-2">
				<div class="box gap-lg">
					<Logo />
					<p class="text-2xl weight-300 text-secondary lh15 prose">
						A composition styling system with a fluid design, canonical layout scaffolds, a presets
						architecture and themeable construct.
					</p>
					<div title="features" class="marg-top-lg row gap-bs pad-y-bs">
						{#each packFeatures as item, i}
							{#if i > 0}
								<span class="text-theme">|</span>
							{/if}

							<span class="font-mono text-sm" style="transition-delay: {PILLS_AT + i * PILL_STEP}s">
								{item.name}
							</span>
						{/each}
					</div>
					<div class="row ycenter marg-top-2xl">
						<span class="row ycenter gap-xs text-secondary text-xs">
							built with <div class="marg-top-xs"><Heart size={16} /></div>
							 for Sveltekit.
						</span>
					</div>
				</div>
				<div class="box">
					<img
						class="marg-auto marg-bottom-lg"
						style="width: 200px; height: 200px"
						src="/images/fractalstyler.png"
						alt="site logo"
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="marg-auto ycenter box gap-xl h88-vh">
		<div class="box xcenter gap-bs marg-auto xcenter">
			<img
				class="marg-auto marg-bottom-lg"
				style="width: 200px; height: 200px; transform-origin: center center; transform: rotate({sY *
					0.6}deg)"
				src="/images/fractalstyler.png"
				alt="site logo"
			/>
			<div class="marg-auto marg-y-sm">
				<Logo />
			</div>
			<p class="text-2xl weight-300 text-secondary lh15 ta-c prose marg-auto">
				A composition styling system with a fluid design, canonical layout scaffolds, a presets
				architecture and themeable construct.
			</p>
			<div title="features" class="marg-top-lg row gap-bs pad-x-3xl pad-y-xl">
				{#each packFeatures as item, i}
					{#if i > 0}
						<span class="text-theme">|</span>
					{/if}

					<span class="font-mono" style="transition-delay: {PILLS_AT + i * PILL_STEP}s">
						{item.name}
					</span>
				{/each}
			</div>
			<div class="row ycenter xcenter marg-auto">
				<span class="row ycenter gap-xs text-bs text-secondary">
					Built with <div class="marg-top-xs"><Heart /></div>
					 for Sveltekit.
				</span>
			</div>
		</div>
	</div>
	<div class="marg-auto xcenter box hfull-vh rv-reveal border-top pad-top-xl">
		<div class="box pad-y-2xl">
			<h2 class="text-5xl">यथा पिण्डे तथा ब्रह्माण्डे</h2>
			<h3>yathā piṇḍe tathā brahmāṇḍe</h3>
			<h3>As in the microcosm, so in the macrocosm</h3>
			<span>...as above, so below...</span>
			<p>
				It's the oldest of all designs, the very schema of reality. The same rules holding at every
				level of scale. Multi-level and coherent.
			</p>
			<p>
				fractalstyler is a styling system and design philosophy inspired by this idea. Explore the
				idea here.
			</p>
		</div>
	</div>
</section>
