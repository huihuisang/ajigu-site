gsap.registerPlugin(ScrollTrigger);

function initHeroEntrance(containerSelector, itemSelector) {
  gsap.from(itemSelector || `${containerSelector} > *`, {
    y: 32,
    opacity: 0,
    filter: "blur(6px)",
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    clearProps: "filter",
  });
}

function initParallax(layers) {
  layers.forEach(({ selector, speed }) => {
    gsap.to(selector, {
      y: () => window.innerHeight * (speed - 1) * -0.4,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: speed,
      },
    });
  });
}

function initBlastMenu(triggerSelector, overlaySelector, itemSelector) {
  const trigger = document.querySelector(triggerSelector);
  const overlay = document.querySelector(overlaySelector);
  const items   = document.querySelectorAll(itemSelector);
  if (!trigger || !overlay) return;
  let isOpen = false;

  gsap.set(overlay, { clipPath: "inset(0% 0% 100% 0%)", display: "flex" });

  const openTl = gsap.timeline({ paused: true })
    .to(overlay, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power4.inOut" })
    .from(items,  { y: 60, opacity: 0, stagger: 0.07, duration: 0.45, ease: "back.out(2)" }, "-=0.2");

  trigger.addEventListener("click", () => {
    isOpen = !isOpen;
    trigger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
    isOpen ? openTl.play() : openTl.reverse();
  });

  document.querySelectorAll(".nav-item, .overlay-close").forEach(el => {
    el.addEventListener("click", () => {
      if (!isOpen) return;
      isOpen = false;
      trigger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      openTl.reverse();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      isOpen = false;
      openTl.reverse();
      document.body.style.overflow = "";
    }
  });
}

function initHeroTilt(cardSelector) {
  const card = document.querySelector(cardSelector);
  if (!card) return;

  document.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
    gsap.to(card, {
      rotateY: dx * 6,
      rotateX: -dy * 6,
      duration: 0.35,
      ease: "power2.out",
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
  });

  ScrollTrigger.create({
    trigger: cardSelector,
    start: "top bottom",
    end: "bottom top",
    onLeave:      () => gsap.set(card, { rotateY: 0, rotateX: 0 }),
    onLeaveBack:  () => gsap.set(card, { rotateY: 0, rotateX: 0 }),
  });
}

function initSideNavProgress() {
  const fill = document.getElementById("nav-progress");
  if (!fill) return;
  gsap.to(fill, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
    },
  });
}

function initNavHighlight() {
  const links = document.querySelectorAll(".nav-link[data-section]");
  document.querySelectorAll("section[id]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      onEnter:      () => setActive(section.id),
      onEnterBack:  () => setActive(section.id),
    });
  });
  function setActive(id) {
    links.forEach(l => l.classList.toggle("active", l.dataset.section === id));
  }
}

function initBentoEntrance() {
  gsap.from(".bento-card", {
    y: 36,
    opacity: 0,
    scale: 0.97,
    duration: 0.38,
    ease: "back.out(2)",
    stagger: 0.055,
    scrollTrigger: {
      trigger: ".bento-grid",
      start: "top 78%",
    },
  });
}

function initRevealHeadings() {
  document.querySelectorAll(".js-reveal").forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.45,
      ease: "back.out(2)",
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });
}

function initFaqAccordion() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-trigger").addEventListener("click", () => {
      const isOpen = item.dataset.open === "true";
      document.querySelectorAll(".faq-item").forEach((i) => {
        i.dataset.open = "false";
        i.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.dataset.open = "true";
        item.querySelector(".faq-trigger").setAttribute("aria-expanded", "true");
      }
    });
  });
}

function initCTAKeyPulse() {
  const activeKey = document.querySelector(".key.key-active");
  if (!activeKey) return;
  ScrollTrigger.create({
    trigger: ".section-cta",
    start: "top 70%",
    onEnter() {
      gsap.fromTo(activeKey,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2.5)", delay: 0.2 }
      );
    },
  });
}

function initScreenshotsCarousel() {
  const track = document.getElementById("shots-track");
  const dots = document.querySelectorAll(".shot-dot");
  const prevBtn = document.querySelector(".shots-prev");
  const nextBtn = document.querySelector(".shots-next");
  if (!track || !dots.length) return;

  const total = track.children.length;
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = `translateX(${-current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  prevBtn?.addEventListener("click", () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener("click", () => { goTo(current + 1); startAuto(); });
  dots.forEach((d) => d.addEventListener("click", () => { goTo(+d.dataset.idx); startAuto(); }));

  const stage = track.closest(".shots-stage");
  stage?.addEventListener("mouseenter", () => clearInterval(autoTimer));
  stage?.addEventListener("mouseleave", startAuto);

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { goTo(dx < 0 ? current + 1 : current - 1); startAuto(); }
  });

  startAuto();
}

function initLangSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
  initScreenshotsCarousel();
  initHeroEntrance(".hero-card", ".hero-card > *");
  initHeroTilt(".hero-card");
  initSideNavProgress();
  initNavHighlight();
  initBentoEntrance();
  initRevealHeadings();
  initFaqAccordion();
  initCTAKeyPulse();
  initBlastMenu(".menu-toggle", ".nav-overlay", ".nav-item");

  initParallax([
    { selector: ".hero-decor-1", speed: 0.65 },
    { selector: ".hero-decor-2", speed: 1.25 },
    { selector: ".hero-decor-3", speed: 0.8 },
  ]);

  document.fonts.ready.then(() => ScrollTrigger.refresh());
});
