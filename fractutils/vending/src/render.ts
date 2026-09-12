// render.ts — tiny {{token}} substitution for scaffolded files.
// Replaces {{name}}, {{AppName}}, and any custom tokens in file content.

export type Tokens = Record<string, string>;

const TOKEN_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function renderString(input: string, tokens: Tokens): string {
	return input.replace(TOKEN_RE, (_, key: string) => tokens[key] ?? `{{${key}}}`);
}

export function renderName(name: string): Tokens {
	// {{name}} — exact project dir name (e.g. my-app)
	// {{AppName}} — Title Case for display (e.g. My App)
	const appName = name
		.split(/[-_]/)
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
	return {
		name,
		AppName: appName || name,
		'pkg-name': name,
		'pkgName': name.replace(/[-_](.)/g, (_, c) => c.toUpperCase())
	};
}
