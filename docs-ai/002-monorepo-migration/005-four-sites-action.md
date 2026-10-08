# 结果：四个产品站迁入共享工作区

日期：2026-10-31。规格：[004-four-sites-plan.md](004-four-sites-plan.md)。

- 实施状态：已完成；四站加入现有工作区，六站可以独立构建和联合预览。
- 验证状态：通过；必要验收项均有实际执行证据。
- 审核状态：通过；最终 41 个关键文件的独立审核见 [006-four-sites-review.md](006-four-sites-review.md)。

## 实际改动

新增 `apps/moodsk`、`apps/gosleep`、`apps/dailyapod` 与 `apps/tutu`，复用已有 Astro、React、TypeScript、Tailwind CSS 与 shadcn/ui 依赖版本，没有新增运行时库。四站通过 `packages/site-kit/src/layouts/ProductLanding.astro` 共用导航、首屏、媒体、按钮、内容插槽和页脚。产品正文保留为仓库内可信编辑片段，不接收用户或运行时远程 HTML。

Go Sleep 示例事件、DailyApod 截图和 TUTU 对比滑块由各自 React 岛组件管理。Moodsk 继续使用已有六幕展示引擎及本地素材，保留静态回退。共享增强脚本不修改 React 岛节点。Nameplate 与 TypeNote 的原有实现未重写，本轮完成回归验证。

四站原有隐私、支持、教程、指南及资源在各应用 `public/` 中交付。`compatibility.json` 记录原域名、语言、行动链接和资源摘要。旧 `studio` 样式及模块 URL 从一份冻结参考源码生成；旧产品媒体地址通过共享媒体清单保留。新营销页不加载旧语言或展示增强脚本，Moodsk 专属引擎除外。

## 验收结果

| 编号 | 结果 | 实际证据 |
| --- | --- | --- |
| AC-08 | 通过 | 六站类型检查与生产构建通过；干净源码快照未提供原产品仓库或旧根目录营销 HTML，使用冻结锁文件离线安装，复用 374 个缓存包、无下载，六站构建与契约全部通过。 |
| AC-09 | 通过 | 22 个新增语言主页保留原路由、域名、元数据与下载目标。207 个迁入公共文件中 204 个字节一致，三个 Go Sleep 指南仅修正元数据、正文一致。旧模块与媒体地址也已验收。 |
| AC-10 | 通过 | 新增 22 个主页在 1440/768/390px 验证；四站演示、键盘、语言切换、无脚本、减少动态效果及截图对照通过。 |
| AC-11 | 通过 | 45 个测试、228 个浏览器页面与视口组合通过，覆盖主站、TypeNote、原编辑器及四站兼容页。跨站点击往返与实际 PNG 导出通过。 |
| AC-12 | 通过 | 四个原仓库与本轮初始摘要一致。工作流仅手动触发、只读权限，上传六份独立产物；没有推送、远端工作流执行、发布或 DNS 修改。 |
| AC-13 | 通过 | 独立审查源码、内容、URL、产物与交互样本；两项迁移发现及 favicon 补充审核均通过。最终通过真实 `task-artifacts verify` 绑定源码、配置、测试及持久证据，收据保存在工具状态目录。 |

对应证据均位于 `evidence-four-sites/`：`browser-results.json`、`clean-build.json` 与日志、`dev-smoke.json`、`preservation.json`、`final-review.json`、`browser-audit.json`、截图和摘要清单。最终源码由 `source-sha256.json` 标识；六站交付由 `build-sha256.json` 标识，`delivery-match.json` 核对与浏览器已测产物字节一致，`version.json` 绑定规格、审核与持久证据。

## 实际验证

环境：macOS、Node 26.13、pnpm 11.25.0、本机 Chrome 和 Playwright。浏览器插件因缺少 `browser-service.mjs` 无法初始化，沿用第一阶段的隔离 Chrome 流程，不读取用户浏览器配置。

- `pnpm verify`：六站 Astro 检查、共享包类型检查、45 项测试、六站生产构建与构建契约通过；Astro 无错误、警告或提示。
- `pnpm format:check` 与 `pnpm peers check`：通过。
- `pnpm test:browser`：228 组通过，其中营销主页及语言查询组合 102 组、四站辅助页 116 组、编辑器 4 组、TypeNote 指南 6 组。没有控制台或页面错误，没有第三方字体请求。PNG 导出为 2362 × 2362。
- 干净安装构建：冻结锁文件、离线缓存、六站类型检查、六站构建和产物契约通过，原四个仓库不参与构建。
- 开发模式：四站主页、中文、默认图标和存在的辅助目录入口共 15 组均返回 200；测试服务器已停止。
- 独立审核实际范围和未重复项见审核记录，未以独立抽样代替完整浏览器验收。

## 产物与本地预览

| 应用 | 域名 | 本地中文预览 | sitemap 页面 / 兼容文件 |
| --- | --- | --- | --- |
| 主站 | ajigu.com | http://127.0.0.1:8770/zh-hans/ | 9 / 81 |
| Moodsk | moodsk.ajigu.com | http://127.0.0.1:8771/zh-hans/ | 16 / 136 |
| TUTU | tutu.ajigu.com | http://127.0.0.1:8772/zh-hans/ | 5 / 30 |
| Go Sleep | gosleep.ajigu.com | http://127.0.0.1:8773/zh-hans/ | 27 / 52 |
| DailyApod | dailyapod.ajigu.com | http://127.0.0.1:8774/zh-hans/ | 30 / 61 |
| TypeNote | typenote.ajigu.com | http://127.0.0.1:8775/?lang=zh | 4 / 41 |

每站最终交付位于仓库 `dist/<site>`，包含正确 CNAME、`.nojekyll`、静态资源及许可证。联合预览只在点击时映射正式域名，生产元数据保留正式地址。`pnpm dev <site>` 选择开发站点，`pnpm preview` 启动六站。现有发布设置未改；新增工作流只上传候选产物，不能视为已验证线上发布。

## 修正与计划差异

- Go Sleep 指南的错误 canonical 与 JSON-LD 在完整契约检查中暴露，只修复迁入文件；正文与原仓库未改。
- 独立审核发现 DailyApod 旧第二张截图未列入新输出，已补齐并增加回归检查。
- 旧辅助页会默认请求不存在的 favicon，已从产品原图生成标准 16/32/48px ICO，补充正确 MIME 并完成独立复核，完整浏览器重跑通过。
- 四站使用共享导航，不再保留 Moodsk 导航中重复的下载按钮；首屏下载目标保留。统一页脚补齐可在手机上点击的主站入口。其他轻微视觉差异见审核记录。

## 适用性与未验证边界

字体项已验证：系统字体，无第三方字体请求。没有新增注册、会话重放、营销邮件、购买或用户上传流程，其他五项不适用于本次改动。没有借迁移改写健康或法律内容。

Safari、物理移动设备、远端 Linux CI 与线上部署未验证。法律页和指南保留静态兼容实现，不声称全部改写为 React。尚未提交、推送或上线，原产品仓库保留。本轮与审核任务均未推送，不满足清理条件；登记目录、原始截图、导出 PNG、隔离快照和日志保留，共享缓存及运行中的 `dist` 预览也保留。
