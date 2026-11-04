/*
 * 开发期组件渲染测试（不随 bundle 发布，需要临时目录中的 react/react-dom）：
 * 用真实 React 18 的 renderToStaticMarkup 渲染「锁暝主题」设置行与欢迎台词，
 * 覆盖：未启用 / 已启用、空白会话 / 非空白会话 四种组合，确保组件不抛错、
 * props 与 aria 状态正确。
 *
 * 运行：$env:SUOMING_REACT_DIR="<临时目录>" ; node .dev/render.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const REACT_DIR = process.env.SUOMING_REACT_DIR;
if (!REACT_DIR) throw new Error('SUOMING_REACT_DIR is not set');
const React = require(path.join(REACT_DIR, 'node_modules', 'react'));
const { renderToStaticMarkup } = require(path.join(REACT_DIR, 'node_modules', 'react-dom', 'server'));

const styles = [];
const htmlAttrs = new Map();
global.window = {
  __ModuleLoader__: {
    load(module) {
      global.__loaded = module;
    },
  },
  localStorage: {
    _data: {},
    getItem(key) {
      return this._data[key] ?? null;
    },
    setItem(key, value) {
      this._data[key] = String(value);
    },
    removeItem(key) {
      delete this._data[key];
    },
  },
  setTimeout: global.setTimeout.bind(global),
  clearTimeout: global.clearTimeout.bind(global),
};
global.document = {
  cookie: '',
  documentElement: {
    setAttribute(name, value) {
      htmlAttrs.set(name, value);
    },
    removeAttribute(name) {
      htmlAttrs.delete(name);
    },
    hasAttribute(name) {
      return htmlAttrs.has(name);
    },
  },
  head: {
    appendChild(tag) {
      styles.push(tag);
    },
  },
  createElement() {
    return {
      dataset: {},
      textContent: '',
      remove() {
        const index = styles.indexOf(this);
        if (index >= 0) styles.splice(index, 1);
      },
    };
  },
};

let registeredTheme = null;
const registrations = [];
let preference = 'system';
let setThemeCalls = [];
const fakeCtx = {
  effect(fn) {
    const dispose = fn();
    return typeof dispose === 'function' ? dispose : () => {};
  },
  on() {
    return () => {};
  },
  locale: {
    register: () => () => {},
    bind: (ns) => (key) => ns + ':' + key,
    subscribe: () => () => {},
  },
  theme: {
    getTheme() {
      return {
        preference,
        active: preference === 'suoming' ? registeredTheme : { id: 'dark', colorScheme: 'dark', tokens: {} },
        themes: registeredTheme ? [registeredTheme] : [],
        revision: 0,
      };
    },
    register(definition) {
      registeredTheme = definition;
      return () => {};
    },
    setTheme(id) {
      setThemeCalls.push(id);
      preference = id;
    },
  },
  slots: {
    inject(owner, callback) {
      callback();
    },
    register(options, Component) {
      registrations.push({ options, Component });
      return () => {};
    },
  },
};

vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8'), { filename: 'client.js' });
const face = global.__loaded.factory((name) => {
  if (name === 'react') return React;
  throw new Error('unexpected module: ' + name);
});
face.apply(fakeCtx);

const row = registrations.find((r) => r.options.name === 'settings.general.item').Component;
const quote = registrations.find((r) => r.options.name === 'conversation.input.dock').Component;
const heroBrand = registrations.find((r) => r.options.name === 'conversation.hero.brand.mark').Component;
const pulseOverlay = registrations.find((r) => r.options.name === 'shell.overlay').Component;

const checks = [];
function check(name, ok) {
  checks.push([name, ok]);
}

preference = 'system';
const rowInactive = renderToStaticMarkup(React.createElement(row, {}));
check('row renders inactive', rowInactive.includes('aria-pressed="false"'));
check('row title localized', rowInactive.includes('settings.suoming:row.title'));
check('row shows enable action', rowInactive.includes('settings.suoming:cube.off'));
check('row hides reset when inactive', !rowInactive.includes('settings.suoming:cube.reset'));
check('row has 3 swatches', (rowInactive.match(/dsh-suoming-swatch"/g) || []).length === 3);

preference = 'suoming';
const rowActive = renderToStaticMarkup(React.createElement(row, {}));
check('row renders active', rowActive.includes('aria-pressed="true"'));
check('row marks selected cube', rowActive.includes('is-selected'));
check('row shows reset when active', rowActive.includes('settings.suoming:cube.reset'));
check('row active scene controls', rowActive.includes('dsh-suoming-sceneControls') && rowActive.includes('type="range"') && rowActive.includes('scene.intensity'));
check('row inactive hides scene controls', !rowInactive.includes('dsh-suoming-sceneControls'));

preference = 'system';
const quoteInactive = renderToStaticMarkup(React.createElement(quote, { session: { blank: true } }));
check('quote hidden while theme inactive', quoteInactive === '');

preference = 'suoming';
const quoteVisible = renderToStaticMarkup(React.createElement(quote, { session: { blank: true } }));
check('quote visible on blank session', quoteVisible.includes('dsh-suoming-quote') && quoteVisible.includes('settings.suoming:quote.text'));
check('quote has byline', quoteVisible.includes('settings.suoming:quote.by'));

const quoteNonBlank = renderToStaticMarkup(React.createElement(quote, { session: { blank: false } }));
check('quote hidden on non-blank session', quoteNonBlank === '');

const heroMarkup = renderToStaticMarkup(React.createElement(heroBrand, { size: 34 }));
check('hero brand renders svg', heroMarkup.startsWith('<svg') && !heroMarkup.includes('<img'));
check('hero brand has iris + core', heroMarkup.includes('dsh-suoming-iris') && heroMarkup.includes('dsh-suoming-core'));
check('hero brand has vertical light lines', heroMarkup.includes('M32 3v13M32 48v13'));

const pulseMarkup = renderToStaticMarkup(React.createElement(pulseOverlay, {}));
check('pulse overlay renders canvas', pulseMarkup.startsWith('<canvas') && pulseMarkup.includes('dsh-suoming-pulse'));

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
}
console.log('\nrendered row (inactive, truncated):\n' + rowInactive.slice(0, 500));
process.exit(failed === 0 ? 0 : 1);
