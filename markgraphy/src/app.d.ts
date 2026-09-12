// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
//
// Kept as a global script (no top-level import/export): wildcard `declare
// module` patterns only register as ambient declarations in scripts, so
// relative imports of .svx files resolve through the block below.
namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface PageState {}
	// interface Platform {}
}

declare module '*.svx' {
	import type { Component } from 'svelte';

	const component: Component;
	export default component;
}
