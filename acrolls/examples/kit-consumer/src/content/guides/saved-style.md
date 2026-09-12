---
title: Saved Style
description: From root layout.
---

Here:

```css
	:global(body) {
		margin: 0;
		font-family:
			ui-sans-serif,
			system-ui,
			-apple-system,
			Segoe UI,
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		background: var(--background);
		color: var(--foreground);
		transition:
			background-color 160ms ease,
			color 160ms ease;
	}

	:global(:root),
	:global(:root[data-acrolls-theme='paper']) {
		color-scheme: light;
		--font-body: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
		--font-heading: ui-sans-serif, system-ui, sans-serif;
		--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		--background: #f7f6f2;
		--foreground: #171714;
		--muted-foreground: #5c5c56;
		--border: #deded8;
		--accent: #6d28d9;
		--card: #fffcf5;
		--muted: #f0efe8;
		--radius: 0.75rem;
	}

	:global(:root[data-acrolls-theme='midnight']) {
		color-scheme: dark;
		--background: #101115;
		--foreground: #f2f3f7;
		--muted-foreground: #a2a6b3;
		--border: #30333d;
		--accent: #a7b8ff;
		--card: #181a20;
		--muted: #22252e;
		--radius: 0.75rem;
	}

	:global(:root[data-acrolls-theme='moss']) {
		color-scheme: light;
		--background: #f1f4e9;
		--foreground: #1f2a20;
		--muted-foreground: #607063;
		--border: #cbd5c4;
		--accent: #2f6f4e;
		--card: #fafcf5;
		--muted: #e2e9da;
		--radius: 0.35rem;
	}

	.shell__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid var(--border);
		font-family: var(--font-heading);
		font-size: 0.95rem;
	}

	.shell__identity {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
	}

	.shell__identity span {
		color: var(--muted-foreground);
		font-size: 0.8rem;
	}

	.shell__header a {
		color: inherit;
		font-weight: 650;
		text-decoration: none;
	}

	.shell__main {
		padding: 2rem 1rem 4rem;
	}

	@media (max-width: 36rem) {
		.shell__header,
		.shell__identity {
			align-items: flex-start;
			flex-direction: column;
		}
	}
```
