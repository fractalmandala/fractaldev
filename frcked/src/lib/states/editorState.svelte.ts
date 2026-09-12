import type {
	EditorMode,
	ActiveTool,
	ViewportMode,
	BreakpointScope,
	ManualEditTarget,
	ManualEditStyles,
	DrawStroke,
	AnchoredComment,
	ResponsiveAuditIssue
} from './editorTypes';

export function normalizeStyleValue(prop: string, val: string): string {
	const trimmed = val.trim();
	if (!trimmed) return '';
	const lengthProps = [
		'fontSize', 'borderRadius', 'borderWidth', 'width', 'height',
		'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
		'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
		'gap', 'letterSpacing'
	];
	if (lengthProps.includes(prop) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
		return `${trimmed}px`;
	}
	return trimmed;
}

export class EditorState {
	// View & Environment State
	mode = $state<EditorMode>('preview');
	activeTool = $state<ActiveTool>('none');
	viewport = $state<ViewportMode>('desktop');
	zoom = $state<number>(100);
	breakpointScope = $state<BreakpointScope>('base');

	// Selection & Inspector State
	selectedTarget = $state<ManualEditTarget | null>(null);
	panelPosition = $state<{ left: number; top: number } | null>(null);
	isLocked = $state<boolean>(false);
	htmlDraft = $state<string>('');
	styleDraft = $state<ManualEditStyles>({});
	isDirty = $state<boolean>(false);

	// Overlays & Secondary Tools
	drawOverlayOpen = $state<boolean>(false);
	showAnnotations = $state<boolean>(true);
	drawStrokes = $state<DrawStroke[]>([]);

	commentsDrawerOpen = $state<boolean>(false);
	anchoredComments = $state<AnchoredComment[]>([]);
	activeCommentId = $state<number | null>(null);
	commentCount = $derived(this.anchoredComments.length);

	responsiveIssues = $state<ResponsiveAuditIssue[]>([]);
	hasGlobalBlowout = $state<boolean>(false);
	viewportWidth = $state<number>(0);
	docScrollWidth = $state<number>(0);

	// History Stacks
	undoStack = $state<string[]>([]);
	redoStack = $state<string[]>([]);

	// Derived Getters
	canUndo = $derived(this.undoStack.length > 0);
	canRedo = $derived(this.redoStack.length > 0);

	targetTitle = $derived.by(() => {
		if (!this.selectedTarget) return '';
		const raw = this.selectedTarget.label || this.selectedTarget.tagName;
		return raw.charAt(0).toUpperCase() + raw.slice(1);
	});

	selectTarget(target: ManualEditTarget) {
		this.selectedTarget = target;
		this.htmlDraft = target.outerHtml;
		this.styleDraft = { ...target.styles };
		this.isDirty = false;

		// Calculate initial popover position next to the target if not locked
		if (!this.isLocked && typeof window !== 'undefined') {
			const panelWidth = 360;
			const defaultLeft = Math.min(window.innerWidth - panelWidth - 24, target.rect.x + target.rect.width + 20);
			const defaultTop = Math.max(80, Math.min(window.innerHeight - 450, target.rect.y));

			this.panelPosition = {
				left: Math.max(20, defaultLeft),
				top: defaultTop
			};
		}
	}

	clearSelection() {
		this.selectedTarget = null;
		this.isDirty = false;
	}

	updateStyle(
		prop: keyof ManualEditStyles,
		value: string,
		postMessageFn?: (msg: unknown) => void
	) {
		this.styleDraft[prop] = value;
		this.isDirty = true;

		if (this.selectedTarget && postMessageFn) {
			const normalized = normalizeStyleValue(String(prop), value);
			postMessageFn({
				type: 'od-edit-preview-style',
				id: this.selectedTarget.id,
				styles: { [prop]: normalized },
				scope: this.breakpointScope
			});
		}
	}

	updateStyleRaw(prop: keyof ManualEditStyles, value: string) {
		// Only store raw text in draft; do NOT normalize or dispatch preview until Enter
		this.styleDraft[prop] = value;
		this.isDirty = true;
	}

	commitStyleOnEnter(
		prop: keyof ManualEditStyles,
		postMessageFn?: (msg: unknown) => void
	) {
		const current = this.styleDraft[prop];
		if (current !== undefined && current.trim() !== '') {
			const normalized = normalizeStyleValue(String(prop), current);
			this.styleDraft = { ...this.styleDraft, [prop]: normalized };
			if (this.selectedTarget && postMessageFn) {
				postMessageFn({
					type: 'od-edit-preview-style',
					id: this.selectedTarget.id,
					styles: { [prop]: normalized },
					scope: this.breakpointScope
				});
			}
		}
	}

	commitStyleOnBlur(
		prop: keyof ManualEditStyles,
		postMessageFn?: (msg: unknown) => void
	) {
		// No-op for numeric inputs to preserve idle non-computation
	}

	updateOuterHtml(html: string) {
		this.htmlDraft = html;
		this.isDirty = true;
	}
}
