<script lang="ts">
	import type { Component } from 'svelte';
	import * as Icons from '$lib/hero';
	import { TEMPLATES } from '$lib/core/templates.svelte';
	import FileCopy from '$lib/flowbite/icons/FileCopy.svelte';
	import EasingControl from '$lib/components/EasingControl.svelte';

	const ICONS = Icons as unknown as Record<string, Component>;
	const VARIANTS = ['outline', 'solid'];
	const allIcons = Object.keys(ICONS);

	function variantKind(v: string): 'fill' | 'line' {
		return v === 'solid' ? 'fill' : 'line';
	}

	let template = $state('draw');
	let size = $state(28);
	let trigger = $state<'hover' | 'mount'>('hover');
	let loop = $state(false);
	let speed = $state(1);
	let easing = $state<string | null>(null);
	let variant = $state('outline');
	let search = $state('');
	let limit = $state(120);
	let selected = $state<string | null>(null);
	let colorSelect = $state('default');
	const color = $derived(
		colorSelect === 'default' ? null :
		colorSelect === 'primary' ? 'var(--text10)' :
		colorSelect === 'secondary' ? 'var(--text20)' :
		colorSelect === 'green' ? 'var(--text100)' :
		colorSelect
	);
	let copiedImport = $state(false);
	let copiedUsage = $state(false);
	let usageBar = $state<HTMLElement | undefined>();

	const filtered = $derived(
		search.trim()
			? allIcons.filter((n) => n.toLowerCase().includes(search.trim().toLowerCase()))
			: allIcons
	);
	const shown = $derived(filtered.slice(0, limit));

	const templatesForVariant = $derived(
		TEMPLATES.filter((t) => !t.for || t.for === variantKind(variant))
	);

	$effect(() => {
		if (!templatesForVariant.some((t) => t.id === template)) {
			template = templatesForVariant[0]?.id ?? 'pop';
		}
	});

	$effect(() => {
		search;
		variant;
		limit = 120;
		selected = null;
	});

	$effect(() => {
		function onWindowClick(e: MouseEvent) {
			if (!selected) return;
			if (usageBar?.contains(e.target as Node)) return;
			selected = null;
		}
		window.addEventListener('click', onWindowClick);
		return () => window.removeEventListener('click', onWindowClick);
	});

	$effect(() => {
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && selected) selected = null;
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	function importSnippet(icon: string): string {
		return `<script lang="ts">\n\timport { ${icon} } from 'svelte-animated-icon/hero';\n</` + `script>`;
	}

	function usageSnippet(icon: string): string {
		const v = variant === 'outline' ? '' : ` variant="${variant}"`;
		const tr = trigger === 'mount' ? ' trigger="mount"' : '';
		const sp = speed !== 1 ? ` speed={${speed}}` : '';
		const ez = easing ? ` easing="${easing}"` : '';
		const l = loop ? ' loop' : '';
		const c = color ? ` color="${color}"` : '';
		return `<${icon} template="${template}"${v}${tr}${sp}${ez} size={${size}}${l}${c} />`;
	}

	async function copyImport(): Promise<void> {
		if (!selected) return;
		await navigator.clipboard.writeText(importSnippet(selected));
		copiedImport = true;
		setTimeout(() => (copiedImport = false), 1500);
	}

	async function copyUsage(): Promise<void> {
		if (!selected) return;
		await navigator.clipboard.writeText(usageSnippet(selected));
		copiedUsage = true;
		setTimeout(() => (copiedUsage = false), 1500);
	}
</script>

<svelte:head>
	<title>Hero Icons · Svelte Animated Icon</title>
	<meta name="description" content="Explore and customize Hero animated icons for Svelte 5. Select variants, adjust speed, easing, and copy production-ready code snippets." />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://svelte-animated-icon.vercel.app/hero" />
	<meta property="og:title" content="Hero Icons · Svelte Animated Icon" />
	<meta property="og:description" content="Explore and customize Hero animated icons for Svelte 5. Select variants, adjust speed, easing, and copy production-ready code snippets." />
	<meta property="og:image" content="https://svelte-animated-icon.vercel.app/images/svelte-animated-icon.webp" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://svelte-animated-icon.vercel.app/hero" />
	<meta property="twitter:title" content="Hero Icons · Svelte Animated Icon" />
	<meta property="twitter:description" content="Explore and customize Hero animated icons for Svelte 5. Select variants, adjust speed, easing, and copy production-ready code snippets." />
	<meta property="twitter:image" content="https://svelte-animated-icon.vercel.app/images/svelte-animated-icon.webp" />
</svelte:head>

<div class="page-header">
	<h1 class="ls-tightx">Hero Icons</h1>
	<p class="col2 text-md">
		{allIcons.length} icons · outline and solid variants · hover to animate.
	</p>
</div>
<section class="display-grid">
	<div class="controls box gap16">
		<div class="usage-bar box" class:active={selected} bind:this={usageBar} use:autoAnimate>
			{#if selected}
				<div class="row gap8 ycenter xbetween">
					<span class="text-xs col3 font20 w500">Import Statement</span>
					<button class="icon-btn" onclick={copyImport}>
						<span class="col-theme">{copiedImport ? 'Copied!' : ''}</span>
						<FileCopy template="draw" speed={2.25} easing="cubic-bezier(0.32, 0, 0.67, 0)" size={20} />
					</button>
				</div>
				<pre class="language-svelte"><code class="language-svelte"
					>{importSnippet(selected)}</code
				></pre>

				<div class="row gap8 ycenter xbetween" style="border-top: 1px solid var(--border20)">
					<span class="text-xs col3 font20 w500">Component Usage</span>
					<button class="icon-btn" onclick={copyUsage}>
						<span class="col-theme">{copiedUsage ? 'Copied!' : ''}</span>
						<FileCopy template="draw" speed={2.25} easing="cubic-bezier(0.32, 0, 0.67, 0)" size={20} />
					</button>
				</div>
				<pre class="language-svelte"><code class="language-svelte"
					>{usageSnippet(selected)}</code
				></pre>
			{/if}
		</div>
		<div class="box gap4 variants-box">
			<span class="text-sm col2 font20 w500">Icon Variant:</span>
			<div class="row gap4">
				{#each VARIANTS as v (v)}
					<button
						class="standard-btn small"
						class:active={variant === v}
						onclick={() => (variant = v)}
					>
						{v}
					</button>
				{/each}
			</div>
		</div>
		<div class="box gap4 search-box">
			<input
				class="control-search"
				type="search"
				placeholder="Search {filtered.length} icons…"
				bind:value={search}
			/>
		</div>
		<div class="box gap4 templates-box">
			<span class="text-sm col2 font20 w500">Select Animated Type:</span>
			<select class="styled-select" bind:value={template}>
				{#each templatesForVariant as t (t.id)}
					<option value={t.id}>{t.label}</option>
				{/each}
			</select>
		</div>
		<div class="box gap4 colors-box">
			<span class="text-sm col2 font20 w500">Color:</span>
			<div class="row gap4 wrap">
				{#each ['primary', 'secondary', 'tomato', 'green'] as c}
					<button
						class="standard-btn small"
						class:active={colorSelect === c}
						onclick={() => (colorSelect = c)}
					>
						{c}
					</button>
				{/each}
			</div>
		</div>
		<div class="border-box box gap16">
			<div class="box sliders-box gap8">
				<label class="slider row ycenter gap8">
					<span class="text-sm col2 font20 w500">Size</span>
					<input type="range" min="12" max="64" step="4" bind:value={size} />
					<span class="text-sm col2 font20 w500">{size}px</span>
				</label>
				<label class="slider row ycenter gap8">
					<span class="text-sm col2 font20 w500">Speed</span>
					<input type="range" min="0.25" max="3" step="0.25" bind:value={speed} />
					<span class="text-sm col2 font20 w500">{speed}x</span>
				</label>
			</div>
			<div class="row checkboxes-box gap16">
				<label class="row ycenter gap4">
					<input
						type="checkbox"
						checked={trigger === 'mount'}
						onchange={(e) => (trigger = e.currentTarget.checked ? 'mount' : 'hover')}
					/>
					<span class="text-sm col2 font20 w500 tt-u">Autoplay</span>
				</label>
				<label class="row ycenter gap4">
					<input type="checkbox" bind:checked={loop} />
					<span class="text-sm col2 font20 w500 tt-u">Loop</span>
				</label>
			</div>
		</div>
		<div class="box easing-box gap4">
			<EasingControl bind:value={easing} />
		</div>
	</div>
	<div class="display-area">
		<div class="icon-grid" use:autoAnimate>
			{#each shown as name (name)}
				{@const Icon = ICONS[name]}
				<button
					class="icon-cell gap8"
					class:active={selected === name}
					title={name}
					onclick={(e) => {
						e.stopPropagation();
						selected = name;
					}}
				>
					<Icon {variant} {template} {size} {trigger} {loop} {speed} {easing} {color} />
					<span class="text-xs col3">{name}</span>
				</button>
			{/each}
		</div>
		{#if shown.length < filtered.length}
			<div class="row xcenter">
				<button class="standard-btn" onclick={() => (limit += 120)}>
					Load more ({filtered.length - shown.length} remaining)
				</button>
			</div>
		{/if}
	</div>
</section>
