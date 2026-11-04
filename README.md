# 锁暝主题 · Suoming Theme（完整皮肤）

《鸣潮》锁暝（梦州华亭、玄朱锁、机关伞「九方故影」、异能力「十重契」）的 DSH Web GUI **完整皮肤**，
对标已安装的「深海女仆工坊」皮肤的量级：不只是换配色，而是把角色插画、场景、纹样和装饰语言铺进界面。

整体气质清冷克制：深红为强调、近黑为底、旧铜/暗金为线与锁纹，不含高饱和粉色或紫色。

## 皮肤包含什么

> **v3.5.0：版本基线固化（产品功能冻结，本提交不改产品逻辑）。**
> 稳定版保留暗色主题、右侧立绘、左侧侧边栏人物、旋转玄朱锁与静态渐变背景；
> 为保证正文可读与屏闪稳定，全屏场景动效当前关闭。
> 本版本只做 Git 基线固化与版本/文档一致性收尾。

- **四层场景（v3.0.0）**
  - L0 墨晕：红 + 冷钢蓝 + 墨灰，纵向上涌 34s、呼吸 41s；L1 远景：0.25x 视差、雾带、稀疏雨丝；
  - L2 角色主题区域：SVG 机关伞（8 分区 + 伞骨 + 铰链）默认 55vh、限宽 340px、可关闭；L3 玄朱锁/锁链：0.5x 视差、9s 旋转、4.2s 链流、5.2s 导电脉冲；
  - 视差只作用于独立场景层；标题、正文、输入框、按钮不参与 transform；
  - 触摸 / ≤900px / reduced-motion / 页面隐藏 / 失焦 / 极简档自动停用并复位视差。
- **角色互动与台词**：idle / hover / click / thinking / generating / success / error / paused；
  AI 活动检测保留 5 层 fallback，完成/错误每轮只触发一次；气泡发丝线框、单实例、2.5s、点击 5s 冷却、空闲 35–70s（全局 30s 冷却）。
- **设置**：设置 → 通用 → 「锁暝主题」新增角色区域高度/偏移/不透明度/强度与显示开关；Host 写入 profile 专属
  `suoming-theme/config.json`（原子替换），cookie/localStorage 兜底。机关伞为纯 SVG，不依赖图片。

- **P2 收尾（第五批 B-2）**
  - 思考指示回到旧金家族：`#9f8d7d` / shimmer `#b6a289`，不再有暖铜/珊瑚感；
  - 代码高亮：keyword 从 `#b85e5d` 压到 `#b05252`（保持暗底可读性，不压到过暗的 `#953333`）；string `#9f8d7d`、function `#cebfb0`、constant `#b6a289`；
  - 浮层/遮罩统一中性黑 `#17181b` 系（`bg-overlay`、`bg-mask-drop`、menu、toast、tooltip、tip）；
  - 卡片阴影收口：composer 移除大阴影，只留 1px 内发丝边；流内卡片一律发丝边 + hover 底，真浮层才用阴影；
  - settings-card 令牌显式覆盖：fill `#17181b`，stroke 旧金 `#9f8d7d` 40%。

- **交互规范（第五批 B-1）**
  - 正文行高 1.65；`text-autospace: normal` + `text-spacing-trim: trim-start` 处理中英间距/全角标点，旧内核回退 `letter-spacing:.01em`；
  - 代码独立等宽栈，行内代码独立背景/边框；正文与代码块字号分离；
  - `:focus-visible` 统一 `2px solid var(--dsw-alias-state-business-primary)`，`outline-offset:-1px`；鼠标聚焦用 `:focus:not(:focus-visible)` 去掉环；
  - `::selection` 使用 `--dsw-alias-bg-document-selection`（accent 32%）；
  - 滚动条分区域：对话区冷钢、代码块旧金、侧栏深冷钢。

- **动效层（第五批 A）**
  - 墨晕上涌：27s 上涌 + 31s 呼吸，仅纵向 `translate3d(0, +0.9% → -1.6%, 0)`，底部暗红向上、顶部消散，无水平漂移；
  - 页面隐藏：`visibilitychange` 给 `<html>` 打 `data-dsh-suoming-paused`，CSS `animation-play-state:paused`；
    `prefers-reduced-motion` 下动画关闭，保留静态墨晕。
  - Canvas 冷脉冲：挂 `shell.overlay`（id `suoming-pulse`，`pointer-events:none`），沿输入卡上下边缘绘制；
    颜色仅 `#953333`/`#b85e5d`/`#e0d7d6`/`#3a171a`；AI 活动时 4.6s 冷脉冲，无活动时几乎不可见；
    reduced-motion 退化为静态细线；页面隐藏时取消 rAF。
- **液态玻璃（第四批）**
  - 输入卡（完整五层）：近黑半透明底 + `feTurbulence→feGaussianBlur→feDisplacementMap` 边缘折射（只作用于外圈约 12px）+ `conic-gradient` + `mask-composite:exclude` 的 2px 色差环（0.12 强度，暗红→深绛）+ 顶部 1px 高光/四角金饰 + 指针跟随高光（CSS 过渡 300ms）。
  - 侧栏（中等）：保留边缘折射与高光，色差环强度降到 0.06。
  - 消息气泡（最轻）：近黑半透明底 + 顶部 1px 高光 + 极弱边缘折射，无指针跟随。
  - 交互态模糊减弱、折射/高光增强；`prefers-reduced-motion` 下关闭指针跟随与折射动态，仅保留静态玻璃。
- **会话区背景**：代码生成的墨晕静态骨架 + 第五批 A 的极低频上涌/呼吸——底部暗红向上翻涌、
  顶部消散，黑色岩体剪影在两侧压边；无水平漂移。
- **角色位**：右侧为「玄朱锁」简化抽象版——黑红金三色多面互锁体（棱线/折面感），向左渐隐、
  窄窗口隐藏，尺寸随字号缩放。
- **侧边栏**
  - 四角旧金角饰 + 冷钢边框 + 「方梁 + 圆体 + 竖钥匙孔」的锁扣折线（随字号缩放）；
  - 底部为独立金锁纹章（方梁 + 圆体 + 竖钥匙孔）；
  - 顶部 / 底部 1px 旧金细线。
- **输入框**：旧金描边、四角金饰、深绛暗底；聚焦时上下细线从两端向中心轻微收紧（锁芯收拢）。
- **品牌位**：侧栏为「伞面 + 锁」纹章；欢迎页为「赤红虹膜 + 橙金竖梭亮核 + 上下细亮线」的
  锁芯抽象符号（替换宿主鱼形 fallback，不做机械齿轮）。
- **图标**：伞面改为近黑 `#17181b` + 极细旧金碎点/短线 + 细红边（形状不变）。
- **新会话台词**：欢迎区出现「玄朱锁里有九道频率，和一百年的雨。你来得正好。」（原创角色口吻，非官方语音），
  台词飘带末端带小金锁。
- **全套配色令牌**：113 个公开主题令牌 + 9 个语法高亮令牌 + 语义/诊断令牌，切换即时生效，无需刷新。
- **设置入口**：`设置 → 通用` 的「外观」行正下方新增「锁暝主题」行；插件启用后默认套用，
  可点「恢复默认外观」关闭（写入 cookie，按 host 记忆，DSH 重启端口变化也不丢）。

不覆盖宿主布局和功能控件：所有背景/纹样都是背景层或 `pointer-events:none` 的绘制层，
交互控件、Workspace / Session / Composer 行为不变；卸载后完全复原。

## 文件清单

```
suoming-theme/
├─ package.json          # bundle 清单：dsh.bundle.patch + dsh.client（platform web / inject）
├─ .gitignore            # 忽略 node_modules / 打包产物 / 日志 / 系统文件
├─ cordis.patch.yml      # 插入 Host 行 theme-suoming
├─ index.js              # Host 半部分：空 apply（位图/资源路由已随第一批移除）
├─ client.js             # Client 半部分：主题注册、设置行、代码皮肤层、品牌纹章、欢迎台词
├─ locale/en.json        # 插件清单标题/描述（英文）
├─ locale/zh.json        # 插件清单标题/描述（中文）
├─ icon.svg              # 原创图标：伞面 + 锁
├─ README.md
├─ docs/screenshots/     # 效果截图（README 占位路径；不随 bundle 发布）
├─ docs/visual-research.md # 官方视觉研究（不随 bundle 发布）
├─ docs/agent-memory.md  # 项目记忆（不随 bundle 发布）
└─ .dev/                 # 开发自检，不随包发布（smoke.cjs / render.cjs）
```

自 v2.1.0 起**包内不再包含任何位图**：背景由 CSS 墨晕生成，锁链/角饰/锁芯/品牌纹章全部为
内联 SVG。原来的四张参考图只保留在本地开发工作区的 `suoming-theme-dev/local-art/`（**不随包、
不入开源仓库**，仅作本地对照或将来“用户自备立绘”功能的参考素材）。

## 安装

当前开发机已在 `desktop` profile 中以 `link:` 方式安装并启用；开源用户可用以下任一方式。

### 方式一：插件管理器（推荐）

1. 打开「插件 → 安装本地目录」；
2. 选择本仓库根目录（即 `suoming-theme/`，含 `package.json` 的目录）；
3. 安装后确认 bundle 行 `theme-suoming` 已启用；
4. 刷新页面（或重启 DSH）。

等价 CLI（把 `<path-to-suoming-theme>` 换成本机绝对路径）：

```powershell
dsh plugin --profile desktop add "<path-to-suoming-theme>"
```

### 方式二：手动配置

1. 把整个目录放到本机任意位置（不要只复制 `client.js`，`cordis.patch.yml` / `locale/` 需要一起）；
2. 在目标 profile 的插件依赖中加入 `@local/dsh-theme-suoming` 的本地路径；
3. 启用 `theme-suoming` bundle 行；
4. 刷新页面。

安装后入口：`设置 → 通用` 的「外观」行下方「锁暝主题」，默认套用，可点「恢复默认外观」关闭。
升级/重新安装后若页面没有自动加载新的 Client 代码，刷新一次即可。

依赖的宿主能力：`@deepseek-ai/dsh-client-ui-theme`、`@deepseek-ai/dsh-client-ui-settings-general`、
`@deepseek-ai/dsh-client-ui-conversation`、`@deepseek-ai/dsh-client-ui-sidebar`。

### 开发自检（不随包）

```bash
node .dev/smoke.cjs          # 假 window/document 冒烟测试
node .dev/render.cjs         # 真实 React 18 渲染测试（需 React 依赖，见脚本头注释）
```

## 效果截图

截图统一放在 `docs/screenshots/`（该目录**不随 bundle 发布**）。建议文件名：

| 场景 | 文件名 |
| --- | --- |
| 总览（侧栏 + 对话 + 输入卡） | `docs/screenshots/01-overview.png` |
| 输入卡液态玻璃 / 聚焦收拢特写 | `docs/screenshots/02-composer.png` |
| 代码块 + 行内代码 + 高亮 | `docs/screenshots/03-code.png` |
| 设置行入口 | `docs/screenshots/04-settings.png` |
| 欢迎页锁芯符号 + 墨晕 | `docs/screenshots/05-hero.png` |

放好文件后，取消下面注释即可显示：

```markdown
<!--
![总览](docs/screenshots/01-overview.png)
![输入卡](docs/screenshots/02-composer.png)
![代码](docs/screenshots/03-code.png)
![设置](docs/screenshots/04-settings.png)
![欢迎页](docs/screenshots/05-hero.png)
-->
```

## 实现说明（为什么不会再出现「只改了背景色」）

1. **配色双通道**：既通过 `ctx.theme.register()` 注册可选中主题（设置行语义、`theme/change` 即时切换），
   又在启用时给 `<html>/<body>` 写 `data-dsh-suoming`，用
   `html[data-dsh-suoming] body[data-dsh-suoming]{--dsw-*: …}` 直接覆盖全部令牌。
   即使宿主主题 presenter 没有把令牌写进 body 内联样式，配色也一定生效。
2. **皮肤层用稳定结构锚点**：`[data-slot="main"]`、`[data-phase="hero"]`、`[data-slot="sidebar"]`、
   `[data-composer-card]`、`[data-slot="sidebar.brand.mark"]` 都是宿主运行时契约，
   不使用组件哈希类名；背景/纹样全部是背景或伪元素层，不新增可点击元素。
3. **会话面板清底**：主题启用时把会话根容器背景设为 `transparent` 并抬升 `z-index`，
   让中心列的墨晕层透出；标题栏加半透明渐隐保证文字可读。
4. **持久化**：cookie `dsh_suoming_theme` 为主（按 host 共享，DSH 每次启动端口变化不受影响），
   `localStorage` 兼容旧版；启动时 `setTheme('suoming')` 并按 0.4s / 1.2s / 3s / 6s / 10s 退避重放，
   避免宿主设置异步 adopt 把运行期偏好改回默认。
5. **派生色与特性检测（第二批）**：派生色优先 `color-mix()`，并通过
   `globalThis.CSS.supports('color','color-mix(in srgb, #000000, #ffffff)')` 做运行时检测；
   不支持时自动回退到预计算 `rgba()/hex`（两条路径由 `.dev/smoke.cjs` 分别断言）。
   墨晕渐变也通过同一组 `tint()/blend()` 工具生成，改令牌时背景与 UI 一起变，不会脱节。
   主题令牌里带 `--dsh-suoming-mode-color-mix` 或 `--dsh-suoming-mode-rgba` 诊断名，可在运行期检查走了哪条路径。

## 美术素材说明

- **自 v2.1.0 起包内没有位图**：背景墨晕、锁链、四角、锁芯占位、底部纹章、品牌纹章、图标全部为
  CSS / 内联 SVG 代码生成，可随令牌缩放。
- 原四张参考图（hero/chat/char/side）已移到 `suoming-theme-dev/local-art/`，**不随插件发布**；
  仅留作本地对照，或将来"用户本地自备立绘"功能的参考素材。版权归原权利人（库洛游戏 / 原画作者）。

## 官方设定依据（简述）

- 锁暝为《鸣潮》3.7 版本限定五星导电角色（迅刀），梦州华亭人、州监；异能力「十重契」为锁频之术；
  机关伞「九方故影」由二契锻造；官方口头禅「心驭万全」。参考：
  [灰机 wiki](https://wuwa.huijiwiki.com/wiki/%E9%94%81%E6%9A%9D)、
  [官方档案转载](https://news.17173.com/content/10192026/233325914.shtml)、
  [日文 profile wiki](https://wikiwiki.jp/w-w/%E9%8E%96%E6%9A%9D/%E3%83%97%E3%83%AD%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB)。
- 官方视觉母题：红发红瞳、玄朱锁（12 玄黑柱 + 8 朱红盖的鲁班锁结构）、赤黑瘴雷与凄雨、机关伞、
  绾绣珑发饰、断壁残垣。红黑金中的「金/旧铜」与「锁链纹理」是围绕「玄朱锁 / 锁频」的二创式演绎。

## 分批重制进度

| 批次 | 范围 | 状态 |
| --- | --- | --- |
| 第一批 | P0-3 移除 hero/chat 位图、代码墨晕静态骨架；P0-4 char/side 移出包、代码锁芯占位、移除资源路由 | **v2.1.0 已完成** |
| 第二批 | P0-1 旧金回调、P0-2 红色压暗、P1-1 冷钢蓝/骨白、P1-2 中性底色、P1-3 边框降级、P1-9 color-mix/accent-soft | **v2.2.0 已完成（本批）** |
| 第三批 | P1-4 锁扣折线、P1-5 金锁/玄朱锁 SVG、P2-4 图标伞面、P2-7 锁芯/瞳孔符号、输入框聚焦“锁芯收拢” | **v2.3.0 已完成** |
| 第四批 | P0-5 液态玻璃三处分层（先输入卡验证边缘折射） | **v2.4.0 已完成** |
| 第五批 A | P0-6 墨晕上涌/呼吸（隐藏暂停）、P0-7 输入框边缘 Canvas 冷脉冲 | **v2.5.0 已完成** |
| 第五批 B-1 | P1-8 排版、focus-visible、::selection、分区域滚动条 | **v2.6.0 已完成** |
| 第五批 B-2 | 思考指示色、代码高亮可读性、浮层/遮罩、卡片阴影、settings-card | **v2.7.0 已完成（收尾）** |
| v3.0.0 | 四层场景、立绘参数、角色状态机、台词气泡、三档强度、profile 持久化 | **已完成** |
| v3.1.0 | 官方形象研究、去 JPG、机关伞/锁链/导电/墨雾、遮挡修复 | **已完成** |
| v3.2.1 | 官方立绘抠图回归、透明立绘、浮动/呼吸动效、遮挡修复 | **已完成代码，待实机视觉验收** |
| v3.3.0 | 双立绘、隐藏主题文字、官方台词、全页面立绘层 | **已完成** |
| v3.4.0 | 暗色布局、背景统一、层级与遮挡修复 | **已完成** |
| v3.5.0 | 暗色侧边栏、右侧立绘恢复、景深、屏闪收敛、静态渐变背景 | **阶段基线** |

## 最终验收汇总（12 条）

| # | 验收条件 | 状态 |
| --- | --- | --- |
| 1 | 核心视觉无位图，全部代码生成 | ✅ |
| 2 | 配色按校对清单：旧金 `#9f8d7d–#cebfb0`、UI 红 `#80181d–#9b151c`、冷钢/骨白、中性底，无亮金亮红粉 | ✅ |
| 3 | 液态玻璃边缘折射（非整面模糊） | ✅ 实机确认外圈有轻微弯折/色散，内部清晰 |
| 4 | 代码墨晕自下而上 + 隐藏暂停 | ✅ |
| 5 | 锁扣为 SVG 矢量、非图片/普通实线 | ✅ |
| 6 | 输入框聚焦“锁芯收拢”非外扩 | ✅ |
| 7 | Canvas 冷脉冲、颜色限定、隐藏暂停 | ✅ |
| 8 | 统一 focus-visible；图标 SVG | ✅ |
| 9 | 行高 ≥1.6 / 中英间距 / 全角标点 / 代码正文分离 | ✅ |
| 10 | 滚动条 + ::selection 主题化 | ✅ |
| 11 | 欢迎页/空状态独立层、立绘分层 | ✅（墨晕、欢迎页锁芯、台词层独立） |
| 12 | 保留文件结构与令牌命名 | ✅ |

## 验证状态（第五批 B-2）

- 语法/测试：`node --check`、`smoke.cjs`（两种 color-mix 模式）、`render.cjs` 全部通过。
- 思考指示：`label-deep-diving #9f8d7d`、shimmer `#b6a289`（旧金家族，无珊瑚）。
- 代码高亮：keyword `#b05252`（比 `#b85e5d` 深一档、比 `#953333` 亮，暗底可读）；string `#9f8d7d`、function `#cebfb0`、constant `#b6a289`、parameter `#9f8d7d`。
- 浮层/遮罩：`bg-overlay #17181b`、`bg-mask-drop rgba(23,24,27,.72)`、`menu-group-header rgba(23,24,27,.94)`、`menu-surface rgba(23,24,27,.90)`、`toast/tooltip #17181b`、`specific-tip #17181b`。
- 阴影：composer 的 `0 18px 48px` 已删除，只留 `inset 0 0 0 1px`；流内设置卡为发丝边；宿主真浮层阴影不变。
- settings-card：`--dsw-alias-settings-card-fill:#17181b`、`--dsw-alias-settings-card-stroke: #9f8d7d 40%`（显式覆盖）。
- 本批只做局部微调，未超出校对清单区间。

## 验证状态（第五批 B-1）

- 语法：`node --check` 通过；`smoke.cjs` 两种 color-mix 模式通过；`render.cjs` 通过。
- 排版：
  - 行高 `1.65`（正文消息区域 `[data-conversation-scroll]` 内的 `article/p/li/blockquote/dd/dt`，≥1.6）；
  - 中英间距：`text-autospace: normal`；全角标点：`text-spacing-trim: trim-start`；`@supports not` 时回退 `letter-spacing:.01em`；
  - 代码：`JetBrains Mono / Cascadia Code / SFMono / Consolas / Menlo` 等宽栈，`font-variant-ligatures:none`；行内代码独立背景 + 冷钢边框；`pre code` 去背景；代码字号 `calc(content-font-size - 1.5px)`。
- focus-visible：`outline: 2px solid var(--dsw-alias-state-business-primary)`（实际 `#9b151c`）、`outline-offset:-1px`；`:focus:not(:focus-visible)` 清空 outline，指针悬停/点击不画环；键盘 Tab 才出现。
- ::selection：`background-color: var(--dsw-alias-bg-document-selection)`；该令牌 = `state-business-primary 32%`，实际为 `rgba(155,21,28,0.32)`，不再是默认蓝。
- 滚动条：
  - 对话区：thumb `#4a5058→#3a3f47`，hover `#5a6068→#4a5058`，track 透明；
  - 代码块：thumb `#b6a289→#9f8d7d`，hover `#cebfb0→#b6a289`，track `rgba(13,12,14,.45)`；
  - 侧栏：thumb `#3a3f47`，hover `#4a5058`，track 透明。
- `[data-chat-running]` 说明：它是宿主 `ui-chat` 内部实现属性（不在 Slots 公开 catalog 里）；Canvas 脉冲已加 fallback：`[role="status"][aria-live="polite"]`、`[data-streaming]`、`[aria-busy="true"]`、composer 内 10×10 方形停止图标，避免 DSH 升级后静默失效。
- 本批未改令牌值；未碰 5B-2 的 P2 剩余项。

## 验证状态（第五批 A）

- 语法：`node --check client.js` 通过；`smoke.cjs` 两种 color-mix 模式通过；`render.cjs` 通过（含 Canvas overlay 渲染）。
- 墨晕：
  - 方向：`translate3d(0, +0.9% → -1.6%, 0)`，仅纵向，无水平位移；
  - 周期：上涌 27s、呼吸 31s（均 ≥20s）；
  - 隐藏暂停：`visibilitychange` → `data-dsh-suoming-paused` → `animation-play-state:paused`；
  - reduced-motion：`animation:none`，静态墨晕。
- Canvas 脉冲：
  - 挂载：`shell.overlay`，id `suoming-pulse`，`position:fixed` + `pointer-events:none`，点击穿透；
  - 颜色：`rgba(149,51,51)` / `rgba(184,94,93)` / `rgba(224,215,214)` / `rgba(58,23,26)`，无亮白/亮黄/纯红；
  - 活动检测：`[data-chat-running]`；活动时 4.6s 脉冲，无活动时只画极淡静态线；
  - reduced-motion：只画一条静态细线；
  - rAF 暂停：`visibilitychange` 时 `cancelAnimationFrame`，恢复可见后重启。
- 本批未改令牌值，未碰排版/交互规范；第四批的折射实机风险仍需你刷新后确认。

## 注意事项

- 本 profile 同时装有第三方皮肤 `@smalltailqwq/dsh-client-ui-skin-maid-atelier`。它会按自身作用域绘制
  背景/立绘，与本主题相互独立；若两者同时启用，画面元素会叠加。想要纯粹的锁暝观感，请在插件页停用该皮肤。
- 卸载：插件管理器移除 `@local/dsh-theme-suoming`，或
  `dsh plugin --profile desktop remove @local/dsh-theme-suoming`；装饰、墨晕层与令牌都会随 effect 销毁复原。
