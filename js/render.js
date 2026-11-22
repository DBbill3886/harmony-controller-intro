/* HarmonyController intro renderer — renderAt(ctx, t, assets, opts) */
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function sat(t) { return clamp(t, 0, 1); }
function smooth(t) { t = sat(t); return t * t * (3 - 2 * t); }
function easeOutCubic(t) { t = sat(t); return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t) { t = sat(t); return t * t * t; }
function easeOutBack(t) { t = sat(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
function easeOutElastic(t) {
  t = sat(t); if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}
function pulse(t, spd) { return 0.5 + 0.5 * Math.sin(t * spd); }
function sceneW(id, t) {
  const s = SCENES.find((x) => x.id === id);
  if (!s) return 0;
  const fade = 0.9;
  if (t < s.t0 || t > s.t1) return 0;
  const a = smooth((t - s.t0) / fade);
  const b = smooth((s.t1 - t) / fade);
  return Math.min(a, b);
}
function rr(ctx, x, y, w, h, r) {
  const R = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + R, y);
  ctx.arcTo(x + w, y, x + w, y + h, R);
  ctx.arcTo(x + w, y + h, x, y + h, R);
  ctx.arcTo(x, y + h, x, y, R);
  ctx.arcTo(x, y, x + w, y, R);
  ctx.closePath();
}
function fillRR(ctx, x, y, w, h, r, fill) { rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
function strokeRR(ctx, x, y, w, h, r, stroke, lw) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
function drawCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}
function drawContain(ctx, img, x, y, w, h) {
  if (!img) return;
  const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
  const s = Math.min(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
function textFit(ctx, text, font, maxW) {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxW) return font;
  const parts = font.split(" ");
  let size = parseFloat(parts[0]);
  const rest = parts.slice(1).join(" ");
  while (size > 12) {
    size -= 1;
    ctx.font = size + "px " + rest;
    if (ctx.measureText(text).width <= maxW) return ctx.font;
  }
  return ctx.font;
}

function exportLrc() {
  const lines = [
    "[ti:把平板变成方向盘]",
    "[ar:HarmonyController 介绍影片]",
    "[al:HarmonyController Intro]",
    "[by:按成片时间轴对齐，片头 5.00 秒后起声]",
    "[offset:0]",
    "",
    "[00:00.00]"
  ];
  function lt(t) {
    const m = Math.floor(t / 60), s = t - m * 60;
    return "[" + String(m).padStart(2, "0") + ":" + s.toFixed(2).padStart(5, "0") + "]";
  }
  SUBS.forEach((s) => lines.push(lt(s.t0) + s.text));
  lines.push(lt(DURATION));
  return lines.join("\n") + "\n";
}

function renderAt(ctx, t, assets, opts) {
  opts = opts || {};
  const imgs = (assets && assets.imgs) || {};
  ctx.save();
  ctx.fillStyle = "#07070c";
  ctx.fillRect(0, 0, W, H);
  drawBackdrop(ctx, t);
  /* stacked scenes with crossfade */
  const order = ["title", "shop", "xianyu", "idea", "birth", "keys", "market", "demo"];
  order.forEach((id) => {
    const a = sceneW(id, t);
    if (a <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = a;
    if (id === "title") drawTitle(ctx, t, imgs);
    else if (id === "shop") drawShop(ctx, t, assets);
    else if (id === "xianyu") drawXianyu(ctx, t, assets);
    else if (id === "idea") drawIdea(ctx, t, assets);
    else if (id === "birth") drawBirth(ctx, t, assets);
    else if (id === "keys") drawKeys(ctx, t, assets);
    else if (id === "market") drawMarket(ctx, t, assets);
    else if (id === "demo") drawDemo(ctx, t, assets);
    ctx.restore();
  });
  drawVignette(ctx, t);
  drawGrain(ctx, t);
  drawCharacter(ctx, t, assets);
  drawPops(ctx, t);
  if (opts.showSubs !== false) drawSubs(ctx, t);
  ctx.restore();
}

function drawBackdrop(ctx, t) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.38, 40, W * 0.5, H * 0.4, 900);
  const heat = sceneW("shop", t) * 0.7 + sceneW("birth", t) * 0.4 + sceneW("demo", t) * 0.3;
  g.addColorStop(0, "rgba(255,90,40," + (0.10 + 0.12 * heat) + ")");
  g.addColorStop(0.45, "rgba(40,18,60,0.35)");
  g.addColorStop(1, "rgba(5,5,8,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  /* floating orbs */
  for (let i = 0; i < 6; i++) {
    const px = W * (0.15 + 0.7 * ((i * 0.37 + t * 0.012 * (1 + i * 0.1)) % 1));
    const py = H * (0.12 + 0.5 * ((i * 0.19 + t * 0.008) % 1));
    const rad = 80 + i * 30;
    const og = ctx.createRadialGradient(px, py, 0, px, py, rad);
    const col = i % 2 ? "255,193,74" : "255,106,61";
    og.addColorStop(0, "rgba(" + col + ",0.14)");
    og.addColorStop(1, "rgba(" + col + ",0)");
    ctx.fillStyle = og;
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fill();
  }
}

function drawVignette(ctx, t) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 920);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.62)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawGrain(ctx, t) {
  const frame = Math.floor(t * 60);
  let s = (frame * 1103515245 + 12345) & 0x7fffffff;
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 180; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % W;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const y = s % H;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const a = 80 + (s % 140);
    ctx.fillStyle = "rgb(" + a + "," + a + "," + a + ")";
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, t) {
  const p = smooth(t / 1.6);
  const rise = (1 - easeOutCubic(p)) * 40;
  ctx.save();
  ctx.translate(0, -rise);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,193,74," + (0.85 * p) + ")";
  ctx.font = "500 22px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("第一人称 · 我为什么做这款软件", W / 2, 430);
  const title = "把平板变成方向盘";
  ctx.font = "800 86px 'Noto Sans CJK SC', sans-serif";
  const tg = ctx.createLinearGradient(200, 0, 880, 0);
  tg.addColorStop(0, "#fff3e0");
  tg.addColorStop(0.5, "#ffb25a");
  tg.addColorStop(1, "#ff6a3d");
  ctx.fillStyle = tg;
  ctx.shadowColor = "rgba(255,106,61,0.45)";
  ctx.shadowBlur = 28 * p;
  ctx.fillText(title, W / 2, 560);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(246,239,230," + (0.8 * p) + ")";
  ctx.font = "600 36px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("HarmonyController", W / 2, 640);
  /* orbiting chips */
  const chips = ["键盘", "触摸板", "手柄", "驾驶", "飞行"];
  chips.forEach((c, i) => {
    const ang = t * 0.7 + i * (Math.PI * 2 / chips.length);
    const x = W / 2 + Math.cos(ang) * 280;
    const y = 860 + Math.sin(ang) * 70;
    const a = p * (0.55 + 0.45 * pulse(t + i, 3));
    ctx.globalAlpha = a;
    fillRR(ctx, x - 70, y - 28, 140, 56, 28, "rgba(255,255,255,0.08)");
    strokeRR(ctx, x - 70, y - 28, 140, 56, 28, "rgba(255,193,74,0.55)", 1.5);
    ctx.fillStyle = "#ffe8c8";
    ctx.font = "600 24px 'Noto Sans CJK SC', sans-serif";
    ctx.fillText(c, x, y + 8);
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}

function virtualBadge(ctx, x, y) {
  fillRR(ctx, x, y, 210, 36, 8, "rgba(0,0,0,0.72)");
  strokeRR(ctx, x, y, 210, 36, 8, "rgba(255,193,74,0.8)", 1);
  ctx.fillStyle = "#ffd27a";
  ctx.font = "600 16px 'Noto Sans CJK SC', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("虚拟示意价格", x + 16, y + 24);
}

function productCard(ctx, x, y, w, h, img, price, t, slam) {
  const k = easeOutBack(slam);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(lerp(0.82, 1, k), lerp(0.82, 1, k));
  ctx.translate(-(x + w / 2), -(y + h / 2));
  fillRR(ctx, x, y, w, h, 28, "#14141c");
  strokeRR(ctx, x, y, w, h, 28, "rgba(255,255,255,0.08)", 1.5);
  /* mosaic product */
  ctx.save();
  rr(ctx, x + 18, y + 18, w - 36, h * 0.52, 18); ctx.clip();
  if (img) drawCover(ctx, img, x + 18, y + 18, w - 36, h * 0.52);
  else ctx.fillRect(x + 18, y + 18, w - 36, h * 0.52);
  ctx.restore();
  /* name bars (censored) */
  const ny = y + h * 0.52 + 36;
  fillRR(ctx, x + 28, ny, w * 0.62, 22, 6, "#2a2a36");
  fillRR(ctx, x + 28, ny + 32, w * 0.4, 16, 5, "#23232e");
  /* price left visible, slams */
  const py = y + h - 92;
  const pScale = 1 + 0.18 * easeOutElastic(slam);
  ctx.save();
  ctx.translate(x + 36, py + 30);
  ctx.scale(pScale, pScale);
  ctx.fillStyle = "#ff4d2e";
  ctx.font = "800 52px 'Noto Sans CJK SC', sans-serif";
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(255,70,40,0.55)";
  ctx.shadowBlur = 16 * slam;
  ctx.fillText(price, 0, 0);
  ctx.restore();
  virtualBadge(ctx, x + w - 230, y + h - 54);
  ctx.restore();
}

function drawShop(ctx, t, assets) {
  const local = t - 9.4;
  ctx.textAlign = "center";
  ctx.fillStyle = "#f6efe6";
  ctx.font = "700 42px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("购物网站 · 虚拟商品页", W / 2, 160);
  ctx.fillStyle = "rgba(246,239,230,0.55)";
  ctx.font = "400 20px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("示意页面 · 商品与名称已打码 · 价格为虚构", W / 2, 200);

  /* fake site chrome */
  fillRR(ctx, 70, 230, 940, 86, 20, "#101018");
  fillRR(ctx, 96, 254, 28, 28, 14, "#ff6a3d");
  fillRR(ctx, 136, 258, 520, 30, 10, "#1c1c26");
  ctx.fillStyle = "#8d8a86";
  ctx.font = "400 18px 'Noto Sans CJK SC', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("搜   索    方 向 盘", 150, 280);

  const slam1 = smooth((t - 13.2) / 0.45);
  const slam2 = smooth((t - 14.0) / 0.45);
  const shock = smooth((t - 19.4) / 0.25);
  productCard(ctx, 80, 360, 440, 620, assets.mosaic && assets.mosaic.wheel, "¥ 1,299", t, slam1);
  productCard(ctx, 560, 360, 440, 620, assets.mosaic && assets.mosaic.stick, "¥ 2,499", t, slam2);
  /* flying prices after shock */
  if (shock > 0) {
    ctx.save();
    ctx.globalAlpha = (1 - smooth((t - 20.8) / 1.2)) * shock;
    ctx.fillStyle = "#ff4d2e";
    ctx.font = "800 96px 'Noto Sans CJK SC', sans-serif";
    ctx.textAlign = "center";
    const dy = -80 * easeOutCubic(sat((t - 19.6) / 1.1));
    ctx.fillText("太贵了", W / 2, 330 + dy);
    ctx.restore();
  }
}

function drawXianyu(ctx, t, assets) {
  const imgs = assets.imgs || {};
  ctx.textAlign = "center";
  if (imgs.xianyu) {
    const iw = 420, ih = 140;
    ctx.save();
    fillRR(ctx, W / 2 - iw / 2 - 10, 130, iw + 20, ih + 16, 16, "#ffe400");
    drawContain(ctx, imgs.xianyu, W / 2 - iw / 2, 138, iw, ih);
    ctx.restore();
  } else {
    ctx.fillStyle = "#ffe400";
    ctx.font = "800 64px 'Noto Sans CJK SC', sans-serif";
    ctx.fillText("闲鱼", W / 2, 210);
  }
  ctx.fillStyle = "rgba(246,239,230,0.7)";
  ctx.font = "400 20px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("二手 / DIY · 仍是小几百 · 虚拟示意价格", W / 2, 310);

  const items = [
    { x: 70, price: "¥ 329", img: assets.mosaic && assets.mosaic.diy, delay: 0 },
    { x: 390, price: "¥ 459", img: assets.mosaic && assets.mosaic.wheel, delay: 0.12 },
    { x: 710, price: "¥ 188", img: assets.mosaic && assets.mosaic.stick, delay: 0.24 }
  ];
  items.forEach((it) => {
    const sl = smooth((t - 24.2 - it.delay) / 0.4);
    productCard(ctx, it.x, 350, 300, 520, it.img, it.price, t, sl);
  });
}

function drawIdea(ctx, t, assets) {
  const imgs = assets.imgs || {};
  const local = t - 35.2;
  const pop = easeOutBack(smooth(local / 0.8));
  ctx.save();
  ctx.translate(W / 2, 430);
  ctx.rotate(-0.12 + 0.04 * Math.sin(t * 0.8));
  ctx.scale(pop, pop);
  ctx.translate(-W / 2, -430);
  if (imgs.padHero) drawContain(ctx, imgs.padHero, 140, 160, 800, 700);
  if (imgs.padFront) {
    ctx.save();
    ctx.translate(720, 620);
    ctx.rotate(0.18);
    drawContain(ctx, imgs.padFront, -180, -140, 360, 460);
    ctx.restore();
  }
  ctx.restore();
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe8c8";
  ctx.font = "700 40px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("我手头就有一台 MatePad mini", W / 2, 920);

  /* AI logos assemble */
  const logos = [
    { img: imgs.gemini, label: "Gemini", x: 360 },
    { img: imgs.chatgpt, label: "ChatGPT", x: 600 },
    { img: imgs.grok, label: "Grok Bot", x: 840 }
  ];
  logos.forEach((L, i) => {
    const a = easeOutBack(smooth((t - 39.6 - i * 0.18) / 0.45));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(L.x + 90, 1100);
    ctx.scale(lerp(0.6, 1, a), lerp(0.6, 1, a));
    fillRR(ctx, -100, -70, 200, 150, 24, "rgba(255,255,255,0.06)");
    strokeRR(ctx, -100, -70, 200, 150, 24, "rgba(255,255,255,0.16)", 1.5);
    if (L.img) drawContain(ctx, L.img, -88, -58, 176, 80);
    ctx.fillStyle = "#f6efe6";
    ctx.font = "600 20px 'Noto Sans CJK SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(L.label, 0, 62);
    ctx.restore();
  });
}

function drawBirth(ctx, t, assets) {
  const imgs = assets.imgs || {};
  const bang = easeOutElastic(smooth((t - 53.2) / 0.7));
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(W / 2, 260);
  ctx.scale(lerp(0.8, 1, bang), lerp(0.8, 1, bang));
  ctx.fillStyle = "#ffc14a";
  ctx.font = "700 28px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("VIBE CODING", 0, 0);
  const hg = ctx.createLinearGradient(-400, 0, 400, 0);
  hg.addColorStop(0, "#ff6a3d");
  hg.addColorStop(1, "#ffe0a0");
  ctx.fillStyle = hg;
  ctx.font = "800 64px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("HarmonyController", 0, 80);
  ctx.restore();

  ctx.fillStyle = "rgba(246,239,230,0.8)";
  ctx.font = "400 24px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("把鸿蒙平板 / 手机，变成 Windows 上的控制台", W / 2, 390);

  /* tablet with stylized (not real) panel — kept above the feature cards + caption lane */
  if (imgs.padFront) {
    const px = 220, py = 410, pw = 640, ph = 380;
    drawContain(ctx, imgs.padFront, px, py, pw, ph);
  }
  const modes = [
    { t: "键盘", s: "快捷键 / 配列" },
    { t: "触摸板", s: "常驻或吸附" },
    { t: "标准手柄", s: "Xbox / DS5" },
    { t: "驾驶面板", s: "方向盘 / 踏板" },
    { t: "飞行面板", s: "节流阀 / 摇杆" },
    { t: "连接方式", s: "Wi-Fi / 数据线" }
  ];
  modes.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 300 + col * 252, y = 800 + row * 118;
    const a = easeOutBack(smooth((t - 62.4 - i * 0.10) / 0.4));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.scale(lerp(0.86, 1, a), lerp(0.86, 1, a));
    fillRR(ctx, 0, 0, 236, 104, 18, "rgba(255,255,255,0.06)");
    strokeRR(ctx, 0, 0, 236, 104, 18, "rgba(255,193,74,0.35)", 1.5);
    ctx.fillStyle = "#ffe8c8";
    ctx.textAlign = "left";
    ctx.font = "700 26px 'Noto Sans CJK SC', sans-serif";
    ctx.fillText(m.t, 16, 44);
    ctx.fillStyle = "rgba(246,239,230,0.65)";
    ctx.font = "400 16px 'Noto Sans CJK SC', sans-serif";
    ctx.fillText(m.s, 16, 78);
    ctx.restore();
  });
}

function drawKeys(ctx, t, assets) {
  const imgs = assets.imgs || {};
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe8c8";
  ctx.font = "800 48px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("按键，高自由度自定义", W / 2, 170);
  ctx.fillStyle = "rgba(246,239,230,0.65)";
  ctx.font = "400 22px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("自由拖动 · 缩放 · 横竖屏独立记忆 · 外观与绑定都可改", W / 2, 214);
  ctx.fillText("下方为界面示意，不是软件截图  ·  示例图槽可替换", W / 2, 250);

  /* stylized layout morphing on a tablet silhouette */
  const cx = W / 2, cy = 560;
  fillRR(ctx, 90, 270, 900, 490, 48, "#0e0e16");
  strokeRR(ctx, 90, 270, 900, 490, 48, "rgba(255,255,255,0.14)", 3);
  /* evolving keys */
  const keys = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const seed = i * 1.7;
    const phase = smooth((t - KEYS_MORPH - i * 0.08) / 0.5);
    const x0 = 200 + (i % 5) * 150;
    const y0 = 340 + Math.floor(i / 5) * 180;
    const x1 = 180 + ((i * 3) % 5) * 155 + 30 * Math.sin(t * 0.8 + seed);
    const y1 = 350 + Math.floor(((i * 3) % 10) / 5) * 210 + 16 * Math.cos(t * 0.6 + seed);
    const x = lerp(x0, x1, phase);
    const y = lerp(y0, y1, phase);
    const circle = i % 3 === 0 && phase > 0.4;
    const w = lerp(120, 100 + (i % 3) * 30, phase);
    const h = circle ? w : lerp(120, 80 + (i % 2) * 40, phase);
    keys.push({ x, y, w, h, circle, phase, label: ["A", "B", "LB", "RT", "↑", "刹车", "油门", "开火", "菜单", "自定义"][i] });
  }
  keys.forEach((k) => {
    if (k.phase <= 0) return;
    ctx.save();
    ctx.globalAlpha = k.phase;
    ctx.translate(k.x, k.y);
    ctx.scale(easeOutBack(k.phase), easeOutBack(k.phase));
    if (k.circle) {
      ctx.beginPath(); ctx.arc(0, 0, k.w / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,106,61,0.9)"; ctx.fill();
    } else {
      fillRR(ctx, -k.w / 2, -k.h / 2, k.w, k.h, 22, "rgba(255,193,74,0.16)");
      strokeRR(ctx, -k.w / 2, -k.h / 2, k.w, k.h, 22, "rgba(255,193,74,0.7)", 2);
    }
    ctx.fillStyle = "#fff6ea";
    ctx.font = "700 22px 'Noto Sans CJK SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(k.label, 0, 8);
    ctx.restore();
  });

  /* three replaceable slots */
  const slots = [
    { img: imgs.slotFlight, t: "飞行示例图槽" },
    { img: imgs.slotDriving, t: "驾驶示例图槽" },
    { img: imgs.slotFighting, t: "格斗示例图槽" }
  ];
  slots.forEach((s, i) => {
    const a = easeOutCubic(smooth((t - KEYS_SLOTS - i * 0.12) / 0.4));
    const x = 70 + i * 340, y = 775;
    ctx.save();
    ctx.globalAlpha = a;
    fillRR(ctx, x, y, 320, 188, 20, "#12121a");
    strokeRR(ctx, x, y, 320, 188, 20, "rgba(255,255,255,0.16)", 2);
    if (s.img) {
      rr(ctx, x + 10, y + 8, 300, 138, 14); ctx.clip();
      drawCover(ctx, s.img, x + 10, y + 8, 300, 138);
    }
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#ffd9a8";
    ctx.font = "600 18px 'Noto Sans CJK SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.t, x + 160, y + 170);
    ctx.restore();
  });
}

function drawMarket(ctx, t, assets) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe8c8";
  ctx.font = "800 48px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("预设市场", W / 2, 170);
  ctx.fillStyle = "rgba(246,239,230,0.7)";
  ctx.font = "400 24px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("按游戏下载 · 发布自己的方案 · 导出或分享文件", W / 2, 216);

  const cards = [
    { title: "推荐", desc: "进入市场即可看到推荐包", tag: "精选" },
    { title: "下载 / 导入", desc: "按模式下载，点应用后才切换", tag: "本机库" },
    { title: "发布", desc: "把个人预设组成包，发布到市场", tag: "上传" },
    { title: "分享 / 导出", desc: "系统分享或导出 .hc.json 文件", tag: "文件" }
  ];
  cards.forEach((c, i) => {
    const a = easeOutBack(smooth((t - MARKET_CARDS - i * 0.1) / 0.4));
    const col = i % 2, row = Math.floor(i / 2);
    const x = 80 + col * 500, y = 250 + row * 330;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x + 230, y + 160);
    ctx.scale(lerp(0.8, 1, a), lerp(0.8, 1, a));
    ctx.translate(-(x + 230), -(y + 160));
    fillRR(ctx, x, y, 460, 290, 28, "rgba(255,255,255,0.06)");
    strokeRR(ctx, x, y, 460, 290, 28, "rgba(255,193,74,0.4)", 2);
    fillRR(ctx, x + 28, y + 28, 90, 36, 10, "#ff6a3d");
    ctx.fillStyle = "#fff";
    ctx.font = "700 18px 'Noto Sans CJK SC', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(c.tag, x + 44, y + 52);
    ctx.fillStyle = "#fff3e0";
    ctx.font = "800 40px 'Noto Sans CJK SC', sans-serif";
    ctx.fillText(c.title, x + 28, y + 130);
    ctx.fillStyle = "rgba(246,239,230,0.75)";
    ctx.font = "400 24px 'Noto Sans CJK SC', sans-serif";
    wrapText(ctx, c.desc, x + 28, y + 190, 400, 34);
    ctx.restore();
  });
}

function wrapText(ctx, text, x, y, maxW, lh) {
  let line = "";
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW) {
      ctx.fillText(line, x, y); y += lh; line = ch;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
}

function drawDemo(ctx, t, assets) {
  const p = easeOutCubic(smooth((t - DEMO_IN) / 0.7));
  ctx.save();
  ctx.globalAlpha = p;
  /* film strip */
  fillRR(ctx, 80, 360, 920, 520, 8, "#140e0c");
  for (let i = 0; i < 9; i++) {
    fillRR(ctx, 110 + i * 96, 380, 44, 28, 4, "#2a1c14");
    fillRR(ctx, 110 + i * 96, 832, 44, 28, 4, "#2a1c14");
  }
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffc14a";
  ctx.font = "700 28px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("NEXT REEL", W / 2, 500);
  ctx.fillStyle = "#fff6ea";
  ctx.font = "800 64px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("接下来是实用演示", W / 2, 620);
  ctx.fillStyle = "rgba(246,239,230,0.7)";
  ctx.font = "400 26px 'Noto Sans CJK SC', sans-serif";
  ctx.fillText("这一段由我自己录好，接在后面", W / 2, 700);
  ctx.restore();
}

function activePop(t) {
  let hit = null;
  POPS.forEach((p) => {
    if (t >= p.t0 - 0.05 && t <= p.t1 + 0.35) hit = p;
  });
  return hit;
}

function mascotFor(t) {
  const p = activePop(t);
  if (p && p.kind === "manbo") return "mascotShock";
  if (p && p.kind === "oye") return "mascotCelebrate";
  if (t >= IDEA_FROM && t < IDEA_TO) return "mascotIdea";
  if (t >= CELEB_FROM && t < CELEB_TO) return "mascotCelebrate";
  return "mascotIdle";
}

function isIdleBlink(t) {
  if (mascotFor(t) !== "mascotIdle") return false;
  if (activePop(t)) return false;
  const cycle = 3.15;
  const phase = ((t % cycle) + cycle) % cycle;
  return phase > 2.98 && phase < 3.12;
}

function drawCharacter(ctx, t, assets) {
  const key = isIdleBlink(t) ? "mascotBlink" : mascotFor(t);
  const canvasImg = assets.mascot && assets.mascot[key];
  const img = canvasImg || (assets.imgs && assets.imgs[key]);
  if (!img) return;
  const pop = activePop(t);
  const bounce = pop ? 18 * Math.sin(sat((t - pop.t0) / 0.28) * Math.PI) : 5 * Math.sin(t * 2.05);
  const sway = pop ? 0 : 0.028 * Math.sin(t * 1.35);
  const breath = 1 + 0.012 * Math.sin(t * 2.05);
  const x = 0, y = H - 385 + bounce, w = 248, h = 360;
  ctx.save();
  ctx.globalAlpha = 0.98;
  ctx.translate(x + w / 2, y + h);
  ctx.rotate(sway);
  ctx.scale(breath, breath);
  ctx.translate(-(x + w / 2), -(y + h));
  drawContain(ctx, img, x, y, w, h);
  ctx.restore();
}

function drawPops(ctx, t) {
  const p = activePop(t);
  if (!p) return;
  const k = easeOutBack(sat((t - p.t0) / 0.18));
  const fade = 1 - smooth((t - p.t1) / 0.3);
  ctx.save();
  ctx.globalAlpha = k * fade;
  const x = 290, y = H - 560;
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.scale(k * 1.05, k * 1.05);
  ctx.fillStyle = p.kind === "oye" ? "#ff6a3d" : "#ffc14a";
  ctx.strokeStyle = "#1a0e08";
  ctx.lineWidth = 16;
  ctx.font = "900 92px 'Noto Sans CJK SC', sans-serif";
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  ctx.strokeText(p.text, 0, 0);
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
}

function wrapCaption(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return [text];
  const tokens = [];
  let buf = "";
  for (const ch of text) {
    if (/[A-Za-z0-9.+#]/.test(ch)) buf += ch;
    else {
      if (buf) { tokens.push(buf); buf = ""; }
      tokens.push(ch);
    }
  }
  if (buf) tokens.push(buf);
  const lines = [];
  let line = "";
  for (const tok of tokens) {
    const test = line + tok;
    if (line && ctx.measureText(test).width > maxW) {
      lines.push(line);
      line = tok.replace(/^\s+/, "");
    } else line = test;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function drawSubs(ctx, t) {
  let cur = null;
  for (let i = 0; i < SUBS.length; i++) {
    if (t >= SUBS[i].t0 && t < SUBS[i].t1) cur = SUBS[i];
  }
  if (!cur) return;
  const text = cur.text;
  /* Reserved caption lane to the right of the lower-left character.
   * Content in each scene is laid out above y ≈ 1180 so cards never sit under this bar. */
  const laneLeft = 310;
  const laneRight = W - 28;
  const laneW = laneRight - laneLeft;
  const padX = 22, padY = 14, lh = 44;
  ctx.save();
  ctx.font = "700 32px 'Noto Sans CJK SC', sans-serif";
  const lines = wrapCaption(ctx, text, laneW - padX * 2);
  const tw = Math.max(...lines.map((s) => ctx.measureText(s).width));
  const boxW = Math.min(laneW, tw + padX * 2);
  const boxH = lines.length * lh + padY * 2;
  const x = laneLeft + (laneW - boxW) / 2;
  const y = H - 24 - boxH;
  fillRR(ctx, x, y, boxW, boxH, 16, "rgba(6,6,10,0.78)");
  ctx.fillStyle = cur.pop ? "#ffc14a" : "#fff6ea";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const cx = x + boxW / 2;
  lines.forEach((s, i) => ctx.fillText(s, cx, y + padY + i * lh));
  ctx.restore();
}
