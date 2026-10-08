# 白色画廊实现与验收

实施：完成。验证：通过。独立源码审核：通过。范围为本地六站营销页；未提交、推送或发布。

本记录给出 000 设计基线、001 补充约束与 002 实施规格的最终状态。视觉基线为用户选择的 `design/concepts/2026-11-01/option-1.png`。

## 实际结果

首页改为最大 1320px、最小轨道 300px、间距 24px 的自动列网格，随可用空间显示 1–4 列。卡片使用官方 Card，展示单张正面 mockup、统一图标及简短产品描述。

六个详情页共享字体、中性色令牌、导航、品牌标题、按钮、功能卡片、FAQ 与页脚。四站原 HTML 正文迁为结构化章节；版本库内可信的正文 HTML 只保留段落、列表、强调和链接，不包含旧交互控件。补充信息按章节折叠，关闭 JavaScript 时正文直接可读。

UI 控件采用官方 shadcn Radix new-york 源码，包括 Button、Card、Accordion、DropdownMenu、NavigationMenu、Input、Field、ToggleGroup、Slider 和 Badge。新依赖 tw-animate-css 的 MIT 文本及上游声明已保留。

产品差异继续保留：Moodsk 六段 onboarding、TypeNote 静音默认的键盘体验、Go Sleep 示例声音时间轴、DailyApod 当前星空和太阳系截图、TUTU 图片对比、Nameplate 姓名预览及原编辑器入口。Moodsk 在源层接入原素材与渲染逻辑，React 管理控件，舞台适配器负责清理 RAF、WAAPI、观察器和 GL；旧 public 文件保持兼容。

微动效采用短时状态反馈。页脚 Sparkles 彩蛋需主动点击，播放后恢复。reduced motion 下关闭 CSS 动画与过渡，并阻止 Moodsk 开始播放；仍可选择章节、光标材质和颜色。没有新增自动发声。

## 验收

| 编号 | 状态 | 证据与边界 |
| --- | --- | --- |
| AC-01 | 通过 | `evidence/design-results.json` 的 11 个宽度含 320、687/688、1011/1012、1335/1336、1920px；轨道自动变化，无横向溢出，上限 1320px。另有三种常规视口全站回归。 |
| AC-02 | 通过 | 六产品共享骨架及专属演示均实测；非 Moodsk 详情主图有加载断言；IAB 图与全站截图见 evidence。 |
| AC-03 | 通过 | 六幕手动选择、暂停、重播、方向键、光标材质/颜色与离屏恢复通过。正常与慢速片段见 `motion-normal-and-slow.webm`。 |
| AC-04 | 通过 | 主动彩蛋恢复、reduced motion、触屏、键盘、离屏暂停通过；页面隐藏采用真实浏览器中的 visibility 事件模拟验证。当前 IAB 宿主切换标签仍报告 visible，未声称观察到真实后台挂起。 |
| AC-05 | 通过 | 47 项单测、228 项页面/视口回归、六站构建契约；语言、原域名/URL、下载与原编辑器 PNG 导出均通过。关闭脚本的 320px 根页面也检查无溢出及备用语言链接。TypeNote 原有 query 本地化仍需要 JavaScript，无脚本只提供英文。 |
| AC-06 | 通过 | 选定图片与真实截图在同一比较输入中对照；字体、布局、颜色、图片、文案五项已复核。详细过程与可接受差异见项目根 `design-qa.md`。 |

## 实际验证命令

通过 task-artifacts 在登记目录内保存日志、截图和视频。命令实际执行成功：

```sh
pnpm format:check
pnpm check
pnpm test
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm build
STUDIO_OUTPUT_DIR="$PWD/dist" node scripts/check-build.mjs
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm test:browser
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm test:design
```

`pnpm check` 六站均为 0 errors、0 warnings、0 hints。单测 47/47；浏览器 228 项页面/视口、React 控件、语言/存储拒绝、无脚本、reduced motion、触屏和原编辑器 2362×2362 PNG 导出通过。主矩阵未发现浏览器错误或第三方字体请求。设计专项另检查 11 个宽度、重复和异常 hash、真实 gallery 锚点、六幕、光标控件、键盘、离屏、visibility 事件模拟及录像。

首次回归发现的旧样式污染、Go Sleep 选项溢出、空章节标题、正文说明遗漏、滑块名称、空插槽隐藏主图、TypeNote 字面 `<br>` 与切换语言后菜单不关闭均已修复，并针对最终实现复验。测试的图片预热滚动改为 instant，避免新页面的平滑滚动使懒加载图片解码等待无期限延长；解码有明确超时。

## 独立审核

两位只读审核者检查共享 UI/主站/TypeNote 与四个产品站。审阅发现的问题已逐项修复并复核；不是用源码推断替代浏览器实测。

- 主站与共享 UI 最终 57 文件集合摘要：`2395694f7cef8c29e207f21f02232949e3b677bddc23b57f59bec38d9d2e5422`。最后补审明确覆盖受控语言菜单、回归断言与新增许可证；共享包类型检查通过。
- 四站补审 27 文件集合摘要：`c6266e96b5ecbe8d620b085e12ffb158557e9aee7860ab3aa426936620421437`。包括两份规格、Moodsk 展示源、三站预览、四站内容、相关共享组件与迁移/设计测试；独立 9/9 契约/素材测试通过。
- 四站 22 个语言页面的实质正文及全部原 href 已与冻结原文比对。移除的是旧伪设备窗饰及装饰性样本数值；补回所有遗漏的隐私、兼容性、语言和 Apple 引文署名。旧拆字错误 `Sound Match es` 修正为 `Sound Matches`。

摘要算法为相对路径到文件 SHA256 的排序紧凑 JSON 对象再取 SHA256。完整当前运行时代码及验证文件基线见 `evidence/source-sha256.json`。文档状态、证据和许可证归档不改变受审 UI 行为；最终校验将绑定这些持久文件。

## 保留产物与未执行事项

本次登记 ID 为 `918e8b72f47c46c2b12924e02b1d895d`，临时输出保留在 `/Users/ajigu/.local/share/task-artifacts/work/918e8b72f47c46c2b12924e02b1d895d/`。必要证据已经复制到本条目的 evidence 目录。构建继续写项目既有 `dist/` 供 8770–8775 本地预览使用；共享缓存仍在项目 node_modules 缓存内，未声称把运行中的预览目录迁入清理范围。

未获得提交、推送或发布指令，因此不创建已发布提交，也不为清理而扩大权限。缺少远端已发布验证提交，按规则保留全部临时产物；历史任务与其他未提交文件没有清理。

录像所需的 Playwright FFmpeg 首次使用 `pnpm exec playwright install ffmpeg` 安装到用户共享缓存。本次未把共享缓存纳入任务清理。
