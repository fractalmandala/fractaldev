import { spawn } from 'child_process';

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

  // Check if data-od-edit-mode is set on html
  const checkState = await send('Runtime.evaluate', {
    expression: `(() => {
      const iframe = document.querySelector('iframe');
      const doc = iframe.contentDocument;
      return JSON.stringify({
        editMode: doc ? doc.documentElement.getAttribute('data-od-edit-mode') : null,
        guidesLayer: doc ? !!doc.querySelector('[data-od-edit-guides-layer]') : false
      });
    })()`,
    returnByValue: true
  });
  console.log('State on load:', checkState.result?.value);

  // Now click on [data-od-id="stage-title"]
  const clickResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const iframe = document.querySelector('iframe');
      const doc = iframe.contentDocument;
      const el = doc.querySelector('[data-od-id="stage-title"]');
      if (!el) return 'Element not found';
      el.click();
      return 'Clicked ' + el.innerText;
    })()`,
    returnByValue: true
  });
  console.log('Click result:', clickResult.result?.value);

  await new Promise(r => setTimeout(r, 500));

  // Check if manual edit panel mounted
  const panelStatus = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.manual-edit-panel');
      const title = panel ? panel.querySelector('h4')?.innerText : null;
      const fontSize = panel ? panel.querySelector('.font-input')?.value : null;
      return JSON.stringify({
        mounted: !!panel,
        title: title,
        fontSize: fontSize,
        htmlText: panel ? panel.querySelector('textarea')?.value?.slice(0, 50) : null
      });
    })()`,
    returnByValue: true
  });
  console.log('Panel status after click:', panelStatus.result?.value);

  chrome.kill();
  process.exit(0);
}

run().catch(console.error);
