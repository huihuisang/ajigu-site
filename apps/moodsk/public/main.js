// Moodsk marketing site interactions

// Sticky navigation background once the page scrolls
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal elements as they enter the viewport, with a small stagger per group
const revealed = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll(':scope > .reveal')];
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealed.forEach((el) => observer.observe(el));
