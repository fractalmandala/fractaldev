import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('frcked/evals/screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  console.log('=== VERIFYING TOOL TOGGLE AND CONTRAST FIXES ===');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--window-size=1400,950',
    '--user-data-dir=/tmp/chrome-fixes-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/editor'
  ]);

  let tabs = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const listRes = await fetch('http://127.0.0.1:9224/json');
      tabs = await listRes.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }
  if (!tabs) {
    throw new Error('Failed to connect to Chrome port 9224');
  }
  const tab = tabs.find(t => t.url.includes('/editor')) || tabs[0];
  if (!tab) {
    throw new Error('Editor tab not found on port 9224');
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

  async function evaluate(expr) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      const buffer = Buffer.from(res.data, 'base64');
      const targetPath = path.join(SCREENSHOTS_DIR, filename);
      fs.writeFileSync(targetPath, buffer);
      console.log(`Saved screenshot: ${targetPath}`);

      const brainDir = '/Users/amrit/.gemini/antigravity/brain/672a0034-d39f-4f69-9828-2434c6f21ec8';
      if (fs.existsSync(brainDir)) {
        fs.writeFileSync(path.join(brainDir, filename), buffer);
      }
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  // TEST 1: Tool toggle on and off
  console.log('\n--- 1. Testing Edit Mode Button Toggle On & Off ---');
  
  // Initial state check
  const initialToolState = await evaluate(`
    (() => {
      const editBtn = document.querySelector('.edit-mode-btn');
      return {
        hasActive: editBtn.classList.contains('active'),
        ariaPressed: editBtn.getAttribute('aria-pressed')
      };
    })()
  `);
  console.log('Initial edit button state (should be false/unselected):', initialToolState);
  if (initialToolState.hasActive || initialToolState.ariaPressed === 'true') {
    throw new Error('Edit button should NOT be active by default');
  }
  await captureScreenshot('fix-edit-button-initial-unselected.png');

  // Click 1: Toggle Edit ON
  await evaluate(`document.querySelector('.edit-mode-btn').click();`);
  await new Promise(r => setTimeout(r, 400));
  const activeToolState = await evaluate(`
    (() => {
      const editBtn = document.querySelector('.edit-mode-btn');
      return {
        hasActive: editBtn.classList.contains('active'),
        ariaPressed: editBtn.getAttribute('aria-pressed')
      };
    })()
  `);
  console.log('After 1st click (should be active):', activeToolState);
  if (!activeToolState.hasActive || activeToolState.ariaPressed !== 'true') {
    throw new Error('Edit button failed to activate on click');
  }
  await captureScreenshot('fix-edit-button-toggled-on.png');

  // Click 2: Toggle Edit OFF (Unselect it!)
  await evaluate(`document.querySelector('.edit-mode-btn').click();`);
  await new Promise(r => setTimeout(r, 400));
  const unselectedToolState = await evaluate(`
    (() => {
      const editBtn = document.querySelector('.edit-mode-btn');
      return {
        hasActive: editBtn.classList.contains('active'),
        ariaPressed: editBtn.getAttribute('aria-pressed')
      };
    })()
  `);
  console.log('After 2nd click (should be UNSELECTED / false):', unselectedToolState);
  if (unselectedToolState.hasActive || unselectedToolState.ariaPressed === 'true') {
    throw new Error('Edit button failed to unselect on 2nd click');
  }
  await captureScreenshot('fix-edit-button-toggled-off.png');

  // TEST 2: Color Theming on Dark Card Surfaces
  console.log('\n--- 2. Testing Color Theming on Dark Card Surfaces ---');
  await evaluate(`
    (() => {
      const select = document.querySelector('#specimen-select');
      select.value = 'accelerating-digital-growth';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()
  `);
  await new Promise(r => setTimeout(r, 1500));

  const contrastData = await evaluate(`
    (() => {
      const iframe = document.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) return { error: 'Iframe not found' };
      const doc = iframe.contentDocument;

      const card = doc.querySelector('#card-table');
      const cardTitle = doc.querySelector('#card-table .card-title');
      const tableTh = doc.querySelector('#card-table th');
      const row1Name = doc.querySelector('#table-row-1-name');
      const row2Name = doc.querySelector('#table-row-2-name');
      const btnPrimary = doc.querySelector('#btn-primary');
      const btnSecondary = doc.querySelector('#btn-secondary');

      return {
        cardBg: window.getComputedStyle(card).backgroundColor,
        cardTitleColor: window.getComputedStyle(cardTitle).color,
        tableThColor: window.getComputedStyle(tableTh).color,
        row1Color: window.getComputedStyle(row1Name).color,
        row2Color: window.getComputedStyle(row2Name).color,
        btnPrimaryBg: window.getComputedStyle(btnPrimary).backgroundColor,
        btnPrimaryColor: window.getComputedStyle(btnPrimary).color,
        btnSecondaryBg: window.getComputedStyle(btnSecondary).backgroundColor,
        btnSecondaryColor: window.getComputedStyle(btnSecondary).color
      };
    })()
  `);

  console.log('Contrast Verification Data:', contrastData);

  // Assertions:
  // Card background is dark (#191C21 -> rgb(25, 28, 33))
  // Row 1 and Row 2 text MUST be white (rgb(255, 255, 255))
  if (contrastData.row1Color !== 'rgb(255, 255, 255)' || contrastData.row2Color !== 'rgb(255, 255, 255)') {
    throw new Error('Table row text on dark card is not white: row1=' + contrastData.row1Color + ', row2=' + contrastData.row2Color);
  }
  if (contrastData.cardTitleColor !== 'rgb(255, 255, 255)') {
    throw new Error('Card title on dark card is not white: ' + contrastData.cardTitleColor);
  }
  // Primary button (#E5A50A yellow) text must be black (rgb(0, 0, 0))
  if (contrastData.btnPrimaryColor !== 'rgb(0, 0, 0)') {
    throw new Error('Primary yellow button text is not black: ' + contrastData.btnPrimaryColor);
  }
  // Secondary button (dark surface) text must be white (rgb(255, 255, 255))
  if (contrastData.btnSecondaryColor !== 'rgb(255, 255, 255)') {
    throw new Error('Secondary button text on dark surface is not white: ' + contrastData.btnSecondaryColor);
  }

  await captureScreenshot('fix-contrast-dark-card-white-text.png');

  console.log('\n=== ALL FIXES VERIFIED SUCCESSFULLY! ===');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
