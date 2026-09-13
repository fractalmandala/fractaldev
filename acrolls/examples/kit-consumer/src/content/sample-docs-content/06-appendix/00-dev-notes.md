---
title: Launch Log and Build
description: Pre launch readiness, extension build, CLI
id: 21
type: docs
---

## 1. Current State: What Happens If Installed Right Now?

### If Installed From npm
**It will fail immediately with an HTTP 404 error:**
```bash
npm error 404 Not Found - GET https://registry.npmjs.org/fractalstyler - Not found
```
- The package name `fractalstyler` is **not registered on npm**.
- The published package is named **`fractalstyler2`** (currently `v0.8.0`).
- Because `package.json` in this repository is named `"name": "fractalstyler"`, npm cannot find it under that identifier.

### If Installed From This Local Workspace (e.g. `npm install /path/to/fractalstyler` or `npm link`)
The package will install into `node_modules`, but **it will be largely unusable out of the box** due to three missing items:
1. **`index.js` is empty**:
   `src/lib/index.ts` contains only `// Reexport your entry components here`. Any `import { ... } from 'fractalstyler'` resolves to an empty module.
2. **Subpath exports are missing in `package.json`**:
   The exports map in `package.json` only defines root `"."`:
   ```json
   "exports": {
     ".": {
       "types": "./dist/index.d.ts",
       "svelte": "./dist/index.js"
     }
   }
   ```
   Even though the documentation instructs users to do:
   - `import 'fractalstyler/styles'`
   - `import { initPresets } from 'fractalstyler/presets'`
   - `import 'fractalstyler/css'`
   
   Node and Vite will reject these imports with:
   `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './styles' is not defined by "exports" in package.json`.
3. **No CLI binary defined**:
   There is no `"bin"` field in `package.json`, so commands like `npx fractalstyler init` fail with `could not determine executable to run`.

---

## 2. Breakdown of Package Manager Commands

| Command | Target Location | What Happens Right Now |
| :--- | :--- | :--- |
| `npm install fractalstyler` | `dependencies` | Fails with **404 Not Found** on npm. |
| `npm i -D fractalstyler` | `devDependencies` | Fails with **404 Not Found** on npm. |
| `npm add fractalstyler` | `dependencies` | Fails with **404 Not Found** (`add` is an alias for `install` in `npm`). |
| `npm add -D fractalstyler` | `devDependencies` | Fails with **404 Not Found**. |
| `npx fractalstyler init` | Ephemeral cache | Fails with **404 Not Found** (or `could not determine executable to run`). |
| `pnpx dlx fractalstyler init` | CLI Syntax Error | **Fails**: `pnpx` and `pnpm dlx` are redundant; `pnpx` tries to invoke a package called `dlx`. |

### Key Differences When Published

#### `npm install` vs `npm add`
In npm, `add` is an exact alias for `install`. There is zero functional difference. In `pnpm` and `yarn`, `add` is the canonical command to add a new dependency.

#### `dependencies` vs `devDependencies` (`-D`)
- **`npm install fractalstyler` (into `dependencies`)**: Listed in `"dependencies"`. In server deployments (Node/Docker adapter), production deployment scripts (`npm install --omit=dev`) will install the package on the server.
- **`npm i -D fractalstyler` (into `devDependencies`)**: Listed in `"devDependencies"`. Recommended for SvelteKit styling/UI libraries because Vite bundles all SASS/CSS and Svelte components into compiled assets at build time. The package is not needed in the production Node runtime.

#### Ephemeral Execution (`pnpm dlx` and `npx`) vs `node_modules`
Running:
```bash
npx fractalstyler init
# or
pnpm dlx fractalstyler init
```
- **Does NOT touch the project's `node_modules`**.
- **Does NOT touch `package.json`**.
- Downloads the package to a temporary cache in the user's home directory, executes the CLI script to copy files, and exits. The project's `node_modules` remains completely untouched.

---

## 3. The 5 Core Publishing Requirements & How to Fulfill Them

### 1. Tree-Shakeable Components (`import { Button } from 'fractalstyler'`)
- **`package.json` `"sideEffects"`**:
  Declare that only stylesheets have side-effects:
  ```json
  "sideEffects": [
    "**/*.css",
    "**/*.sass"
  ]
  ```
- **Re-exports in `src/lib/index.ts`**:
  ```ts
  export { default as Button } from './components/wa/button/Button.svelte';
  export { default as Dialog } from './components/wa/dialog/Dialog.svelte';
  export { default as Drawer } from './components/wa/drawer/Drawer.svelte';
  export { default as Input } from './components/wa/input/Input.svelte';
  export { default as Tooltip } from './components/wa/tooltip/Tooltip.svelte';
  export { default as Appshell } from './components/shell/Appshell.svelte';
  export { default as AppmainRails } from './components/shell/AppmainRails.svelte';
  ```
- **Packaging output**:
  When `@sveltejs/package` builds `dist/index.js`, each component remains in its own file. Vite and Rollup follow named re-exports directly to the individual component file, discarding unused components from the final bundle.

### 2. Styles Subpath Imports (`import 'fractalstyler/styles'` & `import 'fractalstyler/styles/shells'`)
- **Subpath exports in `package.json`**:
  ```json
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "svelte": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles": "./dist/styles/index.sass",
    "./styles/*": "./dist/styles/*",
    "./styles/shells": "./dist/styles/_05_shells.sass",
    "./tokens": "./dist/styles/_00_tokens.sass",
    "./themes": "./dist/styles/_00_themes.sass",
    "./css": "./dist/css/fractalstyler.css",
    "./css/min": "./dist/css/fractalstyler.min.css"
  }
  ```
- **Relative Sass `@use` resolution**:
  Inside `dist/styles/index.sass`, relative `@use './00_tokens'` calls resolve relative to the file itself inside `node_modules/fractalstyler/dist/styles/`. Vite hands the entry path to Dart Sass, which compiles the entire physical scale into global CSS automatically.

### 3. CLI Scaffolding (`npx fractalstyler init` copying SASS files into user's `styles/`)
- **CLI script (`src/cli.ts` or `scripts/cli.js` compiled to `dist/cli.js`)**:
  ```ts
  #!/usr/bin/env node
  import { mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
  import { join, dirname } from 'node:path';
  import { fileURLToPath } from 'node:url';

  const HERE = dirname(fileURLToPath(import.meta.url));
  const STYLES_SRC = join(HERE, 'styles');

  const [command, ...args] = process.argv.slice(2);
  const force = args.includes('--force');
  const isCss = args.includes('--css');
  const dest = args.find(a => !a.startsWith('--')) ?? (isCss ? 'static' : 'src/lib/styles');

  if (command === 'init') {
    mkdirSync(dest, { recursive: true });
    if (isCss) {
      copyFileSync(join(HERE, 'css/fractalstyler.css'), join(dest, 'fractalstyler.css'));
      console.log(`created ${dest}/fractalstyler.css`);
    } else {
      const files = readdirSync(STYLES_SRC).filter(f => f.endsWith('.sass'));
      for (const file of files) {
        const target = join(dest, file);
        if (existsSync(target) && !force) {
          console.log(`skip    ${target} (exists, use --force to overwrite)`);
          continue;
        }
        copyFileSync(join(STYLES_SRC, file), target);
        console.log(`create  ${target}`);
      }
    }
  }
  ```
- **`package.json` `"bin"` registration**:
  ```json
  "bin": {
    "fractalstyler": "./dist/cli.js"
  }
  ```
- Ensure execution permissions during prepack: `chmod +x dist/cli.js`.

### 4. Presets & Runtime Functions (`setPreset`, `getPreset`, `initPresets`, `toggleMode`)
- **Export from root and `./presets` subpath**:
  In `src/lib/index.ts`:
  ```ts
  export {
    presets,
    initPresets,
    setPreset,
    getPreset,
    toggleMode,
    cyclePreset,
    scopePreset,
    getPresetScript,
    isDark,
    type Mode,
    type PresetAxis
  } from './presets/presets.svelte.js';
  ```
  In `package.json`:
  ```json
  "./presets": {
    "types": "./dist/presets/presets.svelte.d.ts",
    "default": "./dist/presets/presets.svelte.js"
  }
  ```
  Both `import { initPresets } from 'fractalstyler'` and `import { initPresets } from 'fractalstyler/presets'` work with full TypeScript types.

### 5. Components from `src/lib/components` with Full Props Typing
- Re-export components and prop interfaces in `src/lib/index.ts`:
  ```ts
  export { default as Button } from './components/wa/button/Button.svelte';
  export type { ButtonVariant, ButtonAppearance, ButtonSize, ButtonType } from './components/wa/button/Button.svelte';
  ```
- `@sveltejs/package` outputs `.svelte.d.ts` definitions containing full Svelte 5 component interfaces (`Component<Props>`).
- Consumers in VS Code / Cursor get full prop autocomplete, snippet slots typing, event props (`onclick`, `onblur`), and compile-time type validation.
- Peer dependencies:
  ```json
  "peerDependencies": {
    "svelte": "^5.0.0"
  }
  ```

---

## 4. The Dual Adoption Models

Fractalstyler supports both consumption workflows side-by-side:

```
                                  FRACTALSTYLER
                                        │
        ┌───────────────────────────────┴───────────────────────────────┐
        ▼                                                               ▼
  OPTION 1: Zero-Copy (Tailwind-style)                  OPTION 2: Owned Files (shadcn-style)
  "I just want to use it"                               "I want to customize the generators"
  ────────────────────────────────────                  ────────────────────────────────────
  1. `pnpm add -D fractalstyler sass`                   1. `npx fractalstyler init`
  2. In `+layout.svelte`:                               2. Copies all 12 SASS files to
     `import 'fractalstyler/styles'`                       `src/lib/styles/` in their repo
  3. Uses components & classes directly                 3. In `+layout.svelte`:
     from `node_modules`. No local CSS files.              `import '$lib/styles/index.sass'`
```

### The Three Flavors of Option 1 (Zero-Copy Mode B)

1. **Live SASS Compilation**:
   `import 'fractalstyler/styles';`
   Vite compiles SASS partials from `node_modules` on the fly.
2. **Precompiled CSS (Zero-SASS)**:
   `import 'fractalstyler/css';`
   Injects precompiled, byte-identical CSS. No `sass` dependency needed.
3. **On-Demand JIT Plugin**:
   `import 'virtual:fractalstyler.css';`
   Uses the `fractutilsStyles()` Vite plugin to scan markup and compile only the classes actually used.

### The "Eject" Workflow
Users can start with Option 1 (`import 'fractalstyler/styles'`). If they later need custom Utopia scales or custom theme tokens, they run `npx fractalstyler init`, changing the import to `import '$lib/styles/index.sass'`. Components and classes continue working identically.

---

## 5. Building an IDE Extension Inside `fractalstyler`

Building the VS Code / Cursor extension directly inside the `fractalstyler` repository provides a single source of truth, live dogfooding, and unified version control.

### Monorepo Structure
Use an `extension/` subfolder to keep extension manifest fields separate from the library's `package.json`:

```
fractalstyler/
├── src/lib/styles/         ◄── SASS source of truth
├── src/routes/             ◄── SvelteKit docs & showcase
├── extension/              ◄── The VS Code / Cursor extension
│   ├── package.json        ◄── Extension manifest (vsce)
│   ├── src/
│   │   ├── extension.ts    ◄── Autocomplete, Hover, Linter
│   │   └── registry.json   ◄── Generated from ../src/lib/styles
│   └── scripts/
│       └── build-registry.js
└── .vscode/
    └── launch.json         ◄── Root launch config to hit F5 anytime
```

### Configuration Files

#### `extension/package.json`
```json
{
  "name": "fractalstyler-vscode",
  "displayName": "Fractalstyler IntelliSense",
  "description": "Autocomplete, hover previews, and linting for Fractalstyler",
  "version": "0.0.1",
  "publisher": "fractalmandala",
  "engines": {
    "vscode": "^1.85.0"
  },
  "main": "./out/extension.js",
  "activationEvents": [
    "onLanguage:svelte",
    "onLanguage:html",
    "onLanguage:astro"
  ],
  "scripts": {
    "registry": "node scripts/build-registry.js",
    "build": "npm run registry && esbuild src/extension.ts --bundle --outfile=out/extension.js --external:vscode --format=cjs --platform=node",
    "watch": "esbuild src/extension.ts --bundle --outfile=out/extension.js --external:vscode --format=cjs --platform=node --watch"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.0.0",
    "esbuild": "^0.20.0",
    "typescript": "^5.0.0"
  }
}
```

#### `extension/scripts/build-registry.js`
Reads directly from `../../src/lib/styles`:
```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_DIR = path.resolve(__dirname, '../../src/lib/styles');
const OUT_FILE = path.resolve(__dirname, '../src/registry.json');

const SPACE_STEPS = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const LITERAL_STEPS = [0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64];

const registry = [];

function add(className, layer, property, file, desc) {
  registry.push({ class: className, layer, property, file, desc: desc || property });
}

// 1. Spacing loops (_02_dimensions.sass)
for (const s of SPACE_STEPS) {
  add(`gap-${s}`, 'L1', `gap: var(--space-${s})`, '_02_dimensions.sass', `Gap ${s}`);
  add(`pad-${s}`, 'L1', `padding: var(--space-${s})`, '_02_dimensions.sass', `Padding ${s}`);
  add(`pad-x-${s}`, 'L1', `padding-inline: var(--space-${s})`, '_02_dimensions.sass', `Padding X ${s}`);
  add(`pad-y-${s}`, 'L1', `padding-block: var(--space-${s})`, '_02_dimensions.sass', `Padding Y ${s}`);
  add(`marg-${s}`, 'L1', `margin: var(--space-${s})`, '_02_dimensions.sass', `Margin ${s}`);
}

for (const px of LITERAL_STEPS) {
  add(`radius-${px}`, 'L1', `border-radius: ${px}px`, '_02_dimensions.sass', `Radius ${px}px`);
  add(`gap-${px}`, 'L1', `gap: ${px}px`, '_02_dimensions.sass', `Gap ${px}px`);
  add(`pad-${px}`, 'L1', `padding: ${px}px`, '_02_dimensions.sass', `Padding ${px}px`);
}

// 2. Scan all .sass files directly from src/lib/styles
const files = fs.readdirSync(STYLES_DIR).filter(f => f.endsWith('.sass'));
for (const file of files) {
  const lines = fs.readFileSync(path.join(STYLES_DIR, file), 'utf8').split('\n');
  const classRegex = /^\.([a-zA-Z][a-zA-Z0-9_-]*)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(classRegex);
    if (!match) continue;
    const name = match[1];
    if (registry.some(r => r.class === name)) continue;

    const layerMatch = file.match(/_(\d+)_/);
    const layer = layerMatch ? `L${parseInt(layerMatch[1], 10)}` : 'L5';
    add(name, layer, `Class from ${file}`, file, `${name} in ${file}`);
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(registry, null, 2));
console.log(`Generated ${registry.length} classes into extension/src/registry.json`);
```

#### `extension/src/extension.ts`
```ts
import * as vscode from 'vscode';
import registry from './registry.json';

const CLASS_MAP = new Map(registry.map((item) => [item.class, item]));

function getClassAtPosition(document: vscode.TextDocument, position: vscode.Position) {
  const line = document.lineAt(position.line).text;
  const wordRange = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
  if (!wordRange) return null;

  const currentWord = document.getText(wordRange);
  const lineUntilPosition = line.slice(0, position.character);
  const isInsideClassAttr = /class(:[a-zA-Z0-9_-]+)?=["'][^"']*$/.test(lineUntilPosition);

  return isInsideClassAttr ? { word: currentWord, range: wordRange } : null;
}

export function activate(context: vscode.ExtensionContext) {
  const languages = ['svelte', 'html', 'astro', 'vue', 'javascriptreact', 'typescriptreact'];

  // 1. AUTOCOMPLETE
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    languages,
    {
      provideCompletionItems(document, position) {
        const line = document.lineAt(position.line).text;
        const lineUntil = line.slice(0, position.character);

        if (!/class(:[a-zA-Z0-9_-]+)?=["'][^"']*$/.test(lineUntil)) {
          return undefined;
        }

        return registry.map((item) => {
          const comp = new vscode.CompletionItem(item.class, vscode.CompletionItemKind.Value);
          comp.detail = `[${item.layer}] ${item.file}`;
          comp.documentation = new vscode.MarkdownString(
            `**${item.class}**\n\n` +
            '```css\n' + item.property + '\n```\n\n' +
            `*Source: ${item.file} (${item.layer})*`
          );
          return comp;
        });
      }
    },
    ' ', '"', "'"
  );

  // 2. HOVER PREVIEWS
  const hoverProvider = vscode.languages.registerHoverProvider(languages, {
    provideHover(document, position) {
      const match = getClassAtPosition(document, position);
      if (!match) return undefined;

      const item = CLASS_MAP.get(match.word);
      if (!item) return undefined;

      const md = new vscode.MarkdownString();
      md.appendMarkdown(`### \`.${item.class}\`  *(${item.layer})*\n\n`);
      md.appendCodeblock(item.property, 'css');
      md.appendMarkdown(`\n*Defined in \`${item.file}\`*`);

      return new vscode.Hover(md, match.range);
    }
  });

  // 3. LINTER / DIAGNOSTICS
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('fractalstyler');

  function validateDocument(document: vscode.TextDocument) {
    if (!languages.includes(document.languageId)) return;

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const classAttrRegex = /class=["']([^"']+)["']/g;

    let match: RegExpExecArray | null;
    while ((match = classAttrRegex.exec(text)) !== null) {
      const classList = match[1].split(/\s+/).filter(Boolean);

      // Conflict rule: .box AND .row
      if (classList.includes('box') && classList.includes('row')) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        diagnostics.push(
          new vscode.Diagnostic(
            new vscode.Range(startPos, endPos),
            'Conflicting container primitives: element cannot be both .box (column) and .row (horizontal).',
            vscode.DiagnosticSeverity.Warning
          )
        );
      }

      // Conflict rule: .xcenter AND .xbetween
      if (classList.includes('xcenter') && classList.includes('xbetween')) {
        const startPos = document.positionAt(match.index);
        const endPos = document.positionAt(match.index + match[0].length);
        diagnostics.push(
          new vscode.Diagnostic(
            new vscode.Range(startPos, endPos),
            'Conflicting alignment: .xcenter and .xbetween cannot be used together.',
            vscode.DiagnosticSeverity.Warning
          )
        );
      }
    }

    diagnosticCollection.set(document.uri, diagnostics);
  }

  context.subscriptions.push(
    completionProvider,
    hoverProvider,
    diagnosticCollection,
    vscode.workspace.onDidChangeTextDocument((e) => validateDocument(e.document)),
    vscode.workspace.onDidOpenTextDocument((doc) => validateDocument(doc))
  );
}

export function deactivate() {}
```

#### `.vscode/launch.json` (At the Root of `fractalstyler`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Fractalstyler Extension",
      "type": "extensionDevelopmentHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}/extension",
        "${workspaceFolder}"
      ],
      "outFiles": ["${workspaceFolder}/extension/out/**/*.js"]
    }
  ]
}
```

### Local Testing Workflow
1. Navigate to the extension folder: `cd extension && npm install && npm run build`.
2. Press **`F5`** in VS Code.
3. The **[Extension Development Host]** window opens with `fractalstyler` loaded.
4. Open any Svelte file (e.g. `src/routes/docs/+page.svelte`), type `<div class="pad-`, and test autocomplete, hover previews, and conflict warnings live.
5. Package for permanent local installation or Open VSX (Cursor) publishing:
   ```bash
   npx @vscode/vsce package
   # Outputs fractalstyler-vscode-0.0.1.vsix
   ```
