# Plan: unified CSS and Sass entrypoints

1. Convert the three authored CSS surfaces into canonical indented Sass under
   `packages/styles/src`, retaining semantics and selectors.
2. Add a deterministic styles build that emits CSS plus public Sass forwarding files, then add
   compile/diff tests.
3. Replace `packages/docs/styles.*` and `packages/acrolls/styles/*` with generated relays and
   remove the duplicate `packages/acrolls/sass/*` and nested `*/styles/sass/*` paths.
4. Extend package exports and the packed-consumer fixture for all CSS/Sass paths.
5. Update CLI integration/onboarding choices and all style-import documentation.
6. Remove empty style directories and run package/example/packed-consumer verification.

## Risk controls

- Preserve every existing CSS specifier in this release.
- Sass source conversion is mechanical and verified against generated CSS before deleting old CSS
  source files.
- The tarball test guards against workspace-only import resolution.
