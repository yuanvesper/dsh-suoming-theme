# 第三方与官方素材来源审计

> 版本：v3.5.0 基线  
> 结论状态：**官方台词/名称/立绘仍为 UNKNOWN 或 THIRD-PARTY；AI 生成 SVG 已由所有者确认**  
> 所有者决定（SM-REL-006）：项目代码和项目所有者有权授权的原创内容采用 **MIT License**，版权声明 `Copyright (c) 2026 zhouke`。  
> SM-REL-008：7 组 SVG 由所有者确认为 **AI 根据文字描述生成**（可能经 DSH 加工），记录为 **AI-GENERATED, OWNER-CONFIRMED**，MIT 覆盖以所有者确认范围为限。  
> MIT 选择已确定，但**不等于**官方台词、名称、官方立绘、本地立绘或其他第三方素材已授权。  
> 本文件只记录来源和风险，不做法律判断，不构成授权声明。

## 1. 官方台词

| 文件/位置 | 引用内容 | 数量/范围 | 用途 | 状态 |
|---|---|---|---|---|
| `client.js` `.dsh-suoming` 台词池 | “凄雨瘴雷散去后，只留下……锁中执念。”等 | 少量短句（约 18 条匹配，含重复） | 角色互动文案；当前 UI 已隐藏 | **UNKNOWN** |
| `README.md` | 锁暝角色名、少量官方设定引用 | 少量 | 项目介绍 | **UNKNOWN** |
| `docs/visual-research.md` | 官方视觉、台词、设定摘要 | 研究摘录 | 设计依据记录 | **UNKNOWN** |

处理建议：
- 公开前由项目所有者确认官方台词引用范围。
- 若不能确认授权，建议移除或替换为原创文案。
- 不得把“引用少量台词”当作官方授权。

## 2. 官方设定引用

| 位置 | 内容 | 状态 |
|---|---|---|
| `README.md` | “鸣潮”“锁暝”“玄朱锁”“九方故影”“禁锁十契”等名称 | **UNKNOWN / 商标与 IP 需确认** |
| `client.js` / `index.js` 注释 | 锁暝主题、角色名、机关伞等 | **UNKNOWN** |
| `locale/*.json` | 主题标题与描述使用“锁暝” | **UNKNOWN** |
| `docs/visual-research.md` | 官方档案、实机演示、画廊摘要 | **UNKNOWN** |

处理建议：
- 保留非官方同人声明；
- 公开前确认名称使用范围；
- 不声称官方授权或官方合作。

## 3. 角色与游戏名称

| 名称 | 使用位置 | 风险提示 | 状态 |
|---|---|---|---|
| 鸣潮 / Wuthering Waves | README、注释、文档 | 游戏名称商标风险 | **UNKNOWN** |
| 锁暝 / Suoming | README、locale、代码注释 | 角色名称/IP 风险 | **UNKNOWN** |
| 库洛游戏 / Kuro Games | README 的非官方声明/版权说明 | 仅用于说明权利归属，不暗示授权 | **UNKNOWN** |

## 4. 原创 SVG 与图形

SM-REL-008 所有者确认：以下 7 组 SVG 由 **AI 根据文字描述生成**，可能经过 DSH 加工或修改。  
状态记录为 **AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖依据所有者确认的范围，不再标记为“第三方 UNKNOWN”。  
本记录不将 AI 生成素材声明为“手绘原创”或“第三方开源素材”。

| SVG | 路径/位置 | 当前状态 | MIT 覆盖状态 |
|---|---|---|---|
| 图标 | `icon.svg` | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 锁链基础 SVG | `client.js` `CHAIN_SVG`（约 454-463 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 锁扣/金锁图形 | `client.js` `LOCK_GLYPH_SVG`（约 469-478 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 玄朱锁 | `client.js` `XUANZHU_LOCK_SVG`（约 482-508 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 机关伞 | `client.js` `UMBRELLA_SVG`（约 601 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 动态锁链 | `client.js` `CHAIN_DYNAMIC_SVG`（约 602 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |
| 墨迹 | `client.js` `INK_WASH_SVG`（约 603 行） | AI-GENERATED, OWNER-CONFIRMED | 覆盖（所有者确认） |

说明：
- 状态依据项目所有者确认，不等同于独立的法律或来源核验。
- SM-REL-007 的搜索未找到外部同源文件，这不影响“AI 生成”的所有者确认，也不把搜索到的相似素材当作来源。
- 品牌位锁芯、四角星/三角装饰如由上述 SVG/CSS 组合生成，仍在所有者确认范围内；如单独主张，需补充生成记录。

## 5. 图片、字体、音频、视频

| 类型 | 仓库内是否跟踪 | 来源/状态 |
|---|---|---|
| PNG/JPG/WebP/GIF | 是（仅 `docs/screenshots/runtime-verification.png`） | 隔离运行时截图，图片层已隐藏；无官方素材 |
| 字体文件 | 否 | 无 |
| 音频/视频 | 否 | 无 |
| 官方人物立绘（char.jpg / char.png） | 是（仅本地 profile / dev，未跟踪） | 从游戏/官方渠道提取；**不进入公开包，不纳入 MIT** | **THIRD-PARTY** |
| 本地人物立绘/表情差分 | 否（在 profile / `suoming-theme-dev`） | 不进入公开仓库；授权状态 **UNKNOWN** | **USER-PROVIDED / UNKNOWN** |
| `docs/screenshots/runtime-verification.png` | 项目运行时截图 | 无本地立绘/个人路径；项目自身截图，许可状态随项目 LICENSE | **UNKNOWN** |

公开包不包含位图。用户自备素材的版权与授权由用户自行确认。

## 6. 第三方代码与依赖

| 项目 | 状态 | 说明 |
|---|---|---|
| `package.json` dependencies | 无 | 无 npm 第三方依赖 |
| devDependencies / peerDependencies | 无 | — |
| vendored 代码 | 未发现 | `client.js`/`index.js` 未发现第三方版权头 |
| Cordis / DSH 宿主模块 | 宿主提供，未 vendored | 本项目通过 `client.inject` 使用；未独立复制其代码 |
| 依赖许可证扫描 | **NOT RUN** | 无 node_modules / 无依赖树，未执行 npm audit |
| 官方素材授权 | **UNKNOWN** | 需项目所有者确认 |

> 已知 DSH/Cordis 本身采用 MIT 许可；本项目的根 LICENSE 为 MIT，但宿主依赖、官方 IP 和 UNKNOWN SVG 仍不受本项目 MIT 自动覆盖。

## 7. 需要项目所有者确认

1. 官方台词引用是否保留、缩减或移除。
2. “鸣潮/锁暝”名称使用范围与商标风险是否接受。
3. 本地立绘/表情差分是否只在本地使用，是否提供素材来源说明。
4. 是否创建 `THIRD_PARTY_NOTICES.md` 及其内容。
5. 许可证类型已由所有者选择为 MIT；是否在 package.json 添加 license 字段、是否补充 THIRD_PARTY_NOTICES 仍需决定。
6. 是否公开任何截图；如公开，截图不得含未授权素材。

## 8. 结论

- 仓库内仅有 1 个安全运行时截图；没有跟踪其他图片、音频、视频或字体文件。
- 两张官方立绘不跟踪、不进入公开包；状态 **THIRD-PARTY**，不纳入 MIT。
- 存在官方名称、设定和少量台词引用，状态为 **UNKNOWN**。
- 7 组 SVG 为 **AI-GENERATED, OWNER-CONFIRMED**，按所有者确认纳入 MIT 范围。
- 存在第三方宿主依赖，但没有 vendored 代码或 npm 依赖。
- 版权与授权状态不能由工程审计自行判定，需项目所有者确认。

**审计状态：MIT 已选择；AI 生成 SVG 已由所有者确认；官方立绘/台词/名称仍不纳入 MIT。**
