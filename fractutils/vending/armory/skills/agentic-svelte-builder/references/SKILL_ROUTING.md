# Svelte Skill Routing

The builder is the short-prompt entry point. Do not load every Svelte skill for every
request. Resolve the intent first, then activate the smallest useful skill set from
[`SKILL_ROUTING.json`](./SKILL_ROUTING.json).

For a deterministic smoke test or host integration, resolve a request with:

```bash
python3 scripts/resolve-skill-route.py \
	--routing references/SKILL_ROUTING.json \
	--prompt "add a collapsible accordion"
```

## Precedence

Apply rules in this order:

1. Workspace `AGENTS.md` and the active Svelte Boss contract.
2. The entry skill (`agentic-svelte-builder` or `react-to-sveltekit`).
3. Required skills for the resolved intent.
4. Conditional skills only when their trigger is present.

## Routing table

| User intent | Required skills | Conditional skills |
| --- | --- | --- |
| Add/build a reusable component | `svelte-runes`, `svelte-components-patterns`, `svelte-styling-patterns` | `frontend-a11y` for interactive UI; `svelte-components` for library/web-component/form integration |
| Convert React/Next UI | `react-to-sveltekit`, then the reusable-component chain when applicable | `svelte-template-directives` for DOM APIs; motion stack for animation; `css-to-sass` for CSS/SCSS input |
| Build or convert a SvelteKit page/route | `sveltekit-data-flow`, `sveltekit-architecture` | `sveltekit-structure` for layouts/errors/hydration; `sveltekit-remote-functions` only with explicit experimental opt-in |
| Convert CSS/SCSS to repository styling | `css-to-sass`, `svelte-styling-patterns` | `svelte-styling` only when the target workspace permits scoped `<style>` or `style:` directives |
| Add DOM behavior or third-party integration | `svelte-template-directives` | `frontend-a11y`; `svelte-style-canvas` for visual inspection |
| Add animation or motion | `motion-ui`, `motion-foundations` | `motion-patterns` for common UI; `motion-advanced` for drag, SVG, or imperative sequences |
| Prepare deployment/build/package output | `svelte-deployment`, `vite-patterns` | `sveltekit-structure` when deployment changes route/SSR behavior |
| Preview or inspect visual styling | `svelte-style-canvas` | `frontend-a11y` for interaction review |

## Duplicate and conflict policy

- Use `svelte-runes` as the compact routing reference. Use `svelte-5-runes` only for
  deeper rune audits until its unique guidance is folded into references.
- Use `sveltekit-data-flow` for `+page.ts` versus `+page.server.ts` decisions;
  architecture adds composition and structure adds path/error lookup.
- Do not automatically activate `svelte-styling` for builder output: its generic
  component-style examples conflict with this repository's external-SASS contract.
- Motion skills describe a behavior engine, not permission to add a dependency or use
  inline styles. Check the target package and styling policy first; otherwise use native
  Svelte transitions or external SASS and record the fallback.
- Remote functions are an opt-in experimental route. Never introduce the config flag or
  `.remote.ts` files unless the prompt and target workspace authorize them.

## Agent output

The final receipt should name the entry skill, required skills, conditional skills that
were activated, and any conditional skill intentionally skipped with its reason. The
receipt must still include the normal changed paths, verification evidence, gaps, and
`ship | fix-first | rethink` verdict.
