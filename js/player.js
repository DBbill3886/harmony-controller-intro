(function () {
  const canvas = document.getElementById("view");
  const ctx = canvas.getContext("2d", { alpha: false });
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
    slotFlight: "assets/slots/slot-flight.png",
    slotDriving: "assets/slots/slot-driving.png",
    slotFighting: "assets/slots/slot-fighting.png"
  };

  let showSubs = true;
  let playing = false;
  let lastMediaT = 0;
  let kickoff = false;
  let raf = 0;

  function fmt(t) {
    t = Math.max(0, t);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function filmTime() {
    if (!kickoff) return Number(seek.value) || 0;
    const a = audio.currentTime || 0;
    return Math.min(DURATION, a + INTRO);
  }

  function seekTo(t) {
    t = Math.max(0, Math.min(DURATION, t));
    seek.value = t.toFixed(2);
    const a = Math.max(0, t - INTRO);
    if (t < INTRO) {
      if (!audio.paused) audio.pause();
      audio.currentTime = 0;
      if (playing) {
        /* hold until intro ends via ticker */
      }
    } else {
      audio.currentTime = Math.min(AUDIO_DUR, a);
      if (playing && audio.paused && a < AUDIO_DUR - 0.05) {
        audio.play().catch(() => {});
      }
    }
    draw();
  }

  function draw(ts) {
    const t = filmTime();
    if (!seek.matches(":active")) seek.value = t.toFixed(2);
    timeEl.textContent = fmt(t) + " / " + fmt(DURATION);
    if (assets.ready) {
      renderAt(ctx, t, assets, { showSubs: showSubs, playing: playing });
    } else {
      ctx.fillStyle = "#07070c";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("正在载入画面…", W / 2, H / 2);
    }
    if (playing) {
      if (t >= INTRO - 0.02 && audio.paused && t < INTRO + AUDIO_DUR - 0.05) {
        audio.play().catch(() => {});
      }
      if (t >= DURATION - 0.02) {
        playing = false;
        playBtn.textContent = "重播";
        audio.pause();
      } else {
        raf = requestAnimationFrame(draw);
      }
    }
  }

  async function loadAssets() {
    const imgs = {};
    await Promise.all(Object.entries(paths).map(([k, src]) => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => { imgs[k] = im; res(); };
      im.onerror = () => { console.warn("missing", src); res(); };
      im.src = src;
    })));
    assets.imgs = imgs;
    assets.ready = true;
    /* Q-version 待兼诗歌剧 already keyed to transparent PNG; do not re-key (would eat dark outlines). */
    assets.mascot = {};
    ["mascotIdle", "mascotShock", "mascotIdea", "mascotCelebrate", "mascotBlink"].forEach((k) => {
      if (imgs[k]) assets.mascot[k] = imgs[k];
    });
    assets.mosaic = {};
    ["wheel", "stick", "diy"].forEach((k) => {
      if (imgs[k]) assets.mosaic[k] = mosaicImage(imgs[k], 18);
    });
    draw();
  }

  function keyBlack(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const data = g.getImageData(0, 0, c.width, c.height);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gv = d[i + 1], b = d[i + 2];
      const m = Math.max(r, gv, b);
      if (m < 18) d[i + 3] = 0;
      else if (m < 36) d[i + 3] = Math.round(d[i + 3] * (m - 18) / 18);
    }
    g.putImageData(data, 0, 0);
    return c;
  }

  function mosaicImage(img, tiles) {
    const c = document.createElement("canvas");
    const w = 640, h = 640;
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(w / iw, h / ih);
    g.drawImage(img, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
    const tw = Math.ceil(w / tiles), th = Math.ceil(h / tiles);
    const tmp = document.createElement("canvas");
    tmp.width = tiles; tmp.height = tiles;
    const tg = tmp.getContext("2d");
    tg.imageSmoothingEnabled = false;
    tg.drawImage(c, 0, 0, tiles, tiles);
    g.imageSmoothingEnabled = false;
    g.drawImage(tmp, 0, 0, w, h);
    /* extra barcode bars over the center-ish name area later in layout */
    return c;
  }

  playBtn.addEventListener("click", () => {
    kickoff = true;
    hint.classList.add("hidden");
    if (!playing) {
      if (filmTime() >= DURATION - 0.05) seekTo(0);
      playing = true;
      playBtn.textContent = "暂停";
      if (filmTime() >= INTRO) audio.play().catch(() => {});
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    } else {
      playing = false;
      audio.pause();
      playBtn.textContent = "继续";
    }
  });
  canvas.addEventListener("click", () => playBtn.click());
  seek.addEventListener("input", () => {
    kickoff = true;
    hint.classList.add("hidden");
    seekTo(Number(seek.value));
  });
  vol.addEventListener("input", () => { audio.volume = Number(vol.value); });
  subsBtn.addEventListener("click", () => {
    showSubs = !showSubs;
    subsBtn.classList.toggle("active", showSubs);
    subsBtn.textContent = showSubs ? "字幕开" : "字幕关";
    draw();
  });
  lrcBtn.addEventListener("click", () => {
    const body = exportLrc();
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "harmony-controller-intro.lrc";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  fsBtn.addEventListener("click", () => {
    const el = document.getElementById("stage-wrap");
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  });
  audio.addEventListener("ended", () => { /* demo hold continues until DURATION */ });
  seek.max = DURATION;
  audio.volume = 1;
  loadAssets();
  window.renderAtPublic = (t) => renderAt(ctx, t, assets, { showSubs: true, playing: false });
  window.__HC = { seekTo, filmTime, DURATION, INTRO, assets, draw };
})();
