<script lang="ts">
	import { onMount } from 'svelte';
	import {
		untw,
		runConvert,
		clearAll,
		copyText,
		SAMPLE,
		SAMPLE_ACCORDION
	} from '$lib/states/untwState.svelte.js';
	import { summaryText, tokenLines } from '$lib/utilities/untw/decode.js';
	import { say } from '$lib/states/store.svelte.js';

	onMount(() => {
		// textarea comes prefilled with SAMPLE — decode immediately so first
		// paint shows results instead of the empty state
		if (untw.input.trim() && !untw.result) runConvert();
	});

	const ORDER = [
		'Layout',
		'Spacing',
		'Sizing',
		'Border',
		'Typography',
		'Surface',
		'Effect',
		'State',
		'Other'
	];

	// var(--x) names referenced by a declaration that also exist in the pasted
	// theme's :root/.dark tables — shown as light/dark chips on the row.
	function themeVars(css: string): string[] {
		const out: string[] = [];
		const re = /var\(--([a-z0-9-]+)\)/gi;
		let m: RegExpExecArray | null;
		while ((m = re.exec(css)) !== null) {
			const name = m[1];
			const t = untw.result?.theme;
			if (t && (t.light[name] || t.dark[name]) && !out.includes(name)) out.push(name);
		}
		return out;
	}

	function copySummary() {
		if (untw.result) copyText(summaryText(untw.result), 'summary', say);
	}
	function copyTokens() {
		if (untw.result) copyText(tokenLines(untw.result), 'tokens', say);
	}
	function copyJson() {
		if (untw.result) copyText(JSON.stringify(untw.result.tokens, null, 2), 'json', say);
	}
</script>

<div class="untw">
	<div class="tbar">
		<button class="mini go" onclick={runConvert} disabled={untw.busy || !untw.input.trim()}
			>{untw.busy ? 'Working…' : 'Convert →'}</button
		>
		<button class="mini" onclick={copySummary} disabled={!untw.result}
			>{untw.copied === 'summary' ? 'Copied' : 'Copy summary'}</button
		>
		<button class="mini" onclick={copyTokens} disabled={!untw.result}
			>{untw.copied === 'tokens' ? 'Copied' : 'Copy tokens'}</button
		>
		<button class="mini" onclick={copyJson} disabled={!untw.result}
			>{untw.copied === 'json' ? 'Copied' : 'Copy JSON'}</button
		>
	</div>
	<div class="cols">
		<div class="pane">
			<div class="phd">
				<span>Component code</span>
				<div class="samples">
					<button class="mini" onclick={() => (untw.input = SAMPLE)}>Card</button>
					<button class="mini" onclick={() => (untw.input = SAMPLE_ACCORDION)}>Accordion</button>
					<button class="mini" onclick={clearAll}>Clear</button>
				</div>
			</div>
			<textarea
				class="codebox"
				bind:value={untw.input}
				spellcheck="false"
				placeholder={'<div className="flex gap-4 p-6 …">'}
			></textarea>
			<div class="phd"><span>Project theme — optional @theme CSS</span></div>
			<textarea
				class="codebox short"
				bind:value={untw.themeCss}
				spellcheck="false"
				placeholder={'@theme {\n  --color-foreground: oklch(0.2 0 0);\n}'}
			></textarea>
			<p class="note">
				Custom colors and animations resolve from the pasted theme. Everything runs offline.
			</p>
		</div>

		<div class="pane results">
			{#if untw.error}
				<pre class="err">{untw.error}</pre>
			{:else if !untw.result}
				<div class="blank"><p>Paste code, then Convert →</p></div>
			{:else}
				{@const r = untw.result}
				<div class="meta">
					<span>{r.blockCount} blocks · {r.tokenCount} tokens</span>
					{#if r.unknownCount > 0}<span class="warn">{r.unknownCount} unknown</span>{/if}
					<span class="dim">{r.themed ? 'pasted @theme' : 'default theme'}</span>
				</div>

				<div class="ghead">Per element</div>
				{#each r.blocks as b, i}
					<div class="row">
						<div class="tline"><span class="tok">#{i + 1} · {b.attr}</span></div>
						<div class="css raw">"{b.raw}"</div>
						<div class="gtokens">{b.tokens.join(' ')}</div>
					</div>
				{/each}

				{#each ORDER as cat}
					{#if r.summary[cat]?.length}
						<div class="group">
							<div class="ghead">{cat}</div>
							<div class="gtokens">{r.summary[cat].join(' ')}</div>
						</div>
					{/if}
				{/each}

				<div class="ghead">Tokens → definitions</div>
				{#each r.tokens.filter((t) => !t.unknown && !t.marker) as t}
					<div class="row">
						<div class="tline">
							<span class="tok">{t.token}</span>
							<span class="cat">{t.category}</span>
						</div>
						{#if t.conditions.length}<div class="cond">{t.conditions.join(' · ')}</div>{/if}
						<div class="css">
							{t.css}{#if t.px !== null}<span class="pxv"> ≈ {t.px}px</span>{/if}
						</div>
						{#if t.fallback}<div class="css fb">fallback: {t.fallback}</div>{/if}
						{#each themeVars(t.css ?? '') as v}
							{@const th = r.theme}
							<div class="modes">
								<span>{v}</span><span>light {th.light[v] ?? '—'}</span><span
									>dark {th.dark[v] ?? '—'}</span
								>
							</div>
						{/each}
						<div class="tline">
							<span class="frac">{t.fractal ? `≈ ${t.fractal}` : 'no fractal guess'}</span>
							<button class="mini" onclick={() => copyText(`${t.token} -> ${t.css}`, t.token, say)}>
								{untw.copied === t.token ? 'Copied' : 'Copy'}
							</button>
						</div>
					</div>
				{/each}

				{#if r.markers.length}
					<div class="ghead">Anchors</div>
					{#each r.markers as m}
						<div class="row">
							<span class="tok">{m.anchor}</span><span class="hintline"
								>group anchor — no CSS of its own{m.usedBy.length
									? ` · read by ${m.usedBy.join(', ')}`
									: ''}</span
							>
						</div>
					{/each}
				{/if}

				{#if r.unknowns.length}
					<div class="ghead">Unknown</div>
					{#each r.unknowns as t}
						<div class="row">
							<span class="tok">{t.token}</span><span class="hintline">{t.hint}</span>
						</div>
					{/each}
				{/if}

				{#if r.unresolvable.length}
					<div class="ghead">Dynamic — cannot resolve statically</div>
					<div class="row"><span class="hintline">{r.unresolvable.join(' ')}</span></div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style lang="sass">
.untw
	display: flex
	flex-direction: column
	height: 100%
	min-height: 0

.cols
	flex: 1
	min-height: 0
	display: grid
	grid-template-columns: minmax(320px, 5fr) minmax(0, 7fr)
	gap: var(--space-bs)

.pane
	display: flex
	flex-direction: column
	min-height: 0
	min-width: 0
	gap: var(--space-sm)
	padding: var(--space-bs) 0 var(--space-bs) var(--space-bs)
	&:last-child
		padding-right: var(--space-bs)

.phd
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-sm)
	span
		font-family: var(--font-mono)
		font-size: var(--text-xs)
		letter-spacing: .12em
		text-transform: uppercase
		color: var(--text-muted)

.samples
	display: flex
	gap: var(--space-xs)

.mini
	appearance: none
	background: transparent
	border: 1px solid var(--border)
	border-radius: 3px
	color: var(--text-muted)
	cursor: pointer
	font-family: var(--font-mono)
	font-size: var(--text-xs)
	letter-spacing: .05em
	text-transform: uppercase
	padding: 3px 8px
	white-space: nowrap
	&:hover
		color: var(--text-primary)
		border-color: var(--text-muted)
	&:disabled
		opacity: .45
		cursor: default
	&:disabled:hover
		color: var(--text-muted)
		border-color: var(--border)

.go
	color: var(--theme-color)
	border-color: var(--theme-color)
	&:hover
		color: var(--theme-color)
		border-color: var(--theme-color)

.codebox
	flex: 1
	min-height: 220px
	resize: none
	background: var(--bg-surface)
	border: 1px solid var(--border)
	border-radius: 4px
	padding: 12px 14px
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	line-height: 1.5
	color: var(--text-secondary)
	white-space: pre
	overflow: auto
	&:focus
		outline: none
		border-color: var(--theme-color)

.short
	flex: 0 0 auto
	min-height: 110px

.note
	margin: 0
	font-size: var(--text-sm)
	color: var(--text-muted)

.results
	overflow-y: auto
	padding-bottom: var(--space-lg)

.blank
	flex: 1
	display: flex
	align-items: center
	justify-content: center
	color: var(--text-muted)
	border: 1px dashed var(--border)
	border-radius: 4px
	min-height: 200px

.err
	margin: 0
	background: color-mix(in srgb, var(--danger) 8%, transparent)
	border: 1px solid var(--danger)
	border-radius: 4px
	padding: 12px 14px
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	color: var(--danger)
	white-space: pre-wrap

.meta
	display: flex
	gap: var(--space-md)
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	color: var(--text-secondary)
	.warn
		color: var(--danger)
	.dim
		color: var(--text-muted)

.group
	border: 1px solid var(--border)
	border-radius: 4px
	background: var(--bg-surface)
	padding: 10px 12px
	margin-bottom: var(--space-sm)

.ghead
	font-family: var(--font-mono)
	font-size: var(--text-xs)
	letter-spacing: .12em
	text-transform: uppercase
	color: var(--theme-color)
	margin: var(--space-md) 0 var(--space-xs)

.gtokens
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	color: var(--text-secondary)
	line-height: 1.6

.row
	border: 1px solid var(--border)
	border-radius: 4px
	background: var(--bg-surface)
	padding: 10px 12px
	margin-bottom: var(--space-xs)

.tline
	display: flex
	align-items: center
	justify-content: space-between
	gap: var(--space-sm)

.tok
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	font-weight: 600
	color: var(--text-primary)

.cat
	font-family: var(--font-mono)
	font-size: var(--text-xs)
	color: var(--text-muted)
	text-transform: uppercase
	letter-spacing: .08em

.cond
	font-size: var(--text-sm)
	color: var(--text-muted)
	margin-top: 2px

.css
	font-family: var(--font-mono)
	font-size: var(--text-sm)
	color: var(--text-secondary)
	line-height: 1.5
	margin-top: 4px
	word-break: break-word

.pxv
	color: var(--text-muted)

.fb
	color: var(--text-muted)
	font-size: var(--text-xs)

.raw
	color: var(--text-muted)
	font-size: var(--text-xs)

.modes
	display: flex
	gap: var(--space-md)
	margin-top: 4px
	font-family: var(--font-mono)
	font-size: var(--text-xs)
	color: var(--text-muted)
	span:first-child
		color: var(--theme-color)

.frac
	font-family: var(--font-mono)
	font-size: var(--text-xs)
	color: var(--text-muted)

.hintline
	font-size: var(--text-sm)
	color: var(--text-muted)

.tbar
	display: flex
	align-items: center
	flex: 0 0 auto
	gap: var(--space-xs)
	padding: var(--space-bs) var(--space-bs) 0
</style>
