/* Film time in seconds. Narration audio starts at INTRO.
 * v1.1: late-half pauses were lengthened by inserting silence at existing
 * phrase gaps in the original WAV (no new TTS). Audio duration 95.34s.
 */
const INTRO = 5.0;
const AUDIO_DUR = 95.34;
const DURATION = 111.0;
const W = 1080, H = 1440;

/* Scene / motion anchors after the late-half silence inserts. */
const KEYS_MORPH = 81.30;
const KEYS_SLOTS = 87.35;
const MARKET_CARDS = 93.80;
const DEMO_IN = 97.40;
const IDEA_FROM = 35.60;
const IDEA_TO = 54.00;
const CELEB_FROM = 64.00;
const CELEB_TO = 81.20;

const SUBS = [
  { t0: 5.10, t1: 7.92, text: '平时玩游戏，总想要个像样的方向盘，' },
  { t0: 7.92, t1: 9.46, text: '或者飞行摇杆。' },
  { t0: 10.10, t1: 13.44, text: '有回我在购物网站上逛，越看越心动。' },
  { t0: 13.44, t1: 14.54, text: '再一看价格——' },
  { t0: 14.54, t1: 19.14, text: '真的方向盘、真的摇杆，动不动就大几百、上千。' },
  { t0: 19.56, t1: 21.86, text: '曼波～', pop: "manbo" },
  { t0: 22.54, t1: 26.00, text: '我盯着那个数字，手都缩回来了。' },
  { t0: 26.30, t1: 31.16, text: '后来退而求其次，去闲鱼看看有没有二手，或者 DIY 的方案。' },
  { t0: 31.40, t1: 33.32, text: '确实便宜一些，可算下来还是小几百，而且还得自己折腾零件。' },
  { t0: 33.32, t1: 35.22, text: '犹豫了很久，还是没下手。' },
  { t0: 35.86, t1: 39.78, text: '有天突然想到：我手上不是有一台 MatePad mini 吗？' },
  { t0: 39.98, t1: 46.36, text: '再加上 Gemini、ChatGPT、Grok Bot 这些 AI，' },
  { t0: 46.72, t1: 52.56, text: '写代码这事儿，好像也不是没办法。' },
  { t0: 53.12, t1: 53.92, text: '欧耶！', pop: "oye" },
  { t0: 53.94, t1: 57.46, text: '于是我就 vibe coding，' },
  { t0: 57.66, t1: 64.28, text: '一点点把现在这套软件做出来了。' },
  { t0: 64.28, t1: 65.28, text: '欧耶！', pop: "oye" },
  { t0: 65.92, t1: 68.20, text: '它叫 HarmonyController。' },
  { t0: 68.40, t1: 72.18, text: '简单说，就是把鸿蒙平板或者手机，' },
  { t0: 72.52, t1: 76.60, text: '变成电脑这边的触控键盘、触摸板，还有游戏手柄。' },
  { t0: 76.94, t1: 80.12, text: '可以用 Wi-Fi，也可以用数据线，直接连到 Windows。' },
  { t0: 81.48, t1: 84.58, text: '我最在意的，是按键能自由改。' },
  { t0: 85.31, t1: 87.27, text: '布局可以随便拖、随便缩放，横屏竖屏分开记。' },
  { t0: 87.92, t1: 89.84, text: '按键长什么样、绑哪个键、要不要组合键，都能自己定。' },
  { t0: 90.50, t1: 92.64, text: '不同游戏，就能排出完全不一样的操作面。' },
  { t0: 94.02, t1: 95.30, text: '改好之后，还可以存成预设。' },
  { t0: 95.30, t1: 97.00, text: '预设市场里，能按游戏去下载别人的方案，也能把自己的布局发布出去，或者导出文件，分享给朋友。' },
  { t0: 97.73, t1: 99.04, text: '至于实际上手好不好用——后面这一段，是我自己录的演示。' },
  { t0: 99.86, t1: 100.32, text: '曼波～', pop: "manbo" },
];

const POPS = SUBS.filter(s => s.pop).map(s => ({ t0: s.t0, t1: s.t1, kind: s.pop, text: s.text }));

const SCENES = [
  { id: "title",    t0: 0.00,  t1: 10.20 },
  { id: "shop",     t0: 9.40,  t1: 22.80 },
  { id: "xianyu",   t0: 21.80, t1: 36.20 },
  { id: "idea",     t0: 35.20, t1: 54.20 },
  { id: "birth",    t0: 53.20, t1: 81.70 },
  { id: "keys",     t0: 80.90, t1: 94.20 },
  { id: "market",   t0: 93.40, t1: 98.20 },
  { id: "demo",     t0: 97.40, t1: 111.0 }
];
