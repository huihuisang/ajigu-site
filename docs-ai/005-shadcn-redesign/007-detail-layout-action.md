# 详情页统一布局实施与验收

实施：完成。验证：通过。独立源码审核：通过。范围为六产品、29 个语言版本的营销详情；未提交、推送或发布。

依据 [006-detail-layout-plan.md](006-detail-layout-plan.md)，页面使用同一 .detail-flow 管理模块排列，取消演示区、正文和折叠区的分散外边距。桌面模块间距 64px，640px 及以下 48px；模块直接内容间距 24px。1040px 内容宽度、桌面 32px/手机 20px 最小侧边距由共享令牌管理，FAQ、功能区、演示、补充章节、下载与页脚内容均按同一基线排列。

TypeNote 简谱与下载的旧多层包装已收敛，保留原 guide/download 锚点、文案与操作。DailyApod 的 gallery 包装接入同一内容 flow。模板图片使用完整列宽和自动高度。保留居中首屏、原生图片、导航的 1320px 容器、官方 shadcn 控件内边距与各演示内部构图；正文段落维持原有 12px 节奏，不将所有文字强行设为 24px。

## 验收

| 编号 | 状态 | 证据 |
| --- | --- | --- |
| AC-L1 | 通过 | layout-results.json 记录 29×6＝174 组实际布局，覆盖 320/390/640/768/1024/1440px；模块与标题左右边界、页脚内容及溢出均检查。六个产品的真实桌面截图已逐页查看，另查看 TypeNote 手机长页。 |
| AC-L2 | 通过 | 自动测量相邻模块实际 64/48px 距离，以及标题/直接内容的 24px 间距，不仅检查 CSS 声明。IAB 1211px 下六站内容左边界均为 85.5px，TypeNote 390px 下为 20px。 |
| AC-L3 | 通过 | 144 次本地化章节展开均验证内文没有重复收窄，展开后重新检查外部节奏；FAQ 键盘折叠/展开与 14 组无脚本布局通过。无脚本覆盖地区英语及全部六产品。 |
| AC-L4 | 通过 | 47 项单测、六站类型检查/构建、228 项页面/视口与完整交互、六站兼容契约通过。动效专项另通过 11 宽度、重复/异常 hash、六场景、方向键、离屏、减少动态效果与无脚本检查。 |

新增 `pnpm test:layout`，读取实际 DOM 几何尺寸，已接入仓库内 release-candidate CI 配置并随检查上传布局结果；没有运行远端 workflow。README 记录本地入口。

## 实际检查与修正

新增布局测试先在旧实现按 `showcase gap: 56 versus 64` 失败，证据见 layout-red.log。第一轮测量直接读取了 display:contents 的 Astro 岛空盒子，已改为读取其真实渲染子元素，不放宽间距标准。

独立复审发现 Moodsk 使用 main-content 而非 main，以及无脚本筛选遗漏地区英语；前者也在实际回归中复现。现统一使用 .detail-flow class，保留既有 main id，测试按 main 语义查询；地区英语按语言前缀覆盖。修复后全部检查通过。

独立审核针对最终 9 文件集合摘要 `d67b49a00493a12443679e0a018c7a13de73ef9c3133e46b5d6943d08be62f49` 通过，另独立执行 18 项语言/兼容测试及脚本语法检查。逐文件摘要与审核边界见 evidence-detail-layout/review.json。后续仅修改 README、结果记录、QA、记忆与归档证据；未变更受审运行时代码。

## 验证命令与边界

以下命令已实际运行成功，日志与结果保存在 evidence-detail-layout：

```sh
pnpm check
pnpm test
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm build
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm test:layout
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm test:browser
STUDIO_OUTPUT_DIR="$PWD/dist" pnpm test:design
```

六站类型检查为 0 errors/warnings/hints。浏览器主矩阵没有页面错误和第三方字体请求。收尾通过 task-artifacts verify 执行格式、单测、构建契约和最终源码摘要核对，并绑定本轮源码、配置、文档及持久证据。

页面隐藏暂停仍使用 visibility 事件模拟；没有把它称为真实后台挂起验证。TypeNote 无脚本仍为原有英文回退。动效录像保留在登记目录，持久索引见 recording-index.json；设计结果里的录像名相对于原始 design 目录。

本轮任务 b53221b700e343008a10c56fde3e07db 的临时目录为 `/Users/ajigu/.local/share/task-artifacts/work/b53221b700e343008a10c56fde3e07db`。本地预览继续使用项目既有 dist；共享缓存不迁移。缺少远端已发布验证提交，按规则保留全部产物，不清理历史任务或其他未提交工作。此前各轮 source-sha256.json 继续标识历史版本，当前版本见本轮 evidence-detail-layout/source-sha256.json。
