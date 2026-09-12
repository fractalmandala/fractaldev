# Acrolls

**SvelteKit publishing + documentation framework** — Markdown/mdsvex articles and a Fumadocs-class docs shell.

> Just write. Acrolls handles the rest.

Not a CMS or host. You own the SvelteKit app; Acrolls owns compile, article UI, and docs chrome.

## Documentation (start here)

**→ [docs/README.md](./docs/README.md)** — self-serve handbook to wire Acrolls into **your** projects.
For the next independent host trial, begin with the [third-host setup path](./docs/README.md#third-host-trial) and work through the [checklist](./docs/checklist.md).

For coding agents, start with [`llms.txt`](./llms.txt), then follow the linked integration and
validation guides in order.

Scaffold a brand-new docs project, or add Acrolls to an existing SvelteKit host:

```bash
# start from scratch: a pre-wired SvelteKit docs project
pnpm dlx acrolls create my-docs

# or add to an existing host, then run the CLI-led onboarding flow
pnpm add acrolls@latest
pnpm exec acrolls onboard --docs-dir docs --base-href /docs
```

| Guide | Topic |
|---|---|
| [Getting started](./docs/getting-started.md) | First integration |
| [Install from npm](./docs/local-install.md) | Published package installation and verification |
| [Integrate SvelteKit](./docs/integrate-sveltekit.md) | Config + route patterns |
| [Content authoring](./docs/content-authoring.md) | Markdown / SVX / fences |
| [Docs shell](./docs/docs-shell.md) | Sidebar, TOC, nav, persistence |
| [Styles](./docs/styles.md) | foundation / default / tokens |
| [CLI reference](./docs/cli.md) | create · onboard · validate · studio · integrate · search-index · api-ref |
| [Troubleshooting](./docs/troubleshooting.md) | Common failures |
| [Checklist](./docs/checklist.md) | Printable integration list |
| [Release](./docs/release.md) | Publish order and package-only registry test |
| [Changelog](./CHANGELOG.md) | Version history (Keep a Changelog) |

Copy-paste: [docs/snippets/](./docs/snippets/).

## Packages

| Package | Purpose |
|---|---|
| `acrolls/mdsvex` | mdsvex pipeline (GFM, slugs, tables, Shiki, fence meta) |
| `acrolls/svelte` | `Publication`, Banner, Callout, Figure, Video, Mermaid |
| `acrolls/styles/*` | `foundation.css`, `default.css`, SASS tokens |
| `acrolls/docs` | Docs shell: nested nav, TOC, breadcrumbs, pager |
| `acrolls` | Public npm package, runtime entrypoints, and CLI |

Applications install only `acrolls`. The scoped `@acrolls/*` packages are bundled implementation
units exposed to applications through the supported `acrolls/*` subpaths above.

## Develop this monorepo

```bash
pnpm install
pnpm build
pnpm dev:docs
./packages/cli/dist/index.js validate examples/starter/article.md
```

`pnpm dev:docs` runs the `@acrolls/docs` package watcher and the SvelteKit example together.
Open `http://127.0.0.1:5173/docs` to preview component, layout, and CSS-token changes without
publishing. The example includes persisted Paper, Midnight, and Moss theme presets; edit the
Docs package under `packages/docs` and the shared theme styles under `packages/styles`.

## Status

Alpha. The public installation contract is `pnpm add acrolls@latest`; applications should not
install workspace paths or scoped implementation packages directly.
Roadmap: [docs/VISION.md](./docs/VISION.md).

## License

Apache-2.0
