/**
 * Color helpers for the Demos Ground — WCAG luminance/contrast and the
 * random-palette generator for the "Deal the Deck" shuffle.
 */

export interface HslColor {
	h: number; // 0–360
	s: number; // 0–100
	l: number; // 0–100
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const clean = hex.replace('#', '').trim();
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const n = parseInt(full.slice(0, 6), 16);
	if (Number.isNaN(n)) return { r: 0, g: 0, b: 0 };
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
	const to = (v: number) =>
		Math.max(0, Math.min(255, Math.round(v)))
			.toString(16)
			.padStart(2, '0');
	return `#${to(r)}${to(g)}${to(b)}`;
}

export function hslToHex({ h, s, l }: HslColor): string {
	const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const c = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return c * 255;
	};
	return rgbToHex(f(0), f(8), f(4));
}

export function hexToHsl(hex: string): HslColor {
	const { r, g, b } = hexToRgb(hex);
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, s: 0, l: l * 100 };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
	else if (max === gn) h = ((bn - rn) / d + 2) * 60;
	else h = ((rn - gn) / d + 4) * 60;
	return { h, s: s * 100, l: l * 100 };
}

/** Relative luminance per WCAG 2.x. */
export function luminance(hex: string): number {
	const { r, g, b } = hexToRgb(hex);
	const lin = [r, g, b].map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG contrast ratio (1–21) between two colors. */
export function contrastRatio(a: string, b: string): number {
	const la = luminance(a);
	const lb = luminance(b);
	const light = Math.max(la, lb);
	const dark = Math.min(la, lb);
	return (light + 0.05) / (dark + 0.05);
}

/** Contrast ratio of a color against black or white, whichever is higher. */
export function bestInkContrast(hex: string): number {
	return Math.max(contrastRatio(hex, '#000000'), contrastRatio(hex, '#ffffff'));
}

/** "AA" when ≥ 4.5 against black/white, "UI" when usable for large/UI (≥ 3). */
export function contrastGrade(hex: string): string {
	const c = bestInkContrast(hex);
	if (c >= 7) return 'AAA';
	if (c >= 4.5) return 'AA';
	if (c >= 3) return 'UI';
	return 'LOW';
}

/** Black or white — whichever reads better on the given background. */
export function inkOn(hex: string): '#000000' | '#ffffff' {
	return contrastRatio(hex, '#000000') >= contrastRatio(hex, '#ffffff') ? '#000000' : '#ffffff';
}

export function shift(hex: string, dh: number, ds: number, dl: number): string {
	const hsl = hexToHsl(hex);
	return hslToHex({
		h: (hsl.h + dh + 360) % 360,
		s: Math.max(0, Math.min(100, hsl.s + ds)),
		l: Math.max(0, Math.min(100, hsl.l + dl))
	});
}

/** Does the string parse as #rgb / #rrggbb? */
export function isHexColor(v: string | undefined): v is string {
	return !!v && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}

/** Generate a fresh palette biased toward the role's base character. */
export function rollPalette(): Record<string, string> {
	const hue = Math.floor(Math.random() * 360);
	const dark = Math.random() < 0.45;
	const neutralHue = (hue + 180 + Math.floor(Math.random() * 60) - 30 + 360) % 360;
	return {
		primary: hslToHex({ h: hue, s: 55 + Math.random() * 35, l: dark ? 45 + Math.random() * 15 : 40 + Math.random() * 15 }),
		secondary: hslToHex({ h: (hue + 40 + Math.random() * 40) % 360, s: 30 + Math.random() * 40, l: dark ? 12 + Math.random() * 10 : 85 + Math.random() * 8 }),
		tertiary: hslToHex({ h: (hue + 180) % 360, s: 35 + Math.random() * 40, l: 55 + Math.random() * 20 }),
		accent: hslToHex({ h: (hue + 200 + Math.random() * 120) % 360, s: 60 + Math.random() * 35, l: 50 + Math.random() * 15 }),
		neutral: hslToHex({ h: neutralHue, s: 5 + Math.random() * 10, l: dark ? 10 + Math.random() * 6 : 92 + Math.random() * 6 }),
		background: hslToHex({ h: neutralHue, s: 4 + Math.random() * 12, l: dark ? 6 + Math.random() * 6 : 94 + Math.random() * 5 }),
		surface: hslToHex({ h: neutralHue, s: 5 + Math.random() * 12, l: dark ? 12 + Math.random() * 8 : 86 + Math.random() * 8 }),
		'text-primary': dark ? hslToHex({ h: neutralHue, s: 8, l: 93 + Math.random() * 5 }) : hslToHex({ h: neutralHue, s: 15 + Math.random() * 25, l: 8 + Math.random() * 10 }),
		'text-secondary': dark ? hslToHex({ h: neutralHue, s: 6, l: 62 + Math.random() * 10 }) : hslToHex({ h: neutralHue, s: 8 + Math.random() * 12, l: 38 + Math.random() * 12 }),
		border: hslToHex({ h: neutralHue, s: 6 + Math.random() * 12, l: dark ? 20 + Math.random() * 10 : 82 + Math.random() * 10 })
	};
}
