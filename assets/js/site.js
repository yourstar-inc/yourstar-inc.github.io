/* ===== base ===== */
/* shell: page tracking (home_screen.dart _syncCurrentPageWithScroll) + window.YS API */
(function () {
  'use strict';
  var body = document.body;
  var pages = Array.prototype.slice.call(document.querySelectorAll('.ys-page'));
  var bar = document.getElementById('ys-appbar');
  var mqDesktop = window.matchMedia ? window.matchMedia('(min-width: 768px)') : null;
  var TITLES = [null, 'What We\nGuide', '', '']; // HomePageType.title
  var current = -1;
  var listeners = [];
  var scheduled = false;

  function maxIndex() {
    var m = 3;
    pages.forEach(function (p) { var i = +p.getAttribute('data-index'); if (i > m) m = i; });
    return Math.min(m, 3);
  }
  function compute() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    if (!h) return current < 0 ? 0 : current;
    var y = window.scrollY || window.pageYOffset || 0;
    var max = maxIndex();
    var de = document.documentElement;
    var scrollH = Math.max(de.scrollHeight, body.scrollHeight);
    // Scrolled to (within 2px of) the bottom: force the footer page. On viewports taller than
    // 1000px the Flutter formula alone can never reach it (max scroll = 2*vh + 500 < 2.5*vh).
    if (scrollH - h > 2 && y + h >= scrollH - 2) return max;
    // Flutter formula (_syncCurrentPageWithScroll)
    var n = Math.max(0, Math.min(max, Math.floor((y + 0.5 * h) / h)));
    // Guard: never pick a page that is entirely off-screen (e.g. 100vh != innerHeight, short pages),
    // which would leave every visible page at opacity 0. Fall back to the most visible page.
    var sec = byIndex(n);
    if (sec) {
      var r = sec.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= h) {
        var best = -1, bestVis = 0;
        pages.forEach(function (p) {
          var b = p.getBoundingClientRect();
          var vis = Math.min(b.bottom, h) - Math.max(b.top, 0);
          if (vis > bestVis) { bestVis = vis; best = +p.getAttribute('data-index'); }
        });
        if (best >= 0) n = Math.min(best, max);
      }
    }
    return n;
  }
  function byIndex(n) {
    for (var i = 0; i < pages.length; i++) if (+pages[i].getAttribute('data-index') === n) return pages[i];
    return null;
  }
  function isDesktop() { return mqDesktop ? mqDesktop.matches : window.innerWidth >= 768; }
  function updateBar(n) {
    if (!bar) return;
    var desk = isDesktop();
    // HomeState.enableAppBarBlur: intro true, guide = isDesktop, zodiac/footer false
    var blur = n === 0 || (n === 1 && desk);
    var mode = (desk || TITLES[n] === null) ? 'logo' : (TITLES[n] ? 'title' : 'empty');
    bar.setAttribute('data-blur', blur ? 'true' : 'false');
    bar.setAttribute('data-mode', mode);
  }
  function update() {
    scheduled = false;
    var n = compute();
    updateBar(n);
    if (n === current) return;
    var prev = current;
    current = n;
    body.setAttribute('data-page', String(n));
    pages.forEach(function (p) { p.classList.toggle('is-current', +p.getAttribute('data-index') === n); });
    listeners.slice().forEach(function (fn) {
      try { fn(n, prev); } catch (e) { setTimeout(function () { throw e; }); }
    });
    try { document.dispatchEvent(new CustomEvent('ys:pagechange', { detail: { page: n, prev: prev } })); } catch (e) {}
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    (window.requestAnimationFrame || function (f) { return setTimeout(f, 16); })(update);
  }

  window.YS = {
    get page() { return current < 0 ? compute() : current; },
    get isDesktop() { return isDesktop(); },
    /* fn(page, prevPage) is called once immediately with the current page (prev = -1), then on every change. Returns an unsubscribe function. */
    onPageChange: function (fn) {
      if (typeof fn !== 'function') return function () {};
      listeners.push(fn);
      try { fn(window.YS.page, -1); } catch (e) { setTimeout(function () { throw e; }); }
      return function () { var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
    }
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('load', schedule);
  if (mqDesktop) {
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', schedule);
    else if (mqDesktop.addListener) mqDesktop.addListener(schedule);
  }
  update();
})();

/* ===== backgrounds ===== */
(function () {
  'use strict';
  // _showFirstStellaBackground toggles every 3s (Timer.periodic in home_screen.dart).
  var root = document.querySelector('.bg-root');
  if (!root) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  setInterval(function () {
    if (mq && mq.matches) { root.classList.remove('bg-root--alt'); return; }
    root.classList.toggle('bg-root--alt');
  }, 3000);
})();

/* ===== hero ===== */
(function () {
  'use strict';
  var hero = document.getElementById('hero');
  if (!hero) return;
  var mountain = document.querySelector('.hero-mountain');
  var grads = hero.querySelectorAll('.hero-grad');
  // Flutter LinearGradient(topLeft -> bottomRight) spans the text box diagonal:
  // CSS equivalent angle = 180deg - atan(w/h).
  function setAngles() {
    for (var i = 0; i < grads.length; i++) {
      var r = grads[i].getBoundingClientRect();
      if (r.width && r.height) {
        var a = 180 - Math.atan(r.width / r.height) * 180 / Math.PI;
        grads[i].style.setProperty('--hero-ga', a.toFixed(2) + 'deg');
      }
    }
  }
  // Mountain opacity is a pure function of scrollY (1 at the top -> 0 at 0.6 viewport, smoothstep-eased),
  // written once per animation frame and only when it changes. Position is CSS-fixed, so it never moves.
  var FADE_END = 0.6, ticking = false, last = -1;
  function update() {
    ticking = false;
    if (!mountain) return;
    var y = window.scrollY || window.pageYOffset || 0;
    var h = window.innerHeight || document.documentElement.clientHeight || 1;
    var t = Math.min(1, Math.max(0, y / (FADE_END * h)));
    var o = 1 - t * t * (3 - 2 * t);
    o = Math.round(o * 1000) / 1000;
    if (o !== last) { last = o; mountain.style.opacity = String(o); }
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setAngles(); onScroll(); });
  window.addEventListener('pageshow', onScroll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setAngles);
  setAngles();
  update();
})();

/* ===== guide ===== */
/* guide — card activation (desktop hover/focus) + mobile carousel (scroll-snap, centre enlarge, infinite) */
(function () {
  var root = document.getElementById('guide');
  if (!root) return;
  var track = root.querySelector('.guide-track');
  var reals = Array.prototype.slice.call(track.querySelectorAll('.guide-card'));
  var mq = window.matchMedia('(min-width: 768px)');
  var SLOT = 205, ENLARGE = 0.3;
  // Flutter Curves.easeOut = Cubic(0, 0, 0.58, 1) — carousel_slider applies it to the enlarge ratio
  function easeOut(x) {
    var lo = 0, hi = 1, s = x;
    for (var i = 0; i < 20; i++) { s = (lo + hi) / 2; var bx = 3 * (1 - s) * s * s * 0.58 + s * s * s; if (bx < x) lo = s; else hi = s; }
    return 3 * (1 - s) * s * s + s * s * s;
  }

  function cards() { return Array.prototype.slice.call(track.querySelectorAll('.guide-card')); }
  function setActive(idx) {
    cards().forEach(function (c) {
      var on = c.getAttribute('data-index') === String(idx);
      c.classList.toggle('is-active', on);
      if (!c.classList.contains('guide-card--clone')) c.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  // clones for infinite scroll (mobile only; hidden on desktop via CSS)
  function makeClone(c) {
    var k = c.cloneNode(true);
    k.classList.add('guide-card--clone');
    k.classList.remove('is-active');
    k.setAttribute('aria-hidden', 'true');
    k.setAttribute('tabindex', '-1');
    k.removeAttribute('aria-labelledby');
    k.removeAttribute('role');
    Array.prototype.forEach.call(k.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    Array.prototype.forEach.call(k.querySelectorAll('a'), function (a) { a.setAttribute('tabindex', '-1'); });
    return k;
  }
  var first = reals[0];
  reals.forEach(function (c) { track.insertBefore(makeClone(c), first); });
  reals.forEach(function (c) { track.appendChild(makeClone(c)); });

  // desktop: hover / focus / tap makes a card active (stays active after leaving, like Flutter)
  reals.forEach(function (c) {
    var idx = c.getAttribute('data-index');
    c.addEventListener('mouseenter', function () { if (mq.matches) setActive(idx); });
    c.addEventListener('focusin', function () { setActive(idx); if (!mq.matches) centre(c, true); });
    c.addEventListener('click', function () { setActive(idx); if (!mq.matches) centre(c, true); });
  });
  track.addEventListener('click', function (e) {
    var k = e.target.closest && e.target.closest('.guide-card--clone');
    if (k && !mq.matches) centre(k, true);
  });

  // mobile carousel
  var ticking = false, settleT = 0;
  function centreX() { return track.scrollLeft + track.clientWidth / 2; }
  function cardCentre(c) { return c.offsetLeft + c.offsetWidth / 2; }
  function centre(c, smooth) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo({ left: cardCentre(c) - track.clientWidth / 2, behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  function nearest() {
    var cx = centreX(), best = null, bd = 1e9;
    cards().forEach(function (c) { var d = Math.abs(cardCentre(c) - cx); if (d < bd) { bd = d; best = c; } });
    return best;
  }
  function paint() {
    ticking = false;
    if (mq.matches) return;
    var cx = centreX();
    cards().forEach(function (c) {
      var d = Math.min(Math.abs(cardCentre(c) - cx) / SLOT, 1);
      c.style.setProperty('--g-s', easeOut(1 - d * ENLARGE).toFixed(4));
    });
    var n = nearest();
    if (n) setActive(n.getAttribute('data-index'));
  }
  function settle() {
    if (mq.matches) return;
    var n = nearest();
    if (n && n.classList.contains('guide-card--clone')) {
      var real = reals.filter(function (r) { return r.getAttribute('data-index') === n.getAttribute('data-index'); })[0];
      var prev = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      centre(real, false);
      track.style.scrollSnapType = prev;
      paint();
    }
  }
  track.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    clearTimeout(settleT); settleT = setTimeout(settle, 140);
  }, { passive: true });

  root.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var cur = reals.filter(function (c) { return c.classList.contains('is-active'); })[0] || reals[0];
    var i = reals.indexOf(cur) + (e.key === 'ArrowRight' ? 1 : -1);
    i = (i + reals.length) % reals.length;
    e.preventDefault();
    reals[i].focus({ preventScroll: true });
    setActive(reals[i].getAttribute('data-index'));
    if (!mq.matches) centre(reals[i], true);
  });

  function setup() {
    if (mq.matches) {
      cards().forEach(function (c) { c.style.removeProperty('--g-s'); });
    } else {
      var a = reals.filter(function (c) { return c.classList.contains('is-active'); })[0] || reals[0];
      centre(a, false);
      paint();
    }
  }
  if (mq.addEventListener) mq.addEventListener('change', setup); else mq.addListener(setup);
  window.addEventListener('resize', function () { if (!mq.matches) { var n = nearest(); if (n) centre(n, false); paint(); } });
  setup();
  if (document.readyState !== 'complete') window.addEventListener('load', setup);
})();

/* ===== vision_footer ===== */
(function () {
  'use strict';
  // vision_footer: static content; page visibility/entrance handled by base.js (.is-current).
})();
