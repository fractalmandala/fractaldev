<script lang="ts">
	import AsciiDiagram from './AsciiDiagram.svelte';
	import { alignBoxLines } from './parser';

	const PRESETS = [
		{
			name: 'Nested Radii',
			code: `+ - - - - - - [ NESTED RADII ] - - - - - - +
|                                             |
|   ╭ - - - - - - - - - - - - - - - - - - ╮   |
|   |  outer   16px                       |   |
|   |     ╭ - - - - - - - - - - - - ╮     |   |
|   |◀ - ▶|  inner   12px           |     |   |
|   |     ╰ - - - - - - - - - - - - ╯     |   |
|   |          inset   4px                |   |
|   ╰ - - - - - - - - - - - - - - - - - - ╯   |
|                                             |
|        inner = outer - inset                |
|        12px = 16px - 4px                    |
+ - - - - - - - - - - - - - - - - - - - - - - +`
		},
		{
			name: 'Prompt Loop',
			code: `+ - - - - - - [ THE PROMPT LOOP ] - - - - - - +
|                                             |
|       ~> Ask for the thing you want         |
|                      │                      |
|                      v                      |
|                 AI builds it  ◀ - - - - +   |
|                      │                  │   |
|                      v                  │   |
|               It's not quite right      │   |
|                      │                  │   |
|                      v                  │   |
|       ~> Make me a few variants         │   |
|                      │                  │   |
|                      v                  │   |
|              v1 · v2 · v3 · v4          │   |
|                      │                  │   |
|                      v                  │   |
|               None of them are it       │   |
|                      │                  │   |
|                      + - - - - - - - - -+   |
|                          Repeat forever     |
|                                             |
+ - - - - - - - - - - - - - - - - - - - - - - +`
		},
		{
			name: 'System Architecture',
			code: `┌───────────────────┐               ┌───────────────────┐
│     Client        │──────────────>│   Edge Gateway    │
│  SvelteKit + SVX  │<──────────────│   Cloudflare / V8 │
└─────────┬─────────┘               └─────────┬─────────┘
          │                                   │
          v                                   v
┌───────────────────┐               ┌───────────────────┐
│   Monospace Cache │               │   AI LLM Engine   │
│   Fast In-Memory  │               │   Streaming Runes │
└───────────────────┘               └───────────────────┘`
		},
		{
			name: 'AI Amplifier',
			code: `+ - - - - - - - - - [ AI IS AN AMPLIFIER ] - - - - - - - - - +
|                                                            |
|         ▃▅█▅▃              - - - - ▶  AI  - - - - ▶   ▂▃▅▆█████▆▅▃▂     |
|      your taste                                    amplified       |
|                                                            |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +`
		},
		{
			name: 'Token Cost Ledger',
			code: `+ - - - - - - - - - [ COST LEDGER ] - - - - - - - - - +
|                                                     |
|       Operation            Tokens          Time     |
|     - - - - - - - - - - - - - - - - - - - - - -     |
|       AST Parse              120            16m     |
|       MDSveX Compile         164            16m     |
|       Rune Optimization      112            18m     |
|     - - - - - - - - - - - - - - - - - - - - - -     |
|       Total                  396           ~50m     |
|                                                     |
+ - - - - - - - - - - - - - - - - - - - - - - - - - - +`
		}
	];

	const GLYPH_SECTIONS = [
		{ label: 'Rounded', chars: ['╭', '╮', '╯', '╰', '─', '│'] },
		{ label: 'Light Box', chars: ['┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼', '─', '│'] },
		{ label: 'Heavy Box', chars: ['┏', '┓', '┗', '┛', '┣', '┫', '┳', '┻', '╋', '━', '┃'] },
		{ label: 'Double Box', chars: ['╔', '╗', '╚', '╝', '╠', '╣', '╦', '╩', '╬', '═', '║'] },
		{ label: 'Arrows', chars: ['~>', '->', '◀', '▶', '▼', '▲', '◀ - ▶', '→', '←', '↑', '↓'] },
		{ label: 'Meters', chars: [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█', '■', '●', '◆'] }
	];

	let rawInput = $state(PRESETS[0].code);
	let copiedFormat = $state<'text' | 'svelte' | 'svx' | null>(null);
	let textarea: HTMLTextAreaElement | undefined = $state();

	const lineCount = $derived(rawInput.split('\n').length);

	function insertChar(char: string) {
		const el = textarea;

		if (!el) {
			rawInput += char;
			return;
		}

		const start = el.selectionStart;
		const end = el.selectionEnd;
		rawInput = rawInput.substring(0, start) + char + rawInput.substring(end);

		window.setTimeout(() => {
			el.focus();
			el.setSelectionRange(start + char.length, start + char.length);
		}, 10);
	}

	function handleAlign() {
		rawInput = alignBoxLines(rawInput);
	}

	function loadPreset(preset: (typeof PRESETS)[number]) {
		rawInput = preset.code;
	}

	async function copyAs(format: 'text' | 'svelte' | 'svx') {
		let code = '';

		if (format === 'text') {
			code = rawInput;
		} else if (format === 'svelte') {
			code = `<script lang="ts">\n  import { AsciiDiagram } from 'markgraphy';\n<\/script>\n\n<AsciiDiagram>\n  {\`${rawInput}\`}\n</AsciiDiagram>`;
		} else if (format === 'svx') {
			code = `<script>\n  import { AsciiDiagram } from 'markgraphy';\n<\/script>\n\n<AsciiDiagram>\n\n\`\`\`diagram\n${rawInput}\n\`\`\`\n\n</AsciiDiagram>`;
		}

		try {
			await navigator.clipboard.writeText(code);
			copiedFormat = format;
			window.setTimeout(() => {
				copiedFormat = null;
			}, 2000);
		} catch {
			// Clipboard unavailable (permissions or non-secure context).
		}
	}
</script>

<div class="editor">
	<div class="toolbar">
		<div class="group">
			<span class="label">Preset</span>
			<div class="options">
				{#each PRESETS as p (p.name)}
					<button
						class="chip"
						class:on={rawInput === p.code}
						type="button"
						onclick={() => loadPreset(p)}
					>
						{p.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<div class="palette">
		<div class="palette-header">
			<span class="label">Glyphs</span>
			<button class="chip" type="button" onclick={handleAlign}>⚡ auto-align width</button>
		</div>
		<div class="glyph-groups">
			{#each GLYPH_SECTIONS as section (section.label)}
				<div class="glyph-group">
					<span class="group-label">{section.label}</span>
					<div class="chars">
						{#each section.chars as ch (ch)}
							<button class="char" type="button" onclick={() => insertChar(ch)}>{ch}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="workspace">
		<div class="pane">
			<div class="pane-header">
				<span class="pane-title">Input</span>
				<span class="meta">{rawInput.length} chars · {lineCount} lines</span>
			</div>
			<textarea
				bind:this={textarea}
				bind:value={rawInput}
				class="input"
				placeholder="Type or paste an ASCII / Unicode diagram…"
				spellcheck="false"
			></textarea>
		</div>

		<div class="pane">
			<div class="pane-header">
				<span class="pane-title">Preview</span>
				<div class="exports">
					<button
						class="chip"
						class:on={copiedFormat === 'text'}
						type="button"
						onclick={() => copyAs('text')}
					>
						{copiedFormat === 'text' ? '✓ copied' : 'copy text'}
					</button>
					<button
						class="chip"
						class:on={copiedFormat === 'svelte'}
						type="button"
						onclick={() => copyAs('svelte')}
					>
						{copiedFormat === 'svelte' ? '✓ copied' : 'copy svelte'}
					</button>
					<button
						class="chip"
						class:on={copiedFormat === 'svx'}
						type="button"
						onclick={() => copyAs('svx')}
					>
						{copiedFormat === 'svx' ? '✓ copied' : 'copy .svx'}
					</button>
				</div>
			</div>
			<div class="preview">
				<AsciiDiagram content={rawInput} showCopy={false} />
			</div>
		</div>
	</div>
</div>

<style>
	.editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		min-width: 0;
		font-size: 0.875rem;
	}

	.toolbar,
	.palette {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.label {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.options {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.chip {
		padding: 0.2rem 0.55rem;
		font-size: 0.75rem;
		color: var(--text-secondary, oklch(0.62 0 0));
		background: none;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
		border-radius: 0;
		cursor: pointer;
	}

	.chip:hover {
		color: var(--text-primary, oklch(0.93 0 0));
		border-color: var(--text-secondary, oklch(0.62 0 0));
	}

	.chip.on {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border-color: var(--graph-accent, oklch(0.78 0.17 155));
	}

	.palette-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.glyph-groups {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}

	.glyph-group {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.group-label {
		font-size: 0.7rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.chars {
		display: flex;
		gap: 0.2rem;
		flex-wrap: wrap;
	}

	.char {
		min-width: 22px;
		padding: 0.15rem 0.35rem;
		font-size: 0.75rem;
		color: var(--text-primary, oklch(0.93 0 0));
		background: none;
		border: 1px solid transparent;
		border-radius: 0;
		cursor: pointer;
	}

	.char:hover {
		color: var(--graph-accent, oklch(0.78 0.17 155));
		border-color: var(--border, oklch(0.6 0 0 / 0.5));
	}

	.workspace {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		min-width: 0;
	}

	@media (max-width: 900px) {
		.workspace {
			grid-template-columns: 1fr;
		}
	}

	.pane {
		display: flex;
		flex-direction: column;
		min-width: 0;
		border: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.pane-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px dashed var(--border, oklch(0.6 0 0 / 0.5));
	}

	.pane-title {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.meta {
		font-size: 0.7rem;
		color: var(--text-secondary, oklch(0.62 0 0));
	}

	.exports {
		display: flex;
		gap: 0.35rem;
	}

	.input {
		width: 100%;
		height: 380px;
		padding: 1rem;
		font-size: 0.825rem;
		line-height: 1.4;
		color: var(--text-primary, oklch(0.93 0 0));
		background: transparent;
		border: none;
		outline: none;
		box-sizing: border-box;
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: auto;
		resize: vertical;
		tab-size: 2;
	}

	.preview {
		padding: 0.75rem;
		overflow-x: auto;
	}
</style>
