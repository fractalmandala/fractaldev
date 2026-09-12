// Data for "The set" on the home page. Everything not already in the docs
// previews lives here so +page.svelte stays composition only.

export function activityDays(start: string, length: number) {
	const [year, month, day] = start.split('-').map(Number);
	const origin = Date.UTC(year, month - 1, day);
	return Array.from({ length }, (_, index) => {
		const time = origin + index * 86_400_000;
		const date = new Date(time).toISOString().slice(0, 10);
		const dow = new Date(time).getUTCDay();
		const week = Math.floor(index / 7);
		let count = 0;
		if (dow > 0 && dow < 6) {
			const pulse = (week + dow) % 9;
			count =
				pulse === 0
					? 12
					: pulse === 4
						? 7
						: pulse % 3 === 0
							? 3
							: index % 5 === 0
								? 1
								: 0;
		} else if (index % 13 === 0) {
			count = 2;
		}
		return { date, count };
	});
}

export const commits = activityDays('2025-09-01', 371);
