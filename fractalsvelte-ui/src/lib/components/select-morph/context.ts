import { getContext, setContext } from 'svelte';

const KEY = Symbol('select-morph');

export type MorphSelectContext = {
	get value(): string | undefined;
	get open(): boolean;
	setOpen(open: boolean): void;
	select(next: string): void;
	register(value: string, label: string): void;
	unregister(value: string): void;
	labelFor(value: string | undefined): string | undefined;
	get placeholder(): string;
	setPlaceholder(placeholder: string): void;
	get reduce(): boolean;
	layoutId: string;
	triggerId: string;
	listId: string;
	get disabled(): boolean;
};

export function setMorphSelectContext(ctx: MorphSelectContext) {
	setContext(KEY, ctx);
}

export function useMorphSelectContext(component: string): MorphSelectContext {
	const ctx = getContext<MorphSelectContext | null>(KEY);
	if (!ctx) throw new Error(`${component} must be used within <MorphSelect>`);
	return ctx;
}
