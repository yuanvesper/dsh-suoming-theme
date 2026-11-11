# DSH 插件索引 / DSH plugin index

这个目录存放本项目的 DSH 插件市场索引文件，格式为 **DSH plugin index format 1**。

- 索引文件：[`index.json`](index.json)
- 图标：[`icon.svg`](icon.svg)（与包根目录的 `icon.svg` 相同，索引按相对路径解析图标）
- 生成脚本：[`../.dev/market-index.cjs`](../.dev/market-index.cjs)

## 为什么需要它

DSH 内置的 Discover 是实验功能，且**出厂不带任何索引源**。要让它能搜索到本主题，需要在 DSH 中添加一次索引地址：

```text
https://raw.githubusercontent.com/yuanvesper/dsh-suoming-theme/main/market/index.json
```

步骤：**设置 → 插件市场 → Discover → Add index source**，粘贴上面的地址并保存。

> 这是一个独立的可选渠道：GitHub 仓库本身上市集的第三方目录（[dshmarketplace.dev](https://dshmarketplace.dev)）是按 `dsh-plugin` topic 自动同步的，与这里的索引源互不替代。

## 重新生成

索引中的 `commit` 必须指向一个真实存在的提交，且该提交里的 `package.json` 可以直接安装：

```bash
node .dev/market-index.cjs
```

可选参数：`--commit <40 位 sha>`、`--timestamp <Unix 秒>`。默认取当前 `HEAD` 与当前时间。

> 索引里的 `icon`、`repository`、`source.url` 都指向本仓库；改动仓库名或账号时必须同步重新生成。
