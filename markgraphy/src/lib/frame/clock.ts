/*
 * Clock helpers for Timer / Countdown, ported from markdown-graphs.
 * Timers tick once a second — as text, never as animation.
 */

import { readable } from 'svelte/store';

export function parseInstant(value: Date | number | string) {
	if (value instanceof Date) {
		return value.getTime();
	}

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : Number.NaN;
	}

	return Date.parse(value);
}

export function pad2(value: number) {
	return String(Math.trunc(value)).padStart(2, '0');
}

export function formatHms(ms: number) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const days = Math.floor(total / 86400);
	const hours = Math.floor((total % 86400) / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const seconds = total % 60;
	const clock = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

	if (days > 0) {
		return `${days}d ${clock}`;
	}

	return clock;
}

export function formatAgo(ms: number) {
	const seconds = Math.max(0, Math.floor(ms / 1000));

	if (seconds < 60) {
		return `${seconds}s ago`;
	}

	const minutes = Math.floor(seconds / 60);

	if (minutes < 60) {
		return `${minutes}m ago`;
	}

	const hours = Math.floor(minutes / 60);

	if (hours < 48) {
		return `${hours}h ago`;
	}

	return `${Math.floor(hours / 24)}d ago`;
}

export function formatClock(ms: number) {
	const date = new Date(ms);

	return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/**
 * The current time, ticking once per interval. SSR-safe: renders null
 * on the server and starts the interval on the client.
 */
export function graphNow(interval = 1000) {
	return readable<number | null>(null, (set) => {
		if (typeof window === 'undefined') {
			return;
		}

		set(Date.now());
		const id = window.setInterval(() => set(Date.now()), interval);
		return () => window.clearInterval(id);
	});
}
