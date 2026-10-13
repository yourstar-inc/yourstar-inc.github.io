(function () {
  'use strict';
  var select = document.getElementById('legal-lang-select');
  var docs = document.querySelectorAll('.legal-doc');
  var scroller = document.getElementById('legal-scroll');
  if (!select || !docs.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var titles = {
    'privacy-policy': { kr: '개인정보처리방침 | YouR Star Inc.', en: 'Privacy Policy | YouR Star Inc.' },
    'terms-of-service': { kr: '이용약관 | YouR Star Inc.', en: 'Terms of Service | YouR Star Inc.' }
  };
  var tab = document.body.getAttribute('data-tab');
  function show(lang, animate) {
    for (var i = 0; i < docs.length; i++) {
      var d = docs[i];
      var on = d.getAttribute('data-lang') === lang;
      d.hidden = !on;
      d.classList.toggle('is-active', on);
      if (on && animate && !reduce) {
        d.classList.add('is-fading');
        void d.offsetWidth;
        d.classList.remove('is-fading');
      }
    }
    document.documentElement.lang = lang === 'en' ? 'en' : 'ko';
    if (titles[tab]) document.title = titles[tab][lang];
    if (scroller) scroller.scrollTop = 0;
    // keep the language when switching tabs
    var links = document.querySelectorAll('.legal-tab');
    for (var j = 0; j < links.length; j++) {
      var base = links[j].getAttribute('href').split('?')[0];
      links[j].setAttribute('href', lang === 'en' ? base + '?lang=en' : base);
    }
  }
  select.addEventListener('change', function () {
    var lang = select.value === 'en' ? 'en' : 'kr';
    show(lang, true);
    try {
      var url = new URL(window.location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en'); else url.searchParams.delete('lang');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) {}
  });
  var initial = 'kr';
  try {
    if (new URLSearchParams(window.location.search).get('lang') === 'en') initial = 'en';
  } catch (e) {}
  if (initial === 'en') { select.value = 'en'; show('en', false); }
})();
