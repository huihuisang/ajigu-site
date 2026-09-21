/*
 * home.js — interactions for the ajigu.com "iPad home screen" front page.
 * Pairs with home.css: live clock/date, app sheets, dock magnification,
 * wallpaper parallax. Degrades to CSS :target sheets without JS.
 */
(function () {
  "use strict";

  var docEl = document.documentElement;
  docEl.classList.add("js");

  var locale = docEl.lang || "en";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- Live clock (status bar + analog widget) ---------- */

  var sbTime = document.getElementById("sb-time");
  var handHour = document.querySelector(".hand-hour");
  var handMinute = document.querySelector(".hand-minute");
  var handSecond = document.querySelector(".hand-second");

  function tick() {
    var now = new Date();
    if (sbTime) {
      var t = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
      sbTime.textContent = t.replace(/^0/, "");
    }
    if (handHour && handMinute && handSecond) {
      var h = now.getHours() % 12;
      var m = now.getMinutes();
      var s = now.getSeconds();
      var ms = now.getMilliseconds();
      handHour.style.transform = "rotate(" + ((h + m / 60) * 30) + "deg)";
      handMinute.style.transform = "rotate(" + ((m + s / 60) * 6) + "deg)";
      handSecond.style.transform = "rotate(" + ((s + ms / 1000) * 6) + "deg)";
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Date widget (opens DailyApod) ---------- */

  var dateWeekday = document.querySelector(".date-weekday");
  var dateDay = document.querySelector(".date-day");
  var dateMonth = document.querySelector(".date-month");
  if (dateWeekday && dateDay && dateMonth) {
    var now = new Date();
    dateWeekday.textContent = now.toLocaleDateString(locale, { weekday: "short" });
    dateDay.textContent = now.getDate();
    dateMonth.textContent = now.toLocaleDateString(locale, { month: "long" });
  }

  /* ---------- App sheets ---------- */

  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var lastOpener = null;

  function pushHash(hash) {
    try {
      history.pushState(null, "", hash ? "#" + hash : location.pathname + location.search);
    } catch (e) {
      // file:// and other opaque origins may reject pushState; plain hash still works
      try { location.hash = hash || ""; } catch (e2) { /* no-op */ }
    }
  }

  function openSheet(id, opener) {
    sheets.forEach(function (s) { s.classList.toggle("open", s.id === id); });
    lastOpener = opener || null;
    var sheet = document.getElementById(id);
    if (sheet) {
      var closeBtn = sheet.querySelector(".sheet-close");
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }
  }

  function closeSheets() {
    var wasOpen = sheets.some(function (s) { return s.classList.contains("open"); });
    sheets.forEach(function (s) { s.classList.remove("open"); });
    if (location.hash) {
      pushHash("");
    }
    if (wasOpen && lastOpener && document.contains(lastOpener)) {
      lastOpener.focus({ preventScroll: true });
      lastOpener = null;
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-sheet]"), function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var id = el.getAttribute("data-sheet");
      if (location.hash !== "#" + id) {
        pushHash(id);
      }
      openSheet(id, el);
    });
  });

  sheets.forEach(function (sheet) {
    sheet.addEventListener("click", function (e) {
      if (e.target === sheet) closeSheets();
    });
    var closeBtn = sheet.querySelector(".sheet-close");
    if (closeBtn) closeBtn.addEventListener("click", closeSheets);
  });

  document.addEventListener("keydown", function (e) {
    var open = sheets.filter(function (s) { return s.classList.contains("open"); })[0];
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSheets();
    } else if (e.key === "Tab") {
      // keep focus inside the open sheet
      var focusables = open.querySelectorAll("a[href], button");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Deep links + back/forward buttons
  function syncFromHash() {
    var id = location.hash.replace("#", "");
    if (id && document.getElementById(id) && sheets.some(function (s) { return s.id === id; })) {
      openSheet(id);
    } else {
      sheets.forEach(function (s) { s.classList.remove("open"); });
    }
  }
  window.addEventListener("popstate", syncFromHash);
  if (location.hash) syncFromHash();

  /* ---------- Dock magnification (classic macOS feel) ---------- */

  var dock = document.querySelector(".dock");
  if (dock && !coarsePointer && !reduceMotion) {
    var dockApps = Array.prototype.slice.call(dock.querySelectorAll(".dock-app"));
    dock.addEventListener("pointermove", function (e) {
      dockApps.forEach(function (item) {
        var r = item.getBoundingClientRect();
        var d = e.clientX - (r.left + r.width / 2);
        var scale = 1 + 0.42 * Math.exp(-(d * d) / (2 * 95 * 95));
        item.style.transform = "scale(" + scale.toFixed(3) + ") translateY(" + (-(scale - 1) * 30).toFixed(1) + "px)";
      });
    });
    dock.addEventListener("pointerleave", function () {
      dockApps.forEach(function (item) { item.style.transform = ""; });
    });
  }

  /* ---------- Wallpaper parallax ---------- */

  var wallpaper = document.querySelector(".wallpaper");
  if (wallpaper && !coarsePointer && !reduceMotion) {
    document.addEventListener("pointermove", function (e) {
      var x = e.clientX / window.innerWidth - 0.5;
      var y = e.clientY / window.innerHeight - 0.5;
      wallpaper.style.transform = "translate(" + (x * -14).toFixed(1) + "px," + (y * -10).toFixed(1) + "px)";
    });
  }
})();
