# Related skills — compose vs hand off

## Compose (same invocation)

| Skill | What it contributes |
| --- | --- |
| `styling-docs-builder` | Class registry, token tables, orphan detection methodology |
| `layout-capture` | Region / containment thinking (Mermaid optional; not required as deliverable) |
| `fa-flow-mapper` | Evidence discipline, offline canvas UX patterns (adapt, do not ship architecture-node canvas as the primary artifact) |

When composing: extract the **methods**, then emit this skill’s three artifacts
(`style-pack.json`, `preview.html`, `report.md`). Do not dump a full design-system
doc or a Mermaid-only response unless the user also asked for those.

## Prefer another skill instead

| User intent | Prefer |
| --- | --- |
| “Map the architecture / data flow of this page” | `fa-flow-mapper` |
| “Draw Mermaid of the layout” | `layout-capture` |
| “Document the design system / all classes” | `styling-docs-builder` |
| “Redesign this UI” | Design boss + `impeccable` / `better-ui` |
| “Port this component” | Svelte boss + `port-component` |

## Monorepo note

A project-local sibling may exist at `.agents/skills/flow-mapper/SKILL.md` with
`vendors/flow-maps/` deliverables. Style canvas uses `vendors/style-previews/` so
the two artifact trees never collide.

## Future (out of v1 skill body)

- MCP `resolve_svelte_styles` for deterministic extract
- L3 Playwright computed-style capture
- Workflow gate: explore → resolve → generate → browser verify
