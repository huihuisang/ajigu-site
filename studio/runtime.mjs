import { getCopy, normalizeLocale } from "./copy.mjs";

const surface = document.querySelector(".studio-design");
if (surface) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let copy = getCopy(document.documentElement.lang);
  const typeArt = () => {
    const locale = normalizeLocale(document.documentElement.lang);
    return locale.startsWith("zh") ? "typenote.webp" : locale === "ja" ? "typenote-ja.webp" : "typenote-en.webp";
  };
  const cleanups = [];

  function enter(element) {
    if (reduced.matches) return;
    element.classList.remove("studio-arrive");
    requestAnimationFrame(() => element.classList.add("studio-arrive"));
    element.addEventListener("animationend", () => element.classList.remove("studio-arrive"), { once: true });
  }
  const entrances = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      enter(entry.target);
      entrances.unobserve(entry.target);
    }
  }, { threshold: .12 });
  surface.querySelectorAll("[data-enter], .studio-hero-copy > *, .studio-belief > div, .exhibit-copy > *, .exhibit-art, .content-section h2, .content-section article, .content-section figure").forEach((element) => entrances.observe(element));
  cleanups.push(() => entrances.disconnect());

  surface.querySelectorAll("details.language-switcher, details.langswitch-inline").forEach((menu) => {
    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    });
    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target)) menu.open = false;
    });
  });

  const notes = surface.querySelector("[data-note-demo]");
  let audio = null;
  let sound = false;
  if (notes) {
    const button = notes.querySelector("[data-sound]");
    const output = notes.querySelector("[data-note-output]");
    const activeOscillators = new Set();
    button.addEventListener("click", async () => {
      if (!sound) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return;
        try {
          audio ??= new Context();
          await audio.resume();
          sound = audio.state === "running";
        } catch { sound = false; }
      } else {
        sound = false;
        await audio?.suspend();
      }
      button.setAttribute("aria-pressed", String(sound));
      button.textContent = sound ? copy.soundOff : copy.soundOn;
    });

    function play(note) {
      const key = notes.querySelector(`[data-note="${note}"]`);
      key?.classList.add("is-playing");
      window.setTimeout(() => key?.classList.remove("is-playing"), 180);
      output.textContent = `${copy.note} ${note}`;
      output.dataset.currentNote = String(note);
      if (!sound || !audio || audio.state !== "running" || document.hidden) return;
      const frequency = [261.63,293.66,329.63,349.23,392,440,493.88][note - 1];
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, audio.currentTime);
      gain.gain.linearRampToValueAtTime(.12, audio.currentTime + .012);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .36);
      oscillator.connect(gain).connect(audio.destination);
      activeOscillators.add(oscillator);
      oscillator.onended = () => { activeOscillators.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
      oscillator.start();
      oscillator.stop(audio.currentTime + .4);
    }
    notes.querySelectorAll("[data-note]").forEach((key) => key.addEventListener("click", () => play(Number(key.dataset.note))));
    notes.querySelector("[data-note-input]").addEventListener("input", (event) => {
      if (event.isComposing || !event.target.value || event.inputType?.startsWith("delete")) return;
      play((Array.from(event.target.value).length - 1) % 7 + 1);
    });
    const visibility = async () => {
      if (!document.hidden || !sound) return;
      sound = false;
      await audio?.suspend();
      button.setAttribute("aria-pressed", "false");
      button.textContent = copy.soundOn;
    };
    document.addEventListener("visibilitychange", visibility);
    cleanups.push(() => { document.removeEventListener("visibilitychange", visibility); activeOscillators.forEach((oscillator) => { try { oscillator.stop(); } catch {} }); audio?.close(); });
  }

  const night = surface.querySelector("[data-night-demo]");
  function selectEvent(index) {
    if (!night) return;
    night.querySelectorAll("[data-event]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.event) === index)));
    night.querySelectorAll("[data-event-group]").forEach((bar) => bar.classList.toggle("is-selected", Number(bar.dataset.eventGroup) === index));
    night.querySelector("[data-event-title]").textContent = copy.events[index];
    night.querySelector("[data-event-detail]").textContent = copy.eventDetails[index];
  }
  night?.querySelectorAll("[data-event]").forEach((button) => button.addEventListener("click", () => selectEvent(Number(button.dataset.event))));
  selectEvent(0);

  const gallery = surface.querySelector("[data-gallery-demo]");
  gallery?.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.view);
    gallery.querySelectorAll("[data-view]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    const picture = gallery.querySelector("[data-gallery-image]");
    picture.src = `/studio/media/${["dailyapod.webp","dailyapod-3.webp","dailyapod-4.webp"][index]}`;
    picture.alt = copy.views[index];
    enter(picture);
  }));

  surface.querySelectorAll("[data-compare-demo]").forEach((comparison) => {
    const range = comparison.querySelector("[data-compare]");
    range.addEventListener("input", () => comparison.style.setProperty("--compare", `${range.value}%`));
  });
  surface.querySelectorAll("[data-nameplate-demo]").forEach((preview) => {
    const input = preview.querySelector("[data-name-input]");
    input.addEventListener("input", () => {
      preview.querySelector("[data-name-output]").textContent = input.value.trim() || copy.sampleName;
    });
  });

  const heroToggle = surface.querySelector("[data-hero-toggle]");
  heroToggle?.addEventListener("click", () => {
    const frame = surface.querySelector(".studio-hero-window");
    const showMoodsk = heroToggle.getAttribute("aria-pressed") !== "true";
    heroToggle.setAttribute("aria-pressed", String(showMoodsk));
    frame.classList.toggle("is-moodsk", showMoodsk);
    const picture = frame.querySelector("img");
    picture.src = `/studio/media/${showMoodsk ? "moodsk.webp" : typeArt()}`;
    picture.alt = showMoodsk ? "Moodsk" : "TypeNote";
    heroToggle.textContent = showMoodsk ? "Moodsk ↔ TypeNote" : "TypeNote ↔ Moodsk";
    enter(frame);
  });

  function refreshCopy() {
    copy = getCopy(document.documentElement.lang);
    surface.querySelectorAll(".product-art-typenote > img, .studio-hero-window:not(.is-moodsk) > img, .exhibit-typenote .exhibit-art img").forEach((picture) => {
      const source = `/studio/media/${typeArt()}`;
      if (picture.getAttribute("src") !== source) picture.src = source;
    });
    document.querySelectorAll(".studio-design [data-copy], .studio-skip[data-copy]").forEach((element) => { element.textContent = copy[element.dataset.copy]; });
    if (notes) {
      const button = notes.querySelector("[data-sound]");
      button.textContent = sound ? copy.soundOff : copy.soundOn;
      notes.querySelector("[data-note-input]").placeholder = copy.typeHint;
      notes.querySelector("[data-note-input]").setAttribute("aria-label", copy.typeHint);
      notes.querySelectorAll("[data-note]").forEach((key) => key.setAttribute("aria-label", `${copy.note} ${key.dataset.note}`));
      const output = notes.querySelector("[data-note-output]");
      output.textContent = `${copy.note} ${output.dataset.currentNote || "—"}`;
    }
  }
  refreshCopy();
  const language = new MutationObserver(refreshCopy);
  language.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  cleanups.push(() => language.disconnect());
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
      sound = false;
      audio?.suspend();
      if (notes) {
        const button = notes.querySelector("[data-sound]");
        button.setAttribute("aria-pressed", "false");
        button.textContent = copy.soundOn;
      }
      return;
    }
    cleanups.forEach((cleanup) => cleanup());
  });
}
