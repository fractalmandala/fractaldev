<script lang="ts">
	import MainSection from '$lib/components/shell/MainSection.svelte';
	import { SAMPLE } from '$site/twdecode/sample';
	import { CATEGORY_ORDER } from '$site/twdecode/categories';

	interface TokenRow {
		token: string;
		variant: string | null;
		core: string;
		css: string | null;
		px: number | null;
		human: string | null;
		category: string;
		fractal: string | null;
		unknown: boolean;
	}

	interface Block {
		attr: string;
		raw: string;
		tokens: string[];
	}

	let code = $state(SAMPLE);
	let themeCss = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let blocks = $state<Block[]>([]);
	let tokens = $state<TokenRow[]>([]);
	let summary = $state<Record<string, string[]>>({});
	let meta = $state<{
		blockCount: number;
		tokenCount: number;
		unknownCount: number;
		tailwind: string;
	} | null>(null);
	let copied = $state<string | null>(null);

	const hasResult = $derived(tokens.length > 0);

	async function convert() {
		if (!code.trim() || loading) return;
		loading = true;
		error = null;
		copied = null;
		try {
			const res = await fetch('/twdemo/decode', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ code, themeCss })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error ?? 'Decode failed.';
				blocks = [];
				tokens = [];
				summary = {};
				meta = null;
				return;
			}
			blocks = data.blocks;
			tokens = data.tokens;
			summary = data.summary;
			meta = data.meta;
		} catch (e) {
			error = `Request failed: ${(e as Error).message}`;
		} finally {
			loading = false;
		}
	}

	function loadExample() {
		code = SAMPLE;
		error = null;
		copied = null;
	}

	function clear() {
		code = '';
		blocks = [];
		tokens = [];
		summary = {};
		meta = null;
		error = null;
		copied = null;
	}

	async function copyText(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = label;
			setTimeout(() => (copied = null), 1600);
		} catch {
			error = 'Clipboard blocked by the browser.';
		}
	}

	function summaryText(): string {
		return CATEGORY_ORDER.filter((c) => summary[c]?.length)
			.map((c) => `${c}: ${summary[c].join(' ')}`)
			.join('\n');
	}
</script>

<MainSection mainType={true}>
	<div class="box gap-lg">
		<header class="box gap-2xs">
			<p class="eyebrow font-mono"><span class="text-theme">v1 · tailwind decode</span></p>
			<h1 class="text-3xl weight-700 text-tight">Paste a component, see its design</h1>
			<p class="text-md text-secondary">
				Extracts every <span class="mono">class / className</span> string, resolves each Tailwind token
				through the real Tailwind v4 compiler (default theme), and groups it as border, padding, layout
				and the rest. End goal: the fractal column suggests the nearest fractalstyler class.
			</p>
		</header>

		<div class="card box gap-sm pad-lg">
			<span class="field-label">Component code (React, Vue, Svelte, HTML)</span>
			<textarea
				class="input mono text-sm"
				style="height: auto; min-height: 220px; max-width: none;"
				bind:value={code}
				spellcheck={false}
				placeholder="<div className=&quot;flex gap-4 p-6 ...&quot;>"></textarea>
			<div class="row wrap gap-sm ycenter">
				<button class="button primary" onclick={convert} disabled={loading || !code.trim()}>
					{loading ? 'Converting…' : 'Convert'}
				</button>
				<button class="button ghost" onclick={loadExample}>Example</button>
				<button class="button ghost" onclick={clear}>Clear</button>
				{#if hasResult}
					<button class="button ghost" onclick={() => copyText(summaryText(), 'summary')}
						>{copied === 'summary' ? 'Copied!' : 'Copy summary'}</button
					>
					<button
						class="button ghost"
						onclick={() => copyText(JSON.stringify({ blocks, tokens, summary }, null, 2), 'json')}
						>{copied === 'json' ? 'Copied!' : 'Copy JSON'}</button
					>
				{/if}
			</div>
			{#if error}
				<p class="text-sm text-danger">{error}</p>
			{/if}
		</div>

		<div class="card box gap-sm pad-lg">
			<span class="field-label">Project theme — optional @theme CSS</span>
			<p class="text-sm text-secondary">
				Only needed when tokens come from your own theme: custom colors like
				<span class="mono">text-foreground</span>, custom animations like
				<span class="mono">animate-accordion-down</span>. Paste the
				<span class="mono">@theme &#123; … &#125;</span> block from your stylesheet, then Convert again.
			</p>
			<textarea
				class="input mono text-sm"
				style="height: auto; min-height: 110px; max-width: none;"
				bind:value={themeCss}
				spellcheck={false}
				placeholder="@theme &#123;&#10;  --color-foreground: oklch(0.2 0 0);&#10;  --animate-accordion-down: accordion-down 0.2s ease-out;&#10;&#125;"
			></textarea>
		</div>

		{#if meta}
			<div class="row wrap gap-sm ycenter">
				<span class="badge">{meta.blockCount} blocks</span>
				<span class="badge">{meta.tokenCount} tokens</span>
				{#if meta.unknownCount > 0}
					<span class="badge">{meta.unknownCount} unknown</span>
				{/if}
				<span class="text-xs text-muted mono">{meta.tailwind}</span>
			</div>
		{/if}

		{#if hasResult}
			<section class="box gap-sm">
				<h2 class="text-xl weight-700">Design summary</h2>
				<div class="grid grid-2 gap-sm">
					{#each CATEGORY_ORDER as cat}
						{#if summary[cat]?.length}
							<div class="panel box gap-2xs pad-md">
								<span class="eyebrow font-mono">{cat}</span>
								<p class="mono text-sm">{summary[cat].join(' ')}</p>
							</div>
						{/if}
					{/each}
				</div>
			</section>

			<section class="box gap-sm">
				<h2 class="text-xl weight-700">Per element</h2>
				{#each blocks as b, i}
					<div class="card box gap-2xs pad-md">
						<span class="mono text-xs text-muted">#{i + 1} · {b.attr}="{b.raw}"</span>
						<p class="mono text-sm">{b.tokens.join(' ')}</p>
					</div>
				{/each}
			</section>

			<section class="box gap-sm">
				<h2 class="text-xl weight-700">Tokens → definitions</h2>
				<div class="box border">
					{#each tokens as t, i}
						<div class="box gap-2xs pad-sm" class:border-bottom={i < tokens.length - 1}>
							<div class="row xbetween ycenter gap-md">
								<span class="mono text-sm weight-700">{t.token}</span>
								<span class="mono text-xs text-muted shrink-0">{t.category}</span>
							</div>
							{#if t.human}
								<p class="mono text-sm text-secondary">{t.human}</p>
							{:else}
								<p class="text-sm text-warning">
									No rule{#if meta?.tailwind === 'v4 default theme'}
										with the default theme — if this token is yours (custom color, animation,
										plugin), paste your <span class="mono">@theme</span> CSS above and Convert again.
									{:else}
										even with your pasted theme — check for a typo, a plugin utility, or a fully
										dynamic value.
									{/if}
								</p>
							{/if}
							<div class="row xbetween ycenter gap-md">
								<span class="mono text-xs text-muted">
									{#if t.fractal}≈ {t.fractal}{:else}no fractal guess{/if}
								</span>
								{#if t.human}
									<button
										class="button ghost"
										onclick={() => copyText(`${t.token} -> ${t.human}`, t.token)}
										>{copied === t.token ? 'Copied' : 'Copy'}</button
									>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</MainSection>
