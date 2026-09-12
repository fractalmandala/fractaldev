---
title: "Working with AI · astryx-svelte"
description: "How to set up AI coding tools to generate correct component code."
---


How to set up AI coding tools to generate correct component code.

## Overview [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#overview)

The design system is built to be AI-friendly: consistent naming, predictable prop patterns, and a CLI that feeds structured documentation directly into AI context windows. But models still need the right context to avoid falling back to generic Svelte patterns or inventing props.

The CLI includes a built-in agent docs system that generates context files for your AI tool of choice. One command sets up everything your AI needs to write correct component code.

## Quick Start [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#quick-start)

Tell your AI to install the CLI and set itself up:

Paste this into your AI

```
Install @astryx-svelte/cli and run `npx @astryx-svelte/cli init --features agents` to set up your Astryx context. Read the generated file.
```

That's it. The `init --features agents` command generates everything your AI needs (component index, behavioral rules, CLI reference) pulled from your installed version. After a version bump, run it again to update in place.

By default this creates `AGENTS.md` (the tool-agnostic standard most agents read). To target a specific tool's file instead:

Manual options

```
npx @astryx-svelte/cli init --features agents --agent claude    # .claude/CLAUDE.mdnpx @astryx-svelte/cli init --features agents --agent cursor    # .cursorrulesnpx @astryx-svelte/cli init --features agents --agent codex     # AGENTS.md (Copilot, Codex, etc.)
```

## What Gets Generated [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#what-gets-generated)

The generated context teaches your AI a 3-step workflow before writing any UI code:

1.  `astryx-svelte template --list`: find a related page pattern to use as reference
2.  `astryx-svelte template <name> --skeleton`: study the layout structure
3.  `astryx-svelte component <Name>`: read props and examples for every component used

It also includes rules that prevent common mistakes (no raw divs, no inline `style` on wrappers, use tokens not magic values) and a CLI quick reference. After setup, you shouldn't need to manually correct your AI on these conventions; the agent docs handle it at the system level.

## Cursor Setup [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#cursor-setup)

Cursor project rules aren't always picked up; it selects which rules to apply based on relevance. For reliable inclusion, install the design system context as a User Rule instead. User Rules live at ~/.cursor/rules/ and apply across all projects.

Install as a Cursor user rule

```
mkdir -p ~/.cursor/rulesnpx @astryx-svelte/cli init --features agents --agent-docs-path ~/.cursor/rules/astryx-svelte.mdc
```

## Checking Your Setup [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#checking-your-setup)

Paste this into your AI before writing any component code. These three questions have a 0% pass rate without docs; models confidently guess wrong on all of them. If your AI can't answer them, it'll know to install the agent docs first.

Paste this into your AI

```
Before writing any Astryx code, check your knowledge:1. What is the correct import path for Button?2. How do you make a Dialog non-dismissible?3. What prop does Selector use for its items?If you don't know all three, run `npx @astryx-svelte/cli init --features agents` to generate agent docs, then read the generated file.
```

## The astryx-svelte Pattern [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#the-astryx-svelte-pattern)

AI agents frequently invoke the CLI with incorrect paths (e.g. node\_modules/@astryx-svelte/cli/bin/docs.mjs instead of astryx-svelte.mjs), leading to silent failures. Adding an npm script alias with the correct path eliminates this entirely.

package.json

```
"scripts": {  "astryx-svelte": "node node_modules/@astryx-svelte/cli/bin/astryx-svelte.mjs"}
```

With this alias, agents use `astryx-svelte component --list` instead of guessing the binary path. The `--` separator is standard npm convention for passing flags to scripts.

Reliable CLI invocation

```
astryx-svelte component --listastryx-svelte component Dialog --denseastryx-svelte docs styling --denseastryx-svelte docs tokens --dense
```

## The --dense Flag [#](https://astryx-svelte-docs.vercel.app/docs/working-with-ai#the-dense-flag)

Every CLI command supports --dense, which outputs a token-efficient format designed for AI context windows. Use it when pasting CLI output into a web-based AI tool like ChatGPT or Claude.

Dense output for pasting into AI conversations

```
astryx-svelte component Dialog --denseastryx-svelte docs styling --denseastryx-svelte docs tokens --dense
```
