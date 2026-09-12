// Client-side theme parsing. Reads a pasted stylesheet (usually the project's
// globals.css) for @theme names plus :root / .dark concrete values, so custom
// colors and animations resolve without running any compiler.

export interface ThemeName {
	/** raw declared value, e.g. `var(--radius)` or `oklch(0.2 0 0)` */
	value: string;
	/** declared inside `@theme inline` (value inlined into utilities)? */
	inline: boolean;
}

export interface ThemeInfo {
	colors: Set<string>;
	radii: Set<string>;
	animates: Set<string>;
	fonts: Set<string>;
	texts: Set<string>;
	/** per-name declaration detail for value-aware synthesis */
	detail: Record<string, ThemeName>;
	/** raw var name (without --) -> value, from :root */
	light: Record<string, string>;
	/** raw var name (without --) -> value, from .dark */
	dark: Record<string, string>;
	/** keyframes names declared anywhere in the pasted css */
	keyframes: Set<string>;
}

/** @theme span boundaries (start, end, inline?) with brace matching. */
function themeSpans(css: string): Array<{ start: number; end: number; inline: boolean }> {
	const spans: Array<{ start: number; end: number; inline: boolean }> = [];
	const re = /@theme(\s+inline)?\s*\{/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(css)) !== null) {
		let depth = 1;
		let j = m.index + m[0].length;
		while (j < css.length && depth > 0) {
			if (css[j] === '{') depth++;
			else if (css[j] === '}') depth--;
			j++;
		}
		spans.push({ start: m.index, end: j, inline: !!m[1] });
	}
	return spans;
}

export function emptyTheme(): ThemeInfo {
	return {
		colors: new Set(),
		radii: new Set(),
		animates: new Set(),
		fonts: new Set(),
		texts: new Set(),
		detail: {},
		light: {},
		dark: {},
		keyframes: new Set()
	};
}

/** Collect --{color,radius,animate,font,text}-{name} declarations plus keyframes. */
export function parseTheme(css: string): ThemeInfo {
	const t = emptyTheme();
	const spans = themeSpans(css);
	const re = /--(color|radius|animate|font|text)-([a-z0-9][a-z0-9-]*)\s*:\s*([^;{}]+);/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(css)) !== null) {
		const name = m[2].toLowerCase();
		const value = m[3].trim();
		// last declaration wins (matches @theme cascade)
		const inline = spans.some((s) => m!.index > s.start && m!.index < s.end && s.inline);
		t.detail[`${m[1]}:${name}`] = { value, inline };
		if (m[1] === 'color') t.colors.add(name);
		else if (m[1] === 'radius') t.radii.add(name);
		else if (m[1] === 'animate') t.animates.add(name);
		else if (m[1] === 'font') t.fonts.add(name);
		else t.texts.add(name);
	}
	const kf = /@keyframes\s+([a-z0-9_-]+)/gi;
	while ((m = kf.exec(css)) !== null) {
		t.keyframes.add(m[1]);
		t.animates.add(m[1]);
	}
	Object.assign(t, parseModeValues(css));
	return t;
}

/** Pull `--x: value` tables out of top-level :root and .dark blocks. */
export function parseModeValues(css: string): Pick<ThemeInfo, 'light' | 'dark'> {
	const light: Record<string, string> = {};
	const dark: Record<string, string> = {};
	for (const [sel, target] of [
		[':root', light],
		['.dark', dark]
	] as const) {
		// find each top-level `sel { ... }` block with simple brace matching
		let i = 0;
		while ((i = css.indexOf(sel, i)) !== -1) {
			const before = css[i - 1];
			if (before && /[a-z0-9_.)\]-]/i.test(before)) {
				i += sel.length;
				continue; // .dark-x or ::root… not the block we want
			}
			const open = css.indexOf('{', i + sel.length);
			if (open === -1) break;
			let depth = 1;
			let j = open + 1;
			while (j < css.length && depth > 0) {
				if (css[j] === '{') depth++;
				else if (css[j] === '}') depth--;
				j++;
			}
			const body = css.slice(open + 1, j - 1);
			// strip nested blocks (only top-level declarations belong to the mode)
			const flat = body.replace(/\{[^{}]*\}/g, '');
			for (const decl of flat.split(';')) {
				const k = decl.indexOf(':');
				if (k <= 0) continue;
				const prop = decl.slice(0, k).trim();
				const val = decl.slice(k + 1).trim();
				if (prop.startsWith('--') && val) target[prop.slice(2)] = val;
			}
			i = j;
		}
	}
	return { light, dark };
}

/** Concrete light/dark values for a theme var chain like color-popover. */
export function concreteValues(
	varName: string,
	t: ThemeInfo
): { light: string | null; dark: string | null } {
	return { light: t.light[varName] ?? null, dark: t.dark[varName] ?? null };
}
