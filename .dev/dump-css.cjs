/* Dev-only: dump generated theme CSS + scene template for a standalone visual mock. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const styles = [];
global.window = { __ModuleLoader__: { load(module) { global.__loaded = module; } }, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, setTimeout, clearTimeout, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
global.document = {
  cookie: '',
  documentElement: { style: { setProperty() {}, removeProperty() {} }, setAttribute() {}, removeAttribute() {}, hasAttribute() { return false; } },
  body: { setAttribute() {}, removeAttribute() {}, hasAttribute() { return false; } },
  head: { appendChild(tag) { styles.push(tag); } },
  createElement() { return { dataset: {}, textContent: '', remove() {} }; },
};
global.CSS = { supports: () => true };
const source = fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8');
vm.runInThisContext(source, { filename: 'client.js' });
const face = global.__loaded.factory(() => ({}));
const ctx = {
  effect(fn) { fn(); }, on() { return () => {}; },
  locale: { register: () => () => {}, bind: () => (k) => k, subscribe: () => () => {} },
  theme: { register: () => () => {}, getTheme: () => ({ preference: 'system', themes: [], active: null }), setTheme() {} },
  slots: { inject(o, cb) { cb(); }, register() { return () => {}; } },
};
face.apply(ctx);
const css = styles[0] ? styles[0].textContent : '';
const template = face.__testing && face.__testing.sceneTemplate ? face.__testing.sceneTemplate : '';
fs.writeFileSync(path.join(ROOT, '..', 'suoming-theme-dev', 'mock-theme.css'), css, 'utf8');
fs.writeFileSync(path.join(ROOT, '..', 'suoming-theme-dev', 'mock-scene.html'), template, 'utf8');
console.log('css bytes', css.length, 'template bytes', template.length);
