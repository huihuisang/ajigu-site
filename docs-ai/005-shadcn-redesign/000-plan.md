# 白色画廊：首页与详情页统一使用 shadcn

状态：用户已选择第 1 组白色画廊，实施与验收完成。实际结果见 [003-action.md](003-action.md)。

## 设计基线

用户否定旧首页与详情页的粗糙表现，明确要求简约、优雅，并将 UI 控件替换为官方 shadcn 组件。设计探索生成三组首页与 Moodsk 详情页配对效果图，随后用户明确选择实际显示的第 1 组。

唯一视觉基线为 `design/concepts/2026-11-01/option-1.png`。实际显示顺序、原始图片及完整提示词见 `design/concepts/2026-11-01/manifest.json`，不以生成提交顺序推断选择。

效果图中的 TypeNote 笔记工具描述及 macOS 兼容性参数不作为产品事实。最终文案使用原产品内容；实际展示使用已核实的原生图标、截图和有授权的正面设备 mockup。

## 已确认约束与实施

- [001-layout-motion.md](001-layout-motion.md)：最大宽度与自动列数、产品专属展示、微动效和彩蛋，以及 AC-01–05。
- [002-implementation.md](002-implementation.md)：既有 Astro 多站点仓库、官方 shadcn Radix neutral、结构化正文、Moodsk 展示生命周期，以及 AC-06 的视觉验收。
- [003-action.md](003-action.md)：实际实施、验证证据、审核基线、偏差与限制。001、002 中的阶段状态保留为制定方案时的记录，最终状态以 003 为准。

域名、URL、语言入口、下载目标、原 Nameplate 编辑器及冻结公共资源继续保留。本次仅更新本地预览，没有提交、推送或发布。
