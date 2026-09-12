# Plan — Authored frontmatter contract

## Implementation order

1. Add compile-time document facts to the mdsvex pipeline: whether YAML frontmatter exists,
   the initial Markdown H1 text, and authored Markdown destinations. In authored docs mode,
   strip only that initial H1.
2. Add an opt-in authored convention to the pure docs content source. It admits only valid
   Markdown documents, derives index titles from host groups, exposes diagnostics, and removes
   rejected documents from routes, entries, navigation, and pager inputs.
3. Extend the SvelteKit glob adapter to pass the generated document facts through to the content
   source. It remains lazy for article components and eager only for document facts.
4. Add reusable `DocsPageHeader` chrome, then configure the kit consumer for authored mode and
   render the title/optional description above each admitted article.
5. Extend `acrolls validate` to apply the same frontmatter and author-link rules to a corpus.
   The command is the production/CI gate; invalid input never silently becomes a route.
6. Add focused unit/CLI fixtures, package checks, a production build, and browser verification.

## Risks and controls

- Vite imports only named module exports from compiled Markdown. A stable Acrolls-owned named
  export carries compile-time document facts without executing article components.
- Runtime source construction can safely exclude metadata-invalid documents, but cannot protect
  an unrestricted Vite glob from a compile-invalid module. The CLI remains the build/CI gate for
  full-corpus compile failures.
- Author-link parsing is intentionally limited to ordinary Markdown links resolving to this
  Acrolls document source. External URLs and host-owned routes are not interpreted.
- The feature is opt-in through `convention: { mode: 'authored' }`; existing migration sources
  preserve their fallback-title behavior.

## Verification checkpoints

1. mdsvex tests prove facts are exported and only an initial H1 is removed.
2. docs tests prove admission, index-title, visibility, route, and link behavior.
3. CLI tests prove aggregate diagnostics and authored non-zero exits.
4. kit-consumer check/build prove integration; browser QA proves one visible H1 and the header.
