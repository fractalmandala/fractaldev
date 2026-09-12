import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=/tmp/chrome-test-profile-' + Date.now(),
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/editor'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.url.includes('/editor'));
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

  await new Promise(r => setTimeout(r, 2500));

  // Click on Mobile button
  const mobileClick = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText?.includes('Mobile'));
      if (btn) { btn.click(); return 'clicked mobile'; }
      return 'mobile button not found';
    })()`,
    returnByValue: true
  });
  console.log('Mobile click:', mobileClick.result?.value);

  // Wait 1s for resize
  await new Promise(r => setTimeout(r, 1000));

  // Capture screenshot of mobile view
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot.data) {
    fs.mkdirSync('evals/screenshots', { recursive: true });
    fs.writeFileSync('evals/screenshots/eval-1-mobile.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved evals/screenshots/eval-1-mobile.png');
  }

  // Check metrics inside iframe
  const metrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const iframe = document.querySelector('iframe');
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      const stage = doc.querySelector('.stage');
      const vitrine = doc.querySelector('.vitrine');
      const dossier = doc.querySelector('.dossier');
      return JSON.stringify({
        iframeInnerWidth: win.innerWidth,
        docScrollWidth: doc.documentElement.scrollWidth,
        stageDisplay: stage ? win.getComputedStyle(stage).display : null,
        stageGridCols: stage ? win.getComputedStyle(stage).gridTemplateColumns : null,
        vitrineWidth: vitrine ? win.getComputedStyle(vitrine).width : null,
        dossierWidth: dossier ? win.getComputedStyle(dossier).width : null
      });
    })()`,
    returnByValue: true
  });
  console.log('Mobile metrics:', metrics.result?.value);

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
