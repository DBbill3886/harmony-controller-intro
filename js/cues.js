/* Film time equals audio.currentTime on the film-length track:
 * 5.00s leading silence + narration through last 曼波 at 100.34s + 1.66s tail
 * = DURATION 102.00s. Sentence times come from windowed Whisper on
 * audio/narration.m4a plus energy onsets — not from the old handwritten cues.
 */
const INTRO = 5.0;
const AUDIO_DUR = 102.0;
const DURATION = 102.0;
const W = 1080, H = 1440;

/* Scene / motion anchors (film seconds), aligned to actual narration. */
const KEYS_MORPH = 65.55;
const KEYS_SLOTS = 66.80;
const MARKET_CARDS = 81.00;
const DEMO_IN = 93.70;
const IDEA_FROM = 35.87;
const IDEA_TO = 46.70;
const CELEB_FROM = 47.62;
const CELEB_TO = 53.20;

const SUBS = [
  { t0: 5.10, t1: 8.16, text: '平时玩游戏，总想要个像样的方向盘，' },
  { t0: 8.16, t1: 9.47, text: '或者飞行摇杆。' },
  { t0: 10.11, t1: 13.43, text: '有回我在购物网站上逛，越看越心动。' },
  { t0: 13.43, t1: 14.54, text: '再一看价格——' },
  { t0: 14.54, t1: 18.68, text: '真的方向盘、真的摇杆，动不动就大几百、上千。' },
  { t0: 18.68, t1: 19.56, text: '曼波～', pop: "manbo" },
  { t0: 19.56, t1: 21.87, text: '我盯着那个数字，手都缩回来了。' },
  { t0: 22.53, t1: 26.42, text: '后来退而求其次，去闲鱼看看有没有二手，' },
  { t0: 26.42, t1: 29.52, text: '或者 DIY 的方案。确实便宜一些，' },
  { t0: 29.52, t1: 33.48, text: '可算下来还是小几百，而且还得自己折腾零件。' },
  { t0: 33.48, t1: 35.24, text: '犹豫了很久，还是没下手。' },
  { t0: 35.87, t1: 39.92, text: '有天突然想到：我手上不是有一台 MatePad mini 吗？' },
  { t0: 40.14, t1: 44.16, text: '再加上 Gemini、ChatGPT、Grok Bot 这些 AI，' },
  { t0: 44.16, t1: 46.70, text: '写代码这事儿，好像也不是没办法。' },
  { t0: 46.72, t1: 47.40, text: '欧耶！', pop: "oye" },
  { t0: 47.62, t1: 49.75, text: '于是我就 vibe coding，' },
  { t0: 49.75, t1: 52.15, text: '一点点把现在这套软件做出来了。' },
  { t0: 52.15, t1: 52.80, text: '欧耶！', pop: "oye" },
  { t0: 53.10, t1: 54.83, text: '它叫 HarmonyController。' },
  { t0: 54.83, t1: 57.81, text: '简单说，就是把鸿蒙平板或者手机，' },
  { t0: 57.81, t1: 61.81, text: '变成电脑这边的触控键盘、触摸板，还有游戏手柄。' },
  { t0: 61.81, t1: 65.33, text: '可以用 Wi-Fi，也可以用数据线，直接连到 Windows。' },
  { t0: 65.93, t1: 68.40, text: '我最在意的，是按键能自由改。' },
  { t0: 68.40, t1: 70.94, text: '布局可以随便拖、随便缩放，' },
  { t0: 70.94, t1: 72.53, text: '横屏竖屏分开记。' },
  { t0: 72.53, t1: 74.82, text: '按键长什么样、绑哪个键，' },
  { t0: 74.82, t1: 76.94, text: '要不要组合键，都能自己定。' },
  { t0: 76.94, t1: 80.13, text: '不同游戏，就能排出完全不一样的操作面。' },
  { t0: 81.47, t1: 83.76, text: '改好之后，还可以存成预设。' },
  { t0: 83.76, t1: 84.80, text: '预设市场里，' },
  { t0: 85.30, t1: 87.29, text: '能按游戏去下载别人的方案，' },
  { t0: 87.93, t1: 89.83, text: '也能把自己的布局发布出去，' },
  { t0: 90.49, t1: 92.64, text: '或者导出文件，分享给朋友。' },
  { t0: 94.02, t1: 96.89, text: '至于实际上手好不好用——后面这一段，' },
  { t0: 97.72, t1: 99.20, text: '是我自己录的演示。' },
  { t0: 99.86, t1: 100.50, text: '曼波～', pop: "manbo" }
];

const POPS = SUBS.filter(s => s.pop).map(s => ({ t0: s.t0, t1: s.t1, kind: s.pop, text: s.text }));

const SCENES = [
  { id: "title",    t0: 0.00,  t1: 10.20 },
  { id: "shop",     t0: 9.40,  t1: 22.20 },
  { id: "xianyu",   t0: 21.60, t1: 35.90 },
  { id: "idea",     t0: 35.30, t1: 47.80 },
  { id: "birth",    t0: 47.20, t1: 66.20 },
  { id: "keys",     t0: 65.50, t1: 81.30 },
  { id: "market",   t0: 80.70, t1: 94.20 },
  { id: "demo",     t0: 93.60, t1: 102.0 }
];
