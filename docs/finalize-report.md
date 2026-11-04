# 发布收尾报告（SM-REL-008）

## 1. 立绘分离结果

### 两套本地官方立绘

| 项目 | 右侧立绘 | 左侧立绘 |
|---|---|---|
| 文件形态 | 本地 profile assets `char.jpg` | 本地 profile assets `char.png` |
| 大小 | 322,643 B | 488,886 B |
| SHA-256 | `A31CACC7F7EE088B259EF4D5E8050DAE946557B398708C9AA3DCBF397DC301FB` | `2D51F70E69F802109D2EA3BD47C279BE5DB27ED1F8D7C30433FDC9406D92BABB` |
| Git 跟踪 | 否 | 否 |
| 进入 npm tarball | 否 | 否 |
| 引用点 | `client.js:901`（隐藏伪元素）、`client.js:1112`（场景角色图）、`client.js:1119`（全页面层）、`client.js:1354`（右固定层） | `client.js:1367`（侧边栏层） |
| Host 素材名 | `index.js` `ART_NAMES` 白名单 | `index.js` `ART_NAMES` 白名单 |
| 缺失 fallback | 图片 error 时移除对应图层，背景/锁/正文保留 | 图片 error 时移除侧栏层，背景/锁/正文保留 |
| 耦合程度 | 独立视觉层，不与状态机台词/布局逻辑强耦合 | 独立视觉层，不影响布局 |

### 分离方式

- **package.json files 白名单**：不包含任何 `*.jpg`、`*.png`、`*.webp`、`local-art/`、`profile/`。
- **Host 只读路由**：`/suoming-local-art/<whitelisted-file>` 仅从本地 profile assets / `SUOMING_LOCAL_ART` / 安装包 assets 目录读取；公开包内没有图片时返回 404。
- **Client fallback**：两个 `<img>` 都有 error 监听；图片不存在时移除图层，主题继续渲染场景/锁/正文。
- **未修改 client.js / index.js**：现有本地素材路由 + fallback 已满足分离；没有新增产品逻辑。

### 用户本地配置机制

已实现的既有机制：
- 默认目录：`$DSH_HOME/profiles/<profile>/suoming-theme/assets/`
- 可用环境变量：`SUOMING_LOCAL_ART=<本地目录>`
- 支持文件名：`char.jpg / char.png / char.webp`、`side.jpg / side.png / side.webp`、`portrait.png`
- 设置项：`portraitEnabled`（显示/隐藏角色区域）

未新增任意路径 UI 输入框，以避免修改冻结功能；README 已说明固定目录 + 环境变量两种方式。

**公开包是否已排除立绘：是。**  
**无立绘时主题渲染：PASS。**

## 2. AI 生成 SVG 说明

7 组 SVG（保留、未替换）：

- `icon.svg`
- `CHAIN_SVG`
- `LOCK_GLYPH_SVG`
- `XUANZHU_LOCK_SVG`
- `UMBRELLA_SVG`
- `CHAIN_DYNAMIC_SVG`
- `INK_WASH_SVG`

所有者确认：**AI 根据文字描述生成，可能经过 DSH 加工或修改**。  
状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖范围按所有者确认执行。  
不声明为手绘原创，也不声明为第三方开源素材。

说明文档：`docs/ai-generated-assets.md`（已创建，并加入 tarball）。  
README 与 `docs/third-party-assets-audit.md` 已同步。

## 3. 授权范围

- MIT 覆盖：项目代码 + AI 生成的原创 SVG（以所有者有权授权范围为限）。
- 明确排除：
  - 《鸣潮》官方台词、角色设定、名称及其他官方 IP；
  - 两张从游戏/官方渠道提取的官方立绘；
  - 用户自备立绘、表情差分及其他第三方素材。
- 官方立绘状态：**THIRD-PARTY**，不进入公开包，不纳入 MIT。
- 官方台词/名称/设定：**UNKNOWN**，不纳入 MIT。
- 非官方声明不等于授权；README 不声称已获得库洛游戏许可。

## 4. 包纯净度

### files 字段

```json
[
  "index.js",
  "client.js",
  "cordis.patch.yml",
  "locale/*.json",
  "icon.svg",
  "README.md",
  "LICENSE",
  "docs/ai-generated-assets.md",
  "docs/third-party-assets-audit.md"
]
```

### 实际打包

- 命令：`pnpm pack --pack-destination <temp>`
- 产物：`local-dsh-theme-suoming-3.5.0.tgz`，49,395 B
- 文件数：**11**
- 清单：

```text
package/LICENSE
package/client.js
package/index.js
package/locale/en.json
package/locale/zh.json
package/package.json
package/docs/ai-generated-assets.md
package/docs/third-party-assets-audit.md
package/icon.svg
package/README.md
package/cordis.patch.yml
```

- 官方立绘：**0**
- `.dev/`、`suoming-theme-dev/`、profile、临时文件、密钥：**0**
- 图片/音频/视频：**0**
- AI 生成 SVG：按预期存在于 `icon.svg` 与 `client.js` 内联代码中

## 5. 安装与运行时验证

环境：
- DSH CLI：`0.2.2-rc.1`
- Node.js：`v24.21.0`
- pnpm：`11.28.5`
- 临时 `DSH_HOME`：`%TEMP%\sm-rel008-dsh-home`
- `DSH_PROFILE_DIR` 显式指向临时 profile；未使用用户现有 profile
- `SUOMING_LOCAL_ART` 在无立绘测试中显式清除

| 测试项 | 结果 | 说明 |
|---|---|---|
| tarball 安装 | PASS | `dsh plugin --profile verify-008 add <tgz>`，exit 0 |
| 插件识别 | PASS | `--dump-config` 出现 `theme-suoming` |
| Web GUI 加载 | PASS | 隔离 Web GUI 实际启动；`data-dsh-suoming`、场景层、旋转锁层存在；无 page error / console error |
| 无立绘渲染 | PASS | 无 profile 素材、无 `SUOMING_LOCAL_ART` 时，右侧/侧栏层不存在；暗色渐变 + 锁层仍在 |
| 本地配置加载 | PASS | 用非官方 120×180 测试图放入临时 `SUOMING_LOCAL_ART`，右侧层加载成功；未使用官方立绘 |
| 缺失 fallback | PASS | 无素材/404 时图层自动移除，主题无报错 |
| 卸载恢复 | PASS | `dsh plugin remove` exit 0；dump-config 无 theme 行；端口释放 |

**补充：** 首次启动时继承了当前会话的 `DSH_PROFILE_DIR`，导致测试读取了用户 profile 的本地素材；已显式覆盖 `DSH_PROFILE_DIR` 为临时 profile 并清除 `SUOMING_LOCAL_ART`，重跑后得到上述无立绘/本地测试图结果。最终验证未使用用户真实 profile 素材。

## 6. 发布阻塞清单

### P0
- 无。  
  - 官方立绘不在公开包。  
  - 无密钥/隐私文件进入包。  
  - tarball 安装、运行时加载、卸载均实际通过。  
  - LICENSE 与 README 授权范围一致（MIT 仅覆盖代码/AI SVG）。

### P1
- 官方台词、名称、设定引用仍为 UNKNOWN；需要所有者决定是否保留/收紧。
- 本地立绘配置只有固定 profile 目录 + `SUOMING_LOCAL_ART` 环境变量，没有 UI 任意路径选择；README 已说明，不是阻塞。
- 完整设置页在登录后的视觉核对仍未做（登录弹窗阻断）；主题运行时加载已验证。
- 候选第三方素材/官方内容授权未由所有者提供书面确认。

### P2
- 截图仅覆盖启动/登录界面，缺少主界面/输入区/设置页截图。
- 英文 README 未创建。
- GitHub 仓库名、Description、Topics、社交预览图待定。
- Git 作者为自动化身份，社区联系方式待配置。

## 7. 需要所有者决定的事项

1. 是否接受“公开包不含官方立绘、用户自备”的现状。
2. 官方台词/名称/设定的公开使用方式是否进一步收紧。
3. 是否补充 AI 生成 SVG 的更详细生成记录。
4. Git 作者身份、社区联系方式。
5. 是否发布截图/英文 README/社交预览素材。

## 8. 最终建议

**READY FOR OWNER RELEASE REVIEW**

判断依据：
- 两张官方立绘未跟踪、未进入 tarball；公开包纯净度验证通过。
- tarball 安装、插件识别、Web GUI 运行时加载、无立绘渲染、本地测试图加载、fallback、卸载恢复均实际通过。
- 7 组 AI 生成 SVG 保留，README 与审计文档已按所有者确认补充授权范围。
- MIT 仅覆盖项目代码与 AI 生成 SVG；官方立绘/台词/名称明确排除，未把非官方声明当授权。
- P0 为 0；剩余为所有者内容/发布决策事项。

> 本结论不代表项目已公开发布，也不代表官方素材已获授权。
