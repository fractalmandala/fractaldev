
export type EditorMode = 'preview' | 'code';
export type ActiveTool = 'none' | 'select' | 'edit' | 'comment' | 'mark';
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type BreakpointScope = 'base' | 'mobile' | 'tablet';

export interface ElementRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DrawPoint {
	x: number;
	y: number;
}

export interface DrawStroke {
	id: number;
	color: string;
	width: number;
	points: DrawPoint[];
}

export interface AnchoredComment {
	id: number;
	targetId: string;
	targetLabel: string;
	text: string;
	x: number;
	y: number;
	htmlSnippet?: string;
	timestamp: string;
}

export interface ResponsiveAuditIssue {
	elementId: string;
	label: string;
	tagName?: string;
	issue: string;
	fixSuggestion?: string;
	currentWidth: number;
	parentWidth: number;
}

export interface ManualEditStyles {
	color?: string;
	backgroundColor?: string;
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: string;
	lineHeight?: string;
	letterSpacing?: string;
	borderRadius?: string;
	borderColor?: string;
	borderWidth?: string;
	borderStyle?: string;
	width?: string;
	height?: string;
	paddingTop?: string;
	paddingRight?: string;
	paddingBottom?: string;
	paddingLeft?: string;
	marginTop?: string;
	marginRight?: string;
	marginBottom?: string;
	marginLeft?: string;
	flexDirection?: string;
	justifyContent?: string;
	alignItems?: string;
	gap?: string;
	textAlign?: string;
	opacity?: string;
	transform?: string;
}

export interface ManualEditTarget {
	id: string;
	label: string;
	tagName: string;
	className: string;
	text: string;
	rect: ElementRect;
	attributes: Record<string, string>;
	styles: ManualEditStyles;
	outerHtml: string;
	isLayoutContainer: boolean;
}

export type HostToIframeMessage =
	| { type: 'od-edit-mode'; enabled: boolean }
	| { type: 'od-active-tool'; tool: ActiveTool }
	| { type: 'od-edit-selected-target'; id: string | null }
	| { type: 'od-edit-preview-style'; id: string; styles: Partial<ManualEditStyles>; scope?: BreakpointScope }
	| { type: 'od-edit-preview-text'; id: string; value: string }
	| { type: 'od-edit-hover-reset' }
	| { type: 'od-screenshot-request' }
	| { type: 'od-overflow-audit-request' }
	| { type: 'od-update-theme-tokens'; tokens: Record<string, string> };

export type IframeToHostMessage =
	| { type: 'od-edit-ready' }
	| { type: 'od-edit-select'; target: ManualEditTarget }
	| { type: 'od-edit-inspect-select'; target: ManualEditTarget }
	| { type: 'od-edit-background' }
	| { type: 'od-edit-drag-commit'; id: string; transform: string }
	| { type: 'od-edit-text-commit'; id: string; text: string }
	| { type: 'od-screenshot-response'; dataUrl: string; error?: string }
	| {
			type: 'od-overflow-audit-response';
			hasGlobalBlowout: boolean;
			viewportWidth: number;
			docScrollWidth: number;
			issues: ResponsiveAuditIssue[];
		}
	| { type: 'od-comment-drop'; target: ManualEditTarget; x: number; y: number }
	| { type: 'od-theme-tokens-updated'; tokens: Record<string, string> };

