# SM-UI-009 权限交互与全局 UI 修复报告

## 1. 权限弹窗归属

- 归属：**宿主原生**（DSH 宿主组件），不是主题插件注入。
- 证据：
  - DSH 应用包内组件：`@deepseek-ai/dsh-client-ui-approval/lib/client.js`
  - 组件结构：`ApprovalPanel` → `ApprovalFlow` → `card / strip / body / actionRow`
  - 宿主 CSS module 类：`Zf6DNq_card / Zf6DNq_strip / Zf6DNq_actionRow / Zf6DNq_reject`
  - 按钮来自宿主 primitives：`_button_1ulci_2`、`_primary_1ulci_36`、`_outline_1ulci_56`
  - 主题 `client.js` 没有权限弹窗组件/槽位/DOM 注入；只通过 `--dsw-*` 设计变量影响颜色。
- 可用修改机制：
  - 宿主 Button 的 outline 使用 `var(--dsh-button-outline-color, var(--dsw-alias-border-l3))`；
  - 主题可在 `client.js` 的 CSS 层设置该宿主变量，不改变权限逻辑，也不需要 DOM 轮询/MutationObserver。
  - 未使用全局 DOM 覆盖，不篡改授权语义。

## 2. 已知问题修复情况

### 修复前

- 宿主 `_outline` 拒绝按钮只依赖 `--dsw-alias-border-l3` 的 0.5px 内阴影。
- 主题 `border-l3` = `tint(steel, 48%)`，在审批卡背景 `#17181b` 上合成颜色约 `rgb(52,59,68)`：
  - 边界对比度约 **1.57:1**，按钮边界几乎不可辨认。
- 主按钮：
  - 背景 `--dsw-alias-button-primary-fill` = `#b6a289`
  - 文字 `--dsw-alias-label-primary-foreground` = `#0d0c0e`
  - 对比度约 **7.92:1**。
- 拒绝文字：骨白 `#e9dfd5` 对卡片背景约 **13.51:1**；文字可读，但按钮边界弱。

### 修复（第一次尝试无效，已更正）

**第一次尝试（无效）**：把宿主变量声明在 `html` 上：

```css
html[data-dsh-suoming] {
  --dsh-button-outline-color: var(--dsw-alias-state-warn-primary);
}
```

- 失效原因：主题的设计令牌 `--dsw-alias-*` 全部声明在 **body**（`buildTokenCSS()` 的两个选择器都以 `body` 结尾），`html` 上并不存在 `--dsw-alias-state-warn-primary`。
- 自定义属性里的 `var()` 在**声明所在元素**上求值；在 `html` 上该引用无法解析，`--dsh-button-outline-color` 变成计算期无效值，宿主按钮的 `var(--dsh-button-outline-color, var(--dsw-alias-border-l3))` 直接回退到 `border-l3`。
- 实测：`getComputedStyle(拒绝按钮).boxShadow` = `rgba(83, 96, 113, 0.48) 0 0 0 0.5px inset` —— 与修复前完全一致，等于没有修。

**当前修复（有效）**：改为与令牌同层，声明在 `body`：

```css
html[data-dsh-suoming] body {
  --dsh-button-outline-color: var(--dsw-alias-state-warn-primary);
}
```

- `--dsw-alias-state-warn-primary`（`#b6a289`）与这条声明在同一个元素上，`var()` 可以正常解析，并被按钮继承。
- 仅影响宿主 outline 按钮的边界，不改变按钮文字、权限流程或同意/拒绝语义。
- 128 个 design tokens 结构未改；新增的是宿主组件变量，不是第 129 个主题 token。

### 修复后（Chrome 157 headless 实测计算样式）

| 元素 | 颜色/边界 | 对卡片 `#17181b` 对比度 |
|---|---|---|
| 拒绝按钮文字 | 骨白 `#e9dfd5` | **13.51:1** |
| 拒绝按钮边界（旧 html 写法） | 回退 `rgba(83,96,113,.48)` → 合成 `rgb(52,59,68)` | **1.57:1** |
| 拒绝按钮边界（现 body 写法） | 旧金 `rgb(182,162,137)` | **7.32:1**（实测 7.2） |
| 允许一次/始终允许 | 旧金 `#b6a289` / 深色 `#0d0c0e` | **8.00:1**（实测 7.92） |

- 对比度来自宿主 CSS + 主题 token 的真实计算样式，非实际弹窗截图。
- 旧的 `7.92:1` 是对 `bg-base #0d0c0e` 算的；对审批卡片实际底色 `#17181b` 是 7.32:1。两个数都保留，避免误导。
- hover/active/focus-visible/disabled 仍由宿主 Button 既有 CSS 提供；未改权限逻辑。
- 是否改变授权语义：**否**。

## 3. 全局 UI 审计结果

### A. 按钮与交互

| 检查项 | 现状 | 结果 |
|---|---|---|
| 审批“拒绝”outline 边界 | 修复前 1.57:1；修复后 7.92:1 | **P0 已修** |
| 审批主按钮 | 旧金底 + 深色字，7.92:1 | PASS（静态计算） |
| 审批拒绝文字 | 骨白，13.51:1 | PASS（静态计算） |
| hover / active | 宿主 Button 既有样式 | 未实际触发，NOT RUN |
| focus-visible | 主题 2px accent ring 规则存在 | 源码 PASS；实际键盘未测 |
| disabled | 宿主 `opacity:.4`，未改 | 源码 PASS；实际未测 |
| 点击区域 | 宿主 `height:36px; padding:0 14px` | 源码 PASS |

### B. 表单与设置

| 检查项 | 现状 | 结果 |
|---|---|---|
| 设置行渲染 | `render.cjs` 已通过 | PASS |
| 设置保存/取消/重置 | 未在真实设置页操作 | NOT RUN |
| input/select/checkbox/switch | 主题 token 存在；未逐项实测 | NOT RUN |
| 长文本/错误提示 | 未发现本轮引入的布局规则 | 未新增问题 |

### C. 弹窗与提示

| 检查项 | 现状 | 结果 |
|---|---|---|
| 权限审批弹窗归属 | 宿主组件，已定位 | PASS（源码） |
| 审批按钮边界 | 已通过主题变量修复 | PASS（静态计算） |
| 实际审批弹窗触发 | 当前环境无安全触发条件 | NOT RUN |
| 确认/错误/警告/信息弹窗 | 使用宿主 token；本轮未全量实测 | NOT RUN |
| 窄窗口/滚动 | 未实测 | NOT RUN |

### D. 页面整体

| 检查项 | 现状 | 结果 |
|---|---|---|
| 侧边栏/正文/输入区 | 当前 DSH GUI 主页面完整可见，无本轮新增遮挡 | PASS（实际截图人工检查） |
| 标题/正文/辅助文字 | 主题文字层级保持；无本轮改动 | PASS（人工检查） |
| 图标/文字错位 | 未见新增问题 | PASS（人工检查） |
| 低对比度/截断/重叠 | 除权限 outline 外未发现新的 P0 | PASS（有限检查） |
| 深色背景控件 | 主题原本为深色；审批边界已修复 | PASS（静态/人工） |

### E. 兼容性与无障碍

| 检查项 | 现状 | 结果 |
|---|---|---|
| Tab / focus-visible | 主题有统一 focus 规则；宿主审批支持 Enter/Escape | 源码 PASS；实际未测 |
| prefers-reduced-motion | 主题已有媒体查询；未新增动画 | 源码 PASS |
| 窄窗口/缩放 | 未实测 | NOT RUN |
| 浅色/深色模式 | 主题固定暗色；未改变宿主外观逻辑 | UNKNOWN/NOT RUN |
| 动画/滚动卡顿 | 本轮只加 CSS 变量 | 未新增动画，NOT RUN |

## 4. P0/P1/P2 问题清单

| 编号 | 问题 | 严重程度 | 状态 | 证据 |
|---|---|---|---|---|
| P0-1 | 权限审批拒绝按钮 outline 在深色卡片上边界对比度约 1.57:1，按钮边界不可辨认 | P0 | **已修**（`--dsh-button-outline-color` 改到 body 作用域） | 宿主 CSS + Chrome 计算样式 |
| P0-2 | 第一次修复把变量声明在 `html` 上，令牌在 `body`，`var()` 无法解析 → 实际未生效（仍 1.57:1） | P0 | **已修**（本轮更正作用域） | Chrome 计算样式：`rgba(83,96,113,.48)` |
| P1-1 | 有“始终允许”时，宿主把“允许一次”和“拒绝”都渲染为 outline；除边界外无额外语义样式 | P1 | **未修**（宿主原生，无受支持的按按钮语义 token） | 审批组件源码 |
| P1-2 | 实际权限请求弹窗未在当前环境触发，修复后实际弹窗未做真实点击回归 | P1 | **NOT RUN** | 无安全触发条件 |
| P2-1 | 设置页保存/取消/重置、窄窗口、浅色模式未实测 | P2 | **NOT RUN** | 环境/隐私限制 |
| P2-2 | 未提交实际审批弹窗截图 | P2 | **NOT RUN** | 无实际弹窗；静态复现不作为真实截图 |

## 5. 修复前后截图

- 实际权限弹窗截图：**NOT RUN**。
  - 原因：当前没有可安全触发的待审批请求；不伪造弹窗，不自动点击同意/拒绝。
- 静态复现：
  - 使用宿主 `dsh-frontend.css` + 宿主审批 DOM 类 + 主题 token 渲染，仅用于计算对比度和验证边界。
  - 不提交为“真实弹窗截图”，避免误导。
- 需人工确认清单：
  1. 实际权限弹窗中“拒绝”边界是否清楚；
  2. “允许一次”和“始终允许”的主/次层级；
  3. Tab 顺序与 Enter/Escape；
  4. 窄窗口与缩放。

## 6. 修改文件与 diff

| 文件 | 改动说明 |
|---|---|
| `client.js` | `--dsh-button-outline-color` 从 `html[data-dsh-suoming]` 移到 `html[data-dsh-suoming] body`；不改 JS 业务逻辑 |
| `docs/ui-permission-fix-report.md` | 本报告（更正第一次无效结论） |

diff 摘要：
- 1 行 CSS 变量的作用域更正；
- 128 tokens 未改；
- 权限弹窗相关：无 DOM 轮询、无自动点击、不修改权限流程。

## 7. 自动化测试结果

| 测试项 | 命令 | 结果 | 说明 |
|---|---|---|---|
| 语法 | `node --check client.js` | PASS | 实际运行 |
| smoke | `node .dev/smoke.cjs` | PASS | 128 tokens；stylesheet 75,039 bytes |
| render | `SUOMING_REACT_DIR=... node .dev/render.cjs` | PASS | 实际运行 |
| scene-runtime | `node .dev/scene-runtime.cjs` | PASS | 22/22 |
| host-smoke | `node .dev/host-smoke.mjs` | PASS | 16/16 |
| overlay-guard | `node .dev/overlay-guard.cjs` | PASS | 4/4（图层裸图泄漏回归，见 `docs/ui-overlay-leak-fix.md`） |
| CSS 变量作用域实测 | Chrome 157 headless + 计算样式 | PASS | html 写法回退 `rgba(83,96,113,.48)`；body 写法为 `rgb(182,162,137)` |

## 8. 实际 GUI 验证结果

- 是否实际启动：**是**。当前 DSH GUI 可访问，主界面已人工检查。
- 权限弹窗：**NOT RUN**。没有安全触发待审批请求；未自动构造授权请求。
- 验证页面：
  - 主界面、侧边栏、输入区：实际截图人工检查，无本轮新增遮挡/错位。
  - 设置页：未进入；登录/权限状态不明确，NOT RUN。
- 未覆盖项：实际审批弹窗、Tab/Enter/Escape、窄窗口、浅色模式。

## 9. 未解决问题与风险

### P1
- 审批“允许一次”/“始终允许”在宿主的 `onAlways` 分支下都可能是 outline/primary 混合，主题无法通过已有变量区分语义；未使用脆弱的 DOM 覆盖。
- 实际权限弹窗未触发，修复的真实点击回归 NOT RUN。

### P2
- 设置页面、窄窗口、浅色模式未实测。
- 未提交实际审批截图。

## 10. Git 状态

- 分支：`fix/ui-permission-contrast`
- Commit hash：**本报告提交后记录**
- main 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- v3.5.0 tag 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- 工作区状态：本轮修改待提交

## 11. 边界声明

- 是否修改 main/tag：**否**
- 是否 push/创建 remote：**否**
- 是否改变权限业务逻辑：**否**
- 是否伪造测试/截图：**否**
- 是否引入不必要依赖/永久 will-change/大面积 backdrop-filter：**否**
- 是否使用全局 DOM 轮询/自动点击：**否**
- 是否使用 MutationObserver：**是，但与本弹窗无关** —— 仅监听 `document.documentElement` 上的 `data-dsh-suoming` 属性，在宿主重绘抹掉主题属性时自愈重设，防止注入图层退化成未样式化的裸图（见 `docs/ui-overlay-leak-fix.md`）。不读取、不修改任何权限弹窗 DOM。
