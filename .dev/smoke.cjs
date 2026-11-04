/*
 * 开发期最小化冒烟测试（不随 bundle 发布）：
 * 用假 window/document/ctx 加载 client.js 并执行 apply()，确认：
 *   1) 主题注册、设置行与欢迎行两个槽位注册都发生且无异常；
 *   2) 全局样式表被注入，装饰作用域 / 锁链纹理 / pointer-events 存在；
 *   3) 主题定义覆盖了关键令牌（背景/边框/按钮/链接/代码/侧边栏/语法）。
 * 运行：node .dev/smoke.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
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

/* 第二批：color-mix 特性检测双路径测试。
 * 默认模拟“支持 color-mix”；SUOMING_NO_COLOR_MIX=1 时模拟不支持，走 rgba fallback。 */
const forceNoMix = process.env.SUOMING_NO_COLOR_MIX === '1';
global.CSS = { supports: () => !forceNoMix };

let registeredTheme = null;
const registrations = [];
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
      return { preference: 'system', active: { colorScheme: 'dark', tokens: {} }, themes: [], revision: 0 };
    },
    register(definition) {
      registeredTheme = definition;
      return () => {};
    },
    setTheme() {},
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

const source = fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8');
vm.runInThisContext(source, { filename: 'client.js' });

const loaded = global.__loaded;
const checks = [];
checks.push(['client module id', !!loaded && loaded.id === '@local/dsh-theme-suoming']);
const face = loaded.factory(() => ({}));
checks.push(['inject face', Array.isArray(face.inject) && face.inject.includes('slots') && face.inject.includes('theme')]);
checks.push(['apply exported', typeof face.apply === 'function']);
face.apply(fakeCtx);

checks.push([
  'theme registered',
  !!registeredTheme && registeredTheme.id === 'suoming' && registeredTheme.colorScheme === 'dark',
]);
const tokens = registeredTheme ? registeredTheme.tokens : {};
checks.push(['token count >= 100', Object.keys(tokens).length >= 100]);
for (const token of [
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l3',
  '--dsw-alias-button-primary-fill',
  '--dsw-alias-link',
  '--dsw-alias-label-primary',
  '--dsw-alias-markdown-code-block',
  '--dsw-alias-markdown-inline-code',
  '--shiki-token-keyword',
  '--shiki-token-string',
  '--dsw-specific-sidebar-nav-item-active',
  '--dsw-specific-sidebar-fill',
  '--dsw-specific-input-major',
  '--dsw-alias-state-business-primary',
]) {
  checks.push(['token ' + token, typeof tokens[token] === 'string' && tokens[token].length > 0]);
}
const rowReg = registrations.find((r) => r.options.name === 'settings.general.item');
const quoteReg = registrations.find((r) => r.options.name === 'conversation.input.dock');
const brandReg = registrations.find((r) => r.options.name === 'sidebar.brand.mark');
const heroBrandReg = registrations.find((r) => r.options.name === 'conversation.hero.brand.mark');
const pulseReg = registrations.find((r) => r.options.name === 'shell.overlay' && r.options.id === 'suoming-pulse');
checks.push(['settings row registered', !!rowReg && rowReg.options.id === 'suoming-theme' && rowReg.options.order > 10]);
checks.push(['welcome line registered', !!quoteReg && quoteReg.options.id === 'suoming-quote']);
checks.push(['brand mark registered', !!brandReg && typeof brandReg.Component === 'function']);
checks.push(['hero lock-core mark registered', !!heroBrandReg && typeof heroBrandReg.Component === 'function']);
checks.push(['pulse overlay registered', !!pulseReg && typeof pulseReg.Component === 'function']);
checks.push(['theme row component', !!rowReg && typeof rowReg.Component === 'function']);
checks.push(['quote component', !!quoteReg && typeof quoteReg.Component === 'function']);
checks.push(['stylesheet injected', styles.length === 1 && styles[0].textContent.length > 1000]);
const css = styles[0] ? styles[0].textContent : '';
checks.push(['css braces balanced', (css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length]);
checks.push(['decoration scoped', css.includes('html[data-dsh-suoming]') && css.includes('[data-slot="sidebar"]')]);
checks.push(['fallback token layer', css.includes('html[data-dsh-suoming] body[data-dsh-suoming]{--dsw-alias-bg-base:#0d0c0e;')]);
checks.push(['build marker token', tokens['--dsh-suoming-build'] === '3.5.0']);
checks.push(['chain texture present', css.includes('data:image/svg+xml')]);
checks.push(['row styles present', css.includes('.dsh-suoming-row')]);
checks.push(['quote styles present', css.includes('.dsh-suoming-quote')]);
checks.push(['ink skeleton bottom-up', css.includes('at 50% 118%') && css.includes('at 50% 122%')]);
checks.push(['no packaged raster data', !css.includes('data:image/jpeg') && !css.includes('skin-assets')]);
checks.push(['code lock glyphs', (css.match(/data:image\/svg\+xml/g) || []).length >= 6]);
checks.push(['skin composer frame', css.includes('[data-composer-card]') && css.includes('[data-composer-card]::before')]);
checks.push(['skin hero phase art', css.includes(':has([data-phase="hero"])')]);
checks.push(['pointer-events none', (css.match(/pointer-events:none/g) || []).length >= 2]);
checks.push(['no overflow/layout forcing', !css.includes('!important') && (css.match(/position:fixed/g) || []).length >= 1 && css.includes('.dsh-suoming-pulse{position:fixed') && css.includes('.dsh-suoming-corner-lock{position:fixed')]);

/* 第三批：图形形状与结构性装饰 */
checks.push(['chain tile lock shape', source.includes('M3.3 12V7.4h5.4V12') && source.includes('M6 13.6v3') && !source.includes('rotate(-12 6 5.5)')]);
checks.push(['standalone gold lock svg', source.includes('M6 21V9.5h12V21')]);
checks.push(['xuanzhu lock svg', source.includes('rotate(60 120 120)') && source.includes('rotate(120 120 120)')]);
checks.push(['hero pupil lock-core svg', source.includes('dsh-suoming-iris') && source.includes('dsh-suoming-core') && source.includes('M32 3v13M32 48v13')]);
checks.push(['focus contraction css', css.includes('--dsh-focus-line-w:84%') && css.includes('background-size 280ms')]);
checks.push(['hero mark styles', css.includes('.dsh-suoming-hero-mark')]);

/* 第四批：液态玻璃 */
checks.push(['glass edge refraction filter', source.includes('feTurbulence') && source.includes('feGaussianBlur') && source.includes('feDisplacementMap') && source.includes('feImage')]);
checks.push(['glass edge ring ~12%', css.includes('calc(100% - 24px)')]);
checks.push(['glass chromatic ring', css.includes('conic-gradient(from 210deg') && css.includes('mask-composite:exclude') && css.includes('calc(100% - 4px)')]);
checks.push(['glass dark base', css.includes('rgba(23,24,27,0.58)')]);
checks.push(['glass pointer layer', css.includes('--dsh-pointer-x') && source.includes("'--dsh-pointer-o'")]);
checks.push(['glass reduced motion', css.includes('prefers-reduced-motion:reduce') && source.includes('prefers-reduced-motion: reduce')]);
checks.push(['glass sidebar medium', css.includes('[data-slot="sidebar"] > div::before') && css.includes('opacity:.06')]);
checks.push(['glass bubble light', css.includes('conversation.user.text') && css.includes('rgba(23,24,27,0.55)')]);

/* 第五批 A：动效层 */
checks.push(['ink upward animation', css.includes('@keyframes dshSuomingInkUp') && css.includes('translate3d(0,-1.6%') && css.includes('27s')]);
checks.push(['ink hidden pause', css.includes('data-dsh-suoming-paused') && css.includes('animation-play-state:paused')]);
checks.push(['ink reduced motion', css.includes('prefers-reduced-motion:reduce') && css.includes('animation:none')]);
checks.push(['pulse canvas style', css.includes('.dsh-suoming-pulse') && css.includes('pointer-events:none')]);
checks.push(['pulse source implementation', source.includes("'shell.overlay'") && source.includes("'suoming-pulse'") && source.includes('requestAnimationFrame') && source.includes('visibilitychange') && source.includes('data-chat-running')]);
checks.push(['pulse colors constrained', source.includes('rgba(149,51,51') && source.includes('rgba(184,94,93') && source.includes('rgba(224,215,214') && source.includes('rgba(58,23,26')]);

/* 第五批 B-1：排版与交互规范 */
checks.push(['body line-height 1.65', css.includes('line-height:1.65')]);
checks.push(['cjk latin autospace', css.includes('text-autospace:normal') && css.includes('text-spacing-trim:trim-start')]);
checks.push(['code font separation', css.includes('"JetBrains Mono"') && css.includes('--dsw-alias-markdown-inline-code')]);
checks.push(['focus-visible ring', css.includes(':focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-1px')]);
checks.push(['pointer focus suppressed', css.includes(':focus:not(:focus-visible){outline:none}')]);
checks.push(['selection themed', css.includes('::selection{background-color:var(--dsw-alias-bg-document-selection)')]);
checks.push(['conversation scrollbar', css.includes('[data-conversation-scroll]::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#4a5058,#3a3f47)')]);
checks.push(['code scrollbar gold', css.includes('pre::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#b6a289,#9f8d7d)')]);
checks.push(['sidebar scrollbar', css.includes('[data-slot="sidebar"] *::-webkit-scrollbar-thumb{background:#3a3f47')]);
checks.push(['running selector fallbacks', source.includes('aria-live="polite"') && source.includes('data-streaming') && source.includes('aria-busy="true"')]);

/* 第五批 B-2：P2 打磨 */
checks.push(['thinking old-gold', tokens['--dsw-alias-label-deep-diving'] === '#9f8d7d' && tokens['--dsw-alias-label-deep-diving-shimmer'] === '#b6a289']);
checks.push(['overlay neutral bg', tokens['--dsw-alias-bg-overlay'] === '#17181b' && String(tokens['--dsw-alias-bg-mask-drop']).includes('23,24,27')]);
checks.push(['menu neutral', String(tokens['--dsw-menu-surface-fill']).includes('23,24,27') && tokens['--dsw-alias-toast-bg'] === '#17181b' && tokens['--dsw-alias-tooltip-bg'] === '#17181b']);
checks.push(['code keyword deeper', tokens['--shiki-token-keyword'] === '#b05252' && tokens['--shiki-token-string'] === '#9f8d7d' && tokens['--shiki-token-function'] === '#cebfb0']);
checks.push(['composer hairline only', !css.includes('0 18px 48px') && css.includes('inset 0 0 0 1px')]);
checks.push(['settings-card explicit', tokens['--dsw-alias-settings-card-fill'] === '#17181b' && (String(tokens['--dsw-alias-settings-card-stroke']).includes('9f8d7d') || String(tokens['--dsw-alias-settings-card-stroke']).includes('159,141,125'))]);

/* 本轮：四层背景 / 立绘 / 状态机 / 台词 */
const sceneTesting = face.__testing || {};
const normalized = sceneTesting.normalizeSceneConfig
  ? sceneTesting.normalizeSceneConfig({ portraitHeight: 999, portraitOffsetX: -999, portraitOpacity: 0, intensity: 'bad' })
  : {};
checks.push(['scene config clamps', normalized.portraitHeight === 80 && normalized.portraitOffsetX === -50 && normalized.portraitOpacity === 0.2 && normalized.intensity === 'balanced']);
checks.push(['scene four layers in template', ['dsh-suoming-l0','dsh-suoming-l1','dsh-suoming-l2','dsh-suoming-l3'].every((name) => source.includes(name))]);
checks.push(['scene four layers in css', ['.dsh-suoming-l0{','.dsh-suoming-l1{','.dsh-suoming-l2{','.dsh-suoming-l3{'].every((name) => css.includes(name))]);
checks.push(['ink cycles 34s/41s', css.includes('dshSuomingL0Up 34s') && css.includes('dshSuomingL0Breath 41s')]);
checks.push(['parallax transitions', css.includes('400ms') && css.includes('280ms') && css.includes('220ms') && css.includes('120ms')]);
checks.push(['portrait breath 38s', css.includes('dshSuomingL2Breath 38s')]);
checks.push(['scene reduced + narrow degrade', css.includes('prefers-reduced-motion:reduce') && css.includes('max-width:900px')]);
checks.push(['no persistent will-change', !css.includes('will-change')]);
checks.push(['host config route referenced', source.includes("'/suoming-config'") && source.includes('/suoming-local-art/char.png')]);
checks.push(['cutout portrait constrained', source.includes('dsh-suoming-character-image') && source.includes('object-fit:contain') && source.includes('width:min(28vw,390px)') && !source.includes('object-fit:cover')]);
checks.push(['umbrella svg independent parts', source.includes('dsh-umbrella-sector') && source.includes('dsh-umbrella-rib') && source.includes('dsh-umbrella-hinge') && source.includes('dsh-umbrella-rim')]);
checks.push(['chain + electro structure', source.includes('dsh-chain-flow-a') && source.includes('dsh-chain-flow-b') && source.includes('dsh-electro-arc')]);
checks.push(['ink wash svg', source.includes('dsh-suoming-l0-ink') && source.includes('dshSuomingInkMist')]);
checks.push(['umbrella open cycle 7s', css.includes('dshSuomingUmbrellaOpen 7s')]);
checks.push(['chain flow 4.2s', css.includes('dshSuomingChainFlow 4.2s')]);
checks.push(['character zone constrained', css.includes('width:min(28vw,390px)') && css.includes('.dsh-suoming-scene,html[data-dsh-suoming] .dsh-suoming-scene *{pointer-events:none}')]);
checks.push(['character hidden below 1200', css.includes('@media (max-width:1200px)') && css.includes('.dsh-suoming-l2{display:none}')]);
checks.push(['no full-screen object cover', !css.includes('object-fit:cover') && !css.includes('background-size:cover')]);
checks.push(['occlusion breakpoints', css.includes('@media (max-width:1280px)') && css.includes('@media (max-width:1200px)') && css.includes('@media (max-width:1100px)')]);
checks.push(['scene behind main content', css.includes('.dsh-suoming-scene{position:absolute;inset:0;z-index:-1') && css.includes('.dsh-suoming-scene-host{background:transparent}') && css.includes('[data-slot="main"] > *{position:relative;z-index:1')]);
checks.push(['local portrait routed through css', css.includes('/suoming-local-art/char.jpg') || css.includes('/suoming-local-art/char.png')]);
checks.push(['scene settings toggle localized', source.includes("'scene.visible'")]);
checks.push(['five ai fallbacks', Array.isArray(sceneTesting.AI_RUNNING_SELECTORS) && sceneTesting.AI_RUNNING_SELECTORS.length === 5 && sceneTesting.AI_RUNNING_SELECTORS[0] === '[data-chat-running]']);
checks.push(['dialogue pool official only', sceneTesting.DIALOGUE_POOL && Array.isArray(sceneTesting.DIALOGUE_POOL.idle) && sceneTesting.DIALOGUE_POOL.official.length >= 2 && sceneTesting.DIALOGUE_POOL.idle.every((line) => typeof line === 'string' && line.length > 0)]);
checks.push(['scene controls localized', typeof face.apply === 'function' && source.includes("'scene.height'") && source.includes("'scene.intensity'")]);

/* 第二批：旧金/红色/冷钢/骨白与派生方式核对 */
const legacyColors = ['#e8c88c', '#d9b87a', '#c9a063', '#b3242f', '#d23a44', '#e05a54', '#e8827c', '#d9a45e', '#e0b172', '#c98a6a', '#e8b48a'];
const tokenValues = Object.values(tokens).map((value) => String(value)).join(' ');
const allColorSources = css + ' ' + tokenValues;
checks.push(['no legacy bright colors', legacyColors.every((color) => !allColorSources.toLowerCase().includes(color))]);
checks.push(['neutral base #0d0c0e', tokens['--dsw-alias-bg-base'] === '#0d0c0e']);
checks.push(['ui accent #9b151c', tokens['--dsw-alias-state-business-primary'] === '#9b151c']);
checks.push(['old gold mid #b6a289', tokens['--dsw-alias-button-primary-fill'] === '#b6a289']);
checks.push(['old gold dark #493b34', tokens['--dsw-alias-button-primary-dimmed'] === '#493b34']);
checks.push(['cold steel borders', String(tokens['--dsw-alias-border-l3']).includes('536071') || String(tokens['--dsw-alias-border-l3']).includes('83,96,113')]);
checks.push(['bone text', tokens['--dsw-alias-label-primary'] === '#e9dfd5']);
checks.push(['mist secondary', tokens['--dsw-alias-label-secondary'] === '#aeb8c4']);
checks.push(['olive success', tokens['--dsw-alias-state-success-primary'] === '#5a6b52']);
checks.push(['accent-soft token', typeof tokens['--dsh-suoming-accent-soft'] === 'string' && tokens['--dsh-suoming-accent-soft'].length > 0]);
checks.push(['settings-card tokens', !!tokens['--dsw-alias-settings-card-fill'] && !!tokens['--dsw-alias-settings-card-stroke']]);
if (forceNoMix) {
  checks.push(['rgba fallback mode token', tokens['--dsh-suoming-mode-rgba'] === '1']);
  checks.push(['no color-mix in tokens', !tokenValues.includes('color-mix')]);
  checks.push(['no color-mix in CSS', !css.includes('color-mix')]);
} else {
  checks.push(['color-mix mode token', tokens['--dsh-suoming-mode-color-mix'] === '1']);
  checks.push(['derived tokens use color-mix', tokenValues.includes('color-mix')]);
  checks.push(['CSS uses color-mix', css.includes('color-mix')]);
}
const icon = fs.readFileSync(path.join(ROOT, 'icon.svg'), 'utf8').toLowerCase();
checks.push(['icon no legacy bright colors', legacyColors.every((color) => !icon.includes(color))]);
checks.push(['icon black canopy + red rim', icon.includes('fill="#17181b"') && icon.includes('stroke="#9b151c"')]);
checks.push(['icon gold dust clip', icon.includes('clip-path="url(#dsh-suoming-canopy)"') && icon.includes('#b6a289')]);

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed += 1;
  console.log((ok ? 'ok   ' : 'FAIL ') + name);
}
console.log('\ntheme tokens: ' + Object.keys(tokens).length + ', stylesheet bytes: ' + css.length);
process.exit(failed === 0 ? 0 : 1);
