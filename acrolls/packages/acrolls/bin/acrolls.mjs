#!/usr/bin/env node

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const publicPackage = JSON.parse(
	readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../package.json'), 'utf8')
);
let cliEntry;
try {
  cliEntry = require.resolve('@acrolls/cli/dist/index.js');
} catch {
  // Keep the workspace clone runnable before its node_modules links are rebuilt.
  const localEntry = resolve(dirname(fileURLToPath(import.meta.url)), '../../cli/dist/index.js');
  if (!existsSync(localEntry)) {
    console.error('Cannot find the Acrolls CLI runtime. Reinstall with `pnpm add acrolls@latest`.');
    process.exit(1);
  }
  cliEntry = localEntry;
}
const child = spawn(process.execPath, [cliEntry, ...process.argv.slice(2)], {
	stdio: 'inherit',
	env: {
		...process.env,
		ACROLLS_VERSION: publicPackage.version
	}
});

child.once('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
