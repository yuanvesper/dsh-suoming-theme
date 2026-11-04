# 本地立绘 / 表情素材

公开仓库与安装包**不包含任何角色图片**。v3.2.0 起 L2 支持透明的本地人物立绘 char.png（由官方全身图抠图并裁上半身）；公开包仍不含位图。把自备/已授权素材放在本机以下任一位置（按优先级）：

1. 环境变量 `SUOMING_LOCAL_ART` 指向的目录；
2. `$DSH_PROFILE_DIR/suoming-theme/assets/`（推荐；profile 专属，刷新/重启后仍生效）；
3. `$DSH_HOME/suoming-theme/assets/`；
4. 本目录 `assets/`（仓库内，不会进 bundle）；
5. 开发目录 `../suoming-theme-dev/local-art/`。

允许的文件名（Host 侧白名单）：

```
side.jpg  char.jpg  side.png  char.png  side.webp  char.webp
side-error.jpg  char-error.jpg
```

- char.png 为当前透明立绘；char.jpg/side.jpg 为旧版兼容名；
- 当前没有表情差分；主题不伪造第二张图。
- 原图宽度建议不超过 3840px；透明 PNG/WebP 效果最好，JPEG 会用遮罩淡出边缘；
- 图片只通过本机宿主路由 `GET /suoming-local-art/<file>` 读取，不进入客户端 bundle，也不会上传到任何第三方。

`assets/README.md` 是唯一会留在仓库里的文件（`.gitignore` 已忽略本目录下的图片）。
