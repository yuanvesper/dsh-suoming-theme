# SVG 来源调查与替换评估（SM-REL-007）

> 本文件只做来源调查与替换可行性评估，不修改任何 SVG、`client.js`、`index.js` 或视觉。  
> 当前项目许可证为 MIT（`Copyright (c) 2026 zhouke`），但 **MIT 不自动覆盖下列 UNKNOWN SVG**。  
> 本文件不把“外观相似”当作来源确认，不把“搜不到”当作原创。

## 1. 调查范围与方法

### 7 组 SVG

1. `icon.svg`
2. `CHAIN_SVG`
3. `LOCK_GLYPH_SVG`
4. `XUANZHU_LOCK_SVG`
5. `UMBRELLA_SVG`
6. `CHAIN_DYNAMIC_SVG`
7. `INK_WASH_SVG`

### 本地溯源方法

- `git ls-files` / `git log --all` / `git log -S`
- 读取 `docs/agent-memory.md`、`docs/visual-research.md` 及代码注释
- 检查 `suoming-theme-dev/`、`.dev/` 是否有原始 SVG、设计稿、来源说明
- 检查 SVG 中的注释、`id`、`class`、`<title>`、`<desc>`
- 检查 `<image>`、`data:image`、`;base64,`、`xlink:href`、`<use>`、`@import`、`url(http` 等外部/内嵌内容

### 网络搜索方法

- 使用可用网页搜索工具，逐组搜索精确路径片段、独特 ID/class、图形描述
- 搜索候选页面并记录 URL；未下载任何候选素材
- 搜索限制：网页搜索不保证索引大型图标库的精确 SVG path；部分素材站需要登录/付费；未做全量 API 抓取

### 未执行/不可用项

| 项目 | 状态 | 原因 |
|---|---|---|
| 原始下载链接/浏览历史 | NOT AVAILABLE | 当前环境无可访问的浏览器历史/原始下载记录 |
| 原始 AI 提示词/生成会话 | NOT AVAILABLE | 无相关可访问记录 |
| 全量图标库 API 比对 | NOT RUN | 未对 Simple Icons/Tabler/Phosphor/Lucide/Iconify 全量索引做程序化比对 |
| 候选素材许可证页面逐条核验 | 部分 UNKNOWN | 仅在候选与文件有可确认关系时才有意义；本次无 CONFIRMED SOURCE |
| 候选素材下载 | 未执行 | 按指令禁止下载进仓库 |

## 2. 逐组调查

### 2.1 icon.svg

- 基本信息：
  - 路径：`icon.svg`
  - SHA-256：`02669A7FC12AC78EE667100C3D3A7B201513D6557BA43636F6FD3D772EB98F45`
  - 用途：DSH 插件图标；64×64 圆角深色底、旧金锁扣/伞盖图形
  - tarball：**进入**（`package.json files` 包含 `icon.svg`；SM-REL-004 tarball 已确认）
  - 截图：安全截图中未作为独立图标清晰出现，不作为来源证据
  - 外部引用：无 `<image>`、无 base64 位图、无外部 URL
  - 来源注释：无作者、网址、许可证、版权注释
  - 关键指纹：`id="dsh-suoming-canopy"`；路径 `M13 26.5c2.4-8.6 9.4-14.2 19-14.2...`
- 本地来源证据：
  - Git：`git log --all -- icon.svg` 仅 `88459bd` 基线提交；无更早历史
  - 文档：`docs/agent-memory.md` 提到“锁扣/金锁/玄朱锁 SVG、icon”，未记录来源
  - 开发目录：未发现原始 SVG 或设计稿
  - 原始下载/生成记录：NOT AVAILABLE
- 网络搜索记录：
  - 搜索词：`"M13 26.5c2.4-8.6 9.4-14.2 19-14.2" svg`
  - 搜索结果：无同路径页面；返回工程手册/无关 PDF
  - 搜索词：`umbrella lock icon svg black red gold`
  - 候选：iamvector 的 umbrella-protection-lock、proicons 的 lock/shield 图标等；仅有通用伞/锁视觉相似，无同路径证据
- 候选来源及链接：无 CONFIRMED SOURCE；通用图标站候选见 [iamvector](https://iamvector.com/all-icons/umbrella-protection-lock)、[proicons](https://proicons.com/icons/412612/phone-lock/)
- 许可证核验：候选页面许可证未确认；未建立“候选 = 本文件”的对应关系，因此不做 MIT 兼容结论
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C（建议替换：来源无法确认）**
- 证据不足之处：原始下载记录、作者/许可证信息缺失；精确路径未被搜索索引

### 2.2 CHAIN_SVG

- 基本信息：
  - 路径：`client.js:454-463`（常量 `CHAIN_SVG`）
  - 源码块 SHA-256：`6b9ef03084aba40b5e27239fa7138b8b580adaaf9fc0a33c852378893f028272`
  - 关键指纹：viewBox `0 0 12 24`；路径 `M3.3 12V7.4h5.4V12`；`<circle cx="6" cy="14.5" r="3.3"/>`
  - 用途：侧边栏边缘 / 细锁链纹理；CSS `data:image/svg+xml` 背景
  - tarball：**进入**（`client.js` 在包内，运行时生成）
  - 截图：不作为来源证据
  - 外部引用：无外部图片/URL；仅编码为 data URI
  - 来源注释：仅有设计说明“方梁 + 圆体 + 竖钥匙孔”，无作者/网站/许可证
- 本地来源证据：
  - Git：`-S "CHAIN_SVG"` 仅基线提交
  - 文档：无来源记录
  - 开发目录：未发现原始 chain.svg
  - 原始下载记录：NOT AVAILABLE
- 网络搜索记录：
  - 搜索词：`"M3.3 12V7.4h5.4V12" svg`
  - 结果：无同路径页面；返回无关手册/Pinterest 类结果
  - 搜索词：`chain link svg old gold thin line`
  - 结果：通用链环/金色链素材，未发现同 path
- 候选来源及链接：无 CONFIRMED SOURCE
- 许可证核验：无候选可核验
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C**
- 证据不足之处：路径为常见几何组合，容易被不同作品独立画出；但这不能证明原创或授权

### 2.3 LOCK_GLYPH_SVG

- 基本信息：
  - 路径：`client.js:469-478`
  - SHA-256：`1aec26f32ef26e5e1c5624100d9d84c808843d6a1315c77381559b4261ac1a5d`
  - 关键指纹：viewBox `0 0 24 40`；`M6 21V9.5h12V21`；圆体 + 竖钥匙孔
  - 用途：侧栏 / 台词飘带末端金锁符号
  - tarball：**进入**
  - 截图：不作为来源证据
  - 外部引用：无；来源注释：无作者/许可证
- 本地来源证据：Git 仅基线；文档无来源记录；无原始 lock.svg；原始记录 NOT AVAILABLE
- 网络搜索记录：
  - `"M6 21V9.5h12V21" svg`：无同路径页面
  - `lock glyph svg gold outline`：通用锁图标候选，无同 path
- 候选来源及链接：无 CONFIRMED SOURCE；通用候选不构成同一文件
- 许可证核验：无候选可核验
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C**
- 证据不足之处：无作者/网站/许可证；通用锁形无法确认来源

### 2.4 XUANZHU_LOCK_SVG

- 基本信息：
  - 路径：`client.js:482-508`
  - SHA-256：`55b863fe66974d67d4d136fef135f6463565a07b595f42e88806ed636423ec3d`
  - 关键指纹：viewBox `0 0 240 240`；三组 `rotate(0/60/120 120 120)`；六边形 points `120,94 146,107 146,133 120,146 94,133 94,107`
  - 用途：右上角旋转玄朱锁；前景装饰
  - tarball：**进入**
  - 截图：不作为来源证据
  - 外部引用：无；来源注释：无作者/网址/许可证
- 本地来源证据：Git 仅基线；文档无来源；无原始 SVG；原始记录 NOT AVAILABLE
- 网络搜索记录：
  - `"120,94 146,107 146,133 120,146 94,133 94,107"`：无同路径页面
  - `hexagon lock svg red gold geometric`：IconScout/Proicons 等通用六边形锁候选，无同 path
- 候选来源及链接：无 CONFIRMED SOURCE；通用候选不构成同一文件
- 许可证核验：候选页面未确认授权；不适用
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C**
- 证据不足之处：为三组旋转矩形 + 六边形，可能由 AI/代码生成，但无生成记录；不能认定原创

### 2.5 UMBRELLA_SVG

- 基本信息：
  - 路径：`client.js:515-575`（`buildUmbrellaSvg`），运行时赋值 `UMBRELLA_SVG` 于 601 行
  - 源码块 SHA-256：`f0e96a6382faf8e1964d2314ce4d31c8841917288afe603e67c03c83cc762dcf`
  - 关键指纹：`class="dsh-suoming-umbrella"`、`dsh-umbrella-lacquer`、`dsh-umbrella-sector`、viewBox `0 0 320 360`；8 扇区 + 伞骨 + 铰链
  - 用途：机关伞前景 / 角色区域
  - tarball：**进入**
  - 截图：不作为来源证据
  - 外部引用：无；来源注释：无作者/网站/许可证
- 本地来源证据：
  - Git：仅基线；文档无来源；开发目录无原始 umbrella.svg；原始记录 NOT AVAILABLE
  - 代码显示为 `polar()` 计算 + 几何路径生成，不是外部 SVG 文件
- 网络搜索记录：
  - `"dsh-umbrella-lacquer"`：未找到同 ID 文件
  - `"dsh-suoming-canopy" OR "dsh-umbrella-lacquer"`：搜索到另一个 DSH 主题 **CloudSen/dsh-umbrella-theme**（Resident Evil 保护伞主题），其 README 说明伞标由代码几何绘制、无 Capcom 素材；页面：[GitHub](https://github.com/CloudSen/dsh-umbrella-theme)、[awesome-dsh-plugin 页面](https://awesome-dsh-plugin.com/p/CloudSen/dsh-umbrella-theme/)
  - 该候选与本项目：同为 DSH 伞主题/代码几何，但仓库名、视觉主题、代码路径与 ID 不同；**不能确认是同一文件或来源**
- 候选来源及链接：**POSSIBLE MATCH（仅概念/视觉相似）**，不是 CONFIRMED SOURCE
- 许可证核验：候选 README 声明其源码 MIT；但这是候选项目的许可，不是本文件的授权证明；本项目 UMBRELLA_SVG 未确认来自该仓库，不能据此纳入 MIT
- 当前权属判断：**POSSIBLE MATCH / UNKNOWN**（无法确认同一文件）
- 保留或替换建议：**C**（概念相似不构成授权链；若所有者能提供实际来源，再按 B/A 评估）
- 证据不足之处：无 path 完全匹配、无代码复制证据、无原始下载记录

### 2.6 CHAIN_DYNAMIC_SVG

- 基本信息：
  - 路径：`client.js:577-589`（`buildChainSvg`），运行时赋值 `CHAIN_DYNAMIC_SVG` 于 602 行
  - SHA-256：`b7b82ead49e4e9f97d2c60417ac49760acf0712ed939b89a0938d4e42d0224da`
  - 关键指纹：viewBox `0 0 260 180`；路径 `M6 158C62 136 92 108 142 96S218 82 252 34`；`dsh-electro-arc`
  - 用途：飘逸锁链 + 电弧前景
  - tarball：**进入**
  - 截图：不作为来源证据
  - 外部引用：无；来源注释：无作者/网址/许可证
- 本地来源证据：Git 仅基线；文档无来源；无原始链文件；原始记录 NOT AVAILABLE
- 网络搜索记录：
  - `"M6 158C62 136 92 108 142 96S218 82 252 34"`：无同路径结果
  - `"M62 132l16-12-8-8 22 3"`：无同路径结果
- 候选来源及链接：无 CONFIRMED SOURCE
- 许可证核验：无候选可核验
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C**
- 证据不足之处：曲线路径为手写/生成几何，无法证明来源

### 2.7 INK_WASH_SVG

- 基本信息：
  - 路径：`client.js:591-599`（`buildInkWashSvg`），运行时赋值 `INK_WASH_SVG` 于 603 行
  - SHA-256：`784b5fc9d424dfc9311486c552c03bc66d82b5ab8a4b48ee572d733af1bfd511`
  - 关键指纹：`class="dsh-suoming-l0-ink"`、viewBox `0 0 800 600`、多组椭圆墨团
  - 用途：背景墨晕
  - tarball：**进入**
  - 截图：不作为来源证据
  - 外部引用：无；来源注释：无作者/网址/许可证
- 本地来源证据：Git 仅基线；文档无来源；无原始墨迹文件；原始记录 NOT AVAILABLE
- 网络搜索记录：
  - `ink wash ellipse svg background dark red`：通用墨迹/椭圆背景素材，未发现同结构 SVG
  - 无独特 path 可搜索
- 候选来源及链接：无 CONFIRMED SOURCE
- 许可证核验：无候选可核验
- 当前权属判断：**NO SOURCE FOUND**
- 保留或替换建议：**C**
- 证据不足之处：仅为通用椭圆组合，易被独立绘制；不能据此判断原创或授权

## 3. 汇总表

| SVG | 当前状态 | 候选来源 | 许可证 | MIT 兼容 | 建议 | 工作量 |
|---|---|---|---|---|---|---|
| `icon.svg` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 低 |
| `CHAIN_SVG` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 低 |
| `LOCK_GLYPH_SVG` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 低 |
| `XUANZHU_LOCK_SVG` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 中 |
| `UMBRELLA_SVG` | POSSIBLE MATCH / UNKNOWN | CloudSen/dsh-umbrella-theme（概念/视觉相似，未确认同一文件） | 候选为 MIT，但非本文件授权证据 | 不可确认 | C | 高 |
| `CHAIN_DYNAMIC_SVG` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 低 |
| `INK_WASH_SVG` | NO SOURCE FOUND | 无 | UNKNOWN | 不可确认 | C | 低 |

说明：
- 没有任何一组达到 **CONFIRMED SOURCE**。
- 没有任何一组可被标记为 **CONFIRMED ORIGINAL**。
- 候选素材均未下载进仓库。

## 4. 仍然存在的 UNKNOWN

| SVG | UNKNOWN 内容 | 原因 | 转为 CONFIRMED 所需证据 |
|---|---|---|---|
| `icon.svg` | 原始作者/来源/许可证 | 无下载记录、无注释、精确 path 未搜到 | 原始网页/文件、作者声明、许可证 |
| `CHAIN_SVG` | 原始作者/来源/许可证 | 路径为通用几何、无来源记录 | 原始 SVG 或下载链接 |
| `LOCK_GLYPH_SVG` | 原始作者/来源/许可证 | 无来源记录 | 原始 SVG 或作者授权 |
| `XUANZHU_LOCK_SVG` | 原始作者/来源/许可证 | 无来源记录；可能 AI/代码生成 | 生成记录/提示词/作者确认 |
| `UMBRELLA_SVG` | 是否来自候选仓库/谁授权 | 仅概念相似，无 path 匹配 | 原始文件/提交记录/作者确认 |
| `CHAIN_DYNAMIC_SVG` | 原始作者/来源/许可证 | 无来源记录 | 原始 SVG 或作者授权 |
| `INK_WASH_SVG` | 原始作者/来源/许可证 | 无独特指纹、无来源记录 | 原始文件/设计记录 |

补充 UNKNOWN：
- AI/DSH 加工链：无提示词或生成记录，NOT AVAILABLE。
- 候选素材许可证：无 CONFIRMED SOURCE，未做逐条许可确认。
- 全量图标库比对：NOT RUN。

## 5. 替换优先级

- **P0（7 组）**：7 组均进入 tarball（icon 文件或 client.js 运行时生成），来源无法确认/授权无法证明；在公开分发前应替换或由所有者提供授权证据。
  - 其中 `UMBRELLA_SVG` 仅有概念相似候选，仍不能作为授权链。
- **P1**：无（没有“来源确认但许可证待判断”的组；UMBRELLA 候选不是同一文件）。
- **P2**：无（没有“来源搜不到但纯通用几何、可低风险保留”的组；按证据规则全部保持 UNKNOWN）。

> P0 数量为 7 是“来源/授权证据缺失”的审计结论，不等于法律侵权认定。

## 6. 预估工作量

| 工作量 | 数量 | SVG |
|---|---:|---|
| 低 | 5 | `icon.svg`、`CHAIN_SVG`、`LOCK_GLYPH_SVG`、`CHAIN_DYNAMIC_SVG`、`INK_WASH_SVG` |
| 中 | 1 | `XUANZHU_LOCK_SVG` |
| 高 | 1 | `UMBRELLA_SVG` |
| 合计 | 7 | — |

替换方向（仅建议，不执行）：
- 全部用纯代码几何重新绘制，或使用明确 CC0/MIT 图标库并保留来源/许可证；
- 不建议继续使用来源不明的“免费下载”素材；
- UMBRELLA 需保留 8 扇区/伞骨/铰链/动画类名与布局，替换后需视觉与动效回归。

## 7. 对项目公开发布的影响

- 是否构成发布阻塞：**是**。7 组 SVG 均进入公开 tarball，来源/授权证据不足；当前不能声称这些 SVG 已被 MIT 覆盖。
- 若全部替换为原创/兼容素材：SVG 相关 UNKNOWN 才可能解除；仍需所有者确认新素材来源和许可证。
- 是否需要所有者补充授权：**是**。需要原始来源、作者授权或设计记录；否则建议替换。
- 本阶段不修改 v3.5.0、不改变视觉、不删除现有素材。

## 8. 边界声明

- 未修改任何 SVG。
- 未修改 `client.js` / `index.js`。
- 未删除现有素材。
- 未改变主题视觉。
- 未修改 v3.5.0。
- 未将 UNKNOWN 改为 PASS。
- 未将 AI 修改后的第三方素材认定为原创。
- 未创建或替换第三方素材。
- 未将搜索到的候选素材下载进仓库。
- 未修改 LICENSE 或扩大 MIT 授权范围。

## 9. 最终结论

**SVG SOURCE AUDIT COMPLETE**

判断依据：
- 7 组 SVG 全部完成清单、路径/行号、源码块哈希/指纹、用途、tarball 与截图状态记录。
- 本地 Git/文档/开发目录检查完成；原始下载记录、AI 提示词、全量图标库比对明确标记 NOT AVAILABLE / NOT RUN。
- 7 组均完成精确片段/描述性网络搜索；无 CONFIRMED SOURCE。
- UMBRELLA 仅记录为 POSSIBLE MATCH（概念/视觉相似，非同一文件），未升级为确认来源。
- 7 组均给出替换建议（C）与工作量；无一组被标记为原创或 MIT 覆盖。
- 结论不表示项目可以公开发布；7 组来源/授权 UNKNOWN 仍是发布阻塞项。

**附加发现：**
- 清单外 SVG 文件：无（仅 `icon.svg`）。
- SVG 内嵌 base64/位图：未发现；仅存在运行时生成的 `data:image/svg+xml` 字符串。
- Git 历史删除 SVG：未发现。
- 外部 `<image>` / `<use>` / `xlink:href` / `url(http`：未发现。
