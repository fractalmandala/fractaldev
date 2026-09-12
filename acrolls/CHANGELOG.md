# Changelog

All notable changes to the **Acrolls** public package are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Consumers install one package, `acrolls`; the `@acrolls/*` units are bundled implementation details
that are not published separately, so every change is recorded here against the umbrella version.

## [Unreleased]

## [0.8.0] - 2026-09-06

The launch-ready release: a complete docs shell and content-component set, build-time search and
API-reference generation, a from-scratch project scaffold, and an accessibility pass — all delivered
through the single public `acrolls` package and its `acrolls/*` entrypoints.

### Added

- **`acrolls create <dir>`** scaffolds a new, pre-wired SvelteKit docs project — a root landing
  route, a `DocsShell` docs route, a single-corpus `source.ts`, the Acrolls mdsvex preprocessor, a
  static adapter, CSS-first style entrypoints, and warning-free starter content. It refuses a
  non-empty target directory unless `--force`, and supports `--name`, `--title`, `--base-href`,
  `--mode`, `--package-manager`, and `--dry-run`.
- **`acrolls api-ref <spec|dir>`** generates Markdown API-reference pages from **OpenAPI**,
  **AsyncAPI**, or **GraphQL** specs. JSON (including GraphQL introspection) needs no dependency;
  YAML and GraphQL SDL use the optional `yaml` and `graphql` peers, loaded lazily.
- **`acrolls search-index`** packages the [Pagefind](https://pagefind.app) search bundle from the
  built static site, so full-text search is generated at build time with no runtime search service.
- **Content components** in `acrolls/svelte`: `Tabs` / `Tab` / `TabItem`, `Steps` / `Step`,
  `Cards` / `Card`, and `CodeGroup`, alongside the existing `Publication`, `Callout`, `Figure`, and
  `Banner` enhancers.
- **Docs shell component set** in `acrolls/docs`: `DocsShell`, `DocsSidebar`, `DocsNavTree`,
  `DocsAccordion`, `DocsBreadcrumbs`, `DocsPager`, `DocsToc`, `DocsPageHeader`, `DocsHeader`,
  `DocsSearch`, `ThemeToggle`, `PageActions`, and `PageFeedback`, with responsive nav and TOC
  sidebars and a server-rendered TOC driven by compile-time heading facts.
- **`showThemeToggle` prop** on `DocsShell` / `DocsHeader` to hide the built-in light/dark toggle
  when the host already owns theme switching (e.g. a `fractalthemer` picker), so two controls never
  compete to write `data-theme`.
- **Accessibility** across the shell: keyboard navigation, a focus trap and `Escape`-to-close in
  dialogs, ARIA wiring, and a skip link.
- **Multi-source docs** via `mergeLoaders` / `mergeRaw`, letting several content corpora render under
  one docs hierarchy as first-level sections.
- **SEO, social, and AI surfaces**: `DocsSeo` / `buildDocsSeo` (title, canonical, JSON-LD),
  `docsSitemap` / `docsRobots`, build-time Open Graph images (`acrollsOgCard`, `docsOgImagePath`),
  and the static AI tier (`docsLlmsTxt`, `docsLlmsFullTxt`, `docsPageMarkdown`, `CopyPageMarkdown`).
- **Optional theming** through `fractalthemer` (`acrolls/styles/theme`, `acrolls/styles/colors`) as an
  optional peer dependency, plus the `acrolls docs init` starter command and IA frontmatter
  (`sidebar.order`, `sidebar.label`).

### Changed

- Version bumped to **0.8.0** for the public `acrolls` package and its bundled `@acrolls/*` units.
- The Acrolls docs UI kit was adopted into the packages: design tokens, hooks, and class names were
  re-namespaced to Acrolls and de-branded, and styling is plain CSS first — shipped as both CSS and
  editable SASS from one source — with no Tailwind dependency.
- The `examples/kit-consumer` host was rebuilt on the new shell and now demonstrates search, SEO, OG
  images, and multi-source docs end to end.

### Deprecated

- `createAcrollsDocsSource` (from `acrolls/sveltekit`) is legacy, superseded by `content()` +
  `markdownGlob`. It still works unchanged and warning-free; see the migration guide in
  `docs/integrate-sveltekit.md`.

### Fixed

- **Code highlighting renders dual-theme.** Shiki emits `--shiki-light` / `--shiki-dark` variables
  (`defaultColor: false`); the shipped stylesheets now map them to `color` / `background`, so fenced
  code is coloured in both light and dark themes instead of monochrome.
- **Search result URLs resolve cleanly.** Pagefind's `…/index.html` hits are normalized to their
  canonical route (`/docs/…`) so `DocsSearch` navigates to live pages rather than a `.html` 404.
- **Search dialog accessibility.** `DocsSearch` announces its result count through a polite live
  region and restores focus to the trigger via the dialog's `close` event, so focus is returned no
  matter how it closes — `Escape`, the backdrop, or a result navigation.

### Notes

- Releases before 0.8.0 predate this changelog. The full session-by-session history lives in
  `docs/evolution/sessions.md`.

[Unreleased]: https://github.com/fractalmandala/Acrolls/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/fractalmandala/Acrolls/releases/tag/v0.8.0
