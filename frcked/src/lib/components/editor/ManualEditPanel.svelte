<script lang="ts">
	import type { EditorState } from '$lib/states/editorState.svelte';
	import { fade } from 'svelte/transition';

	let {
		editor,
		onSave,
		onCancel,
		onDelete,
		postMessage
	}: {
		editor: EditorState;
		onSave: () => void;
		onCancel: () => void;
		onDelete: () => void;
		postMessage: (msg: unknown) => void;
	} = $props();

	let isDragging = $state(false);
	let dragStart = { x: 0, y: 0 };
	let initialPos = { left: 0, top: 0 };

	function toHexColor(val?: string, fallback = '#ffffff'): string {
		if (!val) return fallback;
		const trimmed = val.trim();
		if (trimmed.startsWith('#')) {
			if (trimmed.length === 4) {
				return '#' + trimmed[1] + trimmed[1] + trimmed[2] + trimmed[2] + trimmed[3] + trimmed[3];
			}
			if (trimmed.length >= 7) return trimmed.slice(0, 7);
		}
		const m = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
		if (m) {
			const r = parseInt(m[1]).toString(16).padStart(2, '0');
			const g = parseInt(m[2]).toString(16).padStart(2, '0');
			const b = parseInt(m[3]).toString(16).padStart(2, '0');
			return `#${r}${g}${b}`;
		}
		return fallback;
	}

	function startDrag(e: PointerEvent) {
		if (editor.isLocked) return;
		const target = e.target as HTMLElement;
		if (target.closest('button, input, textarea, select')) return;

		e.preventDefault();
		isDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		initialPos = {
			left: editor.panelPosition?.left ?? 0,
			top: editor.panelPosition?.top ?? 0
		};

		window.addEventListener('pointermove', onDragMove);
		window.addEventListener('pointerup', onDragEnd);
	}

	function onDragMove(e: PointerEvent) {
		if (!isDragging) return;
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;
		editor.panelPosition = {
			left: Math.max(10, initialPos.left + dx),
			top: Math.max(10, initialPos.top + dy)
		};
	}

	function onDragEnd() {
		isDragging = false;
		window.removeEventListener('pointermove', onDragMove);
		window.removeEventListener('pointerup', onDragEnd);
	}
	function stepValue(prop: 'fontSize' | 'borderRadius', delta: number) {
		const current = editor.styleDraft[prop] || '';
		const num = parseFloat(current) || (prop === 'fontSize' ? 14 : 0);
		const next = Math.max(0, num + delta);
		editor.updateStyle(prop, `${next}px`, postMessage);
	}

	function setPreset(prop: 'fontSize' | 'borderRadius', val: string) {
		editor.updateStyle(prop, val, postMessage);
	}
</script>

{#if editor.selectedTarget && editor.panelPosition}
	<aside
		class="manual-edit-panel"
		style="left: {editor.panelPosition.left}px; top: {editor.panelPosition.top}px;"
		transition:fade={{ duration: 120 }}
		aria-label="Element Inspector"
	>
		<!-- Header -->
		<header
			class="panel-head"
			onpointerdown={startDrag}
			role="toolbar"
			tabindex="-1"
			aria-label="Inspector Titlebar"
		>
			<div class="panel-title">
				<span class="sparkle" aria-hidden="true">✧</span>
				<h4>{editor.targetTitle}</h4>
			</div>
			<div class="head-actions">
				<button
					type="button"
					class="icon-action {editor.isLocked ? 'active' : ''}"
					onclick={() => (editor.isLocked = !editor.isLocked)}
					title={editor.isLocked ? 'Unlock position' : 'Pin position'}
					aria-label={editor.isLocked ? 'Unlock position' : 'Pin position'}
				>
					{editor.isLocked ? '🔒' : '🔓'}
				</button>
				<button
					type="button"
					class="icon-action"
					onclick={() => editor.clearSelection()}
					title="Close inspector"
					aria-label="Close inspector"
				>
					✕
				</button>
			</div>
		</header>

		<!-- Body -->
		<div class="panel-body">
			<!-- CONTENT Section -->
			<section class="param-section">
				<span class="section-title">CONTENT</span>
				<label class="field-wrap">
					<span class="field-label">Selected element HTML</span>
					<textarea
						class="html-textarea"
						rows="5"
						bind:value={editor.htmlDraft}
						oninput={() => (editor.isDirty = true)}
						spellcheck="false"
					></textarea>
				</label>
			</section>

			<!-- PARAMETERS Section -->
			<section class="param-section">
				<div class="section-head-row">
					<span class="section-title">PARAMETERS</span>
					<!-- Breakpoint Scope Selector -->
					<div class="scope-toggle-pills" role="group" aria-label="Style Scope">
						<button
							type="button"
							class="scope-pill {editor.breakpointScope === 'base' ? 'active' : ''}"
							onclick={() => (editor.breakpointScope = 'base')}
							title="Apply globally to all screen sizes"
						>
							Base
						</button>
						<button
							type="button"
							class="scope-pill {editor.breakpointScope === 'mobile' ? 'active' : ''}"
							onclick={() => (editor.breakpointScope = 'mobile')}
							title="Apply only to mobile (<=480px)"
						>
							📱 Mobile
						</button>
						<button
							type="button"
							class="scope-pill {editor.breakpointScope === 'tablet' ? 'active' : ''}"
							onclick={() => (editor.breakpointScope = 'tablet')}
							title="Apply only to tablet (<=768px)"
						>
							💻 Tablet
						</button>
					</div>
				</div>

				<!-- Text Color -->
				<div class="param-row">
					<span class="row-label">Text color</span>
					<div class="color-picker-cell">
						<input
							type="color"
							value={toHexColor(editor.styleDraft.color, '#f1f1f1')}
							oninput={(e) =>
								editor.updateStyle('color', e.currentTarget.value, postMessage)}
						/>
						<input
							type="text"
							class="color-text-input"
							value={editor.styleDraft.color || '#f1f1f1'}
							oninput={(e) =>
								editor.updateStyle('color', e.currentTarget.value, postMessage)}
						/>
					</div>
				</div>

				<!-- Background Color -->
				<div class="param-row">
					<span class="row-label">Background</span>
					<div class="color-picker-cell">
						<input
							type="color"
							value={toHexColor(editor.styleDraft.backgroundColor, '#000000')}
							oninput={(e) =>
								editor.updateStyle(
									'backgroundColor',
									e.currentTarget.value,
									postMessage
								)}
						/>
						<input
							type="text"
							class="color-text-input"
							value={editor.styleDraft.backgroundColor || 'rgba(0, 0, 0, 0)'}
							oninput={(e) =>
								editor.updateStyle(
									'backgroundColor',
									e.currentTarget.value,
									postMessage
								)}
						/>
					</div>
				</div>

				<!-- Font Size with Stepper & Presets -->
				<div class="param-row param-row-vertical">
					<div class="row-label-with-stepper">
						<span class="row-label">Font size</span>
						<div class="stepper-wrap">
							<button
								type="button"
								class="stepper-btn"
								onclick={() => stepValue('fontSize', -1)}
								title="Decrease font size"
							>
								-
							</button>
							<input
								type="text"
								class="text-input font-input"
								placeholder="e.g. 18px"
								value={editor.styleDraft.fontSize || ''}
								oninput={(e) =>
									editor.updateStyleRaw('fontSize', e.currentTarget.value)}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										editor.commitStyleOnEnter('fontSize', postMessage);
										e.currentTarget.value = editor.styleDraft.fontSize || '';
									}
								}}
							/>
							<button
								type="button"
								class="stepper-btn"
								onclick={() => stepValue('fontSize', 1)}
								title="Increase font size"
							>
								+
							</button>
						</div>
					</div>
					<div class="presets-row">
						{#each ['12px', '14px', '16px', '20px', '24px', '32px'] as preset}
							<button
								type="button"
								class="preset-pill {editor.styleDraft.fontSize === preset ? 'active' : ''}"
								onclick={() => setPreset('fontSize', preset)}
							>
								{preset.replace('px', '')}
							</button>
						{/each}
					</div>
				</div>

				<!-- Border Radius with Stepper & Presets -->
				<div class="param-row param-row-vertical">
					<div class="row-label-with-stepper">
						<span class="row-label">Border radius</span>
						<div class="stepper-wrap">
							<button
								type="button"
								class="stepper-btn"
								onclick={() => stepValue('borderRadius', -2)}
								title="Decrease radius"
							>
								-
							</button>
							<input
								type="text"
								class="text-input font-input"
								placeholder="e.g. 12px"
								value={editor.styleDraft.borderRadius || ''}
								oninput={(e) =>
									editor.updateStyleRaw('borderRadius', e.currentTarget.value)}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										editor.commitStyleOnEnter('borderRadius', postMessage);
										e.currentTarget.value = editor.styleDraft.borderRadius || '';
									}
								}}
							/>
							<button
								type="button"
								class="stepper-btn"
								onclick={() => stepValue('borderRadius', 2)}
								title="Increase radius"
							>
								+
							</button>
						</div>
					</div>
					<div class="presets-row">
						{#each [
							{ label: '0', val: '0px' },
							{ label: '4px', val: '4px' },
							{ label: '8px', val: '8px' },
							{ label: '16px', val: '16px' },
							{ label: 'Pill', val: '999px' }
						] as preset}
							<button
								type="button"
								class="preset-pill {editor.styleDraft.borderRadius === preset.val ? 'active' : ''}"
								onclick={() => setPreset('borderRadius', preset.val)}
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>
			</section>
		</div>

		<!-- Footer Actions -->
		<footer class="panel-foot">
			<button
				type="button"
				class="delete-btn"
				onclick={onDelete}
				title="Delete element"
				aria-label="Delete element"
			>
				🗑
			</button>
			<div class="action-buttons">
				<button type="button" class="btn btn-cancel" onclick={onCancel}>
					Cancel
				</button>
				<button type="button" class="btn btn-save" onclick={onSave}>
					Save
				</button>
			</div>
		</footer>
	</aside>
{/if}
