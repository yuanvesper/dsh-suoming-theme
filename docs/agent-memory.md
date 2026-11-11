# Agent Memory · 锁暝主题

> 最后更新：v3.5.2（注入图层裸图泄漏修复：样式表/属性双路径 + 看门狗）

## A. 项目事实

- 工作目录：`<workspace>\suoming-theme`
- 包名：`@local/dsh-theme-suoming`；当前版本 **3.5.2**；`dsh.bundle.patch` 插入 `theme-suoming` 行。
- 宿主：DSH Desktop（Electron/Chromium）；profile `desktop`；`DSH_PROFILE_DIR` 指向 profile。
- 入口：`index.js`（Host：`webServer` 只读素材路由 + profile 配置）；`client.js`（主题/场景/状态/台词）。
- 构建：无构建步骤；测试：`.dev/host-smoke.mjs`、`.dev/scene-runtime.cjs`、`.dev/smoke.cjs`、`.dev/render.cjs`、`.dev/overlay-guard.cjs`（需本机 Chrome）、`.dev/layer-lifecycle.cjs`。
- 关键宿主依据：
  - `webServer.register({kind:'prefix'|'exact', path, handler})`；prefix 路径不带尾斜杠；返回 disposer；Host 用 `ctx.effect`。
  - profile 配置：`$DSH_PROFILE_DIR/suoming-theme/config.json`，临时文件 + rename 原子替换。
  - Slots：`shell.overlay`、`sidebar.brand.mark`、`conversation.hero.brand.mark`、`settings.general.item`、`conversation.input.dock`。
  - 中心列选择器 `div:has(> [data-slot="main"])`；主内容 z-index 1，场景 z-index 0。
- **环境修复（重要）**：插件管理器 remove/install 会从 profile 的 `dsh.profile.bundles` 移除本插件，并生成重复 `theme-suoming` 行（一条 enabled、一条 disabled）。已手动：
  1) 将 `@local/dsh-theme-suoming` 加回 `profiles/desktop/package.json` 的 `dsh.profile.bundles`；
  2) 从 `cordis.patch.yml` 删除重复 disabled 行，保留 `disabled: false`。
  之后无需重启即可重新加载 Client（实测 settings row 恢复）。
  下次 remove/install 后必须复查这两处。

## B. 已验收、不得破坏

- 128 token 命名/结构；旧金/红/冷钢/骨白/中性底；color-mix + rgba fallback。
- 排版、focus-visible、::selection、三处滚动条、输入框玻璃与聚焦收拢、Canvas 冷脉冲、锁扣/金锁/玄朱锁 SVG、icon、品牌锁芯。
- 5A 的 `[data-chat-running]` 5 层 fallback、visibility 暂停、卸载清理。
- Host `/suoming-config` GET/PUT、`/suoming-local-art/<file>` 白名单路由、cookie/localStorage 兜底。

## C. 当前实现（v3.1.0）

- 官方研究：`docs/visual-research.md`。依据 17173 官方档案转载/演示报道、灰机 wiki/画廊、官方 Kuro 页（JS shell 未能取正文）。核心锚点：红发双马尾、红瞳、黑红国风短裙、黑漆金屑机关伞 + 金伞骨/铰链 + 细红边、红白导电、锁链飞出/伞面变形（演示报道）。
- **L2 透明立绘**：`char.png` 由官方 2160×3840 全身立绘经 rembg u2netp 抠图、裁上半身，628×860 透明 PNG，存 profile assets，不入包；`img` 宽度 `min(28vw,390px)`、高度 55vh、右侧 1vw、mask 10%/4%、默认透明度 82%、`object-fit:contain`、`pointer-events:none`；图片失败回退 SVG 机关伞。
- **机关伞**：扇区/伞骨从 `rotate(var(--closed))` 展开到 0°，7s alternate；铰链独立 scale/opacity；rim opacity 同步。
- **锁链/导电**：`dsh-chain-flow-a/b` 用 dashoffset 4.2s/6.4s 连续流动；`dsh-electro-arc` 5.2s 低频短脉冲；无 Canvas/粒子。
- **墨雾**：L0 增加 `dsh-suoming-l0-ink` SVG 墨团，58s 漂移 + 18px blur；L0 上涌 34s / 呼吸 41s 保持。
- **L3**：玄朱锁 22em/0.2 opacity、锁链 240×170、锁扣 6em/0.2；0.5x 视差、9s 旋转、7s 收张，锁链惯性 ±4px/120ms。
- **遮挡硬策略**：场景只插入中心列、`position:absolute;inset:0;z-index:0`，主内容 z-index 1；所有场景元素 `pointer-events:none`；L2 限宽/遮罩、≤1200px 隐藏；L3 ≤1100px 隐藏；气泡 ≤1280px 隐藏；≤900px 全关。无 `<img>`、`object-fit:cover`、全屏背景图。
- 设置：高度 30–80/55、偏移 -50–50/0、不透明度 20–100/62%、强度三档、显示开关；Host profile 持久化。
- 视差/降级/清理逻辑保持 5A 行为；新增动画均加入 paused/reduced-motion 选择器。

## D. 风险与限制

- 当前 DSH 页面未成功实机验收：Electron 无远程调试端口，headless Chrome 被 DSH Web 认证拦截；桌面窗口 UI 自动化未能可靠进入设置。**真实 DSH 视觉/交互/性能均未实测**；仅用 suoming-theme-dev/mock-v31b.png 验证了生成 CSS 下的四层与聊天遮挡（非 DSH、非实机）。
- 官方立绘/演示图仅本地研究，未入包；无 Live2D/骨骼素材，机关伞为 SVG 抽象实现，不是官方模型。
- 本机 profile 的 Host row/duplicate 问题已修复但属插件管理器行为；每次 remove/install 必须复查 bundles + patch。
- `[data-chat-running]` 仍是内部属性；错误终态仍依赖 `[data-error]/[role=alert]`，无标记时可能判 success（v3.0.1 计划修复，未在本轮完成）。
- 无真实性能工具，FPS/Long Task/内存 NOT RUN。

## E. 进度

- 代码：v3.1.0 已完成 L2 去 JPG、机关伞/锁链/导电/墨迹、遮挡约束、设置开关；Host 未改逻辑。
- 本地测试（2026-11-04）：client/host syntax PASS；host smoke **16/16**；scene-runtime **22/22**（含无 img、8 扇区、链/电弧、状态、隐藏、清理）；client smoke PASS（128 token、无图片、伞/链/导电、遮挡断点）；render **18/18**。
- 已完成：实测 Host `/suoming-config` 200、profile-file；`/suoming-local-art/side.jpg` 200（但 Client 不再使用）；profile bundle 修复后 settings row 恢复。
- 待办：用户实机刷新验收；v3.0.1 AI error 终态修复；真实性能/截图（需可认证的浏览器）。

## v3.5.0 补记

- 官方全身立绘来源：https://huiji-public.huijistatic.com/wuwa/uploads/7/7f/%E9%94%81%E6%9A%9D-%E5%89%8D%E7%9E%BB%E7%AB%8B%E7%BB%98.jpg （2160×3840，本地处理，不随包）。
- 抠图：rembg `u2netp` + post_process_mask；裁 0–860 上半身，导出透明 `char.png` 628×860；旧用户图 `side.jpg/char.jpg` 已移出活动 assets。
- 新动效：透明立绘 9s 浮动 -7px、L2 38s 呼吸、hover 1.02；遮挡：scene 负 z-index、host 透明、正文 content z-index 1。

## 验收记录

- 2026-11-05：用户确认 v3.5.0 当前无屏闪；屏闪风险从“待确认”改为“已现场确认消失”。

## v3.5.0 Git 基线

- 2026-11-05：v3.5.0 作为阶段稳定基线固化；产品功能冻结，仅做 Git 版本化与文档一致性收尾。
- 回溯：v3.4.0 备份目录与压缩包保存在 `suoming-theme-dev/backups/`。

## v3.5.2 补记 · 注入图层裸图泄漏

- 现象：GUI 停留久了整屏被一张长图盖住，只能重启 DSH。
- 根因两条：(1) `html[data-dsh-suoming]` 属性被宿主/主题回退抹掉；(2) `<style>` 由 `ctx.effect` 清理，但命令式注入的装饰节点没有清理逻辑 —— 节点比样式表活得久，裸 `<img>` 以 2160×3840 原图尺寸进入文档流。
- 修复：兜底规则改为 `html:not([data-dsh-suoming]) .dsh-suoming-scene{display:none}`；`purgeInjectedLayers()` 提升为模块级并与 `installStyles` 同生命周期；新增 `installLayerWatchdog()`（每 2s 检查图层 computed `position`，退化为 `static` 即摘除并置 `layersBlocked`）。
- 教训：清理清单里绝不能出现宿主容器的类 —— v3.5.1 把 `.dsh-suoming-scene-host` 当自己的节点删，等于把应用容器从 DOM 里摘掉。
- 文档：`docs/ui-overlay-leak-fix.md`。
