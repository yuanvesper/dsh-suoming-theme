# 锁暝主题 · Suoming Theme

《鸣潮》锁暝的第三方 DSH Web GUI 皮肤。红黑金国风、机关伞 / 玄朱锁 / 锁链 / 墨雾装饰、人物立绘与主题设置持久化。

> **非官方同人项目。** 本项目是社区创作的第三方 DSH 主题，与《鸣潮》、库洛游戏及相关官方无隶属、授权或背书关系。游戏名称、角色名称及相关知识产权归其各自权利人所有。

- 当前版本：**v3.5.2**
- 包名：`dsh-suoming-theme`
- 仓库：<https://github.com/yuanvesper/dsh-suoming-theme>
- 形态：DSH bundle（Host + Client 插件）
- 公开包：**不包含任何图片、音频、视频或官方素材**

> 本 README 对应的环境验证范围见 [兼容性与验证](#兼容性与验证)。未实际验证的环境不会写成“已支持”。

## 功能

### 主题与界面
- 128 个主题 Token：暗红、近黑、旧金、冷钢蓝、骨白
- 侧边栏、输入框、消息气泡、代码块、菜单、滚动条、焦点环、选中色
- 旧金锁扣、金锁、玄朱锁、品牌锁芯 SVG
- 输入卡液态玻璃与冷脉冲装饰
- 当前稳定版使用静态渐变背景；为控制屏闪，全屏场景动画暂时关闭

### 人物与装饰
- 右侧人物立绘（本地素材，可开关）
- 左侧侧边栏人物
- 右上角旋转玄朱锁
- 图片层在文字层之下，正文、侧边栏、输入框始终可读可操作
- 主题台词气泡与铭文当前隐藏

### 设置与持久化
设置入口：**设置 → 通用 → 锁暝主题**

- 角色区域显示 / 隐藏
- 角色高度 30–80
- 水平偏移 -50–50
- 不透明度 20–100%
- 强度：极简 / 平衡 / 沉浸
- 配置写入 DSH profile：`$DSH_HOME/profiles/<profile>/suoming-theme/config.json`

### 素材策略
- 公开包不包含位图，也不包含两张官方立绘
- 人物立绘由用户在本地 profile assets 中自备
- 7 组 SVG 为 AI 根据文字描述生成；详见 [`docs/ai-generated-assets.md`](docs/ai-generated-assets.md)
- 不得使用未授权官方素材；素材使用需用户自行确认授权
- 缺失图片时主题仍可运行，人物层会回退/隐藏

## 文件结构

```text
suoming-theme/
  package.json
  cordis.patch.yml
  client.js
  index.js
  icon.svg
  locale/
    zh.json
    en.json
  README.md
  assets/
    README.md
  docs/
  .dev/
```

`package.json` 的 `dsh.bundle.patch` 指向 `./cordis.patch.yml`；`files` 包含 `index.js`、`client.js`、`cordis.patch.yml`、`locale/*.json`、`icon.svg`、`README.md`。`cordis.patch.yml` 使用包名 `dsh-suoming-theme` 引用插件。

## 兼容性与验证

本版本实际验证环境：

| 组件 | 版本 |
|---|---|
| DSH runtime CLI | `0.2.2-rc.1` |
| Node.js | `v24.21.0` |
| pnpm | `11.28.5` |

已验证：

- 本包语法检查通过
- `.dev/smoke.cjs` 通过（128 tokens）
- `.dev/scene-runtime.cjs` 22/22 通过
- `.dev/host-smoke.mjs` 16/16 通过
- 临时独立 DSH_HOME 中 `dsh plugin add` / `remove` 通过
- 安装后 `dsh --profile reltest --dump-config` 能看到 `theme-suoming` 行

**SM-REL-004 隔离运行时验证：**

- 本地 tarball `pnpm pack` 成功，tarball 文件清单包含必要 bundle 文件
- 临时独立 `DSH_HOME` 中 `dsh plugin add <tarball>` / `remove` 成功
- `--dump-config` 能看到 `theme-suoming` 条目
- 实际启动隔离 DSH Web GUI：
  - 页面带有 `data-dsh-suoming`
  - 场景层、右侧立绘层、旋转锁层存在
  - 无 page error / console error
  - 登录/开始使用弹窗阻止了设置页的视觉核对（设置入口检查为 PARTIAL）
- 截图已采集：`docs/screenshots/runtime-verification.png`（图片层已隐藏，不含本地立绘/个人内容）

**SM-REL-009 公开发布后实测（2026-11-11，v3.5.2）：**

- GitHub 远程安装：临时独立 `DSH_HOME` 中 `dsh plugin --profile ghtest add "git+https://github.com/yuanvesper/dsh-suoming-theme.git#37a7947…"` 成功（pnpm 4.7s，`+ dsh-suoming-theme 3.5.2`），`--dump-config` 输出 `- id: theme-suoming / name: dsh-suoming-theme`
- 安装后包内文件 11 个，**位图 0 个**
- `market/index.json` 经宿主校验器 `@deepseek-ai/dsh-plugin-market-index` 的 `parseMarketIndex` 校验通过；raw 地址匿名可读（HTTP 200），字节与仓库内文件一致

**未验证：**

- DSH 内置 Discover 的实际搜索与安装（索引格式已校验，但需要先在本机 Discover 添加索引源后人工确认列表项与安装结果）
- 默认分支安装形式（命令不带 commit）
- DSH 其他版本、其他操作系统、其他 Node/pnpm 版本
- 正式性能测试 / FPS / 内存测试
- 完整设置页在登录后的视觉状态

## 安装

### 前置条件
- 已安装 DeepSeek Harness，能运行 `dsh` CLI
- 已有一个 DSH profile（下文以 `desktop` 为例）
- Node.js 与 pnpm 可用（DSH CLI 会转发给 pnpm）

### 从 GitHub 安装

```bash
dsh plugin --profile desktop add "git+https://github.com/yuanvesper/dsh-suoming-theme.git"
```

固定到某个提交（推荐，避免后续改动导致行为漂移）：

```bash
dsh plugin --profile desktop add "git+https://github.com/yuanvesper/dsh-suoming-theme.git#<40 位 commit>"
```

> 实测（2026-11-11，v3.5.2）：固定 commit 形式已在临时独立 `DSH_HOME` 中安装成功，`--dump-config` 可见 `theme-suoming`。默认分支形式未实测。

### 从本地目录安装（已验证）

```bash
dsh plugin --profile desktop add "<absolute-path-to-suoming-theme>"
```

Windows PowerShell 示例：

```powershell
dsh plugin --profile desktop add "C:\path\to\suoming-theme"
```

安装后：
1. 确认 profile 的 `package.json` 中 `dsh-suoming-theme` 已加入；
2. 确认 `cordis.patch.yml` 中 `theme-suoming` 行存在且启用；
3. 刷新 DSH 页面；如 Client bundle 有缓存，完整重启 DSH；
4. 打开 **设置 → 通用 → 锁暝主题**。

### 从本地 tarball 安装（已验证）

```bash
pnpm pack
dsh plugin --profile desktop add "<path-to>/dsh-suoming-theme-3.5.2.tgz"
```

SM-REL-004 在临时独立 `DSH_HOME` 中验证了 tarball add / dump-config / remove。

> 安装命令依据：本机 `dsh plugin --help`、实际 tarball 安装与 `--dump-config`。  
> GitHub 远程安装已在 v3.5.2 实测通过（见上文「从 GitHub 安装」的实测说明）。

### 手动安装（备选）

将整个 `suoming-theme/` 目录放到本地插件位置，并在目标 profile 中添加依赖 / bundle 行；具体入口以 DSH 版本为准。该方式未在干净环境验证，优先使用上文的 `dsh plugin add`。

## 卸载

```bash
dsh plugin --profile desktop remove dsh-suoming-theme
```

若插件管理器仍显示启用行，检查并删除 profile `cordis.patch.yml` 中对应的 `theme-suoming` 行，然后刷新/重启 DSH。

## 在 DSH 插件市场找到它

有两个互相独立的渠道，互不替代：

**① 第三方插件目录**（[dshmarketplace.dev](https://dshmarketplace.dev)）

本仓库已添加 GitHub topic `dsh-plugin`（以及 `deepseek-harness`、`dsh-theme`、`wuthering-waves`、`ui-skin` 等），该目录会按 topic 自动同步收录，可直接按仓库名或 “锁暝 / suoming” 搜索。收录是否已经生效取决于该目录的同步与审核节奏，本 README 不保证它已出现在列表中。

**② DSH 内置 Discover（实验功能）**

DSH 出厂**不带任何索引源**，需要手动添加本仓库的索引文件：

```text
https://raw.githubusercontent.com/yuanvesper/dsh-suoming-theme/main/market/index.json
```

添加方式：**设置 → 插件市场 → Discover → Add index source**，粘贴上面的 URL 后保存。索引文件遵循 DSH plugin index format 1，内容见 [`market/index.json`](market/index.json)。

> 收录与安装状态以各渠道实际显示为准；本 README 不声称已通过审核收录。发布版本与变更说明见 [Releases](https://github.com/yuanvesper/dsh-suoming-theme/releases)。

## 配置

设置页可调整：

- 显示 / 隐藏角色区域
- 角色高度、水平偏移、不透明度
- 强度（极简 / 平衡 / 沉浸）
- 台词开关（当前主题文字隐藏，保留开关以兼容后续版本）

配置文件：

```text
$DSH_HOME/profiles/<profile>/suoming-theme/config.json
```

Host 接口：

- `GET /suoming-config`
- `PUT /suoming-config`
- `GET /suoming-local-art/<whitelisted-file>`（本地素材只读路由）

## 素材与本地立绘

公开包**不含位图，也不包含两张官方立绘**。人物立绘、表情差分等由用户放在本地 profile：

```text
$DSH_HOME/profiles/<profile>/suoming-theme/assets/
```

支持的本地文件名（按主题代码的白名单）：

```text
char.jpg / char.png / char.webp
side.jpg / side.png / side.webp
portrait.png
```

也可通过环境变量 `SUOMING_LOCAL_ART` 指定一个本地素材目录，Host 只读路由会从该目录查找白名单文件。

行为：
- 主题默认启用角色区域；可在 **设置 → 通用 → 锁暝主题** 中关闭。
- 立绘缺失、路径错误或文件损坏时，图片加载失败会自动移除对应图层，主题继续渲染背景、锁链、玄朱锁和设置界面。
- 不会因立绘缺失而白屏或报错。

用户自备素材的使用需自行确认授权。**不要使用未经授权的官方原画、游戏提取素材或音频。** 本项目不提供、不推荐此类素材。

7 组 AI 生成 SVG 的说明见 [`docs/ai-generated-assets.md`](docs/ai-generated-assets.md)。

## 故障排查

### 主题不生效
1. 确认 `dsh plugin --profile desktop add` 已执行；
2. 检查 profile `package.json` 是否包含本包；
3. 检查 `cordis.patch.yml` 是否有启用的 `theme-suoming` 行；
4. 刷新页面；仍不生效则完整重启 DSH；
5. 打开浏览器控制台 / DSH 日志查看 Client 加载错误。

### 只有背景色变化，没有场景/人物
- 当前稳定版关闭了全屏场景动画；
- 人物立绘需要本地 assets，缺失时显示回退或隐藏；
- 检查 `/suoming-config` 的 `assets.portrait` 是否为 true。

### 安装后没有挂载
- 检查 `package.json` 的 `dsh.bundle.patch` 是否指向存在的 `cordis.patch.yml`；
- 检查 `files` 是否包含 `cordis.patch.yml`；
- 检查 profile 是否把本包加入 `dsh.profile.bundles`。

### 插件管理器重新安装后失效
插件管理器可能重写 profile 的 bundle/patch。重新确认：
- `dsh.profile.bundles` 包含 `dsh-suoming-theme`
- `cordis.patch.yml` 只有一条启用的 `theme-suoming` 行

## 截图

隔离运行时验证截图：

- `docs/screenshots/runtime-verification.png`
- 采集环境：临时独立 `DSH_HOME` + 无头浏览器
- 安全处理：截图前隐藏所有图片，不含本地立绘、个人路径、会话内容

仍需项目所有者补充/确认：

| 截图 | 内容 | 状态 |
|---|---|---|
| 01-overview | 主界面 + 侧边栏 | 待补 |
| 02-composer | 输入区 / 聚焦态 | 待补 |
| 03-sidebar | 侧边栏人物/装饰 | 需素材授权后补 |
| 04-settings | 设置 → 通用 | 需登录后补 |
| 05-motion | 旋转锁/动效 | 可选 GIF |

## 版本记录

见 [`CHANGELOG.md`](CHANGELOG.md)。

## 许可与授权范围

本项目的**代码和 AI 生成的原创 SVG**采用 **MIT License**，以项目所有者有权授权的范围为限：

- 许可证正文：[`LICENSE`](LICENSE)
- 版权声明：`Copyright (c) 2026 zhouke`
- AI 生成 SVG 说明：[`docs/ai-generated-assets.md`](docs/ai-generated-assets.md)

> **MIT 的覆盖范围仅限于项目所有者有权授权的代码和 AI 生成的原创 SVG。**

以下内容**不在本项目 MIT 许可证的授权范围内**，也不因项目采用 MIT 而自动获得授权：

1. 《鸣潮》官方台词、角色设定、名称及其他官方 IP 内容；
2. 两张从《鸣潮》游戏/官方渠道提取的官方立绘；
3. 用户自备的人物立绘、表情差分及其他未经确认的美术素材；
4. 任何其他第三方内容。

非官方声明只说明本项目与官方无隶属关系，**不等于获得权利人授权**；MIT 许可证也不会改变官方素材、角色名称、商标或其他第三方内容的授权状态。

公开包不包含官方立绘、游戏提取素材或未授权音频。用户自备素材的使用，需由用户自行确认授权。

本说明为授权范围澄清，不构成法律意见，也不扩大 MIT 正文的条款。

## 非官方声明

1. 本项目是社区创作的第三方 DSH 主题。
2. 本项目与《鸣潮》、库洛游戏及相关官方无隶属、授权或背书关系。
3. 游戏名称、角色名称及相关知识产权归其各自权利人所有。
4. 本声明不能替代素材授权，也不能自动消除版权风险。
5. 公开包不包含官方原画、游戏提取素材或未授权音频；用户自备素材的使用需自行确认授权。

## 贡献与安全

- 贡献流程：[`CONTRIBUTING.md`](CONTRIBUTING.md)
- 安全问题报告：[`SECURITY.md`](SECURITY.md)
- AI 生成 SVG 说明：[`docs/ai-generated-assets.md`](docs/ai-generated-assets.md)
- 第三方素材/引用说明：[`docs/third-party-assets-audit.md`](docs/third-party-assets-audit.md)
- 开源准备度审计：[`docs/open-source-readiness-audit.md`](docs/open-source-readiness-audit.md)

## 免责声明与权利声明

### 项目性质

本项目是第三方社区项目，与库洛游戏及《鸣潮》官方无关联，也未获得官方授权或背书。本项目仅为个人、非商业性质的主题插件创作。

本项目中的原创代码、原创设计及其他内容，分别按照各自的适用许可进行管理：代码与 AI 生成的原创 SVG 采用 MIT License（见上文「许可与授权范围」与 [`LICENSE`](LICENSE)）；角色名称、设定用语等其他内容仍归各自权利人所有，不在本项目可授权范围内。

### 知识产权归属

游戏角色、名称、商标、美术作品及其他第三方知识产权，仍归各自权利人所有。本项目不对上述内容主张任何权利，也不会因为本项目采用 MIT 许可证而改变其授权状态。

### 知识产权与删除请求

本项目为非官方第三方社区项目。如果您是相关权利人，认为本项目中的某项内容侵犯了您的合法权益，请通过本仓库的 Issues 或仓库公开的联系渠道告知我们，并尽可能提供相关内容的位置及权利证明。

我们会在收到合理的权利通知后及时核查；如确认存在问题，将及时修改、替换、删除相关内容，并在必要时暂停相关发布。

本声明不构成任何第三方知识产权的授权，也不改变相关权利人的合法权利。
