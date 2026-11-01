/**
 * Adapt the existing artwork timeline to a lifecycle managed by React.
 * React owns controls; this module owns only the stage and copy nodes.
 * @param {HTMLElement} root
 * @param {{scenes: string[][], messages: Record<string,string>}} copy
 * @param {(state: {current:number,playing:boolean,effect:number,active:boolean}) => void} onState
 */
export async function mountShowcase(root, copy, onState) {
  const [{ assets, picnicPlacements }, { GlassOrb }] = await Promise.all([
    import(/* @vite-ignore */ "/moodsk/showcase/assets.mjs"),
    import(/* @vite-ignore */ "/moodsk/showcase/glass.mjs"),
  ]);
  const $ = (selector) => root.querySelector(selector);

  const t = (key) => copy.messages[key];
  const scenes = copy.scenes;
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let inView = false;
  const duration = 12000;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const stage = $("#stage");
  let current = 0,
    playing = !motionPreference.matches,
    elapsed = 0,
    lastTime = 0;
  let glassOrb = null;
  let frame = 0,
    animations = [],
    cursorDemo = null,
    transition = null;
  const themePositions = [
    [-235, -205, -18],
    [-75, -245, 12],
    [145, -185, 20],
    [-232, 60, -14],
    [-60, 115, 10],
    [150, 60, 18],
    [-245, -65, 12],
    [-125, -95, -9],
    [5, -150, 8],
    [100, -40, -12],
    [-150, 150, 9],
    [70, 165, -8],
  ];
  const foodNames = [
    "PicnicCoffee",
    "PicnicBaconBurger",
    "PicnicFries",
    "PicnicCola",
    "PicnicChocolateDonut",
    "PicnicSushi",
    "PicnicSoftServe",
    "PicnicPizza",
    "PicnicStrawberryMilkshake",
    "PicnicRamen",
    "PicnicOnionRings",
    "PicnicChickenWrap",
  ];
  const foodIDs = [
    "coffee",
    "bacon-burger",
    "fries",
    "iced-soda",
    "chocolate-donut",
    "sushi",
    "soft-serve",
    "pizza",
    "strawberry-milkshake",
    "ramen",
    "onion-rings",
    "chicken-wrap",
  ];
  let ambientItems = [],
    parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const entryPoints = [
    [0, 90],
    [-230, 100],
    [200, 130],
    [200, -150],
    [-200, -110],
    [0, 130],
  ];
  const star = new Image();
  star.src = assets["star-0"];
  const fish = Array.from({ length: 3 }, (_, i) => {
    const sprite = new Image();
    sprite.src = assets[`fish-${i}`];
    return sprite;
  });
  const bubble = new Image();
  bubble.src = assets.bubble;
  const pointerImage = new Image();
  pointerImage.src = assets.pointer;

  function image(name, className = "", alt = "") {
    return `<img src="${assets[name]}" class="${className}" alt="${alt}" draggable="false">`;
  }
  function pose(x, y, rotation = 0, scale = 1) {
    return `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
  }
  function animate(element, keyframes, options = {}) {
    if (motionPreference.matches) return;
    const animation = element.animate(keyframes, {
      duration,
      fill: "both",
      easing: "linear",
      ...options,
    });
    animation.pause();
    animations.push(animation);
    return animation;
  }
  function actor(content, className, x, y, rotation = 0, delay = 0) {
    const element = document.createElement("div");
    element.className = `actor ${className}`;
    element.innerHTML = content;
    element.style.transform = pose(x, y, rotation);
    stage.querySelector(".scene-content").append(element);
    animate(
      element,
      [
        { transform: pose(x * 0.25, y + 90, rotation - 18, 0.85), opacity: 0 },
        { transform: pose(x, y, rotation), opacity: 1 },
      ],
      { duration: 950, delay, easing: ease },
    );
    return element;
  }
  function sequence(element, positions) {
    if (motionPreference.matches) {
      const [, x, y, r, scale = 1] = positions.at(-1);
      element.style.transform = pose(x, y, r, scale);
    }
    animate(
      element,
      positions.map(([time, x, y, rotation, scale = 1]) => ({
        offset: time / duration,
        transform: pose(x, y, rotation, scale),
        easing: ease,
      })),
    );
  }
  function pill(text, x, y, delay = 0) {
    return actor(text, "pill", x, y, 0, delay);
  }

  function welcomeScene() {
    const wallpaper = actor(
      image("PicnicLakesideWallpaper", "", t("Picnic wallpaper")),
      "wallpaper hero-wallpaper welcome-wallpaper",
      -280,
      -158,
      -5,
    );
    wallpaper.dataset.handoff = "wallpaper";
    sequence(wallpaper, [
      [0, -280, -110, -5, 0.72],
      [1500, -280, -158, -5, 0.82],
      [12000, -280, -158, -5, 0.82],
    ]);
    animate(wallpaper.querySelector("img"), [{ opacity: 0 }, { opacity: 1 }], {
      duration: 1400,
      delay: 900,
      easing: ease,
    });
    const icons = foodNames;
    const positions = [
      [-255, 30, -12],
      [-210, -135, 8],
      [180, -65, 12],
      [-150, 155, -8],
      [145, 105, 12],
      [25, -240, -12],
      [-285, -75, 12],
      [-95, -140, -12],
      [-75, -250, -8],
      [80, -60, 10],
      [-215, 120, 8],
      [20, 30, -9],
    ];
    icons.forEach((name, i) => {
      const [x, y, r] = positions[i];
      const entrance = 1900 + Math.floor(i / 4) * 220;
      const icon = actor(
        image(name, "", t("Theme icon")),
        "theme-icon welcome-icon",
        x,
        y,
        r,
        entrance,
      );
      icon.dataset.handoff = String(i);
      sequence(icon, [
        [0, x, y + 70, r - 20, 0.3],
        [entrance, x, y + 70, r - 20, 0.3],
        [entrance + 750, x, y, r, 0.72],
        [8500, x, y - 8, r * 0.7, 0.64],
        [12000, x, y, r, 0.64],
      ]);
    });
    [
      ["clock", -255, -230, -10, 0.62],
      ["photo", 110, -215, 9, 0.7],
      ["music", -95, 135, -4, 0.75],
    ].forEach(([name, x, y, r, scale], i) => {
      const card = actor(
        image(
          name,
          "",
          { clock: t("Clock widget"), photo: t("Photo widget"), music: t("Music widget") }[name],
        ),
        `widget ${name === "music" ? "widget-wide" : "widget-square"} welcome-widget`,
        x,
        y,
        r,
        2700 + i * 220,
      );
      sequence(card, [
        [0, x, y + 80, r + 12, scale * 0.5],
        [2700 + i * 220, x, y + 80, r + 12, scale * 0.5],
        [3600 + i * 220, x, y, r, scale],
        [12000, x, y, r, scale],
      ]);
    });
    const pointer = actor(image("pointer", "", ""), "demo-pointer", -135, 35, 0, 3000);
    sequence(pointer, [
      [0, -190, 80, 0],
      [3000, -190, 80, 0],
      [4700, 110, -50, 0],
      [6000, 165, 15, 0],
      [12000, 165, 15, 0],
    ]);
    for (let i = 0; i < 9; i++) {
      const x = -100 + i * 32,
        y = 15 - Math.sin(i * 0.4) * 60;
      const size = 0.55 + (i % 3) * 0.2;
      const particle = actor(image("bubble", "", ""), "welcome-bubble", x, y, 0, 3300 + i * 120);
      animate(
        particle,
        [
          { transform: pose(x, y, 0, 0.15), opacity: 0 },
          { transform: pose(x, y - 8, 0, size), opacity: 0.9, offset: 0.2 },
          {
            transform: pose(x + Math.sin(i) * 16, y - 58, 0, size * 1.1),
            opacity: 0.7,
            offset: 0.7,
          },
          { transform: pose(x + Math.sin(i) * 24, y - 100, 0, size * 1.2), opacity: 0 },
        ],
        { duration: 4200, delay: 3300 + i * 180, iterations: Infinity },
      );
    }
  }

  function themeScene(shared = null) {
    function reuse(key, create) {
      const element = shared?.get(key);
      if (!element) return create();
      element.style.translate = "0px 0px";
      element.style.rotate = "0deg";
      element.style.opacity = "1";
      element.classList.remove("welcome-icon", "welcome-wallpaper");
      stage.querySelector(".scene-content").append(element);
      return element;
    }
    if (!shared) {
      const rear = actor(
        image("PicnicAmberWallpaper", "", t("Amber Picnic wallpaper")),
        "wallpaper rear",
        64,
        -172,
        10,
        70,
      );
      animate(rear, [
        { opacity: 0.55 },
        { opacity: 0.55, offset: 0.24 },
        { opacity: 0, offset: 0.4 },
        { opacity: 0 },
      ]);
    }
    const wallpaper = reuse("wallpaper", () =>
      actor(
        image("PicnicLakesideWallpaper", "", t("Pearl Picnic wallpaper")),
        "wallpaper hero-wallpaper",
        -280,
        -158,
      ),
    );
    sequence(wallpaper, [
      [0, -280, -60, -12, 0.58],
      [1200, -280, -158, -7, 0.68],
      [2700, -280, -158, -7, 0.68],
      [4700, -280, -158, 0, 1],
      [12000, -280, -158, 0, 1],
    ]);
    const names = foodNames;
    const ids = foodIDs;
    const start = themePositions;
    names.forEach((name, i) => {
      const [x, y, r] = start[i];
      const placement = picnicPlacements.find((p) => p.id === `picnic.${ids[i]}`);
      // Transform origins are centered; align the scaled frame with the native normalized origin.
      const size = 560 * placement.width;
      const endX = -280 + 560 * placement.x - (110 - size) / 2;
      const endY = -158 + 315 * placement.y - (110 - size) / 2;
      const item = reuse(String(i), () =>
        actor(image(name, "", t("Picnic icon")), "theme-icon", x, y, r, i * 70),
      );
      sequence(item, [
        [0, x * 0.3, y + 160, r - 30, 0.65],
        [1100 + i * 70, x, y, r],
        [3500 + i * 90, x, y, r],
        [5700 + i * 180, endX, endY, 0, size / 110],
        [12000, endX, endY, 0, size / 110],
      ]);
    });
    const label = pill(t("Icons + matching wallpaper"), -94, 215, 1200);
    sequence(label, [
      [0, -94, 215, 0],
      [3200, -94, 215, 0],
      [6000, -94, 200, 0],
      [12000, -94, 200, 0],
    ]);
  }

  function widgetScene() {
    const items = [
      ["clock", t("Clock widget"), -222, -210, -7, "widget-square"],
      ["photo", t("Photo widget"), 27, -180, 9, "widget-square"],
      ["todo", t("To-do widget"), -240, 15, -4, "widget-wide"],
      ["music", t("Music widget"), -120, 135, 6, "widget-wide"],
    ];
    items.forEach(([name, alt, x, y, r, kind], i) => {
      const item = actor(image(name, "", alt), `widget ${kind}`, x, y, r, i * 100);
      // Each card gets a turn at the front: glance at time, finish a task, then play music.
      const focus = i === 0 ? 2400 : i === 2 ? 4900 : i === 3 ? 7600 : 10200;
      sequence(item, [
        [0, -95, -70, i * 8 - 12, 0.8],
        [1100 + i * 120, x, y, r],
        [focus - 400, x, y, r],
        [focus, x - 8, y - 14, r * 0.3, 1.08],
        [focus + 1100, x - 8, y - 14, r * 0.3, 1.08],
        [Math.min(focus + 1600, 12000), x, y, r],
        [12000, x, y, r],
      ]);
      const halo = document.createElement("span");
      halo.className = "widget-halo";
      item.append(halo);
      animate(
        halo,
        [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }],
        { duration: 1800, delay: focus - 300 },
      );
      if (name === "music") {
        const bars = document.createElement("span");
        bars.className = "equalizer";
        bars.innerHTML = "<i></i>".repeat(5);
        item.append(bars);
        bars
          .querySelectorAll("i")
          .forEach((bar, j) =>
            animate(
              bar,
              [
                { transform: "scaleY(.25)" },
                { transform: "scaleY(1)" },
                { transform: "scaleY(.35)" },
                { transform: "scaleY(.8)" },
                { transform: "scaleY(.25)" },
              ],
              { duration: 900 + j * 130, iterations: Infinity, delay: 7200 },
            ),
          );
      }
      if (name === "todo") {
        const completed = document.createElement("div");
        completed.className = "completed-task";
        completed.innerHTML = image("todo-done", "", t("Widget with a completed task"));
        item.append(completed);
        animate(completed, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 5000 });
        const check = document.createElement("span");
        check.className = "done-stamp";
        check.textContent = "✓";
        item.append(check);
        animate(
          check,
          [
            { opacity: 0, transform: "scale(.5) rotate(-20deg)" },
            { opacity: 1, transform: "scale(1) rotate(8deg)" },
          ],
          { duration: 650, delay: 5000, easing: ease },
        );
      }
    });
    const hand = actor(image("pointer", "", ""), "demo-pointer", -110, -100, 0, 1800);
    sequence(hand, [
      [0, -110, -100, 0],
      [2700, -110, -100, 0],
      [4700, -100, 70, 0],
      [5000, -100, 70, 0, 0.8],
      [5400, -100, 70, 0],
      [7400, 58, 285, 0],
      [7700, 58, 285, 0, 0.8],
      [8200, 58, 285, 0],
      [10300, 95, -80, 0],
      [12000, 95, -80, 0],
    ]);
    const captions = [
      t("Check the time"),
      t("One small task, done"),
      t("A song for your work"),
      t("A favourite photo, nearby"),
    ];
    captions.forEach((caption, i) => {
      const label = pill(caption, -110, -285);
      animate(
        label,
        [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }],
        { duration: 2700, delay: 1500 + i * 2600 },
      );
      if (motionPreference.matches) label.style.opacity = i === 3 ? 1 : 0;
    });
  }

  function cursorScene() {
    const board = actor(
      '<canvas width="1120" height="920" aria-label="' +
        t("Bubbles, koi and stardust preview") +
        '"></canvas>',
      "cursor-board",
      -280,
      -230,
      0,
    );
    const canvas = board.querySelector("canvas");
    const context = canvas.getContext("2d");
    cursorDemo = {
      canvas,
      context,
      samples: [],
      waves: [],
      mode: -1,
      pointer: null,
      lastSample: -100,
      lastWave: -2000,
    };
    canvas.addEventListener("pointermove", (event) => {
      if (!playing || motionPreference.matches) return;
      const bounds = canvas.getBoundingClientRect();
      cursorDemo.pointer = {
        x: ((event.clientX - bounds.left) * 560) / bounds.width,
        y: ((event.clientY - bounds.top) * 460) / bounds.height,
      };
    });
    canvas.addEventListener("pointerleave", () => {
      if (cursorDemo) cursorDemo.pointer = null;
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (!playing || motionPreference.matches) return;
      const bounds = canvas.getBoundingClientRect();
      cursorDemo.waves.push({
        x: ((event.clientX - bounds.left) * 560) / bounds.width,
        y: ((event.clientY - bounds.top) * 460) / bounds.height,
        time: elapsed,
      });
    });
    drawCursor(motionPreference.matches ? 3000 : 0);
  }

  function drawCursor(time) {
    const demo = cursorDemo;
    if (!demo) return;
    const { context: ctx } = demo;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, 560, 460);
    const t = time / 1000;
    const mode = Math.min(2, Math.floor(time / 4000));
    if (mode !== demo.mode) {
      demo.mode = mode;
      demo.samples = [];
      demo.waves = [];
      demo.lastSample = -100;
      demo.lastWave = time;
      notify();
    }
    // Fade within the canvas at the two material hand-offs, without replacing the board.
    const local = time % 4000;
    const blend = Math.min(1, local / 320, (4000 - local) / 320);
    ctx.globalAlpha = blend;
    const point = demo.pointer || {
      x: 280 + Math.sin(t * 1.15) * 165,
      y: 220 + Math.sin(t * 2.3) * 76,
    };
    if ((motionPreference.matches || !playing) && !demo.samples.length) {
      for (let i = 0; i < 25; i++)
        demo.samples.push({
          x: 120 + i * 12,
          y: 220 + Math.sin(i * 0.19) * 65,
          time: time - 1200 + i * 45,
        });
    } else if (time - demo.lastSample > 35) {
      demo.samples.push({ ...point, time });
      demo.lastSample = time;
    }
    if (!demo.pointer && time - demo.lastWave > 2400) {
      demo.waves.push({ ...point, time });
      demo.lastWave = time;
    }
    demo.samples = demo.samples.filter((s) => time - s.time < 1500);
    if (mode === 2)
      demo.samples.forEach((sample, i) => {
        const age = (time - sample.time) / 1000,
          life = Math.max(0, 1 - age / 1.5),
          size = 22 + 8 * life;
        ctx.save();
        ctx.translate(sample.x + Math.sin(i) * age * 8, sample.y + age * 12);
        ctx.rotate(i * 0.8);
        ctx.globalAlpha = blend * Math.sqrt(life);
        if (star.complete && star.naturalWidth)
          ctx.drawImage(star, -size / 2, -size / 2, size, size);
        ctx.restore();
      });
    if (mode === 0) {
      for (let i = 0; i < 16; i++) {
        const age = (t * 0.22 + i * 0.071) % 1;
        const x = 80 + ((i * 87) % 400) + Math.sin(t + i * 1.7) * 24;
        const y = 440 - age * 390;
        const size = 32 + ((i * 17) % 52);
        ctx.globalAlpha = blend * Math.min(1, age * 6, (1 - age) * 5);
        if (bubble.complete && bubble.naturalWidth)
          ctx.drawImage(bubble, x - size / 2, y - size / 2, size, size);
      }
    }
    if (mode === 1) {
      for (let i = 6; i >= 0; i--) {
        const phase = t * 1.15 - i * 0.27;
        const x = demo.pointer ? point.x - 70 - i * 17 : 280 + Math.sin(phase) * 165;
        const y = demo.pointer
          ? point.y + Math.sin(phase * 2) * 45
          : 220 + Math.sin(phase * 2) * 76;
        const angle = demo.pointer
          ? 0
          : Math.atan2(Math.cos(phase * 2) * 152, Math.cos(phase) * 165);
        const size = 80 - i * 4,
          u = size / 96,
          wag = Math.sin(t * 8 + i) * 12 * u;
        ctx.save();
        ctx.globalAlpha = blend;
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-15 * u, 0);
        ctx.lineTo(-40 * u, 20 * u + wag);
        ctx.bezierCurveTo(-23 * u, 8 * u + wag, -23 * u, -8 * u + wag, -40 * u, -20 * u + wag);
        ctx.closePath();
        ctx.fillStyle = "#ef9655";
        ctx.fill();
        const sprite = fish[i % 3];
        if (sprite.complete && sprite.naturalWidth)
          ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    }
    demo.waves = demo.waves.filter((w) => time - w.time < 1500);
    demo.waves.forEach((w) => {
      const progress = Math.max(0, (time - w.time) / 1500),
        radius = 5 + (1 - (1 - progress) ** 2) * 58;
      for (let i = 0; i < 3; i++) {
        const scale = Math.max(0.15, 1 - i * 0.22);
        ctx.beginPath();
        ctx.arc(w.x, w.y, radius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = "#e8b76a";
        ctx.globalAlpha = (1 - progress) ** 1.4 * scale;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    if (pointerImage.complete && pointerImage.naturalWidth)
      ctx.drawImage(pointerImage, point.x - 4, point.y - 4, 25, 38);
  }

  function customScene() {
    const original = actor(
      image("ImportBarFlower", "", t("Imported flower photo")) + '<span class="scan-line"></span>',
      "original-photo",
      -115,
      -130,
      0,
    );
    sequence(original, [
      [0, -115, -90, 0, 0.6],
      [950, -115, -130, 0, 1],
      [2600, -115, -130, 0, 1],
      [3400, -250, -130, -8, 0.9],
      [12000, -250, -130, -8, 0.9],
    ]);
    animate(
      original.querySelector(".scan-line"),
      [
        { transform: "translateY(10px)", opacity: 0 },
        { transform: "translateY(10px)", opacity: 1, offset: 0.05 },
        { transform: "translateY(230px)", opacity: 1, offset: 0.95 },
        { transform: "translateY(230px)", opacity: 0 },
      ],
      { duration: 1500, delay: 1000, easing: "linear" },
    );
    const editor = actor(
      '<div class="selection-corners"></div>' +
        image("ImportBarFlowerCutout", "", t("Flower with background removed")) +
        '<span class="icon-caption">' +
        t("Flowers") +
        "</span>",
      "cutout-board",
      20,
      -115,
      0,
      3500,
    );
    animate(
      editor.querySelector(".icon-caption"),
      [
        { opacity: 0, transform: "translate(-50%, 8px)" },
        { opacity: 1, transform: "translate(-50%, 0)" },
      ],
      { duration: 600, delay: 5200, easing: ease },
    );
    const tools = actor(
      "<span>✂</span><span>⌕</span><span>Aa</span>",
      "editor-tools custom-tools",
      60,
      135,
      0,
      4400,
    );
    animate(
      tools.querySelectorAll("span")[2],
      [{ background: "#ffffff88" }, { background: "#b9d8c6" }, { background: "#ffffff88" }],
      { duration: 1000, delay: 5000 },
    );
    const caption = pill(t("Import \u2192 Remove background \u2192 Add text"), 0, 210, 1000);
    caption.classList.add("custom-caption");
  }

  function libraryScene() {
    const tiles = [
      ["library-0", 0, 0],
      ["library-4", 1, 0],
      ["photo", 2, 0],
      ["PicnicFries", 3, 0],
      ["PicnicAmberWallpaper", 0, 1, 2],
      ["library-7", 2, 1],
      ["library-3", 3, 1],
      ["library-6", 0, 2],
      ["clock", 1, 2],
      ["library-1", 2, 2],
      ["PicnicBaconBurger", 3, 2],
      ["library-5", 0, 3],
      ["library-2", 1, 3],
      ["music", 2, 3, 2],
      ["PicnicSushi", 0, 4],
      ["library-8", 1, 4],
      ["PicnicLakesideWallpaper", 2, 4, 2],
    ];
    tiles.push(...Array.from({ length: 31 }, (_, i) => [`extra-${i}`, i % 4, 0]));
    tiles.forEach(([name, column, row, span = 1], index) => {
      const wide = span === 2,
        x = (column - 1.5) * 150,
        delay = index * 150;
      const card = actor(
        image(name, "", t("Artwork preview")),
        `balloon-material ${wide ? "balloon-wide" : ""}`,
        x,
        -100,
        0,
      );
      if (motionPreference.matches) {
        card.hidden = index >= 16;
        card.style.transform = pose(x - 55, (row - 2) * 95, 0, 0.72);
      } else {
        animate(
          card,
          [
            { transform: pose(-55, 255, 0, 0.08), opacity: 0 },
            { transform: pose(x * 0.16 - 55, 210, -8, 0.4), opacity: 1, offset: 0.06 },
            {
              transform: pose(x * 0.6 - 55, 40, (index % 2 ? 1 : -1) * 9, 0.9),
              opacity: 1,
              offset: 0.42,
            },
            { transform: pose(x - 35, -190, (index % 2 ? -1 : 1) * 6, 1), opacity: 1, offset: 0.8 },
            { transform: pose(x * 1.18 - 65, -340, 0, 0.85), opacity: 0 },
          ],
          { duration: 7200, delay, iterations: Infinity, easing: "linear" },
        );
      }
    });
    const orb = actor('<canvas aria-hidden="true"></canvas>', "glass-orb", -70, 240, 0);
    glassOrb = new GlassOrb(orb.querySelector("canvas"), stage);
  }

  function mount(index, startTime = 0, shared = null) {
    glassOrb?.dispose();
    glassOrb = null;
    const previousCenter = shared
      ? stage.querySelector(".composition").getBoundingClientRect().y
      : null;
    cancelAnimationFrame(frame);
    animations.forEach((a) => a.cancel());
    animations = [];
    ambientItems = [];
    parallax = { x: 0, y: 0, targetX: 0, targetY: 0 };
    cursorDemo = null;
    current = (index + scenes.length) % scenes.length;
    elapsed = 0;
    lastTime = 0;
    stage.innerHTML = '<div class="composition"><div class="scene-content"></div></div>';
    const [entryX, entryY] = entryPoints[current];
    animate(
      stage.querySelector(".scene-content"),
      [
        { transform: pose(entryX, entryY, 0, 0.18), opacity: 0 },
        { transform: pose(0, 0), opacity: 1 },
      ],
      { duration: 1000, easing: ease },
    );
    const [eyebrow, title, detail] = scenes[current];

    $("#eyebrow").textContent = eyebrow;
    $("#title").innerHTML = title
      .split("<br>")
      .map((line) => `<span>${line}</span>`)
      .join("");
    $("#detail").textContent = detail;
    $("#title")
      .querySelectorAll("span")
      .forEach((element, i) =>
        animate(
          element,
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 700, delay: i * 100, easing: ease },
        ),
      );
    if (current === 1) themeScene(shared);
    else [welcomeScene, themeScene, widgetScene, cursorScene, customScene, libraryScene][current]();

    elapsed = startTime;
    ambientItems =
      current === 0
        ? [...stage.querySelectorAll(".actor")].map((element, i) => ({
            element,
            phase: i * 1.37,
            depth: element.classList.contains("wallpaper")
              ? 0.22
              : element.classList.contains("widget")
                ? 0.6
                : 1,
          }))
        : [];
    resizeStage();
    if (shared) {
      const composition = stage.querySelector(".composition");
      const shift = previousCenter - composition.getBoundingClientRect().y;
      animate(composition, [{ translate: `0px ${shift}px` }, { translate: "0px 0px" }], {
        duration: 500,
        delay: startTime,
        easing: ease,
      });
    }
    // Paused chapter selection shows the completed composition instead of an empty entrance.
    if (!playing) elapsed = motionPreference.matches ? 3000 : 9000;
    sync();
  }
  function show(index, immediate = false) {
    const target = (index + scenes.length) % scenes.length;
    if (immediate || motionPreference.matches || !playing || !stage.firstChild) {
      transition = null;
      mount(target);
      return;
    }
    const content = stage.querySelector(".scene-content");
    const contentTransform = getComputedStyle(content).transform;
    const contentOpacity = getComputedStyle(content).opacity;
    const copyOpacity = getComputedStyle($(".copy")).opacity;
    const elements = [...stage.querySelectorAll(".actor")];
    const snapshots = elements.map((element) => ({
      element,
      transform: getComputedStyle(element).transform,
      opacity: getComputedStyle(element).opacity,
      translate: getComputedStyle(element).translate,
      rotate: getComputedStyle(element).rotate,
    }));
    animations.forEach((a) => a.cancel());
    animations = [];
    animate(
      content,
      [
        { transform: contentTransform, opacity: contentOpacity },
        { transform: pose(0, 0), opacity: 1 },
      ],
      { duration: 780, easing: ease },
    );
    const handoff = current === 0 && target === 1 && !transition;
    const iconTargets = themePositions;
    snapshots.forEach(({ element, transform, opacity, translate, rotate }, i) => {
      animate(
        element,
        [
          { translate, rotate },
          { translate: "0px 0px", rotate: "0deg" },
        ],
        { duration: 780, easing: ease },
      );
      if (handoff && element.dataset.handoff !== undefined) {
        const destination =
          element.dataset.handoff === "wallpaper"
            ? [-280, -158, -7, 0.68]
            : [...iconTargets[Number(element.dataset.handoff)], 1];
        animate(
          element,
          [
            { transform, opacity },
            { transform: pose(...destination), opacity: 1 },
          ],
          { duration: 780, easing: ease },
        );
        return;
      }
      animate(
        element,
        [
          { transform, opacity },
          {
            transform: pose(
              -element.offsetWidth / 2 + ((i % 3) - 1) * 18,
              -element.offsetHeight / 2 + (i % 2) * 16,
              ((i % 3) - 1) * 7,
              0.22,
            ),
            opacity: Math.min(1, Number(opacity)),
          },
          {
            transform: pose(
              entryPoints[target][0] - element.offsetWidth / 2,
              entryPoints[target][1] - element.offsetHeight / 2,
              0,
              0.06,
            ),
            opacity: 0,
          },
        ],
        { duration: 780, easing: ease },
      );
    });
    animate(
      $(".copy"),
      [
        { opacity: copyOpacity, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-12px)" },
      ],
      { duration: 650, easing: ease },
    );
    transition = {
      target,
      startTime: handoff ? 2700 : 0,
      shared: handoff
        ? new Map(
            elements
              .filter((e) => e.dataset.handoff !== undefined)
              .map((e) => [e.dataset.handoff, e]),
          )
        : null,
    };
    elapsed = 0;
    sync();
  }
  function ambientOffset(time, phase, depth, x, y) {
    const strength = Math.max(0, Math.min(1, (time - 6500) / 2500));
    return {
      x: strength * (Math.sin(time / 2900 + phase) * 4 + x * 15) * depth,
      y: strength * (Math.sin(time / 1800 + phase) * 9 + y * 11) * depth,
      rotation: strength * Math.sin(time / 3200 + phase) * 1.5 * depth,
    };
  }
  function drawAmbient(time) {
    if (motionPreference.matches) return;
    parallax.x += (parallax.targetX - parallax.x) * 0.06;
    parallax.y += (parallax.targetY - parallax.y) * 0.06;
    ambientItems.forEach(({ element, phase, depth }) => {
      const offset = ambientOffset(time, phase, depth, parallax.x, parallax.y);
      element.style.translate = `${offset.x}px ${offset.y}px`;
      element.style.rotate = `${offset.rotation}deg`;
    });
  }
  function resizeStage() {
    const scale = Math.min(
      1,
      stage.clientWidth / 680,
      stage.clientHeight / (current === 5 ? 800 : 620),
    );
    stage.style.setProperty("--stage-scale", scale);
    // Optical offsets center the main artwork without its decorative captions.
    const visualCenters = [12, 0, 40, 0, 10, 0];
    stage.style.setProperty(
      "--scene-center-y",
      `${stage.clientHeight / 2 - (current === 5 ? 40 : visualCenters[current]) * scale}px`,
    );
  }
  function sync() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    const active = playing && !document.hidden && inView;
    animations.forEach((animation) => {
      animation.currentTime = elapsed;
      // Playing a finished animation rewinds it. Hold completed entrances at their final frame.
      if (active && elapsed < animation.effect.getComputedTiming().endTime) animation.play();
      else animation.pause();
    });
    notify();
    if (glassOrb && !transition) glassOrb.draw(motionPreference.matches ? 0 : elapsed);
    if (cursorDemo && !transition) drawCursor(elapsed);
    if (active) frame = requestAnimationFrame(tick);
  }
  function tick(time) {
    if (lastTime) elapsed += time - lastTime;
    lastTime = time;
    if (transition) {
      if (elapsed >= 780) {
        const { target, startTime, shared } = transition;
        transition = null;
        mount(target, startTime, shared);
        return;
      }
    } else if (elapsed >= duration && current < scenes.length - 1) {
      show(current + 1);
      return;
    }
    if ((current === 0 || current === 5) && !transition) drawAmbient(elapsed);
    if (glassOrb && !transition) glassOrb.draw(motionPreference.matches ? 0 : elapsed);
    if (cursorDemo && !transition) drawCursor(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function notify() {
    onState({
      current,
      playing,
      effect: cursorDemo?.mode ?? 0,
      active: playing && !document.hidden && inView,
    });
  }
  const lifecycle = new AbortController();
  const listen = (target, event, handler) =>
    target.addEventListener(event, handler, { signal: lifecycle.signal });
  listen(document, "visibilitychange", sync);
  listen(root, "keydown", (event) => {
    if (event.target.closest("input,textarea,select,[role=group],button,a")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
  });
  listen(motionPreference, "change", () => {
    playing = !motionPreference.matches;
    show(current, true);
  });
  listen(stage, "pointermove", (event) => {
    if ((current !== 0 && current !== 5) || !playing || motionPreference.matches) return;
    const box = stage.getBoundingClientRect();
    parallax.targetX = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1));
    parallax.targetY = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1));
  });
  listen(stage, "pointerleave", () => {
    parallax.targetX = 0;
    parallax.targetY = 0;
  });
  const resize = new ResizeObserver(resizeStage);
  resize.observe(stage);
  resize.observe($(".copy"));
  const visibility = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  visibility.observe(root);
  show(0);
  root.classList.add("is-ready");
  return {
    show,
    toggle() {
      if (motionPreference.matches) return;
      playing = !playing;
      sync();
    },
    replay() {
      playing = !motionPreference.matches;
      show(current, true);
    },
    next() {
      if (current === scenes.length - 1 && !transition) {
        const download = document.querySelector("#download");
        download?.scrollIntoView({ behavior: motionPreference.matches ? "instant" : "smooth" });
        download?.querySelector("a")?.focus({ preventScroll: true });
      } else show((transition?.target ?? current) + 1);
    },
    effect(value) {
      if (!cursorDemo) return;
      elapsed = value * 4000 + 1000;
      cursorDemo.samples = [];
      cursorDemo.waves = [];
      sync();
    },
    dispose() {
      lifecycle.abort();
      visibility.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      glassOrb?.dispose();
      stage.replaceChildren();
      root.classList.remove("is-ready");
    },
  };
}
