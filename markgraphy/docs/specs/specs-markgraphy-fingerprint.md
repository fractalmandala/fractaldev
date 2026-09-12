# Markgraphy — Fingerprint Components

Spec for the **Fingerprint** batch of three animated components, added on top of the
[animated](specs-markgraphy-animated.md) and [vedic](specs-markgraphy-vedic.md) batches.

| Slug | Component | Theme |
| --- | --- | --- |
| `graph-boot` | GraphBoot | Deploy / boot log with per-step progress, ✓/✗ endings, total time. |
| `graph-terminal` | GraphTerminal | Scripted shell session: `$ ` prompt typed, output streamed. |
| `graph-hash` | GraphHash | Any string → its 64-bit FNV-1a digest as a glyph-checkerboard fingerprint. |

These three are the **show-don't-tell** set — every one of them is built to look
good in a single screenshot. They share the same house style as the rest of
`src/lib/animated/` (Graph + GraphBody frame, scoped CSS, `--graph-*` tokens,
`prefers-reduced-motion` freeze, RLE view).

## Component files

- [GraphBoot.svelte](../../src/lib/animated/GraphBoot.svelte)
- [GraphTerminal.svelte](../../src/lib/animated/GraphTerminal.svelte)
- [GraphHash.svelte](../../src/lib/animated/GraphHash.svelte)

## Integration inventory

| Surface | Touched | Notes |
| --- | --- | --- |
| [src/lib/index.ts](../../src/lib/index.ts) | +6 lines | Re-exports `GraphBoot`, `GraphTerminal`, `GraphHash` (default + Props) and `GraphBootStep`, `TerminalLine` helper types. |
| [src/site/docs/catalog.ts](../../src/site/docs/catalog.ts) | +120 lines | 3 catalog entries (slug/title/name/description/props[] with the reusable `CLASS` row). Slugs `graph-boot`, `graph-terminal`, `graph-hash` added to `ANIMATED_SLUGS`. |
| [src/site/docs/previews.ts](../../src/site/docs/previews.ts) | +61 lines | 3 preview entries (live `Comp` + `props` + copyable `code` snippet) — `graph-boot` (5-step deploy), `graph-terminal` (pnpm dev session), `graph-hash` (input `'markgraphy'`). |
| [src/routes/(site)/llms.txt/+server.ts](../../src/routes/(site)/llms.txt/+server.ts) | +3 table rows, count updated | `GraphBoot`, `GraphTerminal`, `GraphHash` rows in the components table. Page count bumped from nineteen → twenty-five (covers this batch + the three data-viz utilities `graph-cron`, `graph-deps`, `graph-scatter` whose demo tiles were also wired into the animations page). |
| [src/routes/(site)/sitemap.xml/+server.ts](../../src/routes/(site)/sitemap.xml/+server.ts) | +3 slugs | `graph-boot`, `graph-hash`, `graph-terminal` in `DOC_SLUGS`. |
| [src/routes/(site)/docs/animations/+page.svelte](../../src/routes/(site)/docs/animations/+page.svelte) | +3 imports, +3 demo entries | New tiles added in the wall; missing demos for `graph-cron`, `graph-deps`, `graph-scatter` filled in (pre-existing page 500 fix). Page header bumped Nineteen → Twenty-five. |

## GraphBoot — deploy/boot log

### What you see

- A framed `[ TITLE ]` block, ~5–8 rows.
- One row per step: `[ padded-label ] [▰▰▰▱▱▱▱▱▱▱]  ~1.2s ✓`.
- The bar fills left-to-right while a step is `running`, then becomes a solid
  `▰▰▰▰▰▰▰▰▰▰` block followed by ✓.
- A `fail: true` step leaves the bar at its current fill, paints the row muted,
  and shows ✗ at the end; all subsequent steps are marked `pending` (no
  progress, `…` instead of an ETA) until the summary resolves.
- A `─` separator and a summary row: `total  N/M passed  4.2s / 6.0s  ✓` (or ✗
  if anything failed).
- A short caption: `from cold to live` by default.

### Mechanics

- Per-step `tick length = round(stepTicks × mulberry32(seedNum))`, clamped
  ≥ 3 ticks. This means a fresh seed always produces the same run; two
  consecutive runs with the same seed are bit-identical.
- Tick total = sum(step lengths) + 6 ticks of post-summary. On the last 6
  ticks the summary row reads its final value; under reduced motion the
  component freezes at `totalTicks` so the summary row reads `✓`/`✗` once.
- A failed step "freezes" the loop on its own tick and propagates a `haltedAt`
  index, used to keep later steps in `pending` so the visual still makes
  sense.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `steps` | `GraphBootStep[]` | — | Ordered `{ label, eta?, fail? }` list. |
| `speedMs` | number | `90` | Milliseconds per tick. |
| `stepTicks` | number | `14` | Base ticks per step before jitter. |
| `seedNum` | number | `5` | PRNG seed; same seed → same run. |
| `label` | string | `'from cold to live'` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

## GraphTerminal — scripted session

### What you see

- A framed `[ TITLE ]` block.
- Each line is either a `$ ` prompt (typed) or a 2-space-indented output block
  (streamed).
- A blinking block cursor `█` is appended on its own row after the script,
  attached to a fresh `$ `.
- The whole script loops: it types, then streams, then holds, then restarts.

### Mechanics

- `typeMs` (default 28 ms/char) and `streamMs` (default 14 ms/char) let
  the prompt and output read at different speeds, just like a real terminal.
- The active-line duration is recomputed each tick so the cursor changes
  speed mid-loop as it crosses the prompt/output boundary.
- Frozen state (reduced motion or `animated={false}`) reveals the full
  script at once and parks the cursor on a new `$ `.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `lines` | `TerminalLine[]` | — | `[{ kind: 'prompt' \| 'output', text: string }, …]`. |
| `typeMs` | number | `28` | Milliseconds per character when typing a prompt. |
| `streamMs` | number | `14` | Milliseconds per character when streaming output. |
| `holdMs` | number | `1600` | Hold at end before looping. |
| `loop` | boolean | `true` | Loop the session. |
| `label` | string | `'a session, scripted'` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

## GraphHash — string → fingerprint

### What you see

- A framed `[ TITLE ]` block.
- Top row: the input string (truncated to 28 chars) prefixed with `· `.
- A `cols × rows` grid (default 16 × 6) of glyphs from a 4-tier ladder:
  `·` (faint) → `░` (low) → `▒` (mid) → `▓` (high). 2 bits per cell ⇒
  exactly 64 bits = one full 64-bit digest.
- A `─` separator row.
- The 16-character hex digest as two 8-char runs (e.g. `bc06b715 e69a6c91`).
- A subtle scan line: a single column where the glyph is rendered one tier
  brighter. The line sweeps left-to-right and wraps, period `cols + 6`.

### Mechanics

- Digest is a **64-bit FNV-1a** over the UTF-16 code points of the input.
  The whole function is pure; same input always yields the same fingerprint
  with no PRNG state. That's the "on-brand" property — it's the
  deterministic, reproducible identity of a string.
- Bits are read LSB-first, row-major. The grid is fully decoupled from the
  scan line: the scan line animates over a static grid.
- Frozen state (reduced motion or `animated={false}`) parks the scan line
  at the middle of the grid so the brightest column is centered.

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Caption on the top edge. |
| `input` | string | `'markgraphy'` | Any string; same input → same fingerprint. |
| `cols` | number | `16` | Grid width (2 bits per cell). Clamped 4..32. |
| `rows` | number | `6` | Grid height. Clamped 2..16. |
| `speedMs` | number | `60` | Milliseconds per scan-line tick. |
| `label` | string | `'any string → a glyph fingerprint'` | Caption under the art. |
| `class` | string | — | Passed to the frame. |

### Sample digest (default input `'markgraphy'`)

- hex: `bc06b715 e69a6c91`
- the 4-tier grid renders a recognisable, stable pattern of accent / mid /
  faint cells. Try other inputs to see the grid change: `'markgraphy'` ≠
  `'Fractalgraphy'` ≠ `'graph hash'`.

## Verification (run 2026-09-06)

- `pnpm check` → 0 errors. The 1 warning is in `GraphScatter.svelte` and
  pre-dates this batch (not touched by this work).
- `pnpm build` → ✓ built in ~3.3s, all 25 prerendered pages emitted.
- Route sweep against `pnpm preview` on port 4173:
  - `/docs/graph-boot` → 200
  - `/docs/graph-hash` → 200
  - `/docs/graph-terminal` → 200
  - `/docs/animations` → 200 (after this batch + filling the missing
    `graph-cron` / `graph-deps` / `graph-scatter` demo entries)
- Screenshots in `qa-screenshots/fingerprint2-{boot,hash,terminal,wall}.png`,
  taken with `--force-prefers-reduced-motion` so the static frame is what
  you see in the docs.

## How to evaluate

Open a preview and look at each one frozen (reduced motion is on by default
in headless captures; in a real browser, toggle "Reduce motion" in your OS
or call `<GraphBoot animated={false} />`).

- `/docs/graph-boot` — does the deploy log read at a glance? Are the
  progress bars aligned, ✓/✗ attached to the right rows, summary at the
  bottom?
- `/docs/graph-terminal` — does the `$ ` prompt stand out, does the output
  indent under it, is the blinking cursor parked cleanly on a fresh `$ `?
- `/docs/graph-hash` — does the fingerprint look deterministic (same input =
  same grid), does the scan line sweep cleanly, is the hex digest split on
  a word boundary?
- `/docs/animations` — are the 3 new tiles (Boot, Terminal, Hash) on the
  wall, mixed in with the other 22?

Status: **implemented — pending user evaluation.**
