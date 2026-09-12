# Plan — Acrolls repair and verification

## Repair objective

Restore a clean repository health baseline without changing Acrolls' host-ownership boundary or
public content/navigation model. Existing feature work remains the subject of the historical plan
below; this section records the current repair sequence and its acceptance gates.

## Repair order

1. Preserve optional custom naming conventions while making the built-in `numbered()` and `dated()`
   return types expose their implemented `verify()` method to TypeScript callers.
2. Run the focused `@acrolls/docs` check and tests, then the repository package check, tests, and
   production build.
3. Verify the public CLI from the repository root and correct only confirmed path/version
   ergonomics that are inside Acrolls' own scripts.
4. Reconcile stale task/checklist guidance and audit the explicit styling rules against existing
   source without introducing unapproved classes or changing host product scope.
5. Complete browser acceptance and the packed-consumer install/build gate where the environment
   permits it.

## Acceptance criteria

- `pnpm --filter @acrolls/docs check` passes with zero errors and the existing docs tests remain green.
- `pnpm check`, `pnpm test`, and `pnpm build` pass from the repository root.
- `./packages/cli/dist/index.js validate examples/starter/article.md` passes from the repository root.
- The packed public package contains its documented exports and a fresh consumer can install and build.
- Browser checks cover docs root, nested navigation, persisted open state, TOC, pager, and console errors.

## Repair status

All acceptance criteria above are met as of the 0.8.0 release-prep pass (per-item evidence lives in
[todo.md](./todo.md)): `pnpm check` / `pnpm test` / `pnpm build` green; the packed-consumer gate and
the fresh-consumer adoption funnel (`--version` → `create` → `validate` → scaffold build) both pass;
root-CLI `validate examples/starter/article.md` exits 0; and a headless browser run against the
served `build/` confirms search, TOC, dual-theme Shiki, tabs/CodeGroup, the mobile drawer, nav
persistence, and a clean console. Publishing remains a deliberate human step (see
[docs/release.md](../docs/release.md)).

## Boundaries

- Always preserve dirty user changes and the public `acrolls/*` entrypoint contract.
- Ask first before adding dependencies, changing public navigation semantics, or publishing.
- Never hide a failed verification behind a generated `dist` result or claim browser/release readiness
  from unit tests alone.

# Historical plan — Content-source and navigation layer

## Architecture

```text
import.meta.glob(.md)
        │
        ▼
@acrolls/sveltekit source adapter
        │  normalize keys / lookup / entries
        ▼
@acrolls/docs pure document tree builder
        │  host definition / fallback discovery / ordering / hidden
        ├── source.nav ───────► DocsShell
        ├── source.load(slug) ► SvelteKit +page.ts
        └── source.entries() ─► prerender entries
```

## Implementation Order

1. Define the host-owned page/group tree contract and fallback precedence in `@acrolls/docs`.
2. Add unit tests for explicit links/levels/roles, fallback paths, metadata, ordering,
   hidden pages, and collisions.
3. Add the SvelteKit source adapter and package dependency/export surface.
4. Update the kit consumer example and snippets to use the generated source.
5. Replace mandalarepo’s custom nav type with the generated source integration, using a
   curated glob until its malformed legacy Markdown is repaired or excluded.
6. Update Acrolls product/technical docs and run package/example/consumer checks.

## Risks and Mitigations

- Legacy Markdown currently fails mdsvex compilation: keep source discovery configurable
  and do not claim the full mandalarepo corpus is build-safe as part of the first slice.
- Keep the first source contract Markdown-first; defer automatic `.svx` discovery until the
  typed metadata and navigation contract is stable.
- `DocsNav` has separate section/node shapes: widen them compatibly so explicit host-defined
  group landing links work at every depth without forcing manual-nav consumers to migrate.
- Static builds need entries: expose a serializable route-entry method and test it in the
  example.
- A large eagerly compiled glob can increase build cost: preserve lazy body loaders and
  document the eager metadata tradeoff.
