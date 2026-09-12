# Tasks — Authored frontmatter contract

- [x] Add mdsvex document-fact exports and leading-H1 transformation.
  - Acceptance: compiled Markdown exposes frontmatter/H1/link facts without running its component.
  - Verify: `pnpm --filter @acrolls/mdsvex test`.
- [x] Add authored admission and diagnostics to `@acrolls/docs`.
  - Acceptance: invalid ordinary pages are absent from all generated source surfaces; index/group
    titles follow the approved precedence.
  - Verify: `pnpm --filter @acrolls/docs test`.
- [x] Pass document facts through the SvelteKit source adapter and render `DocsPageHeader`.
  - Acceptance: the example shows the resolved title/description and no duplicate initial H1.
  - Verify: `pnpm --filter @acrolls/example-kit check`.
- [x] Apply the authored rules in `acrolls validate`, including Markdown links to rejected docs.
  - Acceptance: the CLI aggregates actionable errors and exits non-zero in authored mode.
  - Verify: `pnpm --filter @acrolls/cli test`.
- [x] Configure and verify the kit consumer corpus and documentation.
  - Acceptance: `pnpm build:example` and the authored validator pass on the corrected fixture.
  - Verify: package checks, build, validator, and browser review.
