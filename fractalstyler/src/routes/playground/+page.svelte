<script lang="ts">
	import { scopePreset } from '$lib/presets/presets.svelte';
	import {
		playground,
		selected,
		addElement,
		duplicateElement,
		removeElement,
		moveElement,
		setClasses,
		setText,
		setTag,
		setLabel,
		setElementVar,
		clearElementVar,
		setCanvasVar,
		clearCanvasVar,
		canvasVarValue,
		canvasAttrs,
		canvasStyle,
		elementStyle,
		elementSnippet,
		canvasSnippet,
		type ElementTag
	} from '$lib/playground/store.svelte';
	import { TOKEN_DEFS, TOKEN_GROUPS } from '$lib/playground/tokens';
	import Gallery from './gallery.svelte';
	import GalleryWa from './gallery-wa.svelte';
	import { QUICK_GROUPS, splitClasses, suggestClasses } from '$lib/playground/classes';
	import { FAV_THEMES, searchThemes } from '$lib/playground/themes';

	$effect(() => scopePreset('shell', 'c'));

	const sel = $derived(selected());
	const selParts = $derived(sel ? splitClasses(sel.classes) : []);
	const unknownCount = $derived(selParts.filter((p) => !p.known).length);
	const lastToken = $derived(sel ? (sel.classes.split(/\s+/).filter(Boolean).pop() ?? '') : '');
	const suggestions = $derived(suggestClasses(lastToken));
	const themes = $derived(searchThemes(playground.themeQuery));
	const canvasTokens = $derived(
		playground.tokenQuery
			? TOKEN_DEFS.filter(
					(t) =>
						t.name.includes(playground.tokenQuery) ||
						t.label.toLowerCase().includes(playground.tokenQuery.toLowerCase())
				)
			: TOKEN_DEFS
	);

	let copied = $state('');
	let quickTab = $state('gap');
	let elToken = $state('--bg-surface');
	let elValue = $state('#f2f5f7');
	// Sections render one at a time — the class lab stays one keystroke from
	// its canvas, and the galleries stop stretching the lab's export panel
	// into a multi-thousand-px scroll.
	let section = $state<'lab' | 'gallery' | 'wa'>('lab');

	const quickGroup = $derived(QUICK_GROUPS.find((g) => g.id === quickTab) ?? QUICK_GROUPS[0]);

	async function copy(text: string, tag: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
			copied = tag;
			setTimeout(() => (copied = ''), 1600);
		} catch {
			copied = 'copy failed';
		}
	}

	function appendClass(token: string): void {
		if (!sel) return;
		const base = sel.classes.trim();
		setClasses(sel.id, base ? `${base} ${token}` : token);
	}

	function setCanvasPreset(axis: 'layout' | 'shape' | 'color' | 'motion' | 'mode', value: string): void {
		playground.canvas[axis] = value as never;
	}

	function pickTheme(name: string, mode: 'light' | 'dark'): void {
		playground.canvas.theme = name;
		playground.canvas.mode = mode;
	}
</script>

<div class="page-shell box gap-md">
	<div class="box gap-2xs">
		<span class="eyebrow">Playground</span>
		<h2 class="text-2xl weight-700 text-primary">Class + token lab</h2>
		<p class="text-sm text-secondary">
			Classes are the reactive prop. Tokens override scoped vars on the canvas — the page around it
			does not move. Presets stamp scoped data-attributes on the canvas wrapper.
		</p>
		<div class="row gap-2xs" role="tablist" aria-label="Playground sections">
			<button
				type="button"
				class="pill"
				class:active={section === 'lab'}
				onclick={() => (section = 'lab')}
			>
				Class lab
			</button>
			<button
				type="button"
				class="pill"
				class:active={section === 'gallery'}
				onclick={() => (section = 'gallery')}
			>
				Gallery · presets + ui
			</button>
			<button
				type="button"
				class="pill"
				class:active={section === 'wa'}
				onclick={() => (section = 'wa')}
			>
				Gallery · wa components
			</button>
		</div>
	</div>

	{#if section === 'lab'}
	<div class="grid-3 gap-md">
		<span class="field-label">Canvas presets — scoped to the preview wrapper</span>
		<div class="row gap-bs wrap ycenter">
			<label class="field">
				<span class="field-label">Density</span>
				<select class="select" value={playground.canvas.layout} onchange={(e) => setCanvasPreset('layout', e.currentTarget.value)}>
					<option value="">zero (default)</option>
					<option value="tight">tight</option>
					<option value="comfortable">comfortable</option>
					<option value="sprawling">sprawling</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Shape</span>
				<select class="select" value={playground.canvas.shape} onchange={(e) => setCanvasPreset('shape', e.currentTarget.value)}>
					<option value="">zero (default)</option>
					<option value="round">round</option>
					<option value="curved">curved</option>
					<option value="pro">pro</option>
					<option value="sharp">sharp</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Surface tint</span>
				<select class="select" value={playground.canvas.color} onchange={(e) => setCanvasPreset('color', e.currentTarget.value)}>
					<option value="">zero (default)</option>
					<option value="clean">clean</option>
					<option value="vibrant">vibrant</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Motion</span>
				<select class="select" value={playground.canvas.motion} onchange={(e) => setCanvasPreset('motion', e.currentTarget.value)}>
					<option value="">active (default)</option>
					<option value="springy">springy</option>
					<option value="heavy">heavy</option>
					<option value="reduced">reduced</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Mode</span>
				<select class="select" value={playground.canvas.mode} onchange={(e) => setCanvasPreset('mode', e.currentTarget.value)}>
					<option value="light">light</option>
					<option value="dark">dark</option>
				</select>
			</label>
			<label class="field">
				<span class="field-label">Canvas width</span>
				<select class="select" value={String(playground.width)} onchange={(e) => (playground.width = Number(e.currentTarget.value))}>
					<option value="0">full</option>
					<option value="768">768 desk seam</option>
					<option value="375">375 mobile</option>
				</select>
			</label>
		</div>
	</div>

	<div class="card box gap-sm">
		<div class="row xbetween ycenter wrap gap-bs">
			<span class="field-label">Theme — 12 favourites + search all</span>
			<input
				class="input"
				placeholder="search themes…"
				value={playground.themeQuery}
				oninput={(e) => (playground.themeQuery = e.currentTarget.value)}
			/>
		</div>
		<div class="row gap-2xs wrap ycenter">
			{#each playground.themeQuery ? themes : FAV_THEMES as t (t.name)}
				<button
					type="button"
					class="pill"
					class:active={playground.canvas.theme === t.name}
					onclick={() => pickTheme(t.name, t.mode)}
					title={`${t.name} · ${t.mode}`}
				>
					{t.name.replace('theme-', '')}
				</button>
			{/each}
		</div>
		{#if playground.themeQuery && themes.length === 0}
			<span class="text-xs text-muted">No theme matches that query.</span>
		{/if}
		<span class="text-xs text-muted">Active: <span class="mono">{playground.canvas.theme}</span> · pairs with data-mode="{playground.canvas.mode}"</span>
	</div>

	<div class="grid-3 gap-md">
		<div class="box gap-md min0">
			<div class="card box gap-sm">
				<div class="row xbetween ycenter">
					<span class="field-label">Elements ({playground.elements.length})</span>
					<button type="button" class="button small" onclick={addElement}>Add</button>
				</div>
				<div class="box gap-2xs">
					{#each playground.elements as el (el.id)}
						<div class="row xbetween ycenter gap-2xs">
							<button
								type="button"
								class="button ghost grow"
								class:active={el.id === playground.selectedId}
								onclick={() => (playground.selectedId = el.id)}
							>
								{el.label}
							</button>
							<button type="button" class="button is-icon" title="move up" onclick={() => moveElement(el.id, -1)}>↑</button>
							<button type="button" class="button is-icon" title="move down" onclick={() => moveElement(el.id, 1)}>↓</button>
							<button type="button" class="button is-icon" title="duplicate" onclick={() => duplicateElement(el.id)}>⧉</button>
							<button type="button" class="button is-icon" title="remove" onclick={() => removeElement(el.id)}>×</button>
						</div>
					{/each}
				</div>
			</div>

			{#if sel}
				<div class="card box gap-sm">
					<span class="field-label">Selected — classes are the reactive prop</span>
					<label class="field">
						<span class="field-label">Label</span>
						<input class="input" value={sel.label} oninput={(e) => setLabel(sel.id, e.currentTarget.value)} />
					</label>
					<div class="row gap-bs">
						<label class="field">
							<span class="field-label">Tag</span>
							<select class="select" value={sel.tag} onchange={(e) => setTag(sel.id, e.currentTarget.value as ElementTag)}>
								<option value="div">div</option>
								<option value="section">section</option>
								<option value="p">p</option>
								<option value="span">span</option>
								<option value="button">button</option>
								<option value="img">img</option>
							</select>
						</label>
						<label class="field grow">
							<span class="field-label">Text</span>
							<input class="input" value={sel.text} oninput={(e) => setText(sel.id, e.currentTarget.value)} />
						</label>
					</div>
					<label class="field">
						<span class="field-label">Classes</span>
						<input
							class="input mono"
							value={sel.classes}
							oninput={(e) => setClasses(sel.id, e.currentTarget.value)}
							spellcheck={false}
						/>
					</label>
					<div class="row gap-2xs wrap">
						{#each selParts as p (p.token)}
							<span class="badge" class:bg-danger={!p.known}>{p.token}</span>
						{/each}
					</div>
					{#if unknownCount > 0}
						<span class="field-error">{unknownCount} token{unknownCount === 1 ? '' : 's'} not in the registry — it renders nothing.</span>
					{:else}
						<span class="text-xs text-muted">Every token resolves. Suffix once: b-ps-gl-desk, never b-desk-ps-gl.</span>
					{/if}
					{#if suggestions.length > 0}
						<div class="box gap-2xs">
							<span class="field-label">Append</span>
							<div class="row gap-2xs wrap">
								{#each suggestions as s (s)}
									<button type="button" class="button small ghost" onclick={() => appendClass(s)}>{s}</button>
								{/each}
							</div>
						</div>
					{/if}
					<div class="box gap-2xs">
						<span class="field-label">Quick add</span>
						<div class="row gap-2xs wrap">
							{#each QUICK_GROUPS as g (g.id)}
								<button
									type="button"
									class="pill"
									class:active={quickTab === g.id}
									onclick={() => (quickTab = g.id)}
								>
									{g.label}
								</button>
							{/each}
						</div>
						<span class="text-xs text-muted">{quickGroup.hint}</span>
						<div class="row gap-2xs wrap">
							{#each quickGroup.items as item (item)}
								<button type="button" class="button small ghost" onclick={() => appendClass(item)}>{item}</button>
							{/each}
						</div>
					</div>
					<div class="box gap-2xs">
						<span class="field-label">Per-element vars ({sel.vars.length})</span>
						<div class="row gap-2xs">
							<select class="select" value={elToken} onchange={(e) => (elToken = e.currentTarget.value)}>
								{#each TOKEN_DEFS as t (t.name)}
									<option value={t.name}>{t.name}</option>
								{/each}
							</select>
							<input class="input mono" value={elValue} oninput={(e) => (elValue = e.currentTarget.value)} />
							<button type="button" class="button small" onclick={() => setElementVar(sel.id, elToken, elValue)}>Set</button>
						</div>
						{#each sel.vars as v (v.token)}
							<div class="row xbetween ycenter gap-2xs">
								<span class="text-xs mono text-secondary">{v.token}: {v.value}</span>
								<button type="button" class="button is-icon" onclick={() => clearElementVar(sel.id, v.token)}>×</button>
							</div>
						{/each}
					</div>
					<button type="button" class="button small ghost" onclick={() => copy(elementSnippet(sel), 'element')}>
						{copied === 'element' ? 'Copied' : 'Copy element Svelte'}
					</button>
				</div>
			{/if}
		</div>

		<div class="box gap-md min0">
			<div class="card box gap-sm">
				<div class="row xbetween ycenter wrap gap-bs">
					<span class="field-label">Canvas — scoped preview</span>
					<span class="badge">{playground.elements.length} blocks · {playground.canvasVars.length} canvas vars</span>
				</div>
				<div
					class="box gap-md pad-md border radius-md wfull {playground.canvas.theme}"
					{...canvasAttrs()}
					style={canvasStyle()}
				>
					<div
						class="box gap-md wfull"
						style={playground.width ? `max-width: ${playground.width}px; margin-inline: auto` : ''}
					>
						{#each playground.elements as el (el.id)}
							{#if el.tag === 'img'}
								<img
									class={el.classes}
									style={elementStyle(el)}
									src="/images/fractalstyler.png"
									alt={el.label}
								/>
							{:else if el.tag === 'button'}
								<svelte:element
									this={el.tag}
									class={el.classes}
									style={elementStyle(el)}
								>
									{el.text}
								</svelte:element>
							{:else}
								<svelte:element
									this={el.tag}
									class={el.classes}
									style={elementStyle(el)}
								>
									<span class="text-xs tt-u text-muted">{el.label}</span>
									<span>{el.text}</span>
								</svelte:element>
							{/if}
						{/each}
					</div>
				</div>
				<span class="text-xs text-muted">
					Width {playground.width === 0 ? 'full' : `${playground.width}px`} — cross 768 to watch -mob / -desk switch.
					Gaps need a layout: keep box / row / grid alongside gap-*.
				</span>
			</div>

			<div class="card box gap-sm">
				<span class="field-label">Export — whole canvas</span>
				<div class="terminal pad-md radius-md mono text-xs scroll-x">{canvasSnippet()}</div>
				<div class="row gap-bs wrap">
					<button type="button" class="button small" onclick={() => copy(canvasSnippet(), 'canvas')}>
						{copied === 'canvas' ? 'Copied' : 'Copy canvas Svelte'}
					</button>
					<button
						type="button"
						class="button small ghost"
						onclick={() => copy(playground.elements.map((e) => e.classes).join('\n'), 'classes')}
					>
						{copied === 'classes' ? 'Copied' : 'Copy class list'}
					</button>
				</div>
			</div>
		</div>

		<div class="box gap-md min0">
			<div class="card box gap-sm">
				<div class="row xbetween ycenter">
					<span class="field-label">Canvas vars — scoped ({playground.canvasVars.length})</span>
					<input
						class="input"
						placeholder="filter vars…"
						value={playground.tokenQuery}
						oninput={(e) => (playground.tokenQuery = e.currentTarget.value)}
					/>
				</div>
				{#each TOKEN_GROUPS as group (group.id)}
					{@const rows = canvasTokens.filter((t) => t.group === group.id)}
					{#if rows.length > 0}
						<div class="box gap-2xs">
							<span class="eyebrow">{group.label}</span>
							<span class="text-xs text-muted">{group.hint}</span>
							{#each rows as t (t.name)}
								{@const active = canvasVarValue(t.name)}
								<div class="box gap-2xs">
									<div class="row xbetween ycenter gap-2xs">
										<span class="text-xs mono text-secondary" title={t.readBy}>{t.name}</span>
										{#if active}
											<button type="button" class="button is-icon" title="clear override" onclick={() => clearCanvasVar(t.name)}>×</button>
										{/if}
									</div>
									<div class="row gap-2xs ycenter">
										{#if t.kind === 'color'}
											<input
												type="color"
												value={active && active.startsWith('#') ? active : t.def.startsWith('#') ? t.def : '#888888'}
												oninput={(e) => setCanvasVar(t.name, e.currentTarget.value)}
											/>
										{/if}
										<input
											class="input mono"
											placeholder={t.def}
											value={active}
											oninput={(e) => {
												if (e.currentTarget.value) setCanvasVar(t.name, e.currentTarget.value);
												else clearCanvasVar(t.name);
											}}
										/>
									</div>
									{#if t.name === '--gap-scale' || t.name === '--pad-scale'}
										<input
											type="range"
											min="0"
											max="4"
											step="0.25"
											value={active ? Number(active) : 1}
											oninput={(e) => setCanvasVar(t.name, e.currentTarget.value)}
										/>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{/each}
			</div>

			<div class="card box gap-2xs">
				<span class="field-label">Reading the canvas</span>
				<span class="text-xs text-secondary">gap-bs = var(--space-bs) × var(--gap-scale). Change the step (gap-sm → gap-lg) or the var (--space-bs, --gap-scale) — both are live.</span>
				<span class="text-xs text-secondary">radius-sm / md / lg follow data-shape. radius-N literals never do — they are exact px.</span>
				<span class="text-xs text-secondary">Equal step names do not promise equal px — gap and pad channels differ by design.</span>
			</div>
	</div>
	</div>
	{:else if section === 'gallery'}
	<Gallery />
	{:else}
	<GalleryWa />
	{/if}
</div>
