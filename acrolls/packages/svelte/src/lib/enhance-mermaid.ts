/**
 * Progressive enhancement: render [data-acrolls-mermaid] blocks via mermaid (lazy import).
 */
export function enhanceMermaid(root: HTMLElement): () => void {
	const nodes = root.querySelectorAll<HTMLElement>('[data-acrolls-mermaid]');
	if (!nodes.length) return () => {};

	let cancelled = false;
	const cleanups: Array<() => void> = [];

	(async () => {
		try {
			const mermaid = (await import('mermaid')).default;
			if (cancelled) return;
			mermaid.initialize({
				startOnLoad: false,
				securityLevel: 'strict',
				theme: 'neutral'
			});

			let i = 0;
			for (const node of nodes) {
				if (cancelled) return;
				const fallback = node.querySelector('.acrolls-mermaid__fallback');
				const canvas = node.querySelector('.acrolls-mermaid__canvas');
				const source = fallback?.textContent?.trim() ?? '';
				if (!source || !canvas) continue;

				const id = `acrolls-mmd-${Date.now()}-${i++}`;
				try {
					const { svg } = await mermaid.render(id, source);
					if (cancelled) return;
					canvas.innerHTML = svg;
					canvas.removeAttribute('hidden');
					fallback?.setAttribute('hidden', '');
				} catch {
					// keep fallback source visible
				}
			}
		} catch {
			// mermaid optional / failed to load
		}
	})();

	return () => {
		cancelled = true;
		cleanups.forEach((fn) => fn());
	};
}
