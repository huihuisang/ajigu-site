const TEMPLATE_SIZE = 2362; // 底图固定尺寸，绘制时拉伸到卡片尺寸
const card = { width: TEMPLATE_SIZE, height: TEMPLATE_SIZE };
const panelHeight = () => Math.round(card.height / 2);

const translations = {
  en: {
    title: "Nameplate Studio",
    subtitle: "Pick a template, edit the layers, and download a print-ready desk nameplate.",
    layers: "Layers",
    templates: "Templates",
    templateBlank: "Blank",
    templateClassic: "Classic",
    backgroundLayer: "Background",
    templateApplied: "Template applied.",
    addText: "+ Text",
    addImage: "+ Image",
    nameLayer: "Name",
    numberLayer: "Number",
    textLayer: "Text",
    imageLayer: "Image",
    copySuffix: "copy",
    visibility: "Show / hide",
    moveUp: "Move up",
    moveDown: "Move down",
    duplicate: "Duplicate",
    delete: "Delete",
    content: "Text",
    font: "Font",
    fontPickerTitle: "Choose font",
    fontSearchPlaceholder: "Search fonts…",
    fontPreviewSample: "Name 123",
    fontGroupBuiltins: "Built-in fonts",
    fontGroupCustom: "Uploaded fonts",
    fontGroupSystem: "System fonts",
    fontSearchEmpty: "No fonts match that search.",
    close: "Close",
    size: "Size",
    color: "Color",
    shadow: "Shadow",
    outline: "Outline",
    outlineColor: "Outline color",
    outlineWidth: "Weight",
    shadowColor: "Shadow color",
    opacity: "Opacity",
    blur: "Blur",
    offsetX: "Offset X",
    offsetY: "Offset Y",
    width: "Width",
    loadSystemFonts: "Load system fonts",
    uploadFont: "Upload font file",
    systemFontsNote: "“Load system fonts” asks for browser permission and requires serving the app from localhost.",
    systemFontsLoaded: "Loaded {count} system font families.",
    systemFontsUnavailable: "This browser cannot list system fonts. Use the built-in list or upload a font.",
    systemFontsDenied: "System font permission was not granted.",
    batchExport: "Batch export (CSV / Excel)",
    importSheet: "Spreadsheet file",
    batchEmpty: "Import a CSV or Excel file to generate one card per row.",
    batchReady: "{count} cards ready.",
    batchNoColumn: "Unbound",
    batchNoBinding: "Bind at least one text layer to a spreadsheet column first.",
    batchProcessing: "Rendering {current}/{total}…",
    batchZipping: "Packing ZIP…",
    batchDone: "ZIP downloaded — {count} cards.",
    downloadZip: "Download ZIP",
    sheetError: "Could not read that spreadsheet.",
    language: "Language",
    download: "Download PNG",
    reset: "Reset",
    preview: "Preview",
    fillCanvas: "Fill frame",
    sizeLabel: "Edit area ratio",
    ratioStandard: "2:1 · Standard",
    ratioLarge: "8:3 · Large",
    ratioWide: "4:1 · Wide",
    sizeCustom: "Custom…",
    apply: "Apply",
    threeDTab: "3D preview",
    threeDHint: "Drag to rotate · scroll to zoom · double-click to reset",
    loadingThree: "Loading 3D tools…",
    loadingXlsx: "Loading spreadsheet tools…",
    dragHint: "Drag to move · drag a corner to resize · arrow keys to nudge · Shift + arrows for 1 px steps",
    downloaded: "PNG downloaded.",
    resetDone: "Reset to the default card.",
    layerDeleted: "Layer deleted.",
    fontLoaded: "Font loaded: {name}",
    imageAdded: "Image layer added.",
    loading: "Loading artwork…",
    error: "Could not load the template artwork.",
    fileError: "That file could not be loaded.",
    localServerRequired: "The browser blocked canvas export. Run start.command and open http://localhost:4173, then try again.",
  },
  "zh-CN": {
    title: "桌面铭牌工作室",
    subtitle: "选择模板、编辑图层，一键导出可打印的桌面铭牌。",
    layers: "图层",
    templates: "模板",
    templateBlank: "空白",
    templateClassic: "经典",
    backgroundLayer: "背景",
    templateApplied: "模板已应用。",
    addText: "＋文本",
    addImage: "＋图片",
    nameLayer: "姓名",
    numberLayer: "编号",
    textLayer: "文本",
    imageLayer: "图片",
    copySuffix: "副本",
    visibility: "显示 / 隐藏",
    moveUp: "上移",
    moveDown: "下移",
    duplicate: "复制",
    delete: "删除",
    content: "文字",
    font: "字体",
    fontPickerTitle: "选择字体",
    fontSearchPlaceholder: "搜索字体…",
    fontPreviewSample: "姓名 123",
    fontGroupBuiltins: "内置字体",
    fontGroupCustom: "上传的字体",
    fontGroupSystem: "系统字体",
    fontSearchEmpty: "没有匹配的字体。",
    close: "关闭",
    size: "字号",
    color: "颜色",
    shadow: "阴影",
    outline: "描边",
    outlineColor: "描边颜色",
    outlineWidth: "粗细",
    shadowColor: "阴影颜色",
    opacity: "透明度",
    blur: "模糊",
    offsetX: "水平偏移",
    offsetY: "垂直偏移",
    width: "宽度",
    loadSystemFonts: "加载系统字体",
    uploadFont: "上传字体文件",
    systemFontsNote: "“加载系统字体”需要浏览器授权，且仅在 localhost 本机服务下可用。",
    systemFontsLoaded: "已加载 {count} 个系统字体系列。",
    systemFontsUnavailable: "当前浏览器无法列出系统字体，可使用内置字体或上传字体文件。",
    systemFontsDenied: "未授予读取系统字体的权限。",
    batchExport: "批量导出（CSV / Excel）",
    importSheet: "表格文件",
    batchEmpty: "导入 CSV 或 Excel，每行生成一张卡片。",
    batchReady: "已就绪 {count} 张。",
    batchNoColumn: "不绑定",
    batchNoBinding: "请先为文字图层选择要绑定的表格列。",
    batchProcessing: "正在生成 {current}/{total}…",
    batchZipping: "正在打包 ZIP…",
    batchDone: "ZIP 已下载，共 {count} 张。",
    downloadZip: "下载 ZIP",
    sheetError: "无法读取该表格文件。",
    language: "界面语言",
    download: "下载 PNG",
    reset: "重置",
    preview: "预览",
    fillCanvas: "撑满尺寸",
    sizeLabel: "编辑区比例",
    ratioStandard: "2:1 · 标准",
    ratioLarge: "8:3 · 大幅",
    ratioWide: "4:1 · 横幅",
    sizeCustom: "自定义…",
    apply: "应用",
    threeDTab: "3D 预览",
    threeDHint: "拖动旋转 · 滚轮缩放 · 双击复位",
    loadingThree: "正在加载 3D 组件…",
    loadingXlsx: "正在加载表格组件…",
    dragHint: "拖动移动 · 拖动边角缩放 · 方向键微调 · Shift + 方向键 1px 步进",
    downloaded: "PNG 已下载。",
    resetDone: "已恢复默认内容。",
    layerDeleted: "图层已删除。",
    fontLoaded: "字体已加载：{name}",
    imageAdded: "已添加图片图层。",
    loading: "正在加载底图…",
    error: "底图加载失败。",
    fileError: "文件加载失败。",
    localServerRequired: "浏览器拦截了画布导出。请运行 start.command 并打开 http://localhost:4173 后重试。",
  },
};

const template = new Image();
const canvas = document.querySelector("#cardCanvas");
const context = canvas.getContext("2d");
const editorCanvas = document.querySelector("#editorCanvas");
const editorContext = editorCanvas.getContext("2d");
const panelCanvas = document.createElement("canvas");
panelCanvas.width = card.width;
panelCanvas.height = panelHeight();
const panelContext = panelCanvas.getContext("2d");

const sizePresetHost = document.querySelector("#sizePresetHost");
const customSizeFields = document.querySelector("#customSizeFields");
const customWidth = document.querySelector("#customWidth");
const customHeight = document.querySelector("#customHeight");

const toast = document.querySelector("#toast");
const layerList = document.querySelector("#layerList");
const inspectorTitle = document.querySelector("#inspectorTitle");
const shadowControls = document.querySelector("#shadowControls");
const shadowSection = document.querySelector("#shadowSection");
const outlineSection = document.querySelector("#outlineSection");
const fontModal = document.querySelector("#fontModal");
const fontPickerButton = document.querySelector("#fontPickerButton");
const fontPickerLabel = document.querySelector("#fontPickerLabel");
const fontSearch = document.querySelector("#fontSearch");
const fontModalList = document.querySelector("#fontModalList");
const batchControls = {
  file: document.querySelector("#batchFile"),
  summary: document.querySelector("#batchSummary"),
  progress: document.querySelector("#batchProgress"),
  exportButton: document.querySelector("#batchExportButton"),
};
const batchBindingMap = new Map(); // 文字图层 id → 绑定的表格列下标（"" 为不绑定）

const controls = {
  text: document.querySelector("#layerText"),
  size: document.querySelector("#layerSize"),
  color: document.querySelector("#layerColor"),
  shadowEnabled: document.querySelector("#layerShadowEnabled"),
  shadowColor: document.querySelector("#layerShadowColor"),
  shadowOpacity: document.querySelector("#layerShadowOpacity"),
  shadowBlur: document.querySelector("#layerShadowBlur"),
  shadowX: document.querySelector("#layerShadowX"),
  shadowY: document.querySelector("#layerShadowY"),
  imageOpacity: document.querySelector("#layerImageOpacity"),
  imageFill: document.querySelector("#layerImageFill"),
  outlineEnabled: document.querySelector("#layerOutlineEnabled"),
  outlineColor: document.querySelector("#layerOutlineColor"),
  outlineWidth: document.querySelector("#layerOutlineWidth"),
};

const outputs = {
  size: document.querySelector("#layerSizeValue"),
  shadowOpacity: document.querySelector("#layerShadowOpacityValue"),
  shadowBlur: document.querySelector("#layerShadowBlurValue"),
  shadowX: document.querySelector("#layerShadowXValue"),
  shadowY: document.querySelector("#layerShadowYValue"),
  outlineWidth: document.querySelector("#layerOutlineWidthValue"),
};

const layerThumb = document.querySelector("#layerImageThumb");

let layers = [];
let selectedLayerId = null;
let nextLayerId = 1;
let textLayerCounter = 0;

function nextTextLayerName() {
  textLayerCounter += 1;
  return String(textLayerCounter).padStart(2, "0");
}
let templateReady = false;
let dragState = null;
let resizeState = null;
let uploadedFontUrl = null;
let batchRows = [];
let batchHeaders = [];
let toastTimer = null;

/* ---------- Layers ---------- */

function createTextLayer(options = {}) {
  return {
    id: `layer-${nextLayerId++}`,
    type: "text",
    role: options.role ?? null,
    label: options.label ?? null,
    visible: true,
    text: options.text ?? t("textLayer"),
    x: options.x ?? card.width / 2,
    y: options.y ?? panelHeight() / 2,
    // Auto-shrink only guards against running off the canvas, so the size
    // slider stays effective across its whole range.
    maxWidth: options.maxWidth ?? card.width - 160,
    font: options.font ?? BUILTIN_FONTS[0].family,
    size: options.size ?? 360,
    color: options.color ?? "#627ef5",
    outline: options.outline ?? { enabled: true, color: "#ffffff", width: 7.5 },
    shadow: {
      enabled: options.shadow?.enabled ?? true,
      color: options.shadow?.color ?? "#1e232d",
      opacity: options.shadow?.opacity ?? 48,
      blur: options.shadow?.blur ?? 24,
      x: options.shadow?.x ?? 13,
      y: options.shadow?.y ?? 24,
    },
  };
}

/* ---------- Templates ---------- */

const TEMPLATES = [
  {
    id: "blank",
    nameKey: "templateBlank",
    buildLayers() {
      return [];
    },
  },
  {
    id: "classic",
    nameKey: "templateClassic",
    buildLayers() {
      return [
        createBackgroundLayer(),
        createTextLayer({
          text: "灵不灵",
          outline: { enabled: true, color: "#ffffff", width: 7.5 },
          ...defaultLayerOptions("name"),
        }),
        createTextLayer({
          text: "08",
          outline: { enabled: false, color: "#ffffff", width: 5 },
          ...defaultLayerOptions("number"),
        }),
      ];
    },
  },
];
// 默认应用第二个模板（经典）
let currentTemplateId = TEMPLATES[1].id;
const templateThumbnails = {};

const templateStrip = document.querySelector("#templateStrip");

// 缩略图按模板数据完整合成（背景 + 默认文字），按模板 id 缓存
function templateThumbnail(tpl) {
  if (!(template.complete && template.naturalWidth > 0)) return null;
  if (!templateThumbnails[tpl.id]) {
    const panel = document.createElement("canvas");
    panel.width = card.width;
    panel.height = panelHeight();
    const panelContext = panel.getContext("2d");
    tpl.buildLayers().forEach((layer) => drawLayer(panelContext, layer));

    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 120;
    canvas.getContext("2d").drawImage(panel, 0, 0, 240, 120);
    templateThumbnails[tpl.id] = canvas.toDataURL("image/png");
  }
  return templateThumbnails[tpl.id];
}

function buildTemplateStrip() {
  templateStrip.replaceChildren();
  TEMPLATES.forEach((tpl) => {
    const thumbnail = templateThumbnail(tpl);
    if (!thumbnail) return;
    const selected = tpl.id === currentTemplateId;
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = `template-card${selected ? " selected" : ""}`;
    cardButton.setAttribute("role", "option");
    cardButton.setAttribute("aria-selected", String(selected));

    const image = document.createElement("img");
    image.src = thumbnail;
    image.alt = "";

    const label = document.createElement("span");
    label.textContent = t(tpl.nameKey);

    cardButton.append(image, label);
    cardButton.addEventListener("click", () => applyTemplate(tpl));
    templateStrip.append(cardButton);
  });
}

function applyTemplate(tpl, quiet = false) {
  const previous = layers;
  currentTemplateId = tpl.id;
  layers = tpl.buildLayers();
  selectedLayerId = layers[0]?.id ?? null;
  previous.forEach((layer) => releaseLayerAssets(layer, previous));
  renderLayerList();
  syncInspector();
  buildTemplateStrip();
  renderBatchBindings();
  render();
  if (!quiet) notify("templateApplied", {}, "success");
}

function reset(quiet = false) {
  const tpl = TEMPLATES.find((item) => item.id === currentTemplateId) ?? TEMPLATES[0];
  applyTemplate(tpl, quiet);
  if (!quiet) notify("resetDone");
}

let templateLowerImage = null;

// 底图下半区的独立图片对象：让背景以普通图片图层的身份参与渲染和检查器
function getTemplateLowerImage() {
  if (!templateLowerImage) {
    const c = document.createElement("canvas");
    c.width = TEMPLATE_SIZE;
    c.height = TEMPLATE_SIZE / 2;
    c
      .getContext("2d")
      .drawImage(template, 0, TEMPLATE_SIZE / 2, TEMPLATE_SIZE, TEMPLATE_SIZE / 2, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE / 2);
    templateLowerImage = new Image();
    templateLowerImage.src = c.toDataURL("image/png");
    if (!templateLowerImage.complete) {
      templateLowerImage.addEventListener("load", () => {
        render();
        buildTemplateStrip();
      }, { once: true });
    }
  }
  return templateLowerImage;
}

function createBackgroundLayer() {
  return {
    id: `layer-${nextLayerId++}`,
    type: "image",
    role: "background",
    label: null,
    visible: true,
    fillsCanvas: true, // 始终铺满画布：不参与拖拽缩放，忽略位置/宽度
    image: getTemplateLowerImage(),
    aspectRatio: TEMPLATE_SIZE / (TEMPLATE_SIZE / 2),
    x: card.width / 2,
    y: panelHeight() / 2,
    width: card.width,
    opacity: 100,
    outline: { enabled: false, color: "#ffffff", width: 2 },
  };
}

// 默认文字的模板位置（基于 2362 × 1181 下半区设计稿），按当前卡片尺寸缩放
function defaultLayerOptions(role) {
  const ratioX = card.width / TEMPLATE_SIZE;
  const ratioY = panelHeight() / (TEMPLATE_SIZE / 2);
  if (role === "number") {
    return {
      role,
      x: 2070 * ratioX,
      y: 310 * ratioY,
      font: BUILTIN_FONTS[0].family,
      size: Math.round(410 * ratioX),
      color: "#ffffff",
      outline: false,
      shadow: { enabled: false, color: "#1e232d", opacity: 35, blur: 15, x: 8, y: 12 },
    };
  }
  return { role, x: 930 * ratioX, y: 629 * ratioY, size: Math.round(430 * ratioX) };
}

function getRoleLayer(role) {
  return layers.find((layer) => layer.role === role) ?? null;
}

function getSelectedLayer() {
  return layers.find((layer) => layer.id === selectedLayerId) ?? null;
}

function getLayerName(layer) {
  if (layer.role === "background") return t("backgroundLayer");
  if (layer.role === "name") return t("nameLayer");
  if (layer.role === "number") return t("numberLayer");
  if (layer.type === "image") return layer.label || t("imageLayer");
  return layer.label || layer.text || t("textLayer");
}

/* ---------- i18n & toast ---------- */

let currentLocale = "zh-CN";

function getLocale() {
  return currentLocale in translations ? currentLocale : "en";
}

function t(key) {
  return translations[getLocale()][key] ?? translations.en[key] ?? key;
}

function notify(key, replacements = {}, kind = "info") {
  let message = t(key);
  Object.entries(replacements).forEach(([name, value]) => {
    message = message.replace(`{${name}}`, value);
  });
  toast.textContent = message;
  toast.dataset.kind = kind;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  if (kind !== "error") {
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }
}

// 低频功能（批量导入/导出、3D 预览）的脚本按需加载
const loadedScripts = new Map();

function loadScript(src) {
  if (!loadedScripts.has(src)) {
    loadedScripts.set(src, new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => {
        loadedScripts.delete(src);
        reject(new Error(`加载失败：${src}`));
      };
      document.head.append(script);
    }));
  }
  return loadedScripts.get(src);
}

// 可爱风 SVG 加载动画：摇摆的小帐篷 + 转脸太阳 + 闪烁星星
const TENT_LOADER_SVG = `<svg class="tent-loader" viewBox="0 0 140 112" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="70" cy="100" rx="44" ry="7" fill="rgba(70,55,25,.16)"/>
  <g class="tl-tent">
    <path d="M70 22 L34 52 L34 61 L70 31 Z" fill="#e8dcb8"/>
    <path d="M70 22 L106 52 L106 88 L70 58 Z" fill="#ffe98a" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
    <path d="M78 32 L98 48" stroke="#f6b73c" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="86" cy="58" r="2.2" fill="#31405f"/>
    <circle cx="96" cy="62" r="2.2" fill="#31405f"/>
    <path d="M85 68 Q91 72 97 67" stroke="#31405f" stroke-width="2" stroke-linecap="round"/>
    <circle cx="70" cy="17" r="4.5" fill="#ff9f43"/>
  </g>
  <g class="tl-sun">
    <circle cx="22" cy="28" r="9" fill="#ff9f43"/>
    <g stroke="#ff9f43" stroke-width="2.4" stroke-linecap="round">
      <path d="M22 12 V16"/><path d="M22 40 V44"/><path d="M6 28 H10"/><path d="M34 28 H38"/>
      <path d="M11 17 L14 20"/><path d="M30 36 L33 39"/><path d="M33 17 L30 20"/><path d="M14 36 L11 39"/>
    </g>
    <circle cx="19" cy="26" r="1.4" fill="#31405f"/>
    <circle cx="25" cy="26" r="1.4" fill="#31405f"/>
    <path d="M19 30 Q22 32.5 25 30" stroke="#31405f" stroke-width="1.6" stroke-linecap="round"/>
  </g>
  <path class="tl-spark" d="M120 14 Q121.5 22 129 24 Q121.5 26 120 34 Q118.5 26 111 24 Q118.5 22 120 14 Z" fill="#ffcf4d"/>
  <path class="tl-spark tl-spark-2" d="M12 64 Q13.5 71 20 73 Q13.5 75 12 82 Q10.5 75 4 73 Q10.5 71 12 64 Z" fill="#7c9bff"/>
</svg>`;

const LOADER_MIN_MS = 900; // 最短展示时长：本地加载太快时动画一闪而过，看不到

function showLoader(container, message = "") {
  const startedAt = performance.now();
  const wrap = document.createElement("div");
  wrap.className = "svg-loader-wrap";
  wrap.innerHTML = TENT_LOADER_SVG;
  if (message) {
    const text = document.createElement("p");
    text.className = "svg-loader-text";
    text.textContent = message;
    wrap.append(text);
  }
  container.append(wrap);
  let hidden = false;
  return () => {
    if (hidden) return;
    hidden = true;
    const remaining = LOADER_MIN_MS - (performance.now() - startedAt);
    setTimeout(() => wrap.remove(), Math.max(0, remaining));
  };
}

function applyTranslations() {
  document.documentElement.lang = getLocale();
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  refreshDropdownLabels();
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  document.querySelectorAll("[data-tooltip]").forEach((element) => {
    const label = t(element.dataset.tooltip);
    element.title = label;
    element.setAttribute("aria-label", label);
  });
  renderLayerList();
  syncInspector();
  buildTemplateStrip();
  refreshDropdownLabels();
  if (!fontModal.hidden) renderFontOptions(fontSearch.value);
}

/* ---------- Reusable dropdown ---------- */

function createDropdown({
  options = [],
  value = null,
  ariaLabel = "",
  alignRight = false,
  onChange = null,
} = {}) {
  const root = document.createElement("div");
  root.className = "dropdown";
  if (alignRight) root.classList.add("align-right");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  const buttonLabel = document.createElement("span");
  buttonLabel.className = "dropdown-label";
  const chevron = document.createElement("span");
  chevron.className = "font-picker-chevron";
  chevron.textContent = "▾";
  chevron.setAttribute("aria-hidden", "true");
  button.append(buttonLabel, chevron);

  const menu = document.createElement("div");
  menu.className = "dropdown-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  root.append(button, menu);

  let currentOptions = options.map((option) => ({ ...option }));
  let currentValue = value ?? currentOptions[0]?.value ?? null;

  function refreshButton() {
    const option = currentOptions.find((item) => item.value === currentValue);
    buttonLabel.textContent = option ? (option.short ?? option.label) : "";
  }

  function renderMenu() {
    menu.replaceChildren();
    currentOptions.forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = `dropdown-option${option.value === currentValue ? " selected" : ""}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.value === currentValue));
      item.textContent = option.label;
      item.addEventListener("click", () => {
        select(option.value);
        close();
        onChange?.(option.value);
      });
      menu.append(item);
    });
  }

  function open() {
    renderMenu();
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
  }

  function close() {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  }

  function select(value) {
    currentValue = value;
    refreshButton();
    if (!menu.hidden) renderMenu();
  }

  button.addEventListener("click", () => (menu.hidden ? open() : close()));
  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) close();
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      button.focus();
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const items = [...menu.querySelectorAll(".dropdown-option")];
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement);
      const next = index < 0
        ? (event.key === "ArrowDown" ? 0 : items.length - 1)
        : Math.min(items.length - 1, Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1)));
      items[next].focus();
      event.preventDefault();
    }
  });

  refreshButton();
  if (ariaLabel) button.setAttribute("aria-label", ariaLabel);

  return {
    element: root,
    get value() { return currentValue; },
    setOptions(nextOptions) {
      currentOptions = nextOptions.map((option) => ({ ...option }));
      if (!currentOptions.some((option) => option.value === currentValue)) {
        currentValue = currentOptions[0]?.value ?? null;
      }
      refreshButton();
      if (!menu.hidden) renderMenu();
    },
    setValue(nextValue) { select(nextValue); },
    setDisabled(disabled) {
      button.disabled = disabled;
      if (disabled) close();
    },
    setAriaLabel(text) { button.setAttribute("aria-label", text); },
    close,
  };
}

/* ---------- Font picker ---------- */


const BUILTIN_FONTS = [
  {
    label: "黑体（默认）",
    family: '"PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
  },
  { label: "宋体", family: '"Songti SC", SimSun, serif' },
  { label: "楷体", family: '"Kaiti SC", STKaiti, KaiTi, serif' },
  { label: "圆体", family: '"Yuanti SC", YouYuan, sans-serif' },
  { label: "无衬线", family: "system-ui, sans-serif" },
  { label: "衬线", family: 'Georgia, "Times New Roman", "Songti SC", serif' },
];

let customFonts = []; // { family, label } — populated by font file upload
let systemFontFamilies = null; // null until queryLocalFonts succeeds

function getFontLabel(family) {
  const custom = customFonts.find((font) => font.family === family);
  if (custom) return custom.label;
  const builtin = BUILTIN_FONTS.find((font) => font.family === family);
  return builtin?.label ?? family;
}

function updateFontPickerLabel(layer) {
  fontPickerLabel.textContent = getFontLabel(layer?.font ?? "");
  fontPickerLabel.style.fontFamily = layer?.font ? cssFontFamily(layer.font) : "";
}

function getFontPreviewText() {
  const layer = getSelectedLayer();
  const text = layer?.type === "text" ? layer.text.trim() : "";
  return text ? text.slice(0, 8) : t("fontPreviewSample");
}

function getFontGroups() {
  const groups = [
    { label: t("fontGroupBuiltins"), fonts: [...BUILTIN_FONTS] },
    { label: t("fontGroupCustom"), fonts: [...customFonts] },
  ];
  if (systemFontFamilies) {
    groups.push({
      label: t("fontGroupSystem"),
      fonts: systemFontFamilies.map((family) => ({ family, label: family })),
    });
  }
  return groups;
}

function renderFontOptions(filter = "") {
  const query = filter.trim().toLowerCase();
  const previewText = getFontPreviewText();
  const selectedFamily = getSelectedLayer()?.font;
  fontModalList.replaceChildren();

  for (const group of getFontGroups()) {
    const matches = group.fonts.filter(
      (font) => !query
        || font.label.toLowerCase().includes(query)
        || font.family.toLowerCase().includes(query),
    );
    if (matches.length === 0) continue;

    const heading = document.createElement("div");
    heading.className = "font-group-label";
    heading.textContent = group.label;
    fontModalList.append(heading);

    for (const font of matches) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = `font-option${font.family === selectedFamily ? " selected" : ""}`;
      option.dataset.family = font.family;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(font.family === selectedFamily));

      const name = document.createElement("span");
      name.className = "font-option-name";
      name.textContent = font.label;

      const preview = document.createElement("span");
      preview.className = "font-option-preview";
      preview.textContent = previewText;
      preview.style.fontFamily = cssFontFamily(font.family);

      option.append(name, preview);
      fontModalList.append(option);
    }
  }

  if (query && fontModalList.querySelector(".font-option") === null) {
    const empty = document.createElement("div");
    empty.className = "font-group-label";
    empty.textContent = t("fontSearchEmpty");
    fontModalList.append(empty);
  }
}

function openFontModal() {
  fontSearch.value = "";
  renderFontOptions();
  fontModal.hidden = false;
  fontSearch.focus();
  fontModalList.querySelector(".font-option.selected")?.scrollIntoView({ block: "center" });
}

function closeFontModal() {
  fontModal.hidden = true;
}

function applyFontSelection(family) {
  const layer = getSelectedLayer();
  if (layer?.type === "text" && family) {
    layer.font = family;
    updateFontPickerLabel(layer);
    render();
  }
  closeFontModal();
}

/* ---------- Drawing ---------- */

const GENERIC_FONT_FAMILIES = new Set([
  "sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui",
  "ui-sans-serif", "ui-serif", "ui-monospace", "inherit",
]);

// 兼容单字体名与逗号分隔的字体栈，统一规范为带引号的 CSS font-family
function cssFontFamily(family) {
  return family
    .split(",")
    .map((part) => {
      const name = part.trim().replace(/^["']|["']$/g, "");
      if (!name) return null;
      if (GENERIC_FONT_FAMILIES.has(name.toLowerCase())) return name;
      return `"${name}"`;
    })
    .filter(Boolean)
    .join(", ");
}

function fitFontSize(targetContext, layer) {
  let size = layer.size;
  while (size > 60) {
    targetContext.font = `${size}px ${cssFontFamily(layer.font)}`;
    if (targetContext.measureText(layer.text).width <= layer.maxWidth) return size;
    size -= 4;
  }
  return 60;
}

function hexToRgba(hex, alphaPercent) {
  const normalized = hex.replace("#", "");
  const number = Number.parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alphaPercent / 100})`;
}

function drawImageLayer(targetContext, layer) {
  if (!layer.image?.complete) return;
  targetContext.save();
  targetContext.globalAlpha = layer.opacity / 100;
  if (layer.fillsCanvas) {
    // 背景图铺满整个编辑区
    targetContext.drawImage(layer.image, 0, 0, card.width, panelHeight());
  } else {
    const height = layer.width / layer.aspectRatio;
    const left = layer.x - layer.width / 2;
    const top = layer.y - height / 2;
    targetContext.drawImage(layer.image, left, top, layer.width, height);
    if (layer.outline?.enabled && layer.outline.width > 0) {
      targetContext.lineWidth = Math.max(1, (layer.width * layer.outline.width) / 100);
      targetContext.strokeStyle = layer.outline.color;
      targetContext.strokeRect(left, top, layer.width, height);
    }
  }
  targetContext.restore();
}

function drawLayer(targetContext, layer) {
  if (!layer.visible) return;
  if (layer.type === "text") drawTextLayer(targetContext, layer);
  if (layer.type === "image") drawImageLayer(targetContext, layer);
}

function drawTextLayer(targetContext, layer) {
  if (!layer.text) return;
  const fontSize = fitFontSize(targetContext, layer);
  targetContext.save();
  targetContext.font = `${fontSize}px ${cssFontFamily(layer.font)}`;
  targetContext.textAlign = "center";
  targetContext.textBaseline = "middle";
  targetContext.lineJoin = "round";
  targetContext.miterLimit = 2;
  const outline = layer.outline?.enabled && layer.outline.width > 0 ? layer.outline : null;
  if (outline) {
    targetContext.lineWidth = Math.max(2, (fontSize * outline.width) / 100);
    targetContext.strokeStyle = outline.color;
  }
  targetContext.fillStyle = layer.color;

  if (layer.shadow.enabled) {
    targetContext.shadowColor = hexToRgba(layer.shadow.color, layer.shadow.opacity);
    targetContext.shadowBlur = layer.shadow.blur;
    targetContext.shadowOffsetX = layer.shadow.x;
    targetContext.shadowOffsetY = layer.shadow.y;
    if (outline) targetContext.strokeText(layer.text, layer.x, layer.y, layer.maxWidth);
    targetContext.fillText(layer.text, layer.x, layer.y, layer.maxWidth);
    targetContext.shadowColor = "transparent";
    targetContext.shadowBlur = 0;
    targetContext.shadowOffsetX = 0;
    targetContext.shadowOffsetY = 0;
  }

  if (outline) targetContext.strokeText(layer.text, layer.x, layer.y, layer.maxWidth);
  targetContext.fillText(layer.text, layer.x, layer.y, layer.maxWidth);
  targetContext.restore();
}

function getLayerBounds(layer, targetContext = editorContext) {
  if (layer.fillsCanvas) {
    return { x: 0, y: 0, width: card.width, height: panelHeight() };
  }
  if (layer.type === "image") {
    const height = layer.width / layer.aspectRatio;
    return { x: layer.x - layer.width / 2, y: layer.y - height / 2, width: layer.width, height };
  }

  const fontSize = fitFontSize(targetContext, layer);
  targetContext.save();
  targetContext.font = `${fontSize}px ${cssFontFamily(layer.font)}`;
  const measuredWidth = Math.min(targetContext.measureText(layer.text || " ").width, layer.maxWidth);
  targetContext.restore();
  const padding = Math.max(24, fontSize * 0.1);
  return {
    x: layer.x - measuredWidth / 2 - padding,
    y: layer.y - fontSize * 0.58 - padding,
    width: measuredWidth + padding * 2,
    height: fontSize * 1.16 + padding * 2,
  };
}

/* ---------- 3D preview (tent nameplate) ---------- */

const threeDContainer = document.querySelector("#threeDContainer");
const threeD = {
  inited: false,
  failed: false,
  active: false,
  renderer: null,
  scene: null,
  camera: null,
  group: null,
  faces: [],
  frontTexture: null,
  backCanvas: null,
  backTexture: null,
  yaw: -0.55,
  pitch: 0.4,
  radius: 5.6,
  targetY: 0.72,
  autoRotating: true,
  needsRender: true,
  dirtyTextures: true,
};

function update3DTextures() {
  if (!threeD.inited) return;
  threeD.frontTexture.needsUpdate = true;
  // 背面用未旋转的面板：折叠的空间变换已由 3D 几何完成，
  // 对面看到的文字应与正面一样是正立的
  const back = threeD.backCanvas;
  if (back.width !== panelCanvas.width || back.height !== panelCanvas.height) {
    back.width = panelCanvas.width;
    back.height = panelCanvas.height;
  }
  const backCtx = back.getContext("2d");
  backCtx.setTransform(1, 0, 0, 1, 0, 0);
  backCtx.clearRect(0, 0, back.width, back.height);
  backCtx.drawImage(panelCanvas, 0, 0);
  threeD.backTexture.needsUpdate = true;
  threeD.needsRender = true;
}

function buildTent() {
  const group = threeD.group;
  threeD.faces.forEach((face) => {
    group.remove(face);
    face.geometry.dispose();
  });
  threeD.faces = [];
  if (threeD.edges) {
    group.remove(threeD.edges);
    threeD.edges.geometry.dispose();
    threeD.edges.material.dispose();
    threeD.edges = null;
  }

  const aspect = panelHeight() / card.width;
  const width = 3.2;
  const height = width * aspect;
  const tilt = THREE.MathUtils.degToRad(16);
  const thickness = 0.1;
  const ridgeY = height * Math.cos(tilt);
  const geometry = new THREE.PlaneGeometry(width, height);

  const d = height * Math.sin(tilt);
  const h = height * Math.cos(tilt);
  const hx = thickness / 2;
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  // 两面纹理贴在外侧表面（略微外移避免与侧壁 z-fighting）
  const makeFace = (texture) => {
    const pivot = new THREE.Group();
    pivot.position.set(0, ridgeY, 0);
    pivot.rotation.order = "YXZ";
    pivot.rotation.y = texture === threeD.backTexture ? Math.PI : 0;
    pivot.rotation.x = -tilt;
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ map: texture }),
    );
    mesh.position.set(0, -height / 2, hx + 0.003);
    pivot.add(mesh);
    group.add(pivot);
    threeD.faces.push(pivot);
  };

  makeFace(threeD.frontTexture);
  makeFace(threeD.backTexture);

  // 厚度：外轮廓挤出侧壁（顶脊、左右三角、前后底边），中间挖空
  const shape = new THREE.Shape();
  shape.moveTo(d + hx * ct, hx * st);
  shape.lineTo(0, h + hx / ct);
  shape.lineTo(-d - hx * ct, hx * st);
  shape.lineTo(-d + hx * ct, -hx * st);
  shape.lineTo(0, h - hx / ct);
  shape.lineTo(d - hx * ct, -hx * st);
  shape.closePath();

  const hole = new THREE.Path();
  hole.moveTo(d - hx * ct, -hx * st);
  hole.lineTo(0, h - hx / ct);
  hole.lineTo(-d + hx * ct, -hx * st);
  hole.lineTo(-d - hx * ct, hx * st);
  hole.lineTo(0, h + hx / ct);
  hole.lineTo(d + hx * ct, hx * st);
  hole.closePath();
  shape.holes.push(hole);

  const edges = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false }),
    new THREE.MeshLambertMaterial({ color: 0xf7f3e8 }),
  );
  edges.rotation.y = -Math.PI / 2;
  edges.position.x = width / 2;
  group.add(edges);
  threeD.edges = edges;
  threeD.needsRender = true;
}

function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 64, 10, 128, 64, 120);
  gradient.addColorStop(0, "rgba(60, 50, 30, 0.32)");
  gradient.addColorStop(1, "rgba(60, 50, 30, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 128);
  return new THREE.CanvasTexture(canvas);
}

function update3DCamera() {
  const { yaw, pitch, radius, targetY } = threeD;
  threeD.camera.position.set(
    radius * Math.cos(pitch) * Math.sin(yaw),
    targetY + radius * Math.sin(pitch),
    radius * Math.cos(pitch) * Math.cos(yaw),
  );
  threeD.camera.lookAt(0, targetY, 0);
}

function resize3D() {
  if (!threeD.inited) return;
  const width = threeDContainer.clientWidth;
  const height = threeDContainer.clientHeight;
  if (!width || !height) return;
  threeD.renderer.setSize(width, height, false);
  Object.assign(threeD.renderer.domElement.style, { width: "100%", height: "100%" });
  threeD.camera.aspect = width / height;
  threeD.camera.updateProjectionMatrix();
  threeD.needsRender = true;
}

function tick3D() {
  if (!threeD.active) return;
  if (threeD.autoRotating) {
    threeD.yaw += 0.0032;
    threeD.needsRender = true;
  }
  if (threeD.dirtyTextures) {
    update3DTextures();
    threeD.dirtyTextures = false;
  }
  if (threeD.needsRender) {
    update3DCamera();
    threeD.renderer.render(threeD.scene, threeD.camera);
    threeD.needsRender = false;
  }
  requestAnimationFrame(tick3D);
}

async function activate3D() {
  const hideLoader = showLoader(threeDContainer, t("loadingThree"));
  try {
    await loadScript("vendor/three.min.js");
  } catch (error) {
    console.error(error);
  }
  if (!init3D()) {
    hideLoader();
    // WebGL 不可用：回退为平面完整卡片
    threeDContainer.hidden = true;
    canvas.classList.remove("visually-hidden");
    canvas.classList.add("three-fallback");
    render();
    return;
  }
  cardCanvasHidden();
  if (threeD.dirtyTextures) {
    update3DTextures();
    threeD.dirtyTextures = false;
  }
  resize3D();
  if (!threeD.active) {
    threeD.active = true;
    requestAnimationFrame(tick3D);
  }
  threeD.needsRender = true;
  // 首帧渲染完成后再撤掉加载动画
  requestAnimationFrame(() => requestAnimationFrame(hideLoader));
}

function deactivate3D() {
  threeD.active = false;
  cardCanvasHidden();
}

function cardCanvasHidden() {
  threeDContainer.hidden = false;
  canvas.classList.add("visually-hidden");
  canvas.classList.remove("three-fallback");
}

function init3D() {
  if (threeD.inited) return true;
  if (threeD.failed || typeof THREE === "undefined") {
    threeD.failed = threeD.failed || typeof THREE === "undefined";
    return false;
  }
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    threeD.renderer = renderer;
    threeDContainer.appendChild(renderer.domElement);
    renderer.domElement.className = "three-canvas";

    threeD.scene = new THREE.Scene();
    threeD.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    threeD.scene.add(new THREE.AmbientLight(0xffffff, 0.92));
    const key = new THREE.DirectionalLight(0xffffff, 0.42);
    key.position.set(-2.5, 4, 3.5);
    threeD.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(2, 2.5, -3);
    threeD.scene.add(fill);

    threeD.frontTexture = new THREE.CanvasTexture(panelCanvas);
    threeD.frontTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    threeD.backCanvas = document.createElement("canvas");
    threeD.backTexture = new THREE.CanvasTexture(threeD.backCanvas);
    threeD.backTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    threeD.group = new THREE.Group();
    threeD.scene.add(threeD.group);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 2.6),
      new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    threeD.group.add(shadow);

    buildTent();

    // 交互：拖拽旋转 / 滚轮缩放 / 双击复位
    threeDContainer.addEventListener("pointerdown", (event) => {
      threeD.autoRotating = false;
      threeD.dragging = { x: event.clientX, y: event.clientY, yaw: threeD.yaw, pitch: threeD.pitch };
      threeDContainer.setPointerCapture(event.pointerId);
    });
    threeDContainer.addEventListener("pointermove", (event) => {
      if (!threeD.dragging) return;
      threeD.yaw = threeD.dragging.yaw - (event.clientX - threeD.dragging.x) * 0.006;
      threeD.pitch = Math.min(1.15, Math.max(0.04, threeD.dragging.pitch + (event.clientY - threeD.dragging.y) * 0.004));
      threeD.needsRender = true;
    });
    threeDContainer.addEventListener("pointerup", () => { threeD.dragging = null; });
    threeDContainer.addEventListener("pointercancel", () => { threeD.dragging = null; });
    threeDContainer.addEventListener("wheel", (event) => {
      event.preventDefault();
      threeD.radius = Math.min(10, Math.max(3, threeD.radius * (1 + Math.sign(event.deltaY) * 0.08)));
      threeD.needsRender = true;
    }, { passive: false });
    threeDContainer.addEventListener("dblclick", () => {
      threeD.yaw = -0.55;
      threeD.pitch = 0.4;
      threeD.radius = 5.6;
      threeD.needsRender = true;
    });

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(() => resize3D()).observe(threeDContainer);
    }

    threeD.inited = true;
    return true;
  } catch (error) {
    console.error(error);
    threeD.failed = true;
    return false;
  }
}

function drawSelection(targetContext) {
  const layer = getSelectedLayer();
  if (!layer?.visible) return;
  const bounds = getLayerBounds(layer, targetContext);
  targetContext.save();
  targetContext.strokeStyle = "#315af5";
  targetContext.lineWidth = 5;
  targetContext.setLineDash([16, 10]);
  targetContext.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  targetContext.fillStyle = "#ffffff";
  targetContext.strokeStyle = "#315af5";
  targetContext.setLineDash([]);
  // 背景图层铺满画布，没有缩放角点
  if (layer.fillsCanvas) {
    targetContext.restore();
    return;
  }
  for (const [x, y] of [
    [bounds.x, bounds.y],
    [bounds.x + bounds.width, bounds.y],
    [bounds.x, bounds.y + bounds.height],
    [bounds.x + bounds.width, bounds.y + bounds.height],
  ]) {
    targetContext.beginPath();
    targetContext.arc(x, y, 13, 0, Math.PI * 2);
    targetContext.fill();
    targetContext.stroke();
  }
  targetContext.restore();
}

/* ---------- Corner resize handles ---------- */

const RESIZE_HANDLE_TOLERANCE = 42;

function getHandlePoints(layer) {
  const bounds = getLayerBounds(layer);
  return [
    { x: bounds.x, y: bounds.y, cursor: "nwse-resize" },
    { x: bounds.x + bounds.width, y: bounds.y, cursor: "nesw-resize" },
    { x: bounds.x, y: bounds.y + bounds.height, cursor: "nesw-resize" },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: "nwse-resize" },
  ];
}

function hitHandle(point, layer) {
  for (const handle of getHandlePoints(layer)) {
    const dx = point.x - handle.x;
    const dy = point.y - handle.y;
    if (dx * dx + dy * dy <= RESIZE_HANDLE_TOLERANCE * RESIZE_HANDLE_TOLERANCE) return handle;
  }
  return null;
}

function renderPanel(targetContext, includeSelection = false) {
  targetContext.clearRect(0, 0, card.width, panelHeight());
  layers.forEach((layer) => drawLayer(targetContext, layer));
  if (includeSelection) drawSelection(targetContext);
}

function render() {
  if (!templateReady) return;
  renderPanel(panelContext, false);
  renderPanel(editorContext, true);

  const lowerTop = card.height - panelHeight();
  context.clearRect(0, 0, card.width, card.height);
  context.drawImage(panelCanvas, 0, lowerTop);
  context.save();
  context.translate(card.width, lowerTop);
  context.rotate(Math.PI);
  context.drawImage(panelCanvas, 0, 0);
  context.restore();
  threeD.dirtyTextures = true;
}

// 编辑区比例的简化表达（如 2:1、8:3、4:1）
function ratioText(width, height) {
  const ratio = width / height;
  for (let denominator = 1; denominator <= 12; denominator++) {
    const numerator = Math.round(ratio * denominator);
    if (numerator >= 1 && Math.abs(ratio - numerator / denominator) <= ratio * 0.02) {
      return `${numerator}:${denominator}`;
    }
  }
  return `${ratio.toFixed(2)}:1`;
}

let customRatioLabel = null;

function sizeOptions() {
  return [
    { value: "2362x2362", label: t("ratioStandard") },
    { value: "2362x1772", label: t("ratioLarge") },
    { value: "2362x1180", label: t("ratioWide") },
    {
      value: "custom",
      label: customRatioLabel ? `${customRatioLabel} · ${t("sizeCustom")}` : t("sizeCustom"),
    },
  ];
}

function updateSizePresetDisplay() {
  const value = `${card.width}x${card.height}`;
  if (sizeOptions().some((option) => option.value === value && option.value !== "custom")) {
    sizeDropdown.setOptions(sizeOptions());
    sizeDropdown.setValue(value);
    customSizeFields.hidden = true;
  } else {
    customRatioLabel = ratioText(card.width, panelHeight());
    sizeDropdown.setOptions(sizeOptions());
    sizeDropdown.setValue("custom");
  }
}

function applyCardSize(width, height) {
  const previous = { width: card.width, height: card.height };
  card.width = Math.round(Math.min(8192, Math.max(400, width)));
  // Keep the height even so both panels end up the same size.
  card.height = Math.round(Math.min(8192, Math.max(400, height)) / 2) * 2;

  editorCanvas.width = card.width;
  editorCanvas.height = panelHeight();
  cardCanvas.width = card.width;
  cardCanvas.height = card.height;
  panelCanvas.width = card.width;
  panelCanvas.height = panelHeight();

  const ratioX = card.width / previous.width;
  const ratioY = card.height / previous.height;
  layers.forEach((layer) => {
    layer.x *= ratioX;
    layer.y *= ratioY;
    clampLayer(layer);
  });
  // 卡片尺寸变了，缩略图按新比例重新生成
  Object.keys(templateThumbnails).forEach((key) => delete templateThumbnails[key]);
  if (threeD.inited) buildTent();
  updateSizePresetDisplay();
  render();
  buildTemplateStrip();
}

/* ---------- Layer list & inspector ---------- */

// 图层 chips 拖拽排序：DOM 顺序即 z-index 顺序（列表自上而下 = 从最上层开始）
let chipDrag = null;

layerList.addEventListener("pointerdown", (event) => {
  const chipSelect = event.target.closest(".chip-select");
  if (!chipSelect || event.button !== 0) return;
  const chip = chipSelect.closest(".layer-chip");
  const layer = layers.find((item) => item.id === chip.dataset.layerId);
  if (!layer) return;
  selectLayer(layer.id);
  chipDrag = { layerId: layer.id, startY: event.clientY, moved: false };
  layerList.setPointerCapture(event.pointerId);
});

layerList.addEventListener("pointermove", (event) => {
  if (!chipDrag) return;
  if (!chipDrag.moved) {
    if (Math.abs(event.clientY - chipDrag.startY) < 8) return;
    chipDrag.moved = true;
  }
  const draggedChip = layerList.querySelector(`.layer-chip[data-layer-id="${chipDrag.layerId}"]`);
  if (!draggedChip) return;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".layer-chip");
  if (target && target !== draggedChip) {
    const rect = target.getBoundingClientRect();
    layerList.insertBefore(draggedChip, event.clientY < rect.top + rect.height / 2 ? target : target.nextSibling);
  }
  event.preventDefault();
});

layerList.addEventListener("pointerup", () => {
  if (!chipDrag) return;
  if (chipDrag.moved) {
    const orderedIds = [...layerList.querySelectorAll(".layer-chip")].map((el) => el.dataset.layerId);
    if (orderedIds.length === layers.length) {
      // 列表自上而下显示最上层，layers 数组自下而上存储，故反序
      layers = orderedIds.map((id) => layers.find((layer) => layer.id === id));
      renderLayerList();
      render();
    }
  }
  chipDrag = null;
});

layerList.addEventListener("pointercancel", () => { chipDrag = null; });

function renderLayerList() {
  if (!layerList) return;
  layerList.replaceChildren();
  [...layers].reverse().forEach((layer) => {
    const chip = document.createElement("div");
    chip.className = `layer-chip${layer.id === selectedLayerId ? " selected" : ""}`;
    chip.dataset.layerId = layer.id;

    const visibility = document.createElement("input");
    visibility.type = "checkbox";
    visibility.checked = layer.visible;
    visibility.title = t("visibility");
    visibility.setAttribute("aria-label", `${t("visibility")} — ${getLayerName(layer)}`);
    visibility.addEventListener("change", () => {
      layer.visible = visibility.checked;
      render();
    });

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "chip-select";
    selectButton.textContent = `${layer.type === "text" ? "T" : "▣"} ${getLayerName(layer)}`;
    selectButton.addEventListener("click", () => selectLayer(layer.id));

    chip.append(visibility, selectButton);
    layerList.append(chip);
  });
}

function updateControlOutputs() {
  outputs.size.value = controls.size.value;
  outputs.shadowOpacity.value = `${controls.shadowOpacity.value}%`;
  outputs.shadowBlur.value = controls.shadowBlur.value;
  outputs.shadowX.value = controls.shadowX.value;
  outputs.shadowY.value = controls.shadowY.value;
  outputs.outlineWidth.value = `${controls.outlineWidth.value}%`;
}

function updateShadowAvailability() {
  const disabled = !controls.shadowEnabled.checked;
  shadowControls.setAttribute("aria-disabled", String(disabled));
  shadowControls.querySelectorAll("input").forEach((input) => {
    input.disabled = disabled;
  });
}

function syncInspector() {
  const layer = getSelectedLayer();
  layerInspector.hidden = !layer;
  if (!layer) return;
  inspectorTitle.textContent = getLayerName(layer);
  outlineSection.hidden = Boolean(layer.fillsCanvas);
  document.querySelectorAll(".text-only").forEach((element) => {
    element.hidden = layer.type !== "text";
  });
  document.querySelectorAll(".image-only").forEach((element) => {
    element.hidden = layer.type !== "image";
  });

  controls.outlineEnabled.checked = Boolean(layer.outline?.enabled);
  controls.outlineColor.value = layer.outline?.color ?? "#ffffff";
  controls.outlineWidth.value = layer.outline?.width ?? 2;

  if (layer.type === "text") {
    controls.text.value = layer.text;
    updateFontPickerLabel(layer);
    controls.size.value = layer.size;
    controls.color.value = layer.color;
    controls.shadowEnabled.checked = layer.shadow.enabled;
    controls.shadowColor.value = layer.shadow.color;
    controls.shadowOpacity.value = layer.shadow.opacity;
    controls.shadowBlur.value = layer.shadow.blur;
    controls.shadowX.value = layer.shadow.x;
    controls.shadowY.value = layer.shadow.y;
  } else if (layer.type === "image") {
    controls.imageOpacity.value = layer.opacity;
    controls.imageFill.checked = Boolean(layer.fillsCanvas);
    // 图片小图：对象 URL 仍在则直接复用
    if (layerThumb) layerThumb.src = layer.objectUrl || layer.image?.src || "";
  }
  updateControlOutputs();
  updateShadowAvailability();
}

function selectLayer(id) {
  selectedLayerId = id;
  renderLayerList();
  syncInspector();
  render();
}

function updateSelectedLayerFromInspector(event) {
  const layer = getSelectedLayer();
  if (!layer) return;

  if (layer.type === "text") {
    layer.text = controls.text.value;
    layer.size = Number(controls.size.value);
    layer.color = controls.color.value;
    layer.shadow.enabled = controls.shadowEnabled.checked;
    layer.shadow.color = controls.shadowColor.value;
    layer.shadow.opacity = Number(controls.shadowOpacity.value);
    layer.shadow.blur = Number(controls.shadowBlur.value);
    layer.shadow.x = Number(controls.shadowX.value);
    layer.shadow.y = Number(controls.shadowY.value);
  } else if (layer.type === "image") {
    layer.opacity = Math.min(100, Math.max(0, Number(controls.imageOpacity.value) || 0));
    const fill = controls.imageFill.checked;
    if (fill !== Boolean(layer.fillsCanvas)) {
      layer.fillsCanvas = fill;
      if (!fill) {
        // 退出铺满模式：回到画布居中的自由状态
        layer.x = card.width / 2;
        layer.y = panelHeight() / 2;
        layer.width = card.width;
      }
    }
  }

  layer.outline = {
    enabled: controls.outlineEnabled.checked,
    color: controls.outlineColor.value,
    width: Number(controls.outlineWidth.value),
  };

  updateControlOutputs();
  updateShadowAvailability();
  if (event?.target === controls.text) renderLayerList();
  render();
}

/* ---------- Layer actions ---------- */

function clampLayer(layer) {
  const bounds = getLayerBounds(layer);
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  layer.x = Math.max(halfWidth, Math.min(card.width - halfWidth, layer.x));
  layer.y = Math.max(halfHeight, Math.min(panelHeight() - halfHeight, layer.y));
}

function addTextLayer() {
  const layer = createTextLayer({
    text: t("textLayer"),
    label: nextTextLayerName(),
    x: card.width / 2,
    y: panelHeight() / 2,
    size: 300,
  });
  layers.push(layer);
  selectLayer(layer.id);
  renderBatchBindings();
  controls.text.focus();
  controls.text.select();
}

async function addImageLayer(file) {
  if (!file) return;
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
      image.src = objectUrl;
    });
    const layer = {
      id: `layer-${nextLayerId++}`,
      type: "image",
      role: null,
      label: file.name,
      visible: true,
      image,
      objectUrl,
      aspectRatio: image.naturalWidth / image.naturalHeight,
      x: card.width / 2,
      y: panelHeight() / 2,
      width: Math.min(520, image.naturalWidth),
      opacity: 100,
      outline: { enabled: false, color: "#ffffff", width: 2 },
    };
    layers.push(layer);
    selectLayer(layer.id);
    notify("imageAdded", {}, "success");
  } catch (error) {
    console.error(error);
    URL.revokeObjectURL(objectUrl);
    notify("fileError", {}, "error");
  }
}

function duplicateSelectedLayer() {
  const layer = getSelectedLayer();
  if (!layer) return;
  const baseName = getLayerName(layer);
  const copy = {
    ...layer,
    id: `layer-${nextLayerId++}`,
    role: null,
    label: `${baseName} ${t("copySuffix")}`,
    x: layer.x + 45,
    y: layer.y + 45,
    shadow: layer.type === "text" ? { ...layer.shadow } : undefined,
    outline: layer.outline ? { ...layer.outline } : undefined,
  };
  clampLayer(copy);
  layers.push(copy);
  selectLayer(copy.id);
  renderBatchBindings();
}

// Image layers may share an object URL after duplication; only revoke it
// when no remaining layer still references it.
function releaseLayerAssets(layer, context = layers) {
  if (layer.type !== "image" || !layer.objectUrl) return;
  const stillUsed = context.some(
    (other) => other !== layer && other.objectUrl && other.objectUrl === layer.objectUrl,
  );
  if (!stillUsed) URL.revokeObjectURL(layer.objectUrl);
}

function deleteSelectedLayer() {
  const index = layers.findIndex((layer) => layer.id === selectedLayerId);
  if (index < 0) return;
  const [removed] = layers.splice(index, 1);
  releaseLayerAssets(removed);
  selectedLayerId = layers[Math.min(index, layers.length - 1)]?.id ?? null;
  renderLayerList();
  syncInspector();
  renderBatchBindings();
  render();
  notify("layerDeleted");
}

function moveSelectedLayer(direction) {
  const index = layers.findIndex((layer) => layer.id === selectedLayerId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= layers.length) return;
  [layers[index], layers[nextIndex]] = [layers[nextIndex], layers[index]];
  renderLayerList();
  render();
}

/* ---------- Canvas drag & keyboard ---------- */

function canvasPoint(event) {
  const rect = editorCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * card.width,
    y: ((event.clientY - rect.top) / rect.height) * panelHeight(),
  };
}

function hitTest(point) {
  for (let index = layers.length - 1; index >= 0; index -= 1) {
    const layer = layers[index];
    if (!layer.visible) continue;
    const bounds = getLayerBounds(layer);
    if (
      point.x >= bounds.x
      && point.x <= bounds.x + bounds.width
      && point.y >= bounds.y
      && point.y <= bounds.y + bounds.height
    ) return layer;
  }
  return null;
}

editorCanvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);

  // Grabbing a corner handle of the selected layer starts a resize.
  const selected = getSelectedLayer();
  if (selected?.visible && !selected.fillsCanvas && hitHandle(point, selected)) {
    resizeState = {
      layerId: selected.id,
      start: point,
      startSize: selected.type === "text" ? selected.size : selected.width,
    };
    editorCanvas.setPointerCapture(event.pointerId);
    return;
  }

  const layer = hitTest(point);
  if (!layer) return;
  selectLayer(layer.id);
  dragState = { offsetX: point.x - layer.x, offsetY: point.y - layer.y };
  editorCanvas.setPointerCapture(event.pointerId);
});

editorCanvas.addEventListener("pointermove", (event) => {
  const point = canvasPoint(event);

  if (resizeState) {
    const layer = layers.find((item) => item.id === resizeState.layerId);
    if (!layer) return;
    // Scale around the layer center so text and images stay centered.
    const startDistance = Math.hypot(resizeState.start.x - layer.x, resizeState.start.y - layer.y);
    if (startDistance < 1) return;
    const distance = Math.hypot(point.x - layer.x, point.y - layer.y);
    // 文字与滑块量程一致；图片不设上限，可自由放大
    const limits = layer.type === "text" ? { min: 80, max: 680 } : { min: 24 };
    const nextSize = Math.round(
      Math.min(limits.max ?? Number.MAX_SAFE_INTEGER, Math.max(limits.min, resizeState.startSize * (distance / startDistance))),
    );
    if (layer.type === "text") {
      layer.size = nextSize;
      controls.size.value = nextSize;
    } else {
      layer.width = nextSize;
    }
    updateControlOutputs();
    render();
    return;
  }

  if (!dragState) {
    const selected = getSelectedLayer();
    const handle = selected?.visible && !selected.fillsCanvas ? hitHandle(point, selected) : null;
    editorCanvas.style.cursor = handle ? handle.cursor : "";
    return;
  }

  const layer = getSelectedLayer();
  if (!layer) return;
  layer.x = point.x - dragState.offsetX;
  layer.y = point.y - dragState.offsetY;
  clampLayer(layer);
  render();
});

function endDrag(event) {
  if (editorCanvas.hasPointerCapture(event.pointerId)) {
    editorCanvas.releasePointerCapture(event.pointerId);
  }
  dragState = null;
  resizeState = null;
  editorCanvas.style.cursor = "";
}

editorCanvas.addEventListener("pointerup", endDrag);
editorCanvas.addEventListener("pointercancel", endDrag);

const nudgeDeltas = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLElement) {
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || target.isContentEditable) return;
  }
  const layer = getSelectedLayer();
  if (!layer) return;

  const delta = nudgeDeltas[event.key];
  if (delta) {
    const step = event.shiftKey ? 1 : 12;
    layer.x += delta[0] * step;
    layer.y += delta[1] * step;
    clampLayer(layer);
    render();
    event.preventDefault();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    deleteSelectedLayer();
    event.preventDefault();
  }
});

/* ---------- Export ---------- */

function safeFilenamePart(value, fallback) {
  const cleaned = value.trim().replace(/[\\/:*?"<>|\s]+/g, "-");
  return cleaned || fallback;
}

function canvasToBlob(sourceCanvas) {
  return new Promise((resolve, reject) => {
    sourceCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG encoding failed"))), "image/png");
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  // Some browsers ignore clicks on detached download links.
  document.body.append(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 3000);
}

async function downloadPng() {
  if (!templateReady) {
    notify("loading");
    return;
  }
  render();
  const nameLayer = getRoleLayer("name");
  const numberLayer = getRoleLayer("number");
  const filename = `${safeFilenamePart(nameLayer?.text ?? "nameplate", "nameplate")}-${safeFilenamePart(
    numberLayer?.text ?? "card",
    "card",
  )}.png`;
  try {
    downloadBlob(await canvasToBlob(canvas), filename);
    notify("downloaded", {}, "success");
  } catch (error) {
    console.error(error);
    notify(error?.name === "SecurityError" ? "localServerRequired" : "fileError", {}, "error");
  }
}

/* ---------- Fonts ---------- */

async function loadCustomFont(file) {
  if (!file) return;
  if (uploadedFontUrl) URL.revokeObjectURL(uploadedFontUrl);
  uploadedFontUrl = URL.createObjectURL(file);
  const family = `Custom Font ${Date.now()}`;
  try {
    const fontFace = new FontFace(family, `url(${uploadedFontUrl})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    customFonts.push({ family, label: file.name });
    const layer = getSelectedLayer();
    if (layer?.type === "text") {
      layer.font = family;
      updateFontPickerLabel(layer);
      render();
    }
    if (!fontModal.hidden) renderFontOptions(fontSearch.value);
    closeFontModal();
    notify("fontLoaded", { name: file.name }, "success");
  } catch (error) {
    console.error(error);
    notify("fileError", {}, "error");
  }
}

async function loadSystemFonts() {
  if (!window.queryLocalFonts) {
    notify("systemFontsUnavailable", {}, "error");
    return;
  }

  try {
    const fontData = await window.queryLocalFonts();
    const known = new Set([
      ...BUILTIN_FONTS.map((font) => font.family),
      ...customFonts.map((font) => font.family),
    ]);
    systemFontFamilies = [...new Set(fontData.map((font) => font.family).filter(Boolean))]
      .filter((family) => !known.has(family))
      .sort((first, second) => first.localeCompare(second));
    if (!fontModal.hidden) renderFontOptions(fontSearch.value);
    notify("systemFontsLoaded", { count: systemFontFamilies.length }, "success");
  } catch (error) {
    console.warn("System font access was not granted.", error);
    notify(error.name === "NotAllowedError" ? "systemFontsDenied" : "systemFontsUnavailable", {}, "error");
  }
}

/* ---------- Batch export ---------- */

function getColumnLabel(index) {
  const header = batchHeaders[index] || `${t("content")} ${index + 1}`;
  return `${String.fromCharCode(65 + index)} — ${header}`;
}

function findSuggestedColumn(pattern, fallbackIndex) {
  const index = batchHeaders.findIndex((header) => pattern.test(header));
  return index >= 0 ? index : fallbackIndex;
}

function columnOptions() {
  return batchHeaders.map((header, index) => ({ value: String(index), label: getColumnLabel(index) }));
}

function suggestedBindingColumn(layer) {
  if (layer.role === "name") return String(findSuggestedColumn(/name|姓名|名字/i, 0));
  if (layer.role === "number") return String(findSuggestedColumn(/number|no\.?|编号|号码|序号/i, 1));
  return "";
}

function hasActiveBinding() {
  return [...batchBindingMap.entries()].some(([layerId, column]) =>
    column !== "" && layers.some((layer) => layer.id === layerId && layer.type === "text"));
}

// 每个文字图层一行：选择该图层绑定哪一列表格数据
function renderBatchBindings() {
  const host = document.querySelector("#batchBindings");
  if (!host) return;
  const textLayers = layers.filter((layer) => layer.type === "text");
  host.replaceChildren();
  if (textLayers.length === 0) return;

  textLayers.forEach((layer) => {
    if (!batchBindingMap.has(layer.id)) {
      batchBindingMap.set(layer.id, suggestedBindingColumn(layer));
    }
    const row = document.createElement("div");
    row.className = "batch-binding";

    const name = document.createElement("span");
    name.className = "batch-binding-name";
    name.textContent = getLayerName(layer);
    name.title = getLayerName(layer);

    const choices = [{ value: "", label: t("batchNoColumn") }, ...columnOptions()];
    const dropdown = createDropdown({
      ariaLabel: getLayerName(layer),
      options: choices,
      value: batchBindingMap.get(layer.id) ?? "",
      onChange: (value) => {
        batchBindingMap.set(layer.id, value);
        updateBatchUi();
      },
    });

    row.append(name, dropdown.element);
    host.append(row);
  });
}

function updateBatchUi() {
  const hasData = batchRows.length > 0 && batchHeaders.length > 0;
  batchControls.exportButton.disabled = !hasData || !hasActiveBinding() || !templateReady;
  batchControls.summary.textContent = hasData
    ? t("batchReady").replace("{count}", batchRows.length)
    : t("batchEmpty");
}

function spreadsheetRowsToData(rows) {
  const firstNonEmpty = rows.findIndex((row) => row.some((cell) => String(cell).trim() !== ""));
  if (firstNonEmpty < 0) return { headers: [], data: [] };

  const sourceHeaders = rows[firstNonEmpty];
  const widestRow = Math.max(...rows.slice(firstNonEmpty).map((row) => row.length));
  const headers = Array.from({ length: widestRow }, (_, index) => {
    const value = String(sourceHeaders[index] ?? "").trim();
    return value || `Column ${index + 1}`;
  });
  const data = rows
    .slice(firstNonEmpty + 1)
    .map((row) => headers.map((_, index) => String(row[index] ?? "").trim()))
    .filter((row) => row.some(Boolean));
  return { headers, data };
}

async function parseBatchFile(file) {
  if (!file) return;
  const hideLoader = showLoader(document.querySelector(".collapsible-body"), t("loadingXlsx"));
  try {
    await loadScript("vendor/xlsx.full.min.js");
    if (!window.XLSX) return;
    // 无 BOM 的 UTF-8 CSV（WPS / 程序生成）会被误判为 Latin-1，显式指定 UTF-8
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hasBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
    const workbook = hasBom
      ? XLSX.read(buffer, { type: "array", cellText: true })
      : XLSX.read(bytes, { type: "array", cellText: true, codepage: 65001 });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    const parsed = spreadsheetRowsToData(rows);
    batchHeaders = parsed.headers;
    batchRows = parsed.data;
    layers
      .filter((layer) => layer.type === "text" && !batchBindingMap.get(layer.id))
      .forEach((layer) => batchBindingMap.set(layer.id, suggestedBindingColumn(layer)));
    renderBatchBindings();
    updateBatchUi();
  } catch (error) {
    console.error(error);
    batchHeaders = [];
    batchRows = [];
    updateBatchUi();
    notify("sheetError", {}, "error");
  } finally {
    hideLoader();
  }
}

async function downloadBatchZip() {
  try {
    await loadScript("vendor/jszip.min.js");
  } catch (error) {
    console.error(error);
    notify("fileError", {}, "error");
    return;
  }

  // 绑定到表格列的文字图层，每行数据替换这些图层的文字后各导出一张
  const bindings = layers
    .filter((layer) => layer.type === "text" && batchBindingMap.get(layer.id))
    .map((layer) => ({ layer, column: Number(batchBindingMap.get(layer.id)) }))
    .filter((binding) => Number.isInteger(binding.column) && batchHeaders[binding.column] !== undefined);

  if (bindings.length === 0) {
    notify("batchNoBinding", {}, "error");
    return;
  }

  const records = batchRows.filter((row) => row.some((cell) => String(cell).trim() !== ""));
  if (records.length === 0) {
    notify("sheetError", {}, "error");
    return;
  }

  const originalTexts = bindings.map((binding) => binding.layer.text);
  const zip = new JSZip();
  batchControls.exportButton.disabled = true;
  batchControls.progress.hidden = false;
  batchControls.progress.max = records.length;
  batchControls.progress.value = 0;

  try {
    for (const [index, record] of records.entries()) {
      bindings.forEach((binding) => {
        binding.layer.text = String(record[binding.column] ?? "");
      });
      render();
      const blob = await canvasToBlob(canvas);
      const indexPart = String(index + 1).padStart(3, "0");
      const namePart = bindings
        .map((binding) => safeFilenamePart(binding.layer.text, "text"))
        .join("-");
      zip.file(`${indexPart}-${namePart}.png`, blob);
      batchControls.progress.value = index + 1;
      notify("batchProcessing", { current: index + 1, total: records.length });
      // 让出主线程刷新进度；用 setTimeout 以兼容后台标签页（rAF 会被暂停）
      await new Promise((resolve) => setTimeout(resolve, 16));
    }

    bindings.forEach((binding, i) => {
      binding.layer.text = originalTexts[i];
    });
    render();
    notify("batchZipping");
    const archive = await zip.generateAsync(
      { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
      (metadata) => {
        batchControls.progress.max = 100;
        batchControls.progress.value = metadata.percent;
      },
    );
    downloadBlob(archive, `nameplates-${new Date().toISOString().slice(0, 10)}.zip`);
    notify("batchDone", { count: records.length }, "success");
  } catch (error) {
    console.error(error);
    bindings.forEach((binding, i) => {
      binding.layer.text = originalTexts[i];
    });
    render();
    notify("fileError", {}, "error");
  } finally {
    batchControls.progress.hidden = true;
    updateBatchUi();
  }
}

function spreadsheetRowsToData(rows) {
  const firstNonEmpty = rows.findIndex((row) => row.some((cell) => String(cell).trim() !== ""));
  if (firstNonEmpty < 0) return { headers: [], data: [] };

  const sourceHeaders = rows[firstNonEmpty];
  const widestRow = Math.max(...rows.slice(firstNonEmpty).map((row) => row.length));
  const headers = Array.from({ length: widestRow }, (_, index) => {
    const value = String(sourceHeaders[index] ?? "").trim();
    return value || `Column ${index + 1}`;
  });
  const data = rows
    .slice(firstNonEmpty + 1)
    .map((row) => headers.map((_, index) => String(row[index] ?? "").trim()))
    .filter((row) => row.some(Boolean));
  return { headers, data };
}


/* ---------- Wiring ---------- */

Object.values(controls).forEach((control) => {
  control.addEventListener("input", updateSelectedLayerFromInspector);
  control.addEventListener("change", updateSelectedLayerFromInspector);
});

// Unfold the shadow controls the moment shadow is switched on.
controls.shadowEnabled.addEventListener("change", () => {
  if (controls.shadowEnabled.checked) shadowSection.open = true;
});

controls.outlineEnabled.addEventListener("change", () => {
  if (controls.outlineEnabled.checked) outlineSection.open = true;
});

document.querySelector("#addTextButton").addEventListener("click", addTextLayer);
document.querySelector("#addImageButton").addEventListener("click", () => document.querySelector("#imageUpload").click());
document.querySelector("#imageUpload").addEventListener("change", (event) => {
  addImageLayer(event.target.files?.[0]);
  event.target.value = "";
});
document.querySelector("#uploadFontButton").addEventListener("click", () => document.querySelector("#fontUpload").click());
document.querySelector("#fontUpload").addEventListener("change", (event) => {
  loadCustomFont(event.target.files?.[0]);
  event.target.value = "";
});
document.querySelector("#loadSystemFontsButton").addEventListener("click", loadSystemFonts);

fontPickerButton.addEventListener("click", openFontModal);
fontSearch.addEventListener("input", () => renderFontOptions(fontSearch.value));
fontModalList.addEventListener("click", (event) => {
  const option = event.target.closest(".font-option");
  if (option) applyFontSelection(option.dataset.family);
});
document.querySelector("#fontModalClose").addEventListener("click", closeFontModal);
fontModal.querySelector(".font-modal-backdrop").addEventListener("click", closeFontModal);
fontModal.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFontModal();
    fontPickerButton.focus();
    return;
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const options = [...fontModalList.querySelectorAll(".font-option")];
    if (options.length === 0) return;
    const currentIndex = options.indexOf(document.activeElement);
    const nextIndex = currentIndex < 0
      ? (event.key === "ArrowDown" ? 0 : options.length - 1)
      : Math.min(options.length - 1, Math.max(0, currentIndex + (event.key === "ArrowDown" ? 1 : -1)));
    options[nextIndex].focus();
    event.preventDefault();
  }
});
document.querySelector("#resetButton").addEventListener("click", () => reset());
document.querySelector("#downloadButton").addEventListener("click", downloadPng);

document.querySelector("#layerDuplicate").addEventListener("click", duplicateSelectedLayer);
document.querySelector("#layerDelete").addEventListener("click", deleteSelectedLayer);
document.querySelector("#layerUp").addEventListener("click", () => moveSelectedLayer(1));
document.querySelector("#layerDown").addEventListener("click", () => moveSelectedLayer(-1));

batchControls.file.addEventListener("change", (event) => {
  parseBatchFile(event.target.files?.[0]);
  event.target.value = "";
});
batchControls.exportButton.addEventListener("click", downloadBatchZip);

const fullCardToggle = document.querySelector("#fullCardToggle");
fullCardToggle.addEventListener("click", () => {
  const show = fullCardToggle.getAttribute("aria-checked") !== "true";
  fullCardToggle.setAttribute("aria-checked", String(show));
  document.querySelector("#editorView").classList.toggle("active", !show);
  document.querySelector("#threeDView").classList.toggle("active", show);
  if (show) activate3D(); else deactivate3D();
});

const sizeDropdown = createDropdown({
  options: sizeOptions(),
  value: `${card.width}x${card.height}`,
  ariaLabel: t("sizeLabel"),
  onChange: (value) => {
    if (value === "custom") {
      customWidth.value = card.width;
      customHeight.value = card.height;
      customSizeFields.hidden = false;
      customWidth.focus();
      return;
    }
    customSizeFields.hidden = true;
    const [width, height] = value.split("x").map(Number);
    applyCardSize(width, height);
  },
});
sizePresetHost.append(sizeDropdown.element);


document.querySelector("#applyCustomSize").addEventListener("click", () => {
  applyCardSize(Number(customWidth.value), Number(customHeight.value));
});

[customWidth, customHeight].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      applyCardSize(Number(customWidth.value), Number(customHeight.value));
    }
  });
});

const languageDropdown = createDropdown({
  options: [
    { value: "zh-CN", label: "简体中文", short: "中文" },
    { value: "en", label: "English", short: "EN" },
  ],
  value: currentLocale,
  ariaLabel: t("language"),
  alignRight: true,
  onChange: (value) => setLocale(value),
});
document.querySelector("#languageDropdownHost").append(languageDropdown.element);

function setLocale(next) {
  if (!(next in translations)) return;
  currentLocale = next;
  languageDropdown.setValue(next);
  applyTranslations();
  updateBatchUi();
}

function refreshDropdownLabels() {
  languageDropdown.setAriaLabel(t("language"));
  sizeDropdown.setOptions(sizeOptions());
  sizeDropdown.setAriaLabel(t("sizeLabel"));
}

template.addEventListener("load", () => {
  templateReady = true;
  reset(true);
});

template.addEventListener("error", () => notify("error", {}, "error"));

applyTranslations();
updateBatchUi();
updateSizePresetDisplay();
notify("loading");
// The template ships inline as a data URI (template-data.js) so the canvas
// never becomes tainted: downloads work even when index.html is opened
// directly from disk. The file path is kept as a fallback.
template.src = window.TEMPLATE_DATA_URI || "assets/template-clean.webp";
