# 全屏被长图覆盖（裸图泄漏）修复

> 版本：v3.5.2 起
> 影响：锁暝主题注入的全部装饰图层（右侧立绘 / 侧边栏立绘 / 场景层 / 角锁 / ambient）

## 1. 现象

在 DSH Web GUI 停留较长时间后，整个界面会被一张竖版长图覆盖，只能重启 DSH 才能恢复。

- 覆盖物不是遮罩、不是弹窗，就是主题注入的立绘本身。
- 重启能恢复，说明状态没有自愈路径，只能靠重新挂载插件。

## 2. 根因

主题会把若干装饰图层注入 `document.body` / 侧边栏，并且**所有**相关样式都挂在 `html[data-dsh-suoming]` 前缀下，例如：

```css
html[data-dsh-suoming] .dsh-suoming-right-art{position:fixed;right:1vw;bottom:11vh;width:min(24vw,330px);height:55vh;...}
html[data-dsh-suoming] .dsh-suoming-right-art img{width:100%;height:100%;object-fit:contain}
```

这些图层是插件**命令式**插入 DOM 的，和 React 无关；而样式是 `ctx.effect()` 里插入的 `<style>` 标签。于是存在两条「样式命中条件失效，但节点还活着」的路径：

### 2.1 主题属性丢失

`data-dsh-suoming` 从 `<html>` 上消失 → 上面前缀选择器全部失效，节点还在：

- 宿主主题回退到内置主题，`face.enabled()` 变 `false`，`installActiveAttribute` 主动移除属性；
- 宿主重绘 `html` 属性（主题 presenter 重写、其他插件改写）。

### 2.2 样式表比节点先死（更隐蔽，最符合"停留久了才出现"）

`<style>` 在 `ctx.effect()` 的清理函数里被 `tag.remove()`，而**注入的 DOM 节点没有任何清理逻辑**，它们挂在 `body` 上会一直活到页面刷新。插件的 fiber 被重建（主题重挂载 / 插件重载）时：

1. 旧 `<style>` 被移除；
2. 旧节点留在 `body` 上；
3. 新的一份插件可能又补回属性（`MutationObserver` 自愈），但样式表是新的、节点却是旧的 —— **有没有属性都已经无所谓了：裸图铺屏与属性无关。**

无论哪条路径，结果都一样：`<img>` 失去 `position:fixed` / 尺寸约束 / `object-fit`，退化成普通文档流图片，按**原始像素尺寸**参与布局。官方长立绘是 2160×3840，等于直接把整屏盖住并撑开页面高度。重启 DSH 之所以有效，只是因为页面重新加载、旧节点被销毁。

## 3. 复现（对照实验）

用真实样式表渲染注入结构，然后移除主题属性，测量 `<img>` 的几何尺寸（Chrome 157 headless，视口 1418×802）：

| 场景 | img 尺寸 | 容器尺寸 | 占视口面积 |
|---|---|---|---|
| 对照组：样式表去掉保底规则，属性移除 | 2160×3840 | 1403×3845 | **7.29 倍** |
| 修复后：属性移除 | 0×0（`display:none`） | 0×0 | **0** |
| 修复后：属性正常 | 330×441 | 330×441 | 0.13 倍 |

对照组精确复现了用户描述的「整屏被一张长图盖住」。

## 4. 修复（三层，v3.5.1 → v3.5.2）

### 4.1 样式保底：属性缺失时整体隐藏

在样式表**最后**追加一条反向规则：

```css
html:not([data-dsh-suoming]) .dsh-suoming-scene,
html:not([data-dsh-suoming]) .dsh-suoming-right-art,
html:not([data-dsh-suoming]) .dsh-suoming-side-art,
html:not([data-dsh-suoming]) .dsh-suoming-global,
html:not([data-dsh-suoming]) .dsh-suoming-ambient,
html:not([data-dsh-suoming]) .dsh-suoming-corner-lock,
html:not([data-dsh-suoming]) .dsh-suoming-pulse,
html:not([data-dsh-suoming]) .dsh-suoming-dialogue{display:none}
```

> ⚠️ v3.5.1 这里写的是 `.dsh-suoming-scene-host`，**这是错的**：该类挂在宿主自己的容器 `div:has(> [data-slot="main"])` 上，隐藏它等于隐藏整个应用。v3.5.2 已改为 `.dsh-suoming-scene`（插件自己注入的那层）。

### 4.2 图层与样式表同生命周期

`purgeInjectedLayers()` 提升为模块级函数，清理清单为：

```js
const LAYER_SELECTOR = Object.freeze([
  '.dsh-suoming-scene',
  '.dsh-suoming-right-art',
  '.dsh-suoming-side-art',
  '.dsh-suoming-global',
  '.dsh-suoming-ambient',
  '.dsh-suoming-corner-lock',
].join(','));
```

两个调用点：

- `installStyles()` 的 effect 清理函数：`tag.remove()` 之后立即 `purgeInjectedLayers()` —— **样式表撤掉，节点必须一起消失**，这条直接堵死 2.2；
- `installActiveAttribute` 的 `sync()` 在 `face.enabled() === false` 分支清理 —— 堵死 2.1。

> ⚠️ v3.5.1 的清单里同样混入了 `.dsh-suoming-scene-host`，而且是真的 `parentNode.removeChild()`：主题一关就会把宿主容器从 DOM 里摘掉，界面直接空白。v3.5.2 一并修正，并加了源码级断言防止回归。

各 `ensure*()` 都带 `isConnected` 判断，重新启用主题时会自动重建。

### 4.3 属性自愈

`MutationObserver` 监听 `document.documentElement` 的 `data-dsh-suoming`：主题启用中但属性被抹掉时立即补回。回调先判断 `face.enabled()`，避免与 4.2 的主动移除互相打架。

### 4.4 不变量看门狗（v3.5.2 新增）

不依赖任何已知成因，只守一条不变量：**注入图层绝不允许进入文档流**。`installLayerWatchdog()` 每 2 秒检查一次现存图层的 `getComputedStyle(node).position`，若退化成 `static`（说明对应规则没生效），立刻 `purgeInjectedLayers()` 并置 `layersBlocked`，各 `ensure*()` 从此不再重建，避免每 2 秒反复摘了又建。

- 只读 6 个节点的 computed style，2 秒一次，开销可忽略；
- 命中后主题退化为「无装饰」，但界面绝不会被盖住；
- 恢复方式：重启 / 重载 DSH（与之前一致，但此时界面是可用的）。

## 5. 踩到的坑（务必记住）

### 5.1 `:not()` 的作用对象

第一版保底规则写成了：

```css
:not(html[data-dsh-suoming]) .dsh-suoming-right-art{display:none}  /* 错误 */
```

`:not(html[data-dsh-suoming])` 不是「没有该属性的 html 元素」，而是「**任意**不匹配该复合选择器的元素」—— `body` 正好匹配，而且 `body` 永远是这些图层的祖先。结果这条规则在主题正常启用时也恒成立，把右立绘一并隐藏了。

正确写法是把限定放到 `html` 上：

```css
html:not([data-dsh-suoming]) .dsh-suoming-right-art{display:none}  /* 正确 */
```

这个错误是 `overlay-guard` 第一轮跑出来的（主题启用时 `boxDisplay` 竟是 `none`），不是靠看代码发现的。

### 5.2 「清理清单」里不能出现宿主容器的类

`.dsh-suoming-scene-host` 是加在**宿主**容器上的类（主题为了让绝对定位图层有定位上下文才加上去的）。把它当"自己的节点"删掉，删的就是应用本身。凡是按类名批量清理，必须先确认该类不是打在别人的节点上的。

## 6. 回归测试

| 测试 | 覆盖 | 结果 |
|---|---|---|
| `.dev/overlay-guard.cjs` | 4 项：对照组裸图铺屏 / 启用时立绘被约束 / 属性丢失后隐藏 / 面积归零 | 4 passed |
| `.dev/layer-lifecycle.cjs` | 10 项源码级不变量：清理清单不含 `scene-host`、样式表卸载时清理节点、看门狗存在且已注册、`ensure*` 尊重 `layersBlocked`、兜底前缀正确 | 10 passed |
| `.dev/smoke.cjs` | 128 tokens，`!important` 禁令，构建标记 3.5.2 | PASS |
| `.dev/scene-runtime.cjs` / `.dev/host-smoke.mjs` / `.dev/render.cjs` | 场景 22 项 / 宿主 16 项 / 渲染 | PASS |

`overlay-guard` 的对照组是关键：没有它，这个测试在「规则误伤、把立绘永久隐藏」时也会假绿。`layer-lifecycle` 是源码级断言，专防「清理清单又被加回 `scene-host`」这类回归。

配套：`smoke.cjs` 支持 `SUOMING_DUMP_CSS` 导出真实样式表，供浏览器侧回归使用。

## 7. 未验证项

- **真实 DSH 长时间驻留复现 NOT RUN**：没有在真实会话里复现过「几十分钟后触发」，因此无法确认用户遇到的是 2.1 还是 2.2（修复对两条路径都成立）。
- 宿主在什么条件下重绘 `html` 属性、什么条件下重建插件 fiber，未从宿主源码确认。
- 看门狗的 `position:static` 判据在 DSH 内部样式表被整体替换（而非本插件卸载）时同样适用，但该场景未实测。

## 8. 修改文件

| 文件 | 改动 |
|---|---|
| `client.js` | 兜底规则改 `.dsh-suoming-scene`；`purgeInjectedLayers()` 提升为模块级并修正清单；样式表卸载时清理图层；新增 `installLayerWatchdog()` 与 `layersBlocked` 闸门；版本 3.5.2 |
| `.dev/overlay-guard.cjs` | 浏览器侧对照回归（v3.5.1 新增） |
| `.dev/layer-lifecycle.cjs` | 源码级不变量回归（v3.5.2 新增） |
| `.dev/smoke.cjs` | `SUOMING_DUMP_CSS` 支持；构建标记断言 3.5.2 |
| `docs/ui-overlay-leak-fix.md` | 本文档 |
