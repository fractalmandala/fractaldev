---
title: Installation
description: Add Acrolls to a SvelteKit application.
order: 1
---

# Installation

Install the Acrolls packages, configure the mdsvex preprocessor, and point the content
source at your Markdown directory.

## Prerequisites

Acrolls targets SvelteKit 2 with Svelte 5 and Node 20.19 or newer. Your project should
already be a working SvelteKit app with a `vite.config.ts`.

## Install the package

Add the single published package to your app:

```bash
pnpm add acrolls
```

## Configure the preprocessor

Register the SvelteKit mdsvex preprocessor so `.md` files compile through Acrolls:

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createAcrollsSvelteKitMdsvexPreprocessor } from 'acrolls/sveltekit';

export default defineConfig({
	plugins: [
		svelte({
			extensions: ['.svelte', '.md'],
			preprocess: [createAcrollsSvelteKitMdsvexPreprocessor()]
		}),
		sveltekit()
	]
});
```

### Why a bundler resolves the styles

Acrolls ships its Sass entrypoints as package subpath exports, so the compiler must be
exports-aware. Vite's `NodePackageImporter` walks nested dependencies and honours the
exports map — the raw `sass` CLI cannot.

## Wire the content source

Describe your Markdown corpus with three globs over the same pattern: a lazy body glob
and eager metadata and facts globs.

```ts
import { content } from 'acrolls/content';
import { markdownGlob } from 'acrolls/docs/content';
import { defineDocsConfig } from 'acrolls/docs';

const body = import.meta.glob('../content/**/*.md', { import: 'default' });
const metadata = import.meta.glob('../content/**/*.md', { eager: true, import: 'metadata' });
const facts = import.meta.glob('../content/**/*.md', { eager: true, import: '__acrollsDocument' });

export const docs = content({
	loader: markdownGlob({ body, metadata, facts, root: '../content' }),
	config: defineDocsConfig({ title: 'Documentation' })
}).sourceSync();
```

## Verify

Run the validator against a single document to confirm the pipeline is wired correctly:

```bash
pnpm acrolls validate src/content/guides/installation.md
```

You should see a clean report. If it passes, Acrolls is installed.
