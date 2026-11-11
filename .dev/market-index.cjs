// 生成 DSH 插件市场索引（format 1）。
// usage: node .dev/market-index.cjs [--commit <40 位 sha>] [--timestamp <Unix 秒>]
//
// 设计约束（来自宿主校验器 @deepseek-ai/dsh-plugin-market-index）：
//   - format 必须为 1；title 为 LocalizedText 时必须含 en；
//   - 插件 name 必须是合法 npm 名；
//   - source.type=git 时 url 必须是 https 规范形式，commit 必须是 40 位小写 hex；
//   - publishTimestamp 是 Unix 秒整数；
//   - metadata.category / labels / sortKeys 必须先在根 metadata 中声明；
//   - icon 相对索引 URL 解析，跨域时必须 https。
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function arg(name) {
  const index = process.argv.indexOf(name);
  return index > 0 ? process.argv[index + 1] : undefined;
}

const commit =
  arg('--commit') ||
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(commit)) {
  throw new Error('commit 必须是 40 位小写 hex，实际收到：' + commit);
}

const timestamp = Number(arg('--timestamp') || Math.floor(Date.now() / 1000));
if (!Number.isInteger(timestamp) || timestamp < 0) {
  throw new Error('timestamp 必须是 Unix 秒整数');
}

// package.json 的 repository 形如 git+https://github.com/<owner>/<repo>.git
const repoUrl = (pkg.repository && pkg.repository.url ? pkg.repository.url : '')
  .replace(/^git\+/, '')
  .replace(/\.git$/, '');
if (!/^https:\/\/[^/]+\/[^/]+\/[^/]+$/.test(repoUrl)) {
  throw new Error('package.json 的 repository.url 不是预期的 https 仓库地址：' + repoUrl);
}

const index = {
  format: 1,
  title: { en: 'Suoming Theme', zh: '锁暝主题' },
  description: {
    en: 'Wuthering Waves Suoming style theme bundle for the DeepSeek Harness Web GUI.',
    zh: '《鸣潮》锁暝风格的 DeepSeek Harness Web GUI 主题 bundle。',
  },
  metadata: {
    categories: { theme: { title: { en: 'Theme', zh: '主题' } } },
    labels: {
      'wuthering-waves': { title: { en: 'Wuthering Waves', zh: '鸣潮' } },
      dark: { title: { en: 'Dark', zh: '暗色' } },
      'ui-skin': { title: { en: 'UI skin', zh: '界面皮肤' } },
    },
    sortKeys: { updated: { title: { en: 'Updated', zh: '更新时间' }, order: 'desc' } },
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'Suoming Theme', zh: '锁暝主题' },
      description: {
        en: 'Third-party DSH theme inspired by Suoming from Wuthering Waves: ink-black and crimson palette, old-gold filigree, rotating lock ornament, sidebar portrait, character stage and settings persistence.',
        zh: '《鸣潮》锁暝风格的第三方 DSH 主题：墨黑与绯红配色、旧金锁纹、旋转玄朱锁、侧边栏立绘、角色舞台与设置持久化。',
      },
      icon: 'icon.svg',
      author: 'yuanvesper',
      homepage: repoUrl + '#readme',
      repository: { url: repoUrl },
      metadata: {
        category: 'theme',
        keywords: ['dsh-plugin', 'deepseek-harness', 'dsh-theme', 'theme', 'wuthering-waves', 'mingchao', 'suoming'],
        labels: ['wuthering-waves', 'dark', 'ui-skin'],
        sortKeys: { updated: timestamp },
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: timestamp,
          source: { type: 'git', url: repoUrl, commit },
        },
      ],
    },
  ],
};

const target = path.join(ROOT, 'market', 'index.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log('wrote ' + path.relative(ROOT, target) + ' (version ' + pkg.version + ', commit ' + commit + ')');
