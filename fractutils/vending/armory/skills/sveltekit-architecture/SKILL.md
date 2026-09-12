---
name: sveltekit-architecture
description: SvelteKit routing, nested layouts with {@render children()}, +page.server.ts/+page.ts data loading, form actions, remote functions, SSR/hydration boundaries, and error boundaries (+error.svelte, svelte:boundary).
metadata:
  origin: ECC
---

# SvelteKit Architecture & Data Flow

SvelteKit provides full-stack web application structure, server/client routing, layout hierarchy, and data loading mechanisms.

## Directory & File Naming Conventions

```
src/routes/
├── +layout.svelte              # Root layout (wraps all pages)
├── +layout.server.ts           # Root server data loader (auth, user session)
├── +page.svelte                # Root homepage /
├── +error.svelte               # Global error boundary
├── api/
│   └── v1/
│       └── health/+server.ts   # API endpoint (GET /api/v1/health)
└── dashboard/
    ├── +layout.svelte          # Nested layout for dashboard
    ├── +page.svelte            # Dashboard page /dashboard
    └── +page.server.ts         # Server load function & Form Actions
```

## Data Flow Rules

### 1. Server Load Functions (`+page.server.ts`)

- Use `+page.server.ts` for database queries, secrets, or server-only dependencies.
- Load functions return serialized data accessible in `+page.svelte` via `let { data }: { data: PageData } = $props()`.

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const item = await getItem(params.id);
	return { item };
};
```

### 2. Form Actions & Mutations

- Use SvelteKit Form Actions for data mutations with progressive enhancement (`use:enhance`).

```ts
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const title = data.get('title');
		if (!title) return fail(400, { missingTitle: true });

		await createItem({ title: String(title) });
		return { success: true };
	}
};
```

### 3. Hydration & SSR Safety

- Never access browser globals (`window`, `document`, `localStorage`) directly at module top-level.
- Wrap browser-only side effects in `$effect(() => { ... })` or check `browser` from `$app/environment`.
