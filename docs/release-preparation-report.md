# SM-REL-003 发布准备报告

> 本文件在 `release-prep/docs` 分支生成。基线 `main` / tag `v3.5.0` 未改动。  
> 报告不构成对许可证、官方素材授权或法律合规的最终判断。

## 1. 分支与基线

- 分支名：`release-prep/docs`
- 分支起点 commit：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- main HEAD：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- v3.5.0 tag 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- 工作区状态：文档修改已审查，待本次 docs commit；未修改产品代码

## 2. 修改文件清单

| 文件 | 状态 | 说明 |
|---|---|---|
| `README.md` | 重写 | 面向开源用户重写：简介、功能、兼容性、安装、卸载、配置、排障、非官方声明、素材说明、截图 NOT RUN |
| `docs/open-source-readiness-audit.md` | 新增（保留） | SM-REL-002 审计记录，已检查无本地绝对路径/个人邮箱 |
| `docs/third-party-assets-audit.md` | 新增 | 官方台词/设定/名称/原创 SVG/第三方素材/依赖来源矩阵；UNKNOWN 与所有者决策事项 |
| `CONTRIBUTING.md` | 新增 | 贡献流程、测试、代码/文档要求、素材红线；联系方式待配置 |
| `SECURITY.md` | 新增 | 支持版本、私密报告要求、已知路由边界；渠道待配置，不承诺 SLA |
| `CHANGELOG.md` | 新增 | 仅 v3.5.0 基线变更；不虚构历史 |
| `docs/release-preparation-report.md` | 新增 | 本报告；最终 commit hash 在提交后补记 |

## 3. Git diff 摘要

- 变更文件数：7（全部为文档/社区文件）
- 主要变更：
  - README 从开发日志式内容改为可安装、可排障、带非官方声明的发布文档
  - 增加版权/素材来源审计
  - 增加社区文件草案
  - 增加发布准备报告
- 是否包含产品逻辑改动：**无**
- 未修改：`client.js`、`index.js`、`package.json`、`cordis.patch.yml`、`icon.svg`、`locale/*`、`.dev/*`

## 4. Commit

- Commit hash：**待本次提交后补记**
- Commit message：`docs: prepare release documentation and owner review materials`
- 是否已提交：本次提交执行中（提交后补记 hash）
- 基线保护：main 与 `v3.5.0` tag 不动，不合并 main

## 5. 安装机制与干净环境验证

### 安装命令依据

- `dsh --help` 输出：`dsh plugin --profile <name> <pnpm-args...>`
- `dsh plugin --help` 输出：`manage a profile's plugins by forwarding the remaining arguments to pnpm`，示例 `dsh plugin --profile tui add <package>`
- `package.json`：`dsh.bundle.patch = ./cordis.patch.yml`；`files` 包含 `index.js / client.js / cordis.patch.yml / locale/*.json / icon.svg / README.md`
- `cordis.patch.yml`：`theme-suoming` 使用 `@local/dsh-theme-suoming` 包名，不依赖本地绝对路径

### 实际验证环境

| 组件 | 版本/值 |
|---|---|
| DSH runtime CLI | `0.2.2-rc.1` |
| Node.js | `v24.21.0` |
| pnpm | `11.28.5` |
| DSH_HOME | 临时目录 `%TEMP%\sm-rel003-dsh-home`（未使用用户现有 profile） |
| profile | `reltest`（临时） |
| 安装形式 | 本地目录路径（非 GitHub/tarball） |

### 验证结果

| 步骤 | 结果 | 证据 |
|---|---|---|
| `dsh plugin --profile reltest add <local-path>` | **PASS** | `dependencies` 出现 `@local/dsh-theme-suoming 3.5.0`；profile package 写入依赖 |
| `dsh --profile reltest --dump-config` | **PASS** | 组合配置出现 `theme-suoming` 行，name 为 `@local/dsh-theme-suoming` |
| `dsh plugin --profile reltest remove @local/dsh-theme-suoming` | **PASS** | 依赖移除；dump config 不再出现 theme 行 |
| 在完整 Web GUI 中加载主题 | **NOT RUN** | 临时 profile 只有 base + theme，没有 web app bundle；未用用户 profile 启动 Web GUI |
| GitHub/tarball 安装 | **NOT RUN** | 未验证远程包安装形式，README 明确标注待验证 |

**结论：结构安装与 Host 挂载行验证 PASS；完整主题运行时加载 NOT RUN。** 不将 NOT RUN 写成安装成功。

## 6. 截图证据

- 截图文件：**无**
- 是否含未授权素材：不适用（未采集）
- 结果：**NOT RUN**
- 原因：当前运行界面包含本地人物立绘，无法确认可公开授权；且界面含个人工作区/会话内容。为避免未授权素材或隐私进入仓库，本阶段不采集、不提交截图。
- 需要人工补充清单：

| 截图 | 内容 | 要求 |
|---|---|---|
| 01-overview | 主界面 + 侧边栏 | 不含本地立绘、个人路径/会话 |
| 02-composer | 输入区 / 聚焦态 | 不含个人内容 |
| 03-sidebar | 侧边栏装饰 | 确认素材授权后再拍 |
| 04-settings | 设置 → 通用 → 锁暝主题 | 不含个人路径 |
| 05-motion | 旋转锁/局部动效 | 5–10 秒 GIF，可选；不得含未授权素材 |

## 7. 文档与社区文件

| 文件 | 状态 | 说明 |
|---|---|---|
| `README.md` | PASS | 非官方声明、安装/卸载、兼容性、配置、排障、素材说明、截图 NOT RUN |
| `docs/open-source-readiness-audit.md` | PASS（P0 仍存在） | 审计结论 NOT READY；LICENSE 缺失列为 P0；本文档保留为历史输入 |
| `docs/third-party-assets-audit.md` | PASS | 来源矩阵、UNKNOWN、所有者确认事项 |
| `CONTRIBUTING.md` | PASS（草案） | 无虚构维护者/联系方式 |
| `SECURITY.md` | PASS（草案） | 渠道待配置，无 SLA |
| `CHANGELOG.md` | PASS（草案） | 仅 v3.5.0；不虚构历史 |
| `LICENSE` | **未创建** | 所有者决定；本阶段明确不创建 |
| `CODE_OF_CONDUCT.md` | 未创建 | P2 可选 |
| `THIRD_PARTY_NOTICES.md` | 未创建 | 取决于所有者对官方引用/素材的决定 |

## 8. 版权与素材待确认事项

来自 `docs/third-party-assets-audit.md`：

1. `client.js` 中少量官方台词字符串（当前 UI 隐藏）——**UNKNOWN**，需所有者确认保留/缩减/移除。
2. README、docs、注释中的“鸣潮/锁暝/玄朱锁/九方故影”等名称与设定引用——**UNKNOWN**，商标/IP 风险需确认。
3. 本地人物立绘、表情差分在 profile/dev 目录，未跟踪——**UNKNOWN**，不得进入公开仓库。
4. 原创 SVG（icon、锁扣、金锁、玄朱锁、品牌锁芯）——项目内联原创，但项目无 LICENSE，开源授权状态未定。
5. 官方台词引用数量与用途需所有者确认；不得把“非官方声明”当作授权。
6. 第三方代码/依赖：无 npm 依赖、无 vendored 代码；DSH/Cordis 宿主模块未 vendored；依赖许可证扫描 **NOT RUN**。

## 9. 未解决问题

### P0
- 无新增工程 P0。
- 既有 P0：**无 LICENSE、无 package.json license 字段，且所有者未决定许可证**。本阶段按边界不创建 LICENSE。

### P1
- 官方台词/设定引用授权状态 UNKNOWN。
- 项目级“非官方/无隶属关系”声明已加入 README；仍建议所有者审阅措辞。
- GitHub/tarball 安装形式未验证。
- 完整 Web GUI 主题加载 NOT RUN。
- `.gitattributes` 缺失（P2/P1，视发布要求）。
- v3.4.0 本地备份不完整（内部回溯项，不影响公开包）。

### P2
- 无安全截图/GIF。
- README 仅中文；英文 README 未创建。
- 仓库名/Description/Topics/社交预览图待定。
- `CODE_OF_CONDUCT.md`、`THIRD_PARTY_NOTICES.md` 未创建。

## 10. 需要项目所有者决定的事项

1. **许可证选择**：MIT / Apache-2.0 / 其他 / 保留权利；本阶段不创建 LICENSE。
2. **官方台词与设定引用**：保留、缩减、移除，或增加第三方声明。
3. **立绘/官方素材授权**：是否公开任何截图、是否提供授权素材、是否只保留用户自备。
4. **仓库名称、公开范围、英文 README、社交预览素材**。
5. **是否使用真实 Git 作者身份**重写当前自动化基线身份。
6. **SECURITY/CONTRIBUTING 中的正式联系方式、治理方式**。

## 11. 最终判断

**READY FOR OWNER REVIEW**

判断依据：
- 本阶段可自主执行的工程/文档工作已完成：README、第三方素材审计、社区文件草案、发布报告、临时干净 profile 安装/卸载验证。
- 截图和完整 Web GUI 运行时加载因“未授权立绘/隐私”和“无完整干净 web profile”明确标记 **NOT RUN**，未伪造通过。
- 剩余阻塞为所有者法律/版权/许可证决策：LICENSE 选择、官方台词/名称引用授权、素材公开范围。
- 未创建 LICENSE，未配置 remote，未 push，未合并 main，未改产品功能代码。

## 12. 声明

- 未创建 LICENSE。
- 未配置 remote，未执行 `git push`。
- 未合并 main，未修改 `v3.5.0` tag。
- 未修改 `client.js` / `index.js` 产品功能逻辑。
- 报告中 PASS/FAIL/UNKNOWN/NOT RUN 均基于实际检查或明确环境限制，无伪造。
