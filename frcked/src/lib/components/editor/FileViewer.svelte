<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import '$lib/styles/editor.sass';
	import { EditorState } from './EditorState.svelte';
	import ManualEditPanel from './ManualEditPanel.svelte';
	import { createEditBridgeScript } from './bridge';
	import { applySourcePatch } from './source-patches';
	import type { IframeToHostMessage, ViewportMode, DrawStroke } from './types';
	import type { Scheme } from '$lib/demos/scheme-types';

	let {
		source = $bindable(''),
		fileName = 'index.html',
		schemes = [],
		selectedSchemeId = 'default',
		onSelectScheme,
		onFileChange,
		onCritiqueSubmit
	}: {
		source: string;
		fileName?: string;
		schemes?: Scheme[];
		selectedSchemeId?: string;
		onSelectScheme?: (schemeId: string) => void;
		onFileChange?: (newSource: string) => void;
		onCritiqueSubmit?: (critique: { fileName: string; comments: typeof editor.anchoredComments; markdown: string }) => void;
	} = $props();

	const editor = new EditorState();
	setContext('EDITOR_STATE', editor);

	let iframeRef: HTMLIFrameElement | null = $state(null);
	let drawCanvasRef: HTMLCanvasElement | null = $state(null);
	let isDrawing = $state(false);
	let currentStroke: DrawStroke | null = $state(null);
	let drawColor = $state('#ff5722');
	let drawWidth = $state(3);
	let newCommentDraft = $state('');

	// Screenshot toast state
	let screenshotToast = $state<{
		visible: boolean;
		dataUrl: string;
		copied: boolean;
	} | null>(null);

	// Reactive theme palette state for live editing
	let currentThemeColors = $state<Record<string, string>>({
		primary: '#3b82f6',
		accent: '#f59e0b',
		surface: '#141418',
		background: '#0a0a0c'
	});

	$effect(() => {
		if (selectedSchemeId && selectedSchemeId !== 'default' && schemes) {
			const s = schemes.find((item) => item.id === selectedSchemeId);
			if (s && s.roles) {
				currentThemeColors = {
					primary: s.roles.primary || '#3b82f6',
					accent: s.roles.accent || s.roles.tertiary || s.roles.primary || '#f59e0b',
					surface: s.roles.surface || '#141418',
					background: s.roles.background || '#0a0a0c'
				};
			}
		}
	});

	function updateThemeColor(role: string, val: string) {
		currentThemeColors = { ...currentThemeColors, [role]: val };
		postToFrame({
			type: 'od-update-theme-tokens',
			tokens: { [role]: val }
		});
	}

	// General toast message
	let notificationToast = $state<string | null>(null);

	function showToast(msg: string) {
		notificationToast = msg;
		setTimeout(() => {
			if (notificationToast === msg) notificationToast = null;
		}, 3000);
	}

	// Injects bridge.ts into HTML srcdoc
	const wrappedSrcDoc = $derived.by(() => {
		const bridgeScript = createEditBridgeScript();
		if (!source) return '';
		if (source.includes('<head>')) {
			return source.replace('<head>', `<head>\n${bridgeScript}`);
		}
		if (source.includes('</body>')) {
			return source.replace('</body>', `${bridgeScript}\n</body>`);
		}
		return `${bridgeScript}\n${source}`;
	});

	function postToFrame(msg: unknown) {
		iframeRef?.contentWindow?.postMessage(msg, '*');
	}

	function handleWindowMessage(e: MessageEvent) {
		const data = e.data as IframeToHostMessage;
		if (!data || !data.type) return;

		switch (data.type) {
			case 'od-edit-ready':
				postToFrame({
					type: 'od-edit-mode',
					enabled: editor.activeTool === 'edit'
				});
				postToFrame({
					type: 'od-active-tool',
					tool: editor.activeTool
				});
				if (editor.selectedTarget) {
					postToFrame({
						type: 'od-edit-selected-target',
						id: editor.selectedTarget.id
					});
				}
				break;
			case 'od-edit-select':
				editor.selectTarget(data.target);
				break;
			case 'od-edit-background':
				editor.clearSelection();
				break;
			case 'od-screenshot-response':
				if (data.dataUrl) {
					handleScreenshotPayload(data.dataUrl);
				} else if (data.error) {
					showToast('❌ Screenshot failed: ' + data.error);
				}
				break;
			case 'od-comment-drop':
				handleCommentDrop(data.target, data.x, data.y);
				break;
			case 'od-overflow-audit-response':
				editor.responsiveIssues = data.issues || [];
				editor.hasGlobalBlowout = !!data.hasGlobalBlowout;
				editor.viewportWidth = data.viewportWidth || 0;
				editor.docScrollWidth = data.docScrollWidth || 0;
				break;
			case 'od-theme-tokens-updated':
				if (data.tokens) {
					currentThemeColors = { ...currentThemeColors, ...data.tokens };
				}
				break;
		}
	}

	async function handleScreenshotPayload(dataUrl: string) {
		let finalDataUrl = dataUrl;
		if (drawCanvasRef && editor.showAnnotations && editor.drawStrokes.length > 0) {
			try {
				const img = new Image();
				await new Promise((res, rej) => {
					img.onload = res;
					img.onerror = rej;
					img.src = dataUrl;
				});
				const composite = document.createElement('canvas');
				composite.width = img.width;
				composite.height = img.height;
				const cCtx = composite.getContext('2d');
				if (cCtx) {
					cCtx.drawImage(img, 0, 0);
					cCtx.drawImage(drawCanvasRef, 0, 0, composite.width, composite.height);
					finalDataUrl = composite.toDataURL('image/png');
				}
			} catch (err) {
				console.warn('Screenshot annotation overlay warning:', err);
			}
		}

		let copied = false;
		try {
			if (navigator.clipboard && window.ClipboardItem) {
				const parts = finalDataUrl.split(',');
				const byteString = atob(parts[1]);
				const mimeMatch = parts[0].match(/:(.*?);/);
				const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
				const ab = new ArrayBuffer(byteString.length);
				const ia = new Uint8Array(ab);
				for (let i = 0; i < byteString.length; i++) {
					ia[i] = byteString.charCodeAt(i);
				}
				const blob = new Blob([ab], { type: mimeType });
				await navigator.clipboard.write([
					new ClipboardItem({ [mimeType]: blob })
				]);
				copied = true;
			}
		} catch (err) {
			console.warn('Clipboard write warning:', err);
		}

		screenshotToast = {
			visible: true,
			dataUrl: finalDataUrl,
			copied
		};
	}

	function downloadScreenshot(dataUrl: string) {
		const a = document.createElement('a');
		a.href = dataUrl;
		a.download = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
		a.click();
	}

	function handleCommentDrop(target: unknown, x: number, y: number) {
		const typed = target as { id: string; label: string; outerHtml?: string } | null;
		const id = editor.anchoredComments.length + 1;
		const targetId = typed?.id || 'canvas';
		const targetLabel = typed?.label || 'Page Canvas';
		const htmlSnippet = typed?.outerHtml ? typed.outerHtml.slice(0, 160) : '';

		editor.anchoredComments.push({
			id,
			targetId,
			targetLabel,
			text: '',
			x,
			y,
			htmlSnippet,
			timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		});
		editor.activeCommentId = id;
		editor.commentsDrawerOpen = true;
	}

	function copyAgentPrompt() {
		if (editor.anchoredComments.length === 0) return;
		let md = `## Visual Design Review & Critique for Agent\nFile: \`${fileName}\`\n\n`;
		editor.anchoredComments.forEach((c) => {
			md += `### Pin #${c.id}: ${c.targetLabel} (\`[data-od-id="${c.targetId}"]\`)\n`;
			if (c.htmlSnippet) md += `**Element HTML**:\n\`\`\`html\n${c.htmlSnippet}\n\`\`\`\n`;
			md += `**Requested Modification**:\n> ${c.text || 'Please inspect and adjust styling.'}\n\n`;
		});
		if (navigator.clipboard) {
			navigator.clipboard.writeText(md);
			showToast('✓ Agent critique prompt copied to clipboard!');
		}
		if (onCritiqueSubmit) {
			onCritiqueSubmit({ fileName, comments: editor.anchoredComments, markdown: md });
		}
	}

	function exportCritiqueManifest() {
		if (editor.anchoredComments.length === 0) return;
		const payload = {
			file: fileName,
			timestamp: new Date().toISOString(),
			totalPins: editor.anchoredComments.length,
			comments: editor.anchoredComments.map((c) => ({
				pinId: c.id,
				selector: `[data-od-id="${c.targetId}"]`,
				label: c.targetLabel,
				elementHtml: c.htmlSnippet,
				instruction: c.text,
				coordinates: { x: c.x, y: c.y }
			}))
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${fileName.replace(/\.[^/.]+$/, '')}.critique.json`;
		a.click();
		URL.revokeObjectURL(url);
		showToast('✓ Saved critique manifest JSON');
	}

	function promptAgentForResponsiveFix() {
		if (editor.responsiveIssues.length === 0) return;
		let md = `## Responsive Layout Fix Request for Agent\nViewport: \`${editor.viewport}\` (${editor.viewport === 'mobile' ? '390px' : '768px'})\nFile: \`${fileName}\`\n\n`;
		md += `The following elements overflow the horizontal viewport bounds and cause unintended horizontal scrolling:\n`;
		editor.responsiveIssues.forEach((issue) => {
			md += `- Element \`[data-od-id="${issue.elementId}"]\` (${issue.label}): ${issue.issue}\n`;
		});
		md += `\nPlease add dedicated \`@media (max-width: ${editor.viewport === 'mobile' ? '480px' : '768px'})\` CSS rules to fix widths, wrapping, and padding so the layout renders cleanly without horizontal scroll.`;

		if (navigator.clipboard) {
			navigator.clipboard.writeText(md);
			showToast('✓ Responsive layout task copied for agent!');
		}
	}

	function autoFixResponsiveBlowout() {
		if (editor.responsiveIssues.length === 0) return;
		let updated = source;
		const scope = editor.viewport === 'desktop' ? 'base' : (editor.viewport as 'mobile' | 'tablet');

		for (const issue of editor.responsiveIssues) {
			const stylesToApply: Record<string, string> = {
				maxWidth: '100%',
				boxSizing: 'border-box'
			};
			if (issue.fixSuggestion && issue.fixSuggestion.includes('overflow-x')) {
				stylesToApply.overflowX = 'auto';
			}
			if (issue.fixSuggestion && issue.fixSuggestion.includes('grid-template-columns')) {
				stylesToApply.gridTemplateColumns = '1fr';
			}
			if (issue.fixSuggestion && issue.fixSuggestion.includes('white-space')) {
				stylesToApply.whiteSpace = 'normal';
			}

			updated = applySourcePatch(updated, {
				id: issue.elementId,
				kind: 'set-style',
				styles: stylesToApply,
				scope: scope
			});
		}

		source = updated;
		onFileChange?.(updated);
		showToast(`⚡ Applied responsive constraints for ${scope}! Verifying layout...`);

		// Re-trigger audit after DOM update
		setTimeout(() => {
			postToFrame({ type: 'od-overflow-audit-request' });
		}, 300);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (editor.selectedTarget) {
				editor.clearSelection();
				postToFrame({ type: 'od-edit-selected-target', id: null });
			} else if (editor.activeTool !== 'none') {
				toggleTool(editor.activeTool as any);
			}
		}
	}

	onMount(() => {
		window.addEventListener('message', handleWindowMessage);
		window.addEventListener('resize', syncCanvasSize);
		window.addEventListener('keydown', handleKeydown);
		setTimeout(syncCanvasSize, 300);

		return () => {
			window.removeEventListener('message', handleWindowMessage);
			window.removeEventListener('resize', syncCanvasSize);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	function setViewport(vp: ViewportMode) {
		editor.viewport = vp;
		editor.breakpointScope = vp === 'desktop' ? 'base' : vp;
		setTimeout(() => {
			syncCanvasSize();
			postToFrame({ type: 'od-overflow-audit-request' });
		}, 250);
	}

	function handleSaveDraft() {
		if (!editor.selectedTarget) return;

		let updated = source;
		// 1. If HTML was modified
		if (editor.htmlDraft && editor.htmlDraft !== editor.selectedTarget.outerHtml) {
			updated = applySourcePatch(updated, {
				id: editor.selectedTarget.id,
				kind: 'set-outer-html',
				html: editor.htmlDraft
			});
		}

		// 2. If Styles were modified
		if (editor.styleDraft && Object.keys(editor.styleDraft).length > 0) {
			updated = applySourcePatch(updated, {
				id: editor.selectedTarget.id,
				kind: 'set-style',
				styles: editor.styleDraft,
				scope: editor.breakpointScope
			});
		}

		source = updated;
		onFileChange?.(updated);
		editor.clearSelection();
		showToast(`✓ Changes saved to source (${editor.breakpointScope})`);
	}

	function handleDeleteTarget() {
		if (!editor.selectedTarget) return;
		const updated = applySourcePatch(source, {
			id: editor.selectedTarget.id,
			kind: 'delete'
		});
		source = updated;
		onFileChange?.(updated);
		editor.clearSelection();
		showToast('✓ Element deleted');
	}

	// 1. Screenshot capture tool
	function handleCaptureScreenshot() {
		// Stage flash effect
		const stage = document.querySelector('.preview-stage') as HTMLElement;
		if (stage) {
			stage.style.filter = 'brightness(1.6)';
			setTimeout(() => {
				stage.style.filter = 'none';
			}, 150);
		}
		postToFrame({ type: 'od-screenshot-request' });
	}

	// 2. Persistent Drawing canvas methods
	function getCanvasPoint(e: MouseEvent | PointerEvent): { x: number; y: number } {
		if (!drawCanvasRef) return { x: 0, y: 0 };
		const rect = drawCanvasRef.getBoundingClientRect();
		const scale = (editor.zoom || 100) / 100;
		return {
			x: (e.clientX - rect.left) / scale,
			y: (e.clientY - rect.top) / scale
		};
	}

	function syncCanvasSize() {
		if (!drawCanvasRef) return;
		const dpr = window.devicePixelRatio || 1;
		const w = drawCanvasRef.clientWidth;
		const h = drawCanvasRef.clientHeight;
		if (w === 0 || h === 0) return;
		drawCanvasRef.width = Math.round(w * dpr);
		drawCanvasRef.height = Math.round(h * dpr);
		redrawStrokes();
	}

	function redrawStrokes() {
		if (!drawCanvasRef) return;
		const ctx = drawCanvasRef.getContext('2d');
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, drawCanvasRef.width, drawCanvasRef.height);
		ctx.scale(dpr, dpr);

		if (editor.showAnnotations) {
			for (const s of editor.drawStrokes) {
				if (s.points.length < 2) continue;
				ctx.strokeStyle = s.color;
				ctx.lineWidth = s.width;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.moveTo(s.points[0].x, s.points[0].y);
				for (let i = 1; i < s.points.length; i++) {
					ctx.lineTo(s.points[i].x, s.points[i].y);
				}
				ctx.stroke();
			}
		}
		ctx.restore();
	}

	function startFreehandDraw(e: PointerEvent) {
		if (!editor.drawOverlayOpen || !drawCanvasRef) return;
		isDrawing = true;
		const pt = getCanvasPoint(e);
		currentStroke = {
			id: Date.now(),
			color: drawColor,
			width: drawWidth,
			points: [pt]
		};
		window.addEventListener('pointermove', onFreehandMove);
		window.addEventListener('pointerup', stopFreehandDraw);
	}

	function onFreehandMove(e: PointerEvent) {
		if (!isDrawing || !currentStroke || !drawCanvasRef) return;
		const pt = getCanvasPoint(e);
		currentStroke.points.push(pt);

		const ctx = drawCanvasRef.getContext('2d');
		if (ctx) {
			const dpr = window.devicePixelRatio || 1;
			ctx.save();
			ctx.scale(dpr, dpr);
			ctx.strokeStyle = currentStroke.color;
			ctx.lineWidth = currentStroke.width;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			const prev = currentStroke.points[currentStroke.points.length - 2];
			ctx.beginPath();
			ctx.moveTo(prev.x, prev.y);
			ctx.lineTo(pt.x, pt.y);
			ctx.stroke();
			ctx.restore();
		}
	}

	function stopFreehandDraw() {
		if (!isDrawing) return;
		if (currentStroke && currentStroke.points.length > 1) {
			editor.drawStrokes.push(currentStroke);
		}
		isDrawing = false;
		currentStroke = null;
		window.removeEventListener('pointermove', onFreehandMove);
		window.removeEventListener('pointerup', stopFreehandDraw);
		redrawStrokes();
	}

	function clearDrawing() {
		editor.drawStrokes = [];
		redrawStrokes();
	}

	function undoDrawing() {
		if (editor.drawStrokes.length > 0) {
			editor.drawStrokes.pop();
			redrawStrokes();
		}
	}

	function finishDrawing() {
		editor.drawOverlayOpen = false;
		if (editor.activeTool === 'mark') editor.activeTool = 'none';
		redrawStrokes();
	}

	function toggleTool(tool: 'select' | 'edit' | 'mark' | 'comment') {
		if (editor.activeTool === tool) {
			editor.activeTool = 'none';
			editor.clearSelection();
		} else {
			editor.activeTool = tool;
		}

		if (editor.activeTool === 'mark') {
			editor.drawOverlayOpen = true;
			setTimeout(syncCanvasSize, 50);
		} else {
			editor.drawOverlayOpen = false;
		}

		if (editor.activeTool === 'comment') {
			editor.commentsDrawerOpen = true;
		} else {
			editor.commentsDrawerOpen = false;
		}

		postToFrame({
			type: 'od-edit-mode',
			enabled: editor.activeTool === 'edit' || editor.activeTool === 'select'
		});
		postToFrame({
			type: 'od-active-tool',
			tool: editor.activeTool
		});
	}

	// Zoom cycle
	function cycleZoom() {
		const levels = [75, 100, 125, 150];
		const currentIdx = levels.indexOf(editor.zoom);
		const nextIdx = (currentIdx + 1) % levels.length;
		editor.zoom = levels[nextIdx] ?? 100;
		setTimeout(syncCanvasSize, 150);
	}
</script>

<div class="file-viewer">
	<!-- Top Navigation Toolbar -->
	<header class="viewer-toolbar">
		<div class="toolbar-left">
			<button
				type="button"
				class="viewer-btn icon-only reload-btn"
				onclick={() => {
					if (iframeRef) {
						iframeRef.srcdoc = wrappedSrcDoc;
					}
				}}
				title="Reload preview"
				aria-label="Reload preview"
			>
				⟳
			</button>

			{#if schemes && schemes.length > 0}
				<div class="specimen-select-wrapper" title="Switch design system specimen">
					<span class="specimen-select-icon" aria-hidden="true">✦</span>
					<select
						id="specimen-select"
						class="specimen-select-dropdown"
						value={selectedSchemeId}
						onchange={(e) => onSelectScheme?.((e.currentTarget as HTMLSelectElement).value)}
						aria-label="Select design specimen"
					>
						<option value="default">Default: Fractalgraphy</option>
						<optgroup label="Design Systems ({schemes.length})">
							{#each schemes as s}
								<option value={s.id}>{s.name}</option>
							{/each}
						</optgroup>
					</select>
				</div>

				{#if selectedSchemeId !== 'default'}
					<div class="toolbar-theme-strip" role="group" aria-label="Live theme color pickers">
						{#each [
							{ role: 'primary', label: 'Primary' },
							{ role: 'accent', label: 'Accent' },
							{ role: 'surface', label: 'Surface' },
							{ role: 'background', label: 'Background' }
						] as item}
							<label class="theme-chip-btn" title="Edit {item.label} color: {currentThemeColors[item.role] || ''}">
								<input
									type="color"
									class="theme-chip-input"
									value={currentThemeColors[item.role] || '#888888'}
									oninput={(e) => updateThemeColor(item.role, (e.currentTarget as HTMLInputElement).value)}
									aria-label="Edit {item.label} color"
								/>
								<span
									class="theme-chip-dot"
									style="background-color: {currentThemeColors[item.role] || '#888888'};"
								></span>
								<span class="theme-chip-label">{item.label}</span>
							</label>
						{/each}
					</div>
				{/if}

				<span class="toolbar-divider" aria-hidden="true"></span>
			{/if}

			<!-- Preview / Code Mode Tabs (Image 3) -->
			<div class="viewer-tabs" role="tablist" aria-label="View Mode">
				<button
					type="button"
					role="tab"
					class="viewer-tab {editor.mode === 'preview' ? 'active' : ''}"
					aria-selected={editor.mode === 'preview'}
					onclick={() => (editor.mode = 'preview')}
				>
					<span class="tab-icon" aria-hidden="true">👁</span>
					<span class="tab-label">Preview</span>
				</button>
				<button
					type="button"
					role="tab"
					class="viewer-tab {editor.mode === 'code' ? 'active' : ''}"
					aria-selected={editor.mode === 'code'}
					onclick={() => (editor.mode = 'code')}
				>
					<span class="tab-icon" aria-hidden="true">&lt;/&gt;</span>
					<span class="tab-label">Code</span>
				</button>
			</div>

			<span class="toolbar-divider" aria-hidden="true"></span>

			<!-- Dedicated Desktop / Mobile Viewport Toggles -->
			<div class="device-toggle-pill" role="group" aria-label="Device Viewport">
				<button
					type="button"
					class="device-btn {editor.viewport === 'desktop' ? 'active' : ''}"
					onclick={() => setViewport('desktop')}
					title="Desktop view"
				>
					🖥️ Desktop
				</button>
				<button
					type="button"
					class="device-btn {editor.viewport === 'mobile' ? 'active' : ''}"
					onclick={() => setViewport('mobile')}
					title="Mobile view (390px)"
				>
					📱 Mobile
				</button>
				<button
					type="button"
					class="device-btn {editor.viewport === 'tablet' ? 'active' : ''}"
					onclick={() => setViewport('tablet')}
					title="Tablet view (768px)"
				>
					💻 Tablet
				</button>
			</div>
		</div>

		<div class="toolbar-right">
			<!-- 1. Screenshot Button -->
			<button
				type="button"
				class="viewer-action-btn"
				onclick={handleCaptureScreenshot}
				title="Capture real snapshot & copy to clipboard"
				aria-label="Screenshot"
			>
				📷
			</button>

			<!-- 2. Inspect / Select Mode Button -->
			<button
				type="button"
				class="viewer-action-btn {editor.activeTool === 'select' ? 'active' : ''}"
				onclick={() => toggleTool('select')}
				title="Inspect element (Box selection)"
				aria-label="Inspect tool"
			>
				⬚
			</button>

			<!-- 3. Draw / Mark Tool (Yellow Pencil) -->
			<button
				type="button"
				class="viewer-action-btn draw-btn {editor.drawOverlayOpen ? 'active' : ''}"
				onclick={() => toggleTool('mark')}
				title="Draw freehand markup annotations"
				aria-label="Draw markup"
			>
				✏️
			</button>

			<!-- Annotation Layer Visibility Toggle -->
			{#if editor.drawStrokes.length > 0}
				<button
					type="button"
					class="viewer-action-btn stroke-vis-btn {editor.showAnnotations ? 'active' : ''}"
					onclick={() => {
						editor.showAnnotations = !editor.showAnnotations;
						redrawStrokes();
					}}
					title={editor.showAnnotations ? 'Hide drawings' : 'Show drawings'}
				>
					{editor.showAnnotations ? '👁️' : '🙈'}
				</button>
			{/if}

			<span class="toolbar-divider" aria-hidden="true"></span>

			<!-- 4. Visual Edit Mode (Edit Pencil) -->
			<button
				type="button"
				class="viewer-action-btn edit-mode-btn {editor.activeTool === 'edit' ? 'active' : ''}"
				onclick={() => toggleTool('edit')}
				title="Toggle visual editing mode"
				aria-label="Edit mode"
				aria-pressed={editor.activeTool === 'edit'}
			>
				✎
			</button>

			<span class="toolbar-divider" aria-hidden="true"></span>

			<!-- 5. Comments Counter Pill -->
			<button
				type="button"
				class="viewer-comment-btn {editor.commentsDrawerOpen || editor.activeTool === 'comment' ? 'active' : ''}"
				onclick={() => toggleTool('comment')}
				title="View comments & drop feedback pins"
				aria-label="Comments ({editor.commentCount})"
			>
				<span class="comment-icon" aria-hidden="true">💬</span>
				<span class="comment-badge">{editor.commentCount}</span>
			</button>

			<!-- 6. Zoom Level Indicator (Clickable cycle) -->
			<button
				type="button"
				class="zoom-indicator-btn"
				onclick={cycleZoom}
				title="Cycle zoom (75%, 100%, 125%, 150%)"
			>
				<span>{editor.zoom}%</span>
			</button>
		</div>
	</header>

	<!-- Responsive Layout Audit Banner (shown if overflow detected or verified pass on mobile/tablet) -->
	{#if editor.viewport !== 'desktop'}
		{#if editor.responsiveIssues.length > 0}
			<div class="responsive-audit-banner" role="alert">
				<div class="audit-left">
					<span class="audit-icon">⚠️</span>
					<span class="audit-text">
						<strong>Responsive blowout on {editor.viewport}:</strong>
						{#if editor.hasGlobalBlowout}
							Content scroll width ({editor.docScrollWidth}px) exceeds {editor.viewport} viewport ({editor.viewportWidth}px) by +{editor.docScrollWidth - editor.viewportWidth}px!
						{:else}
							{editor.responsiveIssues.length} element{editor.responsiveIssues.length > 1 ? 's' : ''} overflowing horizontal bounds.
						{/if}
					</span>
				</div>
				<div class="audit-actions">
					<button
						type="button"
						class="audit-action-btn primary-fix-btn"
						onclick={autoFixResponsiveBlowout}
						title="Automatically apply max-width & overflow constraints for this breakpoint"
					>
						⚡ Auto-Fix Blowout
					</button>
					<button
						type="button"
						class="audit-action-btn secondary-btn"
						onclick={promptAgentForResponsiveFix}
						title="Copy structured fix task for AI agent"
					>
						📋 Copy Fix Spec
					</button>
				</div>
			</div>
		{:else if editor.viewportWidth > 0 && !editor.hasGlobalBlowout}
			<div class="responsive-audit-banner audit-pass" role="status">
				<div class="audit-left">
					<span class="audit-icon">✓</span>
					<span class="audit-text">
						<strong>Responsive check passed:</strong> 0 horizontal overflow detected on {editor.viewport} ({editor.viewportWidth}px).
					</span>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Main Stage / Canvas Area -->
	<main class="viewer-body">
		{#if editor.mode === 'preview'}
			<div class="preview-stage">
				<div
					class="viewport-frame viewport-{editor.viewport}"
					style="transform: scale({editor.zoom / 100}); transform-origin: top center;"
				>
					<iframe
						bind:this={iframeRef}
						title={fileName}
						srcdoc={wrappedSrcDoc}
						sandbox="allow-scripts allow-downloads allow-same-origin allow-modals"
						class="preview-iframe"
					></iframe>

					<!-- Persistent Freehand Drawing Layer (Never destroyed on 'Done') -->
					<canvas
						bind:this={drawCanvasRef}
						class="persistent-draw-canvas {editor.drawOverlayOpen ? 'drawing-active' : ''}"
						onpointerdown={startFreehandDraw}
					></canvas>

					<!-- Dropped Comment Pins -->
					{#each editor.anchoredComments as pin (pin.id)}
						<button
							type="button"
							class="comment-pin {editor.activeCommentId === pin.id ? 'selected' : ''}"
							style="left: {pin.x}px; top: {pin.y}px;"
							onclick={(e) => {
								e.stopPropagation();
								editor.activeCommentId = pin.id;
								editor.commentsDrawerOpen = true;
							}}
							title="Comment #{pin.id} on {pin.targetLabel}"
						>
							<span>{pin.id}</span>
						</button>
					{/each}
				</div>

				<!-- Floating Draw Markup Controls Toolbar (shown while drawing) -->
				{#if editor.drawOverlayOpen}
					<div class="draw-toolbar-floating">
						<span class="draw-title">✏️ Markup Mode</span>
						<div class="draw-colors">
							{#each ['#ff5722', '#ffc107', '#ef5350', '#00e5ff', '#ffffff'] as color}
								<button
									type="button"
									class="draw-color-swatch {drawColor === color ? 'active' : ''}"
									style="background: {color};"
									onclick={() => (drawColor = color)}
									title="Change stroke color"
								></button>
							{/each}
						</div>
						<button type="button" class="draw-btn-undo" onclick={undoDrawing} title="Undo stroke">↩</button>
						<button type="button" class="draw-btn-clear" onclick={clearDrawing}>Clear</button>
						<button
							type="button"
							class="draw-btn-done"
							onclick={finishDrawing}
						>
							Done
						</button>
					</div>
				{/if}

				<!-- Floating Manual Edit Popover ("Vitrine" Card) -->
				<ManualEditPanel
					{editor}
					onSave={handleSaveDraft}
					onCancel={() => editor.clearSelection()}
					onDelete={handleDeleteTarget}
					postMessage={postToFrame}
				/>

				<!-- Sliding Comments Drawer -->
				{#if editor.commentsDrawerOpen}
					<aside class="comments-drawer">
						<header class="comments-drawer-head">
							<div class="drawer-title-row">
								<h3>Comments ({editor.commentCount})</h3>
								{#if editor.anchoredComments.length > 0}
									<div class="drawer-head-actions">
										<button
											type="button"
											class="copy-agent-prompt-btn"
											onclick={copyAgentPrompt}
											title="Copy all comments formatted as a prompt for the AI agent"
										>
											📋 Prompt Agent
										</button>
										<button
											type="button"
											class="export-critique-btn"
											onclick={exportCritiqueManifest}
											title="Export machine-readable critique JSON manifest"
										>
											📥 JSON
										</button>
									</div>
								{/if}
							</div>
							<button
								type="button"
								class="close-drawer-btn"
								onclick={() => (editor.commentsDrawerOpen = false)}
							>
								✕
							</button>
						</header>

						<div class="comments-list">
							{#if editor.anchoredComments.length === 0}
								<div class="comments-empty">
									<p>No feedback pins yet.</p>
									<span class="empty-sub">
										Click anywhere on the preview to drop an anchored pin on an element.
									</span>
								</div>
							{:else}
								{#each editor.anchoredComments as c (c.id)}
									<div class="comment-card {editor.activeCommentId === c.id ? 'active' : ''}">
										<div class="comment-card-head">
											<span class="pin-id">Pin #{c.id}</span>
											<span class="target-name">{c.targetLabel}</span>
											<button
												type="button"
												class="comment-delete-btn"
												onclick={() => {
													editor.anchoredComments = editor.anchoredComments.filter((x) => x.id !== c.id);
												}}
												title="Delete pin"
											>
												🗑
											</button>
										</div>
										{#if c.htmlSnippet}
											<div class="comment-code-snippet">
												<code>{c.htmlSnippet}</code>
											</div>
										{/if}
										<textarea
											class="comment-edit-textarea"
											placeholder="Write instruction for AI agent..."
											rows="2"
											bind:value={c.text}
										></textarea>
										<span class="comment-time">{c.timestamp}</span>
									</div>
								{/each}
							{/if}
						</div>

						<footer class="comments-composer">
							<textarea
								bind:value={newCommentDraft}
								placeholder="Add general note or click preview..."
								rows="3"
							></textarea>
							<div class="composer-actions">
								<button
									type="button"
									class="send-comment-btn"
									onclick={() => {
										if (!newCommentDraft.trim()) return;
										const id = editor.anchoredComments.length + 1;
										editor.anchoredComments.push({
											id,
											targetId: 'canvas',
											targetLabel: 'General Note',
											text: newCommentDraft.trim(),
											x: 180,
											y: 180,
											timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
										});
										newCommentDraft = '';
									}}
								>
									Add Note
								</button>
							</div>
						</footer>
					</aside>
				{/if}
			</div>
		{:else}
			<!-- Raw Code Editor View (Image 3) -->
			<div class="code-stage">
				<div class="code-editor-wrap">
					<div class="code-header">
						<span class="code-file-name">{fileName}</span>
						<span class="code-badge">HTML Source</span>
					</div>
					<textarea
						class="raw-code-textarea"
						bind:value={source}
						oninput={() => onFileChange?.(source)}
						spellcheck="false"
					></textarea>
				</div>
			</div>
		{/if}
	</main>

	<!-- Rich Screenshot Capture Popup Toast -->
	{#if screenshotToast?.visible}
		<aside class="screenshot-capture-card" aria-label="Screenshot captured">
			<img src={screenshotToast.dataUrl} alt="Preview Snapshot" class="screenshot-thumb" />
			<div class="screenshot-info">
				<div class="screenshot-title-row">
					<h4>{screenshotToast.copied ? '✓ Copied to Clipboard!' : '📸 Snapshot Captured'}</h4>
					<button
						type="button"
						class="btn-shot-close"
						onclick={() => (screenshotToast = null)}
					>
						✕
					</button>
				</div>
				<p class="screenshot-sub">Ready to paste (Cmd+V) into chat or Slack</p>
				<div class="screenshot-actions">
					<button
						type="button"
						class="btn-shot-download"
						onclick={() => screenshotToast && downloadScreenshot(screenshotToast.dataUrl)}
					>
						💾 Download PNG
					</button>
				</div>
			</div>
		</aside>
	{/if}

	<!-- General notification toast -->
	{#if notificationToast}
		<div class="editor-toast-notification">
			{notificationToast}
		</div>
	{/if}
</div>
