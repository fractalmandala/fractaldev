/**
 * Progressive enhancement for compile-time code frames:
 * inject Copy + Wrap buttons into [data-acrolls-code-actions] slots.
 */
export function enhanceCodeFrames(root: HTMLElement): () => void {
	const frames = root.querySelectorAll<HTMLElement>('.acrolls-code-frame');
	const cleanups: Array<() => void> = [];

	frames.forEach((frame) => {
		const slot = frame.querySelector('[data-acrolls-code-actions]');
		if (!slot || slot.childElementCount > 0) return;

		const wrapBtn = document.createElement('button');
		wrapBtn.type = 'button';
		wrapBtn.className = 'acrolls-code-frame__btn';
		wrapBtn.textContent = frame.dataset.wrap === 'true' ? 'Scroll' : 'Wrap';
		wrapBtn.setAttribute('aria-label', 'Toggle code wrapping');

		const copyBtn = document.createElement('button');
		copyBtn.type = 'button';
		copyBtn.className = 'acrolls-code-frame__btn';
		copyBtn.textContent = 'Copy';
		copyBtn.setAttribute('aria-label', 'Copy code');

		const onWrap = () => {
			const next = frame.dataset.wrap === 'true' ? 'false' : 'true';
			frame.dataset.wrap = next;
			wrapBtn.textContent = next === 'true' ? 'Scroll' : 'Wrap';
		};

		const onCopy = async () => {
			const code = frame.querySelector('code');
			const text = code?.innerText ?? '';
			try {
				await navigator.clipboard.writeText(text);
				copyBtn.textContent = 'Copied';
				setTimeout(() => {
					copyBtn.textContent = 'Copy';
				}, 1200);
			} catch {
				copyBtn.textContent = 'Failed';
				setTimeout(() => {
					copyBtn.textContent = 'Copy';
				}, 1200);
			}
		};

		wrapBtn.addEventListener('click', onWrap);
		copyBtn.addEventListener('click', onCopy);
		slot.append(wrapBtn, copyBtn);

		cleanups.push(() => {
			wrapBtn.removeEventListener('click', onWrap);
			copyBtn.removeEventListener('click', onCopy);
			slot.replaceChildren();
		});
	});

	return () => cleanups.forEach((fn) => fn());
}
