# MIT 许可证实施报告（SM-REL-006）

## 1. LICENSE 创建

- 是否创建：**是**
- 文件路径：`LICENSE`
- 版权行：`Copyright (c) 2026 zhouke`
- 逐字符核对：**一致**
- 正文是否标准 MIT：**是**（与标准 MIT 文本逐字符比对一致）
- 是否增加额外条款：**否**
- 文件规格：1,063 字节，21 行，UTF-8，LF，无 CRLF
- 文件名：`LICENSE`（无 `.md` / `.txt` 后缀）

## 2. package.json license 字段

- 是否评估：**是**
- tarball 内容：SM-REL-004 的 tarball 包含 `client.js`、`icon.svg`、`locale/*.json`、`README.md` 等；新增 `LICENSE` 后重新打包，tarball 自动包含 `LICENSE`。`client.js` 内含 7 组 SVG 中的内联图形及台词池，locale/README 含官方名称。
- UNKNOWN/第三方分布：
  - 7 组 SVG 全部 UNKNOWN；
  - 官方台词、角色名、游戏名、设定引用为 UNKNOWN/THIRD-PARTY；
  - 本地立绘不进入 tarball。
- 建议：**不添加 `"license": "MIT"`**。简单的 SPDX 标识符容易被理解为整个 npm 包内所有内容均以 MIT 授权，包括 UNKNOWN SVG 与官方 IP 内容，存在误导风险。
- 备选（未执行）：`"license": "SEE LICENSE IN LICENSE"` 并配合 README 范围说明；或保持无字段并在 README 说明。
- 是否实际修改：**否**。未擅自添加任何 license 字段，也未修改其他 package.json 字段。

## 3. README 授权范围

- 新增/修改章节：`## 许可与授权范围`
- 是否明确排除：
  - 官方 IP 内容：**是**
  - 本地人物立绘/表情差分：**是**
  - UNKNOWN SVG：**是**（表述为“部分 SVG 来源待确认”，未列具体文件名）
  - 其他第三方内容：**是**
- 是否明确“MIT 仅覆盖所有者有权授权的代码和原创内容”：**是**
- 是否说明非官方声明不等于授权：**是**
- 是否说明公开包不含本地立绘/未授权音频：**是**
- 是否存在扩大解释残留：**否**（未发现“所有素材均可自由使用/全部开源”等表述）

## 4. 7 组 SVG 状态

7 组全部保持 **UNKNOWN**，MIT 不自动覆盖：

| SVG | 路径 | 状态 | MIT 覆盖 |
|---|---|---|---|
| 图标 | `icon.svg` | UNKNOWN | 不覆盖/待确认 |
| 锁链基础 | `client.js` `CHAIN_SVG` | UNKNOWN | 不覆盖/待确认 |
| 锁扣/金锁图形 | `client.js` `LOCK_GLYPH_SVG` | UNKNOWN | 不覆盖/待确认 |
| 玄朱锁 | `client.js` `XUANZHU_LOCK_SVG` | UNKNOWN | 不覆盖/待确认 |
| 机关伞 | `client.js` `UMBRELLA_SVG` | UNKNOWN | 不覆盖/待确认 |
| 动态锁链 | `client.js` `CHAIN_DYNAMIC_SVG` | UNKNOWN | 不覆盖/待确认 |
| 墨迹 | `client.js` `INK_WASH_SVG` | UNKNOWN | 不覆盖/待确认 |

未把任何 SVG 标记为 CONFIRMED ORIGINAL 或 MIT 授权。品牌位锁芯、四角星/三角装饰如为独立原创，仍需设计/作者证据。

## 5. 其他第三方内容

- 官方台词：**UNKNOWN/THIRD-PARTY**，MIT 不覆盖；当前 UI 隐藏，但源码仍包含台词池。
- 角色名称/游戏名称：**UNKNOWN**，MIT 不改变商标/版权状态。
- 本地立绘/表情差分：**UNKNOWN / USER-PROVIDED**，不进入公开包；MIT 不覆盖。
- 官方原画/音频/视频：仓库未跟踪；未添加。
- 依赖许可证：SM-REL-002 未扫描依赖树（无 npm dependencies、无 node_modules），**NOT RUN**；DSH/Cordis 宿主模块未 vendored。
- 第三方宿主模块的 MIT 许可不能替代本项目 LICENSE，也不能覆盖官方 IP。

## 6. 审计文档更新

| 文件 | 更新内容 | UNKNOWN 保留 |
|---|---|---|
| `docs/third-party-assets-audit.md` | 记录 MIT 决定与版权声明；7 组 SVG 全部改为 UNKNOWN + MIT 覆盖列；官方内容仍 UNKNOWN | 是 |
| `docs/owner-decision-brief.md` | 许可证决策改为“已决定 MIT”；package 字段记录“不添加”；其余决策保持待定 | 是 |
| `CONTRIBUTING.md` | 将“没有 LICENSE”改为 MIT，并限定贡献授权范围 | 不适用 |

是否区分“许可证已确定”和“第三方授权未确定”：**是**。

## 7. 文档一致性检查

| 文件 | 发现的矛盾 | 处理方式 |
|---|---|---|
| `README.md` | 原“没有 LICENSE”段落 | 已改为 MIT + 范围说明 |
| `CONTRIBUTING.md` | 原“本项目当前没有 LICENSE” | 已改为 MIT，并明确贡献者仅在其有权授权范围内按 MIT 授权，不转让版权、不重新授权第三方素材 |
| `SECURITY.md` | 未发现许可证/授权范围矛盾 | 无修改 |
| `CHANGELOG.md` | 未声称“采用 MIT 覆盖全部内容” | 无修改 |
| `docs/open-source-readiness-audit.md` | 历史基线报告仍写“无 LICENSE” | 保留为 SM-REL-002 历史记录，不视为当前状态；本报告和 owner brief 已明确当前 MIT |
| `docs/release-preparation-report.md` | 历史报告仍写“未创建 LICENSE” | 保留为 SM-REL-003 历史记录；本报告已更新当前状态 |
| `docs/runtime-verification-report.md` | 历史报告仍把“无 LICENSE”列为 P0 | 保留为 SM-REL-004 历史记录；本报告已更新当前状态 |
| 其他 docs | 未发现“所有素材均可商用/全部内容开源/public domain”等扩大解释 | 无修改 |

## 8. 文件变更清单

| 文件 | 状态 | 说明 |
|---|---|---|
| `LICENSE` | 新增 | 标准 MIT，Copyright (c) 2026 zhouke |
| `README.md` | 修改 | 新增“许可与授权范围”，明确 MIT 覆盖与排除项 |
| `CONTRIBUTING.md` | 修改 | 修正无 LICENSE 的旧说法；限定贡献授权范围 |
| `docs/third-party-assets-audit.md` | 修改 | 记录 MIT 决定；7 组 SVG 保持 UNKNOWN；增加 MIT 覆盖列 |
| `docs/owner-decision-brief.md` | 修改 | 许可证决策改为已决定 MIT；package 字段评估记录；其他 UNKNOWN 保留 |
| `docs/license-implementation-report.md` | 新增 | 本报告 |
| `package.json` | 未修改 | license 字段未添加；未改其他字段 |

## 9. Git 状态

- 分支：`release-prep/docs`
- Commit hash：**本报告提交后记录**
- main 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- v3.5.0 tag 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- 工作区状态：本次修改待提交；无产品代码变更

## 10. 边界声明

- 是否修改产品功能代码：**无**
- 是否配置 remote / push：**否**
- 是否将 UNKNOWN SVG 标记为原创：**否**
- 是否将官方 IP 纳入 MIT 覆盖：**否**
- 是否删除或改写官方内容：**否**
- 是否添加未授权素材：**否**
- 是否修改 package.json：**否**

## 11. 未解决 UNKNOWN

1. 7 组 SVG 的原创性/授权。
2. 官方台词引用是否需替换或删除。
3. 角色名称/游戏名称的公开使用方式。
4. 本地立绘的公开策略。
5. Git 作者邮箱是否需要 `.mailmap` 或重写。
6. 社区联系方式是否配置。
7. 依赖许可证扫描（NOT RUN，无依赖树）。
8. DSH 其他版本/OS 兼容性。

## 12. 需要所有者决定的事项

1. 是否接受“MIT 仅覆盖代码/有权授权的原创内容，第三方内容排除”的现状。
2. 7 组 SVG 是否补充原创声明或替换。
3. `package.json` license 字段最终选择：保持不添加、使用 `SEE LICENSE IN LICENSE`，或另行决定。
4. 官方台词引用的处理方式。
5. 立绘公开策略。
6. Git 作者身份与社区联系方式。

## 13. 最终结论

**MIT IMPLEMENTED WITH SCOPE CLARIFICATION**

判断依据：
- 标准 MIT LICENSE 已创建，版权行逐字符一致，无额外条款。
- README 已明确 MIT 覆盖范围并排除官方 IP、本地立绘、UNKNOWN SVG、其他第三方内容；无扩大解释。
- package.json license 字段已评估，因包内含 UNKNOWN/第三方内容而选择不添加，未产生误导。
- 7 组 SVG 全部保持 UNKNOWN，未被误标为原创或 MIT 覆盖。
- 审计文档已更新并保留所有 UNKNOWN，明确区分“许可证已确定”和“第三方授权未确定”。
- 未修改产品功能，未创建 remote，未 push，未改 main/tag。
- 第三方内容仍为 UNKNOWN/待确认，这是已知状态，不是本阶段工程阻塞。

不得将本结论表述为“项目内所有素材均已获得授权”或“项目已可以公开发布”。
