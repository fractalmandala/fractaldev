import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function exists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function resolvePackageDir(name: string): Promise<string | null> {
  try {
    const require = createRequire(import.meta.url);
    const pkgJson = require.resolve(`${name}/package.json`);
    return dirname(pkgJson);
  } catch {
    const here = dirname(fileURLToPath(import.meta.url));
    const sibling = resolve(here, `../../${name.replace('@acrolls/', '')}`);
    if (await exists(sibling)) return sibling;
    return null;
  }
}

export type Args = {
	_: string[];
	flags: Record<string, string | boolean>;
};

const VALUE_FLAGS = new Set([
	'content-dir',
	'mode',
	'base-href',
	'docs-dir',
	'report',
	'port',
	'cwd',
	'on-invalid',
	'style',
	'site',
	'output',
	'glob',
	'bundle-path',
	'out',
	'format',
	'slug',
	'name',
	'title',
	'package-manager'
]);

export function parseArgs(argv: string[]): Args {
	const out: Args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--') continue;
    if (a.startsWith('--')) {
      const body = a.slice(2);
      if (body.includes('=')) {
        const [k, v] = body.split('=');
        out.flags[k!] = v ?? true;
		} else {
			const next = argv[i + 1];
			if (VALUE_FLAGS.has(body) && next && !next.startsWith('-')) {
				out.flags[body] = next;
				i++;
        } else {
          out.flags[body] = true;
        }
      }
    } else if (a.startsWith('-') && a.length === 2) {
      out.flags[a.slice(1)] = true;
    } else {
      out._.push(a);
    }
  }
  return out;
}
