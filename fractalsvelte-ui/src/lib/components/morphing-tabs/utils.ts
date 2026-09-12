// Layout constants shared by the root, the tab child, and the liquid surface
// path. TAB_WIDTH drives both the slot math and the path geometry, so the two
// must stay in lockstep.
export const DRAG_THRESHOLD = 5;
export const TAB_WIDTH = 176;
export const TAB_HEIGHT = 56;
export const TAB_TOP = 24;
export const TAB_RADIUS = 24;
export const RAIL_HEIGHT = 80;
export const SURFACE_INSET = 16;
export const LIQUID_JOIN = 24;
export const PANEL_RADIUS = 28;

/** True when both arrays hold the same ids in the same order. */
export function sameOrder(a: string[], b: string[]) {
	return a.length === b.length && a.every((id, index) => id === b[index]);
}

/** Make a string safe for use in an element id. */
export function safeId(value: string) {
	return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/** Move one id from `from` to `to`, returning a new array. */
export function moveItem(order: string[], from: number, to: number) {
	if (from === to) return order.slice();
	const next = order.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}

/** SVG path for the liquid surface: a rounded panel with a tab notch that
 * follows `tabLeft`. Built from the same geometry constants as the rail. */
export function liquidTabPath(tabLeft: number, surfaceWidth: number) {
	const panelLeft = SURFACE_INSET;
	const panelRight = surfaceWidth - SURFACE_INSET;
	const left = Math.max(panelLeft, Math.min(panelRight - TAB_WIDTH, tabLeft));
	const right = left + TAB_WIDTH;
	const top = RAIL_HEIGHT - TAB_HEIGHT;
	const bottom = RAIL_HEIGHT;
	const leftJoin = Math.max(panelLeft, left - LIQUID_JOIN);
	const rightJoin = Math.min(panelRight, right + LIQUID_JOIN);
	const leftDepth = Math.min(LIQUID_JOIN, left - leftJoin);
	const rightDepth = Math.min(LIQUID_JOIN, rightJoin - right);
	const leftControl = leftDepth * 0.55;
	const rightControl = rightDepth * 0.55;
	const leftPanelRadius = Math.min(PANEL_RADIUS, leftJoin - panelLeft);
	const rightPanelRadius = Math.min(PANEL_RADIUS, panelRight - rightJoin);

	return [
		`M${panelLeft} ${bottom + PANEL_RADIUS}`,
		`V${bottom + leftPanelRadius}`,
		`Q${panelLeft} ${bottom} ${panelLeft + leftPanelRadius} ${bottom}`,
		`H${leftJoin}`,
		`C${leftJoin + leftControl} ${bottom} ${left} ${bottom - leftDepth + leftControl} ${left} ${bottom - leftDepth}`,
		`V${top + TAB_RADIUS}`,
		`Q${left} ${top} ${left + TAB_RADIUS} ${top}`,
		`H${right - TAB_RADIUS}`,
		`Q${right} ${top} ${right} ${top + TAB_RADIUS}`,
		`V${bottom - rightDepth}`,
		`C${right} ${bottom - rightDepth + rightControl} ${rightJoin - rightControl} ${bottom} ${rightJoin} ${bottom}`,
		`H${panelRight - rightPanelRadius}`,
		`Q${panelRight} ${bottom} ${panelRight} ${bottom + rightPanelRadius}`,
		`V${bottom + PANEL_RADIUS}`,
		'Z'
	].join(' ');
}
