import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import type { Args } from './util.js';
import { exists } from './util.js';

export async function detectHost(root: string) {
  const pkgPath = join(root, 'package.json');
  if (!(await exists(pkgPath))) {
    return { kind: 'unknown' as const, pkg: null as null | Record<string, unknown> };
  }
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown>;
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined)
  };
  const hasKit = Boolean(deps['@sveltejs/kit']);
  const hasMdsvex = Boolean(deps.mdsvex || deps.acrolls);
  const hasSvelte = Boolean(deps['svelte']);
  const hasAcrolls = Boolean(deps.acrolls);
  const viteConfig = await firstExisting(root, [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mts',
    'vite.config.mjs',
    'vite.config.cts',
    'vite.config.cjs'
  ]);
  return {
    kind: hasKit ? ('sveltekit' as const) : hasSvelte ? ('svelte' as const) : ('node' as const),
    pkg,
    deps,
    hasKit,
    hasMdsvex,
    hasSvelte,
    hasAcrolls,
    viteConfig,
    svelteConfig: (await exists(join(root, 'svelte.config.js')))
      ? 'svelte.config.js'
      : (await exists(join(root, 'svelte.config.ts')))
        ? 'svelte.config.ts'
        : null,
    layout:
      (await exists(join(root, 'src/routes/+layout.svelte')))
        ? 'src/routes/+layout.svelte'
        : (await exists(join(root, 'src/app.html')))
          ? 'src/app.html'
          : null
  };
}

async function firstExisting(root: string, candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    if (await exists(join(root, candidate))) return candidate;
  }
  return null;
}

const VITE_CONFIG_SNIPPET = `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';
import { defineConfig } from 'vite';

const acrolls = createAcrollsMdsvexPreprocessor({ extensions: ['.md', '.svx'] });

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx', '.md'],
      preprocess: [vitePreprocess(), acrolls]
    })
  ]
});
`;

function ensureStyleImport(
  source: string,
  mode: string,
  style: 'css' | 'sass'
): { next: string; changed: boolean } {
  const importLine = `import 'acrolls/styles/${mode}.${style}';`;
  if (source.includes('acrolls/styles/')) {
    return { next: source, changed: false };
  }
  // Prefer after existing imports
  const scriptMatch = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const body = scriptMatch[1] ?? '';
    const injected = `${body.trim() ? body.replace(/^\n?/, '\n') : '\n'}\t${importLine}\n`;
    const next = source.replace(scriptMatch[0], scriptMatch[0].replace(body, injected));
    return { next, changed: true };
  }
  const next = `<script>\n\t${importLine}\n</script>\n\n${source}`;
  return { next, changed: true };
}

function patchSvelteConfig(source: string): { next: string; changed: boolean; notes: string[] } {
  const notes: string[] = [];
  let next = source;
  let changed = false;

  const hasAcrollsPreprocessor =
    next.includes('createAcrollsMdsvexPreprocessor') ||
    next.includes('createAcrollsSvelteKitMdsvexPreprocessor');
  if (!next.includes('mdsvex') && !hasAcrollsPreprocessor) {
    notes.push('add Acrolls mdsvex preprocessor (manual merge recommended if config is complex)');
  }
  if (!next.includes('acrolls/sveltekit') && !next.includes('createAcrolls')) {
    notes.push('wire createAcrollsMdsvexPreprocessor()');
  }
  if (!next.includes("'.svx'") && !next.includes('".svx"')) {
    if (next.includes('extensions:')) {
      next = next.replace(
        /extensions:\s*\[([^\]]*)\]/,
        (full, inner: string) => {
          if (inner.includes('svx')) return full;
          const trimmed = inner.trim().replace(/,?$/, '');
          changed = true;
          return `extensions: [${trimmed}${trimmed ? ', ' : ''}'.svx', '.md']`;
        }
      );
      notes.push('extended extensions with .svx, .md');
    } else {
      notes.push('add extensions: [\'.svelte\', \'.svx\', \'.md\']');
    }
  }

  if (!hasAcrollsPreprocessor && next.includes('preprocess:')) {
    // try inject mdsvex into preprocess array
    if (next.includes('preprocess: [')) {
      next = next.replace(
        /preprocess:\s*\[/,
        `preprocess: [\n    createAcrollsMdsvexPreprocessor(),\n    `
      );
      const hasPreprocessorImport = /createAcrollsMdsvexPreprocessor\s*[,}]/.test(next);
      if (!hasPreprocessorImport) {
        next = `import { createAcrollsMdsvexPreprocessor } from 'acrolls/mdsvex';\n` + next;
      }
      changed = true;
      notes.push('injected createAcrollsSvelteKitMdsvexPreprocessor() into preprocess');
    }
  }

  return { next, changed, notes };
}

export async function cmdIntegrate(args: Args) {
  const dry = Boolean(args.flags['dry-run']);
  const mode = String(args.flags.mode ?? 'default');
  if (!['foundation', 'default'].includes(mode)) {
    console.error('Invalid --mode. Use foundation or default.');
    return 2;
  }
  const style = String(args.flags.style ?? 'css');
  if (style !== 'css' && style !== 'sass') {
    console.error('Invalid --style. Use css or sass.');
    return 2;
  }
  const root = process.cwd();
  const host = await detectHost(root);
  const actions: string[] = [];

  console.log(`Host: ${host.kind}`);
  console.log(`Mode: ${mode}`);
  console.log(`Style: ${style}`);
  console.log('Plan:');
  console.log('  1. Ensure package: acrolls');
  console.log(`  2. ${host.viteConfig ? `Merge Acrolls into ${host.viteConfig}` : host.svelteConfig ? `Patch legacy ${host.svelteConfig}` : 'Create vite.config.ts'}`);
  console.log(
    `  3. ${host.layout ? `Import styles in ${host.layout}` : 'Create src/routes/+layout.svelte with styles'}`
  );
  console.log('  4. Snapshot originals to .acrolls/backup/ before writes');

  if (dry) {
    console.log('\n[dry-run] no files changed');
    if (!host.hasAcrolls) {
      console.log(
        '\nInstall when ready:\n  pnpm add acrolls@latest'
      );
    }
    return 0;
  }

  if (!('hasKit' in host) || !host.hasKit) {
    console.error('\nAcrolls integration expects an existing SvelteKit host. No files were changed.');
    return 1;
  }

  if (!args.flags.yes) {
    console.log('\nRe-run with --yes to apply (reviewed non-interactive apply).');
    console.log(
      'Package:\n  pnpm add acrolls@latest'
    );
    return 0;
  }

  if (host.viteConfig) {
    console.error(
      `Automatic edits to ${host.viteConfig} are intentionally disabled until the CLI can preserve arbitrary Vite plugins and SvelteKit options. Run \`pnpm exec acrolls onboard\` and merge the printed sveltekit({ ... }) options instead.`
    );
    return 1;
  }

  const backupDir = join(root, '.acrolls/backup', String(Date.now()));
  await mkdir(backupDir, { recursive: true });

  // SvelteKit config: create the Vite-based shape for new hosts; patch only legacy hosts.
  if (!host.svelteConfig) {
    const target = join(root, 'vite.config.ts');
    await writeFile(target, VITE_CONFIG_SNIPPET, 'utf8');
    actions.push(`created ${relative(root, target)}`);
  } else {
    const path = join(root, host.svelteConfig);
    const original = await readFile(path, 'utf8');
    await writeFile(join(backupDir, host.svelteConfig.replaceAll('/', '__')), original, 'utf8');
    const { next, changed, notes } = patchSvelteConfig(original);
    if (changed) {
      await writeFile(path, next, 'utf8');
      actions.push(`patched ${host.svelteConfig} (${notes.join('; ')})`);
    } else {
      actions.push(`left ${host.svelteConfig} unchanged — ${notes.join('; ') || 'already wired or needs manual merge'}`);
      // still write guide notes
      await writeFile(
        join(backupDir, 'svelte.config.notes.txt'),
        notes.join('\n') || 'no automatic changes',
        'utf8'
      );
    }
  }

  // layout styles
  const layoutPath = host.layout
    ? join(root, host.layout)
    : join(root, 'src/routes/+layout.svelte');

  if (await exists(layoutPath)) {
    const original = await readFile(layoutPath, 'utf8');
    await writeFile(
      join(backupDir, relative(root, layoutPath).replaceAll('/', '__')),
      original,
      'utf8'
    );
    if (layoutPath.endsWith('.svelte')) {
      const { next, changed } = ensureStyleImport(original, mode, style as 'css' | 'sass');
      if (changed) {
        await writeFile(layoutPath, next, 'utf8');
        actions.push(`added Acrolls ${style} styles in ${relative(root, layoutPath)}`);
      } else {
        actions.push(`styles already present in ${relative(root, layoutPath)}`);
      }
    } else {
      actions.push(`skipped auto-edit of ${host.layout} (not a .svelte layout) — import CSS in root layout manually`);
    }
  } else {
    await mkdir(join(root, 'src/routes'), { recursive: true });
    const content = `<script>
\timport 'acrolls/styles/${mode}.${style}';
\tlet { children } = $props();
</script>

{@render children()}
`;
    await writeFile(layoutPath, content, 'utf8');
    actions.push(`created ${relative(root, layoutPath)}`);
  }

  // content launchpad if missing
  const contentCandidates = ['content/blog', 'src/content', 'posts'];
  let hasContent = false;
  for (const c of contentCandidates) {
    if (await exists(join(root, c))) {
      hasContent = true;
      break;
    }
  }
  if (!hasContent) {
    await mkdir(join(root, 'content/blog'), { recursive: true });
    actions.push('created content/blog');
  }

  console.log('\nApplied:');
  actions.forEach((a) => console.log(`  • ${a}`));
  console.log(`\nBackups: ${relative(root, backupDir)}`);
  console.log(
    '\nInstall the package if missing:\n  pnpm add acrolls@latest'
  );
  return 0;
}
