---
title: Draft Note
description: Proves that `filter` removes a document from every addressable surface.
draft: true
---

This page is marked `draft: true` in its frontmatter. The collection's
`filter: (entry) => !entry.data.draft` drops it before the docs engine ever sees it, so it is
absent from the sidebar, breadcrumbs, and pager — and `/docs/guides/draft-note` returns the
host's normal 404 instead of rendering. That is the difference between `filter` and `hidden`:
`hidden` pages stay routeable, filtered pages are unaddressable.

Unaddressable is not the same as absent. This file still sits inside the globbed content
directory, so Vite materializes it into the module graph at build time and this very paragraph
is present in the built chunks even though nothing routes to it. `filter` is a publication
boundary, not a confidentiality boundary — secret or embargoed content must live outside the
globbed directory, or behind host-owned authentication.
