/*
 * 场景控制器运行时自检（不随包发布）：
 * 用最小假 DOM 真正执行 client.js 的 apply()，验证四层场景挂载、AI 状态转换、
 * hover/click 台词、visibility 暂停与卸载清理。
 * 运行：node .dev/scene-runtime.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const listeners = new Map();

class FakeElement {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = {
      _values: {},
      setProperty(name, value) { this._values[name] = String(value); },
      removeProperty(name) { delete this._values[name]; },
      getPropertyValue(name) { return this._values[name] || ''; },
    };
    this.dataset = {};
    this._class = '';
    this._text = '';
    this._listeners = new Map();
    this.isConnected = false;
  }
  get className() { return this._class; }
  set className(value) { this._class = String(value); }
  get src() { return this.getAttribute('src') || ''; }
  set src(value) { this.setAttribute('src', value); }
  get classList() {
    const self = this;
    return {
      add(name) { self._class = (self._class + ' ' + name).trim(); },
      remove(name) { self._class = self._class.split(/\s+/).filter((item) => item && item !== name).join(' '); },
      contains(name) { return self._class.split(/\s+/).includes(name); },
    };
  }
  get textContent() { return this._text; }
  set textContent(value) { this._text = String(value); }
  get firstChild() { return this.children[0] || null; }
  get firstElementChild() { return this.children[0] || null; }
  get innerHTML() { return ''; }
  set innerHTML(html) { parseInto(this, String(html)); }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this._class = String(value);
    if (name === 'data-empty') this.dataset.empty = String(value);
  }
  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; }
  hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name); }
  removeAttribute(name) { delete this.attributes[name]; }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  insertBefore(child, before) {
    child.parentNode = this;
    const index = this.children.indexOf(before);
    if (index < 0) this.children.push(child); else this.children.splice(index, 0, child);
    return child;
  }
  remove() {
    if (this.parentNode) {
      const index = this.parentNode.children.indexOf(this);
      if (index >= 0) this.parentNode.children.splice(index, 1);
    }
    this.parentNode = null;
    this.isConnected = false;
  }
  addEventListener(type, fn) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    const list = this._listeners.get(type) || [];
    this._listeners.set(type, list.filter((item) => item !== fn));
  }
  dispatch(type, event) {
    for (const fn of this._listeners.get(type) || []) fn(event);
  }
  closest() { return null; }
  getBoundingClientRect() {
    if (this._class.split(/\s+/).includes('dsh-suoming-character')) {
      return { left: 1000, top: 180, right: 1280, bottom: 660, width: 280, height: 480 };
    }
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }
  querySelector(selector) {
    for (const child of this.children) {
      if (matches(child, selector)) return child;
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }
  querySelectorAll(selector) {
    const out = [];
    const walk = (node) => {
      for (const child of node.children) {
        if (matches(child, selector)) out.push(child);
        walk(child);
      }
    };
    walk(this);
    return out;
  }
}

function matches(element, selector) {
  const sel = String(selector).trim();
  if (sel.startsWith('.')) return element.classList.contains(sel.slice(1));
  if (sel.startsWith('[data-empty')) return element.hasAttribute('data-empty');
  return element.tagName.toLowerCase() === sel.toLowerCase();
}

function parseInto(parent, html) {
  const tagRe = /<(\/?)([a-z0-9-]+)([^>]*)>/gi;
  const stack = [parent];
  let match;
  while ((match = tagRe.exec(html)) !== null) {
    const closing = match[1] === '/';
    const tag = match[2].toLowerCase();
    const attrs = match[3] || '';
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const element = new FakeElement(tag);
    const attrRe = /([a-zA-Z0-9-]+)(?:="([^"]*)")?/g;
    let attr;
    while ((attr = attrRe.exec(attrs)) !== null) {
      if (attr[0].trim() === '/') continue;
      element.setAttribute(attr[1], attr[2] === undefined ? '' : attr[2]);
    }
    stack[stack.length - 1].appendChild(element);
    if (tag !== 'img') stack.push(element);
  }
  markConnected(parent);
}

function markConnected(node) {
  node.isConnected = true;
  node.children.forEach(markConnected);
}

const host = new FakeElement('div');
host.isConnected = true;
markConnected(host);
const body = new FakeElement('body');
const documentElement = new FakeElement('html');
const state = { running: false, generating: false, error: false };
const aiMarker = new FakeElement('div');

const document = {
  cookie: '',
  hidden: false,
  documentElement,
  body,
  head: new FakeElement('head'),
  createElement(tag) { return new FakeElement(tag); },
  querySelector(selector) {
    if (selector === 'div:has(> [data-slot="main"])') return host;
    if (state.running && (selector === '[data-chat-running]' || selector.includes('aria-busy') || selector.includes('status'))) return aiMarker;
    if (state.generating && selector.includes('data-streaming')) return aiMarker;
    if (state.error && (selector.includes('data-error') || selector.includes('role="alert"'))) return aiMarker;
    return null;
  },
  addEventListener(type, fn) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  },
  removeEventListener(type, fn) {
    listeners.set(type, (listeners.get(type) || []).filter((item) => item !== fn));
  },
  dispatch(type, event) {
    for (const fn of listeners.get(type) || []) fn(event || {});
  },
};

const media = { matches: false, addEventListener() {}, removeEventListener() {} };
const window = {
  innerWidth: 1440,
  innerHeight: 900,
  devicePixelRatio: 1,
  localStorage: { _data: {}, getItem(k) { return this._data[k] ?? null; }, setItem(k, v) { this._data[k] = String(v); }, removeItem(k) { delete this._data[k]; } },
  matchMedia() { return media; },
  setTimeout: global.setTimeout.bind(global),
  clearTimeout: global.clearTimeout.bind(global),
  addEventListener() {},
  removeEventListener() {},
};

class FakeMO {
  constructor(callback) { this.callback = callback; FakeMO.last = this; }
  observe() {}
  disconnect() {}
  trigger() { this.callback([]); }
}

let configPayload = {
  settings: { intensity: 'balanced', portraitHeight: 55, portraitOffsetX: 0, portraitOpacity: 0.85, portraitEnabled: true, dialogueEnabled: true },
  assets: { portrait: true },
  persistence: 'profile-file',
};
const savedConfigs = [];
function fetch(url, options) {
  if (url === '/suoming-config' && (!options || !options.method)) {
    return Promise.resolve({ ok: true, json: async () => configPayload });
  }
  if (url === '/suoming-config' && options.method === 'PUT') {
    savedConfigs.push(JSON.parse(options.body));
    return Promise.resolve({ ok: true, json: async () => ({ settings: JSON.parse(options.body) }) });
  }
  return Promise.resolve({ ok: false });
}

global.window = window;
global.document = document;
global.MutationObserver = FakeMO;
global.fetch = fetch;
global.CSS = { supports: () => true };
window.__ModuleLoader__ = { load(module) { global.__loaded = module; } };

const source = fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8');
vm.runInThisContext(source, { filename: 'client.js' });

const disposers = [];
let registeredTheme = null;
const ctx = {
  effect(fn) { disposers.push(fn()); },
  on() { return () => {}; },
  locale: { register: () => () => {}, bind: () => (key) => key, subscribe: () => () => {} },
  theme: {
    register(definition) { registeredTheme = definition; return () => {}; },
    getTheme: () => ({ preference: 'suoming', active: { colorScheme: 'dark', tokens: {} }, themes: [], revision: 0 }),
    snapshot: () => ({ preference: 'suoming', active: { colorScheme: 'dark', tokens: {} }, themes: [], revision: 0 }),
    setTheme() {},
  },
  slots: {
    inject(owner, callback) { callback(); },
    register() { return () => {}; },
  },
};
const face = global.__loaded.factory(() => ({}));
face.apply(ctx);

const checks = [];
const check = (name, ok) => checks.push([name, ok]);
const scene = () => host.querySelector('.dsh-suoming-scene');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  await wait(60);
  check('scene mounted', !!scene());
  check('four layers mounted', !!scene() && ['l0', 'l1', 'l2', 'l3'].every((layer) => scene().querySelector('.dsh-suoming-' + layer) !== null));
  const portraitFace = () => scene() && scene().querySelector('.dsh-suoming-character');
  check('cutout portrait mounted', !!scene() && scene().querySelectorAll('.dsh-suoming-character-image').length === 1);
  check('character area mounted', !!portraitFace());
  check('umbrella sectors mounted', !!scene() && scene().querySelectorAll('.dsh-umbrella-sector').length === 8);
  check('chain svg mounted', !!scene() && scene().querySelector('.dsh-suoming-chain-svg') !== null);
  check('electro arcs mounted', !!scene() && scene().querySelectorAll('.dsh-electro-arc').length >= 2);
  check('state idle initially', !!scene() && scene().getAttribute('data-state') === 'idle');

  document.dispatch('pointermove', { pointerType: 'mouse', clientX: 1180, clientY: 320, target: host });
  check('hover state near portrait', scene().getAttribute('data-state') === 'hover');
  check('hover dialogue', scene().querySelector('.dsh-suoming-dialogue').getAttribute('data-visible') === 'true');

  state.running = true;
  FakeMO.last.trigger();
  await wait(140);
  check('thinking on run start', scene().getAttribute('data-state') === 'thinking');

  state.generating = true;
  FakeMO.last.trigger();
  await wait(140);
  check('generating while streaming', scene().getAttribute('data-state') === 'generating');

  state.running = false;
  state.generating = false;
  FakeMO.last.trigger();
  await wait(900);
  check('success after completion', scene().getAttribute('data-state') === 'success');
  check('success dialogue', scene().querySelector('.dsh-suoming-dialogue').getAttribute('data-visible') === 'true');

  await wait(2600);
  document.dispatch('mouseleave');
  await wait(40);
  check('returns idle after success', scene().getAttribute('data-state') === 'idle');

  document.dispatch('click', { clientX: 1160, clientY: 320, target: host });
  check('click state', scene().getAttribute('data-state') === 'click');

  await wait(220);
  state.running = true;
  state.error = true;
  FakeMO.last.trigger();
  await wait(140);
  state.running = false;
  FakeMO.last.trigger();
  await wait(900);
  check('error state after failed run', scene().getAttribute('data-state') === 'error');
  check('error dialogue', scene().querySelector('.dsh-suoming-dialogue').getAttribute('data-visible') === 'true');

  state.error = false;
  document.hidden = true;
  document.dispatch('visibilitychange');
  check('paused when hidden', scene().getAttribute('data-state') === 'paused');

  disposers.forEach((dispose) => { if (typeof dispose === 'function') dispose(); });
  check('scene removed on dispose', !host.querySelector('.dsh-suoming-scene'));
  check('host class removed', !host.classList.contains('dsh-suoming-scene-host'));
  check('config PUT attempted', savedConfigs.length > 0);

  let failed = 0;
  for (const [name, ok] of checks) {
    if (!ok) failed += 1;
    console.log((ok ? 'ok  ' : 'FAIL') + ' ' + name);
  }
  console.log(`\nscene checks: ${checks.length - failed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})();
