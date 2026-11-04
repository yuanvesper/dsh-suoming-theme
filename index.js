/**
 * 锁暝主题 Host 半部分。
 *
 * 职责（本轮新增）：
 *  1. `/suoming-local-art/<file>`：只读白名单本地素材路由，供 L2 立绘/表情层使用；
 *     素材从不进入 bundle 包，公开包内没有图片时路由返回 404，Client 自动降级为无立绘场景。
 *  2. `/suoming-config`：GET/PUT 读取/保存本主题的 profile 专属设置（JSON），
 *     写入 `$DSH_PROFILE_DIR/suoming-theme/config.json`（临时文件 + rename 原子替换）。
 *
 * 安全边界：只发送白名单文件名；不提供目录浏览；路径规范化后禁止越界；
 * 配置只接受固定字段与范围；请求体上限 16KB；仅 GET/HEAD/PUT。
 */
import { stat, readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const BUNDLE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ART_PREFIX = '/suoming-local-art';
const CONFIG_PATH = '/suoming-config';
const MAX_BODY = 16_384;

const ART_NAMES = Object.freeze([
  'portrait.png',
  'side.jpg',
  'char.jpg',
  'side.png',
  'char.png',
  'side.webp',
  'char.webp',
  'side-error.jpg',
  'char-error.jpg',
]);

const MIME = Object.freeze({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
});

const DEFAULTS = Object.freeze({
  intensity: 'balanced',
  portraitHeight: 62,
  portraitOffsetX: 0,
  portraitOpacity: 0.82,
  portraitEnabled: true,
  dialogueEnabled: true,
});

const RANGES = Object.freeze({
  portraitHeight: [30, 80],
  portraitOffsetX: [-50, 50],
  portraitOpacity: [0.2, 1],
});

function clampNumber(value, [min, max], fallback) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number * 100) / 100));
}

/** 纯函数：校验并归一化 Client 传来的设置。导出用于开发期单测。 */
export function normalizeSettings(input) {
  const source = input && typeof input === 'object' ? input : {};
  const intensity = ['minimal', 'balanced', 'immersive'].includes(source.intensity)
    ? source.intensity
    : DEFAULTS.intensity;
  return {
    intensity,
    portraitHeight: clampNumber(source.portraitHeight, RANGES.portraitHeight, DEFAULTS.portraitHeight),
    portraitOffsetX: clampNumber(source.portraitOffsetX, RANGES.portraitOffsetX, DEFAULTS.portraitOffsetX),
    portraitOpacity: clampNumber(source.portraitOpacity, RANGES.portraitOpacity, DEFAULTS.portraitOpacity),
    portraitEnabled: source.portraitEnabled !== false,
    dialogueEnabled: source.dialogueEnabled !== false,
  };
}

function profileDir() {
  if (process.env.DSH_PROFILE_DIR) return process.env.DSH_PROFILE_DIR;
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(home, 'profiles', process.env.DSH_PROFILE || 'desktop');
}

function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
}

function settingsFile() {
  const dir = profileDir();
  return dir ? path.join(dir, 'suoming-theme', 'config.json') : '';
}

function assetDirectories() {
  const directories = [];
  if (process.env.SUOMING_LOCAL_ART) directories.push(process.env.SUOMING_LOCAL_ART);
  const profile = profileDir();
  if (profile) directories.push(path.join(profile, 'suoming-theme', 'assets'));
  directories.push(path.join(dshHome(), 'suoming-theme', 'assets'));
  directories.push(path.join(BUNDLE_DIR, 'assets'));
  directories.push(path.join(BUNDLE_DIR, '..', 'suoming-theme-dev', 'local-art'));
  return [...new Set(directories)];
}

async function findAsset(name) {
  if (!ART_NAMES.includes(name)) return null;
  for (const directory of assetDirectories()) {
    const target = path.join(directory, name);
    if (!path.resolve(target).startsWith(path.resolve(directory) + path.sep)) continue;
    try {
      const info = await stat(target);
      if (info.isFile()) return { target, size: info.size, mtime: info.mtime.toUTCString() };
    } catch {
      /* import: candidate directory may not exist */
    }
  }
  return null;
}

async function assetStatus() {
  const found = {};
  for (const name of ART_NAMES) {
    /* Sequential by design: candidates are few and this runs only on config GET. */
    // eslint-disable-next-line no-await-in-loop
    found[name] = (await findAsset(name)) !== null;
  }
  return {
    portrait: found['portrait.png'] || found['side.jpg'] || found['side.png'] || found['char.jpg'] || found['char.png'] || found['char.webp'],
    expression: found['side-error.jpg'] || found['char-error.jpg'],
    files: found,
  };
}

function sendJson(response, status, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(body.length),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(body);
}

function serveAsset(request, response, name) {
  findAsset(name).then((asset) => {
    if (!asset) {
      response.writeHead(404, { 'cache-control': 'no-store' });
      response.end();
      return;
    }
    const contentType = MIME[path.extname(asset.target).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, {
      'content-type': contentType,
      'content-length': String(asset.size),
      'cache-control': 'private, max-age=0, must-revalidate',
      'last-modified': asset.mtime,
      'x-content-type-options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    readFile(asset.target).then((body) => response.end(body)).catch(() => {
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  }).catch(() => {
    if (!response.headersSent) response.writeHead(500);
    response.end();
  });
}

async function readSettings() {
  const file = settingsFile();
  if (!file) return { ...DEFAULTS };
  try {
    return normalizeSettings(JSON.parse(await readFile(file, 'utf8')));
  } catch {
    return { ...DEFAULTS };
  }
}

async function writeSettings(settings) {
  const file = settingsFile();
  if (!file) throw new Error('DSH_PROFILE_DIR unavailable');
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, JSON.stringify(settings, null, 2) + '\n', 'utf8');
    await rename(temporary, file);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('body too large'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function handleConfig(request, response) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    Promise.all([readSettings(), assetStatus()]).then(([settings, assets]) => {
      if (request.method === 'HEAD') {
        response.writeHead(200, { 'cache-control': 'no-store' });
        response.end();
        return;
      }
      sendJson(response, 200, { settings, assets, persistence: settingsFile() ? 'profile-file' : 'unavailable' });
    }).catch(() => sendJson(response, 500, { error: 'config unavailable' }));
    return;
  }
  if (request.method !== 'PUT') {
    response.writeHead(405, { allow: 'GET, HEAD, PUT', 'cache-control': 'no-store' });
    response.end();
    return;
  }
  if (!String(request.headers['content-type'] || '').includes('application/json')) {
    sendJson(response, 415, { error: 'application/json required' });
    return;
  }
  readBody(request).then((body) => {
    if (body.length > MAX_BODY) return sendJson(response, 413, { error: 'body too large' });
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return sendJson(response, 400, { error: 'invalid JSON' });
    }
    const settings = normalizeSettings(parsed);
    return writeSettings(settings).then(() => sendJson(response, 200, { settings, persistence: 'profile-file' }));
  }).catch(() => sendJson(response, 400, { error: 'invalid request' }));
}

export const inject = ['webServer'];

export function apply(ctx) {
  const webServer = ctx.webServer || ctx.get('webServer');
  if (!webServer || typeof webServer.register !== 'function') return;
  const dispose = () => {
    const disposers = [];
    try {
      disposers.push(webServer.register({
        kind: 'prefix',
        path: ART_PREFIX,
        handler: (request, response) => {
          if (request.method !== 'GET' && request.method !== 'HEAD') {
            response.writeHead(405, { allow: 'GET, HEAD' });
            response.end();
            return;
          }
          const pathname = String(request.url || '').split('?')[0];
          const normalized = pathname.replace(/^\/+|\/+$/g, '');
          const name = normalized.startsWith('suoming-local-art/')
            ? normalized.slice('suoming-local-art/'.length)
            : normalized;
          if (!ART_NAMES.includes(name)) {
            response.writeHead(404, { 'cache-control': 'no-store' });
            response.end();
            return;
          }
          serveAsset(request, response, name);
        },
      }));
      disposers.push(webServer.register({ kind: 'exact', path: CONFIG_PATH, handler: handleConfig }));
    } catch {
      disposers.forEach((disposer) => disposer());
      return;
    }
    return () => disposers.forEach((disposer) => disposer());
  };
  if (typeof ctx.effect === 'function') {
    ctx.effect(dispose, 'suoming: local art and settings routes');
  } else {
    dispose();
  }
}

export const __testing = { ART_NAMES, DEFAULTS, RANGES, normalizeSettings };
