# AI 生成 SVG 素材说明

> 版本：v3.5.0  
> 记录依据：项目所有者确认——以下 7 组 SVG 由 AI 根据文字描述生成，可能经过 DSH 加工或修改。  
> 本文件不把它们声明为“原创手绘”，也不声明为“第三方开源素材”。  
> 公开包保留这些 SVG；MIT 覆盖其作为项目原创内容的授权，依据所有者的确认，不涉及第三方素材。

## 1. 授权与范围

- 项目许可证：**MIT License**，版权声明 `Copyright (c) 2026 zhouke`。
- MIT 覆盖范围：项目有权授权的代码与 AI 生成的原创 SVG。
- 以下内容不属于该授权范围：
  - 《鸣潮》官方立绘、官方台词、角色设定、名称及其他官方 IP；
  - 从游戏或官方渠道提取的两张立绘；
  - 用户自备的人物立绘、表情差分；
  - 其他第三方素材。
- 本说明不构成法律意见，也不把“非官方声明”当作授权证明。

## 2. 逐组说明

### 2.1 `icon.svg`

- 类型：独立 SVG 图标文件
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：DSH 插件图标；深色圆角底、旧金锁扣/伞盖图形
- 位置：仓库根 `icon.svg`；进入 public tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）
- 说明：不声明为手绘原创，不声明为第三方开源图标

### 2.2 `CHAIN_SVG`

- 类型：`client.js` 内联 SVG 常量
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：侧边栏边缘细锁链纹理
- 位置：`client.js:454-463`；运行时编码为 data URI，随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）
- 说明：不声明为第三方素材

### 2.3 `LOCK_GLYPH_SVG`

- 类型：`client.js` 内联 SVG 常量
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：侧栏/台词飘带末端金锁符号
- 位置：`client.js:469-478`；随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）

### 2.4 `XUANZHU_LOCK_SVG`

- 类型：`client.js` 内联 SVG 常量
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：右上角旋转玄朱锁；前景装饰
- 位置：`client.js:482-508`；随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）

### 2.5 `UMBRELLA_SVG`

- 类型：`client.js` 由 `buildUmbrellaSvg()` 生成的 SVG
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：机关伞前景/角色区域
- 位置：`client.js:515-575`，运行时赋值于 601 行；随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）

### 2.6 `CHAIN_DYNAMIC_SVG`

- 类型：`client.js` 由 `buildChainSvg()` 生成的 SVG
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：飘逸锁链 + 电弧前景
- 位置：`client.js:577-589`，运行时赋值于 602 行；随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）

### 2.7 `INK_WASH_SVG`

- 类型：`client.js` 由 `buildInkWashSvg()` 生成的 SVG
- 生成方式：AI 根据文字描述生成；后续可能经过 DSH 加工/修改
- 用途：背景墨晕
- 位置：`client.js:591-599`，运行时赋值于 603 行；随 `client.js` 进入 tarball
- 授权状态：**AI-GENERATED, OWNER-CONFIRMED**；MIT 覆盖（所有者确认范围内）

## 3. 未包含的内容

- 两张从《鸣潮》游戏/官方渠道提取的立绘：**不进入公开包**，不属于 MIT 授权范围。
- 官方台词、角色名、游戏名、设定：**不进入 MIT 授权范围**，状态仍为 UNKNOWN/THIRD-PARTY。
- 本地立绘、表情差分、profile 素材：不进入公开包。

## 4. 边界声明

- 未修改任何 SVG 内容。
- 未重新生成或替换 SVG。
- 未将 AI 生成素材声明为手绘原创。
- 未将 AI 生成素材声明为第三方开源素材。
- 未将官方立绘、官方 IP 纳入 MIT。
- 未把所有者确认扩大解释为对第三方内容的授权。
