# 全屏被长图覆盖（裸图泄漏）修复

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

一旦 `data-dsh-suoming` 属性从 `<html>` 上消失：

1. 上面前缀选择器全部失效；
2. 但**已经注入的 DOM 节点还在**；
3. `<img>` 失去 `position:fixed` / 尺寸约束 / `object-fit`，退化成普通文档流中的图片，按**原始像素尺寸**参与布局。

官方立绘是 2160×3840 的长图，等于直接把整屏盖住，并撑开页面高度。重启 DSH 之所以有效，只是因为页面重新加载、旧节点被销毁。

属性丢失的触发路径：

- 宿主重绘 `html` 属性（主题 presenter 重写、其他插件改写）；
- 宿主主题回退到内置主题，`face.enabled()` 变 `false`，`installActiveAttribute` 主动移除属性 —— 这条最容易发生：属性被移除，但注入图层没有任何清理逻辑。

## 3. 复现（对照实验）

用真实样式表渲染注入结构，然后移除主题属性，测量 `<img>` 的几何尺寸（Chrome 157 headless，视口 1418×802）：

| 场景 | img 尺寸 | 容器尺寸 | 占视口面积 |
|---|---|---|---|
| 对照组：样式表去掉保底规则，属性移除 | 2160×3840 | 1403×3845 | **7.29 倍** |
| 修复后：属性移除 | 0×0（`display:none`） | 0×0 | **0** |
| 修复后：属性正常 | 330×441 | 330×441 | 0.13 倍 |

对照组精确复现了用户描述的「整屏被一张长图盖住」。

## 4. 修复

### 4.1 样式保底（首要）

在样式表**最后**追加一条反向规则，属性缺失时整体隐藏注入图层：

```css
html:not([data-dsh-suoming]) .dsh-suoming-scene-host,
html:not([data-dsh-suoming]) .dsh-suoming-right-art,
html:not([data-dsh-suoming]) .dsh-suoming-side-art,
html:not([data-dsh-suoming]) .dsh-suoming-global,
html:not([data-dsh-suoming]) .dsh-suoming-ambient,
html:not([data-dsh-suoming]) .dsh-suoming-corner-lock,
html:not([data-dsh-suoming]) .dsh-suoming-pulse,
html:not([data-dsh-suoming]) .dsh-suoming-dialogue{display:none}
```

即使后续有人再次改坏属性同步，最坏结果也只是装饰消失，不可能出现裸图铺屏。

### 4.2 关闭主题时清理图层

`installActiveAttribute` 的 `sync()` 在 `face.enabled()` 为 `false` 的分支中调用 `purgeInjectedLayers()`，移除：

- `.dsh-suoming-scene-host`
- `.dsh-suoming-right-art`
- `.dsh-suoming-side-art`
- `.dsh-suoming-global`
- 以及 `html` 上的 `data-dsh-suoming-global`

各 `ensure*()` 都带 `isConnected` 判断，重新启用主题时会自动重建。

### 4.3 属性自愈

用 `MutationObserver` 监听 `document.documentElement` 的 `data-dsh-suoming` 属性：主题处于启用状态但属性被抹掉时，立即补回，并同步 `body`。回调里先判断 `face.enabled()`，避免与 4.2 的主动移除互相打架。

## 5. 踩到的坑（务必记住）

第一版保底规则写成了：

```css
:not(html[data-dsh-suoming]) .dsh-suoming-right-art{display:none}  /* 错误 */
```

` :not(html[data-dsh-suoming])` 并不是「没有该属性的 html 元素」，而是「**任意**不匹配该复合选择器的元素」—— `body` 正好匹配，而且 `body` 永远是这些图层的祖先。结果这条规则在主题正常启用时也恒成立，把右立绘一并隐藏了。

正确写法是把限定放到 `html` 上：

```css
html:not([data-dsh-suoming]) .dsh-suoming-right-art{display:none}  /* 正确 */
```

这个错误是 `overlay-guard` 第一轮跑出来的（主题启用时 `boxDisplay` 竟是 `none`），不是靠看代码发现的。

## 6. 回归测试

新增 `.dev/overlay-guard.cjs`（需要本机 Chrome）：

| 检查 | 结果 |
|---|---|
| 对照组：无保底规则时裸图铺满屏幕 | PASS（7.29 倍视口） |
| 主题启用时右立绘被约束 | PASS（fixed，330×441） |
| 属性丢失后图层隐藏 | PASS（`display:none`） |
| 属性丢失后裸图不再铺屏 | PASS（面积 0） |

对照组是关键：没有它，这个测试在「规则误伤、把立绘永久隐藏」时也会假绿。

配套：`smoke.cjs` 支持 `SUOMING_DUMP_CSS` 导出真实样式表，供浏览器侧回归使用。

## 7. 未验证项

- **真实 DSH 长时间驻留复现 NOT RUN**：需要实际挂机观察属性何时丢失。当前修复覆盖了已知的两条触发路径，并加了兜底，但没有在真实会话里复现过「几十分钟后触发」。
- 宿主在什么条件下重绘 `html` 属性，未从宿主源码确认。

## 8. 修改文件

| 文件 | 改动 |
|---|---|
| `client.js` | 新增样式保底规则；`purgeInjectedLayers()`；`MutationObserver` 自愈 |
| `.dev/overlay-guard.cjs` | 新增回归测试（含对照组） |
| `.dev/smoke.cjs` | 支持 `SUOMING_DUMP_CSS` 导出样式表 |
| `docs/ui-overlay-leak-fix.md` | 本文档 |
