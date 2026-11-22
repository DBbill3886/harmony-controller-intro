# HarmonyController 介绍影片（3:4 网页动画）

可播放的网页动画介绍片，比例 3:4（1080×1440），成片时长 **102.00 秒**（片头 5.00 秒静音 + 旁白至 100.34 秒最后一声「曼波～」+ 约 1.66 秒动态衔接，不再保留 11 秒冻屏片尾）。字幕与场景按最终音轨逐句对齐。画面由 `renderAt(t)` 按可拖动时间轴绘制，内置指定音色旁白与字幕，并可导出 LRC。

双击或用本地 HTTP 打开 `index.html`。点「开始」出声。支持暂停、拖进度、音量、开关字幕、导出 LRC、全屏。

## 文件

- `index.html` / `css/player.css` / `js/cues.js` / `js/render.js` / `js/player.js` — 播放器
- `audio/narration.wav` — 母带（48 kHz WAV）
- `audio/narration.m4a` — 播放器用音频
- `docs/narration.md` — 旁白文案（含「曼波～」「欧耶！」节点）
- `docs/tts-input.txt` — 送合成原文（含官方 `[pause]` 标记）
- `docs/harmony-controller-intro.lrc` — 字幕，**按成片时间**对齐（片头 5.00 秒后起声）
- `assets/slots/` — 自定义按键示例图槽，替换即可在影片中出现
- `export/harmony-controller-intro-1080x1440-60.mp4` — 无额外配乐的成片（旁白已混入）
- `assets/qa/` — 关键帧检查图

## 替换示例图

把同名文件覆盖到：

- `assets/slots/slot-flight.png`  飞行布局
- `assets/slots/slot-driving.png` 驾驶布局
- `assets/slots/slot-fighting.png` 格斗布局

建议约 1080×720。片中会标明这是图槽；你换上自己的游戏自定义按键图后，可把示意字样再改掉。

## 诚实说明

- 产品名以仓库 AppScope 为准：HarmonyController（版本 26.11.22.2）。定位是把鸿蒙平板或手机用作 Windows 的触控键盘、触摸板和游戏手柄（含驾驶、飞行面板）。
- 高自由度自定义（拖动、缩放、横竖屏独立记忆、外观与绑定、自定义按键）以及预设市场（推荐 / 下载导入 / 发布 / 导出或系统分享）均来自源码与设置文案核实，没有写实未实现能力。
- README 写明当前仍是开发版、需真机联调；片中不做伪造的实机操作演示，结尾把时间交给你后接的实用演示。
- 购物与闲鱼商品页是**虚拟示意**：商品图打码、名称打码、价格保留，并标注「虚拟示意价格」，不是真实商家报价。
- MatePad mini 使用华为官网产品图；Gemini、ChatGPT/OpenAI、Grok、闲鱼使用已核对的官方或官网标识。因路径限制，未能从工程拷出 HarmonyController 官方 logo，片中以字标呈现产品名。
- 左下常驻角色是根据公开官方立绘绘制的 Q 版「待兼诗歌剧」（Matikanetannhauser，即网称「曼波」），带有标志性的浅栗发、刘海白挑染、左侧两枚红发夹、右耳红蓝珠、琥珀黄瞳、蓝紫报童帽与白色菱形白斑、帽上粉红飘带、马耳马尾与校服。用眨眼、轻微摇摆和语气词姿势做常驻动画。「曼波～」「欧耶！」由同一指定音色朗读，没有混入原视频或原角色音效。片中不会把无关原创形象称作曼波。
- LRC 按本版音轨的停顿与波形对齐。后期若重录，需要按新录音微调。合成使用官方 MOSS TTS 接口与指定音色；模型为 `moss-tts-2.0-flash-preview`。
