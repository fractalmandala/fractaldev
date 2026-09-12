// Usage-snippet tint for the rooms: escape, then paint the package path and
// the import keyword with the accent (.tok). Deliberately naive — the site
// ships no syntax highlighter; this mirrors the reference mockup's colorize.
export function colorize(code: string): string {
	return code
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('markgraphy', "<span class='tok'>markgraphy</span>")
		.replaceAll('import', "<span class='tok'>import</span>");
}
