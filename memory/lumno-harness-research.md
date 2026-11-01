# Lumno 工程 harness 调研

核查日期：2026-11-02。源码基准：`kubai087/lumno-web` 的 `main`，提交 `485310ba7dd762349273e8cae0c01b1d39473c20`。本笔记只记录公开工程约束；没有克隆、安装、构建或执行对方脚本。

## 结论

它的 harness 主要由仓库规则、局部组件契约、源码回归测试和 CI 组成，没有证据表明公开仓库内存在专用 agent runner。公开根目录有 `AGENTS.md`，但未见 `.cursor/`、`.claude/`、`.agents/`、独立 harness 配置或设计 lint 配置；这是对该提交公开文件树的观察，不能据此推断作者私人工作环境。[公开文件树](https://github.com/kubai087/lumno-web/tree/485310ba7dd762349273e8cae0c01b1d39473c20)

## 约束与架构

| 项目 | 核实结果与证据 |
| --- | --- |
| 架构 | Astro + React，静态产物部署 GitHub Pages；生产不运行 Node server。[AGENTS.md L5–22](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/AGENTS.md#L5-L22)、[astro.config.mjs L10–12](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/astro.config.mjs#L10-L12) |
| 模块边界 | 路由、布局、首页 demos、共享 site shell、UI primitives、内容、lib、轻量客户端脚本和构建 integrations 分层；README 是架构入口。[README.md L89–108](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/README.md#L89-L108) |
| 设计复用 | 次级页面共享首页 header、footer 及 `home.css`、`site.css`；settings kit 只负责表现和局部交互，不依赖 browser API 或持久化。[AGENTS.md L77–90](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/AGENTS.md#L77-L90)、[settings README L1–22](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/extension-settings/README.md#L1-L22) |
| 多语言 | 十种语言静态生成；简中是文案基准，繁中需自然表达，英文需产品化表达；首屏及辅助文本应在静态 HTML 中正确本地化；UI 文案和 SEO 元数据分开。[AGENTS.md L32–59](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/AGENTS.md#L32-L59)、[README.md L37](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/README.md#L37) |
| 动画与性能 | server HTML 必须是完整可读帧；脚本增强运动，支持 reduced motion；非首屏不要用 `client:load`；header 菜单静态渲染并由轻量脚本驱动，社区 dialog 首次 hover/focus/press 才加载；release/privacy 不带 React。[README.md L39–63](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/README.md#L39-L63)、[AGENTS.md L82–89](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/AGENTS.md#L82-L89) |
| Safari 经验 | 关键 SVG 内联，避免同容器叠加 scale、filter 和 subpixel transform；关注整数几何及 `shape-rendering`；对新 SVG 策略有协作约束。这些是该仓库规则，不是当前项目必须继承的规则。[AGENTS.md L92–105](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/AGENTS.md#L92-L105) |

## 自动化门禁

1. `npm run check` 执行 `astro check`；`npm run build` 依次执行 `npm run test`、`astro build`、帮助搜索评估；测试运行器为 `node --test`。[package.json L19–25](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/package.json#L19-L25)
2. PR CI 使用 Node 24，执行 `npm ci`、`npm run check`、`npm run build`。完整 git history 用于 sitemap 的真实修改日期。[ci.yml L14–39](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/.github/workflows/ci.yml#L14-L39)
3. 帮助搜索针对简中、繁中、日文、英文运行查询集合，使用实际构建的索引与运行时算法；top-1 下限 85%，top-3 下限 95%，低于门槛以非零状态退出。[help-search-eval.mjs L1–18](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/scripts/help-search-eval.mjs#L1-L18)、[L28–64](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/scripts/help-search-eval.mjs#L28-L64)
4. 图标子集测试扫描 `src` 的 `ri-*` 使用，保证本地 Remix Icon 子集覆盖新图标；字体测试保证 Open Sans 按文字系统提供 WOFF2 子集且不加载完整 TTF。[font-assets.test.mjs L20–41](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/tests/font-assets.test.mjs#L20-L41)
5. 局部设计规则被写成源码契约：导航/内容统一 `1360px` 最大宽度，desktop gutter `24px`、phone `16px`，禁止另起宽度 token；导航文字 `14px`；内外层圆角派生且 capsule 保留 round。[mobile-header-cta.test.mjs L104–174](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/tests/mobile-header-cta.test.mjs#L104-L174)、[continuous-corners.test.mjs L11–50](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/tests/continuous-corners.test.mjs#L11-L50)
6. Settings kit 测试固定导出接口、语义状态、样式 namespace，并禁止扩展运行时和 storage 依赖。[extension-settings-kit.test.mjs L9–72](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/tests/extension-settings-kit.test.mjs#L9-L72)

这些属于局部设计回归契约，不能称为全站 token lint。所读视觉测试大量使用 `assert.match`/`doesNotMatch` 检查源码字符串，能发现规则被改掉，却不能证明最终布局、可点击性、浏览器兼容或无障碍实际正确；CI 公开步骤没有浏览器 E2E/截图比较门禁。[hero-title.test.mjs L13–76](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/tests/homepage-hero-title.test.mjs#L13-L76)、[ci.yml L14–39](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/.github/workflows/ci.yml#L14-L39)

## 素材与发布流水线

- `scripts/guide-screenshots/capture.mjs` 用 Playwright Chromium 加载真实扩展，通过 locale 场景数据注入 tabs/bookmarks/history，并测量边界后裁切截图；依赖另一个 `lumno-extension` checkout。这是素材生产工具，不是站点 E2E gate。[capture.mjs L1–41](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/scripts/guide-screenshots/capture.mjs#L1-L41)、[L88–95](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/scripts/guide-screenshots/capture.mjs#L88-L95)、[L157–173](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/scripts/guide-screenshots/capture.mjs#L157-L173)
- PR 要求 desktop/phone 前后截图；触及 SVG/filter/transform 时检查 Safari。[CONTRIBUTING.md L24–43](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/CONTRIBUTING.md#L24-L43)
- 发布 workflow 在 main push、手动和计划任务触发；查询商店版本，再检查 OAuth reCAPTCHA 配置，构建和上传 `dist` 到 Pages；IndexNow 失败不影响部署。[deploy-pages.yml L3–17](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/.github/workflows/deploy-pages.yml#L3-L17)、[L59–131](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/.github/workflows/deploy-pages.yml#L59-L131)
- 查询时该 SHA 的最近一次公开 Deploy GitHub Pages run 已完成且成功，创建于 2026-11-02 09:56:58（Asia/Shanghai）。这是远端记录，不是本地重跑结果。[运行记录](https://github.com/kubai087/lumno-web/actions/runs/41375097086)

## 对 ajigu-site 的可迁移判断

值得复用的是“明确首帧约束 → 共用视觉原语 → 针对真实问题建立可执行契约 → 视觉人工验收”的闭环，而不是增加更多 agent 提示词。若后续借鉴，可沿用现有组件和浏览器测试：把共享列宽、gutter、圆角等关键 token 写成布局断言；把动画稳定帧和 reduced-motion 变体纳入真实浏览器验证。此段是调研推论，未授权或实施任何改版。

代码是 MIT，但品牌、截图、壁纸、插画、文章和 QR code 不在 MIT 范围；学习技术不等于可复制视觉素材。[README.md L130–142](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/README.md#L130-L142)

## 视觉基础设施补充

- 连续圆角直接通过 CSS 实现：`@property --lumno-corner-shape` 设置 `inherits: false`、默认 `superellipse(1.25)`；在 `@supports` 内对元素和伪元素应用 `corner-shape`，保留现有 `border-radius` 作为回退，capsule 和 circle 单独保留 `round`。`!important` 用于防止组件的 `all: unset` 重置曲线。这是渐进增强，无 JS 圆角模拟。[continuous-corners.css L1–54](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/public/continuous-corners.css#L1-L54)
- 该样式由公共 `SeoHead.astro` 和 `AuthLayout.astro` 的 stylesheet link 加载。[SeoHead.astro L85–87](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/SeoHead.astro#L85-L87)、[AuthLayout.astro L55–58](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/layouts/AuthLayout.astro#L55-L58)
- shadcn 配置为 `radix-nova`，`iconLibrary` 是 `lucide`，注册了 `@magicui` 和 `@aceternity`。这不代表首页主视觉是默认 shadcn theme。[components.json L1–27](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/components.json#L1-L27)
- shadcn primitives 确实在使用：账号页使用 Alert/Avatar/Badge/Button/Card/Field/Input/Spinner；首页安装按钮组合自有 `SettingsButton` 与 Radix Tooltip；社区面板使用 Dialog。首页主按钮和导航仍主要沿用自有 SettingsKit。[AccountPortal.tsx L20–37](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/account/AccountPortal.tsx#L20-L37)、[HeroInstallTooltip.tsx L1–9](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/HeroInstallTooltip.tsx#L1-L9)、[L122–153](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/HeroInstallTooltip.tsx#L122-L153)、[CommunityPanel.tsx L1–4](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/CommunityPanel.tsx#L1-L4)
- Magic UI Terminal 确实用于首页开源卡片，包含逐字打印、hover replay 和 reduced-motion 静态替代；不是未用 scaffold。[OpenSourceArt.tsx L161–205](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/OpenSourceArt.tsx#L161-L205)、[OpenSourceSection.astro L76–85](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/sections/OpenSourceSection.astro#L76-L85)
- 当前提交的 Hero Parallax 与 Dither Shader 模仿 Aceternity 效果，但第三方声明明确写为从零重写、不含原代码、以 MIT 发布；历史版本的适配代码许可不同。[THIRD_PARTY_NOTICES.md L26–47](https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/THIRD_PARTY_NOTICES.md#L26-L47)
