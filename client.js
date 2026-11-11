/*
 * 锁暝主题 · Client 半部分
 * ------------------------------------------------------------------
 * 鸣潮《锁暝》主题：深红为强调、近黑为底、旧铜/暗金为线与锁纹。
 *
 * 组成：
 *   1) 通过 ctx.theme.register() 注册可选的「锁暝」主题（colorScheme = dark），
 *      全部颜色令牌以 CSS 变量的形式写进 ThemeDefinition.tokens；
 *   2) 在 设置 → 通用（外观行旁）的 settings.general.item 槽位注册一行
 *      「锁暝主题」，提供启用/恢复操作 —— DSH 的原生外观行只列出
 *      light/dark/system，第三方主题必须自带选择入口；
 *   3) 代码生成的皮肤层：中心列墨晕骨架（自下而上红墨，静态底，动效待第五批）、
 *      抽象锁芯占位、侧边栏锁链纹与底部锁扣纹章、顶部/底部暗金细线，
 *      全部为 pointer-events:none 的绘制层，不参与布局、不遮挡控件；
 *   4) 新会话欢迎区的台词行：注册到 conversation.input.dock，仅在
 *      session.blank 且主题启用时渲染。
 *
 * 自 v2.1.0（第一批）起不再随包分发任何位图；装饰图形全部由 CSS/内联 SVG
 * 代码生成。切换主题时令牌由 ui-layout 即时应用到 document.body，无需刷新。
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-theme-suoming',
  factory: (require) => {
    const React = require('react');
    const h = React.createElement;

    const PKG = '@local/dsh-theme-suoming';
    const THEME_ID = 'suoming';
    const NS = 'settings.suoming';
    const PREF_COOKIE = 'dsh_suoming_theme';
    const PREF_STORAGE_KEY = 'dsh.theme.suoming.enabled';
    const PREF_STORAGE_DISABLED_KEY = 'dsh.theme.suoming.disabled';
    const BOOT_WINDOW_MS = 15000;
    const THEME_ATTR = 'data-dsh-suoming';

    /* ---------------------------------------------------------------- *
     * 第二批基础色板（来自官方校对清单）与派生色工具
     * - 旧金只保留 #9f8d7d–#cebfb0 家族（暗部 #493b34）；
     * - UI 强调红 #80181d–#9b151c，深绛 #52171a 仅用于深色填充/选中底；
     * - 冷钢蓝 #536071/#848b95 与骨白 #e9dfd5 作为结构色/次级文字；
     * - 派生色优先 color-mix()，运行时检测不支持则回退到预计算 rgba。
     * ---------------------------------------------------------------- */
    const P = Object.freeze({
      bgBase: '#0d0c0e',
      bg1: '#121315',
      bg2: '#17181b',
      bg3: '#1d1f23',
      overlay: '#1a1b1f',
      steel: '#536071',
      steelLight: '#848b95',
      mist: '#aeb8c4',
      bone: '#e9dfd5',
      boneDim: '#d8cec4',
      ink: '#80181d',
      inkBright: '#9b151c',
      inkDeep: '#52171a',
      inkArc: '#953333',
      inkArcSoft: '#b85e5d',
      gold: '#b6a289',
      goldMid: '#9f8d7d',
      goldHi: '#cebfb0',
      goldDark: '#493b34',
      olive: '#5a6b52',
      oliveLight: '#74836a',
    });
    /* ===== 本轮（背景/立绘/状态/台词）配置：单一来源，范围校验，非法值回退默认 ===== */
    const SCENE_DEFAULTS = Object.freeze({
      intensity: 'balanced',
      portraitHeight: 55,
      portraitOffsetX: 0,
      portraitOpacity: 0.82,
      portraitEnabled: true,
      dialogueEnabled: true,
    });
    const SCENE_RANGES = Object.freeze({
      portraitHeight: [30, 80],
      portraitOffsetX: [-50, 50],
      portraitOpacity: [0.2, 1],
    });
    const SCENE_STORAGE_KEY = 'dsh_suoming_scene';
    const SCENE_COOKIE = 'dsh_suoming_scene';

    function clampSceneNumber(value, [min, max], fallback) {
      const number = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(max, Math.max(min, Math.round(number * 100) / 100));
    }

    function normalizeSceneConfig(input) {
      const source = input && typeof input === 'object' ? input : {};
      return {
        intensity: ['minimal', 'balanced', 'immersive'].includes(source.intensity)
          ? source.intensity
          : SCENE_DEFAULTS.intensity,
        portraitHeight: clampSceneNumber(
          source.portraitHeight,
          SCENE_RANGES.portraitHeight,
          SCENE_DEFAULTS.portraitHeight,
        ),
        portraitOffsetX: clampSceneNumber(
          source.portraitOffsetX,
          SCENE_RANGES.portraitOffsetX,
          SCENE_DEFAULTS.portraitOffsetX,
        ),
        portraitOpacity: clampSceneNumber(
          source.portraitOpacity,
          SCENE_RANGES.portraitOpacity,
          SCENE_DEFAULTS.portraitOpacity,
        ),
        portraitEnabled: source.portraitEnabled !== false,
        dialogueEnabled: source.dialogueEnabled !== false,
      };
    }

    /* 台词池：冷淡、克制、古风；官方短句只占少数，并标注来源。 */
    const DIALOGUE_POOL = Object.freeze({
      /* 官方台词语音，摘自灰机 wiki《锁暝/档案》台词语音表；短句仅取原文片段。 */
      idle: [
        '凄雨瘴雷散去后，只留下……锁中执念。',
        '午后凉风拂过，雨云渐聚。',
        '百年来，谛天鉴代心月狐传话于历任令尹。',
        '嗯，开始吧。',
        '细雨敲在屋檐上。',
      ],
      hover: ['嗯？', '有事？', '你说。'],
      click: ['嗯？你甚至不愿叫我一声契主？', '你看。'],
      success: ['心驭万全。', '嗯，开始吧。'],
      error: ['抱歉，当我没开口吧。', '……御者。'],
      official: [
        '出战吗？好，心驭万全。',
        '凄雨瘴雷散去后，只留下……锁中执念。',
        '梦州谛天鉴，将永远在你身后。',
      ],
    });

    function pickDialogue(category, random = Math.random) {
      const pool = category === 'idle'
        ? DIALOGUE_POOL.idle.concat(random() < 0.18 ? DIALOGUE_POOL.official : [])
        : DIALOGUE_POOL[category] || DIALOGUE_POOL.idle;
      return pool[Math.floor(random() * pool.length)] || DIALOGUE_POOL.idle[0];
    }

    /* 兼容层：宿主内部实现属性 + 标准 ARIA / 结构 fallback；顺序固定。 */
    const AI_RUNNING_SELECTORS = Object.freeze([
      '[data-chat-running]',
      '[data-slot="main"] [role="status"][aria-live="polite"]',
      '[data-slot="conversation.chat.flow"] [data-streaming]',
      '[data-slot="main"] [aria-busy="true"]',
      '[data-composer-card] button svg rect[width="10"][height="10"]',
    ]);
    const AI_STREAMING_SELECTORS = Object.freeze([
      '[data-slot="conversation.chat.flow"] [data-streaming]',
      '[data-chat-streaming]',
    ]);
    const AI_ERROR_SELECTORS = Object.freeze([
      '[data-slot="main"] [data-error]',
      '[data-slot="main"] [data-state="error"]',
      '[data-slot="main"] [role="alert"]',
    ]);

    const SCENE_PORTRAIT_SELECTOR = '.dsh-suoming-character';
    const SCENE_INTENSITY_ATTR = 'data-dsh-suoming-intensity';
    const SELECTOR_INTERACTIVE =
      'a,button,input,textarea,select,summary,[role="button"],[role="tab"],[role="menuitem"],[data-composer-card],[data-chat-flow-kind],[contenteditable="true"]';

    const CAN_COLOR_MIX = (() => {
      try {
        return (
          typeof globalThis.CSS !== 'undefined' &&
          typeof globalThis.CSS.supports === 'function' &&
          globalThis.CSS.supports('color', 'color-mix(in srgb, #000000, #ffffff)')
        );
      } catch {
        return false;
      }
    })();
    const rgbOf = (hex) => {
      const raw = hex.replace('#', '');
      const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
      return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
    };
    const rgbaOf = (hex, alpha) => {
      const [r, g, b] = rgbOf(hex);
      return `rgba(${r},${g},${b},${alpha})`;
    };
    const mixHex = (aHex, bHex, aPercent) => {
      const a = rgbOf(aHex);
      const b = rgbOf(bHex);
      const w = aPercent / 100;
      return (
        '#' +
        [0, 1, 2]
          .map((i) => Math.round(a[i] * w + b[i] * (1 - w)).toString(16).padStart(2, '0'))
          .join('')
      );
    };
    /** 不透明度派生：color-mix() 优先，回退 rgba()。 */
    const tint = (hex, percent) =>
      CAN_COLOR_MIX ? `color-mix(in srgb, ${hex} ${percent}%, transparent)` : rgbaOf(hex, percent / 100);
    /** 混合派生：color-mix() 优先，回退预计算 hex。 */
    const blend = (aHex, aPercent, bHex) =>
      CAN_COLOR_MIX ? `color-mix(in srgb, ${aHex} ${aPercent}%, ${bHex})` : mixHex(aHex, bHex, aPercent);
    /** 从基础令牌派生的透明色（引用 var()，保持与令牌同步）。 */
    const tintVar = (varName, hexFallback, percent) =>
      CAN_COLOR_MIX
        ? `color-mix(in srgb, var(${varName}) ${percent}%, transparent)`
        : rgbaOf(hexFallback, percent / 100);
    /** 与基础背景令牌混合的实色（引用 var(--dsw-alias-bg-base)）。 */
    const blendBase = (accentHex, accentPercent) =>
      CAN_COLOR_MIX
        ? `color-mix(in srgb, ${accentHex} ${accentPercent}%, var(--dsw-alias-bg-base))`
        : mixHex(accentHex, P.bgBase, accentPercent);

    /** 暗金细线，用于顶/底收边与分隔线。 */
    const GOLD_LINE =
      'linear-gradient(90deg, ' +
      tint(P.gold, 0) + ' 0%, ' +
      tint(P.gold, 55) + ' 16%, ' +
      tint(P.goldHi, 85) + ' 50%, ' +
      tint(P.gold, 55) + ' 84%, ' +
      tint(P.gold, 0) + ' 100%)';

    /* ---------------------------------------------------------------- *
     * 颜色令牌
     * 覆盖 ui-theme 的公开令牌层（--dsw-alias-* / --dsw-specific-* /
     * --dsw-menu-surface-fill / --shiki-token-*）。未覆盖的令牌保持
     * DSH 深色基线。所有值均为 CSS 颜色或颜色混合表达式。
     * ---------------------------------------------------------------- */
    const TOKENS = Object.freeze({
      /* 全局背景与面板层级：中性微冷近黑 */
      '--dsw-alias-bg-base': P.bgBase,
      '--dsw-alias-bg-document-preview': P.bg1,
      '--dsw-alias-bg-document-selection': tintVar('--dsw-alias-state-business-primary', P.inkBright, 32),
      '--dsw-alias-bg-layer-1': P.bg1,
      '--dsw-alias-bg-layer-2': P.bg2,
      '--dsw-alias-bg-layer-3': P.bg3,
      '--dsw-alias-bg-mask-1': 'rgba(0,0,0,0.55)',
      '--dsw-alias-bg-mask-2': 'rgba(0,0,0,0.28)',
      '--dsw-alias-bg-mask-3': 'rgba(0,0,0,0.62)',
      '--dsw-alias-bg-mask-drop': rgbaOf(P.bg2, 0.72),
      '--dsw-alias-bg-mask-photo': 'rgba(0,0,0,0.88)',
      '--dsw-alias-bg-module-platform': blendBase(P.inkDeep, 45),
      '--dsw-alias-bg-multi-select': P.bg3,
      '--dsw-alias-bg-overlay': P.bg2,
      '--dsw-alias-bg-skeleton': tint(P.goldMid, 8),

      /* 边框：冷钢灰为结构线，旧金只做 l4 强调边 */
      '--dsw-alias-border-inverted': tint(P.bone, 10),
      '--dsw-alias-border-inverted2': tint(P.bone, 16),
      '--dsw-alias-border-l1': tint(P.steel, 22),
      '--dsw-alias-border-l2': tint(P.steel, 36),
      '--dsw-alias-border-l2-darkmode-thin': tint(P.steel, 26),
      '--dsw-alias-border-l3': tint(P.steel, 48),
      '--dsw-alias-border-l4': tint(P.goldMid, 40),

      /* 品牌与按钮：骨白品牌、旧金主按钮、深绛信息按钮 */
      '--dsw-alias-brand-primary': P.bone,
      '--dsw-alias-brand-primary-invert': P.bone,
      '--dsw-alias-brand-primary-new-colorprimary-new-color': P.inkBright,
      '--dsw-alias-brand-text': P.bone,
      '--dsw-alias-button-contrast-fill': P.bone,
      '--dsw-alias-button-elevated-fill': P.bg3,
      '--dsw-alias-button-floating-fill': P.bg3,
      '--dsw-alias-button-floating-hover': blend(P.bg3, 78, P.steel),
      '--dsw-alias-button-ghost-active-border': P.goldMid,
      '--dsw-alias-button-ghost-active-fill': P.bg3,
      '--dsw-alias-button-ghost-active-hover': blend(P.bg3, 80, P.steel),
      '--dsw-alias-button-info-fill': P.ink,
      '--dsw-alias-button-info-hover': P.inkBright,
      '--dsw-alias-button-primary-dimmed': P.goldDark,
      '--dsw-alias-button-primary-fill': P.gold,
      '--dsw-alias-button-primary-hover': P.goldHi,
      '--dsw-alias-button-tool-bar-fill': tint(P.steel, 28),
      '--dsw-alias-button-tool-bar-fill-invisible': rgbaOf(P.bgBase, 0.4),
      '--dsw-alias-button-tool-bar-hover': tint(P.steel, 40),

      /* 代码差异：灰橄榄 / 朱红暗调 */
      '--dsw-alias-code-diff-added': tint(P.olive, 16),
      '--dsw-alias-code-diff-deleted': tint(P.inkArc, 18),
      '--dsw-alias-file-diff-added-bg': '#1a211b',
      '--dsw-alias-file-diff-added-gutter': '#141a15',
      '--dsw-alias-file-diff-added-marker': P.olive,
      '--dsw-alias-file-diff-deleted-bg': '#241617',
      '--dsw-alias-file-diff-deleted-gutter': '#1a1011',
      '--dsw-alias-file-diff-deleted-marker': P.inkArc,

      /* 交互 / 选中 / 悬停：中性骨白悬停，红色只做选中强调 */
      '--dsw-alias-interactive-bg-active': tintVar('--dsw-alias-label-primary', P.bone, 11),
      '--dsw-alias-interactive-bg-hover': tintVar('--dsw-alias-label-primary', P.bone, 7),
      '--dsw-alias-interactive-bg-hover-accent': tintVar('--dsw-alias-state-business-primary', P.inkBright, 18),
      '--dsw-alias-interactive-bg-hover-danger': tint(P.inkArc, 20),
      '--dsw-alias-interactive-bg-hover-solid': P.bg3,

      /* 文字层级：骨白正文 + 冷雾辅助 + 冷钢弱化 */
      '--dsw-alias-label-caption': blend(P.steelLight, 70, P.bg2),
      '--dsw-alias-label-deep-diving': P.goldMid,
      '--dsw-alias-label-deep-diving-shimmer': P.gold,
      '--dsw-alias-label-dimmed': blend(P.steel, 55, P.bgBase),
      '--dsw-alias-label-document-preview': P.mist,
      '--dsw-alias-label-primary': P.bone,
      '--dsw-alias-label-primary-bluish': P.bone,
      '--dsw-alias-label-primary-dimmed': P.boneDim,
      '--dsw-alias-label-primary-foreground': P.bgBase,
      '--dsw-alias-label-primary-inverted': P.bg3,
      '--dsw-alias-label-secondary': P.mist,
      '--dsw-alias-label-shimmer': tint(P.bone, 30),
      '--dsw-alias-label-tertiary': P.steelLight,

      /* 链接与业务强调色：旧金链接 + UI 深红 #80181d–#9b151c */
      '--dsw-alias-link': P.gold,
      '--dsw-alias-state-business-primary': P.inkBright,
      '--dsw-alias-state-business-tertiary': blendBase(P.inkDeep, 55),
      '--dsw-alias-state-error-primary': P.inkArc,
      '--dsw-alias-state-error-secondary': blend(P.inkArc, 80, P.inkDeep),
      '--dsw-alias-state-idle-primary': blend(P.steel, 70, P.bg2),
      '--dsw-alias-state-success-primary': P.olive,
      '--dsw-alias-state-success-secondary': P.oliveLight,
      '--dsw-alias-state-success-tertiary': blend(P.olive, 45, P.bgBase),
      '--dsw-alias-state-warn-primary': P.gold,
      '--dsw-alias-state-warn-label': P.goldHi,
      '--dsw-alias-state-warn-secondary': P.goldMid,
      '--dsw-alias-state-warn-tertiary': blend(P.goldDark, 45, P.bgBase),

      /* Markdown 与代码块 */
      '--dsw-alias-markdown-citation': P.overlay,
      '--dsw-alias-markdown-code-block': P.bg1,
      '--dsw-alias-markdown-code-block-banner': P.bg2,
      '--dsw-alias-markdown-code-segment-selected': P.bg3,
      '--dsw-alias-markdown-code-segment-unselected': P.bg2,
      '--dsw-alias-markdown-inline-code': P.bg3,
      '--dsw-alias-markdown-placeholder': P.bg2,
      '--dsw-alias-markdown-tag': P.overlay,

      /* 菜单 / 浮层 / 滚动条 / 其他 */
      '--dsw-alias-menu-group-header-fill': rgbaOf(P.bg2, 0.94),
      '--dsw-alias-menu-icon': P.mist,
      '--dsw-alias-scrollbar-bg-l1': blend(P.steel, 60, P.bg3),
      '--dsw-alias-scrollbar-bg-l2': blend(P.steel, 70, P.bg3),
      '--dsw-alias-scrollbar-hover-l1': blend(P.steel, 80, P.bg3),
      '--dsw-alias-scrollbar-hover-l2': blend(P.steel, 90, P.bg3),
      '--dsw-alias-switch-thumb': P.gold,
      '--dsw-alias-toast-bg': P.bg2,
      '--dsw-alias-toast-label': P.bone,
      '--dsw-alias-tooltip-bg': P.bg2,
      '--dsw-alias-tooltip-key-bg': tint(P.bone, 14),
      '--dsw-alias-turn-trigger-bg': P.bg2,
      '--dsw-alias-turn-trigger-bg-hover': tint(P.goldMid, 10),
      '--dsw-menu-surface-fill': rgbaOf(P.bg2, 0.9),

      /* 输入框 / 气泡 / 侧边栏（specific 层） */
      '--dsw-specific-bubble': blend(P.bg3, 82, P.steel),
      '--dsw-specific-bubble-highlight': blend(P.bg3, 60, P.steel),
      '--dsw-specific-input-major': P.bg2,
      '--dsw-specific-login-input': P.bg1,
      '--dsw-specific-menu': rgbaOf(P.bg2, 0.9),
      '--dsw-specific-selector': P.bg3,
      '--dsw-specific-sidebar-fill': blend(P.bgBase, 75, P.bg1),
      '--dsw-specific-sidebar-nav-item-active': blendBase(P.inkDeep, 42),
      '--dsw-specific-sidebar-nav-item-active-accent': blendBase(P.inkDeep, 30),
      '--dsw-specific-sidebar-nav-item-hover': blend(P.bgBase, 60, P.bg2),
      '--dsw-specific-tip': P.bg2,

      /* 代码语法高亮（shiki 固定色，深色方案）：旧金/朱红/灰橄榄/冷钢 */
      '--shiki-token-constant': P.gold,
      '--shiki-token-string': P.goldMid,
      '--shiki-token-comment': blend(P.steelLight, 55, P.bg2),
      '--shiki-token-keyword': '#b05252',
      '--shiki-token-parameter': P.goldMid,
      '--shiki-token-function': P.goldHi,
      '--shiki-token-string-expression': P.oliveLight,
      '--shiki-token-punctuation': P.steelLight,
      '--shiki-token-link': P.gold,

      /* 补显式覆盖的两个公开令牌（第二批 P1-9） */
      '--dsw-alias-settings-card-fill': P.bg2,
      '--dsw-alias-settings-card-stroke': tint(P.goldMid, 40),

      /* accent-soft 语义令牌：选区/柔和强调 */
      '--dsh-suoming-accent': P.inkBright,
      '--dsh-suoming-accent-soft': tintVar('--dsw-alias-state-business-primary', P.inkBright, 32),

      /* 构建标记与 color-mix 诊断（仅名称可被运行时检查） */
      '--dsh-suoming-build': '3.5.1',
      ...(CAN_COLOR_MIX
        ? { '--dsh-suoming-mode-color-mix': '1' }
        : { '--dsh-suoming-mode-rgba': '1' }),
    });

    const THEME_DEF = Object.freeze({
      id: THEME_ID,
      colorScheme: 'dark',
      tokens: TOKENS,
    });

    /* ---------------------------------------------------------------- *
     * 文案
     * ---------------------------------------------------------------- */
    const zh = {
      'row.title': '锁暝主题',
      'row.desc': '完整皮肤：四层场景（墨晕 / 远景 / 机关伞角色区域 / 机关锁）、角色状态与台词气泡；保留宿主布局与控件。',
      'row.note': 'v3.1.0 · 机关伞 / 锁链 / 导电 / 墨雾动态；角色区域可关闭，不覆盖聊天正文。',
      'cube.label': '锁暝',
      'cube.on': '已启用',
      'cube.off': '启用',
      'cube.hint': '启用或停用锁暝主题',
      'cube.reset': '恢复默认外观',
      'quote.text': '「玄朱锁里有九道频率，和一百年的雨。你来得正好。」',
      'quote.by': '—— 锁暝',
      'quote.aria': '锁暝台词',
      'scene.section': '场景与角色区域',
      'scene.height': '角色区域高度',
      'scene.offset': '水平偏移',
      'scene.opacity': '不透明度',
      'scene.intensity': '呈现强度',
      'scene.visible': '显示角色主题区域（机关伞）',
      'scene.minimal': '极简',
      'scene.balanced': '平衡',
      'scene.immersive': '沉浸',
      'scene.note': '角色区域已改为 CSS/SVG 机关伞，不再使用整张静态立绘；关闭后只保留墨晕、远景与机关锁。',
    };
    const en = {
      'row.title': 'Suoming theme',
      'row.desc': 'Full skin: four-layer scene (ink / distance / umbrella character area / lock ornaments), character states and dialogue; host layout and controls stay untouched.',
      'row.note': 'v3.1.0 · Umbrella, chains, electro and ink motion; the character area can be hidden and never covers chat text.',
      'cube.label': 'Suoming',
      'cube.on': 'Enabled',
      'cube.off': 'Enable',
      'cube.hint': 'Enable or disable the Suoming theme',
      'cube.reset': 'Use default appearance',
      'quote.text': '“Nine frequencies lie in the Xuanzhu lock, and a hundred years of rain. You came at the right time.”',
      'quote.by': '— Suoming',
      'quote.aria': 'Suoming quote',
      'scene.section': 'Scene & character area',
      'scene.height': 'Character area height',
      'scene.offset': 'Horizontal offset',
      'scene.opacity': 'Opacity',
      'scene.intensity': 'Intensity',
      'scene.visible': 'Show character area (umbrella)',
      'scene.minimal': 'Minimal',
      'scene.balanced': 'Balanced',
      'scene.immersive': 'Immersive',
      'scene.note': 'The character area is now a CSS/SVG umbrella, not a full static illustration. Turning it off keeps only the ink, distance and lock ornaments.',
    };

    /* ---------------------------------------------------------------- *
     * 装饰样式
     * - 只在 <html data-dsh-suoming> 存在时生效（主题启用时才挂载）；
     * - 侧边栏用运行时稳定的 slot 锚点定位（[data-slot="sidebar"]），
     *   不依赖组件哈希类名；
     * - 全部为 pointer-events:none 的绘制层，不参与布局。
     * ---------------------------------------------------------------- */
    /* 第三批（P1-4）：锁链 tile 从“圆角胶囊”改为“方梁 + 圆体 + 竖钥匙孔”的
     * 极细锁扣折线；旧金 #b6a289，低透明度，尺寸用 em 以随字号缩放。 */
    const CHAIN_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 12 24">' +
      '<g fill="none" stroke="' + P.gold + '" stroke-width="0.9" stroke-opacity="0.24">' +
      '<path d="M6 1.4l1.7 2.1L6 5.6 4.3 3.5Z" stroke-opacity="0.18"/>' +
      '<path d="M3.3 12V7.4h5.4V12"/>' +
      '<circle cx="6" cy="14.5" r="3.3"/>' +
      '<path d="M6 13.6v3"/>' +
      '<circle cx="6" cy="13.1" r="0.6" fill="' + P.gold + '" fill-opacity="0.35" stroke="none"/>' +
      '</g></svg>';
    const CHAIN_URI = 'url("data:image/svg+xml,' + encodeURIComponent(CHAIN_SVG) + '")';

    /** 把内联 SVG 字符串编码成 CSS 背景 URL。 */
    const svgUri = (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';

    /* 第三批（P1-5）：独立金锁符号——方梁 + 圆体 + 竖钥匙孔，用于侧栏与台词飘带末端。 */
    const LOCK_GLYPH_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="40" viewBox="0 0 24 40">' +
      '<g fill="none" stroke="' + P.gold + '" stroke-width="1" stroke-opacity="0.55">' +
      '<path d="M6 21V9.5h12V21"/>' +
      '<circle cx="12" cy="25" r="7"/>' +
      '<path d="M12 22.4v5.6"/>' +
      '<circle cx="12" cy="21" r="1" fill="' + P.gold + '" fill-opacity="0.6" stroke="none"/>' +
      '<path d="M12 33.5v4.5" stroke-opacity="0.28"/>' +
      '</g></svg>';
    const LOCK_GLYPH_URI = svgUri(LOCK_GLYPH_SVG);

    /* 第三批（P1-5）：玄朱锁简化抽象版——黑红金三色多面互锁体，
     * 保留棱线/折面感；不追求精确的 12 玄黑柱 + 8 朱红盖结构。 */
    const XUANZHU_LOCK_SVG =
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">' +
      '<g stroke="' + P.gold + '" stroke-opacity="0.5" stroke-width="1.1">' +
      '<g transform="rotate(0 120 120)">' +
      '<rect x="58" y="104" width="124" height="32" fill="' + P.bg2 + '"/>' +
      '<rect x="42" y="97" width="24" height="46" fill="' + P.ink + '"/>' +
      '<rect x="174" y="97" width="24" height="46" fill="' + P.ink + '"/>' +
      '<path d="M58 104h124M58 136h124" stroke-opacity="0.26"/>' +
      '</g>' +
      '<g transform="rotate(60 120 120)">' +
      '<rect x="58" y="104" width="124" height="32" fill="' + P.bg2 + '"/>' +
      '<rect x="42" y="97" width="24" height="46" fill="' + P.inkBright + '"/>' +
      '<rect x="174" y="97" width="24" height="46" fill="' + P.inkBright + '"/>' +
      '<path d="M58 104h124M58 136h124" stroke-opacity="0.26"/>' +
      '</g>' +
      '<g transform="rotate(120 120 120)">' +
      '<rect x="58" y="104" width="124" height="32" fill="' + P.bg2 + '"/>' +
      '<rect x="42" y="97" width="24" height="46" fill="' + P.inkDeep + '"/>' +
      '<rect x="174" y="97" width="24" height="46" fill="' + P.inkDeep + '"/>' +
      '<path d="M58 104h124M58 136h124" stroke-opacity="0.26"/>' +
      '</g>' +
      '</g>' +
      '<polygon points="120,94 146,107 146,133 120,146 94,133 94,107" fill="' + P.bgBase + '" stroke="' + P.gold + '" stroke-opacity="0.65"/>' +
      '<polygon points="120,106 133,120 120,134 107,120" fill="' + P.ink + '" stroke="' + P.gold + '" stroke-opacity="0.35"/>' +
      '<circle cx="120" cy="120" r="4" fill="' + P.gold + '" fill-opacity="0.5"/>' +
      '</svg>';
    const XUANZHU_LOCK_URI = svgUri(XUANZHU_LOCK_SVG);

    /* ===== v3.1.0：机关伞 / 锁链 / 导电 / 墨迹，均为可独立运动的内联 SVG ===== */
    function polar(cx, cy, radius, angle) {
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    }

    function buildUmbrellaSvg() {
      const cx = 160;
      const cy = 120;
      const radius = 132;
      const sectors = 8;
      const start = (-160 * Math.PI) / 180;
      const end = (-20 * Math.PI) / 180;
      const step = (end - start) / sectors;
      let sectorMarkup = '';
      let ribMarkup = '';
      let hingeMarkup = '';
      let dustMarkup = '';
      for (let index = 0; index < sectors; index += 1) {
        const a0 = start + step * index;
        const a1 = start + step * (index + 1);
        const mid = (a0 + a1) / 2;
        const closed = -90 - (mid * 180) / Math.PI;
        const [x0, y0] = polar(cx, cy, radius, a0);
        const [x1, y1] = polar(cx, cy, radius, a1);
        const path =
          'M' + cx + ' ' + cy +
          'L' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
          'A' + radius + ' ' + radius + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
          'Z';
        sectorMarkup +=
          '<path class="dsh-umbrella-sector" style="--closed:' + closed.toFixed(2) + 'deg;--delay:' + (index * 0.045).toFixed(3) + 's" d="' + path + '" fill="url(#dsh-umbrella-lacquer)" stroke="#b6a289" stroke-opacity=".55" stroke-width=".8"/>';
        const [bx, by] = polar(cx, cy, radius, a0);
        ribMarkup +=
          '<g class="dsh-umbrella-rib" style="--closed:' + closed.toFixed(2) + 'deg;--delay:' + (index * 0.045).toFixed(3) + 's">' +
          '<path d="M' + cx + ' ' + cy + 'L' + bx.toFixed(2) + ' ' + by.toFixed(2) + '" fill="none" stroke="#9f8d7d" stroke-opacity=".55" stroke-width="1"/>' +
          '</g>';
        const [hx, hy] = polar(cx, cy, radius * 0.58, mid);
        hingeMarkup +=
          '<circle class="dsh-umbrella-hinge" cx="' + hx.toFixed(2) + '" cy="' + hy.toFixed(2) + '" r="2.5" fill="#9b151c" stroke="#b6a289" stroke-opacity=".6" stroke-width=".7"/>';
        if (index % 2 === 0) {
          const [dx, dy] = polar(cx, cy, radius * (0.36 + index * 0.045), mid + 0.08);
          dustMarkup +=
            '<circle cx="' + dx.toFixed(2) + '" cy="' + dy.toFixed(2) + '" r="1.1" fill="#cebfb0" fill-opacity=".55"/>';
        }
      }
      const [rx0, ry0] = polar(cx, cy, radius, start);
      const [rx1, ry1] = polar(cx, cy, radius, end);
      return (
        '<svg class="dsh-suoming-umbrella" viewBox="0 0 320 360" aria-hidden="true" focusable="false">' +
        '<defs>' +
        '<linearGradient id="dsh-umbrella-lacquer" x1="0" y1="0" x2="0.8" y2="1">' +
        '<stop offset="0" stop-color="#2a2522"/><stop offset=".45" stop-color="#121315"/><stop offset="1" stop-color="#0d0c0e"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<g class="dsh-umbrella-canopy">' + sectorMarkup + '</g>' +
        '<path class="dsh-umbrella-rim" d="M' + rx0.toFixed(2) + ' ' + ry0.toFixed(2) + 'A' + radius + ' ' + radius + ' 0 0 1 ' + rx1.toFixed(2) + ' ' + ry1.toFixed(2) + '" fill="none" stroke="#9b151c" stroke-opacity=".7" stroke-width="1.2"/>' +
        '<g class="dsh-umbrella-ribs">' + ribMarkup + '</g>' +
        '<g class="dsh-umbrella-hinges">' + hingeMarkup + '</g>' +
        '<g class="dsh-umbrella-dust">' + dustMarkup + '</g>' +
        '<path d="M160 120V272c0 20-14 32-32 32h-8" fill="none" stroke="#b6a289" stroke-opacity=".72" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="160" cy="120" r="9" fill="#0d0c0e" stroke="#cebfb0" stroke-opacity=".75" stroke-width="1.2"/>' +
        '<circle cx="160" cy="120" r="3.5" fill="#9b151c"/>' +
        '<path d="M126 304h14" stroke="#9f8d7d" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>'
      );
    }

    function buildChainSvg() {
      const path = 'M6 158C62 136 92 108 142 96S218 82 252 34';
      return (
        '<svg class="dsh-suoming-chain-svg" viewBox="0 0 260 180" aria-hidden="true" focusable="false">' +
        '<path d="' + path + '" fill="none" stroke="#3a171a" stroke-opacity=".65" stroke-width="3"/>' +
        '<path class="dsh-chain-flow dsh-chain-flow-a" d="' + path + '" fill="none" stroke="#9f8d7d" stroke-opacity=".62" stroke-width="1.4" stroke-dasharray="7 6"/>' +
        '<path class="dsh-chain-flow dsh-chain-flow-b" d="' + path + '" fill="none" stroke="#cebfb0" stroke-opacity=".28" stroke-width="1" stroke-dasharray="2 11"/>' +
        '<circle class="dsh-chain-anchor" cx="6" cy="158" r="4" fill="none" stroke="#b6a289" stroke-opacity=".65" stroke-width="1"/>' +
        '<path class="dsh-electro-arc" d="M62 132l16-12-8-8 22 3-6-14 26 8" fill="none" stroke="#b85e5d" stroke-opacity=".5" stroke-width="1"/>' +
        '<path class="dsh-electro-arc" d="M206 74l12-6-4-10 18 6" fill="none" stroke="#e0d7d6" stroke-opacity=".35" stroke-width=".8"/>' +
        '</svg>'
      );
    }

    function buildInkWashSvg() {
      return (
        '<svg class="dsh-suoming-l0-ink" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
        '<g fill="#80181d" fill-opacity=".32"><ellipse cx="230" cy="470" rx="250" ry="120"/><ellipse cx="540" cy="520" rx="210" ry="90"/></g>' +
        '<g fill="#536071" fill-opacity=".22"><ellipse cx="620" cy="230" rx="200" ry="110"/><ellipse cx="390" cy="180" rx="140" ry="80"/></g>' +
        '<g fill="#0d0c0e" fill-opacity=".55"><ellipse cx="120" cy="180" rx="180" ry="150"/><ellipse cx="720" cy="450" rx="160" ry="160"/></g>' +
        '</svg>'
      );
    }

    const UMBRELLA_SVG = buildUmbrellaSvg();
    const CHAIN_DYNAMIC_SVG = buildChainSvg();
    const INK_WASH_SVG = buildInkWashSvg();

    function buildCSS() {
      const goldLine = GOLD_LINE;
      return [
        /* 设置行（还原宿主 AppearanceRow 的行间距与卡片语言） */
        '.dsh-suoming-row{display:flex;flex-direction:column;gap:8px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}',
        '.dsh-suoming-rowHead{display:flex;flex-direction:column;gap:4px;min-width:0}',
        '.dsh-suoming-rowTitle{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px;font-weight:400}',
        '.dsh-suoming-rowDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}',
        '.dsh-suoming-cubes{display:flex;flex-wrap:wrap;align-items:stretch;gap:8px}',
        '.dsh-suoming-cube{box-sizing:border-box;flex:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:18px 24px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-xl);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;cursor:pointer;font-family:inherit}',
        '.dsh-suoming-cube:hover{background:var(--dsw-alias-interactive-bg-hover)}',
        '.dsh-suoming-cube.is-selected{background:var(--dsw-alias-bg-module-platform);border-color:var(--dsw-alias-state-business-primary)}',
        '.dsh-suoming-swatches{display:flex;border-radius:999px;overflow:hidden;box-shadow:0 0 0 .5px var(--dsw-alias-border-l2)}',
        '.dsh-suoming-swatch{display:block;width:26px;height:9px}',
        '.dsh-suoming-cubeLabel{font-size:14px;line-height:22px}',
        '.dsh-suoming-cubeState{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}',
        '.dsh-suoming-cube.is-selected .dsh-suoming-cubeState{color:var(--dsw-alias-state-business-primary)}',
        '.dsh-suoming-reset{align-self:center;height:36px;padding:0 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;font-family:inherit}',
        '.dsh-suoming-reset:hover{background:var(--dsw-alias-interactive-bg-hover)}',
        '.dsh-suoming-note{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px}',
        '.dsh-suoming-sceneControls{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px 16px;padding-top:2px}',
        '.dsh-suoming-sceneField{display:flex;flex-direction:column;gap:4px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}',
        '.dsh-suoming-sceneField input[type="range"]{width:100%;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}',
        '.dsh-suoming-sceneField select{height:30px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;cursor:pointer}',
        '.dsh-suoming-sceneControls .dsh-suoming-note{grid-column:1/-1}',
        '.dsh-suoming-sceneToggle{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}',
        '.dsh-suoming-sceneToggle input{accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}',
        /* 新会话台词 */
        '.dsh-suoming-quote{display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 16px 10px;pointer-events:none;user-select:none;font-size:12px;line-height:20px;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary)}',
        '.dsh-suoming-quoteRule{width:34px;height:1px;flex:none;background:' + goldLine + ';opacity:.75}',
        '.dsh-suoming-quoteText{color:var(--dsw-alias-label-secondary);max-width:min(72vw,620px);text-align:center}',
        '.dsh-suoming-quoteBy{color:var(--dsw-alias-link);flex:none}',
        /* 第三批：台词飘带末端的小金锁（方梁 + 圆体 + 竖钥匙孔） */
        '.dsh-suoming-quoteRule{position:relative}',
        '.dsh-suoming-quoteRule:first-child::after{content:"";position:absolute;right:-9px;top:50%;width:.82em;height:1.36em;margin-top:-.68em;pointer-events:none;opacity:.72;background:' + LOCK_GLYPH_URI + ' center/contain no-repeat}',
        '.dsh-suoming-quoteRule:last-child::before{content:"";position:absolute;left:-9px;top:50%;width:.82em;height:1.36em;margin-top:-.68em;pointer-events:none;opacity:.72;background:' + LOCK_GLYPH_URI + ' center/contain no-repeat}',
        /* 侧边栏装饰：顶/底 1px 暗金细线（宿主列不定位，故补 position:relative） */
        'html[data-dsh-suoming] div:has(> [data-slot="sidebar"]){position:relative}',
        'html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::before,',
        'html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::after{content:"";position:absolute;left:12px;right:12px;height:1px;z-index:4;pointer-events:none;background:' + goldLine + '}',
        'html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::before{top:0}',
        'html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::before,html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::after{animation:none}',
                'html[data-dsh-suoming] div:has(> [data-slot="sidebar"])::after{bottom:0}',
      ].join('\n');
    }

    /**
     * 兜底配色层：只要 <html>/<body> 带 data-dsh-suoming，就直接用 CSS 变量
     * 覆盖同一套令牌。即使主题服务的 presenter 因宿主版本差异没有把
     * ThemeDefinition.tokens 写进 body 内联样式，配色也一定会生效：
     * 主题服务负责「可选主题项」的语义，这一层负责「看得见」。
     */
    function buildTokenCSS() {
      const declarations = Object.entries(TOKENS)
        .map(([name, value]) => `${name}:${value};`)
        .join('');
      return (
        'html[data-dsh-suoming] body[data-dsh-suoming]{' + declarations + '}' +
        /* 没有 <body> 属性时也生效（例如属性写入晚于首帧） */
        'html[data-dsh-suoming] body:not([data-dsh-suoming]){' + declarations + '}'
      );
    }

    /** 16×16 金色角饰，按四个角镜像生成 data URI。 */
    function cornerUri(transform) {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
        '<g transform="' + transform + '">' +
        '<path d="M1.5 15V1.5H15" fill="none" stroke="' + P.gold + '" stroke-opacity=".6" stroke-width="1"/>' +
        '<circle cx="1.5" cy="1.5" r="1.2" fill="' + P.goldHi + '" fill-opacity=".8"/>' +
        '</g></svg>';
      return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
    }

    /**
     * 完整皮肤层：代码墨晕背景、锁芯占位、金框与侧栏纹样。
     * 全部通过宿主提供的稳定结构锚点（data-slot / data-phase / data-composer-*）
     * 与 pointer-events:none 的绘制层实现；不新增可点击控件，不改宿主布局。
     * 第二批只同步用色（旧金/深红/冷钢/骨白），不改图形结构与动效。
     */
    function buildSkinCSS() {
      const cornerTL = cornerUri('translate(0 0)');
      const cornerTR = cornerUri('translate(16 0) scale(-1 1)');
      const cornerBL = cornerUri('translate(0 16) scale(1 -1)');
      const cornerBR = cornerUri('translate(16 16) scale(-1 -1)');
      /* 代码墨晕：底部暗红向上翻涌、顶部消散；颜色与令牌同源（color-mix / rgba fallback）。 */
      const inkSilhouette =
        'radial-gradient(54% 46% at 3% 58%, rgba(0,0,0,0.55) 0%, transparent 72%),' +
        'radial-gradient(52% 46% at 98% 56%, rgba(0,0,0,0.50) 0%, transparent 72%)';
      const inkBase =
        'linear-gradient(180deg, ' + tint(P.bone, 5) + ' 0%, transparent 26%),' +
        'linear-gradient(180deg, ' + P.bg1 + ' 0%, ' + P.bgBase + ' 56%, ' + P.bg1 + ' 100%)';
      const inkChat =
        'linear-gradient(0deg, ' + tint(P.bone, 6) + ' 0%, ' + tint(P.bone, 1) + ' 13%, transparent 24%),' +
        'radial-gradient(120% 92% at 50% 118%, ' + tint(P.inkBright, 24) + ' 0%, ' + tint(P.inkDeep, 30) + ' 42%, transparent 74%),' +
        inkSilhouette + ',' + inkBase;
      const inkHero =
        'linear-gradient(0deg, ' + tint(P.bone, 9) + ' 0%, ' + tint(P.bone, 2) + ' 15%, transparent 28%),' +
        'radial-gradient(130% 100% at 50% 122%, ' + tint(P.inkBright, 36) + ' 0%, ' + tint(P.inkDeep, 34) + ' 40%, transparent 76%),' +
        inkSilhouette + ',' +
        'linear-gradient(180deg, ' + tint(P.bone, 7) + ' 0%, transparent 30%),' +
        'linear-gradient(180deg, ' + P.bg1 + ' 0%, ' + P.bgBase + ' 58%, ' + P.bg1 + ' 100%)';
      const charMask =
        'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.10) 26%, #000 68%)';
      const sidebarFade =
        'linear-gradient(180deg, ' + tint(P.bg1, 98) + ' 0%, ' + tint(P.bg1, 94) + ' 44%, ' +
        tint(P.bg1, 62) + ' 64%, ' + tint(P.bg1, 18) + ' 84%, ' + tint(P.bg1, 32) + ' 100%)';
      /* ===== 第四批：液态玻璃 ===== */
      const glassRing =
        '-webkit-mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000);' +
        '-webkit-mask-size:100% 100%,calc(100% - 24px) calc(100% - 24px);' +
        '-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-composite:xor;' +
        'mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000);' +
        'mask-size:100% 100%,calc(100% - 24px) calc(100% - 24px);' +
        'mask-position:center;mask-repeat:no-repeat;mask-composite:exclude';
      const chromaticRing =
        'background:conic-gradient(from 210deg,' + P.inkDeep + ',' + P.ink + ',' + P.inkBright + ',#6e1f26,' + P.inkDeep + ');' +
        '-webkit-mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000);' +
        '-webkit-mask-size:100% 100%,calc(100% - 4px) calc(100% - 4px);' +
        '-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-composite:xor;' +
        'mask-image:linear-gradient(#000,#000),linear-gradient(#000,#000);' +
        'mask-size:100% 100%,calc(100% - 4px) calc(100% - 4px);' +
        'mask-position:center;mask-repeat:no-repeat;mask-composite:exclude;' +
        'border-radius:inherit;pointer-events:none';
      const pointerGlow =
        'radial-gradient(24% 120% at var(--dsh-pointer-x,50%) var(--dsh-pointer-y,0%), rgba(233,223,213,var(--dsh-pointer-o,0)) 0%, transparent 72%)';
      const focusTopLine =
        'linear-gradient(90deg,transparent,' + tint(P.gold, 65) + ' 18%,' + tint(P.goldHi, 85) + ' 50%,' + tint(P.gold, 65) + ' 82%,transparent)';
      const focusBottomLine =
        'linear-gradient(90deg,transparent,' + tint(P.inkBright, 55) + ' 22%,' + tint(P.inkBright, 55) + ' 78%,transparent)';
      const glassSheen = 'linear-gradient(180deg,' + tint(P.bg3, 26) + ' 0%,' + tint(P.bgBase, 8) + ' 34%,transparent 100%)';
      const glassBase = 'linear-gradient(180deg,' + tint(P.bg2, 58) + ' 0%,' + tint(P.bgBase, 80) + ' 100%)';
      const cornerImage = 'linear-gradient(' + P.gold + ',' + P.gold + ')';
      const cardCorners = [
        ['left 5px top 5px', '14px 1px'],
        ['left 5px top 5px', '1px 14px'],
        ['right 5px top 5px', '14px 1px'],
        ['right 5px top 5px', '1px 14px'],
        ['left 5px bottom 5px', '14px 1px'],
        ['left 5px bottom 5px', '1px 14px'],
        ['right 5px bottom 5px', '14px 1px'],
        ['right 5px bottom 5px', '1px 14px'],
      ];
      const cardImages = cardCorners.map(() => cornerImage).concat([
        pointerGlow,
        focusTopLine,
        focusBottomLine,
        glassSheen,
        glassBase,
      ]).join(',');
      const cardPositions = cardCorners.map(([position]) => position).concat([
        'var(--dsh-pointer-x,50%) var(--dsh-pointer-y,0%)',
        'center top',
        'center bottom',
        '0 0',
        '0 0',
      ]).join(',');
      const cardSizes = cardCorners.map(([, size]) => size).concat([
        '22em 22em',
        'var(--dsh-focus-line-w,100%) 1px',
        'var(--dsh-focus-line-w,100%) 1px',
        '100% 100%',
        '100% 100%',
      ]).join(',');
      return [
        '/* ===== 锁暝完整皮肤 ===== */',
        /* 会话面板清底，让中心列的墨晕层透出；面板本身仍接收点击 */
        'html[data-dsh-suoming] [data-slot="main"] > *[data-phase]{background:transparent;position:relative;z-index:1;box-shadow:inset 0 0 0 1px ' + tint(P.goldMid, 10) + '}',
        'html[data-dsh-suoming] div:has(> [data-slot="main"]){position:relative;background-color:var(--dsw-alias-bg-base)}',
        /* 场景背景：代码墨晕骨架（对话态 / 新会话态只差红墨强度与雾量） */
        'html[data-dsh-suoming] div:has(> [data-slot="main"])::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:' + inkChat + ';background-repeat:no-repeat;background-size:100% 100%;transform-origin:50% 100%;animation:dshSuomingInkUp 27s cubic-bezier(.4,0,.2,1) infinite alternate,dshSuomingInkBreath 31s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] div:has(> [data-slot="main"]):has([data-phase="hero"])::before{background-image:' + inkHero + '}',
        /* 第五批 A：墨晕上涌（仅纵向）+ 呼吸；页面隐藏时由 JS 打上 paused 标记 */
        '@keyframes dshSuomingInkUp{0%{transform:translate3d(0,0.9%,0) scale(1.008)}100%{transform:translate3d(0,-1.6%,0) scale(1.018)}}',
        '@keyframes dshSuomingInkBreath{0%{opacity:.9}100%{opacity:1}}',
        'html[data-dsh-suoming-paused] div:has(> [data-slot="main"])::before{animation-play-state:paused}',
        '@media (prefers-reduced-motion:reduce){html[data-dsh-suoming] div:has(> [data-slot="main"])::before{animation:none;transform:none;opacity:1}}',
        /* 第五批 A：输入框边缘 Canvas 冷脉冲（点击穿透，颜色只在朱红/白热/暗红范围） */
        '.dsh-suoming-pulse{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;display:block}',
        /* 角色位：第三批换成「玄朱锁」简化抽象版（黑红金互锁多面体），随字号缩放 */
        'html[data-dsh-suoming] div:has(> [data-slot="main"])::after{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background-image:' + XUANZHU_LOCK_URI + ';background-repeat:no-repeat;background-position:right 5% bottom 0;background-size:auto min(66vh,34em);opacity:.46;-webkit-mask-image:' + charMask + ';mask-image:' + charMask + '}',
        'html[data-dsh-suoming] div:has(> [data-slot="main"]):has([data-phase="hero"])::after{opacity:.66;background-position:right 3% bottom 0;background-size:auto min(72vh,38em)}',
        '@media (max-width:1180px){html[data-dsh-suoming] div:has(> [data-slot="main"])::after{display:none}}',
        /* 会话头部：半透明渐隐 + 旧金下缘（小面积强调） */
        'html[data-dsh-suoming] [data-slot="main"] > *[data-phase] header{background:linear-gradient(180deg,' + tint(P.bgBase, 82) + ',transparent);border-bottom-color:' + tint(P.gold, 24) + '}',
        /* ===== 第四批（P0-5）：输入卡完整五层液态玻璃 ===== */
        /* ① 半透明底（近黑/冷灰，不用白纱）+ ④ 顶部 1px 高光 + 四角金饰 + ⑤ 指针高光层（CSS 过渡 300ms） */
        'html[data-dsh-suoming] [data-composer-card]{position:relative;isolation:isolate;background-color:rgba(23,24,27,0.58);background-image:' + cardImages + ';background-repeat:no-repeat;background-position:' + cardPositions + ';background-size:' + cardSizes + ';box-shadow:inset 0 0 0 1px ' + tint(P.gold, 24) + ';backdrop-filter:blur(2.2px) saturate(1.08);-webkit-backdrop-filter:blur(2.2px) saturate(1.08);transition:background-size 280ms cubic-bezier(.4,0,.2,1),background-position 300ms cubic-bezier(.4,0,.2,1),backdrop-filter 280ms ease}',
        'html[data-dsh-suoming] [data-composer-card]:hover,html[data-dsh-suoming] [data-composer-card]:focus-within{backdrop-filter:blur(1.2px) saturate(1.12);-webkit-backdrop-filter:blur(1.2px) saturate(1.12)}',
        /* 第三批 G 的“锁芯收拢”改由上下细线的 background-size 过渡实现 */
        'html[data-dsh-suoming] [data-composer-card]:focus-within{--dsh-focus-line-w:84%}',
        /* ② 边缘折射：backdrop-filter + feTurbulence→feGaussianBlur→feDisplacementMap；CSS mask 只留外圈 ~12px（约 12% 高度） */
        'html[data-dsh-suoming] [data-composer-card]::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;opacity:.78;backdrop-filter:blur(1.1px) saturate(1.06);-webkit-backdrop-filter:blur(1.1px) saturate(1.06);filter:url(#dsh-suoming-glass-refraction);' + glassRing + '}',
        'html[data-dsh-suoming] [data-composer-card]:hover::before,html[data-dsh-suoming] [data-composer-card]:focus-within::before{opacity:1}',
        /* ③ 色差环：conic-gradient + mask-composite: exclude，只留最外缘 2px，强度 0.12，暗红→深绛 */
        'html[data-dsh-suoming] [data-composer-card]::after{content:"";position:absolute;inset:0;z-index:-1;opacity:.12;' + chromaticRing + '}',
        /* 侧边栏：中等玻璃（保留折射 + 高光，色差环降低到 0.06） */
        'html[data-dsh-suoming] [data-slot="sidebar"] > div{position:relative;isolation:isolate;background-color:rgba(6,6,9,0.92);background-image:' + [cornerTL, cornerTR, cornerBL, cornerBR].join(',') + ',' + CHAIN_URI + ',linear-gradient(to left, ' + tint(P.gold, 13) + ', ' + tint(P.gold, 0) + ' 1.3em),' + sidebarFade + ',' + LOCK_GLYPH_URI + ',radial-gradient(120% 55% at 0% 0%, ' + tint(P.ink, 18) + ', transparent 60%);background-repeat:no-repeat,no-repeat,no-repeat,no-repeat,repeat-y,no-repeat,no-repeat,no-repeat,no-repeat;background-position:left .5em top .5em,right .5em top .5em,left .5em bottom .5em,right .5em bottom .5em,right .15em top 0,right top 0,center top,center bottom,left top;background-size:1.1em 1.1em,1.1em 1.1em,1.1em 1.1em,1.1em 1.1em,.86em 1.72em,1.3em 100%,100% 100%,auto 8em,100% 100%;box-shadow:inset 0 1px 0 ' + tint(P.bone, 8) + ',inset 0 0 0 1px ' + tint(P.steel, 16) + '}',
        'html[data-dsh-suoming] [data-slot="sidebar"] > div::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:-1;opacity:.5;backdrop-filter:blur(.8px) saturate(1.04);-webkit-backdrop-filter:blur(.8px) saturate(1.04);filter:url(#dsh-suoming-glass-refraction);' + glassRing + '}',
        'html[data-dsh-suoming] [data-slot="sidebar"] > div::after{content:"";position:absolute;inset:0;z-index:-1;opacity:.06;' + chromaticRing + '}',
        /* 消息气泡：最轻玻璃——半透明底 + 顶部 1px 高光 + 极弱边缘折射，无指针跟随 */
        'html[data-dsh-suoming] div:has(> [data-slot="conversation.user.text"]){position:relative;isolation:isolate;background-color:rgba(23,24,27,0.55);box-shadow:inset 0 1px 0 ' + tint(P.bone, 10) + '}',
        'html[data-dsh-suoming] div:has(> [data-slot="conversation.user.text"])::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;opacity:.32;backdrop-filter:blur(.4px) saturate(1.02);-webkit-backdrop-filter:blur(.4px) saturate(1.02);' + glassRing + '}',
        /* prefers-reduced-motion：关闭指针跟随与动态层，只保留静态玻璃 */
        '@media (prefers-reduced-motion:reduce){html[data-dsh-suoming] [data-composer-card]{--dsh-pointer-o:0;transition:none}html[data-dsh-suoming] [data-composer-card]:focus-within{--dsh-focus-line-w:100%}html[data-dsh-suoming] [data-composer-card]::before{filter:none;opacity:.7}html[data-dsh-suoming] [data-composer-card]:hover::before,html[data-dsh-suoming] [data-composer-card]:focus-within::before{opacity:.7}html[data-dsh-suoming] [data-composer-card]::after{opacity:.1}html[data-dsh-suoming] [data-slot="sidebar"] > div::before{filter:none;opacity:.4}html[data-dsh-suoming] div:has(> [data-slot="conversation.user.text"])::before{opacity:.24}}',
        /* 台词在墨晕上保持可读 */
        '.dsh-suoming-quote{text-shadow:0 1px 14px ' + tint(P.bgBase, 95) + '}',
        /* 品牌纹章 */
        '.dsh-suoming-brand{display:block;filter:drop-shadow(0 2px 10px ' + tint(P.inkBright, 35) + ')}',
        /* 欢迎页锁芯符号 */
        '.dsh-suoming-hero-mark{display:block;filter:drop-shadow(0 2px 8px ' + tint(P.inkBright, 35) + ')}',
        /* ===== 第五批 B-1：排版与交互规范 ===== */
        /* 正文行高 ≥1.6；中英间距用 text-autospace，旧内核回退 letter-spacing；全角标点 trim-start */
        'html[data-dsh-suoming] [data-conversation-scroll] :where(article,p,li,blockquote,dd,dt){line-height:1.65;font-kerning:normal;line-break:strict;overflow-wrap:break-word}',
        '@supports (text-autospace:normal){html[data-dsh-suoming] [data-conversation-scroll] :where(article,p,li,blockquote,dd,dt){text-autospace:normal;text-spacing-trim:trim-start}}',
        '@supports not (text-autospace:normal){html[data-dsh-suoming] [data-conversation-scroll] :where(article,p,li,blockquote,dd,dt){letter-spacing:.01em}}',
        /* 代码与正文分离：独立等宽栈、行内代码独立背景 */
        'html[data-dsh-suoming] [data-conversation-scroll] :where(pre,code,kbd,samp){font-family:"JetBrains Mono","Cascadia Code","SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace;font-variant-ligatures:none;font-feature-settings:"liga" 0,"clig" 0}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre{font-size:calc(var(--dsh-content-font-size,14px) - 1.5px);line-height:1.6}',
        'html[data-dsh-suoming] [data-conversation-scroll] :where(:not(pre) > code){background:var(--dsw-alias-markdown-inline-code);border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:.1em .32em;font-size:.92em}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre code{background:transparent;border:0;padding:0;font-size:inherit}',
        /* 宿主 outline 按钮（含权限审批的“拒绝”）使用可见的旧金边界，避免在深色卡片上变成裸文字 */
        /* 必须与令牌同层（body）声明：html 上没有 --dsw-* 令牌，写在 html 会让 var() 失效并回退到低对比度边界 */
        'html[data-dsh-suoming] body{--dsh-button-outline-color:var(--dsw-alias-state-warn-primary)}',
        /* focus-visible：键盘导航才出现，2px accent、offset -1px；指针聚焦不画环 */
        'html[data-dsh-suoming] :where(a,button,[role="button"],[role="tab"],[role="menuitem"],input,textarea,select,summary,[tabindex]):focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-1px}',
        'html[data-dsh-suoming] :where(a,button,[role="button"],[role="tab"],[role="menuitem"],input,textarea,select,summary,[tabindex]):focus:not(:focus-visible){outline:none}',
        /* ::selection：使用 state-business-primary 32% 派生色，覆盖浏览器默认蓝 */
        'html[data-dsh-suoming] ::selection{background-color:var(--dsw-alias-bg-document-selection);color:var(--dsw-alias-label-primary);text-shadow:none}',
        /* 滚动条分区域：对话区冷钢、代码块旧金、侧栏深冷钢 */
        'html[data-dsh-suoming] [data-conversation-scroll]{scrollbar-width:thin;scrollbar-color:#4a5058 transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll]::-webkit-scrollbar{width:10px;height:10px}',
        'html[data-dsh-suoming] [data-conversation-scroll]::-webkit-scrollbar-track{background:transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll]::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#4a5058,#3a3f47);border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        'html[data-dsh-suoming] [data-conversation-scroll]::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#5a6068,#4a5058);border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        'html[data-dsh-suoming] [data-conversation-scroll]::-webkit-scrollbar-corner{background:transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre{scrollbar-width:thin;scrollbar-color:#9f8d7d transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre::-webkit-scrollbar{width:8px;height:8px}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre::-webkit-scrollbar-track{background:rgba(13,12,14,.45)}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#b6a289,#9f8d7d);border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        'html[data-dsh-suoming] [data-conversation-scroll] pre::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#cebfb0,#b6a289);border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        'html[data-dsh-suoming] [data-slot="sidebar"] *{scrollbar-width:thin;scrollbar-color:#3a3f47 transparent}',
        'html[data-dsh-suoming] [data-slot="sidebar"] *::-webkit-scrollbar{width:8px;height:8px}',
        'html[data-dsh-suoming] [data-slot="sidebar"] *::-webkit-scrollbar-track{background:transparent}',
        'html[data-dsh-suoming] [data-slot="sidebar"] *::-webkit-scrollbar-thumb{background:#3a3f47;border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        'html[data-dsh-suoming] [data-slot="sidebar"] *::-webkit-scrollbar-thumb:hover{background:#4a5058;border:2px solid transparent;background-clip:padding-box;border-radius:8px}',
        /* ===== 本轮：四层背景 + 立绘 + 台词气泡 ===== */
        'html[data-dsh-suoming] .dsh-suoming-scene-host{position:relative;isolation:isolate}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host::before,html[data-dsh-suoming] .dsh-suoming-scene-host::after{display:none}',
        'html[data-dsh-suoming] body{background:radial-gradient(70% 58% at 74% 20%,rgba(128,24,29,.18),transparent 70%),radial-gradient(62% 52% at 16% 78%,rgba(83,96,113,.14),transparent 72%),#0d0c0e}',
        'html[data-dsh-suoming] #root,html[data-dsh-suoming] body > div{background-color:transparent}',
        'html[data-dsh-suoming] [class*="mp3x-q_root"],html[data-dsh-suoming] [class*="mp3x-q_frame"]{background-color:transparent}',
                'html[data-dsh-suoming] .dsh-suoming-scene{position:absolute;inset:0;z-index:-1;overflow:hidden;pointer-events:none;contain:layout style paint}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host{background:transparent}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host [data-slot="main"] > *{position:relative;z-index:1;background-color:transparent}',
        /* L0：墨晕底层（红 + 冷钢 + 墨灰；纵向上涌 34s、呼吸 41s） */
        'html[data-dsh-suoming] .dsh-suoming-l0{position:absolute;inset:0;z-index:0;pointer-events:none}',
        'html[data-dsh-suoming] .dsh-suoming-l0-paint{position:absolute;inset:-8%;filter:blur(7px);background:radial-gradient(46% 40% at 74% 24%,rgba(83,96,113,.34),transparent 72%),radial-gradient(52% 48% at 24% 72%,rgba(128,24,29,.30),transparent 76%),radial-gradient(72% 52% at 52% 112%,rgba(155,21,28,.26),transparent 72%),radial-gradient(120% 90% at 50% 50%,transparent 30%,rgba(13,12,14,.55) 72%,rgba(13,12,14,.92) 100%),linear-gradient(180deg,#0d0c0e 0%,#121315 52%,#0d0c0e 100%)}',
        'html[data-dsh-suoming] .dsh-suoming-l0-up{position:absolute;inset:0;animation:dshSuomingL0Up 34s cubic-bezier(.4,0,.2,1) infinite}',
        'html[data-dsh-suoming] .dsh-suoming-l0-breath{position:absolute;inset:0;animation:dshSuomingL0Breath 41s ease-in-out infinite}',
        '@keyframes dshSuomingL0Up{0%{transform:translate3d(0,1.2%,0)}50%{transform:translate3d(0,-1.8%,0)}100%{transform:translate3d(0,1.2%,0)}}',
        '@keyframes dshSuomingL0Breath{0%{opacity:.92}50%{opacity:1}100%{opacity:.92}}',
        /* L1：远景（0.25x 视差、3.5px 模糊、雾带、稀疏雨丝） */
        'html[data-dsh-suoming] .dsh-suoming-l1{position:absolute;inset:0;z-index:1;pointer-events:none;transform:translate3d(var(--dsh-l1-x,0px),var(--dsh-l1-y,0px),0);transition:transform 400ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-l1-far{position:absolute;inset:-2%;filter:blur(3.5px);opacity:.58;background:linear-gradient(90deg,transparent 0 7%,rgba(83,96,113,.28) 7% 8.2%,transparent 8.2% 15%,rgba(83,96,113,.20) 15% 17%,transparent 17% 71%,rgba(83,96,113,.26) 71% 72%,rgba(83,96,113,.12) 72% 75%,transparent 75%),radial-gradient(48% 34% at 18% 62%,rgba(83,96,113,.34),transparent 72%),radial-gradient(58% 26% at 78% 58%,rgba(132,139,149,.18),transparent 74%),linear-gradient(180deg,transparent 0 36%,rgba(83,96,113,.22) 42%,transparent 58%);mask-image:linear-gradient(180deg,transparent 0%,#000 24%,#000 74%,transparent 100%)}',
        'html[data-dsh-suoming] .dsh-suoming-l1-fog{position:absolute;left:-18%;right:-18%;top:36%;height:28%;filter:blur(6px);opacity:.62;background:linear-gradient(180deg,transparent,rgba(174,184,196,.10) 32%,rgba(174,184,196,.16) 56%,transparent),repeating-linear-gradient(0deg,transparent 0 22px,rgba(174,184,196,.035) 22px 24px);animation:dshSuomingL1Fog 54s linear infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-l1-rain{position:absolute;inset:0;opacity:.42;background:repeating-linear-gradient(100deg,transparent 0 19px,rgba(174,184,196,.055) 19px 20px);mask-image:linear-gradient(180deg,transparent 0%,#000 20%,#000 82%,transparent 100%)}',
        '@keyframes dshSuomingL1Fog{0%{transform:translate3d(-3%,0,0)}100%{transform:translate3d(3%,0,0)}}',
        /* L2：角色主题区域（不再使用整张 JPG；机关伞 + 抽象墨影，右侧限宽，绝不覆盖正文） */
        'html[data-dsh-suoming] .dsh-suoming-l2{position:absolute;inset:0;z-index:2;pointer-events:none;transform:translate3d(var(--dsh-l2-x,0px),var(--dsh-l2-y,0px),0);transition:transform 280ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-l2-glow{position:absolute;right:-6%;bottom:-8%;width:42%;height:64%;background:radial-gradient(50% 46% at 58% 64%,rgba(128,24,29,.18),transparent 72%);filter:blur(18px)}',
        'html[data-dsh-suoming] .dsh-suoming-l2-breath{position:absolute;inset:0;transform-origin:82% 86%;animation:dshSuomingL2Breath 38s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-l2-state{position:absolute;inset:0;transform-origin:80% 72%;transition:transform 200ms cubic-bezier(.4,0,.2,1),filter 200ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-character{position:absolute;right:calc(1vw + var(--dsh-portrait-offset-x,0px));bottom:3vh;width:min(28vw,390px);height:var(--dsh-portrait-height,62vh);max-height:760px;opacity:var(--dsh-portrait-opacity,.82);pointer-events:none;filter:drop-shadow(0 26px 46px rgba(0,0,0,.58));-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 10%,#000 100%),linear-gradient(180deg,transparent 0%,#000 4%,#000 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);mask-composite:intersect}',
        'html[data-dsh-suoming] .dsh-suoming-character::before{content:"";position:absolute;inset:10% 2% 0;z-index:0;pointer-events:none;background:radial-gradient(52% 44% at 50% 42%,rgba(128,24,29,.26),rgba(128,24,29,0) 72%);filter:blur(16px)}',
        'html[data-dsh-suoming] .dsh-suoming-character-image{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom center;opacity:1;filter:saturate(.94) contrast(1.02);pointer-events:none;z-index:1;animation:dshSuomingPortraitFloat 9s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-character.has-portrait .dsh-suoming-character-figure{display:none}',
        'html[data-dsh-suoming] .dsh-suoming-character.has-portrait .dsh-suoming-character-ribbons{opacity:.22}',
        'html[data-dsh-suoming] .dsh-suoming-character.has-portrait .dsh-suoming-umbrella{display:none}',
        'html[data-dsh-suoming] .dsh-suoming-ambient{display:none;position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;opacity:.2;background:radial-gradient(70% 58% at 78% 18%,rgba(128,24,29,.16),transparent 68%),radial-gradient(62% 52% at 14% 82%,rgba(83,96,113,.14),transparent 72%),radial-gradient(48% 42% at 52% 46%,rgba(60,42,72,.08),transparent 74%)}',
        'html[data-dsh-suoming] .dsh-suoming-ambient-ink{position:absolute;left:-10%;bottom:-10%;width:66vw;height:56vh;opacity:.22;filter:none;animation:none}',
        'html[data-dsh-suoming] .dsh-suoming-ambient-ink svg{width:100%;height:100%;display:block}',
        'html[data-dsh-suoming] .dsh-suoming-ambient-umbrella{position:absolute;left:-4vw;bottom:8vh;width:min(28vw,340px);opacity:.1;animation:none}',
        'html[data-dsh-suoming] .dsh-suoming-ambient-umbrella svg{width:100%;height:auto;display:block}',
        'html[data-dsh-suoming] .dsh-suoming-corner-lock{position:fixed;top:13vh;right:2vw;width:min(17vw,210px);height:min(17vw,210px);z-index:3;pointer-events:none;background:' + XUANZHU_LOCK_URI + ' center/contain no-repeat;opacity:.2;animation:dshSuomingCornerLock 26s linear infinite}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host{background-color:transparent}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host::before{display:none}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host *{background-color:transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll],html[data-dsh-suoming] [data-slot="conversation"]{background-color:transparent}',
        'html[data-dsh-suoming] [data-conversation-scroll] > *,html[data-dsh-suoming] [data-slot="conversation"] > *{background-color:transparent}',
        'html[data-dsh-suoming] [data-slot="main"] > *{position:relative;z-index:4}',
        'html[data-dsh-suoming] [data-slot="sidebar"] > div{position:relative;z-index:4}',
        'html[data-dsh-suoming] [data-composer-card]{position:relative;z-index:5}',
        'html[data-dsh-suoming] .dsh-suoming-right-art{position:fixed;right:calc(1vw + var(--dsh-portrait-offset-x,0px));bottom:11vh;width:min(24vw,330px);height:55vh;max-height:660px;z-index:2;pointer-events:none;opacity:var(--dsh-portrait-opacity,.82);filter:drop-shadow(0 26px 46px rgba(0,0,0,.58));-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,#000 18%,#000 82%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 12%,#000 84%,transparent 100%);mask-composite:intersect;animation:none}',
        'html[data-dsh-suoming] .dsh-suoming-right-art img{width:100%;height:100%;object-fit:contain;object-position:bottom center;filter:saturate(.9) contrast(1.03) brightness(.92)}',
        'html[data-dsh-suoming] .dsh-suoming-side-art{position:absolute;left:0;right:0;bottom:0;height:52%;z-index:-1;pointer-events:none;overflow:hidden;opacity:.58;animation:none;-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 22%,#000 100%);mask-image:linear-gradient(180deg,transparent 0%,#000 22%,#000 100%)}',
        'html[data-dsh-suoming] .dsh-suoming-side-art img{position:absolute;left:50%;bottom:0;width:128%;max-width:none;height:100%;object-fit:contain;object-position:bottom center;transform:translateX(-50%);filter:saturate(.82) brightness(.82) blur(.25px)}',
        'html[data-dsh-suoming] .dsh-suoming-side-umbrella{position:absolute;left:50%;bottom:10%;width:150%;opacity:.24;transform:translateX(-50%);animation:dshSuomingSideUmbrellaSpin 26s linear infinite}',
        'html[data-dsh-suoming] .dsh-suoming-side-umbrella svg{width:100%;height:auto;display:block}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host::before{display:none;content:"";position:absolute;right:calc(1vw + var(--dsh-portrait-offset-x,0px));bottom:2vh;width:min(28vw,390px);height:62vh;max-height:760px;z-index:0;pointer-events:none;background:url("/suoming-local-art/char.jpg") center bottom/contain no-repeat;opacity:var(--dsh-portrait-opacity,.82);filter:drop-shadow(0 26px 46px rgba(0,0,0,.58));-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);mask-composite:intersect;animation:dshSuomingPortraitFloat 9s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-scene-host::after{display:none;content:"";position:absolute;top:11vh;right:2vw;width:min(16vw,190px);height:min(16vw,190px);z-index:0;pointer-events:none;background:' + XUANZHU_LOCK_URI + ' center/contain no-repeat;opacity:.2;animation:dshSuomingCornerLock 26s linear infinite}',
        'html[data-dsh-suoming] .dsh-suoming-scene .dsh-suoming-l2{display:none}',
        'html[data-dsh-suoming] .dsh-suoming-global{display:none;position:absolute;inset:0;z-index:-1;pointer-events:none;overflow:hidden;contain:layout style paint;animation:dshSuomingGlobalFade 260ms ease-out both;background:radial-gradient(70% 58% at 74% 20%,rgba(128,24,29,.3),transparent 70%),radial-gradient(62% 52% at 16% 78%,rgba(83,96,113,.2),transparent 72%),linear-gradient(158deg,#0b0a0d 0%,#151016 52%,#0d0c0e 100%)}',
        'html[data-dsh-suoming] .dsh-suoming-global::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(58% 50% at 70% 36%,rgba(83,96,113,.2),transparent 72%),radial-gradient(48% 42% at 82% 70%,rgba(128,24,29,.28),transparent 74%);mix-blend-mode:screen;animation:dshSuomingGlobalAura 22s ease-in-out infinite alternate}',
                'html[data-dsh-suoming] .dsh-suoming-global::after{content:"";position:absolute;left:-6%;right:-6%;bottom:-8%;height:58%;z-index:0;pointer-events:none;background:radial-gradient(45% 50% at 38% 70%,rgba(155,21,28,.2),transparent 72%),radial-gradient(38% 45% at 66% 78%,rgba(83,96,113,.16),transparent 74%);filter:blur(22px);animation:dshSuomingGlobalMist 26s ease-in-out infinite alternate}',
                'html[data-dsh-suoming] .dsh-suoming-global-halo{position:absolute;right:2vw;bottom:8vh;width:min(30vw,430px);height:46vh;background:radial-gradient(50% 50% at 50% 55%,rgba(128,24,29,.26),rgba(128,24,29,0) 70%);filter:blur(20px)}',
        'html[data-dsh-suoming] .dsh-suoming-global-chain{position:absolute;z-index:1;right:-2vw;bottom:14vh;width:min(22vw,280px);opacity:.2;filter:blur(.2px);animation:dshSuomingGlobalChain 9s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-global-chain svg{width:100%;height:auto;display:block}',
                'html[data-dsh-suoming] .dsh-suoming-global-portrait{position:absolute;z-index:2;right:1vw;bottom:2vh;width:min(28vw,390px);height:62vh;max-height:760px;opacity:var(--dsh-portrait-opacity,.82);pointer-events:none;filter:drop-shadow(0 18px 30px rgba(0,0,0,.45));-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 8%,#000 88%,transparent 100%);mask-composite:intersect}',
        'html[data-dsh-suoming] .dsh-suoming-global-portrait::after{content:"";position:absolute;left:0;right:0;bottom:0;height:32%;z-index:2;pointer-events:none;background:linear-gradient(to top,rgba(13,12,14,.96),rgba(13,12,14,.55) 38%,transparent 78%)}',
                'html[data-dsh-suoming] .dsh-suoming-global-secondary{position:absolute;z-index:2;left:1vw;bottom:3vh;width:min(20vw,280px);height:46vh;max-height:560px;opacity:.42;pointer-events:none;filter:blur(.35px) drop-shadow(0 14px 28px rgba(0,0,0,.55));-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 10%,#000 82%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0%,#000 12%,#000 88%,transparent 100%),linear-gradient(180deg,transparent 0%,#000 10%,#000 82%,transparent 100%);mask-composite:intersect;animation:dshSuomingSecondaryFloat 12s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-global-secondary img{width:100%;height:100%;object-fit:contain;object-position:bottom center;filter:saturate(.8) contrast(1.03) brightness(.82)}',
                'html[data-dsh-suoming] .dsh-suoming-global-image{width:100%;height:100%;object-fit:contain;object-position:bottom center;filter:saturate(.9) contrast(1.03) brightness(.92);animation:dshSuomingPortraitFloat 9s ease-in-out infinite alternate}',
                'html[data-dsh-suoming] .dsh-suoming-character-figure{position:absolute;inset:24% 16% 0 20%;opacity:.55;background:radial-gradient(60% 42% at 52% 26%,#0d0c0e 0%,#17181b 42%,transparent 74%),linear-gradient(180deg,transparent 0 8%,#0d0c0e 34%,#17181b 62%,transparent 100%);clip-path:polygon(38% 0,66% 2%,78% 18%,72% 38%,94% 100%,8% 100%,26% 44%,20% 18%)}',
        'html[data-dsh-suoming] .dsh-suoming-character-ribbons{position:absolute;left:16%;top:34%;width:58%;height:42%;opacity:.5;filter:blur(1.5px);background:radial-gradient(46% 22% at 30% 18%,rgba(155,21,28,.5),transparent 76%),linear-gradient(104deg,transparent 28%,rgba(155,21,28,.42) 30%,rgba(128,24,29,.18) 38%,transparent 42%),linear-gradient(82deg,transparent 52%,rgba(155,21,28,.28) 54%,transparent 62%)}',
        'html[data-dsh-suoming] .dsh-suoming-character .dsh-suoming-umbrella{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 8px 18px rgba(0,0,0,.45)) drop-shadow(0 0 1px rgba(206,191,176,.28))}',
        'html[data-dsh-suoming] .dsh-suoming-umbrella-sector,html[data-dsh-suoming] .dsh-suoming-umbrella-rib{transform-box:view-box;transform-origin:160px 120px;animation:dshSuomingUmbrellaOpen 7s cubic-bezier(.4,0,.2,1) infinite alternate;animation-delay:var(--delay,0s)}',
        'html[data-dsh-suoming] .dsh-suoming-umbrella-rim{transform-box:view-box;transform-origin:160px 120px;animation:dshSuomingUmbrellaRim 7s cubic-bezier(.4,0,.2,1) infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-umbrella-hinge{animation:dshSuomingHinge 7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}',
        'html[data-dsh-suoming] .dsh-suoming-character-lock{position:absolute;left:50%;bottom:5%;width:14%;height:22%;transform:translateX(-50%);opacity:.55;background:' + LOCK_GLYPH_URI + ' center/contain no-repeat}',
        'html[data-dsh-suoming] .dsh-suoming-scene[data-state="hover"] .dsh-suoming-l2-state{transform:scale(1.02);filter:brightness(1.06)}',
        'html[data-dsh-suoming] .dsh-suoming-scene[data-state="thinking"] .dsh-suoming-l2-state,html[data-dsh-suoming] .dsh-suoming-scene[data-state="generating"] .dsh-suoming-l2-state{transform:rotate(-1.2deg) translate3d(0,2px,0)}',
        'html[data-dsh-suoming] .dsh-suoming-scene[data-state="click"] .dsh-suoming-l2-state{animation:dshSuomingL2Click 180ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-scene[data-state="error"] .dsh-suoming-l2-state{transform:translate3d(0,2px,0) rotate(.8deg);filter:brightness(.9) contrast(1.05)}',
        '@keyframes dshSuomingL2Breath{0%{transform:scale(1)}100%{transform:scale(1.008)}}',
        '@keyframes dshSuomingL2Click{0%{transform:scale(1.02)}45%{transform:scale(.99)}100%{transform:scale(1.02)}}',
        '@keyframes dshSuomingRightDrift{0%,100%{background-position:right 1vw bottom 2vh}50%{background-position:right 1vw bottom 3.2vh}}',
        '@keyframes dshSuomingAmbientInk{0%,100%{transform:translate3d(0,0,0);opacity:.2}50%{transform:translate3d(3%,-2%,0);opacity:.32}}',
        '@keyframes dshSuomingAmbientUmbrella{from{transform:rotate(-8deg)}to{transform:rotate(352deg)}}',
        '@keyframes dshSuomingCornerLock{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
        '@keyframes dshSuomingGlobalFade{from{opacity:0}to{opacity:1}}',
        '@keyframes dshSuomingSideLine{0%,100%{opacity:.55}50%{opacity:1}}',
        '@keyframes dshSuomingSideFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,7px,0)}}',
        '@keyframes dshSuomingSideUmbrellaSpin{from{transform:translateX(-50%) rotate(0deg)}to{transform:translateX(-50%) rotate(360deg)}}',
        '@keyframes dshSuomingGlobalAura{0%,100%{opacity:.78;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}',
        '@keyframes dshSuomingGlobalMist{0%,100%{transform:translate3d(0,0,0);opacity:.14}50%{transform:translate3d(-3%,-2%,0);opacity:.24}}',
        '@keyframes dshSuomingSecondaryFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,9px,0)}}',
        '@keyframes dshSuomingGlobalChain{0%,100%{transform:translate3d(0,0,0);opacity:.14}50%{transform:translate3d(-8px,6px,0);opacity:.26}}',
        '@keyframes dshSuomingPortraitFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-7px,0)}}',
        '@keyframes dshSuomingUmbrellaOpen{0%,100%{transform:rotate(var(--closed,0deg))}42%,58%{transform:rotate(0deg)}}',
        '@keyframes dshSuomingUmbrellaRim{0%,100%{opacity:.3}42%,58%{opacity:.85}}',
        '@keyframes dshSuomingHinge{0%,100%{opacity:.25;transform:scale(.75)}42%,58%{opacity:.9;transform:scale(1)}}',
        /* L3：机关锁/锁链/导电前景（低透明度，永远在正文之下） */
        'html[data-dsh-suoming] .dsh-suoming-l3{display:none;position:absolute;inset:0;z-index:3;pointer-events:none;transform:translate3d(var(--dsh-l3-x,0px),var(--dsh-l3-y,0px),0);transition:transform 220ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-l3-rotate{position:absolute;right:-5%;top:8%;width:22em;height:22em;opacity:.2;background:' + XUANZHU_LOCK_URI + ' center/contain no-repeat;animation:dshSuomingL3Spin 9s linear infinite}',
        'html[data-dsh-suoming] .dsh-suoming-l3-breathe{position:absolute;left:3%;bottom:20%;width:6em;height:10em;opacity:.2;background:' + LOCK_GLYPH_URI + ' center/contain no-repeat;animation:dshSuomingL3Breathe 7s ease-in-out infinite alternate}',
        'html[data-dsh-suoming] .dsh-suoming-l3-chain{position:absolute;right:2%;bottom:26%;width:240px;height:170px;opacity:.38;transform:translate3d(var(--dsh-chain-x,0px),var(--dsh-chain-y,0px),0);transition:transform 120ms cubic-bezier(.4,0,.2,1)}',
        'html[data-dsh-suoming] .dsh-suoming-chain-svg{width:100%;height:100%;overflow:visible}',
        'html[data-dsh-suoming] .dsh-chain-flow-a{animation:dshSuomingChainFlow 4.2s linear infinite}',
        'html[data-dsh-suoming] .dsh-chain-flow-b{animation:dshSuomingChainFlow 6.4s linear infinite reverse}',
        'html[data-dsh-suoming] .dsh-electro-arc{animation:dshSuomingElectro 5.2s steps(1,end) infinite}',
        'html[data-dsh-suoming] .dsh-suoming-l3-spark{position:absolute;left:48%;bottom:13%;width:3px;height:3px;border-radius:50%;background:rgba(224,215,214,.4);opacity:.45}',
        '@keyframes dshSuomingL3Spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}',
        '@keyframes dshSuomingL3Breathe{0%{transform:translate3d(0,2px,0) scale(.985)}100%{transform:translate3d(0,-2px,0) scale(1.015)}}',
        '@keyframes dshSuomingChainFlow{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-65}}',
        '@keyframes dshSuomingElectro{0%,88%,100%{opacity:0}89%,92%{opacity:.75}93%{opacity:.15}94%,96%{opacity:.6}}',
        'html[data-dsh-suoming] .dsh-suoming-l0-ink{position:absolute;inset:-10%;width:120%;height:120%;opacity:.45;filter:blur(18px);animation:dshSuomingInkMist 58s ease-in-out infinite alternate}',
        '@keyframes dshSuomingInkMist{0%{transform:translate3d(-2%,1%,0) scale(1)}100%{transform:translate3d(2%,-2%,0) scale(1.06)}}',
        'html[data-dsh-suoming] .dsh-suoming-scene,html[data-dsh-suoming] .dsh-suoming-scene *{pointer-events:none}',
        /* 三档：只改装饰强度，不改 DOM / 布局 */
        'html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-l1{transform:none;transition:none}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-l1-fog,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-l3-rotate,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-l3-breathe,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-umbrella-sector,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-umbrella-rib,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-umbrella-rim,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-umbrella-hinge,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-chain-flow-a,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-chain-flow-b,html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-electro-arc{animation:none;opacity:.18}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-l1-far{opacity:.38}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="immersive"] .dsh-suoming-l1-fog{opacity:.82}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="immersive"] .dsh-suoming-l3-rotate{opacity:.3}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="immersive"] .dsh-suoming-l3-chain{opacity:.5}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="immersive"] .dsh-suoming-character{opacity:var(--dsh-portrait-opacity,.74)}',
        'html[data-dsh-suoming][data-dsh-suoming-intensity="minimal"] .dsh-suoming-character{opacity:var(--dsh-portrait-opacity,.42)}',
        /* 台词气泡：发丝线框 + 半透明底，最高只到 L3 之上、宿主输入区之下 */
        'html[data-dsh-suoming] .dsh-suoming-dialogue,html[data-dsh-suoming] .dsh-suoming-quote{display:none}',
                'html[data-dsh-suoming] .dsh-suoming-dialogue{position:absolute;right:24px;top:22vh;z-index:6;max-width:260px;padding:10px 14px;border:1px solid rgba(182,162,137,.48);border-radius:3px;background:rgba(13,12,14,.58);color:#e9dfd5;font-size:13px;line-height:1.65;letter-spacing:.02em;pointer-events:none;opacity:0;transform:translate3d(0,4px,0);transition:opacity 300ms cubic-bezier(.4,0,.2,1),transform 300ms cubic-bezier(.4,0,.2,1);overflow-wrap:anywhere}',
        'html[data-dsh-suoming] .dsh-suoming-dialogue[data-visible="true"]{opacity:1;transform:translate3d(0,0,0);transition-duration:220ms}',
        'html[data-dsh-suoming] .dsh-suoming-dialogue::before{content:"";position:absolute;left:-2px;top:-2px;width:4px;height:4px;border-left:1px solid rgba(206,191,176,.7);border-top:1px solid rgba(206,191,176,.7)}',
        'html[data-dsh-suoming] .dsh-suoming-dialogue::after{content:"";position:absolute;right:-2px;bottom:-2px;width:4px;height:4px;border-right:1px solid rgba(206,191,176,.7);border-bottom:1px solid rgba(206,191,176,.7)}',
        'html[data-dsh-suoming][data-dsh-portrait="off"] .dsh-suoming-l2{display:none}',
        'html[data-dsh-suoming-paused] .dsh-suoming-l0-up,html[data-dsh-suoming-paused] .dsh-suoming-l0-breath,html[data-dsh-suoming-paused] .dsh-suoming-l0-ink,html[data-dsh-suoming-paused] .dsh-suoming-l1-fog,html[data-dsh-suoming-paused] .dsh-suoming-l2-breath,html[data-dsh-suoming-paused] .dsh-suoming-l3-rotate,html[data-dsh-suoming-paused] .dsh-suoming-l3-breathe,html[data-dsh-suoming-paused] .dsh-suoming-umbrella-sector,html[data-dsh-suoming-paused] .dsh-suoming-umbrella-rib,html[data-dsh-suoming-paused] .dsh-suoming-umbrella-rim,html[data-dsh-suoming-paused] .dsh-suoming-umbrella-hinge,html[data-dsh-suoming-paused] .dsh-chain-flow-a,html[data-dsh-suoming-paused] .dsh-chain-flow-b,html[data-dsh-suoming-paused] .dsh-electro-arc{animation-play-state:paused}',
        '@media (max-width:1200px){html[data-dsh-suoming] .dsh-suoming-l2{display:none}}',
        '@media (max-width:1280px){html[data-dsh-suoming] .dsh-suoming-dialogue{display:none}}',
        '@media (max-width:1100px){html[data-dsh-suoming] .dsh-suoming-l3{display:none}}',
        '@media (max-width:900px){html[data-dsh-suoming] .dsh-suoming-l2,html[data-dsh-suoming] .dsh-suoming-l3{display:none}html[data-dsh-suoming] .dsh-suoming-l1{transform:none;transition:none}html[data-dsh-suoming] .dsh-suoming-l1-fog{animation:none}}',
        '@media (prefers-reduced-motion:reduce){html[data-dsh-suoming] .dsh-suoming-global-image,html[data-dsh-suoming] .dsh-suoming-global-chain,html[data-dsh-suoming] .dsh-suoming-character-image,html[data-dsh-suoming] .dsh-suoming-l0-up,html[data-dsh-suoming] .dsh-suoming-l0-breath,html[data-dsh-suoming] .dsh-suoming-l0-ink,html[data-dsh-suoming] .dsh-suoming-l1-fog,html[data-dsh-suoming] .dsh-suoming-l2-breath,html[data-dsh-suoming] .dsh-suoming-l2-state,html[data-dsh-suoming] .dsh-suoming-l3-rotate,html[data-dsh-suoming] .dsh-suoming-l3-breathe,html[data-dsh-suoming] .dsh-suoming-l3-chain,html[data-dsh-suoming] .dsh-suoming-umbrella-sector,html[data-dsh-suoming] .dsh-suoming-umbrella-rib,html[data-dsh-suoming] .dsh-suoming-umbrella-rim,html[data-dsh-suoming] .dsh-suoming-umbrella-hinge,html[data-dsh-suoming] .dsh-chain-flow-a,html[data-dsh-suoming] .dsh-chain-flow-b,html[data-dsh-suoming] .dsh-electro-arc{animation:none;transition:none;transform:none}html[data-dsh-suoming] .dsh-suoming-scene[data-state="hover"] .dsh-suoming-l2-state,html[data-dsh-suoming] .dsh-suoming-scene[data-state="thinking"] .dsh-suoming-l2-state,html[data-dsh-suoming] .dsh-suoming-scene[data-state="generating"] .dsh-suoming-l2-state,html[data-dsh-suoming] .dsh-suoming-scene[data-state="error"] .dsh-suoming-l2-state{transform:none}html[data-dsh-suoming] .dsh-suoming-dialogue,html[data-dsh-suoming] .dsh-suoming-dialogue[data-visible="true"]{transition:opacity 120ms linear;transform:none}}',
        /* 安全兜底（必须放在最后）：主题属性一旦丢失，插件注入的图层必须整体隐藏。
         * 否则裸 <img> 会以原图尺寸（官方长立绘可达 2160×3840）铺满整个屏幕，
         * 表现为"停留一段时间后整屏被一张长图盖住"，且只能重启 DSH 恢复。 */
        'html:not([data-dsh-suoming]) .dsh-suoming-scene-host,',
        'html:not([data-dsh-suoming]) .dsh-suoming-right-art,',
        'html:not([data-dsh-suoming]) .dsh-suoming-side-art,',
        'html:not([data-dsh-suoming]) .dsh-suoming-global,',
        'html:not([data-dsh-suoming]) .dsh-suoming-ambient,',
        'html:not([data-dsh-suoming]) .dsh-suoming-corner-lock,',
        'html:not([data-dsh-suoming]) .dsh-suoming-pulse,',
        'html:not([data-dsh-suoming]) .dsh-suoming-dialogue{display:none}',
      ].join('\n');
    }

    const CSS = buildCSS() + '\n' + buildTokenCSS() + '\n' + buildSkinCSS();
    const STYLE_KEY = PKG + '/suoming.css';

    function installStyles(ctx) {
      ctx.effect(() => {
        if (typeof document === 'undefined') return undefined;
        const tag = document.createElement('style');
        tag.dataset.plugin = PKG;
        tag.dataset.pluginCss = STYLE_KEY;
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'suoming: theme stylesheet');
    }

    /* ===== 第四批：液态玻璃的 SVG 折射滤镜与指针高光 ===== */
    function installGlassFilter(ctx) {
      ctx.effect(() => {
        if (typeof document === 'undefined' || !document.body || typeof document.createElementNS !== 'function') {
          return undefined;
        }
        const edgeMask =
          '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
          '<defs><radialGradient id="dsh-suoming-edge-grad" cx="50%" cy="50%" r="50%">' +
          '<stop offset="86%" stop-color="#000"/><stop offset="93%" stop-color="#fff"/><stop offset="100%" stop-color="#fff"/>' +
          '</radialGradient></defs>' +
          '<rect width="200" height="200" fill="url(#dsh-suoming-edge-grad)"/></svg>';
        const edgeMaskUri = 'data:image/svg+xml,' + encodeURIComponent(edgeMask);
        const filter =
          '<filter id="dsh-suoming-glass-refraction" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">' +
          '<feTurbulence type="fractalNoise" baseFrequency="0.028 0.042" numOctaves="2" seed="11" result="noise"/>' +
          '<feGaussianBlur in="noise" stdDeviation="1.3" result="softNoise"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="softNoise" scale="10" xChannelSelector="R" yChannelSelector="G" result="warped"/>' +
          '<feImage href="' + edgeMaskUri + '" result="edgeMask"/>' +
          '<feComposite in="warped" in2="edgeMask" operator="in" result="edgeWarped"/>' +
          '<feComposite in="SourceGraphic" in2="edgeWarped" operator="over"/>' +
          '</filter>';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
        svg.innerHTML = '<defs>' + filter + '</defs>';
        document.body.appendChild(svg);
        return () => svg.remove();
      }, 'suoming: glass refraction filter');
    }

    function installGlassPointer(ctx) {
      ctx.effect(() => {
        if (typeof document === 'undefined' || typeof window === 'undefined') return undefined;
        if (typeof document.addEventListener !== 'function') return undefined;
        const reduced =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return undefined;
        let current = null;
        const reset = (card) => {
          if (!card) return;
          card.style.setProperty('--dsh-pointer-o', '0');
          card.style.removeProperty('--dsh-pointer-x');
          card.style.removeProperty('--dsh-pointer-y');
        };
        const onMove = (event) => {
          const target = event.target;
          const card =
            target && typeof target.closest === 'function' ? target.closest('[data-composer-card]') : null;
          if (!card) {
            if (current) {
              reset(current);
              current = null;
            }
            return;
          }
          if (current && current !== card) reset(current);
          const rect = card.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--dsh-pointer-x', x.toFixed(2) + '%');
          card.style.setProperty('--dsh-pointer-y', y.toFixed(2) + '%');
          card.style.setProperty('--dsh-pointer-o', '0.16');
          current = card;
        };
        const onBlur = () => {
          if (current) {
            reset(current);
            current = null;
          }
        };
        document.addEventListener('pointermove', onMove, { passive: true });
        if (typeof window.addEventListener === 'function') window.addEventListener('blur', onBlur);
        return () => {
          document.removeEventListener('pointermove', onMove);
          if (typeof window.removeEventListener === 'function') window.removeEventListener('blur', onBlur);
          if (current) reset(current);
        };
      }, 'suoming: glass pointer highlight');
    }

    /* ===== 第五批 A：页面隐藏时暂停墨晕动画 ===== */
    function installMotionPause(ctx) {
      ctx.effect(() => {
        if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return undefined;
        const root = document.documentElement;
        if (!root) return undefined;
        const sync = () => {
          if (document.hidden) root.setAttribute('data-dsh-suoming-paused', '');
          else root.removeAttribute('data-dsh-suoming-paused');
        };
        document.addEventListener('visibilitychange', sync);
        sync();
        return () => {
          document.removeEventListener('visibilitychange', sync);
          root.removeAttribute('data-dsh-suoming-paused');
        };
      }, 'suoming: pause ink motion when hidden');
    }

    /* ===== 本轮：场景配置、四层背景、立绘、状态机、台词 ===== */
    const SCENE_TEMPLATE =
      '<div class="dsh-suoming-scene" data-state="idle">' +
      '<div class="dsh-suoming-l0"><div class="dsh-suoming-l0-paint"><div class="dsh-suoming-l0-up"><div class="dsh-suoming-l0-breath"></div>' + INK_WASH_SVG + '</div></div></div>' +
      '<div class="dsh-suoming-l1"><div class="dsh-suoming-l1-far"></div><div class="dsh-suoming-l1-fog"></div><div class="dsh-suoming-l1-rain"></div></div>' +
      '<div class="dsh-suoming-l2"><div class="dsh-suoming-l2-glow"></div><div class="dsh-suoming-l2-breath"><div class="dsh-suoming-l2-state"><div class="dsh-suoming-character"><img class="dsh-suoming-character-image" src="/suoming-local-art/char.jpg" alt="" decoding="async" draggable="false"/><div class="dsh-suoming-character-figure"></div><div class="dsh-suoming-character-ribbons"></div>' + UMBRELLA_SVG + '<div class="dsh-suoming-character-lock"></div></div></div></div></div>' +
      '<div class="dsh-suoming-l3"><div class="dsh-suoming-l3-rotate"></div><div class="dsh-suoming-l3-breathe"></div><div class="dsh-suoming-l3-chain">' + CHAIN_DYNAMIC_SVG + '</div><div class="dsh-suoming-l3-spark"></div></div>' +
      '<div class="dsh-suoming-dialogue" role="status" aria-live="polite"></div>' +
      '</div>';

    /* 全页面固定立绘层：设置、插件等非对话页面也能看到同一人物与动效。 */
    const GLOBAL_TEMPLATE =
      '<div class="dsh-suoming-global" aria-hidden="true"><div class="dsh-suoming-global-halo"></div><div class="dsh-suoming-global-chain">' + CHAIN_DYNAMIC_SVG + '</div><div class="dsh-suoming-global-portrait"><img class="dsh-suoming-global-image" src="/suoming-local-art/char.jpg" alt="" decoding="async" draggable="false"/></div><div class="dsh-suoming-global-secondary"><img src="/suoming-local-art/char.jpg" alt="" decoding="async" draggable="false"/></div></div>';

    function createSceneStore(initial) {
      let config = normalizeSceneConfig(initial);
      const listeners = new Set();
      return {
        get: () => config,
        set(next) {
          config = normalizeSceneConfig({ ...config, ...next });
          listeners.forEach((listener) => listener());
          return config;
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    }

    function readStoredSceneConfig() {
      try {
        const cookie = document.cookie.match(new RegExp('(?:^|;\\s*)' + SCENE_COOKIE + '=([^;]+)'));
        if (cookie) return normalizeSceneConfig(JSON.parse(decodeURIComponent(cookie[1])));
      } catch {
        /* cookie unavailable */
      }
      try {
        const raw = window.localStorage.getItem(SCENE_STORAGE_KEY);
        if (raw) return normalizeSceneConfig(JSON.parse(raw));
      } catch {
        /* storage unavailable */
      }
      return normalizeSceneConfig({});
    }

    function applySceneConfig(config) {
      if (typeof document === 'undefined' || !document.documentElement) return;
      const root = document.documentElement;
      if (!root.style || typeof root.style.setProperty !== 'function') return;
      root.style.setProperty('--dsh-portrait-height', config.portraitHeight + 'vh');
      root.style.setProperty('--dsh-portrait-offset-x', config.portraitOffsetX + 'px');
      root.style.setProperty('--dsh-portrait-opacity', String(config.portraitOpacity));
      root.setAttribute(SCENE_INTENSITY_ATTR, config.intensity);
      root.setAttribute('data-dsh-portrait', config.portraitEnabled ? 'on' : 'off');
    }

    function clearSceneConfig() {
      if (typeof document === 'undefined' || !document.documentElement) return;
      const root = document.documentElement;
      if (root.style && typeof root.style.removeProperty === 'function') {
        root.style.removeProperty('--dsh-portrait-height');
        root.style.removeProperty('--dsh-portrait-offset-x');
        root.style.removeProperty('--dsh-portrait-opacity');
      }
      root.removeAttribute(SCENE_INTENSITY_ATTR);
      root.removeAttribute('data-dsh-portrait');
    }

    function persistSceneConfig(config) {
      try {
        document.cookie =
          SCENE_COOKIE + '=' + encodeURIComponent(JSON.stringify(config)) + '; path=/; max-age=31536000; SameSite=Lax';
      } catch {
        /* cookie unavailable */
      }
      try {
        window.localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify(config));
      } catch {
        /* storage unavailable */
      }
    }

    function createSceneController(store) {
      let mounted = false;
      let scene = null;
      let host = null;
      let globalLayer = null;
      let sideArt = null;
      let rightArt = null;
      let retryTimer = null;
      let retryCount = 0;
      let observer = null;
      let observerTimer = null;
      let saveTimer = null;
      let completionTimer = null;
      let stateTimer = null;
      let dialogueTimer = null;
      let idleTimer = null;
      let lastClickAt = 0;
      let lastDialogueAt = 0;
      let hovered = false;
      let observedRunning = false;
      let runToken = 0;
      let blurred = false;
      let reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      let persistAvailable = true;
      let sceneState = 'idle';

      const canParallax = () => {
        if (!mounted || reduced || blurred || document.hidden) return false;
        if (store.get().intensity === 'minimal') return false;
        if (window.innerWidth <= 900) return false;
        if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) return false;
        return true;
      };
      const themeActive = () => document.documentElement.hasAttribute('data-dsh-suoming');
      const setVar = (name, value) => {
        if (scene) scene.style.setProperty(name, value);
      };
      const resetParallax = () => {
        ['--dsh-l1-x','--dsh-l1-y','--dsh-l2-x','--dsh-l2-y','--dsh-l3-x','--dsh-l3-y','--dsh-chain-x','--dsh-chain-y'].forEach((name) => setVar(name, '0px'));
      };
      const detect = () => {
        const running = AI_RUNNING_SELECTORS.some((selector) => {
          try { return document.querySelector(selector) !== null; } catch { return false; }
        });
        const generating = AI_STREAMING_SELECTORS.some((selector) => {
          try { return document.querySelector(selector) !== null; } catch { return false; }
        });
        const error = AI_ERROR_SELECTORS.some((selector) => {
          try { return document.querySelector(selector) !== null; } catch { return false; }
        });
        return { running, generating, error };
      };
      const setSceneState = (next) => {
        if (!scene || !next) return;
        if (sceneState === 'paused' && next !== 'paused' && document.hidden) return;
        sceneState = next;
        scene.setAttribute('data-state', next);
      };
      const clearTimer = (name) => {
        if (name === 'state' && stateTimer) { clearTimeout(stateTimer); stateTimer = null; }
        if (name === 'completion' && completionTimer) { clearTimeout(completionTimer); completionTimer = null; }
        if (name === 'dialogue' && dialogueTimer) { clearTimeout(dialogueTimer); dialogueTimer = null; }
        if (name === 'idle' && idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      };
      const showDialogue = (category) => {
        if (!scene || !store.get().dialogueEnabled || document.hidden || blurred) return;
        const bubble = scene.querySelector('.dsh-suoming-dialogue');
        if (!bubble) return;
        bubble.textContent = pickDialogue(category);
        bubble.setAttribute('data-visible', 'true');
        lastDialogueAt = Date.now();
        clearTimer('dialogue');
        dialogueTimer = setTimeout(() => {
          if (!bubble.isConnected) return;
          bubble.setAttribute('data-visible', 'false');
          dialogueTimer = null;
        }, 2500);
      };
      const hideDialogue = () => {
        clearTimer('dialogue');
        if (scene) {
          const bubble = scene.querySelector('.dsh-suoming-dialogue');
          if (bubble) bubble.setAttribute('data-visible', 'false');
        }
      };
      const afterInteraction = () => {
        clearTimer('state');
        stateTimer = setTimeout(() => {
          stateTimer = null;
          if (sceneState === 'click' || sceneState === 'hover') setSceneState(hovered ? 'hover' : 'idle');
        }, sceneState === 'click' ? 180 : 220);
      };
      const transitionAi = (info, first) => {
        if (info.running) {
          clearTimer('completion');
          if (!observedRunning) {
            observedRunning = true;
            runToken += 1;
            setSceneState(info.generating ? 'generating' : 'thinking');
          } else if (info.generating && sceneState === 'thinking') {
            setSceneState('generating');
          }
          return;
        }
        if (!observedRunning) return;
        observedRunning = false;
        const token = runToken;
        clearTimer('completion');
        completionTimer = setTimeout(() => {
          completionTimer = null;
          if (document.hidden || sceneState === 'paused') return;
          if (detect().running) return;
          const latest = detect();
          if (latest.error) {
            setSceneState('error');
            if (token === runToken) showDialogue('error');
          } else {
            setSceneState('success');
            if (token === runToken) showDialogue('success');
          }
          clearTimer('state');
          stateTimer = setTimeout(() => {
            stateTimer = null;
            if (sceneState === 'success' || sceneState === 'error') setSceneState(hovered ? 'hover' : 'idle');
          }, 2500);
        }, first ? 300 : 650);
      };
      const scheduleIdle = () => {
        clearTimer('idle');
        if (sceneState === 'paused') return;
        const delay = 35_000 + Math.round(Math.random() * 35_000);
        idleTimer = setTimeout(() => {
          idleTimer = null;
          if (document.hidden || blurred || !themeActive() || !store.get().dialogueEnabled) return scheduleIdle();
          if (sceneState === 'idle' && Date.now() - lastDialogueAt >= 30_000) showDialogue('idle');
          scheduleIdle();
        }, delay);
      };
      let cornerLock = null;
      let ambient = null;
      const ensureCornerLock = () => {
        if (!mounted || !document.body || (cornerLock && cornerLock.isConnected)) return;
        const holder = document.createElement('div');
        holder.innerHTML = '<div class="dsh-suoming-corner-lock" aria-hidden="true"></div>';
        cornerLock = holder.firstElementChild;
        if (cornerLock) document.body.appendChild(cornerLock);
      };

      const ensureAmbient = () => {
        if (!mounted || !document.body || (ambient && ambient.isConnected)) return;
        const holder = document.createElement('div');
        holder.innerHTML = '<div class="dsh-suoming-ambient" aria-hidden="true"><div class="dsh-suoming-ambient-ink">' + INK_WASH_SVG + '</div><div class="dsh-suoming-ambient-umbrella">' + UMBRELLA_SVG + '</div></div>';
        ambient = holder.firstElementChild;
        if (ambient) document.body.insertBefore(ambient, document.body.firstChild);
      };

      const ensureRightArt = () => {
        if (!mounted || rightArt?.isConnected) return;
        const hostMount = document.body;
        if (!hostMount) return;
        const holder = document.createElement('div');
        holder.innerHTML = '<div class="dsh-suoming-right-art" aria-hidden="true"><img src="/suoming-local-art/char.jpg?v=6" alt="" decoding="async" draggable="false"/></div>';
        rightArt = holder.firstElementChild;
        if (!rightArt) return;
        hostMount.insertBefore(rightArt, hostMount.firstChild);
        const image = rightArt.querySelector('img');
        if (image) image.addEventListener('error', () => { if (rightArt) rightArt.remove(); rightArt = null; }, { once: true });
      };

      const ensureSidebarArt = () => {
        if (!mounted || sideArt?.isConnected) return;
        const sidebar = document.querySelector('[data-slot="sidebar"] > div');
        if (!sidebar) return;
        const holder = document.createElement('div');
        holder.innerHTML = '<div class="dsh-suoming-side-art" aria-hidden="true"><img src="/suoming-local-art/char.png" alt="" decoding="async" draggable="false"/><div class="dsh-suoming-side-lock">' + XUANZHU_LOCK_SVG + '</div></div>';
        sideArt = holder.firstElementChild;
        if (!sideArt) return;
        sidebar.insertBefore(sideArt, sidebar.firstChild);
        const image = sideArt.querySelector('img');
        if (image) image.addEventListener('error', () => { if (sideArt) sideArt.remove(); sideArt = null; }, { once: true });
      };

      const ensureGlobalPortrait = () => {
        if (!mounted || !document.body) return;
        const mount = document.querySelector('.dsh-suoming-scene-host') || document.querySelector('div:has(> [data-slot="main"])') || document.body;
        if (globalLayer && !globalLayer.isConnected) { globalLayer = null; }
        if (globalLayer) {
          if (mount !== document.body && globalLayer.parentElement !== mount) mount.appendChild(globalLayer);
          return;
        }
        const holder = document.createElement('div');
        holder.innerHTML = GLOBAL_TEMPLATE;
        globalLayer = holder.firstElementChild;
        if (!globalLayer) return;
        mount.appendChild(globalLayer);
        document.documentElement.setAttribute('data-dsh-suoming-global', '');
        const image = globalLayer.querySelector('.dsh-suoming-global-image');
        if (image) {
          image.addEventListener('error', () => {
            if (globalLayer) globalLayer.remove();
            globalLayer = null;
            document.documentElement.removeAttribute('data-dsh-suoming-global');
          }, { once: true });
        }
      };
      const ensureScene = () => {
        ensureAmbient();
        ensureSidebarArt();
        ensureCornerLock();
        ensureRightArt();
        ensureGlobalPortrait();
        if (!mounted || scene?.isConnected) return;
        let candidate = document.querySelector('div:has(> [data-slot="main"])');
        if (!candidate) { const mainSlot = document.querySelector('[data-slot="main"]'); candidate = mainSlot && mainSlot.parentElement; }
        if (!candidate) {
          if (retryCount < 20) {
            retryCount += 1;
            retryTimer = setTimeout(ensureScene, 400);
          }
          return;
        }
        retryCount = 0;
        host = candidate;
        if (!scene) {
          const holder = document.createElement('div');
          holder.innerHTML = SCENE_TEMPLATE;
          scene = holder.firstElementChild;
        }
        if (!scene) return;
        host.classList.add('dsh-suoming-scene-host');
        host.style.backgroundColor = 'transparent';
        scene.style.zIndex = '-1';
        host.insertBefore(scene, host.firstChild);
        ensureRightArt();
        const portraitImage = scene.querySelector('.dsh-suoming-character-image');
        const portraitBox = scene.querySelector(SCENE_PORTRAIT_SELECTOR);
        if (portraitImage && portraitBox) {
          const markPortrait = () => { if (portraitImage.naturalWidth > 0) portraitBox.classList.add('has-portrait'); };
          markPortrait();
          portraitImage.addEventListener('load', markPortrait, { once: true });
          portraitImage.addEventListener('error', () => { portraitImage.remove(); portraitBox.classList.remove('has-portrait'); }, { once: true });
        }
        setSceneState(sceneState);
      };
      const attachObserver = () => {
        if (typeof MutationObserver !== 'function') return;
        if (!document.body) {
          retryTimer = setTimeout(attachObserver, 400);
          return;
        }
        observer = new MutationObserver(() => {
          clearTimeout(observerTimer);
          observerTimer = setTimeout(() => {
            observerTimer = null;
            if (!mounted) return;
            if (!scene?.isConnected) ensureScene();
            if (!document.hidden) transitionAi(detect(), false);
          }, 90);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-chat-running', 'data-streaming', 'data-error', 'data-state', 'aria-busy'],
        });
      };
      const loadConfig = () => {
        if (typeof fetch !== 'function') { persistAvailable = false; return; }
        fetch('/suoming-config', { cache: 'no-store' })
          .then((response) => (response.ok ? response.json() : null))
          .then((payload) => {
            if (!payload || !payload.settings) return;
            store.set(payload.settings);
            persistAvailable = payload.persistence === 'profile-file';
            ensureScene();
          })
          .catch(() => { persistAvailable = false; });
      };
      const saveConfig = (config) => {
        persistSceneConfig(config);
        if (!persistAvailable || typeof fetch !== 'function') return;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          saveTimer = null;
          fetch('/suoming-config', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(config),
          }).catch(() => { persistAvailable = false; });
        }, 320);
      };
      const onPointerMove = (event) => {
        if (!mounted || !scene || !themeActive()) return;
        const face = scene.querySelector(SCENE_PORTRAIT_SELECTOR);
        const rect = face ? face.getBoundingClientRect() : null;
        const near =
          rect && rect.width > 0
            ? Math.max(rect.left - event.clientX, 0, event.clientX - rect.right) <= 80 &&
              Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom) <= 80
            : false;
        if (event.pointerType !== 'touch' && themeActive()) {
          if (near && !hovered && (sceneState === 'idle' || sceneState === 'hover')) {
            hovered = true;
            setSceneState('hover');
            showDialogue('hover');
          } else if (!near && hovered) {
            hovered = false;
            if (sceneState === 'hover') setSceneState('idle');
          }
        }
        if (!canParallax()) return;
        const dx = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1));
        const dy = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
        setVar('--dsh-l1-x', (dx * 2.5).toFixed(2) + 'px');
        setVar('--dsh-l1-y', (dy * 1.5).toFixed(2) + 'px');
        setVar('--dsh-l2-x', (dx * 11).toFixed(2) + 'px');
        setVar('--dsh-l2-y', (dy * 7).toFixed(2) + 'px');
        setVar('--dsh-l3-x', (dx * 5).toFixed(2) + 'px');
        setVar('--dsh-l3-y', (dy * 3).toFixed(2) + 'px');
        setVar('--dsh-chain-x', (Math.max(-4, Math.min(4, dx * 4))).toFixed(2) + 'px');
        setVar('--dsh-chain-y', (Math.max(-4, Math.min(4, dy * 3))).toFixed(2) + 'px');
      };
      const onPointerLeave = () => {
        hovered = false;
        if (sceneState === 'hover') setSceneState('idle');
        resetParallax();
      };
      const onClick = (event) => {
        if (!mounted || !scene || !themeActive() || document.hidden) return;
        if (sceneState !== 'idle' && sceneState !== 'hover') return;
        const target = event.target;
        if (target && typeof target.closest === 'function' && target.closest(SELECTOR_INTERACTIVE)) return;
        const face = scene.querySelector(SCENE_PORTRAIT_SELECTOR);
        const rect = face ? face.getBoundingClientRect() : null;
        if (!rect || rect.width <= 0) return;
        const hit =
          event.clientX >= rect.left - 24 && event.clientX <= rect.right + 24 &&
          event.clientY >= rect.top - 24 && event.clientY <= rect.bottom + 24;
        if (!hit || Date.now() - lastClickAt < 5000) return;
        lastClickAt = Date.now();
        setSceneState('click');
        showDialogue('click');
        clearTimer('state');
        afterInteraction();
      };
      const onVisibility = () => {
        if (document.hidden) {
          setSceneState('paused');
          hideDialogue();
          resetParallax();
          clearTimer('completion'); clearTimer('state'); clearTimer('idle');
        } else {
          setSceneState('idle');
          transitionAi(detect(), false);
          scheduleIdle();
        }
      };
      const onBlur = () => {
        blurred = true;
        hovered = false;
        resetParallax();
        if (document.documentElement) document.documentElement.setAttribute('data-dsh-suoming-paused', '');
        if (sceneState !== 'paused') setSceneState('paused');
        hideDialogue();
      };
      const onFocus = () => {
        blurred = false;
        if (!document.hidden && document.documentElement) document.documentElement.removeAttribute('data-dsh-suoming-paused');
        setSceneState('idle');
        transitionAi(detect(), false);
        scheduleIdle();
      };
      const onMedia = () => {
        reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) resetParallax();
      };
      const unsubscribe = store.subscribe(() => {
        const config = store.get();
        applySceneConfig(config);
        if (!config.portraitEnabled) hovered = false;
        saveConfig(config);
      });
      const controller = {
        mount() {
          if (mounted) return controller;
          mounted = true;
          applySceneConfig(store.get());
          ensureScene();
          loadConfig();
          attachObserver();
          document.addEventListener('pointermove', onPointerMove, { passive: true });
          document.addEventListener('mouseleave', onPointerLeave);
          document.addEventListener('click', onClick);
          document.addEventListener('visibilitychange', onVisibility);
          window.addEventListener('blur', onBlur);
          window.addEventListener('focus', onFocus);
          if (typeof window.matchMedia === 'function') {
            const media = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (typeof media.addEventListener === 'function') media.addEventListener('change', onMedia);
            else if (typeof media.addListener === 'function') media.addListener(onMedia);
            controller._media = media;
          }
          transitionAi(detect(), true);
          scheduleIdle();
          return controller;
        },
        destroy() {
          mounted = false;
          unsubscribe();
          clearTimer('completion'); clearTimer('state'); clearTimer('dialogue'); clearTimer('idle');
          clearTimeout(retryTimer); clearTimeout(observerTimer); clearTimeout(saveTimer);
          if (observer) observer.disconnect();
          observer = null;
          if (typeof document !== 'undefined') {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('mouseleave', onPointerLeave);
            document.removeEventListener('click', onClick);
            document.removeEventListener('visibilitychange', onVisibility);
          }
          if (typeof window !== 'undefined') {
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
            const media = controller._media;
            if (media) {
              if (typeof media.removeEventListener === 'function') media.removeEventListener('change', onMedia);
              else if (typeof media.removeListener === 'function') media.removeListener(onMedia);
            }
          }
          if (host) host.classList.remove('dsh-suoming-scene-host');
          if (scene) scene.remove();
          if (globalLayer) globalLayer.remove();
          globalLayer = null;
          if (sideArt) sideArt.remove();
          sideArt = null;
          if (rightArt) rightArt.remove();
          rightArt = null;
          if (typeof document !== 'undefined' && document.documentElement) document.documentElement.removeAttribute('data-dsh-suoming-global');
          scene = null;
          host = null;
          clearSceneConfig();
        },
        setConfig(patch) {
          const next = store.set(patch);
          saveConfig(next);
          return next;
        },
        getState() { return sceneState; },
        __testing: { detect, pickDialogue, normalizeSceneConfig },
      };
      return controller;
    }

    /**
     * 读取「是否启用锁暝主题」。
     *
     * DSH Desktop 每次启动的 127.0.0.1 端口可能不同，而 localStorage 按
     * origin（含端口）隔离，会导致重启后读不到上次的选择；cookie 只按 host
     * 隔离，端口变化仍可读。因此 cookie 为主存储，localStorage 兼容旧版本。
     * 没有记录时默认 true：插件启用即套用主题；用户点「恢复默认外观」会把
     * 0 写入 cookie，之后重启不再覆盖。
     */
    function readPreference() {
      try {
        const matched = document.cookie.match(/(?:^|;\s*)dsh_suoming_theme=(0|1)/);
        if (matched !== null) return matched[1] === '1';
      } catch {
        /* document.cookie 不可用时继续兜底 */
      }
      try {
        const legacy = window.localStorage.getItem(PREF_STORAGE_KEY);
        if (legacy === '1') return true;
        if (legacy === '0') return false;
        if (window.localStorage.getItem(PREF_STORAGE_DISABLED_KEY) === '1') return false;
      } catch {
        /* 存储不可用时使用默认值 */
      }
      return true;
    }

    function writePreference(enabled) {
      const value = enabled ? '1' : '0';
      try {
        document.cookie = `${PREF_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        /* cookie 不可用时仅本会话生效 */
      }
      try {
        window.localStorage.setItem(PREF_STORAGE_KEY, value);
        if (enabled) window.localStorage.removeItem(PREF_STORAGE_DISABLED_KEY);
        else window.localStorage.setItem(PREF_STORAGE_DISABLED_KEY, '1');
      } catch {
        /* localStorage 不可用时仅本会话生效 */
      }
    }

    function isBuiltin(preference) {
      return preference === 'light' || preference === 'dark' || preference === 'system';
    }

    function isActiveSnapshot(snapshot) {
      return snapshot.preference === THEME_ID;
    }

    function isActive(theme) {
      return isActiveSnapshot(theme.getTheme());
    }

    /**
     * 组件订阅的小型外部 store：主题快照或语言变化时通知重渲染。
     * 只保留 revision 计数，组件通过 face.theme()/face.t() 读取最新值。
     */
    function createFace(ctx) {
      const t = ctx.locale.bind(NS);
      let revision = 0;
      const bootAt = Date.now();
      let enabled = readPreference();
      const listeners = new Set();
      const emit = () => {
        revision += 1;
        for (const listener of [...listeners]) {
          try {
            listener(revision);
          } catch {
            /* 单个订阅者异常不影响其他订阅者 */
          }
        }
      };
      const face = {
        get: () => revision,
        bootAt,
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        theme: () => ctx.theme.getTheme(),
        t: (key) => t(key),
        enabled: () => enabled,
        setEnabled(value) {
          enabled = value === true;
          writePreference(enabled);
          emit();
        },
        lastBuiltin: isBuiltin(ctx.theme.getTheme().preference) ? ctx.theme.getTheme().preference : 'system',
      };
      ctx.effect(() => {
        const offTheme = ctx.on('theme/change', (snapshot) => {
          if (isBuiltin(snapshot.preference)) {
            face.lastBuiltin = snapshot.preference;
            /* 启动窗口之外用户主动切回原生主题：记住关闭，避免下次启动又覆盖 */
            if (enabled && Date.now() - bootAt > BOOT_WINDOW_MS) {
              enabled = false;
              writePreference(false);
            }
          }
          emit();
        });
        const offLocale = ctx.locale.subscribe(emit);
        return () => {
          if (typeof offTheme === 'function') offTheme();
          if (typeof offLocale === 'function') offLocale();
        };
      }, 'suoming: theme store subscriptions');
      return face;
    }

    function useFace(face) {
      const [revision, setRevision] = React.useState(face.get());
      React.useEffect(() => face.subscribe(setRevision), [face]);
      return revision;
    }

    /* ---------------------------------------------------------------- *
     * 设置行：选择 / 取消锁暝主题
     * ---------------------------------------------------------------- */
    function createThemeRow(face, ctx, sceneStore, sceneController) {
      const enable = () => {
        const snapshot = face.theme();
        if (isBuiltin(snapshot.preference)) face.lastBuiltin = snapshot.preference;
        face.setEnabled(true);
        ctx.theme.setTheme(THEME_ID);
      };
      const disable = () => {
        const target = isBuiltin(face.lastBuiltin) ? face.lastBuiltin : 'system';
        face.setEnabled(false);
        ctx.theme.setTheme(target);
      };
      function ThemeRow() {
        useFace(face);
        const scene = React.useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);
        const active = isActiveSnapshot(face.theme());
        const setScene = (patch) => sceneController.setConfig(patch);
        const toggle = () => {
          if (isActiveSnapshot(face.theme())) disable();
          else enable();
        };
        return h(
          'div',
          { className: 'dsh-suoming-row' },
          h(
            'div',
            { className: 'dsh-suoming-rowHead' },
            h('div', { className: 'dsh-suoming-rowTitle' }, face.t('row.title')),
            h('div', { className: 'dsh-suoming-rowDesc' }, face.t('row.desc')),
          ),
          h(
            'div',
            { className: 'dsh-suoming-cubes' },
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-suoming-cube' + (active ? ' is-selected' : ''),
                'aria-pressed': active,
                title: face.t('cube.hint'),
                onClick: toggle,
              },
              h(
                'span',
                { className: 'dsh-suoming-swatches', 'aria-hidden': 'true' },
                h('span', { className: 'dsh-suoming-swatch', style: { background: P.inkBright } }),
                h('span', { className: 'dsh-suoming-swatch', style: { background: P.bgBase } }),
                h('span', { className: 'dsh-suoming-swatch', style: { background: P.gold } }),
              ),
              h('span', { className: 'dsh-suoming-cubeLabel' }, face.t('cube.label')),
              h('span', { className: 'dsh-suoming-cubeState' }, active ? face.t('cube.on') : face.t('cube.off')),
            ),
            active
              ? h(
                  'button',
                  { type: 'button', className: 'dsh-suoming-reset', onClick: disable },
                  face.t('cube.reset'),
                )
              : null,
          ),
          active
            ? h(
                'div',
                { className: 'dsh-suoming-sceneControls' },
                h(
                  'label',
                  { className: 'dsh-suoming-sceneField' },
                  h('span', {}, face.t('scene.height') + ' · ' + scene.portraitHeight + 'vh'),
                  h('input', {
                    type: 'range',
                    min: 30,
                    max: 80,
                    step: 1,
                    value: scene.portraitHeight,
                    'aria-label': face.t('scene.height'),
                    onInput: (event) => setScene({ portraitHeight: Number(event.currentTarget.value) }),
                  }),
                ),
                h(
                  'label',
                  { className: 'dsh-suoming-sceneField' },
                  h('span', {}, face.t('scene.offset') + ' · ' + scene.portraitOffsetX + 'px'),
                  h('input', {
                    type: 'range',
                    min: -50,
                    max: 50,
                    step: 1,
                    value: scene.portraitOffsetX,
                    'aria-label': face.t('scene.offset'),
                    onInput: (event) => setScene({ portraitOffsetX: Number(event.currentTarget.value) }),
                  }),
                ),
                h(
                  'label',
                  { className: 'dsh-suoming-sceneField' },
                  h('span', {}, face.t('scene.opacity') + ' · ' + Math.round(scene.portraitOpacity * 100) + '%'),
                  h('input', {
                    type: 'range',
                    min: 20,
                    max: 100,
                    step: 1,
                    value: Math.round(scene.portraitOpacity * 100),
                    'aria-label': face.t('scene.opacity'),
                    onInput: (event) => setScene({ portraitOpacity: Number(event.currentTarget.value) / 100 }),
                  }),
                ),
                h(
                  'label',
                  { className: 'dsh-suoming-sceneField dsh-suoming-sceneToggle' },
                  h('span', {}, face.t('scene.visible')),
                  h('input', {
                    type: 'checkbox',
                    checked: scene.portraitEnabled,
                    'aria-label': face.t('scene.visible'),
                    onChange: (event) => setScene({ portraitEnabled: event.currentTarget.checked }),
                  }),
                ),
                h(
                  'label',
                  { className: 'dsh-suoming-sceneField' },
                  h('span', {}, face.t('scene.intensity')),
                  h(
                    'select',
                    {
                      value: scene.intensity,
                      'aria-label': face.t('scene.intensity'),
                      onChange: (event) => setScene({ intensity: event.currentTarget.value }),
                    },
                    h('option', { value: 'minimal' }, face.t('scene.minimal')),
                    h('option', { value: 'balanced' }, face.t('scene.balanced')),
                    h('option', { value: 'immersive' }, face.t('scene.immersive')),
                  ),
                ),
                h('div', { className: 'dsh-suoming-note' }, face.t('scene.note')),
              )
            : null,
          h('div', { className: 'dsh-suoming-note' }, face.t('row.note')),
        );
      }
      return ThemeRow;
    }

    /* ---------------------------------------------------------------- *
     * 新会话欢迎区台词：只在“空白会话 + 主题启用”时出现
     * ---------------------------------------------------------------- */
    function createQuoteLine(face) {
      function QuoteLine(props) {
        useFace(face);
        const ownerSession = props && props.session;
        const useSession = props && props.useSession;
        /* 标准 props 恒含 useSession；显式无条件调用以保持 hook 顺序稳定 */
        const hookBlank =
          typeof useSession === 'function' ? !!useSession((session) => !!(session && session.blank)) : false;
        const blank = ownerSession !== undefined ? !!(ownerSession && ownerSession.blank) : hookBlank;
        if (!blank || !isActiveSnapshot(face.theme())) return null;
        const rule = h('span', { className: 'dsh-suoming-quoteRule', 'aria-hidden': 'true' });
        return h(
          'div',
          { className: 'dsh-suoming-quote', role: 'note', 'aria-label': face.t('quote.aria') },
          rule,
          h('span', { className: 'dsh-suoming-quoteText' }, face.t('quote.text')),
          h('span', { className: 'dsh-suoming-quoteBy' }, face.t('quote.by')),
          rule,
        );
      }
      return QuoteLine;
    }

    /* ---------------------------------------------------------------- *
     * 启用状态 → <html>/<body data-dsh-suoming>
     * 该属性同时驱动装饰 CSS 与 buildTokenCSS() 的兜底令牌覆盖，
     * 因此即使主题服务的 presenter 没有把令牌写进 body，配色仍会生效。
     * ---------------------------------------------------------------- */
    function installActiveAttribute(ctx, face) {
      ctx.effect(() => {
        let retry = undefined;
        /* 主题关闭时必须把注入的图层一并摘掉。
         * 图层样式全部挂在 html[data-dsh-suoming] 之下，属性一没，裸 <img> 就以原图
         * 尺寸参与布局 —— 官方长立绘会直接盖住整个界面，且不会自行恢复。 */
        const purgeInjectedLayers = () => {
          if (typeof document === 'undefined') return;
          const selector = [
            '.dsh-suoming-scene-host',
            '.dsh-suoming-right-art',
            '.dsh-suoming-side-art',
            '.dsh-suoming-global',
          ].join(',');
          document.documentElement.removeAttribute('data-dsh-suoming-global');
          const stale = document.querySelectorAll(selector);
          for (let i = 0; i < stale.length; i += 1) {
            const el = stale[i];
            if (el && el.parentNode) el.parentNode.removeChild(el);
          }
        };

        const sync = () => {
          const enabled = face.enabled();
          if (enabled) {
            document.documentElement.setAttribute(THEME_ATTR, '');
            if (document.body) document.body.setAttribute(THEME_ATTR, '');
          } else {
            document.documentElement.removeAttribute(THEME_ATTR);
            if (document.body) document.body.removeAttribute(THEME_ATTR);
            purgeInjectedLayers();
          }
          /* 客户端模块可能在 <body> 出现前就 apply：稍后再补一次属性 */
          if (document.body === null || document.body === undefined) {
            if (retry === undefined) {
              retry = window.setTimeout(() => {
                retry = undefined;
                sync();
              }, 0);
            }
          }
        };
        sync();
        const off = face.subscribe(sync);
        /* 宿主重绘 html 属性（或外部插件改写）时主题属性可能被抹掉：
         * 图层样式全部依赖它，丢了就会退化成未样式化的裸图。这里做自愈。 */
        let observer = undefined;
        if (typeof MutationObserver === 'function' && document.documentElement) {
          observer = new MutationObserver(() => {
            if (!face.enabled()) return;
            if (document.documentElement.hasAttribute(THEME_ATTR)) return;
            document.documentElement.setAttribute(THEME_ATTR, '');
            if (document.body) document.body.setAttribute(THEME_ATTR, '');
          });
          observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTR] });
        }
        return () => {
          if (observer !== undefined) observer.disconnect();
          if (typeof off === 'function') off();
          if (retry !== undefined) window.clearTimeout(retry);
          document.documentElement.removeAttribute(THEME_ATTR);
          if (document.body) document.body.removeAttribute(THEME_ATTR);
        };
      }, 'suoming: active attribute');
    }

    /* ---------------------------------------------------------------- *
     * 主题注册 + 启动套用
     * - 第三方主题 id 不进入宿主持久化 schema，setTheme 只改运行期偏好；
     *   启动时把上次选择重放一次，并覆盖宿主设置 adopt 造成的回退。
     * ---------------------------------------------------------------- */
    function installTheme(ctx, face) {
      ctx.effect(() => {
        try {
          return ctx.theme.register(THEME_DEF);
        } catch (error) {
          /* 已注册（如 HMR 复用同一 ThemeRuntime）时沿用既有定义 */
          console.warn('[suoming-theme] theme registration skipped:', error);
          return undefined;
        }
      }, 'suoming: theme registration');
      installActiveAttribute(ctx, face);

      const ensureActive = () => {
        if (!face.enabled()) return;
        if (isActive(ctx.theme)) return;
        if (isBuiltin(ctx.theme.getTheme().preference)) ctx.theme.setTheme(THEME_ID);
      };

      ctx.effect(() => {
        ensureActive();
        /* 宿主设置异步 adopt 可能晚于本次 apply，按退避重放几次 */
        const timers = [400, 1200, 3000, 6000, 10000].map((delay) => window.setTimeout(ensureActive, delay));
        const off = ctx.on('theme/change', () => {
          if (Date.now() - face.bootAt > BOOT_WINDOW_MS) return;
          ensureActive();
        });
        return () => {
          for (const timer of timers) window.clearTimeout(timer);
          if (typeof off === 'function') off();
        };
      }, 'suoming: theme bootstrap');
    }

    /* ---------------------------------------------------------------- *
     * 品牌纹章：替换侧边栏的默认鱼形 logo（纯装饰、不可点击）
     * ---------------------------------------------------------------- */
    function createBrandMark() {
      function BrandMark(props) {
        const size = props && Number.isFinite(props.size) ? props.size : 24;
        return h(
          'svg',
          {
            width: size,
            height: size,
            viewBox: '0 0 64 64',
            className: 'dsh-suoming-brand',
            'aria-hidden': 'true',
            focusable: 'false',
          },
          h('path', {
            d: 'M13 26.5c2.4-8.6 9.4-14.2 19-14.2s16.6 5.6 19 14.2c-5.4-4-9.6-5.1-12.6-5.1-3.2 0-6.4 1.1-6.4 1.1s-3.2-1.1-6.4-1.1c-3 0-7.2 1.1-12.6 5.1Z',
            fill: P.inkBright,
            stroke: P.goldHi,
            strokeWidth: 1.2,
            strokeOpacity: 0.75,
          }),
          h('path', {
            d: 'M22.5 25.5c3.2-4.6 6.2-6.6 9.5-6.6s6.3 2 9.5 6.6',
            fill: 'none',
            stroke: P.goldHi,
            strokeOpacity: 0.35,
            strokeWidth: 0.9,
          }),
          h('path', { d: 'M32 27.2v13.4', stroke: P.gold, strokeWidth: 1.8, strokeLinecap: 'round' }),
          h('rect', {
            x: 23.6,
            y: 41.4,
            width: 16.8,
            height: 13.6,
            rx: 3.4,
            fill: P.bg2,
            stroke: P.gold,
            strokeWidth: 1.6,
          }),
          h('path', {
            d: 'M28.2 41.4v-3.1a3.8 3.8 0 0 1 7.6 0v3.1',
            fill: 'none',
            stroke: P.gold,
            strokeWidth: 1.6,
          }),
          h('circle', { cx: 32, cy: 48.1, r: 1.8, fill: P.goldHi }),
          h('path', { d: 'M32 49.9v2.9', stroke: P.goldHi, strokeWidth: 1.2, strokeLinecap: 'round' }),
        );
      }
      return BrandMark;
    }

    /* ---------------------------------------------------------------- *
     * 第三批（P2-7）：欢迎页品牌位——「赤红虹膜 + 橙金竖梭亮核 + 上下细亮线」
     * 的锁芯抽象符号；不做机械齿轮。替换宿主鱼形 fallback。
     * ---------------------------------------------------------------- */
    const PUPIL_CORE = '#d59a62';

    function createHeroLockCoreMark() {
      function HeroLockCoreMark(props) {
        const size = props && Number.isFinite(props.size) ? props.size : 34;
        const extraClass = props && typeof props.className === 'string' ? props.className : '';
        const fibers = [];
        for (let index = 0; index < 10; index += 1) {
          const angle = (index / 10) * Math.PI * 2;
          const inner = 9;
          const outer = 21;
          fibers.push(
            h('path', {
              d:
                'M' + (32 + Math.cos(angle) * inner).toFixed(2) + ' ' + (32 + Math.sin(angle) * inner).toFixed(2) +
                'L' + (32 + Math.cos(angle) * outer).toFixed(2) + ' ' + (32 + Math.sin(angle) * outer).toFixed(2),
              stroke: P.inkDeep,
              strokeOpacity: 0.28,
              strokeWidth: 0.6,
            }),
          );
        }
        return h(
          'svg',
          {
            width: size,
            height: size,
            viewBox: '0 0 64 64',
            className: 'dsh-suoming-hero-mark' + (extraClass ? ' ' + extraClass : ''),
            'aria-hidden': 'true',
            focusable: 'false',
          },
          h(
            'defs',
            {},
            h(
              'radialGradient',
              { id: 'dsh-suoming-iris', cx: '50%', cy: '50%', r: '50%' },
              h('stop', { offset: '0%', stopColor: P.inkArcSoft }),
              h('stop', { offset: '55%', stopColor: P.inkBright }),
              h('stop', { offset: '100%', stopColor: P.inkDeep }),
            ),
            h(
              'linearGradient',
              { id: 'dsh-suoming-core', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '0%', stopColor: P.goldHi }),
              h('stop', { offset: '55%', stopColor: PUPIL_CORE }),
              h('stop', { offset: '100%', stopColor: P.gold }),
            ),
          ),
          h('circle', { cx: 32, cy: 32, r: 24, fill: 'url(#dsh-suoming-iris)' }),
          h('circle', { cx: 32, cy: 32, r: 24, fill: 'none', stroke: P.goldDark, strokeWidth: 1, strokeOpacity: 0.55 }),
          ...fibers,
          h('ellipse', { cx: 32, cy: 32, rx: 5, ry: 10, fill: 'url(#dsh-suoming-core)' }),
          h('ellipse', { cx: 32, cy: 30, rx: 2, ry: 4, fill: P.goldHi, fillOpacity: 0.7 }),
          h('path', {
            d: 'M32 3v13M32 48v13',
            stroke: P.goldHi,
            strokeWidth: 1,
            strokeLinecap: 'round',
            strokeOpacity: 0.55,
          }),
          h('path', {
            d: 'M32 17v6M32 41v6',
            stroke: P.gold,
            strokeWidth: 0.8,
            strokeLinecap: 'round',
            strokeOpacity: 0.5,
          }),
        );
      }
      return HeroLockCoreMark;
    }

    /* ---------------------------------------------------------------- *
     * 第五批 A（P0-7）：输入框边缘 Canvas 冷脉冲
     * 颜色只用 #953333/#b85e5d（朱红）、#e0d7d6（白热）、#3a171a（暗红）；
     * AI 活动时脉冲，静止时几乎不可见；reduced-motion 退化为静态细线；
     * 页面隐藏时取消 rAF。
     * ---------------------------------------------------------------- */
    function createPulseOverlay() {
      function PulseOverlay() {
        const canvasRef = React.useRef(null);
        React.useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas || typeof window === 'undefined' || typeof document === 'undefined') return undefined;
          const context = canvas.getContext('2d');
          if (!context) return undefined;
          let frame = null;
          let width = 0;
          let height = 0;
          const media =
            typeof window.matchMedia === 'function'
              ? window.matchMedia('(prefers-reduced-motion: reduce)')
              : null;
          let reduced = media ? media.matches : false;

          const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.max(1, Math.round(width * dpr));
            canvas.height = Math.max(1, Math.round(height * dpr));
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
          };
          const themeActive = () => document.documentElement.hasAttribute('data-dsh-suoming');
          /* [data-chat-running] 是宿主 ui-chat 的内部实现属性（非 Slots 公开契约），
           * 这里同时保留多个语义/结构 fallback，避免 DSH 升级后脉冲静默失效。 */
          const runningSelectors = [
            '[data-chat-running]',
            '[data-slot="main"] [role="status"][aria-live="polite"]',
            '[data-slot="conversation.chat.flow"] [data-streaming]',
            '[data-slot="main"] [aria-busy="true"]',
            '[data-composer-card] button svg rect[width="10"][height="10"]',
          ];
          const aiActive = () =>
            runningSelectors.some((selector) => {
              try {
                return document.querySelector(selector) !== null;
              } catch {
                return false;
              }
            });
          const cardRect = () => {
            const card = document.querySelector('[data-composer-card]');
            if (!card) return null;
            const rect = card.getBoundingClientRect();
            return rect.width > 2 && rect.height > 2 ? rect : null;
          };
          const addStop = (gradient, offset, color, state) => {
            const next = Math.min(1, Math.max(state.last, offset));
            gradient.addColorStop(next, color);
            state.last = next;
          };
          const drawStatic = () => {
            context.clearRect(0, 0, width, height);
            if (!themeActive()) return;
            const rect = cardRect();
            if (!rect) return;
            const inset = Math.min(22, rect.width * 0.05);
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = aiActive() ? 'rgba(149,51,51,0.52)' : 'rgba(58,23,26,0.22)';
            context.beginPath();
            context.moveTo(rect.left + inset, rect.top + 1);
            context.lineTo(rect.right - inset, rect.top + 1);
            context.moveTo(rect.left + inset, rect.bottom - 1);
            context.lineTo(rect.right - inset, rect.bottom - 1);
            context.stroke();
            context.restore();
          };
          const drawPulse = (now) => {
            context.clearRect(0, 0, width, height);
            if (!themeActive()) return;
            const rect = cardRect();
            if (!rect) return;
            if (!aiActive()) {
              drawStatic();
              return;
            }
            const inset = Math.min(22, rect.width * 0.05);
            const phase = (now % 4600) / 4600;
            const topY = rect.top + 1;
            const bottomY = rect.bottom - 1;
            context.save();
            context.lineWidth = 1;
            context.strokeStyle = 'rgba(58,23,26,0.42)';
            context.beginPath();
            context.moveTo(rect.left + inset, topY);
            context.lineTo(rect.right - inset, topY);
            context.moveTo(rect.left + inset, bottomY);
            context.lineTo(rect.right - inset, bottomY);
            context.stroke();
            const drawPulseLine = (y, p) => {
              const state = { last: 0 };
              const gradient = context.createLinearGradient(rect.left + inset, 0, rect.right - inset, 0);
              addStop(gradient, Math.max(0, p - 0.16), 'rgba(58,23,26,0)', state);
              addStop(gradient, p - 0.1, 'rgba(58,23,26,0.12)', state);
              addStop(gradient, p - 0.05, 'rgba(149,51,51,0.38)', state);
              addStop(gradient, p, 'rgba(184,94,93,0.55)', state);
              addStop(gradient, p + 0.012, 'rgba(224,215,214,0.34)', state);
              addStop(gradient, p + 0.08, 'rgba(149,51,51,0.14)', state);
              addStop(gradient, p + 0.2, 'rgba(58,23,26,0)', state);
              context.strokeStyle = gradient;
              context.shadowBlur = 6;
              context.shadowColor = 'rgba(149,51,51,0.22)';
              context.beginPath();
              context.moveTo(rect.left + inset, y);
              context.lineTo(rect.right - inset, y);
              context.stroke();
              context.shadowBlur = 0;
            };
            drawPulseLine(topY, phase);
            drawPulseLine(bottomY, 1 - phase);
            context.restore();
          };
          const tick = (now) => {
            frame = null;
            if (document.hidden) return;
            if (reduced) {
              drawStatic();
              return;
            }
            drawPulse(now);
            frame = window.requestAnimationFrame(tick);
          };
          const start = () => {
            if (frame !== null || document.hidden) return;
            frame = window.requestAnimationFrame(tick);
          };
          const stop = () => {
            if (frame === null) return;
            window.cancelAnimationFrame(frame);
            frame = null;
          };
          const onVisibility = () => {
            if (document.hidden) stop();
            else start();
          };
          const onMedia = () => {
            reduced = media ? media.matches : false;
            stop();
            if (reduced) drawStatic();
            else start();
          };
          const onResize = () => {
            resize();
            if (reduced) drawStatic();
          };
          resize();
          drawStatic();
          start();
          document.addEventListener('visibilitychange', onVisibility);
          window.addEventListener('resize', onResize);
          if (media) {
            if (typeof media.addEventListener === 'function') media.addEventListener('change', onMedia);
            else if (typeof media.addListener === 'function') media.addListener(onMedia);
          }
          return () => {
            stop();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('resize', onResize);
            if (media) {
              if (typeof media.removeEventListener === 'function') media.removeEventListener('change', onMedia);
              else if (typeof media.removeListener === 'function') media.removeListener(onMedia);
            }
            context.clearRect(0, 0, width, height);
          };
        }, []);
        return h('canvas', {
          ref: canvasRef,
          className: 'dsh-suoming-pulse',
          'aria-hidden': 'true',
        });
      }
      return PulseOverlay;
    }

    /* ---------------------------------------------------------------- *
     * 插件入口
     * ---------------------------------------------------------------- */
    function apply(ctx) {
      installStyles(ctx);
      installGlassFilter(ctx);
      installGlassPointer(ctx);
      installMotionPause(ctx);
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'suoming: locale dictionaries');

      const face = createFace(ctx);
      installTheme(ctx, face);
      /* v3.1.0 migration: users who had the old theme disabled before this version
       * should see the rebuilt scene once. A dedicated migration cookie prevents
       * re-enabling after the user deliberately turns the theme off again. */
      try {
        if (!/(?:^|;\s*)dsh_suoming_v31_migrated=1/.test(document.cookie)) {
          document.cookie = 'dsh_suoming_v31_migrated=1; path=/; max-age=31536000; SameSite=Lax';
          face.lastBuiltin = 'system';
          face.setEnabled(true);
          ctx.theme.setTheme(THEME_ID);
        }
      } catch {
        /* cookie unavailable: keep existing preference */
      }
      const sceneStore = createSceneStore(readStoredSceneConfig());
      const sceneController = createSceneController(sceneStore);
      if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
        ctx.effect(() => {
          sceneController.mount();
          return () => sceneController.destroy();
        }, 'suoming: four-layer scene');
      }
      const ThemeRow = createThemeRow(face, ctx, sceneStore, sceneController);
      const QuoteLine = createQuoteLine(face);
      const BrandMark = createBrandMark();
      const HeroLockCoreMark = createHeroLockCoreMark();
      const PulseOverlay = createPulseOverlay();

      ctx.slots.inject('shell.overlay', () => {
        try {
          return ctx.slots.register({ name: 'shell.overlay', id: 'suoming-pulse', order: 30 }, PulseOverlay);
        } catch {
          return () => {};
        }
      });

      ctx.slots.inject('sidebar.brand.mark', () => {
        try {
          return ctx.slots.register({ name: 'sidebar.brand.mark' }, BrandMark);
        } catch {
          /* 单槽位已被其他插件占用时保持宿主默认 brand mark */
          return () => {};
        }
      });

      ctx.slots.inject('conversation.hero.brand.mark', () => {
        try {
          return ctx.slots.register({ name: 'conversation.hero.brand.mark' }, HeroLockCoreMark);
        } catch {
          /* 单槽位被占用时保持宿主鱼形 fallback */
          return () => {};
        }
      });

      ctx.slots.inject('settings.general.item', () =>
        ctx.slots.register(
          {
            name: 'settings.general.item',
            id: 'suoming-theme',
            order: 10.5,
          },
          ThemeRow,
        ),
      );

      ctx.slots.inject('conversation.input.dock', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.dock',
            id: 'suoming-quote',
            order: 30,
          },
          QuoteLine,
        ),
      );
    }

    return {
      inject: ['slots', 'locale', 'theme'],
      apply,
      __testing: {
        normalizeSceneConfig,
        pickDialogue,
        DIALOGUE_POOL,
        AI_RUNNING_SELECTORS,
        SCENE_DEFAULTS,
        SCENE_RANGES,
        sceneTemplate: SCENE_TEMPLATE,
      },
    };
  },
});
