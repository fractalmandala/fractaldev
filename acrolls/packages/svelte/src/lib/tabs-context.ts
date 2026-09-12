import type { Snippet } from 'svelte';

/** Shared context key so `Tab` works under both `Tabs` and `CodeGroup`. */
export const TABS = Symbol('acrolls-tabs');

export type TabsContext = {
	/** Stable, deterministic id prefix shared by tabs and panels (SSR === client). */
	readonly groupId: string;
	/** Claim the next panel index; called once per `Tab` during init, in document order. */
	claim(): number;
	/** Whether the panel at `index` is the active one. */
	isActive(index: number): boolean;
};

/** A tab label — either a bare string or `{ label }`. */
export type TabItem = string | { label: string };

/** Normalize the `items` prop to a flat array of labels. */
export function tabLabels(items: TabItem[]): string[] {
	return items.map((it) => (typeof it === 'string' ? it : it.label));
}

/** Deterministic, collision-resistant id slug (no randomness → no hydration drift). */
export function tabSlug(input: string): string {
	return (
		input
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'tabs'
	);
}

export type { Snippet };
