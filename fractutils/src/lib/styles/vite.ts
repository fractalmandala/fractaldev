import path from 'node:path';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import {
	assertCssBudget,
	compileStyles,
	pruneCss,
	scanContent,
	type StylesOptions
} from './builder.ts';

const virtualId = 'virtual:fractutils.css';
const virtualPath = '/.fractutils/used.css';

/** Node/build-time only. Import the virtual stylesheet once in the app entry. */
export function fractutilsStyles(options: StylesOptions = {}): Plugin {
	let root = options.root ?? process.cwd();
	// File-shaped virtual IDs let SvelteKit discover CSS through both its SSR
	// dependency graph and browser URL, and inline it BEFORE first paint in dev.
	// A null-prefixed ID has different URLs in those graphs in Vite 8. No file
	// is written here: load() still supplies the used-only stylesheet in memory.
	let resolvedId = normalizePath(path.resolve(root, `.${virtualPath}`));
	let compiled: ReturnType<typeof compileStyles> | undefined;
	let styleFiles = new Set<string>();
	let server: ViteDevServer | undefined;
	let signature = '';
	let queue = Promise.resolve();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const settings = () => ({ ...options, root });
	const getCompiled = () =>
		(compiled ??= compileStyles(settings())
			.then((result) => {
				styleFiles = new Set(result.files);
				server?.watcher.add(result.files);
				return result;
			})
			.catch((error) => {
				compiled = undefined;
				throw error;
			}));
	const key = (candidates: ReadonlySet<string>) => [...candidates].sort().join('\n');

	return {
		name: 'fractutils:used-styles',
		enforce: 'pre',
		configResolved(config) {
			root = path.resolve(options.root ?? config.root);
			resolvedId = normalizePath(path.resolve(root, `.${virtualPath}`));
		},
		resolveId(id) {
			const pathname = id.split('?')[0];
			if ([virtualId, virtualPath, resolvedId, `/@fs${resolvedId}`].includes(pathname)) {
				return resolvedId + id.slice(pathname.length);
			}
		},
		async load(id) {
			if (id.split('?')[0] !== resolvedId) return;
			const styles = await getCompiled();
			// Scan after an expensive first compilation so edits made during it
			// cannot leave us delivering an old content snapshot.
			const content = await scanContent(settings());
			signature = key(content.candidates);
			const watched = [...styles.files, ...content.files, ...content.watchRoots];
			if (server) {
				// In dev addWatchFile becomes a CSS dependency in Vite's graph.
				// SvelteKit would then inline those raw Sass files on a cold load,
				// bypassing pruning. Watch them without turning them into imports.
				server.watcher.add(watched);
			} else {
				for (const file of watched) this.addWatchFile(file);
			}
			const result = pruneCss(styles.css, content.candidates);
			assertCssBudget(result.css, options.maxCssBytes);
			return result.css;
		},
		watchChange(id) {
			if (styleFiles.has(id)) compiled = undefined;
		},
		configureServer(devServer) {
			server = devServer;
			let stylesChanged = false;
			const refresh = (file: string) => {
				if (styleFiles.has(file)) stylesChanged = true;
				// Let content globs, not a second extension allowlist, determine
				// relevance. Custom Markdown/template extensions must refresh too.
				if (timer) clearTimeout(timer);
				timer = setTimeout(() => {
					queue = queue
						.then(async () => {
							const changed = stylesChanged;
							stylesChanged = false;
							if (changed) compiled = undefined;
							const content = await scanContent(settings());
							const next = key(content.candidates);
							if (!changed && next === signature) return;
							signature = next;
							// Never invalidate the entire graph: that can mix old components
							// with a reloaded Svelte SSR runtime whose context is still null.
							for (const environment of Object.values(devServer.environments)) {
								for (const [id, module] of environment.moduleGraph.idToModuleMap) {
									if (id.split('?')[0] === resolvedId)
										environment.moduleGraph.invalidateModule(module);
								}
							}
							server?.ws.send({ type: 'full-reload' });
						})
						.catch((error) => devServer.config.logger.error(String(error)));
				}, 50);
			};
			devServer.watcher.on('add', refresh).on('change', refresh).on('unlink', refresh);
			devServer.httpServer?.once('close', () => {
				if (timer) clearTimeout(timer);
				devServer.watcher.off('add', refresh).off('change', refresh).off('unlink', refresh);
			});
		}
	};
}

export default fractutilsStyles;
