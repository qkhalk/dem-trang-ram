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

    // đèn ước nguyện: gieo lứa đầu khi vừa vào màn
    if (name === 'uoc-nguyen') {
      if (!wishShownOnce) { seedWishLanterns(); wishShownOnce = true; }
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

  /* ---------- Khởi tạo ---------- */

  function init() {
    document.querySelectorAll('.screen').forEach(function (el) {
      screens[el.getAttribute('data-screen')] = el;
    });

    var hero = screens.home;

    /* Sao + chạm để thả sao băng */
    var canvas = document.getElementById('stars');
    if (canvas && hero) {
      sky = new Starfield(canvas, hero);
      hero.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, form')) return;
        var rect = hero.getBoundingClientRect();
        sky.shoot(e.clientX - rect.left, e.clientY - rect.top);
      });
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
        var cap = festivalMode ? 10 : 7;
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
        var wait = festivalMode ? rand(1100, 2100) : rand(2600, 4400);
        setTimeout(loop, wait);
      })();

      window.setFestivalLanterns = function (on) { festivalMode = on; };
    }

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

    // bắn pháo hoa tại chỗ chạm (đêm lễ hội)
    document.addEventListener('click', function (e) {
      if (!festivalOn || prefersReduced) return;
      if (e.target.closest('a, button, input, form, .festival-toast')) return;
      fireworks.burst(e.clientX, e.clientY);
    });

    /* ---------- Thả đèn ước nguyện ---------- */

    var form = document.getElementById('wishForm');
    var input = document.getElementById('wishInput');
    var wishSky = document.getElementById('wishSky');
    var live = document.getElementById('wishLive');
    var STORE_KEY = 'trungthu.wishes.v1';
    var liveTimer = null;
    var seeds = ['Sức khoẻ cho ông bà', 'Cả nhà luôn sum họp', 'Thi học kỳ được điểm mười', 'Được một chiếc đèn ông sao mới'];

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
      if (wishSky.children.length > 26) wishSky.firstElementChild.remove();

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
      if (prefersReduced) return;
      currentWishes().slice(-8).forEach(function (t, i) {
        spawnWishLantern(t, 500 + i * 1400);
      });
    }

    function startWishAmbient() {
      if (prefersReduced) return;
      stopWishAmbient();
      wishTimer = setInterval(function () {
        var list = currentWishes();
        spawnWishLantern(list[Math.floor(Math.random() * list.length)], 0);
      }, 7000);
    }
    function stopWishAmbient() {
      if (wishTimer) { clearInterval(wishTimer); wishTimer = null; }
    }

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
