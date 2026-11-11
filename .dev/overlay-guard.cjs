/*
 * 回归：主题属性丢失时，插件注入的图层不得把裸立绘铺满屏幕。
 * 复现用户报告："停留一段时间后整屏被一张长图盖住，只能重启 DSH"。
 * 用法：node .dev/overlay-guard.cjs   （需要本机 Chrome）
 */
const { spawn } = require('child_process');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NODE = process.execPath;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const cssPath = path.join(process.env.TEMP, 'suoming-real.css');

execFileSync(NODE, [path.join(__dirname, 'smoke.cjs')], {
  cwd: ROOT,
  env: { ...process.env, SUOMING_DUMP_CSS: cssPath },
  stdio: 'ignore',
});
const css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('html:not([data-dsh-suoming]) .dsh-suoming-right-art')) {
  console.error('FAIL: 真实样式表里没有图层保底规则');
  process.exit(1);
}

/* 长立绘：模拟官方长图比例（远高于视口） */
const longImg = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="3840"><rect width="2160" height="3840" fill="#7a1420"/></svg>',
);
const page = `<!doctype html><html data-dsh-suoming><head><meta charset="utf-8"><style>${css}
html,body{margin:0;padding:0;background:#0d0c0e}</style></head><body>
<div class="dsh-suoming-right-art" aria-hidden="true"><img src="${longImg}" alt=""></div>
<div class="dsh-suoming-global"><div class="dsh-suoming-global-image" style="background:url('${longImg}')"></div></div>
<script>
window.__probe = () => {
  const img = document.querySelector('.dsh-suoming-right-art img');
  const box = document.querySelector('.dsh-suoming-right-art');
  const r = img.getBoundingClientRect();
  const b = box.getBoundingClientRect();
  const cs = getComputedStyle(box);
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules = [];
    try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const rule of rules) {
      if (!rule.selectorText || !rule.style || !rule.style.display) continue;
      try { if (box.matches(rule.selectorText)) hits.push(rule.selectorText + ' => ' + rule.style.display); } catch (e) { /* ignore */ }
    }
  }
  return {
    imgW: Math.round(r.width), imgH: Math.round(r.height),
    boxW: Math.round(b.width), boxH: Math.round(b.height),
    boxDisplay: cs.display, boxPosition: cs.position,
    displayRules: hits,
    viewport: innerWidth + 'x' + innerHeight,
    areaRatio: +((r.width * r.height) / (innerWidth * innerHeight)).toFixed(2),
  };
};
</script></body></html>`;
const pagePath = path.join(process.env.TEMP, 'sm-overlay-guard.html');
fs.writeFileSync(pagePath, page, 'utf8');

/* 对照组：去掉保底规则，应当复现"裸长图铺满屏幕" */
const controlCss = css.replace(/html:not\(\[data-dsh-suoming\]\)[^{]*\{display:none\}/, '');
if (controlCss === css) {
  console.error('FAIL: 无法构造对照组（未找到保底规则）');
  process.exit(1);
}
const controlPath = path.join(process.env.TEMP, 'sm-overlay-control.html');
fs.writeFileSync(controlPath, page.replace(css, controlCss), 'utf8');

const stamp = Date.now();
const ud = path.join(process.env.TEMP, `sm-guard-chrome-${stamp}`);
const port = 9400 + (stamp % 300);
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${ud}`,
  '--no-first-run', '--disable-gpu', '--no-default-browser-check', '--window-size=1440,900', 'about:blank'],
{ stdio: 'ignore', detached: true });
proc.unref();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break; } catch { /* wait */ }
    await sleep(350);
  }
  const url = 'file:///' + pagePath.replace(/\\/g, '/');
  const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then((r) => r.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); ws.send(JSON.stringify({ id: n, method, params })); });
  const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;

  await send('Runtime.enable');
  await sleep(1000);
  const themed = await evalJs('window.__probe()');
  await evalJs("document.documentElement.removeAttribute('data-dsh-suoming')");
  await sleep(250);
  const unthemed = await evalJs('window.__probe()');
  ws.close();

  /* 对照组 */
  const controlUrl = 'file:///' + controlPath.replace(/\\/g, '/');
  const controlTarget = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(controlUrl)}`, { method: 'PUT' }).then((r) => r.json());
  const ws2 = new WebSocket(controlTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws2.onopen = res; ws2.onerror = rej; });
  let cid = 0; const cpending = new Map();
  ws2.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && cpending.has(m.id)) { const p = cpending.get(m.id); cpending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  const csend = (method, params = {}) => new Promise((resolve, reject) => { const n = ++cid; cpending.set(n, { resolve, reject }); ws2.send(JSON.stringify({ id: n, method, params })); });
  const ceval = async (expr) => (await csend('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
  await csend('Runtime.enable');
  await sleep(900);
  await ceval("document.documentElement.removeAttribute('data-dsh-suoming')");
  await sleep(250);
  const control = await ceval('window.__probe()');
  ws2.close();

  try { process.kill(-proc.pid); } catch { /* best effort */ }

  const results = [];
  results.push(['对照：无保底规则时裸图铺满屏幕', control.areaRatio > 1]);
  results.push(['主题启用时右立绘被约束', themed.areaRatio < 0.35 && themed.boxPosition === 'fixed']);
  results.push(['属性丢失后图层隐藏', unthemed.boxDisplay === 'none']);
  results.push(['属性丢失后裸图不再铺屏', unthemed.areaRatio === 0]);

  console.log('control :', JSON.stringify(control));
  console.log('themed  :', JSON.stringify(themed));
  console.log('unthemed:', JSON.stringify(unthemed));
  let failed = 0;
  for (const [name, ok] of results) {
    console.log((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) failed += 1;
  }
  console.log(`overlay guard: ${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); try { process.kill(-proc.pid); } catch { /* ignore */ } process.exit(1); });
