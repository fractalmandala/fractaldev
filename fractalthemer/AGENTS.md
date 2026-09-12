# AGENTS

> You cannot add ad-hoc CSS anywhere. Styles are added ONLY inside the system's designated files (fractalstyler2 templates / the project's global SASS sections), always via fractal mixins and existing tokens. No scoped `<style>` blocks anywhere, including components. 

> All colors, spacing, radii, and shadows resolve from the shared 30-token vocabulary (source of truth: fractalstyler2 _00_tokens.sass, mirrored by fractalthemer CORE_TOKENS). Never invent token names, never use legacy aliases (--theme, --theme-hover), never hardcode a value a token covers.

**You MUST understand and use the `fractalstyler2` SASS system. Learn it here - https://github.com/fractalmandala/fractalstyler2/blob/main/docs/agents/registry.md.**

NPM link - https://www.npmjs.com/package/fractalstyler2

If you find existing violations of these rules. Drop a comment to user. The project is in flux and they might be known, temporary violations. The project is part of a core set that should always be in sync. You are never working in any one of these projects alone. You are working in a WIP ecosystem. 

1. `fractalsvelte` is a website to front various Sveltekit projects, docs, and resources.
2. `Fractalsvelte UI` - WIP components library at `/Users/amrit/fractalmandala/fractalcodex`.
3. `Fractalstyler2` - SASS styling system at `/Users/amrit/fractalmandala/fractalstyler2`. [NPM](https://www.npmjs.com/package/fractalstyler2) and [Github](https://github.com/fractalmandala/fractalstyler2).
4. `Fractalthemer` - Themeing and theme building system for Fractalstyler2, at `/Users/amrit/fractalmandala/fractalthemer`. [NPM](https://www.npmjs.com/package/fractalthemer) and [Github](https://github.com/fractalmandala/fractalthemer).

Contract changes start in `fractalstyler2` → mirror to `fractalthemer` → run pnpm tokens:generate in `fractalcodex` if applicable → verify all three build. And a change in one repo usually means a version bump in another. 

> `fractalcodex` is folder name of the `fractalsvelte-ui` components library. 

## Dev Servers

Always first check with user if they have dev server active, before starting your own. If they do, use that. Always kill servers that you have started, when done. Do not leave them running background.

## Other Rules

- always keep docs, README, and AGENTS up to date in any project. 
- all docs should have YAML frontmatter:

```
title: 
description: 
type: {project/site name}
```

- if you see a doc without frontmatter, add it.
- "done" always means that for any fix/feature/mod the docs have always been updated, package version has been bumped up, and update is ready to be published at npm
- for any icons, use installed package `fractalicons` or install it from [NPM](https://www.npmjs.com/package/fractalicons).
- do not use local reference file paths for package dependencies. always use the NPM sources.

> If you find yourself using styling not in fractalstyler2, or using components not from fractalsvelte-ui then either 1) you are being careless and non-compliant, or 2) you must notify user for feature request(s) in those projects.

## Working Index

- Fractalsvelte (site) - not yet in Github, not live.
- Fractalsvelte UI - /Users/amrit/fractalmandala/fractalcodex | will overwrite the repo https://github.com/fractalmandala/fractalsvelte | will overwrite the package https://www.npmjs.com/package/fractalsvelte
- Fractalthemer - /Users/amrit/fractalmandala/fractalthemer | https://github.com/fractalmandala/fractalthemer | https://www.npmjs.com/package/fractalthemer
- Fractalstyler2 - /Users/amrit/fractalmandala/fractalstyler2 | https://github.com/fractalmandala/fractalstyler2 | https://www.npmjs.com/package/fractalstyler2
- Fractalicons - /Users/amrit/fractalmandala/fractalicons | https://github.com/fractalmandala/fractalicons | https://www.npmjs.com/package/fractalicons

### WIP, Upcoming
- Svelte Animated Icons
- Acrolls, docs for Sveltekit
- Svelte Scaffold