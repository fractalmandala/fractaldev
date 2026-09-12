# Next Page to SvelteKit Route Contract

This example demonstrates the page-shaped conversion boundary for a Next page that
loads private data. The source's server loader becomes `+page.server.ts`; the page UI
remains in `+page.svelte`; reusable UI is extracted under `src/lib/components/`.

## Source shape

```tsx
export async function getServerSideProps({ params, req }) {
  const account = await db.accounts.findById(params.id, req.user.id);
  if (!account) return { notFound: true };
  return { props: { account } };
}

export default function AccountPage({ account }) {
  return <AccountSummary account={account} />;
}
```

## Artifact manifest

```json
{
  "contractVersion": "1.0",
  "status": "planned",
  "source": {
    "framework": "next",
    "kind": "page",
    "files": ["pages/accounts/[id].tsx"],
    "route": "/accounts/[id]",
    "animationTier": "none"
  },
  "target": {
    "kind": "route",
    "files": [
      "src/routes/accounts/[id]/+page.server.ts",
      "src/routes/accounts/[id]/+page.svelte",
      "src/lib/components/AccountSummary/AccountSummary.svelte",
      "src/lib/components/AccountSummary/AccountSummary.types.ts"
    ],
    "route": { "path": "/accounts/[id]", "params": ["id"], "searchParams": [] },
    "publicApi": {
      "props": ["account"],
      "bindings": [],
      "callbacks": [],
      "snippets": []
    }
  },
  "dependencies": { "present": [], "required": [], "missing": [], "fallbacks": [] },
  "dataFlow": {
    "loadFile": "+page.server.ts",
    "reason": "The source uses getServerSideProps and private database/auth data.",
    "serverData": ["account"],
    "actions": [],
    "invalidations": [],
    "serialization": "json-serializable"
  },
  "ssr": {
    "mode": "safe",
    "browserOnlyApis": [],
    "guards": [],
    "disabledReason": null
  },
  "verification": [
    {
      "command": "pnpm check",
      "cwd": ".",
      "purpose": "Validate SvelteKit route and generated types.",
      "status": "planned",
      "evidence": ""
    },
    {
      "command": "pnpm build",
      "cwd": ".",
      "purpose": "Verify SSR route compilation.",
      "status": "planned",
      "evidence": ""
    }
  ],
  "gaps": []
}
```

## Target route files

```ts
// src/routes/accounts/[id]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const account = await locals.db.accounts.findById(params.id, locals.user.id);
  if (!account) error(404, 'Account not found');
  return { account };
};
```

```svelte
<!-- src/routes/accounts/[id]/+page.svelte -->
<script lang="ts">
  import AccountSummary from '$lib/components/AccountSummary/AccountSummary.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<AccountSummary account={data.account} />
```
