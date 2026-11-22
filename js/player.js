(function () {
  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const audio = document.getElementById("voice");
  const seek = document.getElementById("seek");
  const playBtn = document.getElementById("play");
  const timeEl = document.getElementById("time");
  const vol = document.getElementById("vol");
  const subsBtn = document.getElementById("subs");
  const lrcBtn = document.getElementById("lrc");
  const fsBtn = document.getElementById("fs");
  const hint = document.getElementById("hint");

  const assets = { ready: false, imgs: {} };
  const paths = {
    mascotIdle: "assets/mascot/idle.png",
    mascotShock: "assets/mascot/shock.png",
    mascotIdea: "assets/mascot/idea.png",
    mascotCelebrate: "assets/mascot/celebrate.png",
    mascotBlink: "assets/mascot/blink.png",
    wheel: "assets/products/wheel.jpg",
    stick: "assets/products/stick.jpg",
    diy: "assets/products/diy.jpg",
    padFront: "assets/brand/matepad-mini-green.png",
    padHero: "assets/brand/matepad-mini-hero.png",
    padHand: "assets/brand/matepad-mini-in-hand.png",
    xianyu: "assets/logos/xianyu-goofish.png",
    gemini: "assets/logos/gemini-lockup.png",
    chatgpt: "assets/logos/openai-blossom-white.png",
    grok: "assets/logos/grok-white.png",
    layout1: "assets/slots/layout-01.png",
    layout2: "assets/slots/layout-02.png",
    layout3: "assets/slots/layout-03.png",
    layout4: "assets/slots/layout-04.png",
    layout5: "assets/slots/layout-05.png",
    layout6: "assets/slots/layout-06.png",
    layout7: "assets/slots/layout-07.png"
  };

  let showSubs = true;
  let playing = false;
  let raf = 0;
  let lastDom = 0;
  let lastShown = "";

  function fmt(t) {
    t = Math.max(0, t);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  /* Sole clock: audio.currentTime. Playback file is film-length
   * (5.00s leading silence + narration + trailing silence = DURATION). */
  function filmTime() {
    const a = audio.currentTime || 0;
    if (a < 0) return 0;
    if (a > DURATION) return DURATION;
    return a;
  }

  function seekTo(t) {
    t = Math.max(0, Math.min(DURATION, t));
    try { audio.currentTime = t; } catch (e) {}
    seek.value = t.toFixed(2);
    paint(t);
    if (playing && audio.paused && t < DURATION - 0.05) {
      audio.play().catch(function () {});
    }
  }

  function paint(t) {
    if (assets.ready) {
      renderAt(ctx, t, assets, { showSubs: showSubs, playing: playing });
    } else {
      ctx.fillStyle = "#eef5fc";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#0b2a5c";
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("正在载入画面…", W / 2, H / 2);
    }
    const now = (typeof performance !== "undefined") ? performance.now() : 0;
    if (now - lastDom > 80) {
      lastDom = now;
      if (!seek.matches(":active")) seek.value = t.toFixed(2);
      const label = fmt(t) + " / " + fmt(DURATION);
      if (label !== lastShown) {
        lastShown = label;
        timeEl.textContent = label;
      }
    }
  }

  function tick() {
    if (!playing) return;
    const t = filmTime();
    paint(t);
    if (t >= DURATION - 1 / 60 || audio.ended) {
      playing = false;
      playBtn.textContent = "重播";
      if (!audio.paused) audio.pause();
      paint(DURATION);
      seek.value = DURATION.toFixed(2);
      timeEl.textContent = fmt(DURATION) + " / " + fmt(DURATION);
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function play() {
    hint.classList.add("hidden");
    if (filmTime() >= DURATION - 0.05) seekTo(0);
    playing = true;
    playBtn.textContent = "暂停";
    audio.play().catch(function () {});
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function pause() {
    playing = false;
    audio.pause();
    playBtn.textContent = "继续";
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    paint(filmTime());
  }

  async function loadImage(src) {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    await new Promise(function (res) {
      im.onload = res;
      im.onerror = res;
    });
    if (!im.naturalWidth) return null;
    try { if (im.decode) await im.decode(); } catch (e) {}
    if (typeof createImageBitmap === "function") {
      try { return await createImageBitmap(im); } catch (e) { return im; }
    }
    return im;
  }

  function mosaicImage(img, tiles) {
    const c = document.createElement("canvas");
    const w = 640, h = 640;
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    const s = Math.max(w / iw, h / ih);
    g.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
    const tmp = document.createElement("canvas");
    tmp.width = tiles; tmp.height = tiles;
    const tg = tmp.getContext("2d");
    tg.imageSmoothingEnabled = false;
    tg.drawImage(c, 0, 0, tiles, tiles);
    g.imageSmoothingEnabled = false;
    g.drawImage(tmp, 0, 0, w, h);
    return c;
  }

  async function loadAssets() {
    const imgs = {};
    await Promise.all(Object.keys(paths).map(async function (k) {
      const im = await loadImage(paths[k]);
      if (im) imgs[k] = im;
    }));
    assets.imgs = imgs;
    assets.mascot = {};
    ["mascotIdle", "mascotShock", "mascotIdea", "mascotCelebrate", "mascotBlink"].forEach(function (k) {
      if (imgs[k]) assets.mascot[k] = imgs[k];
    });
    assets.mosaic = {};
    ["wheel", "stick", "diy"].forEach(function (k) {
      if (imgs[k]) assets.mosaic[k] = mosaicImage(imgs[k], 18);
    });
    if (typeof ensureFX === "function") ensureFX();
    assets.ready = true;
    paint(filmTime());
  }

  playBtn.addEventListener("click", function () {
    if (!playing) play();
    else pause();
  });
  canvas.addEventListener("click", function () { playBtn.click(); });
  seek.addEventListener("input", function () {
    hint.classList.add("hidden");
    seekTo(Number(seek.value));
  });
  vol.addEventListener("input", function () { audio.volume = Number(vol.value); });
  subsBtn.addEventListener("click", function () {
    showSubs = !showSubs;
    subsBtn.classList.toggle("active", showSubs);
    subsBtn.textContent = showSubs ? "字幕开" : "字幕关";
    paint(filmTime());
  });
  lrcBtn.addEventListener("click", function () {
    const body = exportLrc();
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "harmony-controller-intro.lrc";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  fsBtn.addEventListener("click", function () {
    const el = document.getElementById("stage-wrap");
    if (!document.fullscreenElement) el.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  });
  audio.addEventListener("ended", function () {
    playing = false;
    playBtn.textContent = "重播";
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    paint(DURATION);
    seek.value = DURATION.toFixed(2);
    timeEl.textContent = fmt(DURATION) + " / " + fmt(DURATION);
  });
  seek.max = DURATION;
  seek.value = "0";
  audio.volume = 1;
  audio.preload = "auto";
  try { audio.load(); } catch (e) {}
  loadAssets();
  window.renderAtPublic = function (t) { renderAt(ctx, t, assets, { showSubs: true, playing: false }); };
  window.__HC = { seekTo: seekTo, filmTime: filmTime, DURATION: DURATION, INTRO: INTRO, assets: assets, draw: function () { paint(filmTime()); } };
})();
