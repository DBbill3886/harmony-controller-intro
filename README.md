# HarmonyController 介绍影片

3:4（1080×1440）网页动画，介绍 HarmonyController 的由来与主要功能。蓝白配色。片长 111 秒，含旁白、字幕，可暂停与拖动进度。画面时间以音轨 `currentTime` 为唯一时钟（片头 5 秒静音后起声，片尾静音收束）。

## 在线观看

打开：<https://dbbill3886.github.io/harmony-controller-intro/>

点画面或「开始」播放。支持暂停、进度条、音量、开关字幕、导出 LRC、全屏。

成片 MP4 放在本仓库 [Releases](https://github.com/DBbill3886/harmony-controller-intro/releases)，不进入 Git / Pages 文件树。

## 离线打开

解压预览包后可直接双击 `index.html`（`file://`）。若浏览器拦截本地音频，在解压目录运行：

```bash
python3 -m http.server 8765
```

然后打开 `http://127.0.0.1:8765/`。

## 文件

- `index.html` / `css/player.css` / `js/` — 播放器与动画
- `audio/narration.m4a` — 成片长度旁白（含片头、句间与片尾静音，未重新合成）
- `harmony-controller-intro.lrc` 与 `docs/` — 成片时间轴字幕与旁白文案
- `assets/` — 标识、示意商品图、7 张游戏主题布局示例（尚未实测适配）、左下常驻 Q 版待兼诗歌剧（曼波）
