#!/usr/bin/env node
/**
 * layer-lifecycle.cjs — 注入图层生命周期回归
 *
 * 背景：注入的装饰图层（立绘 / 场景 / 角锁）样式全部挂在 html[data-dsh-suoming]
 * 之下。只要「样式表」或「主题属性」任一消失，裸 <img> 就会以原图尺寸
 * （官方长立绘 2160×3840）参与普通文档流，直接把整个界面盖住，且不会自行恢复
 * —— 用户侧表现为「停留久了整屏被一张长图覆盖，只能重启 DSH」。
 *
 * 这里守住三条不变量（都是源码级断言，防止以后被"优雅重构"掉）：
 *   1. 清理清单只摘插件自己的节点，绝不包含 .dsh-suoming-scene-host
 *      （那个类挂在宿主自己的容器 div:has(> [data-slot="main"]) 上，
 *        摘掉它 = 把整个应用从 DOM 里删掉）。
 *   2. 样式表卸载时同步清理图层（否则节点会比样式表活得久 → 裸图）。
 *   3. 看门狗存在：图层 computed position 退化成 static 时立即摘除。
 *
 * 用法：node .dev/layer-lifecycle.cjs
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SOURCE = path.join(__dirname, '..', 'client.js');
const css = fs.readFileSync(SOURCE, 'utf8');

const checks = [];
const push = (name, ok, detail) => checks.push([name, Boolean(ok), detail]);

/* ---- 1. LAYER_SELECTOR 内容 ---- */
const selectorMatch = css.match(/const LAYER_SELECTOR = Object\.freeze\(\[([\s\S]*?)\]\.join\('([^']*)'\)\)/);
push('LAYER_SELECTOR 可解析', Boolean(selectorMatch), selectorMatch ? undefined : '未找到 LAYER_SELECTOR 定义');

const rawSelectors = selectorMatch
  ? (selectorMatch[1].match(/'[^']*'/g) || []).map((item) => item.slice(1, -1))
  : [];

push(
  '清理清单不含 .dsh-suoming-scene-host（宿主容器不可摘）',
  rawSelectors.length > 0 && !rawSelectors.includes('.dsh-suoming-scene-host'),
  rawSelectors.join(' ')
);
push('清理清单包含 .dsh-suoming-scene', rawSelectors.includes('.dsh-suoming-scene'), rawSelectors.join(' '));
push('清理清单包含 .dsh-suoming-right-art', rawSelectors.includes('.dsh-suoming-right-art'), rawSelectors.join(' '));
push('清理清单包含 .dsh-suoming-side-art', rawSelectors.includes('.dsh-suoming-side-art'), rawSelectors.join(' '));

/* ---- 2. 样式表卸载时清理图层 ---- */
const stylesMatch = css.match(/function installStyles\(ctx\)\{?[\s\S]*?\n {4}\}/) || css.match(/function installStyles\(ctx\)[\s\S]*?\n {4}\}/);
const stylesBlock = stylesMatch ? stylesMatch[0] : '';
push(
  'installStyles 卸载时调用 purgeInjectedLayers()',
  /tag\.remove\(\);[\s\S]*purgeInjectedLayers\(\);/.test(stylesBlock),
  stylesBlock ? undefined : 'installStyles 未匹配'
);

/* ---- 3. 看门狗不变量 ---- */
push(
  '看门狗检查 position:static',
  /function installLayerWatchdog\(ctx\)[\s\S]*?position !== 'static'/.test(css),
  undefined
);
push('看门狗已注册到 apply()', /installStyles\(ctx\);[\s\S]{0,80}installLayerWatchdog\(ctx\);/.test(css), undefined);
push(
  '图层创建函数尊重 layersBlocked',
  ['ensureCornerLock', 'ensureAmbient', 'ensureRightArt', 'ensureSidebarArt', 'ensureGlobalPortrait'].every((fn) =>
    new RegExp('const ' + fn + ' = \\(\\) => \\{\\s*\\n\\s*if \\(layersBlocked').test(css)
  ),
  undefined
);

/* ---- 4. 兜底选择器不能误伤宿主容器 ---- */
push(
  '兜底选择器使用 html:not([data-dsh-suoming]) 前缀',
  css.includes("'html:not([data-dsh-suoming]) .dsh-suoming-scene,'") &&
    !css.includes("'html:not([data-dsh-suoming]) .dsh-suoming-scene-host,'"),
  undefined
);

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

console.log(`\nlayer lifecycle: ${checks.length - failed} passed, ${failed} failed`);
process.exitCode = failed === 0 ? 0 : 1;
