---
description: Start a Fractal Svelte task — route it, load only the named skills, and run the delivery loop.
---

# /svelte

```text
/svelte <what you want built>
```

Entry point for any non-trivial Svelte or SvelteKit task in this project.

## Procedure

1. Read [`AGENTS.md`](../AGENTS.md) — the contract. Skip if already loaded this session.
2. Route the task. This names the exact skills to load:

   ```sh
   fa route "<the task>"
   ```

3. Load only those skills, in order. Do not open others.
4. Run `fa tokens --dense` before writing any style value.
5. Build, then verify:

   ```sh
   fa verify --all
   ```

6. Exercise every affected route in a browser. Report the three verification
   layers separately and close with one verdict: **ship | fix-first | rethink**.

For multi-step work, delegation, or a completion claim, read
[`PLAYBOOK.md`](../PLAYBOOK.md).

## Trivial exemption

A single-sentence answer or a pure explanation with no repository change: answer
directly. Do not route.
