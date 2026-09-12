# acrolls/mdsvex

Shared mdsvex options for Acrolls: GFM, heading slugs + anchors, table overflow wrap, Shiki dual-theme fences, Mermaid recovery, and fence metadata.

The default pipeline also recovers Mermaid declarations that arrive as unfenced
Markdown paragraphs (for example, `flowchart TD` followed by diagram lines). This
prevents Mermaid syntax from being interpreted as Svelte markup; valid and invalid
diagrams still use the normal Mermaid canvas/fallback behavior.

For host integrations, prefer the preprocessor wrapper so Markdown-only source safety runs
before mdsvex parses the file:

```js
import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';

preprocess: [vitePreprocess(), createAcrollsMdsvexPreprocessor()]
```

The default invalid-document policy is `fail`. For a pre-existing Markdown corpus, opt into
an explicit diagnostic page policy:

```js
preprocess: [
  vitePreprocess(),
  createAcrollsMdsvexPreprocessor({ onInvalidDocument: 'error-page' })
]
```

`error-page` applies to `.md` only. It preflights the transformed module with Svelte and
returns an escaped, routable diagnostic module when compilation fails. `.svx` remains
executable Svelte and fails fast.

The wrapper protects a narrow set of Svelte-shaped literals in `.md` prose (for example
`<svelte:head>`, `Result<T, String>`, and `content/<Category>/`). `.svx` files are left
untouched so intentional Svelte components continue to work. Use `normalizeAcrollsMarkdown`
directly when a host wants findings and source locations for its own lint command.


```js
import { mdsvex } from 'mdsvex';
import { createAcrollsMdsvexOptions } from 'acrolls/mdsvex';

mdsvex(createAcrollsMdsvexOptions({ strict: false }));
```

Install `acrolls` and import this function from `acrolls/mdsvex`. The higher-level
`acrolls/sveltekit` entrypoint is available from the same package.
