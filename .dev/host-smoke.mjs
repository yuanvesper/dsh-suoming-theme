/*
 * Host 半部分自检（不随包发布）：
 *  - normalizeSettings 的默认值 / 范围 / 合法枚举；
 *  - 通过真实 webServer.register 路由处理一次本地立绘 GET 与一次配置 GET/PUT（临时 profile 目录）。
 * 运行：node .dev/host-smoke.mjs
 */
import { EventEmitter } from 'node:events';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apply, inject, normalizeSettings, __testing } from '../index.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const profile = await mkdtemp(path.join(os.tmpdir(), 'suoming-profile-'));
process.env.DSH_PROFILE_DIR = profile;

const responses = [];
function fakeResponse() {
  const state = { status: 0, headers: {}, body: Buffer.alloc(0) };
  return {
    writeHead(status, headers = {}) { state.status = status; state.headers = headers; },
    end(chunk) {
      if (chunk) state.body = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      responses.push(state);
    },
    get headersSent() { return state.status !== 0; },
    state,
  };
}
function fakeRequest(method, url, body) {
  const request = new EventEmitter();
  request.method = method;
  request.url = url;
  request.headers = body ? { 'content-type': 'application/json' } : {};
  queueMicrotask(() => {
    if (body) request.emit('data', Buffer.from(body));
    request.emit('end');
  });
  return request;
}
const routes = [];
const disposers = [];
const ctx = {
  webServer: {
    register(route) {
      routes.push(route);
      return () => {};
    },
  },
  get(name) { return name === 'webServer' ? ctx.webServer : undefined; },
  effect(fn) { disposers.push(fn()); },
};
apply(ctx);

const checks = [];
const check = (name, ok) => checks.push([name, ok]);
check('inject webServer', Array.isArray(inject) && inject.includes('webServer'));
check('two routes registered', routes.length === 2 && routes.some((route) => route.path === '/suoming-config'));
check('art route prefix', routes.some((route) => route.path === '/suoming-local-art' && route.kind === 'prefix'));

check('defaults', JSON.stringify(normalizeSettings({})) === JSON.stringify(__testing.DEFAULTS));
const clamped = normalizeSettings({ intensity: 'bad', portraitHeight: 999, portraitOffsetX: -999, portraitOpacity: 0 });
check('clamp height 30..80', clamped.portraitHeight === 80);
check('clamp offset -50..50', clamped.portraitOffsetX === -50);
check('clamp opacity .2..1', clamped.portraitOpacity === 0.2);
check('invalid intensity fallback', clamped.intensity === 'balanced');

const artRoute = routes.find((route) => route.path === '/suoming-local-art');
const artResponse = fakeResponse();
artRoute.handler(
  Object.assign(fakeRequest('GET', '/suoming-local-art/side.jpg'), { headers: {} }),
  artResponse,
);
await new Promise((resolve) => setTimeout(resolve, 120));
check('local portrait served', artResponses(artResponse).status === 200 && artResponses(artResponse).headers['content-type'] === 'image/jpeg');
check('local portrait has bytes', artResponses(artResponse).body.length > 1000);
const strippedResponse = fakeResponse();
artRoute.handler(fakeRequest('GET', 'side.jpg'), strippedResponse);
await new Promise((resolve) => setTimeout(resolve, 120));
check('prefix-stripped URL served', strippedResponse.state.status === 200 && strippedResponse.state.body.length > 1000);

const unknownResponse = fakeResponse();
artRoute.handler(fakeRequest('GET', '/suoming-local-art/../../etc/passwd'), unknownResponse);
await new Promise((resolve) => setTimeout(resolve, 40));
check('traversal blocked', unknownResponse.state.status === 404);

const configRoute = routes.find((route) => route.path === '/suoming-config');
const getResponse = fakeResponse();
configRoute.handler(fakeRequest('GET', '/suoming-config'), getResponse);
await new Promise((resolve) => setTimeout(resolve, 40));
const initial = JSON.parse(getResponse.state.body.toString() || '{}');
check('config GET profile-file', initial.persistence === 'profile-file');
check('config GET defaults', initial.settings && initial.settings.portraitHeight === 62);

const putResponse = fakeResponse();
configRoute.handler(
  fakeRequest('PUT', '/suoming-config', JSON.stringify({ portraitHeight: 72, portraitOpacity: 0.6, intensity: 'immersive' })),
  putResponse,
);
await new Promise((resolve) => setTimeout(resolve, 120));
const persisted = JSON.parse(await readFile(path.join(profile, 'suoming-theme', 'config.json'), 'utf8'));
check('config PUT writes file', putResponse.state.status === 200 && persisted.portraitHeight === 72 && persisted.intensity === 'immersive');
check('config PUT validated opacity', persisted.portraitOpacity === 0.6);

await rm(profile, { recursive: true, force: true });
disposers.forEach((dispose) => { if (typeof dispose === 'function') dispose(); });

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log((ok ? 'ok  ' : 'FAIL') + ' ' + name);
}
console.log(`\nhost checks: ${checks.length - failed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

function artResponses(response) {
  return response.state;
}
