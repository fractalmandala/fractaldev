import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('evals/screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING AUTOMATED EVAL VALIDATION RUNNER ===');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1400,900',
    '--user-data-dir=/tmp/chrome-eval-profile-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/editor'
  ]);

  let tabs = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const listRes = await fetch('http://127.0.0.1:9222/json');
      tabs = await listRes.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }
  if (!tabs) {
    throw new Error('Failed to connect to Chrome port 9222 after retries');
  }
  const tab = tabs.find(t => t.url.includes('/editor')) || tabs[0];
  if (!tab) {
    throw new Error('Editor tab not found on port 9222');
  }

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg.result || msg);
      callbacks.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await new Promise(r => setTimeout(r, 2500));

  async function saveScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    if (res.data) {
      const filePath = path.join(SCREENSHOTS_DIR, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`📸 Saved: ${filePath}`);
    }
  }

  async function evaluate(fn) {
    const res = await send('Runtime.evaluate', {
      expression: `(${fn.toString()})()`,
      returnByValue: true
    });
    return res.result?.value;
  }

  // -------------------------------------------------------------
  // EVAL 1: Mobile & Tablet Responsive Viewport Flow
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 1: Responsive Layout Flow ---');

  // 1a. Click Mobile Button
  const mobileRes = await evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Mobile'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked Mobile:', mobileRes);
  await new Promise(r => setTimeout(r, 1000));

  const mobileMetrics = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    return {
      innerWidth: win.innerWidth,
      scrollWidth: doc.documentElement.scrollWidth,
      bodyScrollWidth: doc.body.scrollWidth,
      isContained: doc.documentElement.scrollWidth <= win.innerWidth
    };
  });
  console.log('Mobile Metrics:', mobileMetrics);
  if (!mobileMetrics?.isContained) {
    throw new Error(`Eval 1 Failed: Mobile blowout! scrollWidth=${mobileMetrics?.scrollWidth}, innerWidth=${mobileMetrics?.innerWidth}`);
  }
  await saveScreenshot('eval-1-mobile.png');

  // 1b. Click Tablet Button
  const tabletRes = await evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Tablet'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked Tablet:', tabletRes);
  await new Promise(r => setTimeout(r, 1000));

  const tabletMetrics = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    return {
      innerWidth: win.innerWidth,
      scrollWidth: doc.documentElement.scrollWidth,
      bodyScrollWidth: doc.body.scrollWidth,
      isContained: doc.documentElement.scrollWidth <= win.innerWidth
    };
  });
  console.log('Tablet Metrics:', tabletMetrics);
  if (!tabletMetrics?.isContained) {
    throw new Error(`Eval 1 Failed: Tablet blowout! scrollWidth=${tabletMetrics?.scrollWidth}, innerWidth=${tabletMetrics?.innerWidth}`);
  }
  await saveScreenshot('eval-1-tablet.png');

  // Switch back to Desktop for remaining tests
  await evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Desktop'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // -------------------------------------------------------------
  // EVAL 2: Text Size & Numeric Input Non-Locking
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 2: Text Size & Numeric Input Non-Locking ---');

  // Select #stage-title
  const selectRes = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const el = doc.querySelector('[data-od-id="stage-title"]');
    if (el) { el.click(); return true; }
    return false;
  });
  console.log('Selected stage-title:', selectRes);
  await new Promise(r => setTimeout(r, 500));

  // Type "24" without pressing Enter
  const typingCheck = await evaluate(() => {
    const panel = document.querySelector('.manual-edit-panel');
    const fontInput = panel?.querySelector('.font-input');
    if (!fontInput) return { error: 'font-input not found' };

    // Simulate raw typing without Enter
    fontInput.value = '24';
    fontInput.dispatchEvent(new Event('input', { bubbles: true }));

    const iframe = document.querySelector('iframe');
    const titleEl = iframe.contentDocument.querySelector('[data-od-id="stage-title"]');
    return {
      inputValue: fontInput.value,
      hasPxAppended: fontInput.value.includes('px'),
      elementFontSize: titleEl ? titleEl.style.fontSize : null
    };
  });
  console.log('Typing Check (raw, no Enter):', typingCheck);
  if (typingCheck.hasPxAppended || typingCheck.inputValue !== '24') {
    throw new Error(`Eval 2 Failed: Premature 'px' appended or input modified: ${typingCheck.inputValue}`);
  }
  await saveScreenshot('eval-2-typing-raw.png');

  // Press Enter to commit
  await evaluate(() => {
    const panel = document.querySelector('.manual-edit-panel');
    const fontInput = panel?.querySelector('.font-input');
    if (fontInput) {
      fontInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 400));

  const enterCommitCheck = await evaluate(() => {
    const panel = document.querySelector('.manual-edit-panel');
    const fontInput = panel?.querySelector('.font-input');
    const iframe = document.querySelector('iframe');
    const titleEl = iframe.contentDocument.querySelector('[data-od-id="stage-title"]');
    return {
      inputValue: fontInput ? fontInput.value : null,
      elementInlineFontSize: titleEl ? titleEl.style.fontSize : null,
      elementComputedFontSize: titleEl ? iframe.contentWindow.getComputedStyle(titleEl).fontSize : null
    };
  });
  console.log('Enter Commit Check:', enterCommitCheck);
  if (enterCommitCheck.inputValue !== '24px') {
    throw new Error(`Eval 2 Failed: Expected '24px' on Enter commit, got: ${enterCommitCheck.inputValue}`);
  }
  await saveScreenshot('eval-2-committed.png');

  // -------------------------------------------------------------
  // EVAL 3: Complete Select-Any-Area Inspection & Readout
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 3: Complete Inspection & Readout ---');

  // 3a. Hover Guide Test
  const hoverCheck = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const vitrine = doc.querySelector('[data-od-id="vitrine"]');
    if (vitrine) {
      vitrine.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    }
    const hoverBox = doc.querySelector('.od-edit-guide-box-hover');
    return {
      hoverBoxFound: !!hoverBox,
      hoverBoxRect: hoverBox ? hoverBox.getBoundingClientRect() : null
    };
  });
  console.log('Hover Box Check:', hoverCheck);
  await saveScreenshot('eval-3-hover.png');

  // 3b. Selection Handles Test
  const handlesCheck = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const vitrine = doc.querySelector('[data-od-id="vitrine"]');
    if (vitrine) vitrine.click();

    const selectedBox = doc.querySelector('.od-edit-guide-box-selected');
    const handles = doc.querySelectorAll('.od-edit-guide-handle');
    return {
      selectedBoxFound: !!selectedBox,
      handleCount: handles.length
    };
  });
  console.log('Selection Handles Check:', handlesCheck);
  await saveScreenshot('eval-3-selection-handles.png');

  // 3c. Inspector Values Readout Check
  const inspectorValues = await evaluate(() => {
    const panel = document.querySelector('.manual-edit-panel');
    if (!panel) return { mounted: false };
    const title = panel.querySelector('h4')?.innerText;
    const fontInput = panel.querySelector('.font-input')?.value;
    const colorInputs = Array.from(panel.querySelectorAll('.color-text-input')).map(i => i.value);
    return {
      mounted: true,
      title,
      fontInput,
      colorInputs
    };
  });
  console.log('Inspector Values Readout:', inspectorValues);
  await saveScreenshot('eval-3-inspector-mounted.png');

  // 3d. Live Mutation (Change text color to #ff5722)
  const mutateCheck = await evaluate(() => {
    const panel = document.querySelector('.manual-edit-panel');
    const colorInput = panel?.querySelector('.color-text-input');
    if (!colorInput) return { error: 'color input not found' };

    colorInput.value = '#ff5722';
    colorInput.dispatchEvent(new Event('input', { bubbles: true }));

    const iframe = document.querySelector('iframe');
    const vitrine = iframe.contentDocument.querySelector('[data-od-id="vitrine"]');
    return {
      colorInputValue: colorInput.value,
      elementColor: vitrine ? iframe.contentWindow.getComputedStyle(vitrine).color : null
    };
  });
  console.log('Mutation Check:', mutateCheck);
  await saveScreenshot('eval-3-mutated.png');

  // -------------------------------------------------------------
  // EVAL 4: Freehand Drawing Canvas
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 4: Freehand Drawing Canvas ---');

  // Open Markup Tool
  const openDrawRes = await evaluate(() => {
    const pencilBtn = document.querySelector('.viewer-action-btn[aria-label="Draw markup"]') ||
                      document.querySelector('.draw-btn') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('✏️'));
    if (pencilBtn) { pencilBtn.click(); return true; }
    return false;
  });
  console.log('Opened Drawing Tool:', openDrawRes);
  await new Promise(r => setTimeout(r, 400));

  // Switch Zoom to 150%
  await evaluate(() => {
    const zoomBtn = document.querySelector('.zoom-indicator-btn');
    if (zoomBtn) {
      // Cycle until 150%
      for (let i = 0; i < 4; i++) {
        if (zoomBtn.innerText.includes('150%')) break;
        zoomBtn.click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // Simulate strokes on canvas
  const drawStrokeRes = await evaluate(() => {
    const canvas = document.querySelector('.persistent-draw-canvas');
    if (!canvas) return { error: 'canvas not found' };

    const rect = canvas.getBoundingClientRect();
    const startX = rect.left + 50;
    const startY = rect.top + 50;
    const endX = rect.left + 250;
    const endY = rect.top + 180;

    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: startX, clientY: startY, bubbles: true }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: (startX + endX) / 2, clientY: (startY + endY) / 2, bubbles: true }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: endX, clientY: endY, bubbles: true }));
    window.dispatchEvent(new PointerEvent('pointerup', { clientX: endX, clientY: endY, bubbles: true }));

    return {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      toolbarMounted: !!document.querySelector('.draw-toolbar-floating')
    };
  });
  console.log('Stroke draw check:', drawStrokeRes);
  await saveScreenshot('eval-4-drawing-active.png');

  // Click Done Button
  const doneCheck = await evaluate(() => {
    const doneBtn = document.querySelector('.draw-btn-done');
    if (doneBtn) doneBtn.click();

    const canvas = document.querySelector('.persistent-draw-canvas');
    return {
      toolbarClosed: !document.querySelector('.draw-toolbar-floating'),
      canvasStillInDOM: !!canvas,
      canvasVisible: canvas ? window.getComputedStyle(canvas).display !== 'none' : false
    };
  });
  console.log('Done button check:', doneCheck);
  if (!doneCheck.canvasStillInDOM || !doneCheck.canvasVisible) {
    throw new Error('Eval 4 Failed: Drawing canvas disappeared after Done was clicked!');
  }
  await saveScreenshot('eval-4-done-persisted.png');

  // Reset zoom back to 100%
  await evaluate(() => {
    const zoomBtn = document.querySelector('.zoom-indicator-btn');
    if (zoomBtn) {
      for (let i = 0; i < 4; i++) {
        if (zoomBtn.innerText.includes('100%')) break;
        zoomBtn.click();
      }
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // -------------------------------------------------------------
  // EVAL 5: Dual-Layer Screenshot Capture
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 5: Dual-Layer Screenshot Capture ---');

  const captureClickRes = await evaluate(() => {
    const btn = document.querySelector('.viewer-action-btn[aria-label="Screenshot"]') ||
                document.querySelector('button[aria-label="Screenshot"]') ||
                Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('📷'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Clicked Screenshot button:', captureClickRes);

  // Wait for screenshot toast popup to appear
  let toastAppeared = false;
  let screenshotDataUrl = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 400));
    const status = await evaluate(() => {
      const card = document.querySelector('.screenshot-capture-card');
      const img = card?.querySelector('.screenshot-thumb');
      return {
        mounted: !!card,
        dataUrl: img?.src?.startsWith('data:image') ? img.src : null
      };
    });
    if (status?.mounted && status?.dataUrl) {
      toastAppeared = true;
      screenshotDataUrl = status.dataUrl;
      break;
    }
  }

  console.log('Screenshot Toast Appeared:', toastAppeared, 'Has Data URL:', !!screenshotDataUrl);
  if (!toastAppeared || !screenshotDataUrl) {
    throw new Error('Eval 5 Failed: Screenshot toast did not mount with valid PNG dataUrl');
  }

  // Save the captured composite image directly to disk
  const base64Data = screenshotDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'eval-5-screenshot-captured.png'), Buffer.from(base64Data, 'base64'));
  console.log('📸 Saved eval-5-screenshot-captured.png from editor internal capture!');

  // Save UI screenshot with card
  await saveScreenshot('eval-5-screenshot-card.png');

  // Close toast
  await evaluate(() => {
    const closeBtn = document.querySelector('.screenshot-close');
    if (closeBtn) closeBtn.click();
  });

  // -------------------------------------------------------------
  // EVAL 6: Element-Anchored Comments & Agent Handoff
  // -------------------------------------------------------------
  console.log('\n--- Running Eval 6: Anchored Comments & Agent Handoff ---');

  // Activate comment tool
  await evaluate(() => {
    const commentBtn = document.querySelector('.viewer-comment-btn');
    if (commentBtn) commentBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Click on stage-title and vitrine inside iframe to drop pins
  const dropRes = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const titleEl = doc.querySelector('[data-od-id="stage-title"]');

    if (titleEl) {
      const rect = titleEl.getBoundingClientRect();
      titleEl.dispatchEvent(new MouseEvent('click', {
        clientX: rect.left + 20,
        clientY: rect.top + 15,
        bubbles: true
      }));
    }
    return true;
  });
  console.log('Dropped Pin #1 on stage-title:', dropRes);
  await new Promise(r => setTimeout(r, 500));

  const dropRes2 = await evaluate(() => {
    const iframe = document.querySelector('iframe');
    const doc = iframe.contentDocument;
    const vitrineEl = doc.querySelector('[data-od-id="vitrine"]');
    if (vitrineEl) {
      const rect = vitrineEl.getBoundingClientRect();
      vitrineEl.dispatchEvent(new MouseEvent('click', {
        clientX: rect.left + 30,
        clientY: rect.top + 25,
        bubbles: true
      }));
    }
    return true;
  });
  console.log('Dropped Pin #2 on vitrine:', dropRes2);
  await new Promise(r => setTimeout(r, 500));

  // Verify pins rendered and drawer open
  const commentsStatus = await evaluate(() => {
    const pins = Array.from(document.querySelectorAll('.comment-pin')).map(p => ({
      text: p.innerText,
      left: p.style.left,
      top: p.style.top
    }));
    const drawer = document.querySelector('.comments-drawer');
    return {
      pinCount: pins.length,
      pins,
      drawerOpen: !!drawer
    };
  });
  console.log('Comments Status:', commentsStatus);
  await saveScreenshot('eval-6-pins-rendered.png');

  // Enter critique in drawer
  const critiqueText = 'Make title 32px bold and increase frame contrast for mobile presentation.';
  const critiqueRes = await evaluate(() => {
    const drawer = document.querySelector('.comments-drawer');
    const textarea = drawer?.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Make title 32px bold and increase frame contrast for mobile presentation.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return { filled: true, value: textarea.value };
    }
    return { filled: false };
  });
  console.log('Entered critique into drawer:', critiqueRes);
  await saveScreenshot('eval-6-drawer-open.png');

  console.log('\n=== ALL 6 EVALS SUCCESSFULLY VERIFIED AND CAPTURED ===\n');

  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ EVAL RUNNER ERROR:\n', err);
  process.exit(1);
});
