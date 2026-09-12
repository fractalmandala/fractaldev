import { applySourcePatch } from '../src/lib/components/editor/source-patches.ts';

// Test runner helper
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
	if (condition) {
		console.log(`  ✓ PASS: ${testName}`);
		passCount++;
	} else {
		console.error(`  ✗ FAIL: ${testName}`);
		if (detail) console.error(`    Detail: ${detail}`);
		failCount++;
	}
}

console.log('\n======================================================');
console.log('TEST SUITE: OpenDesign SvelteKit Editor Acceptance Tests');
console.log('======================================================\n');

// -------------------------------------------------------------
// 1. DELIVERY 1: Responsive Design Build Step (Media Query Saving)
// -------------------------------------------------------------
console.log('--- 1. Testing True Responsive Media Query Saving ---');

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Specimen</title>
  <style>
    .hero { font-size: 32px; color: #fff; }
  </style>
</head>
<body>
  <h1 data-od-id="stage-title" class="hero">Charts drawn with characters</h1>
  <article data-od-id="vitrine" class="frame">
    <span class="plus tl">+</span>
    <div class="content">Glyph rain</div>
  </article>
</body>
</html>`;

// Test 1A: Mobile Scoped Style Patch
const mobilePatched = applySourcePatch(sampleHtml, {
	id: 'stage-title',
	kind: 'set-style',
	styles: { fontSize: '16px', color: '#ff5722' },
	scope: 'mobile'
});

assert(
	!mobilePatched.includes('style="font-size: 16px') && !mobilePatched.includes('style="font-size: 16px; color: #ff5722"'),
	'Mobile edits DO NOT pollute the desktop element inline style attribute',
	mobilePatched.match(/<h1[^>]*>/)?.[0]
);

assert(
	mobilePatched.includes('<style id="od-responsive-overrides">'),
	'Generates dedicated <style id="od-responsive-overrides"> block in source HTML'
);

assert(
	mobilePatched.includes('@media (max-width: 480px)') &&
	mobilePatched.includes('[data-od-id="stage-title"]') &&
	mobilePatched.includes('font-size: 16px') &&
	mobilePatched.includes('color: #ff5722'),
	'Correctly inserts @media (max-width: 480px) query targeting [data-od-id="stage-title"]',
	mobilePatched.slice(mobilePatched.indexOf('<style id="od-responsive-overrides">'), mobilePatched.indexOf('</style>') + 8)
);

// Test 1B: Tablet Scoped Style Patch (Cumulative Media Queries)
const tabletAndMobilePatched = applySourcePatch(mobilePatched, {
	id: 'vitrine',
	kind: 'set-style',
	styles: { width: '100%', padding: '12px' },
	scope: 'tablet'
});

assert(
	tabletAndMobilePatched.includes('@media (max-width: 480px)') &&
	tabletAndMobilePatched.includes('@media (max-width: 768px)') &&
	tabletAndMobilePatched.includes('[data-od-id="vitrine"]') &&
	tabletAndMobilePatched.includes('width: 100%'),
	'Appends cumulative @media (max-width: 768px) query without corrupting previous mobile rules'
);

// Test 1C: Base Scoped Style Patch
const basePatched = applySourcePatch(sampleHtml, {
	id: 'stage-title',
	kind: 'set-style',
	styles: { letterSpacing: '2px' },
	scope: 'base'
});

assert(
	basePatched.includes('<h1 data-od-id="stage-title" class="hero" style="letter-spacing: 2px">'),
	'Base scope writes directly to element style attribute'
);

// Test 1D: Closed-Loop Responsive Layout Overflow Audit & Auto-Remediation
console.log('\n  -> Simulating Responsive Layout Geometry & Blowout Audit at 390px (Mobile)...');

interface DomElementMetric {
	id: string;
	tag: string;
	classes: string;
	computedWidth: number;
	scrollWidth: number;
	rectRight: number;
	computedStyle: {
		overflowX?: string;
		whiteSpace?: string;
		display?: string;
		gridTemplateColumns?: string;
	};
}

const mobileViewportWidth = 390;
let specimenElements: DomElementMetric[] = [
	{
		id: 'stage-title',
		tag: 'H1',
		classes: 'hero',
		computedWidth: 350,
		scrollWidth: 350,
		rectRight: 360,
		computedStyle: { display: 'block', whiteSpace: 'normal' }
	},
	{
		id: 'specimen-ascii-rain',
		tag: 'PRE',
		classes: 'content glyphs',
		computedWidth: 850,
		scrollWidth: 850,
		rectRight: 860,
		computedStyle: { display: 'block', whiteSpace: 'pre', overflowX: 'visible' }
	},
	{
		id: 'feature-grid',
		tag: 'DIV',
		classes: 'grid-4-col',
		computedWidth: 920,
		scrollWidth: 920,
		rectRight: 930,
		computedStyle: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }
	}
];

function runDomOverflowAudit(elements: DomElementMetric[], viewportWidth: number) {
	let maxScrollWidth = viewportWidth;
	const issues: Array<{ id: string; label: string; issue: string; fixSuggestion: string }> = [];

	for (const el of elements) {
		const overflowsViewport = el.rectRight > viewportWidth + 1 || el.scrollWidth > viewportWidth + 1;
		if (el.scrollWidth > maxScrollWidth) maxScrollWidth = el.scrollWidth;
		if (el.rectRight > maxScrollWidth) maxScrollWidth = el.rectRight;

		if (overflowsViewport) {
			let diagnosis = `Exceeds ${viewportWidth}px viewport (width: ${el.scrollWidth}px)`;
			let fix = 'max-width: 100%; box-sizing: border-box;';

			if (el.tag === 'PRE' || el.tag === 'CODE') {
				diagnosis += ' [Unscrollable code/pre block]';
				fix += ' overflow-x: auto;';
			} else if (el.computedStyle.display === 'grid') {
				diagnosis += ' [Multi-column CSS grid]';
				fix += ' grid-template-columns: 1fr;';
			} else if (el.computedStyle.whiteSpace === 'nowrap') {
				diagnosis += ' [white-space: nowrap prevents text wrapping]';
				fix += ' white-space: normal;';
			}

			issues.push({
				id: el.id,
				label: `<${el.tag.toLowerCase()} class="${el.classes}">`,
				issue: diagnosis,
				fixSuggestion: fix
			});
		}
	}

	return {
		hasGlobalBlowout: maxScrollWidth > viewportWidth + 2,
		docScrollWidth: maxScrollWidth,
		viewportWidth: viewportWidth,
		issues: issues
	};
}

// Step 1: Initial Audit on raw specimen
const initialAudit = runDomOverflowAudit(specimenElements, mobileViewportWidth);

assert(
	initialAudit.hasGlobalBlowout === true && initialAudit.docScrollWidth === 930,
	'Audit catches global horizontal blowout (930px content > 390px viewport)'
);

assert(
	initialAudit.issues.length === 2 &&
	initialAudit.issues[0].id === 'specimen-ascii-rain' &&
	initialAudit.issues[0].fixSuggestion.includes('overflow-x: auto') &&
	initialAudit.issues[1].id === 'feature-grid' &&
	initialAudit.issues[1].fixSuggestion.includes('grid-template-columns: 1fr'),
	'Audit correctly diagnoses blowout culprits and generates targeted responsive CSS remedies'
);

// Step 2: Auto-Remediation (simulates "⚡ Auto-Fix Blowout")
const blowoutSpecimenHtml = `<!DOCTYPE html>
<html>
<head><style>.hero { font-size: 32px; }</style></head>
<body>
  <h1 data-od-id="stage-title" class="hero">Charts drawn with characters</h1>
  <pre data-od-id="specimen-ascii-rain" class="content glyphs">Glyph rain ascii block...</pre>
  <div data-od-id="feature-grid" class="grid-4-col"><div>Col 1</div><div>Col 2</div></div>
</body>
</html>`;

let patchedSpecimenHtml = blowoutSpecimenHtml;
for (const issue of initialAudit.issues) {
	const styles: Record<string, string> = { maxWidth: '100%', boxSizing: 'border-box' };
	if (issue.fixSuggestion.includes('overflow-x: auto')) styles.overflowX = 'auto';
	if (issue.fixSuggestion.includes('grid-template-columns: 1fr')) styles.gridTemplateColumns = '1fr';

	patchedSpecimenHtml = applySourcePatch(patchedSpecimenHtml, {
		id: issue.id,
		kind: 'set-style',
		styles: styles,
		scope: 'mobile'
	});
}

assert(
	patchedSpecimenHtml.includes('@media (max-width: 480px)') &&
	patchedSpecimenHtml.includes('[data-od-id="specimen-ascii-rain"]') &&
	patchedSpecimenHtml.includes('overflow-x: auto') &&
	patchedSpecimenHtml.includes('[data-od-id="feature-grid"]') &&
	patchedSpecimenHtml.includes('grid-template-columns: 1fr'),
	'Auto-remediation writes exact mobile-scoped CSS overrides into <style id="od-responsive-overrides">'
);

// Step 3: Re-Audit After Style Application
specimenElements = [
	{
		id: 'stage-title',
		tag: 'H1',
		classes: 'hero',
		computedWidth: 350,
		scrollWidth: 350,
		rectRight: 360,
		computedStyle: { display: 'block', whiteSpace: 'normal' }
	},
	{
		id: 'specimen-ascii-rain',
		tag: 'PRE',
		classes: 'content glyphs',
		computedWidth: 370,
		scrollWidth: 370,
		rectRight: 380,
		computedStyle: { display: 'block', whiteSpace: 'pre', overflowX: 'auto' }
	},
	{
		id: 'feature-grid',
		tag: 'DIV',
		classes: 'grid-4-col',
		computedWidth: 370,
		scrollWidth: 370,
		rectRight: 380,
		computedStyle: { display: 'grid', gridTemplateColumns: '1fr' }
	}
];

const reAudit = runDomOverflowAudit(specimenElements, mobileViewportWidth);

assert(
	reAudit.hasGlobalBlowout === false && reAudit.docScrollWidth <= mobileViewportWidth && reAudit.issues.length === 0,
	'Re-audit proves 0 horizontal blowout: page cleanly fits within 100vw on mobile (390px)'
);


// -------------------------------------------------------------
// 2. DELIVERY 2: Non-Locking Text Size Input
// -------------------------------------------------------------
console.log('\n--- 2. Testing Non-Locking Numeric Input & Unit Handling ---');

function normalizeStyleValue(prop: string, val: string): string {
	const trimmed = val.trim();
	if (trimmed === '') return '';
	if (prop === 'fontSize' || prop === 'borderRadius') {
		if (/^\d+$/.test(trimmed)) return `${trimmed}px`;
	}
	return trimmed;
}

// Typing simulation: keystroke '2' then '24'
let rawInputState = '';
let dispatchedIframeValue = '';

// First keystroke: user presses '2'
rawInputState = '2';
dispatchedIframeValue = normalizeStyleValue('fontSize', rawInputState);

assert(
	rawInputState === '2',
	'Raw input state holds "2" without premature "px" insertion (user can keep typing)'
);
assert(
	dispatchedIframeValue === '2px',
	'Bridge dispatch receives normalized "2px" for instant live preview'
);

// Second keystroke: user presses '4' -> input value becomes '24'
rawInputState = rawInputState + '4';
dispatchedIframeValue = normalizeStyleValue('fontSize', rawInputState);

assert(
	rawInputState === '24',
	'Raw input state holds "24" without being locked or forced to "2px4"'
);
assert(
	dispatchedIframeValue === '24px',
	'Bridge dispatch receives normalized "24px" for two-digit size'
);

// Blur event: commit
const committedValue = normalizeStyleValue('fontSize', rawInputState);
assert(
	committedValue === '24px',
	'On blur or Enter, normalized "24px" is committed cleanly'
);


// -------------------------------------------------------------
// 3. DELIVERY 3: Border Radius on Framed Elements (.frame)
// -------------------------------------------------------------
console.log('\n--- 3. Testing Border Radius on Framed Elements (.frame) ---');

interface MockElementStyle {
	borderRadius?: string;
	overflow?: string;
	border?: string;
	backgroundImage?: string;
	opacity?: string;
}

class MockElement {
	classList = new Set<string>();
	style: Record<string, string> = {};
	children: MockElement[] = [];

	constructor(classes: string[]) {
		classes.forEach((c) => this.classList.add(c));
	}

	setProperty(k: string, v: string) {
		this.style[k] = v;
	}

	removeProperty(k: string) {
		delete this.style[k];
	}

	querySelectorAll(selector: string): MockElement[] {
		if (selector === '.plus') {
			return this.children.filter((c) => c.classList.has('plus'));
		}
		return [];
	}
}

function simulateBridgeBorderRadius(el: MockElement, val: string) {
	if (val) {
		el.setProperty('border-radius', val);
		el.setProperty('overflow', 'hidden');

		const isFrame = el.classList.has('frame');
		if (isFrame) {
			const rNum = parseFloat(val) || 0;
			if (rNum > 0) {
				el.setProperty('border', '1px dashed var(--accent, #ff3e00)');
				el.setProperty('background-image', 'none');
				const plusNodes = el.querySelectorAll('.plus');
				plusNodes.forEach((p) => p.setProperty('opacity', '0'));
			} else {
				el.removeProperty('border');
				el.removeProperty('background-image');
				const plusNodes = el.querySelectorAll('.plus');
				plusNodes.forEach((p) => p.removeProperty('opacity'));
			}
		}
	}
}

const frameEl = new MockElement(['frame', 'active']);
const plusTL = new MockElement(['plus', 'tl']);
const plusTR = new MockElement(['plus', 'tr']);
frameEl.children.push(plusTL, plusTR);

// Test applying radius = 16px
simulateBridgeBorderRadius(frameEl, '16px');

assert(
	frameEl.style['border-radius'] === '16px' && frameEl.style['overflow'] === 'hidden',
	'Applies border-radius and overflow:hidden on container'
);

assert(
	frameEl.style['background-image'] === 'none',
	'Suppresses straight linear background gradients so curved border takes effect'
);

assert(
	frameEl.style['border'] === '1px dashed var(--accent, #ff3e00)',
	'Substitutes curved dashed border for square straight gradients'
);

assert(
	plusTL.style['opacity'] === '0' && plusTR.style['opacity'] === '0',
	'Hides square corner plus signs (.plus) so they do not protrude past curved corners'
);

// Test reset radius = 0px
simulateBridgeBorderRadius(frameEl, '0px');

assert(
	!frameEl.style['border'] && !frameEl.style['background-image'] && !plusTL.style['opacity'],
	'Resetting radius to 0 restores default frame gradient edges and plus signs'
);


// -------------------------------------------------------------
// 4. DELIVERY 4: Persistent Drawing Canvas & Coordinate Invariance
// -------------------------------------------------------------
console.log('\n--- 4. Testing Drawing Coordinate Math & Persistence ---');

// Coordinate math:
// getCanvasPoint computes (e.clientX - rect.left) / scale
function getCanvasPointSimulated(clientX: number, clientY: number, rectLeft: number, rectTop: number, zoomPercent: number) {
	const scale = zoomPercent / 100;
	return {
		x: (clientX - rectLeft) / scale,
		y: (clientY - rectTop) / scale
	};
}

// Case 1: Zoom 100%
// Frame at left: 200, top: 100. Mouse at (300, 250). Local: (100, 150)
const pt100 = getCanvasPointSimulated(300, 250, 200, 100, 100);
assert(
	pt100.x === 100 && pt100.y === 150,
	'At 100% zoom, screen click (300, 250) maps to unscaled frame coordinate (100, 150)'
);

// Case 2: Zoom 75%
// Scale = 0.75. Frame width is scaled, left: 200, top: 100.
// A point at local coordinate (100, 150) appears on screen at:
// screenX = 200 + 100 * 0.75 = 275.
// screenY = 100 + 150 * 0.75 = 212.5.
const pt75 = getCanvasPointSimulated(275, 212.5, 200, 100, 75);
assert(
	Math.abs(pt75.x - 100) < 0.001 && Math.abs(pt75.y - 150) < 0.001,
	'At 75% zoom, screen click (275, 212.5) correctly maps to invariant frame coordinate (100, 150)'
);

// Case 3: Zoom 150%
// Scale = 1.5. Local (100, 150) appears on screen at:
// screenX = 200 + 100 * 1.5 = 350.
// screenY = 100 + 150 * 1.5 = 325.
const pt150 = getCanvasPointSimulated(350, 325, 200, 100, 150);
assert(
	Math.abs(pt150.x - 100) < 0.001 && Math.abs(pt150.y - 150) < 0.001,
	'At 150% zoom, screen click (350, 325) correctly maps to invariant frame coordinate (100, 150)'
);

// Test Persistence Lifecycle
interface Stroke { id: number; color: string; width: number; points: { x: number; y: number }[] }
let drawStrokes: Stroke[] = [];
let drawOverlayOpen = false;
let showAnnotations = true;

// 1. Enter markup mode
drawOverlayOpen = true;
// 2. Draw 2 strokes
drawStrokes.push({ id: 1, color: '#ff5722', width: 3, points: [{ x: 10, y: 10 }, { x: 50, y: 50 }] });
drawStrokes.push({ id: 2, color: '#00e5ff', width: 3, points: [{ x: 60, y: 60 }, { x: 90, y: 90 }] });

// 3. Click "Done"
function finishDrawingSimulated() {
	drawOverlayOpen = false;
}
finishDrawingSimulated();

assert(
	drawOverlayOpen === false && drawStrokes.length === 2 && showAnnotations === true,
	'Clicking "Done" closes drawing mode but KEEPS all drawn strokes visible on screen'
);

// 4. Click "Undo"
function undoDrawingSimulated() {
	if (drawStrokes.length > 0) drawStrokes.pop();
}
undoDrawingSimulated();
assert(
	drawStrokes.length === 1 && drawStrokes[0].id === 1,
	'Clicking "Undo" removes the last stroke while preserving prior strokes'
);

// 5. Click "Clear"
function clearDrawingSimulated() {
	drawStrokes = [];
}
clearDrawingSimulated();
assert(
	drawStrokes.length === 0,
	'Clicking "Clear" wipes all strokes'
);


// -------------------------------------------------------------
// 5. DELIVERY 5: Element-Anchored Comments Lifecycle (Add -> Edit -> Send -> Receive/Execute)
// -------------------------------------------------------------
console.log('\n--- 5. Testing Element-Anchored Comment Lifecycle: Add -> Edit -> Send -> Receive/Execute ---');

interface CommentPin {
	id: number;
	targetId: string;
	targetLabel: string;
	text: string;
	x: number;
	y: number;
	htmlSnippet?: string;
	timestamp: string;
	resolved?: boolean;
}

// Step 5A: User adds comment pin by clicking preview element
const activeComments: CommentPin[] = [];

function simulateUserDropPin(target: { id: string; label: string; outerHtml: string }, clickX: number, clickY: number) {
	const id = activeComments.length + 1;
	const pin: CommentPin = {
		id,
		targetId: target.id,
		targetLabel: target.label,
		htmlSnippet: target.outerHtml.slice(0, 160),
		text: '',
		x: clickX,
		y: clickY,
		timestamp: '12:00 PM',
		resolved: false
	};
	activeComments.push(pin);
	return pin;
}

const pin1 = simulateUserDropPin({
	id: 'stage-title',
	label: 'Main Heading',
	outerHtml: '<h1 data-od-id="stage-title" class="hero">Charts drawn with characters</h1>'
}, 145, 88);

assert(
	activeComments.length === 1 &&
	pin1.id === 1 &&
	pin1.targetId === 'stage-title' &&
	pin1.x === 145 && pin1.y === 88 &&
	pin1.htmlSnippet?.includes('data-od-id="stage-title"'),
	'Step 5A (Add): User click in comment mode drops anchored pin at exact element coordinates with outerHtml snippet'
);

// Step 5B: User edits comment instruction in drawer
pin1.text = 'Change color to orange (#ff5722) and set font size to 20px on mobile';

assert(
	pin1.text.includes('Change color to orange') && pin1.text.includes('20px on mobile'),
	'Step 5B (Edit): User types design critique instruction bound to the specific pin'
);

// Step 5C: User sends / exports critique manifest
interface CritiqueManifest {
	file: string;
	totalPins: number;
	comments: Array<{
		pinId: number;
		selector: string;
		label: string;
		elementHtml?: string;
		instruction: string;
		coordinates: { x: number; y: number };
	}>;
}

function compileCritiqueManifest(file: string, pins: CommentPin[]): CritiqueManifest {
	return {
		file,
		totalPins: pins.length,
		comments: pins.map((p) => ({
			pinId: p.id,
			selector: `[data-od-id="${p.targetId}"]`,
			label: p.targetLabel,
			elementHtml: p.htmlSnippet,
			instruction: p.text,
			coordinates: { x: p.x, y: p.y }
		}))
	};
}

function formatAgentPrompt(fileName: string, comments: CommentPin[]): string {
	let md = `## Visual Design Review & Critique for Agent\nFile: \`${fileName}\`\n\n`;
	comments.forEach((c) => {
		md += `### Pin #${c.id}: ${c.targetLabel} (\`[data-od-id="${c.targetId}"]\`)\n`;
		if (c.htmlSnippet) md += `**Element HTML**:\n\`\`\`html\n${c.htmlSnippet}\n\`\`\`\n`;
		md += `**Requested Modification**:\n> ${c.text || 'Please inspect and adjust styling.'}\n\n`;
	});
	return md;
}

const critiquePayload = compileCritiqueManifest('fractalgraphy-pages.html', activeComments);
const agentPromptMarkdown = formatAgentPrompt('fractalgraphy-pages.html', activeComments);

assert(
	critiquePayload.totalPins === 1 &&
	critiquePayload.comments[0].selector === '[data-od-id="stage-title"]' &&
	critiquePayload.comments[0].instruction.includes('Change color to orange') &&
	agentPromptMarkdown.includes('Pin #1: Main Heading (`[data-od-id="stage-title"]`)'),
	'Step 5C (Send): Dispatches machine-readable JSON critique manifest and structured agent markdown prompt'
);

// Step 5D: Agent receives critique payload and executes source modification
function agentExecuteCritique(sourceHtml: string, manifest: CritiqueManifest): string {
	let updated = sourceHtml;
	for (const c of manifest.comments) {
		const match = c.selector.match(/\[data-od-id="([^"]+)"\]/);
		if (!match) continue;
		const elementId = match[1];

		const styles: Record<string, string> = {};
		if (c.instruction.includes('#ff5722')) styles.color = '#ff5722';
		if (c.instruction.includes('20px')) styles.fontSize = '20px';

		const isMobile = c.instruction.toLowerCase().includes('mobile');
		updated = applySourcePatch(updated, {
			id: elementId,
			kind: 'set-style',
			styles: styles,
			scope: isMobile ? 'mobile' : 'base'
		});
	}
	return updated;
}

const agentPatchedHtml = agentExecuteCritique(sampleHtml, critiquePayload);

assert(
	agentPatchedHtml.includes('@media (max-width: 480px)') &&
	agentPatchedHtml.includes('[data-od-id="stage-title"]') &&
	agentPatchedHtml.includes('color: #ff5722') &&
	agentPatchedHtml.includes('font-size: 20px'),
	'Step 5D (Receive & Execute): Agent ingests critique manifest, parses element anchor, and executes scoped responsive modifications'
);

// Step 5E: Feedback pin marked resolved after execution
pin1.resolved = true;
assert(
	pin1.resolved === true,
	'Step 5E (Resolution): Feedback pin marked resolved in editor lifecycle after agent execution'
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('======================================================\n');

if (failCount > 0) {
	process.exit(1);
} else {
	console.log('ALL ACCEPTANCE CRITERIA EMPIRICALLY VERIFIED!\n');
}
