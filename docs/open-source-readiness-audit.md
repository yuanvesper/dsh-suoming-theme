# 开源准备度审计报告（SM-REL-002）


> SM-REL-003 后续：README、社区文件草案和素材审计已在 `release-prep/docs` 处理；本文件保留为 v3.5.0 基线审计记录。截图与完整 Web GUI 运行时加载仍为 NOT RUN。

## 1. 审计范围与方法

- 审计对象：
  - commit：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
  - tag：`v3.5.0`（annotated）
  - 分支：`main`
- 审计时工作区：干净（`## main`，无未提交修改）
- 检查方法：
  - Git 只读命令：`rev-parse`、`status`、`ls-files`、`log`、`tag`、`remote`
  - 逐文件读取与文件类型/大小统计
  - 模式搜索：本地绝对路径、密钥/凭据、公开素材引用
  - `package.json`、`.gitignore`、`cordis.patch.yml`、README、docs 核对
  - 实际执行语法、smoke、scene-runtime、host-smoke 测试
- 未执行项：
  - 未在全新、无本机 profile 的环境实际安装（NOT RUN）
  - 未运行 `npm audit`（本包无 dependencies、无 node_modules）
  - 未创建 GitHub 仓库、remote、LICENSE
  - 未做法律意见判断

> 本报告中的 PASS / FAIL / UNKNOWN / NOT RUN 均按实际检查结果标记。

## 2. Git 基线审计

### 2.1 基线一致性

| 检查项 | 实际值 | 结果 |
|---|---|---|
| HEAD | `88459bd8bed3351b2b5d93faac5fcd11d6401380` | PASS |
| 当前分支 | `main` | PASS |
| tag `v3.5.0` | 存在 | PASS |
| tag 指向 | `88459bd8bed3351b2b5d93faac5fcd11d6401380` | PASS |
| tag 类型 | `tag`（annotated） | PASS |
| 工作区 | 审计开始时干净 | PASS |
| remote | 无 | PASS |

### 2.2 跟踪文件

- 跟踪文件总数：**18**
- 总大小：**239,153 B**（约 234 KB）
- 按目录：

```text
根目录：.gitignore, README.md, package.json, client.js, index.js,
        cordis.patch.yml, icon.svg
.dev：dump-css.cjs, host-smoke.mjs, render.cjs, scene-runtime.cjs, smoke.cjs
assets：README.md
docs：agent-memory.md, visual-research.md, screenshots/README.md
locale：zh.json, en.json
```

### 2.3 大文件与生成物

| 检查项 | 结果 |
|---|---|
| >1 MB 跟踪文件 | 无 |
| 最大文件 | `client.js` 146,447 B |
| `node_modules/`、`dist/`、`build/`、`coverage/` 被跟踪 | 否 |
| `*.log`、`*.tmp`、`.DS_Store` 被跟踪 | 否 |
| `.dev/` 临时输出被跟踪 | 否；`.dev` 下为测试脚本与一个 CSS 导出辅助脚本 |
| `suoming-theme-dev/` 被跟踪 | 否（在仓库外） |

### 2.4 作者身份与提交信息

- 作者：`DSH Theme Baseline <baseline@suoming-theme.invalid>`
- 邮箱为保留域名 `.invalid`，不含真实姓名、手机号、公司邮箱。
- commit message 不含本地绝对路径、密钥或内部代号。
- 风险等级：**低**
- 说明：本机没有用户 Git 身份；基线使用了仓库本地自动化身份。若正式公开要求真实作者，需要所有者提供身份后重写 commit/tag。

### 2.5 `.gitignore`

- 已覆盖：`node_modules/`、`dist/`、`coverage/`、`*.log`、`.env*`、`*.pem`、`*.key`、`*.p12`、`credentials*`、`secrets*`、`*.local.*`、`*.tmp`、`*.bak`、`*.orig`、`.vscode/`、`.idea/`、`.DS_Store`、`Thumbs.db`、`profile/`、`suoming-theme-dev/`、`assets/*`（保留 `assets/README.md`）。
- 关键文件未被误排除：`client.js`、`index.js`、`package.json`、`README.md`、`cordis.patch.yml`、`icon.svg`、`locale/zh.json` 均通过 `git check-ignore` 验证。
- `git ls-files -i -c --exclude-standard`：无输出，没有被忽略但仍跟踪的文件。
- `.gitattributes`：**缺失**（P2 缺口，本阶段未创建）。
- 遗漏风险：`.gitignore` 通过 `suoming-theme-dev/` 覆盖开发目录；没有单独 `local-art/` 规则，但该目录位于 `suoming-theme-dev/` 下，已覆盖。

## 3. 版权来源矩阵

| 文件/目录 | 类别 | 来源 | 许可证/授权状态 | 风险等级 | 依据 |
|---|---|---|---|---|---|
| `client.js` | 原创主题代码（含 SVG/CSS） | 本项目开发 | 无项目 LICENSE | UNKNOWN | 未发现第三方版权头或 vendored 代码 |
| `index.js` | 原创 Host 代码 | 本项目开发 | 无项目 LICENSE | UNKNOWN | 未发现第三方版权头 |
| `icon.svg` | 原创 SVG 图形 | 本项目开发 | 无项目 LICENSE | UNKNOWN | 仅内联 SVG，无外部素材引用 |
| `locale/*.json` | 原创中文/英文文案 | 本项目开发 | 无项目 LICENSE | UNKNOWN | 仅主题界面文案 |
| `README.md` / `docs/*` | 项目文档 | 本项目开发，含官方设定引用 | 无项目 LICENSE；引用内容版权归原权利人 | UNKNOWN | 含“鸣潮/锁暝/玄朱锁”等官方术语及少量官方台词片段 |
| `.dev/*.cjs` / `.mjs` | 原创测试脚本 | 本项目开发 | 无项目 LICENSE | UNKNOWN | 无 vendored 第三方库 |
| `assets/README.md` | 素材说明 | 本项目开发 | 无项目 LICENSE | UNKNOWN | 仅说明，无图片 |
| 官方立绘/截图/音频 | 未跟踪 | 本地 profile / dev 目录 | 未授权，未进入仓库 | — | 仓库内无任何位图/音频/视频 |
| 官方台词片段 | 代码字符串/文档引用 | 官方台词语音 | 授权状态未确认 | UNKNOWN | `client.js` 中存在少量官方台词字符串，当前 UI 已隐藏 |

**结论：**
- 仓库中没有从游戏提取的图片、音频、视频。
- 存在官方术语和少量官方台词文本，需项目所有者确认引用范围。
- 没有 LICENSE 或第三方授权文件，版权状态整体为 UNKNOWN。
- `README.md` 未明确声明“非官方同人项目、与库洛游戏无隶属关系”。（P1 文档/IP 风险）

## 4. 许可证与依赖审计

| 检查项 | 实际值 | 结果 |
|---|---|---|
| 根目录 LICENSE/LICENSE.md/COPYING | 均不存在 | **FAIL** |
| `package.json` license 字段 | 不存在 | **FAIL** |
| 声明与文件一致性 | 两者均缺失 | **FAIL** |
| 第三方 vendored 代码 | 未发现 | PASS |
| npm dependencies / devDependencies / peerDependencies | 均不存在 | PASS（无依赖树） |
| `npm audit` | 未运行；无 dependencies、无 node_modules | **NOT RUN** |
| DSH 宿主依赖 | `client.inject` 引用宿主提供模块，未 vendored | PASS（不在本包依赖树内） |

结论：**项目自身许可证缺失，无法满足开源仓库的基本法律声明要求。**  
许可证类型必须由项目所有者选择，本审计不擅自创建或选择。

## 5. 安全风险清单

| 风险项 | 位置 | 类别 | 等级 | 依据 | 状态 |
|---|---|---|---|---|---|
| 无 LICENSE / package license | 仓库根、`package.json` | 许可证 | **P0** | 无许可证声明，所有者未决定 | 未决 |
| 官方台词/设定引用 | `client.js`、`README.md`、`docs/` | 版权/IP | UNKNOWN（条件项） | 少量官方台词与术语，授权状态未确认 | 需所有者确认 |
| 无“非官方/无隶属关系”声明 | README | 品牌/IP | P1 | 使用“鸣潮/锁暝”名称但未声明关系 | 未处理 |
| 本地素材路由暴露 | `index.js` `ART_PREFIX` | 本地资源访问 | P2 | 仅白名单文件名；路径 resolve 限制在素材目录；无任意文件读取 | 已检查，PASS（路径穿越） |
| 配置 PUT 无额外鉴权 | `index.js` `/suoming-config` | 本地接口 | P2 | 依赖 DSH Web 会话/本机访问；无 CORS 扩大 | 需部署环境确认 |
| 密钥/凭据 | 所有跟踪文件与历史 | 密钥 | — | 未发现；模式搜索仅命中变量名 `runToken` | PASS |
| 个人绝对路径 | 跟踪文件 | 隐私 | — | 提交前已脱敏；审计搜索无结果 | PASS |
| 作者私人邮箱 | Git 历史 | 隐私 | — | `baseline@suoming-theme.invalid`，保留域名 | PASS |
| 危险安装脚本 | `package.json` | 供应链 | — | 无 scripts/preinstall/postinstall | PASS |
| 依赖审计 | — | 供应链 | — | 无依赖、无 node_modules | NOT RUN |

**路径穿越结论：PASS。**  
`ART_NAMES` 白名单、`path.resolve(target).startsWith(directory + sep)`、路由只接受 GET/HEAD，未发现可读取任意文件。

## 6. 可安装性结论

| 检查项 | 结果 |
|---|---|
| `dsh.bundle.patch` | PASS，指向 `./cordis.patch.yml` |
| `cordis.patch.yml` 存在 | PASS |
| `files` 包含 `cordis.patch.yml` | PASS |
| `files` 包含 `client.js` / `index.js` / `icon.svg` / `locale/*.json` / README | PASS |
| patch 使用包名而非绝对路径 | PASS（`@local/dsh-theme-suoming`） |
| 对 `suoming-theme-dev/local-art/` 的隐式依赖 | 有运行时回退路径，但缺失素材时主题仍可运行/回退；P2 |
| 实际在陌生环境安装 | **NOT RUN** |
| 卸载说明 | README 含插件管理器/CLI 卸载说明，PASS |
| npm 发布 | `private: true` + `@local` scope，**不适合直接 npm publish**（P1） |

**结构结论：PASS（结构上可作为本地 bundle 安装）。**  
**实际安装结论：NOT RUN。** 不能写成“安装成功”。

## 7. README 文档缺口

| 检查项 | 现状 | 结论 | 建议 |
|---|---|---|---|
| README 版本号 | v3.5.0 | PASS | — |
| package.json 版本 | 3.5.0 | PASS | — |
| 功能描述与实现一致 | 描述仍提“四层场景/立绘”，当前场景大面积动效关闭 | P2 | 标注“当前稳定版关闭全屏场景动效” |
| 前置条件（DSH CLI、pnpm） | 未完整列出 | FAIL | 开源前补齐 |
| GitHub/tarball 安装命令 | 只有本地路径/插件管理器说明 | P1 | 增加 GitHub 仓库/tarball 安装示例 |
| `dsh.bundle.patch` / `files` 说明 | 未说明 | P1 | 增加 bundle 结构说明 |
| “公开包无位图、用户自备 assets” | 已说明 | PASS | — |
| 配置说明 | 有设置、高度、透明度、强度说明 | PASS | — |
| 故障排查 | 有“只改背景色/主题不生效”等排查 | PASS | — |
| 截图/GIF | README 引用 `docs/screenshots/*.png`，但仓库只有 README，文件缺失 | FAIL | 提供截图或删除引用 |
| CONTRIBUTING.md | 缺失 | P2 | 开源前建议补充 |
| SECURITY.md | 缺失 | P1/P2 | 建议补充报告渠道 |
| CODE_OF_CONDUCT.md | 缺失 | P2 | 可选 |
| CHANGELOG.md | 缺失 | P2 | 可选 |
| THIRD_PARTY_NOTICES.md | 缺失 | P1 | 如保留官方引用需补充声明 |
| 中英文 README | 仅中文 | P2 | 目标国际用户时补英文 |
| 非官方声明 | README 只有“非官方语音”局部表述，无项目级声明 | FAIL/P1 | 明确“非官方同人项目，与库洛游戏无隶属关系” |

## 8. GitHub 发布准备度

| 维度 | 状态 | 说明 |
|---|---|---|
| 仓库名称 | P2 建议 | `@local/dsh-theme-suoming` 是本地包名，不适合作为 GitHub 仓库名；建议 `dsh-theme-suoming` 或 `suoming-dsh-theme` |
| GitHub 描述 | P2 建议 | 建议：“非官方《鸣潮》锁暝 DSH 主题：暗色 UI、人物立绘、玄朱锁与动效” |
| Topics | P2 建议 | `dsh-theme`, `wuthering-waves`, `suoming`, `cordis-bundle` |
| 图标 | P2 建议 | `icon.svg` 为合法 64×64 SVG，适合插件图标；不适合 1280×640 GitHub 社交预览 |
| 截图/GIF | FAIL/P2 | README 引用的 5 张截图缺失；未提供 GIF |
| 社区文件 | P1/P2 | CONTRIBUTING、SECURITY、CODE_OF_CONDUCT、CHANGELOG、THIRD_PARTY_NOTICES 均缺失 |
| 中英文 README | P2 | 仅中文 |
| 许可证 | **P0 FAIL** | 无 LICENSE、无 package license |
| 官方授权声明 | P1 | 无项目级“非官方/无隶属关系”声明 |

## 9. P0 / P1 / P2 问题列表

### P0（阻塞开源）

1. **无 LICENSE、无 package.json license 字段，且所有者未决定许可证。**  
   - 位置：仓库根、`package.json`
   - 必须由项目所有者选择许可证；本审计不擅自创建。

### P1（开源前应处理）

1. README 缺少项目级“非官方同人、与库洛游戏无隶属关系”声明。
2. `client.js` / README / docs 中存在官方台词与设定引用；授权范围需所有者确认。
3. README 安装说明不完整（缺前置条件、GitHub/tarball 安装、bundle 结构说明）。
4. `package.json` 为 `private: true` 且包名 `@local/...`，不适合直接 npm 发布。
5. `.gitattributes` 缺失。
6. README 引用的截图文件缺失。
7. v3.4.0 本地备份不完整（仅 5 个核心文件，缺 locale/icon/docs/.dev/assets README）。
8. 无 SECURITY.md/THIRD_PARTY_NOTICES.md（视公开范围）。

### P2（可迭代）

1. 无截图/GIF 展示素材。
2. 无英文 README。
3. 仓库名、Description、Topics 需要重新设计。
4. `icon.svg` 适合插件图标，不适合 GitHub 社交预览。
5. `docs/screenshots/` 只有 README，无实际截图。
6. CONTRIBUTING.md、CODE_OF_CONDUCT.md、CHANGELOG.md 缺失。
7. `.dev/dump-css.cjs` 等开发辅助脚本可考虑移出公开仓库，但不构成阻塞。

## 10. 需要项目所有者作出的决定

1. **许可证选择**：MIT / Apache-2.0 / 其他 / 闭源保留；必须所有者决定。
2. **官方台词与设定引用的授权范围**：保留、缩减、移除或加 THIRD_PARTY_NOTICES。
3. **立绘/表情差分/local-art 的去留**：公开包继续不含位图，还是提供用户自备说明。
4. **仓库名称与公开范围**：是否使用 `dsh-theme-suoming`，是否公开 GitHub。
5. **是否添加项目级非官方声明**，以及声明措辞。
6. **是否使用真实 Git 作者身份**重写 commit/tag（当前为自动化本地身份）。

## 11. 建议的下一阶段工作

1. **P0**：所有者确定许可证；创建 LICENSE 并同步 package.json license 字段（本阶段不执行）。
2. **P1**：补充 README 前置条件、GitHub/tarball 安装、bundle 结构、卸载说明。
3. **P1**：补项目级“非官方同人、无隶属关系”声明；确认官方文本引用范围。
4. **P1**：补 `.gitattributes`；决定是否公开 `.dev/`。
5. **P2**：补截图/GIF、英文 README、SECURITY/CONTRIBUTING/CHANGELOG 模板。
6. **发布前**：在无本机 profile 的干净环境实际执行一次安装（当前 NOT RUN）。
7. **发布前**：安装依赖后补 `npm audit`（当前 NOT RUN；本包无依赖）。

## 12. 最终结论

**NOT READY**

原因：
- 无 LICENSE、无 package license 字段，且所有者尚未决定许可证（P0）。
- README 缺少完整开源安装说明、项目级非官方声明和展示素材。
- 官方台词/设定引用授权状态未确认。
- 实际干净环境安装未执行（NOT RUN）。

条件满足后，可转为 **READY WITH CONDITIONS**；若许可证和 IP 授权完成，再评估 **READY**。

---

**声明：** 本阶段未创建 GitHub 仓库，未配置 remote，未执行 `git push`，未创建 LICENSE，未修改产品功能代码。本报告中的 PASS/FAIL/UNKNOWN/NOT RUN 均按实际检查结果标记，未把未执行项写成通过。
