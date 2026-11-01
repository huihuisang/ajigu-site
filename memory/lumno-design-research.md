# Lumno 设计与 design token 调研

核查日期：2026-11-02。源码固定到 `485310ba7dd762349273e8cae0c01b1d39473c20`。线上检查覆盖简中、英文，桌面 `1280 × 720` 与手机 `390 × 844`。本记录是设计参考，不替代 ajigu-site 现有规格，也不表示已决定改版。

## 结论

我的设计判断：它把编辑式排版、油画、有序抖色、轻微拟物控件和产品演示结合起来。主要辨识度来自统一的材质与空间关系，不是某个组件库的默认主题。英文强调衬线字与斜体，中文保持系统中文字体；白色背景中用灰色托盘承载白色产品界面，绘画负责提供颜色与情绪。[首页][page]、[共享设计原语][home]

工程 harness 的完整证据见 [lumno-harness-research.md](./lumno-harness-research.md)。公开文件能证明规则、测试和流水线，不能证明作者私人使用了哪种模型、提示词或未公开工具。

## 实际使用的库

| 层次 | 核实结果 |
| --- | --- |
| 页面 | Astro `^7.1.6`，React `^19.0.0`，静态输出；交互区使用 islands |
| 样式 | Tailwind CSS `^4.3.3`，大量 Astro scoped CSS 与普通 CSS |
| 通用 UI | shadcn/ui，配置 `radix-nova`、`neutral`、CSS variables；底层 `radix-ui ^1.6.7` |
| 产品控件 | 自有 `SettingsKit.tsx` / `settings-kit.css`，主 CTA、导航、菜单等不能当作默认 shadcn Button |
| 图标 | 首页产品演示大量用 Remix Icon `4.9.1`，本地字体子集及 inline SVG；Lucide 用于部分通用 UI，如 Dialog 关闭按钮 |
| 动画 | `motion ^12.5.0`，配合 CSS、IntersectionObserver、RAF 与自有弹簧计算 |
| 局部效果 | Magic UI 的 Terminal 真正在开源区域使用；当前 Hero Parallax 和 Dither 借鉴 Aceternity 外观，从零重写 |

版本是 `package.json` 的范围，不是本地安装后测得的版本。库来源依据 [package.json][package]、[components.json][components]、[第三方声明][notices]、[SettingsKit][kit]、[图标实现][icons]。`@magicui` / `@aceternity` registry 的存在本身不等于安装了整个组件库。

## 字体与文字层级

| 使用位置 | 字体与规则 |
| --- | --- |
| 正文、导航、普通卡片 | Open Sans；自托管可变 WOFF2，字重 `300–800`，按 Latin / Cyrillic 等文字系统分包，`font-display: swap` |
| 简体中文 | `PingFang SC → Hiragino Sans GB → Microsoft YaHei`；这是 fallback 顺序，不代表所有平台都渲染成同一种中文字体 |
| 英文 Hero 主句 | EB Garamond；`clamp(44px, 4.4vw, 62px)`，行高 `1.02`，字距 `-0.05em` |
| 英文 Hero 强调句 | Cormorant Garamond Italic 600；字号为主句 `1.2em`，字距 `-0.02em`，暖棕色渐变 |
| 字母语言章节标题 | EB Garamond 600；`clamp(38px, 4.2vw, 56px)`，行高 `1.08`，字距 `-0.05em` |
| 章节标题强调行 | Cormorant Garamond Italic 600；字号 `1.24em` |
| 中文 Hero | 字号 `clamp(36px, 3.6vw, 48px)`，字重 `620`，行高 `1.2`，字距 `-0.045em` |
| 中文章节标题 | 字号 `clamp(32px, 3.6vw, 48px)`，字重 `620`，行高 `1.26`，字距 `-0.01em` |
| 卡片 | 大标题 `20–24px`；普通标题 `20px`；纯文字单元标题 `17px`；正文 `15px / 1.65` |

证据：[Open Sans 声明][site]、[按语言字体栈][locale]、[Hero 排版][hero-type]、[共享标题排版][type]。Settings kit 的基础作用域另有 `Inter, ui-sans-serif, ...` 字体栈，不能因此把全站识别为 Inter；没有在本次检查中证明 Inter 字体文件实际加载。[settings-kit.css][kit]

实测：桌面中文 Hero `46.08px`，英文主句 `56.32px`，英文斜体 `67.584px`；手机中文 Hero `39px`，英文主句 `48.36px`，英文斜体 `58.032px`。这些是对应视口的计算样式，不是新的固定 token。英文衬线字和中文无衬线字共用语义层级，但不共用完全相同的字号、行高和字距。

## Design token 的组织方式

可把源码理解为三层：基础尺度 → 语义关系 → 组件应用。它没有一个统一的 JSON token 源，实际权威分布在多份 CSS。这个分层是对源码的归纳，不是仓库声明的设计系统标准。

| 文件 / namespace | 职责 | 阅读时的注意点 |
| --- | --- | --- |
| `globals.css` | shadcn/Tailwind 桥接；`--color-*`、`--radius-*` 映射到语义变量 | `--primary: #3f624d` 不能当作首页 CTA 的实际颜色 |
| `site.css` | 公共字体、白色页面背景、基础文字和线条 | `--bg: #fff`；body 读 `--text-main`，不是只读 shadcn 的 `--foreground` |
| `home.css` / `--home-*` | 首页列宽、节奏、材质、文字层级、圆角和页面层级 | 首页设计分析应主要看这里及组件覆盖 |
| `locale-fonts.css` | 各语言中文、日文、韩文字体 fallback | 减少错误地区字形和不必要的字体下载 |
| `settings-kit.css` / `--lumno-*` | 产品控件、菜单、tabs、选中/hover/focus、局部明暗主题 | 深色变量属于 kit 的 `[data-theme="dark"]`，不能据此宣称营销首页有完整深色模式 |
| `continuous-corners.css` | 连续圆角曲线及 capsule/circle 例外 | 曲线和半径是两个维度，浏览器不支持时保留普通圆角 |

依据：[globals.css][globals]、[site.css][site]、[home.css][home]、[locale-fonts.css][locale]、[settings-kit.css][kit]、[continuous-corners.css][corners]。

### 空间关系

基础尺度为 `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`。更值得学的是语义命名：`section-space`、`part-space`、`head-gap`、`split-gap`、`grid-gap`、`card-pad`、`art-gap`、`card-inset`，每种关系只负责一种距离。[基础与语义空间][spacing]

| Token / 关系 | 桌面默认 | `≤760px` | `≤620px` |
| --- | --- | --- | --- |
| `--home-section-width` | `1360px` 上限 | 保留上限 | 保留上限 |
| `--home-gutter` | `24px` | `16px` | `16px` |
| `--home-section-space` | `clamp(88px, 10vw, 136px)` | `72px` | `72px` |
| `--home-part-space` | `clamp(112px, 12vw, 168px)` | `88px` | `88px` |
| `--home-head-gap` | `clamp(40px, 5vw, 64px)` | `32px` | `32px` |
| `--home-split-gap` | `clamp(40px, 6vw, 96px)` | 没有全局重设；布局按组件变为单列 | 同左 |
| `--home-grid-gap` | `16px` | `12px` | `12px` |
| `--home-card-pad` | `32px` | `32px` | `24px` |
| `--home-card-inset` | `8px` | `8px` | `6px` |
| `--home-actions-gap` | `28px` | `24px` | `24px` |
| `--home-control-gap` | `12px` | `10px` | `10px` |
| `--home-ui-scale` | `1` | `0.75` | `0.75` |

`--home-column = min(100% - 2 × gutter, 1360px)`。`1280px` 实测列宽为 `1232px`，`390px` 实测为 `358px`。[布局与断点][home]、[实测记录](./lumno-reference/zh-desktop-metrics.json)、[手机记录](./lumno-reference/zh-mobile-metrics.json)

注意：`section-space` 是每个 `.home-section` 的上下 padding；相邻两个此类 section 的内容间距会叠加，不应误读为整个 section-to-section gap。卡片实际 CSS padding 还会扣除 `1px` 边框，并把媒体 inset 与文案 padding 分开；桌面实测 `.bento-cell` 是 `7px 7px 31px`，文案通过嵌套层补到设计距离。[section 应用][home]、[卡片应用][bento]

### 圆角与嵌套

| 用途 | 默认半径 | 小手机半径 |
| --- | --- | --- |
| 大卡片 `xl` | `28px` | `24px` |
| 内嵌面板 `inner` | `xl − inset = 20px` | `24 − 6 = 18px` |
| 小卡片 / FAQ `lg` | `16px` | 同左 |
| 窗口 / 截图 `md` | `12px` | 同左 |
| 图标容器 / 紧凑轨道 `sm` | `10px` | 同左 |
| 键帽 / badge / tooltip `xs` | `6px` | 同左 |
| capsule | `999px` | 同左 |

这是“外形尺寸决定半径，内嵌距离决定内半径”的关系系统。[radius tokens][radius]。控件内部也用公式：tabs 的选中块半径由轨道半径减去边框与 padding 得到，菜单 option 同理，避免套娃圆角彼此不匹配。[Settings kit 派生值][kit]

在浏览器支持时，非胶囊表面应用 `corner-shape: superellipse(1.25)`；胶囊和圆形显式保留 `round`。本次浏览器实测大卡片为 `superellipse(1.25)`，按钮为 `superellipse(1)`。[曲线实现][corners]、[实测](./lumno-reference/zh-desktop-metrics.json)

### 色彩、材质与状态

| 角色 | 关键值 / 组合 |
| --- | --- |
| 页面 | `--bg: #ffffff` |
| 通用主文字 / 次文字 / 弱文字 | `#15171a / #626870 / #89919a` |
| 营销标题 / 柔和标题 | `--home-ink: #2f2a22` / `--home-ink-soft: #5a5247` |
| 纸面托盘 | `--home-paper: #f3f4f6` |
| 边界基础墨色 | `--home-edge: 32, 38, 46`；hairline 取其 `10%` alpha |
| 图片边框 | `inset 0 0 0 1px var(--home-hairline)` |
| 小控件阴影 | `0 1px 2px rgba(edge, 0.05)` |
| 标准卡片阴影 | 近接触、环境、远处抬升三个 shadow，alpha 分别为 `0.04 / 0.04 / 0.14` |
| 灯照托盘 | 顶部白色 radial light + `#f4f5f7 → #eceef1` + hairline；canvas 生成同一光照的 `2px` 抖色颗粒 |
| 主 CTA | `#404859 → #273042`，暗边、顶部内高光、底部内阴影；hover 提亮 |
| 次 CTA | 白底、弱灰边、多个低透明阴影；active 下移 `1px` 并缩至 `0.985` |

颜色和阴影来自 [site.css][site]、[home surface tokens][surface]；材质如何组合见 [.home-lit / .home-media][materials]；按钮来自 [Settings kit][kit]。因此它不是“到处加 box-shadow”：纸卡、媒体和白色控件各有可重复的材质规则。

### 层级、动画与产品尺度

页面层级集中为 `content=2`、`frame=10`、`intro=40`、`nav=50`；组件自行隔离后从局部层级计数。[z-index tokens][radius]

产品演示保留真实 UI 的设计尺寸，再统一 scale：桌面搜索框 `56px`，小屏系数 `0.75` 后为 `42px`；小屏面板设计上限 `440px`。这是演示插画的缩放，不是把整页文字和点击目标一起缩小。[产品比例说明][surface]

滚动入场：卡片 `900ms`，文本 `760ms`；错峰 `90ms`，最多五步；常用曲线 `cubic-bezier(0.22, 1, 0.36, 1)`。大多数时长与曲线仍写在组件 CSS / TS 中，未形成完整 motion token 层。[入场 CSS][motion]、[触发脚本][reveal]

抖色绘画是 Canvas 2D 的 `4 × 4` Bayer 有序抖色、每颜色通道八级量化，并用 `image-rendering: pixelated` 放大；名称虽叫 DitherShader，当前实现不是 WebGL shader。[算法][dither]。截图墙的滚动参数由自有弹簧计算写入 CSS properties，避免 scroll 驱动 React re-render。[截图墙][parallax]

## 值得学习与需要保留判断的部分

1. 优先学习关系：统一列宽、语义间距、共心圆角、重复材质。复制任意一组颜色或字号，无法复现整体秩序。
2. 响应式先覆盖少数上游 token，再由组件消费；同时保留必要的结构断点。不能把它简化为全部乘以一个比例。
3. 文字系统按语种适配。英文负字距与衬线排版不能直接套给中文。
4. 同一页面仍有多套 palette 和 radius 家族，部分按钮颜色、标题规则、时长与断点写死在组件里；这套系统有实践价值，但不是应原样复制的完整规范。
5. 连续圆角使用全局通配和 `!important`；引入其他工程时需评估现有控件、第三方组件和浏览器支持。保留渐进增强思想，不直接照搬选择器。
6. 素材的抖色、模糊入场、长页面和大量自动演示适合其产品叙事；是否适合 ajigu 的多产品目录需要另行判断。本次未改变现有 Gallery White、shadcn 及 mockup 规则。

以上为基于源码和观察的设计判断。当前项目已有设计约束见 [studio-redesign.md](./studio-redesign.md)。后续若借鉴，应先对齐目标，再沿用项目组件，收敛 token，并用真实浏览器检查中英文、移动端和 reduced motion。

## 证据与验证边界

- [Design token 源码清单](./lumno-reference/design-token-inventory.json)：六份 CSS 中的 211 条 custom property 声明，包含重复定义、响应式和主题覆盖；每条保留值、作用域、源码行号，附源文件 SHA-256。它是参考清单，不是可直接导入的主题。
- [中文桌面](./lumno-reference/desktop-hero.jpg)、[英文桌面](./lumno-reference/en-desktop-hero.jpg)、[中文手机](./lumno-reference/zh-mobile-hero.jpg)、[英文手机](./lumno-reference/en-mobile-hero.jpg)、[功能卡片](./lumno-reference/desktop-features.jpg)、[功能列表](./lumno-reference/desktop-utilities.jpg)。截图是对 Lumno 的调研引用，未用作本站产品素材。
- 计算样式：[中文桌面](./lumno-reference/zh-desktop-metrics.json)、[中文手机](./lumno-reference/zh-mobile-metrics.json)、[英文桌面](./lumno-reference/en-desktop-metrics.json)、[英文手机](./lumno-reference/en-mobile-metrics.json)。检查的中英文手机页面未观察到横向页面溢出；这不是所有断点和浏览器的兼容性结论。
- 已读固定提交源码并核对线上关键参数。没有安装依赖、运行对方测试、构建对方工程或验证 Safari / 真机；也没有证明线上全部构建产物与该 SHA 完全一致。计算字体栈不等于逐字确认了实际采用的字体文件。
- 临时源码快照登记在任务 `cd4750689d32430d9af389b25c31a9ea`，位于 `/Users/ajigu/.local/share/task-artifacts/work/cd4750689d32430d9af389b25c31a9ea`。本次未提交或推送，因此保留临时产物；不修改历史构建目录。
- 代码与视觉素材的授权范围不同；具体边界见项目 [THIRD_PARTY_NOTICES.md][notices]。

[package]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/package.json
[components]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/components.json
[page]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/pages/index.astro
[home]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css
[spacing]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L23-L59
[radius]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L68-L100
[surface]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L102-L174
[materials]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L471-L565
[type]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L229-L398
[hero-type]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/pages/index.astro#L726-L865
[globals]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/globals.css
[site]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/site.css#L7-L100
[locale]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/locale-fonts.css
[kit]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/extension-settings/settings-kit.css
[corners]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/public/continuous-corners.css
[bento]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/sections/CommandBarSection.astro#L270-L340
[icons]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/home/HomeCellIcon.astro
[motion]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/styles/home.css#L777-L815
[reveal]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/scripts/home-reveal.ts
[dither]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/lib/ordered-dither.ts
[parallax]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/src/components/ui/hero-parallax.tsx
[notices]: https://github.com/kubai087/lumno-web/blob/485310ba7dd762349273e8cae0c01b1d39473c20/THIRD_PARTY_NOTICES.md
