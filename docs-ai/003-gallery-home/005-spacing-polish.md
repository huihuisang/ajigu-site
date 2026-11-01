# 卡片间距与按上线日期排序

日期：2026-11-02。实施完成，验证见下方，自检通过，未独立审核。本记录更新此前卡片固定行高和默认排列的决定。

## 用户要求与实现

用户指出图标、名称、描述之间的留白失衡，要求使用设计 skill 优化；随后要求按上线日期排序，最新在前。

采用 `design-taste-frontend` 的单组件分支，沿用现有三列图库、字体、产品素材和链接。以信息亲疏关系安排间距：图标及右侧平台、收费组成一组；名称紧随其后；描述紧接名称；上线日期位于底部。

删除固定 72px 摘要区和预留两行的标题区。外层图库、链接、卡片和文字区共享四条 CSS subgrid 行轨道，按同行实际最长内容对齐；描述轨道填充空余空间。共享 CardHeader 的 inline-size containment 会阻断其行 subgrid，因此仅在图库文字区关闭。名称间距为 12px，描述间距为 6px；卡片静态阴影使用共享组件的 `shadow-none`，移除悬停阴影，原应用图标规格继续沿用。

| 项目 | 调整前 | 调整后 |
| --- | --- | --- |
| 摘要到名称，1440px 简体中文 | 40px | 12px |
| 名称到描述，1440px 简体中文 | 27.5px | 6px |
| 行高策略 | 每卡固定摘要和双行标题占位 | 同行按实际内容共享行高 |
| 排列依据 | 内容文件的既有顺序 | 首次上线日期降序 |

五语言首页在渲染时使用 `toSorted`，按现有事实资料中的 ISO 日期降序排列。同日保持源顺序，缺失日期放最后；Nameplate 的推测日期继续保留近似标记。内容源数组和其他产品模块继续各自维护。

当前顺序：LogLift、Go Sleep、TUTU、Moodsk、Nameplate Studio、TypeNote、DailyApod。

## 验证与证据

- 内置浏览器检查五语言及 320/360/390/640/687/688/768/1011/1012/1200/1440/1920px，共 60 组。核对三列上限、同行对齐、摘要和描述间距、文字越界、图标右侧元数据，以及最终产品顺序。证据：`evidence-spacing/layout.json`。
- 原始间距测量：`evidence-spacing/before-metrics.json`。最终截图：`after-desktop.jpg`、`after-tablet.jpg`、`after-mobile.jpg`、`after-card.jpg`。
- skill 的静态检查器检查本轮卡片 CSS 和组件，无发现。自动视觉检查器在 1440/768/390px 运行调整前和最终排序版，报告与截图在 `evidence-spacing/taste-before`、`taste-final`。已逐图复核桌面、平板和手机结果。
- 单组件范围保留四项既有全页设计约束，显式传给检查器：`outlined-box` 对应用户要求保留的产品卡片；`focal-point` 对应既有简短首页标题；`still-page` 对应静态作品图库；`body-size` 对应既有移动端介绍字号。最终检查器在这些明确范围约束下为 0 FAIL，不代表整站符合 skill 的全部默认风格。
- 保留的 WARN：页脚细线、正文灰色、无视频、小号辅助信息，以及检查器对中文标题的启发式判断。它们属于既有页面或次要信息层级；本次卡片间距和排序修正不扩大为整站改版。
- 排序前的间距版完整浏览器回归通过 248 组页面与视口检查，以及交互、语言、编辑器导出和静态契约，记录为 `browser-before-sort.json`。该记录不宣称覆盖后加入的排序；最终排序由 60 组直接浏览器检查核对。
- 最终执行 `pnpm verify`：类型检查、67 项单元测试、构建和产物检查通过。浏览器回归源码增加实际排列检查，并按同行比较自然行高，同时约束摘要、描述间距，避免重新引入大块空位。

## 视觉复核

以下评分仅评价卡片组件，保留原图库方向；没有抽取新整页方向，没有新增图片或示例数据，既有每张卡片的真实产品链接继续作为操作入口。

```text
ROUND 1
Seen in one second: Icons, names and descriptions float in separate vertical bands.
Idea (one sentence): Each real app preview has a compact product label beside it.
Live thing: Each card opens the real product page.
Layout words by section: card=split preview and product label.
Scores: design 5.0 · usability 7.0 · creativity 6.0 · content 8.0 → overall 6.1
Caps applied: Component review only; no whole-page score.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. The summary and name are 40px apart in the supplied card crop. Use a 12px group gap.
2. The single-line title reserves a second line in the desktop screenshot. Size shared rows from real content.
3. A 316px card stretches short copy in every viewport. Remove the fixed height and keep one flexible description row.

ROUND 2
Seen in one second: The app icon, name and description read as one product label.
Idea (one sentence): Each real app preview has a compact product label beside it.
Live thing: Each card opens the real product page.
Layout words by section: card=split preview and compact product label.
Scores: design 7.5 · usability 8.0 · creativity 6.5 · content 8.0 → overall 7.5
Caps applied: Component review only; the user retains the gallery and native app icons.
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. No remaining card-spacing defect is visible in the desktop, tablet or phone screenshots.
2. Small platform and release labels remain secondary by design; a full typography audit is outside this change.
3. The original page composition remains unchanged; this is a component refinement.
```

未提交、推送或部署。登记任务 `a3f8ec273f8c4093a2854ef0211b8c36` 保留全部可再生产物，因没有已发布提交而不执行清理。
