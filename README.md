# HarmonyController 介绍影片

3:4（1080×1440）网页动画，介绍 [HarmonyController](https://github.com/DBbill3886/HarmonyController) 的由来与主要功能。片长约 111 秒，含旁白、字幕，可暂停与拖动进度。

## 在线观看

打开：<https://dbbill3886.github.io/harmony-controller-intro/>

点画面或「开始」播放。支持暂停、进度条、音量、开关字幕、导出 LRC、全屏。

## 离线打开

解压后可直接双击 `index.html`（`file://`）。音频、字幕、图片都是相对路径，一般可直接播。

若浏览器拦截本地音频，在解压目录里开一个本地服务后再访问：

```bash
python3 -m http.server 8765
```

然后打开 `http://127.0.0.1:8765/`。

## 文件

- `index.html` / `css/player.css` / `js/` — 播放器与动画
- `audio/narration.m4a` — 旁白（指定音色，已按句间隙加长停顿，未重新合成）
- `harmony-controller-intro.lrc` 与 `docs/` — 成片时间轴字幕与旁白文案
- `assets/` — 标识、示意商品图、示例图槽、左下常驻 Q 版待兼诗歌剧（曼波）

购物页为虚拟示意：商品与名称已打码，价格保留并标注「虚拟示意价格」。自定义按键图为可替换槽位，片中标明是界面示意。

左下角色依据公开官方立绘特征重绘为 Q 版，常驻眨眼与轻微摇摆，并在「曼波～」「欧耶！」时切换姿势。语气词由同一指定音色朗读，没有混入原视频音效。
