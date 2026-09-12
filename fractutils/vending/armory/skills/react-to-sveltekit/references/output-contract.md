# React-to-SvelteKit Conversion Output Contract

Every conversion emits one artifact manifest before or alongside implementation. The
manifest makes the conversion boundary explicit: source shape, destination files, public
API, route data, SSR behavior, dependencies, gaps, and verification evidence.

The canonical machine-readable shape is defined in
[`output-contract.schema.json`](./output-contract.schema.json). Emit it as a fenced
`json` block in the agent response or implementation receipt. Do not write it into the
destination project unless the user explicitly asks for a persisted manifest.

## 1. Classify the source first

Choose exactly one source kind:

| Source kind | Use when | Route/data requirement |
| --- | --- | --- |
| `component` | The source is a reusable React component with no page loader or route behavior. | `loadFile` must be `none`. Do not invent route files. |
| `route-component` | The component is being placed into an existing SvelteKit route. | List the existing route; only add route files when the prompt requires route behavior. |
| `page` | The source is a React/Next page, page loader, server action, or route endpoint. | Select an explicit SvelteKit route/data file and reason. |

Also classify the animation engine as `none`, `framer-motion`, `gsap`, `css-timer`, or
`canvas-webgl`. The animation classification does not replace the source-kind
classification.

## 2. Destination-file contract

List exact paths in `target.files` before editing:

- Component output normally includes `Component.svelte`, `Component.types.ts` when
  public types are non-trivial, and adjacent `Component.sass` when custom styling is
  required.
- Route output uses `src/routes/<route>/+page.svelte`.
- Universal public data belongs in `+page.ts`.
- Server-only data, secrets, database access, authenticated data, and form actions belong
  in `+page.server.ts`.
- API endpoint behavior belongs in `+server.ts`.
- Shared layout data belongs in `+layout.ts` or `+layout.server.ts`.
- Add `+error.svelte` only when the source has route-specific error behavior or the
  conversion introduces a route boundary that needs one.
- Extract reusable page UI under `src/lib/components/` rather than placing reusable
  logic in a route file.

The destination list is a plan and an acceptance boundary. A file not listed in the
manifest must not be created or modified without updating the manifest first.

## 3. React/Next data-flow mapping

Use the narrowest SvelteKit boundary that preserves behavior:

| Source behavior | SvelteKit target | Required manifest reason |
| --- | --- | --- |
| Public, serializable page data | `+page.ts` | Runs universally and does not require server-only imports. |
| `getServerSideProps`, database access, secrets, private environment variables, or auth data | `+page.server.ts` | Server-only execution is required. |
| `getStaticProps` with public data | `+page.ts` | Data can be loaded universally; record prerender/static-path behavior if present. |
| React form mutation, server action, or Next mutation endpoint | `+page.server.ts` action or `+server.ts` | Mutation must remain server-owned and progressively enhanced where applicable. |
| Shared auth/session/layout data | `+layout.ts` or `+layout.server.ts` | Data is consumed by multiple nested routes. |
| Client-only interactive fetch | Component `$effect` or client helper | Use only when it is genuinely interactive; otherwise prefer a load function. |

Server loads and actions may return only SvelteKit-serializable data. Do not return
functions, component constructors, DOM nodes, browser objects, class instances, or
unresolved promises.

## 4. SSR and browser boundaries

Set `ssr.mode` explicitly:

- `safe`: no browser-only API or DOM work is used during module evaluation or SSR.
- `browser-effect`: DOM, GSAP, canvas, observer, or storage work is inside `$effect` or
  `onMount` with teardown.
- `browser-guard`: browser-only code is protected with `browser` from
  `$app/environment` or an equivalent explicit guard.
- `disabled`: SSR is disabled only as a last resort, with `disabledReason` explaining
  why an effect/guard cannot preserve behavior.

The manifest must list every browser-only API in `ssr.browserOnlyApis` and the guard or
effect that contains it in `ssr.guards`. Never access `window`, `document`,
`localStorage`, `ResizeObserver`, canvas, or GSAP DOM targets at module top level.

## 5. Dependency and fallback contract

Inspect the target workspace `package.json` before selecting a conversion tier:

- Put installed packages in `dependencies.present`.
- Put required but missing packages in `dependencies.required` and `dependencies.missing`.
- Put a real native Svelte fallback in `dependencies.fallbacks` when one is used.
- Do not install packages or mutate `package.json` automatically.
- Do not claim a direct Framer Motion mapping without the target motion package. Use the
  documented native fallback for simple transitions, or return `partial`/`blocked` for
  behavior that cannot be preserved safely.

## 6. Verification contract

Select commands from the destination workspace rather than assuming `pnpm check`:

1. Detect the package manager from `packageManager` and lockfiles.
2. Inspect `package.json` scripts.
3. Prefer the workspace `check` script.
4. Run targeted tests when behavior, route data, actions, or SSR behavior changed.
5. Run `build` for route/SSR changes when the workspace exposes it.
6. Use direct `svelte-check` only when no workspace check script exists.

Each command must include its working directory, purpose, status, and concrete evidence.
Missing scripts are recorded as `skipped` with a reason; they are never silently omitted.
`status: complete` requires all required checks to be `passed` or an explicit accepted
exception recorded in `gaps`.

## 7. Required manifest fields

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "react",
    "kind": "component",
    "files": ["src/components/Button.tsx"],
    "route": null,
    "animationTier": "none"
  },
  "target": {
    "kind": "component",
    "files": ["src/lib/components/Button/Button.svelte", "src/lib/components/Button/Button.types.ts"],
    "route": null,
    "publicApi": {
      "props": ["variant", "children"],
      "bindings": [],
      "callbacks": ["onclick"],
      "snippets": ["children"]
    }
  },
  "dependencies": {
    "present": [],
    "required": [],
    "missing": [],
    "fallbacks": []
  },
  "dataFlow": {
    "loadFile": "none",
    "reason": "Presentational component has no route data.",
    "serverData": [],
    "actions": [],
    "invalidations": [],
    "serialization": "not-applicable"
  },
  "ssr": {
    "mode": "safe",
    "browserOnlyApis": [],
    "guards": [],
    "disabledReason": null
  },
  "verification": [],
  "gaps": []
}
```
