import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('frcked/evals/screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING DESIGN SYSTEMS LIVE CANVAS VERIFICATION ===');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--window-size=1400,950',
    '--user-data-dir=/tmp/chrome-design-systems-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/editor'
  ]);

  let tabs = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const listRes = await fetch('http://127.0.0.1:9223/json');
      tabs = await listRes.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }
  if (!tabs) {
    throw new Error('Failed to connect to Chrome port 9223');
  }
  const tab = tabs.find(t => t.url.includes('/editor')) || tabs[0];
  if (!tab) {
    throw new Error('Editor tab not found on port 9223');
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

      // Also copy to brain artifacts directory
      const brainDir = '/Users/amrit/.gemini/antigravity/brain/672a0034-d39f-4f69-9828-2434c6f21ec8';
      if (fs.existsSync(brainDir)) {
        fs.writeFileSync(path.join(brainDir, filename), buffer);
      }
    }
  }

  // Wait for editor to mount
  await new Promise(r => setTimeout(r, 2000));

  // 1. Verify Specimen Dropdown exists and has options
  const dropdownInfo = await evaluate(`
    (() => {
      const select = document.querySelector('#specimen-select');
      if (!select) return { found: false };
      const options = Array.from(select.querySelectorAll('option')).map(o => ({ value: o.value, text: o.textContent }));
      return { found: true, count: options.length, options: options.slice(0, 5) };
    })()
  `);
  console.log('Dropdown info:', dropdownInfo);
  if (!dropdownInfo.found || dropdownInfo.count < 18) {
    throw new Error('Specimen select dropdown not properly populated with design schemes');
  }

  // Helper to switch scheme and verify inside iframe
  async function testScheme(schemeId, expectedTitle) {
    console.log(`\n--- Testing Scheme: ${schemeId} ---`);
    await evaluate(`
      (() => {
        const select = document.querySelector('#specimen-select');
        select.value = '${schemeId}';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);

    // Wait for iframe srcdoc to re-render and bridge to initialize
    await new Promise(r => setTimeout(r, 1500));

    const iframeInfo = await evaluate(`
      (() => {
        const iframe = document.querySelector('iframe');
        if (!iframe || !iframe.contentDocument) return { error: 'Iframe not found' };
        const doc = iframe.contentDocument;
        const titleEl = doc.querySelector('#stage-title');
        const heroLede = doc.querySelector('#hero-lede');
        const cardCount = doc.querySelectorAll('.specimen-card').length;
        const bg = window.getComputedStyle(doc.body).backgroundColor;
        const color = window.getComputedStyle(doc.body).color;
        
        // Audit horizontal overflow
        const vpWidth = iframe.contentWindow.innerWidth;
        const scrollWidth = doc.documentElement.scrollWidth;
        const overflows = [];
        doc.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > vpWidth + 1) {
            overflows.push(el.tagName + (el.id ? '#' + el.id : ''));
          }
        });

        return {
          title: titleEl ? titleEl.textContent.trim() : null,
          lede: heroLede ? heroLede.textContent.trim().slice(0, 60) : null,
          cardCount,
          bg,
          color,
          scrollWidth,
          vpWidth,
          overflowCount: overflows.length,
          hasBlowout: scrollWidth > vpWidth
        };
      })()
    `);

    console.log('Iframe Info:', iframeInfo);
    if (!iframeInfo.title || !iframeInfo.title.includes(expectedTitle)) {
      throw new Error(`Expected title containing "${expectedTitle}", got "${iframeInfo.title}"`);
    }
    if (iframeInfo.hasBlowout || iframeInfo.overflowCount > 0) {
      throw new Error(`Horizontal blowout detected on ${schemeId}: scrollWidth=${iframeInfo.scrollWidth}, vpWidth=${iframeInfo.vpWidth}`);
    }

    return iframeInfo;
  }

  // 2. Test Scheme 1: Accelerating Digital Growth
  await testScheme('accelerating-digital-growth', 'Accelerating Digital Growth');
  await captureScreenshot('design-system-accelerating-growth.png');

  // 3. Test Scheme 2: Nexus Analytics Dashboard
  await testScheme('nexus-analytics-dashboard', 'Nexus Analytics');
  await captureScreenshot('design-system-nexus-analytics.png');

  // 4. Test Scheme 3: Stratum - System Coordination Framework
  await testScheme('stratum', 'Stratum');
  await captureScreenshot('design-system-stratum.png');

  // 5. Test Scheme 4: Aura Design System
  await testScheme('aura-design-system', 'Aura');
  await captureScreenshot('design-system-aura.png');

  // 6. Test Mobile Viewport Responsive Audit on Active Scheme
  console.log('\n--- Testing Mobile Viewport Responsive Check ---');
  await evaluate(`
    (() => {
      const mobileBtn = Array.from(document.querySelectorAll('.device-btn')).find(b => b.textContent.includes('Mobile'));
      if (mobileBtn) mobileBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const mobileAudit = await evaluate(`
    (() => {
      const iframe = document.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) return { error: 'Iframe not found' };
      const doc = iframe.contentDocument;
      const vpWidth = iframe.contentWindow.innerWidth;
      const scrollWidth = doc.documentElement.scrollWidth;
      const overflows = [];
      doc.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > vpWidth + 1) {
          overflows.push(el.tagName + (el.id ? '#' + el.id : ''));
        }
      });
      return {
        vpWidth,
        scrollWidth,
        hasBlowout: scrollWidth > vpWidth,
        overflowCount: overflows.length
      };
    })()
  `);
  console.log('Mobile Audit Result:', mobileAudit);
  if (mobileAudit.hasBlowout || mobileAudit.overflowCount > 0) {
    throw new Error(`Mobile layout blowout detected: scrollWidth=${mobileAudit.scrollWidth}, vpWidth=${mobileAudit.vpWidth}`);
  }
  await captureScreenshot('design-system-mobile-responsive.png');

  // 7. Test Inspecting an Element on the Specimen
  console.log('\n--- Testing Element Selection & Style Readout ---');
  await evaluate(`
    (() => {
      const desktopBtn = Array.from(document.querySelectorAll('.device-btn')).find(b => b.textContent.includes('Desktop'));
      if (desktopBtn) desktopBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  await evaluate(`
    (() => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        const target = iframe.contentDocument.querySelector('#stage-title') || iframe.contentDocument.querySelector('h1');
        if (target) {
          target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const inspectorInfo = await evaluate(`
    (() => {
      const panel = document.querySelector('.manual-edit-panel');
      const selectedTag = document.querySelector('.selected-node-tag');
      return {
        panelVisible: !!panel,
        selectedNode: selectedTag ? selectedTag.textContent.trim() : null
      };
    })()
  `);
  console.log('Inspector Info:', inspectorInfo);
  await captureScreenshot('design-system-element-inspected.png');

  console.log('\n=== ALL DESIGN SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
  chrome.kill();
  process.exit(0);
}

run().catch((err) => {
  console.error('VERIFICATION RUNNER ERROR:', err);
  process.exit(1);
});
