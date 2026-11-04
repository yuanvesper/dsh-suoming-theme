# SM-REL-004 运行时与分发验证报告

## 1. Git 状态

- 分支：`release-prep/docs`
- HEAD：`87e4ec69aa61158c228006cb75116c01bd342194`（验证开始时）
- main 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- v3.5.0 tag 指向：`88459bd8bed3351b2b5d93faac5fcd11d6401380`
- 工作区状态：验证开始时干净；本报告、截图和 `.gitattributes` 为本次新增/修改

## 2. Tarball 验证

- 打包命令：
  ```bash
  pnpm pack --pack-destination <temp-dir>
  ```
- 产物：
  `%TEMP%\sm-rel004-pack\local-dsh-theme-suoming-3.5.0.tgz`，44,181 B
- 文件清单摘要：
  ```text
  package/client.js
  package/cordis.patch.yml
  package/icon.svg
  package/index.js
  package/locale/en.json
  package/locale/zh.json
  package/package.json
  package/README.md
  ```
- 敏感内容检查：未发现 `node_modules/`、`.dev/`、`local-art/`、图片、profile、`.env`、密钥。
- 隔离环境：
  - `DSH_HOME=%TEMP%\sm-rel004-dsh-home`
  - profile：`verify-004`
  - 由 `dsh --profile verify-004 --from-default-profile web --dump-config` 初始化，未使用用户现有 profile
- 安装命令：
  ```bash
  dsh plugin --profile verify-004 add <tarball>
  ```
  - exit code：`0`
  - 输出：`+ @local/dsh-theme-suoming 3.5.0`
  - profile `package.json` 写入 `@local/dsh-theme-suoming`，bundles 包含本包
- `--dump-config`：
  - 出现：
    ```yaml
    # == @local/dsh-theme-suoming
    - id: theme-suoming
      name: '@local/dsh-theme-suoming'
    ```
  - 结论：PASS（进入组合配置，不等于视觉生效）
- 卸载命令：
  ```bash
  dsh plugin --profile verify-004 remove @local/dsh-theme-suoming
  ```
  - exit code：`0`
  - 依赖移除，dump-config 不再出现 `theme-suoming`
  - 结论：PASS

**Tarball 结果：PASS。**

## 3. Web GUI 运行时验证

- 启动命令：
  ```bash
  dsh --profile verify-004 --host 127.0.0.1 --port 18404 --no-open
  ```
  - 说明：`dsh web` 是内置 web profile 的入口；自定义 profile 使用 profile 后直接传 web app 参数。首次误用 `dsh --profile verify-004 web` 报 `too many arguments`，已按实际 CLI 修正。
- 监听：`127.0.0.1:18404`
- 浏览器工具：本机 Chrome 156 headless + CDP
- 实际运行时检查结果：

| 检查项 | 结果 |
|---|---|
| 页面标题 | `DeepSeek Harness` |
| `data-dsh-suoming` | true |
| 场景层 `.dsh-suoming-scene` | true |
| 旋转锁 `.dsh-suoming-corner-lock` | true |
| 右侧立绘层 `.dsh-suoming-right-art` | true |
| `body` 背景 | `rgb(13, 12, 14)` + 主题径向渐变 |
| page error | 无 |
| console error | 无 |
| 主内容/侧边栏/输入区 | 已渲染 |
| 设置入口“锁暝主题” | 未做视觉核对（PARTIAL）：空白临时 profile 出现“开始使用 / 登录”弹窗 |

- 主题样式是否生效：**PASS**（运行时 DOM 主题属性、场景层、锁、右侧层均存在；暗红/近黑背景实际渲染）
- 截图：`docs/screenshots/runtime-verification.png`
  - 截图前注入 `img{display:none}`，不含本地人物立绘；
  - 临时空白 profile，不含个人路径/会话；
  - 截图内容是隔离环境的预览/登录界面，不是用户真实会话。
- 停止/清理：
  - 终止 web 进程树，端口 18404 已释放；
  - Chrome headless 进程已终止；
  - 临时 DSH_HOME 保留用于复查后清理，不进入 Git。

**Web GUI 结果：PASS（主题运行时加载）；设置页视觉核对 PARTIAL。**

## 4. 隐私与素材隔离

- `DSH_HOME`：`%TEMP%\sm-rel004-dsh-home`，不是 `~/.dsh`
- 真实 profile：未使用
- 真实会话：未使用；临时 profile 无真实对话
- tarball：不含图片/音频/视频/本地素材
- 截图：隐藏所有图片；无本地立绘、个人路径、账号、设备名
- 临时目录、tarball、Chrome profile：均不进入 Git
- Git status：仅本报告、截图、`.gitattributes`、README 文档更新

**隐私隔离结果：PASS。**

## 5. `.gitattributes`

- 原状态：缺失
- 评估：需要
  - Git 曾提示 `.js/.md` 等 LF 将被 CRLF 替换，存在跨平台换行不一致风险；
  - 需要把 `.tgz`、`.png` 等标记为 binary，避免 diff/换行处理；
  - 需要固定文本文件为 LF，保证 Windows/Linux/macOS 一致。
- 新增规则：
  ```gitattributes
  * text=auto eol=lf
  *.js text eol=lf
  *.cjs text eol=lf
  *.mjs text eol=lf
  *.json text eol=lf
  *.yml text eol=lf
  *.md text eol=lf
  *.svg text eol=lf
  *.tgz binary
  *.png binary
  *.jpg binary
  *.jpeg binary
  *.webp binary
  *.woff2 binary
  ```
- 结论：PASS（新增，有依据）

## 6. 文档一致性

| 路径 | README 当前描述 | 测试证据 | 是否一致 |
|---|---|---|---|
| 本地目录安装 | 已验证；`dsh plugin --profile desktop add <path>` | 临时 profile 本地目录安装验证 | PASS |
| 本地 tarball 安装 | 已验证；`dsh plugin --profile desktop add <tgz>` | 本次 tarball add / dump / remove | PASS |
| GitHub 仓库安装 | 标注“尚未验证” | 未执行 | PASS（明确未验证） |
| 完整 Web GUI 加载 | 标注“已实际启动；设置页视觉 PARTIAL” | 隔离 Web GUI + CDP 检查 | PASS |
| 兼容版本 | 仅写 DSH 0.2.2-rc.1 / Node 24.21.0 / pnpm 11.28.5 | 实际运行环境 | PASS |
| 截图 | 引用 `docs/screenshots/runtime-verification.png` | 已提交安全截图 | PASS |

## 7. Git 提交

- 修改/新增文件：
  - `README.md`
  - `.gitattributes`
  - `docs/runtime-verification-report.md`
  - `docs/screenshots/runtime-verification.png`
  - `docs/third-party-assets-audit.md`
- diff 摘要：
  - README：补充隔离环境 tarball/Web GUI 验证结果与安全截图；
  - `.gitattributes`：新增换行与二进制规则；
  - 运行时报告：新增；
  - 安全截图：新增；
  - 第三方素材审计：补充截图记录。
- Commit hash：**本报告提交后记录**
- Commit message：`docs: add SM-REL-004 runtime and tarball verification report`
- 是否包含产品逻辑修改：**无**

## 8. 未解决问题

### P0
- 无新增工程 P0。
- 既有所有者决策项仍然存在：无 LICENSE / 无 package license 字段，许可证未定（不在本阶段工程范围内）。

### P1
- 完整设置页在登录后的视觉核对未执行（PARTIAL；空白 profile 被登录弹窗阻止）。
- GitHub 远程安装未验证（NOT RUN）。
- 官方台词/设定引用授权状态 UNKNOWN。
- DSH 其他版本/操作系统未验证。

### P2
- 截图只覆盖启动/登录界面；主界面、输入区、设置页截图仍需所有者确认后补充。
- 无 GIF 动效展示。
- 英文 README 未创建。
- CODE_OF_CONDUCT / THIRD_PARTY_NOTICES 未创建。

## 9. 需要项目所有者决定的事项

1. 许可证选择；本阶段不创建 LICENSE。
2. 官方台词/设定/名称引用的授权范围。
3. 是否公开运行截图、是否需要补充主界面/设置页截图。
4. 是否验证 GitHub 远程安装。
5. 是否使用真实 Git 作者身份。

## 10. 最终判断

**TECHNICAL VERIFICATION PASSED**

判断依据：
- 本地 tarball 打包 PASS，文件清单完整且无敏感素材。
- 隔离 DSH_HOME 中 tarball 安装、`--dump-config` 识别、卸载恢复均 PASS。
- 隔离 Web GUI 实际启动，主题属性、场景层、右侧层、旋转锁层实际存在，无 console/page error。
- 截图安全，不含本地立绘/个人资料。
- README 与实际测试一致，GitHub 未验证项已明确标注。
- 未修改产品功能逻辑，main 和 v3.5.0 tag 未变。
- 设置页视觉核对因登录弹窗为 PARTIAL，但不影响“主题运行时加载”验证。

## 11. 声明

- 未创建 GitHub 仓库，未配置 remote，未执行 `git push`。
- 未创建 LICENSE，未擅自选择许可证。
- 未修改 `client.js` / `index.js` / `package.json` 的产品逻辑或版本信息。
- main 和 `v3.5.0` tag 保持不变。
- PASS/FAIL/UNKNOWN/NOT RUN 均基于实际执行或明确环境限制，无伪造。
