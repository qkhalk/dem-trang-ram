/* Đêm Trăng Rằm · Tết Trung Thu 2026
   Kết cấu: từng màn hình riêng (hash router), pháo hoa lễ hội đúng đêm rằm */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rand = function (min, max) { return min + Math.random() * (max - min); };

  /* ---------- Bầu trời sao: nhấp nháy + sao băng ---------- */

  function Starfield(canvas, host) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var meteors = [];
    var w = 0, h = 0, dpr = 1;
    var running = false;
    var nextMeteorAt = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      stars = [];
      var count = Math.min(240, Math.round((w * h) / 7500));
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.08;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.92,
          r: big ? rand(1.4, 2.2) : rand(0.4, 1.2),
          base: rand(0.25, 0.8),
          amp: rand(0.15, 0.45),
          speed: rand(0.0006, 0.0022),
          phase: rand(0, Math.PI * 2),
          warm: Math.random() < 0.22,
          big: big
        });
      }
    }

    function spawnMeteor(x, y) {
      meteors.push({
        x: x != null ? x : rand(w * 0.25, w * 0.95),
        y: y != null ? y : rand(0, h * 0.35),
        vx: -rand(5.5, 8),
        vy: rand(2.6, 4),
        len: rand(110, 200),
        life: 1
      });
    }

    function drawStar(s, alpha) {
      ctx.globalAlpha = alpha;
      if (s.big) {
        // sao lớn có tia lấp lánh
        ctx.strokeStyle = s.warm ? '#F4C87E' : '#F2ECDF';
        ctx.lineWidth = 0.8;
        var t = s.r * 3.4;
        ctx.beginPath();
        ctx.moveTo(s.x - t, s.y); ctx.lineTo(s.x + t, s.y);
        ctx.moveTo(s.x, s.y - t); ctx.lineTo(s.x, s.y + t);
        ctx.stroke();
      }
      ctx.fillStyle = s.warm ? '#F4C87E' : '#F2ECDF';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(now) {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = s.base + s.amp * Math.sin(now * s.speed + s.phase);
        drawStar(s, Math.max(0.08, a));
      }

      if (now > nextMeteorAt) {
        spawnMeteor();
        nextMeteorAt = now + rand(4500, 9500);
      }

      for (var j = meteors.length - 1; j >= 0; j--) {
        var m = meteors[j];
        m.x += m.vx; m.y += m.vy; m.life -= 0.012;
        if (m.life <= 0 || m.x < -m.len || m.y > h + m.len) { meteors.splice(j, 1); continue; }
        var tailX = m.x - m.vx * (m.len / 8);
        var tailY = m.y - m.vy * (m.len / 8);
        var grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, 'rgba(255, 238, 196, ' + (0.9 * m.life) + ')');
        grad.addColorStop(1, 'rgba(255, 238, 196, 0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y); ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    this.start = function () {
      if (running) return;
      running = true;
      if (prefersReduced) {
        // tĩnh: vẽ một khung hình duy nhất
        running = false;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < stars.length; i++) drawStar(stars[i], stars[i].base);
        return;
      }
      nextMeteorAt = performance.now() + 2200;
      requestAnimationFrame(frame);
    };
    this.stop = function () { running = false; };
    this.shoot = function (x, y) { if (!prefersReduced) spawnMeteor(x, y); };

    resize();
    window.addEventListener('resize', resize);
  }

  /* ---------- Pháo hoa lễ hội ---------- */

  function Fireworks(canvas) {
    var ctx = canvas.getContext('2d');
    var parts = [];
    var w = 0, h = 0, dpr = 1;
    var running = false;
    var nextBurstAt = 0;
    var COLORS = ['#FFD98A', '#F4B95C', '#E8B45A', '#F07A4B', '#D4502F', '#FFF3D6'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y) {
      var col = COLORS[Math.floor(Math.random() * COLORS.length)];
      var col2 = COLORS[Math.floor(Math.random() * COLORS.length)];
      var rings = Math.random() < 0.35 ? 2 : 1;
      for (var r = 0; r < rings; r++) {
        var n = Math.floor(rand(34, 56));
        var speed = r === 0 ? rand(2.2, 4.6) : rand(1.1, 2);
        var c = r === 0 ? col : col2;
        var size = r === 0 ? rand(1.4, 2.4) : rand(1, 1.7);
        for (var i = 0; i < n; i++) {
          var ang = (Math.PI * 2 * i) / n + rand(-0.05, 0.05);
          var sp = speed * rand(0.85, 1.15);
          parts.push({
            x: x, y: y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            life: 1,
            decay: rand(0.008, 0.014),
            col: c,
            r: size
          });
        }
      }
    }

    function frame(now) {
      if (!running) return;

      // làm mờ khung cũ mà không phủ màu lên trang: xóa một phần mỗi khung
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      if (now > nextBurstAt) {
        burst(rand(w * 0.12, w * 0.88), rand(h * 0.1, h * 0.42));
        nextBurstAt = now + rand(700, 1500);
      }

      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.018;
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    this.start = function () {
      if (running || prefersReduced) return;
      running = true;
      parts = [];
      ctx.clearRect(0, 0, w, h);
      nextBurstAt = performance.now() + 300;
      requestAnimationFrame(frame);
    };
    this.stop = function () { running = false; ctx.clearRect(0, 0, w, h); };
    this.burst = function (x, y) { burst(x, y); };

    resize();
    window.addEventListener('resize', resize);
  }

  /* ---------- Bộ điều phối màn hình ---------- */

  var ORDER = ['home', 'truyen-thuyet', 'phong-tuc', 'uoc-nguyen'];
  var screens = {};
  var current = null;

  /* Chỉ chặn hiệu ứng khi bấm TRÚNG chữ hoặc nút — vùng trống (kể cả
     khoảng đệm quanh chữ) vẫn thả sao băng / pháo hoa, bôi đen chữ không bị phá */
  var CLICK_GUARD = 'a, button, input, form, label, select, textarea, p, h1, h2, h3, h4, span, strong, em, blockquote, figcaption, .count-grid, .festival-badge, .nav, .tabbar, .festival-toast';

  var sky = null;          // Starfield của màn home
  var heroVisible = true;  // đèn lồng hero chỉ bay khi home đang mở
  var wishShownOnce = false;
  var wishTimer = null;

  function playReveals(screenEl) {
    var els = screenEl.querySelectorAll('.reveal');
    if (prefersReduced) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    els.forEach(function (el) { el.classList.remove('in'); });
    void screenEl.offsetWidth; /* ép reflow để transition chạy lại */
    requestAnimationFrame(function () {
      els.forEach(function (el) { el.classList.add('in'); });
    });
  }

  function markNav(name) {
    var links = document.querySelectorAll('.nav-links a, .tabbar a');
    links.forEach(function (a) {
      var target = (a.getAttribute('href') || '').replace(/^#\//, '') || 'home';
      if (target === name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function goto(name) {
    if (ORDER.indexOf(name) < 0) name = 'home';
    if (name === current) return;

    var prev = current ? screens[current] : null;
    current = name;
    var el = screens[name];

    if (prev) prev.classList.remove('is-active');
    el.classList.add('is-active');
    el.scrollTop = 0;
    document.body.setAttribute('data-screen', name);
    markNav(name);
    playReveals(el);

    // sao chỉ chạy trên màn home
    if (sky) { name === 'home' ? sky.start() : sky.stop(); }
    heroVisible = (name === 'home');

    // đèn ước nguyện: đám đông lần đầu, chen nhẹ các lần sau
    if (name === 'uoc-nguyen') {
      if (!wishShownOnce) { wishShownOnce = true; crowdWishLanterns(22); }
      else if (!wishSky || wishSky.children.length < 8) { crowdWishLanterns(8); }
      startWishAmbient();
    } else {
      stopWishAmbient();
    }
  }

  function hashName() {
    var m = (location.hash || '').match(/^#\/([a-z-]*)/);
    return m ? m[1] : 'home';
  }

  window.addEventListener('hashchange', function () { goto(hashName()); });

  /* ---------- Lớp sao băng toàn cục: hoạt động trên mọi màn ---------- */

  function MeteorLayer(canvas) {
    var ctx = canvas.getContext('2d');
    var meteors = [];
    var w = 0, h = 0, dpr = 1, raf = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      for (var j = meteors.length - 1; j >= 0; j--) {
        var m = meteors[j];
        m.x += m.vx; m.y += m.vy; m.life -= 0.014;
        if (m.life <= 0 || m.x < -m.len || m.y > h + m.len) { meteors.splice(j, 1); continue; }
        alive = true;
        var tx = m.x - m.vx * (m.len / 8);
        var ty = m.y - m.vy * (m.len / 8);
        var g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, 'rgba(255, 238, 196, ' + (0.95 * m.life) + ')');
        g.addColorStop(1, 'rgba(255, 238, 196, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
      if (alive) { raf = requestAnimationFrame(frame); }
      else { raf = 0; ctx.clearRect(0, 0, w, h); }
    }

    this.shoot = function (x, y) {
      if (prefersReduced) return;
      meteors.push({ x: x, y: y, vx: -rand(5.5, 8), vy: rand(2.6, 4), len: rand(110, 200), life: 1 });
      if (!raf) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
  }

  /* ---------- Đèn ước nguyện (phạm vi module: goto() cũng gọi được) ---------- */

  var STORE_KEY = 'trungthu.wishes.v1';
  var seeds = ['Sức khoẻ cho ông bà', 'Cả nhà luôn sum họp', 'Thi học kỳ được điểm mười', 'Được một chiếc đèn ông sao mới'];
  var wishSky = null;
  var liveTimer = null;

  function loadWishes() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* localStorage có thể bị chặn */ }
    return null;
  }
  function saveWishes(list) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-24)));
    } catch (e) { /* bỏ qua */ }
  }

  function spawnWishLantern(text, delay) {
    if (!wishSky || prefersReduced) return;
    if (wishSky.children.length > 40) wishSky.firstElementChild.remove();

    var el = document.createElement('div');
    el.className = 'wl';
    el.dataset.hue = String(Math.floor(rand(0, 3)));
    el.style.setProperty('--x', rand(6, 82).toFixed(1) + '%');
    el.style.setProperty('--t', rand(15, 21).toFixed(1) + 's');
    el.style.setProperty('--d', (delay / 1000).toFixed(2) + 's');

    var sway = document.createElement('div');
    sway.className = 'wl-sway';
    sway.style.setProperty('--sw', rand(3.4, 5.2).toFixed(1) + 's');
    sway.innerHTML = '<svg viewBox="0 0 100 150"><use href="#lantern-round"/></svg>';

    var tag = document.createElement('span');
    tag.className = 'wl-tag';
    tag.textContent = text;

    el.appendChild(sway);
    el.appendChild(tag);
    el.addEventListener('animationend', function (ev) {
      if (ev.target === el) el.remove();
    });
    wishSky.appendChild(el);
  }

  function currentWishes() {
    var saved = loadWishes();
    return saved && saved.length ? saved : seeds;
  }

  function seedWishLanterns() {
    crowdWishLanterns(22);
  }

  /* Đám đông thả đèn: n đèn nối đuôi nhau, nhịp ngẫu nhiên như nhiều người thả */
  function crowdWishLanterns(n) {
    if (prefersReduced || !wishSky) return;
    var list = currentWishes();
    for (var i = 0; i < n; i++) {
      spawnWishLantern(list[i % list.length], 300 + i * rand(420, 820));
    }
  }

  function startWishAmbient() {
    if (prefersReduced) return;
    stopWishAmbient();
    wishTimer = setTimeout(function tick() {
      if (current === 'uoc-nguyen' && wishSky && wishSky.children.length < 40) {
        var list = currentWishes();
        spawnWishLantern(list[Math.floor(Math.random() * list.length)], 0);
        if (Math.random() < 0.6) {
          spawnWishLantern(list[Math.floor(Math.random() * list.length)], rand(150, 650));
        }
      }
      wishTimer = setTimeout(tick, rand(1300, 2400));
    }, 1000);
  }
  function stopWishAmbient() {
    if (wishTimer) { clearTimeout(wishTimer); wishTimer = null; }
  }

  /* ---------- Nhạc nền tự sinh (WebAudio, không cần file) ---------- */

  function MusicBox() {
    var ctx = null, master = null, timer = null, padOn = false, on = false;
    var NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; /* ngũ cung Đô */

    function ensure() {
      if (ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      return true;
    }

    function pluck(freq, when, vol) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      var o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o2.type = 'triangle'; o2.frequency.value = freq * 2; g2.gain.value = 0.1;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(vol, when + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 3);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
      o.start(when); o2.start(when);
      o.stop(when + 3.1); o2.stop(when + 3.1);
    }

    function pad() {
      if (padOn) return;
      padOn = true;
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
      o1.type = 'sine'; o1.frequency.value = 130.81;
      o2.type = 'sine'; o2.frequency.value = 196.0;
      g.gain.value = 0.045;
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 0.07; lg.gain.value = 0.02;
      lfo.connect(lg); lg.connect(g.gain);
      o1.connect(g); o2.connect(g); g.connect(master);
      o1.start(); o2.start(); lfo.start();
    }

    function schedule() {
      timer = setTimeout(function () {
        var t = ctx.currentTime;
        pluck(NOTES[Math.floor(Math.random() * NOTES.length)], t, 0.15);
        if (Math.random() < 0.4) {
          pluck(NOTES[Math.floor(Math.random() * NOTES.length)], t + 0.34, 0.09);
        }
        schedule();
      }, rand(1700, 3800));
    }

    this.start = function () {
      if (!ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (on) return;
      on = true;
      pad();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.4);
      schedule();
    };
    this.stop = function () {
      if (!ctx || !on) return;
      on = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      if (timer) { clearTimeout(timer); timer = null; }
    };
  }

  /* ---------- Khởi tạo ---------- */

  function init() {
    document.querySelectorAll('.screen').forEach(function (el) {
      screens[el.getAttribute('data-screen')] = el;
    });

    var hero = screens.home;

    /* Sao nền của màn chủ (nhấp nháy + sao băng ngẫu nhiên) */
    var canvas = document.getElementById('stars');
    if (canvas && hero) {
      sky = new Starfield(canvas, hero);
    }

    /* Con trỏ lễ hội: quầng sáng bay theo chuột */
    if (!prefersReduced && window.matchMedia('(pointer: fine)').matches) {
      var orb = document.createElement('div');
      orb.className = 'cursor-orb';
      var dotEl = document.createElement('div');
      dotEl.className = 'cursor-dot';
      document.body.appendChild(orb);
      document.body.appendChild(dotEl);
      var mx = -100, my = -100, ox = -100, oy = -100;

      document.addEventListener('pointermove', function (e) {
        mx = e.clientX; my = e.clientY;
        dotEl.style.left = mx + 'px';
        dotEl.style.top = my + 'px';
        document.body.classList.add('cursor-live');
      });
      document.addEventListener('pointerover', function (e) {
        orb.classList.toggle('is-hover', !!(e.target.closest && e.target.closest('a, button, .cell, .tabbar a, .ft-close')));
      });
      document.addEventListener('pointerdown', function () { orb.classList.add('is-down'); });
      document.addEventListener('pointerup', function () { orb.classList.remove('is-down'); });

      /* Đuôi sao lấp lánh rơi theo chuyển động chuột */
      var sparkleCanvas = document.createElement('canvas');
      sparkleCanvas.className = 'sparkles';
      document.body.appendChild(sparkleCanvas);
      var sctx = sparkleCanvas.getContext('2d');
      var sp = [], lastSX = -1, lastSY = -1, sRun = false;

      function sResize() {
        var dpr2 = Math.min(window.devicePixelRatio || 1, 2);
        sparkleCanvas.width = window.innerWidth * dpr2;
        sparkleCanvas.height = window.innerHeight * dpr2;
        sctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
      }
      sResize();
      window.addEventListener('resize', sResize);

      function sFrame() {
        sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (var i = sp.length - 1; i >= 0; i--) {
          var p = sp[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.life -= 0.018;
          if (p.life <= 0) { sp.splice(i, 1); continue; }
          sctx.globalAlpha = Math.max(0, p.life);
          sctx.fillStyle = p.col;
          sctx.beginPath();
          sctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          sctx.fill();
        }
        sctx.globalAlpha = 1;
        if (sp.length) { requestAnimationFrame(sFrame); }
        else { sRun = false; sctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
      }

      document.addEventListener('pointermove', function (e) {
        if (lastSX >= 0) {
          var dx = e.clientX - lastSX, dy = e.clientY - lastSY;
          var n = Math.min(3, Math.floor(Math.sqrt(dx * dx + dy * dy) / 16));
          for (var k = 0; k < n; k++) {
            if (sp.length > 90) sp.shift();
            sp.push({
              x: e.clientX + rand(-4, 4), y: e.clientY + rand(-4, 4),
              vx: rand(-0.4, 0.4), vy: rand(-0.5, 0.25),
              r: rand(0.8, 2.1), life: rand(0.55, 1),
              col: Math.random() < 0.75 ? '#F4C87E' : '#FFF3D6'
            });
          }
          if (sp.length && !sRun) { sRun = true; requestAnimationFrame(sFrame); }
        }
        lastSX = e.clientX; lastSY = e.clientY;
      });

      (function follow() {
        ox += (mx - ox) * 0.16;
        oy += (my - oy) * 0.16;
        orb.style.left = ox.toFixed(1) + 'px';
        orb.style.top = oy.toFixed(1) + 'px';
        requestAnimationFrame(follow);
      })();
    }

    /* Parallax nhẹ theo con trỏ */
    if (hero && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var rect = hero.getBoundingClientRect();
        hero.style.setProperty('--px', (((e.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--py', (((e.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
      });
      hero.addEventListener('pointerleave', function () {
        hero.style.setProperty('--px', 0);
        hero.style.setProperty('--py', 0);
      });
    }

    /* Đèn lồng bay trong hero (nhanh hơn trong đêm lễ hội) */
    var heroBox = document.getElementById('heroLanterns');
    if (heroBox && !prefersReduced) {
      var templates = [
        '<svg viewBox="0 0 100 150"><use href="#lantern-round"/></svg>',
        '<svg viewBox="0 -14 120 142"><use href="#star-lantern"/></svg>',
        '<svg viewBox="0 -8 150 112"><use href="#carp-lantern"/></svg>'
      ];
      var festivalMode = false;

      function spawnHeroLantern() {
        if (!heroVisible) return;
        var cap = festivalMode ? 12 : 10;
        if (heroBox.querySelectorAll('.fl[data-js]').length >= cap) return;
        var el = document.createElement('div');
        el.className = 'fl';
        el.dataset.js = '1';
        el.style.setProperty('--x', rand(4, 88).toFixed(1) + '%');
        el.style.setProperty('--s', rand(26, 54).toFixed(0) + 'px');
        el.style.setProperty('--t', rand(17, 26).toFixed(1) + 's');
        el.style.setProperty('--d', '0s');
        var sway = document.createElement('div');
        sway.className = 'fl-sway';
        sway.style.setProperty('--sw', rand(3.2, 5).toFixed(1) + 's');
        sway.innerHTML = templates[Math.floor(Math.random() * templates.length)];
        el.appendChild(sway);
        el.addEventListener('animationend', function () { el.remove(); });
        heroBox.appendChild(el);
      }

      (function loop() {
        spawnHeroLantern();
        var wait = festivalMode ? rand(1000, 1900) : rand(1700, 3000);
        setTimeout(loop, wait);
      })();

      window.setFestivalLanterns = function (on) { festivalMode = on; };
    }

    /* ---------- Nhạc nền: tự phát khi vào trang ----------
       Trình duyệt chặn tiếng trước cú chạm đầu tiên, nên:
       thử phát ngay — nếu bị treo ở trạng thái suspended thì
       cú chạm/click/phím đầu tiên sẽ đánh thức nó. Không cần nút. */

    var music = new MusicBox();

    var kick = function () {
      document.removeEventListener('pointerdown', kick);
      document.removeEventListener('keydown', kick);
      document.removeEventListener('touchstart', kick);
      music.start();
    };
    document.addEventListener('pointerdown', kick);
    document.addEventListener('keydown', kick);
    document.addEventListener('touchstart', kick, { passive: true });

    // nhiều trình duyệt cho phép nếu người dùng đã từng tương tác với trang này
    try { music.start(); } catch (e) { /* im lặng, chờ kick */ }

    /* ---------- Đếm ngược + đêm lễ hội ---------- */

    var START = new Date('2026-09-25T00:00:00+07:00').getTime();
    var END = new Date('2026-09-26T00:00:00+07:00').getTime();
    var elD = document.getElementById('cdDays');
    var elH = document.getElementById('cdHours');
    var elM = document.getElementById('cdMins');
    var elS = document.getElementById('cdSecs');
    var note = document.getElementById('countNote');
    var grid = document.querySelector('.count-grid');
    var badge = document.getElementById('festivalBadge');
    var toast = document.getElementById('festivalToast');
    var fireworks = new Fireworks(document.getElementById('fireworks'));
    var meteors = new MeteorLayer(document.getElementById('meteors'));
    var festivalOn = false;

    function showToast() {
      if (!toast) return;
      var seen = false;
      try { seen = sessionStorage.getItem('trungthu.toast.v1') === '1'; } catch (e) { /* bỏ qua */ }
      if (seen) return;
      try { sessionStorage.setItem('trungthu.toast.v1', '1'); } catch (e) { /* bỏ qua */ }
      toast.hidden = false;
      requestAnimationFrame(function () { toast.classList.add('show'); });
      var hide = function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.hidden = true; }, 500);
      };
      setTimeout(hide, 9000);
      var closeBtn = document.getElementById('festivalToastClose');
      if (closeBtn) closeBtn.addEventListener('click', hide);
    }

    function enableFestival() {
      if (festivalOn) return;
      festivalOn = true;
      document.body.classList.add('festival');
      if (badge) badge.hidden = false;
      if (grid) grid.hidden = true;
      fireworks.start();
      showToast();
      if (window.setFestivalLanterns) window.setFestivalLanterns(true);
    }

    // ?party=1: xem trước lễ hội mọi lúc (để khoe trước đêm hội)
    var party = new URLSearchParams(location.search).get('party');

    function tick() {
      var now = Date.now();
      if (now >= START && now < END) {
        enableFestival();
        if (note) note.textContent = 'Hôm nay là Trung Thu. Chúc cả nhà một đêm trăng thật tròn và thật vui.';
        return;
      }
      if (now >= END) {
        if (grid) grid.hidden = true;
        if (note) note.textContent = 'Tết Trung Thu 2026 đã đi qua — hẹn gặp lại một vầng trăng tròn khác.';
        return;
      }
      var diff = START - now;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var s = Math.floor(diff / 1000) % 60;
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      if (elD) elD.textContent = pad(d);
      if (elH) elH.textContent = pad(h);
      if (elM) elM.textContent = pad(m);
      if (elS) elS.textContent = pad(s);
      setTimeout(tick, 1000);
    }
    tick();

    if (party === '1') enableFestival();

    // Một handler duy nhất cho mọi màn: bấm vùng trống
    //  · thường        → thả sao băng
    //  · đêm lễ hội    → bắn pháo hoa
    // Bấm trúng chữ/nút thì bỏ qua để bôi đen văn bản bình thường
    document.addEventListener('click', function (e) {
      if (prefersReduced) return;
      if (e.target.closest(CLICK_GUARD)) return;
      if (festivalOn) fireworks.burst(e.clientX, e.clientY);
      else meteors.shoot(e.clientX, e.clientY);
    });

    /* ---------- Thả đèn ước nguyện: gắn DOM + xử lý gửi ---------- */

    var form = document.getElementById('wishForm');
    var input = document.getElementById('wishInput');
    wishSky = document.getElementById('wishSky');
    var live = document.getElementById('wishLive');

    if (form && input && live) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input.value.trim().replace(/\s+/g, ' ');
        if (!text) {
          input.focus();
          live.textContent = 'Bạn viết điều ước trước rồi mình thả đèn nhé.';
          return;
        }
        spawnWishLantern(text, 0);

        var list = loadWishes() || seeds.slice(0);
        list.push(text);
        saveWishes(list);

        live.textContent = 'Đèn ước "' + text + '" đã bay lên.';
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () { live.textContent = ''; }, 4500);

        form.reset();
        input.focus();
      });
    }

    /* Xoá các đèn ước đã lưu trong máy (điều ước test, chữ lạ...) */
    var clearBtn = document.getElementById('wishClear');
    if (clearBtn && live) {
      clearBtn.addEventListener('click', function () {
        try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* bỏ qua */ }
        if (wishSky) wishSky.innerHTML = '';
        crowdWishLanterns(8);
        live.textContent = 'Đã xoá các đèn ước đã lưu — thả điều ước mới nhé.';
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () { live.textContent = ''; }, 4500);
        input.focus();
      });
    }

    /* ---------- Điều hướng phụ: phím mũi tên + vuốt ngang ---------- */

    function step(dir) {
      var i = ORDER.indexOf(current);
      var next = ORDER[(i + dir + ORDER.length) % ORDER.length];
      location.hash = '#/' + next;
    }

    document.addEventListener('keydown', function (e) {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    var touchX = null, touchY = null;
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { touchX = null; return; }
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (touchX == null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchX;
      var dy = t.clientY - touchY;
      touchX = null;
      if (Math.abs(dx) > 64 && Math.abs(dy) < 48 && !e.target.closest('input, textarea')) {
        step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });

    /* Màn đầu tiên: ưu tiên ?scene=, rồi hash */
    var initial = new URLSearchParams(location.search).get('scene');
    if (ORDER.indexOf(initial) < 0) initial = hashName();
    current = null;
    goto(initial);
  }

  init();
})();
