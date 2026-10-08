export function observeEntrances(root: ParentNode, skipIslands = false) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!reduced.matches) {
          entry.target.classList.add("studio-arrive");
          entry.target.addEventListener(
            "animationend",
            () => entry.target.classList.remove("studio-arrive"),
            { once: true },
          );
        }
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );
  root.querySelectorAll("[data-enter]").forEach((element) => {
    if (!skipIslands || !element.closest("astro-island")) observer.observe(element);
  });
  return () => observer.disconnect();
}

export function enhancePage() {
  const disconnect = observeEntrances(document, true);
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) disconnect();
  });
}
