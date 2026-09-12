import type { GradientPreset } from './gradients.js';
import type { Pattern } from './patterns.js';

export type BackgroundAppearance = 'light' | 'dark';

type Rgb = { red: number; green: number; blue: number; alpha: number };

function channelToLinear(channel: number) {
	const value = channel / 255;
	return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
}

function luminance(color: Rgb) {
	return .2126 * channelToLinear(color.red) + .7152 * channelToLinear(color.green) + .0722 * channelToLinear(color.blue);
}

function parseColors(value: string) {
	const colors: Rgb[] = [];
	for (const match of value.matchAll(/#([\da-f]{3,8})\b/gi)) {
		const hex = match[1];
		const expanded = hex.length === 3 || hex.length === 4 ? [...hex].map((character) => character.repeat(2)).join('') : hex;
		const alpha = expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;
		colors.push({ red: Number.parseInt(expanded.slice(0, 2), 16), green: Number.parseInt(expanded.slice(2, 4), 16), blue: Number.parseInt(expanded.slice(4, 6), 16), alpha });
	}
	for (const match of value.matchAll(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/gi)) {
		colors.push({ red: Number(match[1]), green: Number(match[2]), blue: Number(match[3]), alpha: match[4] === undefined ? 1 : Number(match[4]) });
	}
	return colors.filter((color) => color.alpha > .04);
}

function appearanceFromColors(colors: Rgb[]): BackgroundAppearance {
	if (!colors.length) return 'light';
	const weight = colors.reduce((sum, color) => sum + color.alpha, 0);
	const average = colors.reduce((sum, color) => sum + luminance(color) * color.alpha, 0) / weight;
	return average < .38 ? 'dark' : 'light';
}

export function gradientAppearance(gradient: GradientPreset): BackgroundAppearance {
	return appearanceFromColors(parseColors(gradient.colors.join(' ')));
}

export function patternAppearance(pattern: Pattern): BackgroundAppearance {
	const background = String(pattern.style.backgroundColor ?? pattern.style.background ?? '');
	const backgroundColors = parseColors(background);
	const fallback = background.match(/(?:,|\s)(#[\da-f]{3,8}|rgba?\([^)]*\))\s*$/i);
	if (fallback) return appearanceFromColors(parseColors(fallback[1]));
	if (backgroundColors.length) return appearanceFromColors(backgroundColors);
	return appearanceFromColors(parseColors(Object.entries(pattern.style).filter(([key]) => key.toLowerCase().startsWith('background')).map(([, value]) => String(value ?? '')).join(' ')));
}
