---
id: 11-mcp-server
title: Model Context Protocol (MCP) Server
type: design
tags: [mcp, tools, ai-agents, compilation, token-snapping, linting]
summary: Reference guide for the Fractalstyler2 Model Context Protocol server, covering tool schemas, compilation, snapping, and IDE agent configuration.
updated: 2026-08-30
---

Fractalstyler2 includes a high-performance MCP server (`fractalstyler2-mcp`). The MCP server equips AI coding agents (such as Claude Code, Codex, Gemini Antigravity, and OpenCode) to query the class registry and design tokens, snap raw pixel designs to token scales, translate inspected CSS into composed markup, and catch invented class names before they land.

## 1. Available MCP Tools

### `list_fractals`
Returns the class registry — the public API — grouped by layer. Query this
before naming any class you are not certain of:

```json
{
  "layer": "L2"
}
```

Accepts `all` or `L0`–`L5` (tokens, dimensions, containers, layouts, shells,
visuals and interactions). Each entry carries the class, the CSS it applies,
and its source file.

### `get_design_tokens`
Returns structured JSON definitions for all token scales. Supports category filtering (`all`, `space`, `typography`, `radius`, `shadows`, `surfaces`, `ink`, `breakpoints`):

```json
{
  "category": "space"
}
```

### `snap_to_tokens`
Takes arbitrary pixel values (e.g. from Figma or screenshot inspection) and calculates the closest matching token steps and difference errors:

```json
{
  "gap": 15,
  "padding": 26,
  "fontSize": 19,
  "radius": 5
}
```
**Output**:
- `gap`: `15px` $\rightarrow$ `--space-xs` (14–15px)
- `padding`: `26px` $\rightarrow$ `--space-md` (27–30px)
- `fontSize`: `19px` $\rightarrow$ `--text-md` (18–20px)
- `radius`: `5px` $\rightarrow$ `4px` (`.radius-4`)

### `css_to_fractals`
Converts raw CSS declarations into a composed class string, and reports any
declaration the registry does not cover:

```json
{
  "css": "display: flex; flex-direction: column; gap: 16px; padding: 24px; border-radius: 8px; background-color: #141824;"
}
```

**Output**:

```
Compose in markup:

<div class="box gap-xs pad-md radius-8">

Not covered by the registry:
  background-color: #141824
```

Note what it refuses to guess. `16px` snaps to `.gap-xs` (14–15px) rather than
`.gap-sm` (18–20px), and a raw hex is reported rather than mapped to a surface
role — the tool will not invent a semantic it cannot verify.

### `generate_component`
Generates a Svelte 5 component composed entirely from registry classes. The
output carries no style block — that is the expected outcome, not an omission:

```json
{
  "type": "card",
  "name": "TelemetryCard",
  "framework": "svelte"
}
```

### `validate_recipe`
Scans markup for the failure modes that matter: class names that are not in
the registry, component `<style>` blocks, and hardcoded pixel values.

```json
{
  "code": "<aside class=\"wiki-sidebar box gap-sm\">…</aside>"
}
```

**Output**: an error naming `.wiki-sidebar` as absent from the registry, with a
pointer to `list_fractals` and the cookbook.

### `compile_fractals`
Compiles an indented SASS snippet to CSS. The system exposes no authoring
mixins, so this is for the rare custom declaration that genuinely does not
compose — not the normal path:

```json
{
  "sassCode": "border-image: linear-gradient(#000, #fff) 1",
  "className": "gradient-edge"
}
```

---

## 2. Server Configuration

### Claude Code / Claude Desktop
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fractalstyler2": {
      "command": "npx",
      "args": ["-y", "fractalstyler2-mcp"]
    }
  }
}
```

### Gemini / Antigravity IDE
Add to `mcp.json` or run the setup command:

```json
{
  "mcpServers": {
    "fractalstyler2": {
      "command": "npx",
      "args": ["-y", "fractalstyler2-mcp"]
    }
  }
}
```

### OpenCode
Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "fractalstyler2": {
      "type": "local",
      "command": ["npx", "-y", "fractalstyler2-mcp"],
      "enabled": true
    }
  }
}
```

[Next - Agents](./12-agent-plugin.md)
