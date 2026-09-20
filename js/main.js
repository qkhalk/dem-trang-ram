/* Đêm Trăng Rằm · Tết Trung Thu 2026 */
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

  /* ---------- Khởi tạo ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    var hero = document.getElementById('dem-hoi');

    /* Sao */
    var sky = null;
    var canvas = document.getElementById('stars');
    if (canvas && hero) {
      sky = new Starfield(canvas, hero);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries[0].isIntersecting ? sky.start() : sky.stop();
        }, { threshold: 0.02 }).observe(hero);
      } else {
        sky.start();
      }
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

    /* Hiện dần khi cuộn */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* Thanh nav đổi nền khi cuộn */
    var nav = document.querySelector('.nav');
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Đếm ngược đến rằm tháng Tám ---------- */

    var target = new Date('2026-09-25T00:00:00+07:00').getTime();
    var elD = document.getElementById('cdDays');
    var elH = document.getElementById('cdHours');
    var elM = document.getElementById('cdMins');
    var elS = document.getElementById('cdSecs');
    var note = document.getElementById('countNote');

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        var grid = document.querySelector('.count-grid');
        if (grid) grid.hidden = true;
        if (note) note.textContent = 'Hôm nay là Trung Thu. Chúc cả nhà một đêm trăng thật tròn và thật vui.';
        return;
      }
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

    /* ---------- Đèn lồng bay trong hero ---------- */

    var heroBox = document.getElementById('heroLanterns');
    var heroVisible = true;
    if (heroBox) {
      var templates = [
        '<svg viewBox="0 0 100 150"><use href="#lantern-round"/></svg>',
        '<svg viewBox="0 -14 120 142"><use href="#star-lantern"/></svg>',
        '<svg viewBox="0 -8 150 112"><use href="#carp-lantern"/></svg>'
      ];

      function spawnHeroLantern() {
        if (!heroVisible || prefersReduced) return;
        if (heroBox.querySelectorAll('.fl[data-js]').length >= 7) return;
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

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          heroVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 }).observe(hero);
      }

      if (!prefersReduced) {
        (function loop() {
          spawnHeroLantern();
          setTimeout(loop, rand(2600, 4400));
        })();
      }
    }

    /* ---------- Thả đèn ước nguyện ---------- */

    var form = document.getElementById('wishForm');
    var input = document.getElementById('wishInput');
    var sky2 = document.getElementById('wishSky');
    var live = document.getElementById('wishLive');
    var STORE_KEY = 'trungthu.wishes.v1';
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
      if (!sky2 || prefersReduced) return;
      if (sky2.children.length > 26) sky2.firstElementChild.remove();

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
      sky2.appendChild(el);
    }

    // những điều ước có sẵn cho lần đầu ghé thăm
    var seeds = ['Sức khoẻ cho ông bà', 'Cả nhà luôn sum họp', 'Thi học kỳ được điểm mười', 'Được một chiếc đèn ông sao mới'];
    var saved = loadWishes();
    var initial = saved && saved.length ? saved : seeds;

    if (!prefersReduced) {
      initial.slice(-8).forEach(function (t, i) {
        spawnWishLantern(t, 900 + i * 1400);
      });
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

        var list = loadWishes() || [];
        if (!saved || !saved.length) list = seeds.slice(0, 4);
        list.push(text);
        saveWishes(list);
        saved = list;

        live.textContent = 'Đèn ước "' + text + '" đã bay lên.';
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () { live.textContent = ''; }, 4500);

        form.reset();
        input.focus();
      });
    }
  });
})();
