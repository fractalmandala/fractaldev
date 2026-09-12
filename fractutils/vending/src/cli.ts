#!/usr/bin/env node
// cli.ts — zero-runtime-dependency scaffold CLI + agent tool surface.
//
//   fractal-svelte <project-name> [--template default] [--no-git] [--no-install]
//   fractal-svelte init [--force]        wire the agent into an EXISTING project
//   fractal-svelte route|component|skill|docs|tokens|contract|verify|doctor ...
//
// Agent-facing commands are delegated to armory/bin/fa.mjs, which is also copied
// into every scaffolded project so it works with nothing installed.

import { existsSync, cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderName, renderString, type Tokens } from './render.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const ARMORY_SRC = resolve(PKG_ROOT, 'armory');

// Commands handled by the armory CLI. A project can never be named one of these.
const FA_COMMANDS = new Set([
	'route',
	'component',
	'components',
	'skill',
	'skills',
	'docs',
	'doc',
	'tokens',
	'contract',
	'verify',
	'doctor'
]);

interface Args {
	name: string;
	template: string;
	git: boolean;
	install: boolean;
}

function printUsage(): void {
	console.log(`fractal-svelte — scaffold and drive an agent-ready SvelteKit + Svelte 5 + CUBE CSS project

Scaffold:
  fractal-svelte <project-name> [options]
  fractal-svelte new <project-name> [options]

    -t, --template <name>   template to use (default: default)
    --no-git                skip git init
    --no-install            skip pnpm install

Wire an existing project:
  fractal-svelte init [--force]
    Copies the agent armory to ./.fractal-agentic, adds a "fa" npm script,
    and writes AGENTS.md. Use --force to overwrite an existing armory.

Agent tool surface (also available in a scaffolded project as \`pnpm fa\`):
  fractal-svelte route "<task>"     resolve a task to the skills to load
  fractal-svelte contract           the non-negotiable output rules
  fractal-svelte component <name>   component recipes
  fractal-svelte skill <name>       skill payloads
  fractal-svelte docs <topic>       how-to guides
  fractal-svelte tokens             the project's real design tokens
  fractal-svelte verify --all       run checks, write a receipt
  fractal-svelte doctor             armory integrity check

  Flags: --dense (token-efficient)  --json (machine-readable)

Examples:
  npx fractal-svelte my-app
  pnpm dlx fractal-svelte my-app --no-install
  fractal-svelte route "add an accordion to the docs page"
`);
}

function parseScaffoldArgs(name: string, flags: string[]): Args {
	let template = 'default';
	let git = true;
	let install = true;
	for (let i = 0; i < flags.length; i++) {
		const f = flags[i];
		if (f === '--template' || f === '-t') template = flags[++i];
		else if (f === '--no-git') git = false;
		else if (f === '--no-install') install = false;
		else if (f === '--help' || f === '-h') {
			printUsage();
			process.exit(0);
		} else {
			console.error(`unknown flag: ${f}`);
			process.exit(1);
		}
	}
	return { name, template, git, install };
}

function isTemplateTextFile(path: string): boolean {
	return /\.(svelte|ts|js|mjs|cjs|json|sass|scss|css|html|md|txt|yaml|yml|env|gitignore|npmrc|prettierrc|prettierignore|eslintignore)$/.test(
		path
	);
}

function copyTemplate(src: string, dest: string, tokens: Tokens): void {
	const entries = readdirSync(src, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name === '.DS_Store') continue;
		const from = join(src, entry.name);
		const to = join(dest, entry.name);
		if (entry.isDirectory()) {
			mkdirSync(to, { recursive: true });
			copyTemplate(from, to, tokens);
		} else {
			const content = readFileSync(from);
			if (isTemplateTextFile(entry.name)) {
				writeFileSync(to, renderString(content.toString('utf8'), tokens));
			} else {
				writeFileSync(to, content);
			}
		}
	}
}

// The armory is bundled into the npm package under armory/ so the scaffold works
// standalone via npx. It is copied verbatim to <project>/.fractal-agentic/.
function copyArmory(dest: string): boolean {
	if (!existsSync(ARMORY_SRC)) {
		console.warn('warning: bundled armory not found; skipping .fractal-agentic copy.');
		console.warn('         the scaffold package is incomplete; reinstall fractal-svelte.');
		return false;
	}
	mkdirSync(dest, { recursive: true });
	cpSync(ARMORY_SRC, dest, {
		recursive: true,
		filter: (src) => !src.endsWith('.DS_Store')
	});
	return true;
}

// ---------------------------------------------------------------------------
// fa delegation
// ---------------------------------------------------------------------------

function delegateToFa(argv: string[]): never {
	// Prefer a project-local armory so the CLI reports on the project the user is
	// standing in, then fall back to the copy bundled with this package.
	const local = resolve(process.cwd(), '.fractal-agentic', 'bin', 'fa.mjs');
	const bundled = join(ARMORY_SRC, 'bin', 'fa.mjs');
	const bin = existsSync(local) ? local : bundled;

	if (!existsSync(bin)) {
		console.error('agent CLI not found — the armory is missing from this package.');
		console.error('reinstall fractal-svelte, or run this inside a scaffolded project.');
		process.exit(1);
	}

	const res = spawnSync(process.execPath, [bin, ...argv], { stdio: 'inherit' });
	process.exit(res.status ?? 1);
}

// ---------------------------------------------------------------------------
// init — wire an existing project
// ---------------------------------------------------------------------------

function cmdInit(flags: string[]): void {
	const force = flags.includes('--force');
	const cwd = process.cwd();
	const pkgPath = join(cwd, 'package.json');

	if (!existsSync(pkgPath)) {
		console.error('no package.json here — run `fractal-svelte init` from a project root.');
		console.error('to create a new project instead: fractal-svelte <project-name>');
		process.exit(1);
	}

	const dest = join(cwd, '.fractal-agentic');
	if (existsSync(dest) && !force) {
		console.error(`.fractal-agentic already exists. Re-run with --force to overwrite it.`);
		process.exit(1);
	}

	console.log('copying agent armory to .fractal-agentic ...');
	if (!copyArmory(dest)) process.exit(1);

	// Add the npm script alias. Agents reliably guess the wrong path to a binary
	// nested in a dot-directory; an alias removes that failure entirely.
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
	pkg.scripts ??= {};
	if (!pkg.scripts.fa) {
		pkg.scripts.fa = 'node .fractal-agentic/bin/fa.mjs';
		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		console.log('added "fa" script to package.json');
	} else {
		console.log('"fa" script already present — left unchanged');
	}

	// AGENTS.md: never clobber an existing one; agents and humans both edit it.
	const agentsPath = join(cwd, 'AGENTS.md');
	const pointer = readFileSync(join(ARMORY_SRC, 'AGENTS.md'), 'utf8');
	if (!existsSync(agentsPath)) {
		writeFileSync(agentsPath, pointer);
		console.log('wrote AGENTS.md');
	} else {
		const existing = readFileSync(agentsPath, 'utf8');
		if (existing.includes('.fractal-agentic')) {
			console.log('AGENTS.md already references .fractal-agentic — left unchanged');
		} else {
			writeFileSync(
				agentsPath,
				existing.trimEnd() +
					'\n\n## Fractal Svelte agent\n\n' +
					'This project has the Fractal Svelte armory at `.fractal-agentic/`.\n' +
					'Start every non-trivial task by routing it:\n\n' +
					'```sh\npnpm fa route "<what you were asked to do>"\n```\n\n' +
					'Read `.fractal-agentic/AGENTS.md` for the full output contract.\n'
			);
			console.log('appended a Fractal Svelte section to AGENTS.md');
		}
	}

	console.log('\ndone. verify with:');
	console.log('  pnpm fa doctor');
	console.log('  pnpm fa route "add a component"');
}

// ---------------------------------------------------------------------------
// scaffold
// ---------------------------------------------------------------------------

function cmdScaffold(args: Args): void {
	const { name, template, git, install } = args;

	if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name)) {
		console.error(`invalid project name: "${name}" (use lowercase, digits, hyphens, underscores)`);
		process.exit(1);
	}

	const target = resolve(name);
	if (existsSync(target)) {
		console.error(`target already exists: ${target}`);
		process.exit(1);
	}

	const templateDir = resolve(PKG_ROOT, 'templates', template);
	if (!existsSync(templateDir)) {
		console.error(`template not found: ${template} (looked in ${templateDir})`);
		process.exit(1);
	}

	const tokens = renderName(name);
	console.log(`scaffolding ${name} ...`);
	mkdirSync(target, { recursive: true });
	copyTemplate(templateDir, target, tokens);

	console.log('copying fractal-agentic armory ...');
	copyArmory(join(target, '.fractal-agentic'));

	if (install) {
		console.log('installing dependencies ...');
		try {
			execSync('pnpm install', { cwd: target, stdio: 'inherit' });
		} catch {
			console.warn('pnpm install failed — run "pnpm install" manually in the project.');
		}
	}

	if (git) {
		console.log('initializing git ...');
		try {
			execSync('git init', { cwd: target, stdio: 'ignore' });
			execSync('git add -A', { cwd: target, stdio: 'ignore' });
			execSync('git commit -m "chore: scaffold with fractal-svelte"', { cwd: target, stdio: 'ignore' });
		} catch {
			console.warn('git init failed — run "git init" manually.');
		}
	}

	console.log(`\ndone. next steps:`);
	console.log(`  cd ${name}`);
	console.log(`  pnpm dev`);
	console.log(`\nagent-ready. the agent starts every task with:`);
	console.log(`  pnpm fa route "<task>"`);
	console.log(`see AGENTS.md and .fractal-agentic/AGENTS.md for the output contract.`);
}

// ---------------------------------------------------------------------------

function main(): void {
	const argv = process.argv.slice(2);

	if (argv.length === 0) {
		printUsage();
		process.exit(1);
	}

	const first = argv[0];

	if (first === '--help' || first === '-h' || first === 'help') {
		printUsage();
		process.exit(0);
	}

	if (FA_COMMANDS.has(first)) delegateToFa(argv);

	if (first === 'init') {
		cmdInit(argv.slice(1));
		return;
	}

	if (first === 'new') {
		const name = argv[1];
		if (!name) {
			console.error('missing project name: fractal-svelte new <project-name>');
			process.exit(1);
		}
		cmdScaffold(parseScaffoldArgs(name, argv.slice(2)));
		return;
	}

	if (first.startsWith('-')) {
		console.error(`unknown flag: ${first}`);
		printUsage();
		process.exit(1);
	}

	cmdScaffold(parseScaffoldArgs(first, argv.slice(1)));
}

main();
