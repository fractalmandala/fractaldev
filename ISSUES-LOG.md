# Issues Log

This is a place to log in common errors and issues that can arise in this monorepo, and to document the fixes that worked. 

1. Do NOT log every issue and fix here! This is for special learnings for problems that repeat often, so that solutions are readily available. 
2. Log issue here ONLY on user request/instruction.

Follow this structure to log issues:

```
### Describe issue
// write clear definition of what was breaking, in what file(s) and why.
// write clear definition of the solution that was implemented, and what fixed it.
```

## Issues 

### Cross-Project Imports & Monorepo Linkage: Troubleshooting Checklist

When connecting sibling packages (e.g., `fractalpop`, `fractalstyler`) across projects (e.g., `frcked`, `apps/demo`) and facing cascading red errors or broken imports, check and apply the following fixes:

---

#### 1. Wiping out SvelteKit's `$lib` by defining `paths` in `tsconfig.json`
- **What breaks**: Suddenly, every single `$lib/...` import across the entire project turns red with `Cannot find module '$lib/...'`.
- **Why**: In TypeScript, if a child `tsconfig.json` defines `"compilerOptions": { "paths": { ... } }`, TypeScript **does not merge** them with the parent config (`extends: "./.svelte-kit/tsconfig.json"`). It completely replaces the parent's `paths`, erasing `$lib`, `$lib/*`, and `$app/types`.
- **The Fix**: 
  - Do **not** use `tsconfig.json` `paths` for local monorepo dependencies.
  - Link the local package in `package.json` instead:
    ```json
    "dependencies": {
      "fractalpop": "link:../fractalpop/packages/core",
      "@fractalpop/svelte": "link:../fractalpop/packages/svelte"
    }
    ```
  - Run `pnpm install`. TypeScript resolves linked packages through `node_modules` automatically without needing any entries in `tsconfig.json`.

---

#### 2. Unbuilt `dist/` outputs causing `svelte.config.js` crashes and Svelte 4 fallbacks
- **What breaks**: Svelte files show strange syntax errors on valid Svelte 5 code:
  - `Expected if, each or await` on `{#snippet ...}`
  - `Unexpected character '@'` on `{@render children()}`
  - Red error at the top of the file: `Error in svelte.config.js: Cannot find module '.../dist/index.js'`.
- **Why**: Clean monorepo projects exclude compiled `dist/` folders. If a project's `svelte.config.js` imports a sibling package that hasn't been built yet (e.g. `mdsvex` highlighter), Node crashes trying to evaluate `svelte.config.js`. When the config crashes, VSCode's Svelte extension silently falls back to legacy Svelte 4 mode, which does not recognize Svelte 5 runes or snippets.
- **The Fix**:
  - Run `pnpm run build` once inside the dependency package(s) (e.g. `pnpm --dir fractalpop run build`) so `dist/` and `.d.ts` files exist on disk.
  - In VSCode: run `Cmd+Shift+P` -> `Svelte: Restart Language Server`.

---

#### 3. Missing root `tsconfig.json` in nested apps
- **What breaks**: Nested apps (like `fractalpop/apps/demo`) show persistent module errors on imports like `$lib` or sibling packages, and window reloads do not clear them.
- **Why**: SvelteKit generates `.svelte-kit/tsconfig.json`, but VSCode and the TypeScript language server only detect the project if a root `tsconfig.json` exists in that project folder.
- **The Fix**:
  - Ensure every SvelteKit app in the monorepo has a root `tsconfig.json`:
    ```json
    {
      "extends": "./.svelte-kit/tsconfig.json",
      "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true,
        "moduleResolution": "bundler"
      }
    }
    ```
  - Run `pnpm exec svelte-kit sync` in that project folder.

---

#### 4. Prefix-matching Vite alias breaking subpath exports
- **What breaks**: Subpath imports (like `import { highlight } from 'fractalpop/full'` or `'fractalpop/core'`) throw:
  `[UNLOADABLE_DEPENDENCY] Could not load .../src/index.ts/full: Not a directory`.
- **Why**: A naive alias like `'fractalpop': '.../src/index.ts'` in `vite.config.ts` prefix-matches all imports starting with `fractalpop`. It replaces `fractalpop` with the file path `.../index.ts`, creating invalid paths like `.../index.ts/full`.
- **The Fix**:
  - Use `link:` in `package.json` so Vite resolves root and subpath exports natively through the package's `exports` map.
  - If using an alias in `vite.config.ts`, use regex exact matching (`'^fractalpop$': '...'`), or point to the package root directory rather than an `index.ts` file.

---

#### 5. SASS live sharing across projects without file duplication
- **What breaks**: Having duplicate copies of `src/lib/styles/*` across 10 projects, causing changes in `fractalstyler` to not reflect in other running apps.
- **Why**: SASS needs explicit load paths to resolve `@use` partials across folders, and Vite restricts file access outside the project root by default.
- **The Fix**:
  - In the consuming project's `vite.config.ts`:
    ```ts
    export default defineConfig({
      resolve: {
        alias: {
          '$fractalstyler': new URL('../fractalstyler/src/lib/styles', import.meta.url).pathname
        }
      },
      css: {
        preprocessorOptions: {
          sass: {
            loadPaths: [
              new URL('../fractalstyler/src/lib/styles', import.meta.url).pathname
            ]
          }
        }
      },
      server: {
        fs: {
          allow: ['..'] // Allow Vite to serve and watch styles from sibling directories
        }
      }
    });
    ```
  - In `+layout.svelte`, import `$fractalstyler/index.sass`.
  - In any component or SASS file, `@use '00_tokens' as *` resolves directly from `fractalstyler` with instant Hot Module Replacement (HMR).