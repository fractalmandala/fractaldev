/**
 * In-Iframe Bridge Script for Visual HTML Inspection and Editing
 * Injected into the sandboxed iframe's srcdoc.
 */

export function createEditBridgeScript(): string {
	return `<style data-od-edit-bridge-style>
html[data-od-edit-mode] body * {
	cursor: pointer !important;
}
[data-od-edit-guides-layer] {
	position: fixed;
	inset: 0;
	z-index: 2147483646;
	pointer-events: none;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 11px;
	line-height: 1;
}
.od-edit-guide-box {
	position: fixed;
	border: 1px solid #ff5722;
	box-sizing: border-box;
	pointer-events: none;
	transition: all 0.05s ease-out;
}
.od-edit-guide-box-hover {
	border-style: dashed;
	border-color: rgba(255, 87, 34, 0.7);
	background: rgba(255, 87, 34, 0.05);
}
.od-edit-guide-box-selected {
	border-style: solid;
	border-width: 1.5px;
	border-color: #ff5722;
	box-shadow: 0 0 0 1px rgba(255, 87, 34, 0.35);
}
.od-edit-guide-handle {
	position: fixed;
	width: 8px;
	height: 8px;
	margin-left: -4px;
	margin-top: -4px;
	border: 2px solid #ff5722;
	border-radius: 999px;
	background: #ffffff;
	box-sizing: border-box;
	pointer-events: none;
}
.od-edit-guide-measure {
	position: fixed;
	padding: 2px 6px;
	border-radius: 4px;
	background: #ff5722;
	color: #ffffff;
	font-size: 10px;
	font-weight: 600;
	white-space: nowrap;
	box-shadow: 0 2px 8px rgba(255, 87, 34, 0.4);
	pointer-events: none;
}
</style>
<script id="__od_bridge">
(function() {
	try {
		var _origRS = history.replaceState;
		history.replaceState = function() {
			try { return _origRS.apply(history, arguments); } catch (e) {}
		};
		var _origPS = history.pushState;
		history.pushState = function() {
			try { return _origPS.apply(history, arguments); } catch (e) {}
		};
	} catch (e) {}

	var DISCOVERY_SELECTOR = 'main, nav, section, article, aside, header, footer, div, h1, h2, h3, h4, h5, h6, p, a, button, img, ul, ol, li, dl, dt, dd, table, tr, td, th, span, code, pre';
	var enabled = false;
	var currentActiveTool = 'edit';
	var selectedId = null;
	var hoverId = null;

	function normalizeCssValue(prop, rawVal) {
		if (rawVal === undefined || rawVal === null || rawVal === '') return '';
		var val = String(rawVal).trim();
		if (val === '') return '';

		var lengthProps = [
			'font-size', 'border-radius', 'border-width', 'width', 'height',
			'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'gap', 'letter-spacing'
		];

		if (lengthProps.indexOf(prop) !== -1) {
			if (/^-?\d+(\.\d+)?$/.test(val)) {
				return val + 'px';
			}
		}
		return val;
	}

	function getStableId(el) {
		if (!el) return 'unknown';
		var explicit = el.getAttribute('data-od-id');
		if (explicit) return explicit;
		var runtime = el.getAttribute('data-od-runtime-id');
		if (runtime) return runtime;

		var parts = [];
		var cur = el;
		while (cur && cur !== document.body) {
			var parent = cur.parentElement;
			if (!parent) break;
			var children = Array.prototype.slice.call(parent.children).filter(function(c) {
				return !c.hasAttribute('data-od-edit-guides-layer');
			});
			parts.unshift(children.indexOf(cur));
			cur = parent;
		}
		var path = 'path-' + parts.join('-');
		el.setAttribute('data-od-runtime-id', path);
		return path;
	}

	function findById(id) {
		if (!id) return null;
		if (id === '__body__') return document.body;
		var escaped = (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(id) : id.replace(/"/g, '\\"');
		return document.querySelector('[data-od-id="' + escaped + '"]') ||
					 document.querySelector('[data-od-runtime-id="' + escaped + '"]') ||
					 document.getElementById(id);
	}

	function ensureGuidesLayer() {
		var layer = document.querySelector('[data-od-edit-guides-layer]');
		if (!layer) {
			layer = document.createElement('div');
			layer.setAttribute('data-od-edit-guides-layer', 'true');
			layer.setAttribute('aria-hidden', 'true');
			document.body.appendChild(layer);
		}
		return layer;
	}

	function clearGuidesLayer() {
		var layer = document.querySelector('[data-od-edit-guides-layer]');
		if (layer) layer.replaceChildren();
	}

	function addNode(layer, className, css) {
		var node = document.createElement('div');
		node.className = className;
		Object.keys(css).forEach(function(k) {
			node.style[k] = css[k];
		});
		layer.appendChild(node);
		return node;
	}

	function renderGuides() {
		if (!enabled) {
			clearGuidesLayer();
			return;
		}
		var layer = ensureGuidesLayer();
		layer.replaceChildren();

		var selectedEl = selectedId ? findById(selectedId) : null;
		var hoverEl = hoverId && hoverId !== selectedId ? findById(hoverId) : null;

		// 1. Hover Box
		if (hoverEl) {
			var hRect = hoverEl.getBoundingClientRect();
			addNode(layer, 'od-edit-guide-box od-edit-guide-box-hover', {
				left: hRect.left + 'px',
				top: hRect.top + 'px',
				width: hRect.width + 'px',
				height: hRect.height + 'px'
			});
		}

		// 2. Selected Box & 8 Handles
		if (selectedEl) {
			var sRect = selectedEl.getBoundingClientRect();
			addNode(layer, 'od-edit-guide-box od-edit-guide-box-selected', {
				left: sRect.left + 'px',
				top: sRect.top + 'px',
				width: sRect.width + 'px',
				height: sRect.height + 'px'
			});

			var points = [
				[sRect.left, sRect.top],
				[sRect.left + sRect.width / 2, sRect.top],
				[sRect.right, sRect.top],
				[sRect.left, sRect.top + sRect.height / 2],
				[sRect.right, sRect.top + sRect.height / 2],
				[sRect.left, sRect.bottom],
				[sRect.left + sRect.width / 2, sRect.bottom],
				[sRect.right, sRect.bottom]
			];

			for (var i = 0; i < points.length; i++) {
				addNode(layer, 'od-edit-guide-handle', {
					left: Math.round(points[i][0]) + 'px',
					top: Math.round(points[i][1]) + 'px'
				});
			}

			// 3. Spacing measurement distance badge ("0px")
			if (hoverEl) {
				var rH = hoverEl.getBoundingClientRect();
				var gapX = null;
				var gapY = null;

				if (rH.left >= sRect.right) {
					gapX = Math.round(rH.left - sRect.right);
				} else if (sRect.left >= rH.right) {
					gapX = Math.round(sRect.left - rH.right);
				}

				if (rH.top >= sRect.bottom) {
					gapY = Math.round(rH.top - sRect.bottom);
				} else if (sRect.top >= rH.bottom) {
					gapY = Math.round(sRect.top - rH.bottom);
				}

				var dist = gapX !== null ? gapX : (gapY !== null ? gapY : 0);
				var badge = addNode(layer, 'od-edit-guide-measure', {
					left: (sRect.right + 8) + 'px',
					top: Math.round(sRect.top + sRect.height / 2 - 10) + 'px'
				});
				badge.textContent = dist + 'px';
			}
		}
	}

	function ensureResponsiveStyleSheet() {
		var styleEl = document.getElementById('od-responsive-overrides');
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = 'od-responsive-overrides';
			document.head.appendChild(styleEl);
		}
		return styleEl;
	}

	// Host message dispatcher
	window.addEventListener('message', function(ev) {
		if (!ev.data) return;
		var type = ev.data.type;

		if (type === 'od-edit-mode') {
			enabled = !!ev.data.enabled;
			document.documentElement.toggleAttribute('data-od-edit-mode', enabled);
			renderGuides();
			return;
		}

		if (type === 'od-active-tool') {
			currentActiveTool = ev.data.tool || 'edit';
			return;
		}

		if (type === 'od-edit-selected-target') {
			selectedId = ev.data.id || null;
			renderGuides();
			return;
		}

		if (type === 'od-update-theme-tokens') {
			var tokens = ev.data.tokens;
			if (tokens && typeof window.updateLiveThemeToken === 'function') {
				Object.keys(tokens).forEach(function(role) {
					window.updateLiveThemeToken(role, tokens[role]);
				});
			}
			return;
		}

		if (type === 'od-edit-preview-style') {
			var targetEl = findById(ev.data.id);
			if (targetEl && ev.data.styles) {
				var scope = ev.data.scope || 'base';

				Object.keys(ev.data.styles).forEach(function(k) {
					var rawVal = ev.data.styles[k];
					var cssProp = k.replace(/[A-Z]/g, function(m) { return '-' + m.toLowerCase(); });
					var val = normalizeCssValue(cssProp, rawVal);

					if (scope === 'mobile' || scope === 'tablet') {
						// Breakpoint-scoped override
						var bp = scope === 'mobile' ? '480px' : '768px';
						var sheet = ensureResponsiveStyleSheet();
						var targetSelector = targetEl.getAttribute('data-od-id')
							? '[data-od-id="' + targetEl.getAttribute('data-od-id') + '"]'
							: '#' + targetEl.id;
						var rule = '@media (max-width: ' + bp + ') { ' + targetSelector + ' { ' + cssProp + ': ' + val + ' !important; } }';
						sheet.textContent += '\\n' + rule;
					} else {
						// Base style override
						if (val === '') {
							targetEl.style.removeProperty(cssProp);
						} else {
							targetEl.style.setProperty(cssProp, val, 'important');
						}
					}

					// Cascade color to children and CSS variables so themed text responds
					if (cssProp === 'color' && val) {
						targetEl.style.setProperty('--fg', val);
						targetEl.style.setProperty('--muted', val);
						targetEl.style.setProperty('--accent', val);
						targetEl.style.setProperty('--accent-2', val);
						targetEl.style.setProperty('--text-primary', val);
						targetEl.style.setProperty('--text-secondary', val);

						var textNodes = targetEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, div, code, pre, td, th, li');
						for (var i = 0; i < textNodes.length; i++) {
							textNodes[i].style.setProperty('color', val, 'important');
						}
					}

					// Cascade font-size to children so container changes font size visibly
					if (cssProp === 'font-size' && val) {
						var textNodes = targetEl.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, div, code, pre, td, th, li');
						for (var i = 0; i < textNodes.length; i++) {
							textNodes[i].style.setProperty('font-size', val, 'important');
						}
					}

					// Border-radius requires overflow clipping; on framed containers, replace gradients with curved border
					if (cssProp === 'border-radius' && val) {
						targetEl.style.setProperty('border-radius', val, 'important');
						targetEl.style.setProperty('overflow', 'hidden', 'important');

						var isFrame = targetEl.classList.contains('frame') || targetEl.getAttribute('id') === 'vitrineFrame';
						if (isFrame) {
							var rNum = parseFloat(val) || 0;
							if (rNum > 0) {
								targetEl.style.setProperty('border', '1px dashed var(--accent, #ff3e00)', 'important');
								targetEl.style.setProperty('background-image', 'none', 'important');
								var plusNodes = targetEl.querySelectorAll('.plus');
								for (var p = 0; p < plusNodes.length; p++) {
									plusNodes[p].style.setProperty('opacity', '0', 'important');
								}
							} else {
								targetEl.style.removeProperty('border');
								targetEl.style.removeProperty('background-image');
								var plusNodes = targetEl.querySelectorAll('.plus');
								for (var p = 0; p < plusNodes.length; p++) {
									plusNodes[p].style.removeProperty('opacity');
								}
							}
						}
					}
				});
				renderGuides();
			}
			return;
		}

		if (type === 'od-screenshot-request') {
			try {
				var w = window.innerWidth || document.documentElement.clientWidth;
				var h = window.innerHeight || document.documentElement.clientHeight;
				var canvas = document.createElement('canvas');
				var dpr = window.devicePixelRatio || 1;
				canvas.width = Math.min(Math.round(w * dpr), 3840);
				canvas.height = Math.min(Math.round(h * dpr), 4320);
				var ctx = canvas.getContext('2d');

				if (ctx) {
					ctx.scale(dpr, dpr);
					var bgColor = window.getComputedStyle(document.body).backgroundColor || '#101010';
					ctx.fillStyle = bgColor;
					ctx.fillRect(0, 0, w, h);

					var elements = document.querySelectorAll('header, nav, section, article, aside, footer, div, h1, h2, h3, h4, p, a, button, span, code, pre, dl, dt, dd, table, tr, td');
					for (var eIdx = 0; eIdx < elements.length; eIdx++) {
						var el = elements[eIdx];
						if (el.hasAttribute('data-od-edit-guides-layer') || el.closest('[data-od-edit-guides-layer]')) continue;
						var rect = el.getBoundingClientRect();
						if (rect.width === 0 || rect.height === 0) continue;
						if (rect.bottom < 0 || rect.top > h || rect.right < 0 || rect.left > w) continue;

						var cs = window.getComputedStyle(el);
						var bg = cs.backgroundColor;
						if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
							ctx.fillStyle = bg;
							ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
						}
						var bWidth = parseFloat(cs.borderWidth) || 0;
						if (cs.borderStyle !== 'none' && bWidth > 0) {
							ctx.strokeStyle = cs.borderColor || '#373737';
							ctx.lineWidth = bWidth;
							ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
						}

						var directText = '';
						for (var cIdx = 0; cIdx < el.childNodes.length; cIdx++) {
							var child = el.childNodes[cIdx];
							if (child.nodeType === 3) {
								directText += child.textContent;
							}
						}
						directText = directText.trim();
						if (directText) {
							ctx.fillStyle = cs.color || '#f1f1f1';
							ctx.font = (cs.fontWeight || 'normal') + ' ' + (cs.fontSize || '14px') + ' ' + (cs.fontFamily || 'monospace');
							ctx.textBaseline = 'top';
							ctx.fillText(directText.slice(0, 80), rect.left + 2, rect.top + 2);
						}
					}

					var dataUrl = canvas.toDataURL('image/png');
					window.parent.postMessage({ type: 'od-screenshot-response', dataUrl: dataUrl }, '*');
				}
			} catch (err) {
				window.parent.postMessage({ type: 'od-screenshot-response', dataUrl: '', error: String(err) }, '*');
			}
			return;
		}

		if (type === 'od-overflow-audit-request') {
			var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
			var docScrollWidth = document.documentElement.scrollWidth;
			var hasGlobalBlowout = docScrollWidth > viewportWidth + 2;

			var issues = [];
			var allElements = document.body ? document.body.querySelectorAll('*') : [];

			for (var i = 0; i < allElements.length; i++) {
				var el = allElements[i];
				if (el.hasAttribute('data-od-edit-guides-layer') || el.id === '__od_bridge') continue;

				// Skip elements safely contained within a scrollable or clipped container
				var inScrollContainer = false;
				var curParent = el.parentElement;
				while (curParent && curParent !== document.body) {
					var pCs = window.getComputedStyle(curParent);
					if (pCs.overflowX === 'auto' || pCs.overflowX === 'scroll' || pCs.overflow === 'hidden' || pCs.overflowX === 'hidden') {
						inScrollContainer = true;
						break;
					}
					curParent = curParent.parentElement;
				}
				if (inScrollContainer) continue;

				var rect = el.getBoundingClientRect();
				var sWidth = el.scrollWidth;
				var computed = window.getComputedStyle(el);

				var exceedsRight = rect.right > viewportWidth + 2 && rect.width > 0;
				var internalBlowout = sWidth > viewportWidth + 2 && computed.overflowX !== 'auto' && computed.overflowX !== 'scroll';

				if (exceedsRight || internalBlowout) {
					var id = getStableId(el);
					var tag = el.tagName.toLowerCase();
					var label = el.getAttribute('data-od-label') || el.getAttribute('data-od-id') || (el.className ? String(el.className).split(' ')[0] : '') || tag;

					var reason = 'Width (' + Math.round(Math.max(rect.right, sWidth)) + 'px) exceeds viewport (' + viewportWidth + 'px)';
					var fix = 'max-width: 100% !important; box-sizing: border-box !important;';

					if (tag === 'pre' || tag === 'code') {
						reason = 'Monospace <' + tag + '> block does not wrap or scroll horizontally';
						fix = 'max-width: 100% !important; overflow-x: auto !important;';
					} else if (computed.display === 'grid') {
						reason = 'Grid columns exceed mobile viewport width';
						fix = 'grid-template-columns: 1fr !important;';
					} else if (computed.whiteSpace === 'nowrap') {
						reason = 'white-space: nowrap forces blowout past viewport';
						fix = 'white-space: normal !important; overflow-wrap: anywhere !important;';
					}

					issues.push({
						elementId: id,
						label: label,
						tagName: tag,
						issue: reason,
						fixSuggestion: fix,
						currentWidth: Math.round(Math.max(rect.right, sWidth)),
						parentWidth: viewportWidth
					});
				}
			}

			var seen = new Set();
			var uniqueIssues = [];
			for (var j = 0; j < issues.length; j++) {
				if (!seen.has(issues[j].elementId)) {
					seen.add(issues[j].elementId);
					uniqueIssues.push(issues[j]);
				}
			}

			window.parent.postMessage({
				type: 'od-overflow-audit-response',
				hasGlobalBlowout: hasGlobalBlowout,
				viewportWidth: viewportWidth,
				docScrollWidth: docScrollWidth,
				issues: uniqueIssues.slice(0, 10)
			}, '*');
			return;
		}

		if (type === 'od-edit-preview-text') {
			var textEl = findById(ev.data.id);
			if (textEl && textEl.children.length === 0) {
				textEl.textContent = ev.data.value || '';
				renderGuides();
			}
			return;
		}

		if (type === 'od-edit-hover-reset') {
			hoverId = null;
			renderGuides();
			return;
		}
	});

	function buildTargetPayload(el) {
		var id = getStableId(el);
		var computed = window.getComputedStyle(el);
		var rect = el.getBoundingClientRect();
		var rawClasses = (el.className && typeof el.className === 'string') ? el.className.split(' ').filter(Boolean) : [];
		var label = el.getAttribute('data-od-label') ||
								el.getAttribute('data-od-id') ||
								rawClasses[0] ||
								el.tagName.toLowerCase();

		var attributes = {};
		for (var i = 0; i < el.attributes.length; i++) {
			var attr = el.attributes[i];
			attributes[attr.name] = attr.value;
		}

		return {
			id: id,
			label: label,
			tagName: el.tagName.toLowerCase(),
			className: el.className || '',
			text: (el.textContent || '').trim().slice(0, 100),
			rect: {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height)
			},
			attributes: attributes,
			styles: {
				color: computed.color,
				backgroundColor: computed.backgroundColor,
				fontFamily: computed.fontFamily,
				fontSize: computed.fontSize,
				fontWeight: computed.fontWeight,
				lineHeight: computed.lineHeight,
				letterSpacing: computed.letterSpacing,
				borderRadius: computed.borderRadius,
				borderColor: computed.borderColor,
				borderWidth: computed.borderWidth,
				borderStyle: computed.borderStyle,
				width: computed.width,
				height: computed.height,
				paddingTop: computed.paddingTop,
				paddingRight: computed.paddingRight,
				paddingBottom: computed.paddingBottom,
				paddingLeft: computed.paddingLeft,
				marginTop: computed.marginTop,
				marginRight: computed.marginRight,
				marginBottom: computed.marginBottom,
				marginLeft: computed.marginLeft,
				flexDirection: computed.flexDirection,
				justifyContent: computed.justifyContent,
				alignItems: computed.alignItems,
				gap: computed.gap,
				textAlign: computed.textAlign,
				opacity: computed.opacity
			},
			outerHtml: el.outerHTML,
			isLayoutContainer: computed.display === 'flex' || computed.display === 'grid'
		};
	}

	// DOM event listeners inside iframe
	document.addEventListener('pointerover', function(ev) {
		if (!enabled) return;
		var target = ev.target && ev.target.closest ? ev.target.closest(DISCOVERY_SELECTOR) : null;
		if (target) {
			hoverId = getStableId(target);
			renderGuides();
		}
	}, true);

	document.addEventListener('pointerout', function(ev) {
		if (!enabled) return;
		hoverId = null;
		renderGuides();
	}, true);

	document.addEventListener('click', function(ev) {
		if (ev.target && (ev.target.tagName === 'INPUT' || (ev.target.closest && ev.target.closest('.palette-swatches, .swatch-item, input[type="color"]')))) {
			return;
		}
		if (!enabled && currentActiveTool !== 'comment') return;
		ev.preventDefault();
		ev.stopPropagation();

		// Prefer target itself if meaningful, else closest candidate
		var target = ev.target;
		if (!target || !target.matches(DISCOVERY_SELECTOR)) {
			target = ev.target && ev.target.closest ? ev.target.closest(DISCOVERY_SELECTOR) : null;
		}

		if (currentActiveTool === 'comment') {
			var cPayload = target ? buildTargetPayload(target) : null;
			window.parent.postMessage({
				type: 'od-comment-drop',
				target: cPayload,
				x: ev.clientX,
				y: ev.clientY
			}, '*');
			return;
		}

		if (!target) {
			selectedId = null;
			renderGuides();
			window.parent.postMessage({ type: 'od-edit-background' }, '*');
			return;
		}

		selectedId = getStableId(target);
		renderGuides();

		var payload = buildTargetPayload(target);
		window.parent.postMessage({ type: 'od-edit-select', target: payload }, '*');
	}, true);

	// Announce readiness to host
	window.parent.postMessage({ type: 'od-edit-ready' }, '*');
})();
</script>`;
}
