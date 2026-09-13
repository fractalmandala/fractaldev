---
title: Customization ladder
description: Escape hatches from content tokens to full surface replace.
order: 5
---

Acrolls ships correct defaults. Climb only as far as you need:

1. **Content** — frontmatter, folders, `entries`, genres (`acrollsFields.page` / `.post`).
2. **Tokens** — override `--acrolls-*` / `--acrolls-docs-*` / `--acrolls-ui-*` on a host ancestor.
3. **Shell props & slots** — `DocsShell` flags, header actions, `showThemeToggle`, custom page chrome.
4. **Replace a surface** — keep `content()` + nav data; swap `DocsSidebar` / `Publication` for your own.

You never fork the package to theme a docs site. Blog posts and versioned trees use the same ladder.
