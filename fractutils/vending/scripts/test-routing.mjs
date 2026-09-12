#!/usr/bin/env node
// test-routing.mjs — routing regression suite.
//
// `fa route` is the first decision the agent makes on every task; a wrong route
// sends it into the wrong skills before it writes a line. This pins that behavior
// so editing routing.json cannot silently degrade it.
//
//   node scripts/test-routing.mjs

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FA = join(ROOT, 'armory', 'bin', 'fa.mjs');
const CASES = JSON.parse(
	readFileSync(
		join(ROOT, 'armory', 'skills', 'agentic-svelte-builder', 'evals', 'skill-routing.json'),
		'utf8'
	)
);

let pass = 0;
const failures = [];

for (const { prompt, route: expected } of CASES) {
	const res = spawnSync(process.execPath, [FA, 'route', prompt, '--json'], { encoding: 'utf8' });
	let actual;
	try {
		actual = JSON.parse(res.stdout).payload.route;
	} catch {
		actual = `<no parseable output: ${res.stderr.trim().slice(0, 80)}>`;
	}
	if (actual === expected) {
		pass++;
	} else {
		failures.push({ prompt, expected, actual });
	}
}

for (const f of failures) {
	console.error(`FAIL  "${f.prompt}"\n      expected: ${f.expected}\n      actual:   ${f.actual}`);
}

const total = CASES.length;
console.log(`\nrouting: ${pass}/${total} passed`);

if (failures.length) {
	console.error(
		`\n${failures.length} routing regressions. Fix the match patterns in armory/routing.json,\n` +
			`or update the eval set if the expected route genuinely changed.`
	);
	process.exit(1);
}
