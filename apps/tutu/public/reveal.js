(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.classList.add('is-visible');
      io.unobserve(el);
      el.addEventListener('transitionend', function clear() {
        el.style.transitionDelay = '';
        el.removeEventListener('transitionend', clear);
      });
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) {
    var siblings = el.parentElement ? el.parentElement.querySelectorAll('.reveal') : [];
    var index = Array.prototype.indexOf.call(siblings, el);
    el.style.transitionDelay = (Math.max(index, 0) * 70) + 'ms';
    io.observe(el);
  });
})();
