# Task Sheet — Normalize Svelte Recipe References

## Team-builder assignment

Assign one primary implementation agent to this sheet. A second agent may perform a
read-only Svelte review after the primary finishes. Keep the team to two agents maximum:

- **Primary:** Svelte recipe normalizer — edits only the two recipe packs named below.
- **Reviewer:** `svelte-reviewer` — read-only review of the final diff and verification
  output; it does not rewrite recipes.

The primary agent should work from this sheet independently and return the receipt at the
end. Do not modify application workspaces, published component packages, or unrelated
plugin skills.

## Objective

Normalize the reference recipes so that agents can safely use them as scaffolding input
for Svelte 5/SvelteKit projects without copying patterns that violate the Svelte Boss
contract.

## Owned paths

- `packages/fractal-agentic/skills/agentic-svelte-builder/references/**/*.md`
- `packages/fractal-agentic/skills/react-to-sveltekit/references/**/*.md`
- `packages/fractal-agentic/skills/agentic-svelte-builder/SKILL.md` only when a rule or
  link must be corrected to match the normalized recipe contract.
- `packages/fractal-agentic/skills/react-to-sveltekit/SKILL.md` only when a rule or link
  must be corrected to match the normalized recipe contract.

Do not change `MANIFEST.json` unless a recipe is renamed or its route is demonstrably
broken. Do not edit `bosses/svelte/INDEX.md` in this task.

## Canonical contract

All normalized Svelte examples must follow these rules:

1. **Svelte 5:** use `$state`, `$derived`, `$effect`, `$props`, and `$bindable` where
   reactivity or controlled props are required. Use direct `$derived(expression)` forms.
2. **Events and composition:** use `onclick`/other event attributes and snippets with
   `Snippet`, `{#snippet}`, and `{@render}`. Do not introduce `on:click`, `<slot>`, or
   React JSX syntax in converted output.
3. **State styling:** express variants and state with `data-variant`, `data-state`,
   `aria-expanded`, `aria-selected`, or equivalent semantic attributes. Do not use
   `class:` directives or modifier-class toggles in normalized examples.
4. **CUBE grouping:** keep classes in `[ block ] [ layout ] [ utilities ]` groups. Keep
   state out of class strings.
5. **Stylesheets:** remove component `<style>` blocks from Svelte examples. Show the
   component markup separately from an adjacent indented `.sass` example or reference
   the project stylesheet location. Use single-tab indentation, no braces, and no
   semicolons.
6. **Inline styles:** remove static `style="..."` attributes. For genuinely dynamic
   geometry, use a documented CSS custom-property boundary and explain why it cannot be
   expressed as a class or stylesheet rule. Never use inline styles for colors, spacing,
   typography, or static layout.
7. **Tokens:** do not use fallback hex values in generated styles. Consume semantic
   variables such as `var(--background-surface)` or name the required token explicitly
   when a host theme does not yet provide it.
8. **Accessibility:** retain native semantics first; preserve labels, keyboard behavior,
   focus handling, `aria-*` state, and disabled behavior. Do not replace a native control
   with a clickable `div` without a documented, tested reason.
9. **SvelteKit boundaries:** conversion examples must distinguish browser-only effects
   from SSR-safe code and identify whether route data belongs in `+page.ts`,
   `+page.server.ts`, an action, or a remote function.

## Work sequence

### 1. Inventory before editing

- Read the active workspace `AGENTS.md` and the Svelte Boss playbook.
- Search both recipe packs for `<style`, `class:`, `style=`, hex color literals,
  `on:`, `<slot>`, `className`, and `$derived(() =>`.
- Treat the existing recipe filenames and `MANIFEST.json` routes as the stable public
  index. Do not rename recipes during normalization.

### 2. Normalize native recipes

- Keep native HTML mechanisms (`details`, `dialog`, `popover`, native inputs) where they
  are the correct zero-JS choice.
- Replace dynamic class directives with semantic data/ARIA attributes and matching
  attribute selectors in the SASS example.
- Move all non-token styling into an external `.sass` code block or stylesheet pointer.
- Preserve the usage example, but remove static inline styling and hardcoded fallback
  palette values.

### 3. Normalize Svelte recipes

- Keep the smallest correct Runes state boundary.
- Replace class toggles with `data-state`/ARIA attributes.
- Replace inline styling with classes or the documented dynamic CSS-property exception.
- Preserve snippet-based children and callback props.
- Check browser-only APIs (`window`, `document`, `localStorage`, observers) are inside
  `$effect` or otherwise guarded from SSR.

### 4. Normalize React-to-SvelteKit recipes

- Keep the four motion tiers, but make package availability and fallback behavior
  explicit instead of assuming a dependency exists.
- Convert JSX state, lists, conditionals, and events to Svelte 5 syntax.
- Add the target file plan (`Component.svelte`, types, external `.sass`, and any route
  data file) to each conversion example where it is currently implicit.
- Mark any unresolved React/Next behavior as a migration decision, not as silently
  completed output.

### 5. Update guidance only when needed

If the normalized examples reveal a contradictory rule in either `SKILL.md`, update the
rule and its reference links in the same diff. Keep the skill body under 500 lines and
avoid duplicating the full recipe catalog there.

## Verification

Run from `/Users/amrit/mandala`:

```sh
python3 -m json.tool packages/fractal-agentic/skills/agentic-svelte-builder/references/MANIFEST.json >/dev/null
rg -n '<style|class:|style="|#[0-9a-fA-F]{3,8}|on:[a-z]+|<slot>|className|\$derived\(\s*\(\s*\)' \
  packages/fractal-agentic/skills/agentic-svelte-builder/references \
  packages/fractal-agentic/skills/react-to-sveltekit/references
```

The search may find prose describing a forbidden pattern. Every remaining match must be
either explanatory text, a deliberately documented dynamic CSS-property exception, or a
line explicitly marked as legacy input. No normalized output code block may contain one
of those patterns.

Then run:

```sh
sh packages/fractal-agentic/scripts/check-armory.sh
sh packages/fractal-agentic/scripts/verify.sh
```

Expected results: valid JSON, armory check passes, and the repository verification script
passes. If the full plugin verification is blocked by unrelated dirty-tree state, report
that fact and provide the targeted command output instead of changing unrelated files.

## Return receipt

```text
STATUS: complete | partial | blocked
OWNED PATHS: <exact paths>
CHANGED PATHS: <file-by-file summary>
COMMAND RESULTS: <exact commands and evidence>
JUDGMENT CALLS: <decisions made, or none>
GAPS: <unfinished work, or none>
RESIDUAL RISK: <remaining risk, or none>
PROPOSED VERDICT: ship | fix-first | rethink
```
