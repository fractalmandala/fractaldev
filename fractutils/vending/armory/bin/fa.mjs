#!/usr/bin/env node
// fa.mjs — the Fractal Svelte agent tool surface.
//
// This is the agent's action space. Every command returns a deterministic shape:
//   status | summary | next_actions | artifacts | payload
//
// Zero runtime dependencies (node stdlib only) so it works inside a scaffolded
// project with nothing installed. The armory on disk is the only data source.
//
//   fa route "<task>"          resolve task -> entry skill, required, conditional
//   fa contract                the non-negotiable output rules
//   fa component --list|<name> component recipes
//   fa skill --list|<name>     skill payloads
//   fa docs --list|<topic>     how-to guides
//   fa tokens                  the project's ACTUAL design tokens
//   fa verify [--static|--build|--all]   run checks, emit a receipt
//   fa doctor                  armory integrity check
//
// Flags: --dense (token-efficient), --json (machine-readable)

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARMORY = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Roots
// ---------------------------------------------------------------------------

function findProjectRoot() {
	// Scaffolded layout: <project>/.fractal-agentic/bin/fa.mjs
	if (basename(ARMORY) === '.fractal-agentic') {
		return resolve(ARMORY, '..');
	}
	// Otherwise walk up from cwd for the nearest package.json.
	let dir = process.cwd();
	for (let i = 0; i < 12; i++) {
		if (existsSync(join(dir, 'package.json'))) return dir;
		const up = dirname(dir);
		if (up === dir) break;
		dir = up;
	}
	return process.cwd();
}

const PROJECT = findProjectRoot();
const BUILDER_REFS = join(ARMORY, 'skills', 'agentic-svelte-builder', 'references');

// ---------------------------------------------------------------------------
// Output contract — every command emits this shape
// ---------------------------------------------------------------------------

let JSON_MODE = false;
let DENSE = false;

function emit({ status, summary, next_actions = [], artifacts = [], payload = null, body = '' }) {
	if (JSON_MODE) {
		process.stdout.write(
			JSON.stringify({ status, summary, next_actions, artifacts, payload }, null, 2) + '\n'
		);
	} else {
		if (body) process.stdout.write(body.replace(/\n+$/, '') + '\n');
		process.stdout.write(`\n[${status}] ${summary}\n`);
		if (artifacts.length) {
			process.stdout.write('artifacts:\n');
			for (const a of artifacts) process.stdout.write(`  ${a}\n`);
		}
		if (next_actions.length) {
			process.stdout.write('next:\n');
			for (const n of next_actions) process.stdout.write(`  ${n}\n`);
		}
	}
	process.exit(status === 'error' ? 1 : 0);
}

function fail(summary, next_actions = [], payload = null) {
	emit({ status: 'error', summary, next_actions, payload });
}

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------

function loadJson(path, label) {
	if (!existsSync(path)) {
		fail(`${label} missing at ${rel(path)}`, [
			'The armory is incomplete. Re-scaffold, or reinstall fractal-svelte.',
			'fa doctor'
		]);
	}
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch (e) {
		fail(`${label} is not valid JSON: ${e.message}`, [`Fix the syntax in ${rel(path)}`, 'fa doctor']);
	}
}

const rel = (p) => relative(PROJECT, p) || p;
const routing = () => loadJson(join(ARMORY, 'routing.json'), 'routing.json');
const manifest = () => loadJson(join(BUILDER_REFS, 'MANIFEST.json'), 'component MANIFEST.json');

// ---------------------------------------------------------------------------
// Markdown densifier — strips prose, keeps structure + code
// ---------------------------------------------------------------------------

function densify(md) {
	const lines = md.split('\n');
	const out = [];
	let inFence = false;
	let lastBlank = false;

	for (const line of lines) {
		const fence = /^\s*```/.test(line);
		if (fence) {
			inFence = !inFence;
			out.push(line);
			lastBlank = false;
			continue;
		}
		if (inFence) {
			out.push(line);
			continue;
		}
		if (/^\s*$/.test(line)) {
			if (!lastBlank && out.length) out.push('');
			lastBlank = true;
			continue;
		}
		lastBlank = false;
		// Always keep headings, list items, tables, and frontmatter rules.
		if (/^\s*(#{1,6}\s|[-*+]\s|\d+\.\s|\||>|---$)/.test(line)) {
			out.push(line);
			continue;
		}
		// Drop narrative prose: a full sentence-ish line with no code ticks.
		if (line.length > 60 && !line.includes('`')) continue;
		out.push(line);
	}
	return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function readDoc(path) {
	const raw = readFileSync(path, 'utf8');
	return DENSE ? densify(raw) : raw;
}

// ---------------------------------------------------------------------------
// route — the task router
// ---------------------------------------------------------------------------

// A pattern matches when ALL of its significant words appear in the task, in any
// order. "convert react" therefore matches "convert this React dropdown", which a
// naive substring test would miss. Longer patterns outrank shorter ones.
const STOPWORDS = new Set(['a', 'an', 'the', 'to', 'for', 'this', 'that', 'it', 'my']);

function words(s) {
	return s
		.toLowerCase()
		.split(/[^a-z0-9:]+/)
		.filter((w) => w && !STOPWORDS.has(w));
}

function matchScore(task, patterns) {
	const taskWords = new Set(words(task));
	let best = 0;
	for (const p of patterns) {
		if (p.includes('*')) {
			const re = new RegExp(p.toLowerCase().split('*').map(escapeRe).join('.+'));
			if (re.test(task.toLowerCase())) best = Math.max(best, p.length);
			continue;
		}
		const pw = words(p);
		if (!pw.length) continue;
		if (pw.every((w) => taskWords.has(w))) {
			// Weight by specificity: more matched words beats one long word.
			best = Math.max(best, pw.length * 10 + p.length);
		}
	}
	return best;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function cmdRoute(args) {
	const task = args.filter((a) => !a.startsWith('--')).join(' ').trim();
	if (!task) {
		fail('route requires a task description', ['fa route "add an accordion to the docs page"']);
	}

	const cfg = routing();
	// Strongest keyword match wins. On a tie, the more specific intent wins:
	// "add motion to this card" matches both `add motion` and `add a card` equally,
	// but motion is a modifier ON a component, so it outranks component-build.
	let winner = null;
	let score = 0;
	let priority = -Infinity;
	for (const r of cfg.routes) {
		const s = matchScore(task, r.match);
		if (s === 0) continue;
		const p = r.priority ?? 0;
		if (s > score || (s === score && p > priority)) {
			score = s;
			priority = p;
			winner = r;
		}
	}

	const route = winner ?? cfg.fallback;
	const matched = Boolean(winner);

	// Resolve skill precedence: drop any superseded skill when its canonical is present.
	const required = applyPrecedence(route.required, cfg.skillPrecedence);
	const skillPaths = required
		.map((s) => join(ARMORY, 'skills', s, 'SKILL.md'))
		.filter(existsSync)
		.map(rel);

	const payload = {
		task,
		route: route.id,
		matched,
		entrySkill: route.entrySkill,
		required,
		conditional: route.conditional,
		policies: cfg.policies,
		precedence: cfg.precedence,
		verification: route.verification
	};

	const body = [
		`task     ${task}`,
		`route    ${route.id}${matched ? '' : '  (no pattern matched — fallback)'}`,
		`entry    ${route.entrySkill}`,
		'',
		'required skills (load these, in order):',
		...required.map((s) => `  - ${s}  ->  ${rel(join(ARMORY, 'skills', s, 'SKILL.md'))}`),
		'',
		'conditional skills (load only if the condition holds):',
		...(route.conditional.length
			? route.conditional.map((c) => `  - if ${c.when}: ${c.skills.join(', ')}`)
			: ['  (none)']),
		'',
		'hard policies:',
		...Object.entries(cfg.policies).map(([k, v]) => `  ${v ? '+' : '-'} ${k}`),
		'',
		`verification required: ${route.verification.join(', ')}`
	].join('\n');

	emit({
		status: matched ? 'success' : 'warning',
		summary: matched
			? `routed to "${route.id}" — ${required.length} required skills, ${route.conditional.length} conditional`
			: `no pattern matched; using fallback route. Narrow the task description and re-run.`,
		next_actions: route.next_actions,
		artifacts: skillPaths,
		payload,
		body
	});
}

function applyPrecedence(skills, precedenceRules) {
	const set = new Set(skills);
	for (const rule of precedenceRules) {
		if (!set.has(rule.canonical)) continue;
		for (const superseded of rule.supersedes) set.delete(superseded);
	}
	return [...set];
}

// ---------------------------------------------------------------------------
// contract — the non-negotiable rules
// ---------------------------------------------------------------------------

function cmdContract() {
	const cfg = routing();
	const p = cfg.policies;
	const rules = [
		['Svelte 5 runes only', !p.allowLegacyReactivity, '$state $derived $effect $props $bindable. No `$:`, no svelte/store writable/readable.'],
		['Snippets, not slots', !p.allowSlots, '{#snippet} + {@render}. No slot-based APIs.'],
		['onclick, not on:click', true, 'Event attributes everywhere.'],
		['External indented SASS', p.externalSass, 'Sibling *.sass imported by the *.svelte file. Single tab, no braces, no semicolons.'],
		['No <style> blocks', !p.allowComponentStyleBlocks, 'Zero style blocks in .svelte files.'],
		['No inline style=""', !p.allowInlineStyles, 'Use classes and data-attributes.'],
		['No class: directives', !p.allowClassDirectives, 'Use class={cond ? "a" : "b"}.'],
		['No fallback hex colors', !p.allowFallbackHexColors, 'Consume semantic tokens only. Run `fa tokens` for the real list.'],
		['No implicit installs', !p.allowImplicitDependencyInstallation, 'Never mutate package.json without asking.'],
		['Explicit SSR guards', p.requireSsrGuards, 'Guard window/document/localStorage with `browser` from $app/environment.'],
		['CUBE class grouping', true, 'class="[ block ] [ layout ] [ utilities ]". State via data-state / data-variant.']
	];

	const body = [
		'FRACTAL SVELTE OUTPUT CONTRACT (non-negotiable)',
		'',
		...rules.map(([name, on, detail]) => `${on ? 'MUST' : 'NEVER'}  ${name}\n        ${detail}`),
		'',
		'PRECEDENCE (highest first):',
		...cfg.precedence.map((x, i) => `  ${i + 1}. ${x}`),
		'',
		'VERIFICATION — static alone is never sufficient:',
		...Object.entries(cfg.verification).map(([k, v]) => `  ${k.padEnd(8)} ${v.command.padEnd(12)} proves: ${v.proves}`),
		'',
		'VERDICTS:',
		...Object.entries(cfg.verdicts).map(([k, v]) => `  ${k.padEnd(11)} ${v}`)
	].join('\n');

	emit({
		status: 'success',
		summary: `${rules.length} contract rules, ${cfg.precedence.length}-level precedence`,
		next_actions: ['fa tokens --dense', 'fa verify --all'],
		artifacts: [rel(join(ARMORY, 'routing.json'))],
		payload: {
			policies: p,
			precedence: cfg.precedence,
			verification: cfg.verification,
			verdicts: cfg.verdicts
		},
		body
	});
}

// ---------------------------------------------------------------------------
// component
// ---------------------------------------------------------------------------

function cmdComponent(args) {
	const mf = manifest();
	const names = Object.keys(mf.components).sort();
	const positional = args.filter((a) => !a.startsWith('--'));

	if (args.includes('--list') || positional.length === 0) {
		const rows = names.map((n) => {
			const c = mf.components[n];
			const kinds = [c.zero_js ? 'native' : null, c.svelte5 ? 'svelte5' : null].filter(Boolean);
			return `  ${n.padEnd(18)} ${kinds.join(' + ').padEnd(18)} ${c.cube_classes ?? ''}`;
		});
		emit({
			status: 'success',
			summary: `${names.length} component recipes (${mf.counts.native} native, ${mf.counts.svelte5} svelte5)`,
			next_actions: ['fa component <name> --dense', 'fa contract'],
			artifacts: [rel(join(BUILDER_REFS, 'MANIFEST.json'))],
			payload: { components: names, counts: mf.counts },
			body: ['name'.padEnd(20) + 'paradigms'.padEnd(20) + 'cube classes', ...rows].join('\n')
		});
	}

	// Resolve hyphen/spacing variants: "datepicker", "date picker", "Date-Picker"
	// must all reach "date-picker" rather than dead-ending on an unknown name.
	const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
	const raw = positional[0].toLowerCase();
	const name = mf.components[raw] ? raw : (names.find((n) => norm(n) === norm(raw)) ?? raw);
	const entry = mf.components[name];
	if (!entry) {
		const q = norm(raw);
		const near = names.filter((n) => norm(n).includes(q) || q.includes(norm(n))).slice(0, 5);
		fail(`unknown component "${name}"`, [
			near.length ? `Did you mean: ${near.join(', ')}?` : 'fa component --list',
			'If this component has no recipe, build it from `fa contract` + the closest listed recipe.'
		], { available: names });
	}

	// Paradigm selection: explicit flag, else prefer native (zero-JS) per CUBE policy.
	const wantSvelte = args.includes('--svelte') || args.includes('--svelte5');
	const wantNative = args.includes('--native');
	let file, paradigm;
	if (wantSvelte && entry.svelte5) [file, paradigm] = [entry.svelte5, 'svelte5'];
	else if (wantNative && entry.zero_js) [file, paradigm] = [entry.zero_js, 'native'];
	else if (entry.zero_js && !wantSvelte) [file, paradigm] = [entry.zero_js, 'native'];
	else if (entry.svelte5) [file, paradigm] = [entry.svelte5, 'svelte5'];
	else fail(`component "${name}" has no recipe file for the requested paradigm`, ['fa component --list']);

	const path = join(BUILDER_REFS, file);
	if (!existsSync(path)) {
		fail(`recipe file missing: ${rel(path)}`, ['fa doctor', 'fa component --list']);
	}

	const alt = paradigm === 'native' ? entry.svelte5 : entry.zero_js;
	emit({
		status: 'success',
		summary: `${name} (${paradigm}) recipe${alt ? `; alternate paradigm available` : ''}`,
		next_actions: [
			alt ? `fa component ${name} --${paradigm === 'native' ? 'svelte' : 'native'}` : null,
			'fa tokens --dense',
			'fa contract',
			'fa verify --all'
		].filter(Boolean),
		artifacts: [rel(path)],
		payload: { component: name, paradigm, cube_classes: entry.cube_classes ?? null, file: rel(path) },
		body: readDoc(path)
	});
}

// ---------------------------------------------------------------------------
// skill
// ---------------------------------------------------------------------------

function listSkills() {
	const dir = join(ARMORY, 'skills');
	return readdirSync(dir, { withFileTypes: true })
		.filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'SKILL.md')))
		.map((d) => d.name)
		.sort();
}

function skillDescription(name) {
	const p = join(ARMORY, 'skills', name, 'SKILL.md');
	const raw = readFileSync(p, 'utf8');
	const fm = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!fm) return '';
	const m = fm[1].match(/^description:\s*(.*)$/m);
	if (!m) return '';
	let d = m[1].trim();
	if (d === '>' || d === '>-' || d === '|') {
		// Folded block scalar — take the following indented lines.
		const after = fm[1].slice(fm[1].indexOf(m[0]) + m[0].length);
		d = after.split('\n').filter((l) => /^\s+\S/.test(l)).map((l) => l.trim()).join(' ');
	}
	return d.replace(/^['"]|['"]$/g, '').trim();
}

function cmdSkill(args) {
	const all = listSkills();
	const positional = args.filter((a) => !a.startsWith('--'));

	if (args.includes('--list') || positional.length === 0) {
		const cfg = routing();
		const superseded = new Map();
		for (const r of cfg.skillPrecedence) {
			for (const s of r.supersedes) superseded.set(s, r.canonical);
		}
		const rows = all.map((n) => {
			const flag = superseded.has(n) ? `  [prefer ${superseded.get(n)}]` : '';
			const d = skillDescription(n);
			return `  ${n.padEnd(28)}${flag}\n      ${d.slice(0, 150)}`;
		});
		emit({
			status: 'success',
			summary: `${all.length} skills on disk, ${superseded.size} superseded by a canonical skill`,
			next_actions: ['fa skill <name> --dense', 'fa route "<your task>"'],
			artifacts: [rel(join(ARMORY, 'skills'))],
			payload: { skills: all, superseded: Object.fromEntries(superseded) },
			body: rows.join('\n')
		});
	}

	const name = positional[0];
	const path = join(ARMORY, 'skills', name, 'SKILL.md');
	if (!existsSync(path)) {
		const near = all.filter((n) => n.includes(name) || name.includes(n)).slice(0, 5);
		fail(`unknown skill "${name}"`, [near.length ? `Did you mean: ${near.join(', ')}?` : 'fa skill --list'], {
			available: all
		});
	}

	const cfg = routing();
	const rule = cfg.skillPrecedence.find((r) => r.supersedes.includes(name));
	const refsDir = join(ARMORY, 'skills', name, 'references');
	const refs = existsSync(refsDir) ? readdirSync(refsDir).map((f) => rel(join(refsDir, f))) : [];

	emit({
		status: rule ? 'warning' : 'success',
		summary: rule
			? `"${name}" is superseded by "${rule.canonical}" — ${rule.reason}`
			: `skill "${name}"${refs.length ? ` (+${refs.length} reference files)` : ''}`,
		next_actions: [
			rule ? `fa skill ${rule.canonical} --dense` : null,
			refs.length ? 'Load a reference file only when its specific decision is needed.' : null,
			'fa contract'
		].filter(Boolean),
		artifacts: [rel(path), ...refs],
		payload: { skill: name, supersededBy: rule?.canonical ?? null, references: refs },
		body: readDoc(path)
	});
}

// ---------------------------------------------------------------------------
// docs
// ---------------------------------------------------------------------------

function docFiles() {
	const base = join(ARMORY, 'docs', 'svelte-framework');
	const out = [];
	if (!existsSync(base)) return out;
	for (const section of readdirSync(base, { withFileTypes: true })) {
		if (!section.isDirectory()) continue;
		for (const f of readdirSync(join(base, section.name))) {
			if (!f.endsWith('.md')) continue;
			out.push({
				topic: f.replace(/\.md$/, '').replace(/^\d+-/, ''),
				section: section.name,
				path: join(base, section.name, f)
			});
		}
	}
	return out.sort((a, b) => a.topic.localeCompare(b.topic));
}

function cmdDocs(args) {
	const docs = docFiles();
	const positional = args.filter((a) => !a.startsWith('--'));

	if (args.includes('--list') || positional.length === 0) {
		const bySection = {};
		for (const d of docs) (bySection[d.section] ??= []).push(d.topic);
		const body = Object.entries(bySection)
			.map(([s, t]) => `${s}:\n${t.map((x) => `  ${x}`).join('\n')}`)
			.join('\n\n');
		emit({
			status: 'success',
			summary: `${docs.length} docs across ${Object.keys(bySection).length} sections`,
			next_actions: ['fa docs <topic> --dense'],
			artifacts: [rel(join(ARMORY, 'docs', 'svelte-framework'))],
			payload: { docs: bySection },
			body
		});
	}

	const topic = positional[0].toLowerCase();
	const hit = docs.find((d) => d.topic === topic) ?? docs.find((d) => d.topic.includes(topic));
	if (!hit) {
		fail(`unknown doc topic "${topic}"`, ['fa docs --list'], { available: docs.map((d) => d.topic) });
	}

	emit({
		status: 'success',
		summary: `${hit.section}/${hit.topic}`,
		next_actions: ['fa contract', 'fa verify --all'],
		artifacts: [rel(hit.path)],
		payload: { topic: hit.topic, section: hit.section },
		body: readDoc(hit.path)
	});
}

// ---------------------------------------------------------------------------
// tokens — read the PROJECT's real tokens, never a hardcoded list
// ---------------------------------------------------------------------------

function cmdTokens() {
	// `fractals-styler init` writes the token scale as the partial _tokens.sass,
	// so the underscore-prefixed names must be probed first — a scaffolded
	// project has no plain tokens.sass at all, and missing it here silently
	// disables the one check that stops invented token names reaching the CSS.
	const candidates = [
		join(PROJECT, 'src', 'lib', 'styles', '_tokens.sass'),
		join(PROJECT, 'src', 'lib', 'styles', 'tokens.sass'),
		join(PROJECT, 'src', 'lib', 'styles', '_tokens.scss'),
		join(PROJECT, 'src', 'lib', 'styles', 'tokens.scss'),
		join(PROJECT, 'src', 'styles', '_tokens.sass'),
		join(PROJECT, 'src', 'styles', 'tokens.sass')
	];
	const path = candidates.find(existsSync);

	if (!path) {
		emit({
			status: 'warning',
			summary: 'no tokens file found in this project — cannot verify token names',
			next_actions: [
				'Run this from inside a scaffolded project root.',
				'If the project uses a different tokens path, read it directly before writing any color value.',
				'Do NOT invent token names or fall back to hex values.'
			],
			artifacts: [],
			payload: { searched: candidates.map(rel), tokens: [] }
		});
	}

	const raw = readFileSync(path, 'utf8');
	const semantic = [];
	const primitive = [];
	for (const m of raw.matchAll(/^\s*(--[a-zA-Z0-9-]+)\s*:\s*(.+?)\s*$/gm)) {
		const [, nameTok, value] = m;
		(value.includes('var(') ? semantic : primitive).push({ token: nameTok, value });
	}
	const dedupe = (arr) => [...new Map(arr.map((t) => [t.token, t])).values()];
	const sem = dedupe(semantic);
	const prim = dedupe(primitive);

	const body = [
		`# tokens — ${rel(path)}`,
		'',
		'## semantic (consume THESE in components)',
		...sem.map((t) => `  ${t.token.padEnd(24)} ${t.value}`),
		'',
		'## primitive (never consume directly in a component)',
		...(DENSE ? prim.slice(0, 20).map((t) => `  ${t.token.padEnd(24)} ${t.value}`) : prim.map((t) => `  ${t.token.padEnd(24)} ${t.value}`)),
		DENSE && prim.length > 20 ? `  ... ${prim.length - 20} more` : ''
	].filter(Boolean).join('\n');

	emit({
		status: 'success',
		summary: `${sem.length} semantic + ${prim.length} primitive tokens from ${rel(path)}`,
		next_actions: [
			'Use ONLY semantic tokens in component SASS.',
			'If a needed semantic token does not exist, add it to tokens.sass — never hardcode a hex value.'
		],
		artifacts: [rel(path)],
		payload: { file: rel(path), semantic: sem, primitive: prim },
		body
	});
}

// ---------------------------------------------------------------------------
// verify — run the layers, emit a receipt
// ---------------------------------------------------------------------------

function runStep(label, command) {
	const started = Date.now();
	try {
		const out = execSync(command, { cwd: PROJECT, stdio: 'pipe', encoding: 'utf8', timeout: 300000 });
		return { layer: label, command, status: 'pass', ms: Date.now() - started, output: tail(out) };
	} catch (e) {
		const output = tail((e.stdout ?? '') + (e.stderr ?? '') || e.message);
		return { layer: label, command, status: 'fail', ms: Date.now() - started, output };
	}
}

const tail = (s, n = 40) => s.split('\n').filter(Boolean).slice(-n).join('\n');

function cmdVerify(args) {
	const cfg = routing();
	const all = args.includes('--all');
	const wantStatic = all || args.includes('--static') || args.length === 0;
	const wantBuild = all || args.includes('--build');

	if (!existsSync(join(PROJECT, 'package.json'))) {
		fail('no package.json — not inside a project root', ['cd into the scaffolded project and re-run.']);
	}

	const steps = [];
	if (wantStatic) steps.push(runStep('static', cfg.verification.static.command));
	if (wantBuild) steps.push(runStep('build', cfg.verification.build.command));

	const failed = steps.filter((s) => s.status === 'fail');
	const runtimeRequired = all;
	const runtime = { layer: 'runtime', status: 'not-run', note: cfg.verification.runtime.note };

	let status, summary, verdict;
	if (failed.length) {
		status = 'error';
		verdict = 'fix-first';
		summary = `${failed.length}/${steps.length} verification layers FAILED (${failed.map((f) => f.layer).join(', ')})`;
	} else if (runtimeRequired) {
		status = 'warning';
		verdict = 'fix-first';
		summary = `static+build passed; runtime NOT verified — this is not a ship-ready receipt`;
	} else {
		status = 'warning';
		verdict = 'fix-first';
		summary = `${steps.map((s) => s.layer).join('+')} passed; build/runtime not run — static alone never qualifies a change`;
	}

	const receipt = {
		verdict,
		layers: [...steps.map(({ layer, command, status: st, ms }) => ({ layer, command, status: st, ms })), runtime],
		failures: failed.map((f) => ({ layer: f.layer, output: f.output }))
	};

	const receiptPath = writeReceipt(receipt);

	const body = [
		'VERIFICATION RECEIPT',
		'',
		...steps.map((s) => `  ${s.layer.padEnd(8)} ${s.status.toUpperCase().padEnd(5)} ${s.command}  (${s.ms}ms)`),
		`  runtime  NOT-RUN  ${cfg.verification.runtime.command}`,
		'',
		...(failed.length ? ['FAILURES:', ...failed.map((f) => `--- ${f.layer} ---\n${f.output}`), ''] : []),
		`verdict: ${verdict}`
	].join('\n');

	emit({
		status,
		summary,
		next_actions: failed.length
			? ['Fix the failures above.', 'Re-run `fa verify --all`.', 'Do not claim completion while any layer fails.']
			: [
					'Start the dev server and exercise every affected route.',
					'Inspect the browser console and server output for errors.',
					'Report `runtime: not-run` if browser access is unavailable — never convert it to a pass.'
				],
		artifacts: [receiptPath].filter(Boolean),
		payload: receipt,
		body
	});
}

function writeReceipt(receipt) {
	try {
		const dir = join(PROJECT, '.fractal-agentic', 'receipts');
		mkdirSync(dir, { recursive: true });
		const path = join(dir, 'latest.json');
		writeFileSync(path, JSON.stringify(receipt, null, 2) + '\n');
		return rel(path);
	} catch {
		return null;
	}
}

// ---------------------------------------------------------------------------
// doctor — armory integrity. This is what catches routing rot.
// ---------------------------------------------------------------------------

function walkMd(dir, out = []) {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) {
			if (e.name === 'node_modules' || e.name === 'receipts') continue;
			walkMd(p, out);
		} else if (e.name.endsWith('.md')) out.push(p);
	}
	return out;
}

function cmdDoctor() {
	const problems = [];
	const skills = listSkills();

	// 1. Broken relative links in every armory markdown file.
	let brokenLinks = 0;
	for (const file of walkMd(ARMORY)) {
		const raw = readFileSync(file, 'utf8');
		for (const m of raw.matchAll(/\]\(([^)\s]+)\)/g)) {
			const link = m[1].split('#')[0];
			if (!link || /^(https?:|mailto:|\/)/.test(link)) continue;
			const target = resolve(dirname(file), link);
			if (!existsSync(target)) {
				brokenLinks++;
				if (problems.length < 40) problems.push(`broken link  ${rel(file)} -> ${link}`);
			}
		}
	}

	// 2. routing.json references skills that exist.
	const cfg = routing();
	const referenced = new Set();
	for (const r of [...cfg.routes, cfg.fallback]) {
		referenced.add(r.entrySkill);
		for (const s of r.required) referenced.add(s);
		for (const c of r.conditional ?? []) for (const s of c.skills) referenced.add(s);
	}
	for (const s of referenced) {
		if (!skills.includes(s)) problems.push(`routing.json references missing skill: ${s}`);
	}
	for (const rule of cfg.skillPrecedence) {
		if (!skills.includes(rule.canonical)) problems.push(`skillPrecedence canonical missing: ${rule.canonical}`);
	}

	// 3. Component manifest paths resolve.
	const mf = manifest();
	let missingRecipes = 0;
	for (const [name, c] of Object.entries(mf.components)) {
		for (const f of [c.zero_js, c.svelte5].filter(Boolean)) {
			if (!existsSync(join(BUILDER_REFS, f))) {
				missingRecipes++;
				problems.push(`MANIFEST recipe missing: ${name} -> ${f}`);
			}
		}
	}

	// 4. Skills index drift.
	const indexPath = join(ARMORY, 'skills', 'INDEX.md');
	let indexDrift = 0;
	if (existsSync(indexPath)) {
		const idx = readFileSync(indexPath, 'utf8');
		const claimed = idx.match(/\*\*Current entries:\*\*\s*(\d+)/);
		if (claimed && Number(claimed[1]) !== skills.length) {
			indexDrift++;
			problems.push(`skills/INDEX.md claims ${claimed[1]} entries; ${skills.length} exist on disk`);
		}
		for (const s of skills) {
			if (!idx.includes(`(./${s}/)`)) {
				indexDrift++;
				problems.push(`skills/INDEX.md is missing an entry for: ${s}`);
			}
		}
	} else {
		problems.push('skills/INDEX.md is missing');
	}

	// 5. Orphan skills — on disk but unreachable from routing. A skill that is
	// deliberately superseded is still reachable (via its canonical), not an orphan.
	const supersededSkills = new Set(cfg.skillPrecedence.flatMap((r) => r.supersedes));
	const orphans = skills.filter((s) => !referenced.has(s) && !supersededSkills.has(s));
	for (const o of orphans) problems.push(`orphan skill (bundled but unreachable from routing.json): ${o}`);

	const clean = problems.length === 0;
	const body = [
		'ARMORY DOCTOR',
		'',
		`  skills on disk       ${skills.length}`,
		`  routed skills        ${referenced.size}`,
		`  orphan skills        ${orphans.length}${orphans.length ? '  (' + orphans.join(', ') + ')' : ''}`,
		`  component recipes    ${Object.keys(mf.components).length}`,
		`  broken links         ${brokenLinks}`,
		`  missing recipes      ${missingRecipes}`,
		`  index drift          ${indexDrift}`,
		'',
		...(problems.length ? ['PROBLEMS:', ...problems.map((p) => `  ${p}`)] : ['  no problems found'])
	].join('\n');

	emit({
		status: clean ? 'success' : 'error',
		summary: clean
			? `armory is consistent — ${skills.length} skills, ${Object.keys(mf.components).length} recipes, 0 broken links`
			: `${problems.length} integrity problems (${brokenLinks} broken links, ${missingRecipes} missing recipes, ${indexDrift} index drift)`,
		next_actions: clean
			? ['fa route "<your task>"']
			: [
					'Fix broken links before shipping — an agent following them hits a dead file.',
					'Regenerate skills/INDEX.md from disk.',
					'Remove routing entries for skills that are not bundled.'
				],
		artifacts: [rel(join(ARMORY, 'routing.json')), rel(join(BUILDER_REFS, 'MANIFEST.json'))],
		payload: {
			skills: skills.length,
			routed: referenced.size,
			orphans,
			brokenLinks,
			missingRecipes,
			indexDrift,
			problems
		},
		body
	});
}

// ---------------------------------------------------------------------------
// help
// ---------------------------------------------------------------------------

function cmdHelp() {
	const body = `fa — Fractal Svelte agent tool surface

  fa route "<task>"              resolve a task to entry skill + required + conditional skills
  fa contract                    the non-negotiable output rules for this project
  fa component --list            list every component recipe
  fa component <name> [--svelte|--native]
  fa skill --list                list skills, flagging superseded ones
  fa skill <name>
  fa docs --list                 list how-to guides, tutorials, references
  fa docs <topic>
  fa tokens                      the project's ACTUAL design tokens (never guess these)
  fa verify [--static|--build|--all]   run checks and write a receipt
  fa doctor                      armory integrity check

Flags:
  --dense    token-efficient output (strips prose, keeps code and structure)
  --json     machine-readable {status, summary, next_actions, artifacts, payload}

Start every non-trivial task with:  fa route "<what you were asked to do>"`;

	emit({
		status: 'success',
		summary: 'fa command reference',
		next_actions: ['fa route "<your task>"', 'fa contract'],
		artifacts: [],
		payload: null,
		body
	});
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
	const argv = process.argv.slice(2);
	JSON_MODE = argv.includes('--json');
	DENSE = argv.includes('--dense');

	const cmd = argv.find((a) => !a.startsWith('--')) ?? 'help';
	const rest = argv.filter((a) => a !== cmd);

	switch (cmd) {
		case 'route': return cmdRoute(rest);
		case 'contract': return cmdContract();
		case 'component': case 'components': return cmdComponent(rest);
		case 'skill': case 'skills': return cmdSkill(rest);
		case 'docs': case 'doc': return cmdDocs(rest);
		case 'tokens': return cmdTokens();
		case 'verify': return cmdVerify(rest);
		case 'doctor': return cmdDoctor();
		case 'help': case '--help': case '-h': return cmdHelp();
		default:
			fail(`unknown command "${cmd}"`, ['fa help']);
	}
}

main();
