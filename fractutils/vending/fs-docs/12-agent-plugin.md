---
id: 12-agent-plugin
title: Agent Plugin & Coding Skills
type: design
tags: [agent-plugin, skills, ai-agents, automation, opencode, codex, claude]
summary: Reference guide for the Fractalstyler2 Agent Plugin, the bundled fractal-styler skill, and automated design system integration for AI agents.
updated: 2026-08-30
---


Fractalstyler2 is built from the ground up for the agentic era, fully conforming to the [agent-plugins.org](https://agent-plugins.org/specification) standard. It equips AI coding agents with deep domain knowledge of fractal composition, fluid token scaling, and automated design migration.

The plugin includes one bundled skill. It gives an agent the composition discipline the system depends on:

### `fractal-styler`
- **The prohibition**: no new class names, anywhere. Compose from the registry in the markup.
- **Token discipline**: no arbitrary pixel measurements, no foreign custom properties.
- **Semantic layering**: composition from L1 dimensions up to the canonical L4 shells.
- **Two generated references**: `references/fractals.md` (every class) and `references/tokens.md` (every token), both emitted from the stylesheet so they cannot go stale.

If you read the introduction doc, you know that the styling system is not too opinionated, and gives you - the human designer - ample space for play and preference. But I **strongly recommend** the opposite approach when managing agents in working with this system. If you tell an agent they can use `_08_own` to add their own classes, they WILL do it, even for all that existing classes already achieve. It will bloat your css before you can even react!.

## 2. Supported AI Agent Hosts

### OpenCode
Install the plugin manifest directly into OpenCode:

```json
// ~/.config/opencode/opencode.json
{
  "plugins": ["fractalstyler2"],
  "mcp": {
    "fractalstyler2": {
      "type": "local",
      "command": ["npx", "-y", "fractalstyler2-mcp"],
      "enabled": true
    }
  }
}
```

### Claude Code & Claude Desktop
Add the skill paths to your agent configuration or link `skills/` to your workspace.

### Gemini Antigravity
The plugin is natively recognized via `plugin.json` and automatically registers skills and MCP tools upon project discovery.

### Codex & Cursor
Agents running in Codex or Cursor can query MCP tools (`get_design_tokens`, `compile_fractals`, `validate_recipe`) directly during code generation and editing.

---

## 3. Golden Rules for AI Coding Agents

When generating or editing styles in a Fractalstyler2 project, agents must adhere to the following contract:

1. **Strict Token Resolution**: Never invent new CSS variables or hardcode hex colors when a semantic token exists in `_00_tokens.sass`.
2. **Compose in Markup**: The class registry is the API. Agents compose classes in the `class` attribute rather than authoring stylesheets — the same instruction holds whether the project took the CSS or the SASS path.
3. **No Component `<style>` Blocks**: In strict project configurations, a human author styles in `_08_own.sass` or shared SASS modules rather than in-component style tags.
4. **Zero Border-Radius Discipline**: When projects configure `data-shape="sharp"`, ensure all cards, modals, and buttons respect sharp $90^\circ$ corners.
5. **Physical Alignment**: Use `.xleft`/`.xcenter`/`.xright` for horizontal alignment and `.ytop`/`.ycenter`/`.ybot` for vertical alignment.
6. **Use `agents/registry.md` and `REGISTRY.md`. Do not create new classes.

[Next - Cookbook](./13-cookbook.md)