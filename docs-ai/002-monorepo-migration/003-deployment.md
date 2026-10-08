# 发布准备与边界

状态：仅完成本地配置；未发布。

主站和 TypeNote 仍分别使用 ajigu.com 与 typenote.ajigu.com，GitHub Pages 的当前设置均为 legacy、main 根目录。本轮没有推送、修改 Pages 设置或 DNS。对当前 main 的后续推送仍可能触发旧分支发布；手动工作流不能取消这一行为。

新工作流 `.github/workflows/build-websites.yml` 仅可手动触发，使用 contents: read，执行安装、类型检查、测试及构建，上传两份独立候选产物和浏览器证据。没有部署任务、Pages 写权限、目标仓库令牌或跨仓库推送。

## 后续正式发布方式

主站切换到 GitHub Actions 发布模式后，可从通过验收的主站产物建立 Pages 发布任务。该设置变更与生产部署需要单独执行。本轮未调用 configure-pages 或设置 API。

TypeNote 原仓库继续作为静态发布目标时，需要具备该目标仓库写权限的专用 GitHub App 或细粒度令牌。主仓库默认 GITHUB_TOKEN 不应被假定具有跨仓库权限。实际发布器应固定校验目标 `huihuisang/typenote-landing`、对应 CNAME 与产物根目录；缺少权限时直接停止，不能退回主站。其源码维护已迁到本仓库。

也可在未来将两份静态产物接入支持单仓库多个项目的托管平台，保持现有域名和 URL。这不影响本轮组件迁移。

## 本地产物

`pnpm build` 按站点生成两份候选产物，各自包含 CNAME、完整 HTML、静态资源、许可证和 .nojekyll。输出根目录优先级为 `STUDIO_OUTPUT_DIR`、`TASK_ARTIFACT_DIR/dist`、仓库根目录 `dist`。在选定根目录下分别生成 `ajigu` 与 `typenote`；已有未登记目录不会被自动接管或清空。

本轮交付及运行中的本地预览使用仓库根目录 `dist/ajigu` 与 `dist/typenote`，位于任务临时目录之外。测试快照、原始截图和导出样本在已登记的任务目录中保留。没有推送，因此不满足临时产物清理条件。

Astro 7 在不同磁盘之间移动预渲染资源时使用 rename，会发生 EXDEV。实际编译中间目录因此放在项目共用的 `node_modules/.cache/studio-build/<site>`，最终产物再复制到选定输出根目录。Astro 类型及增量缓存也按项目复用；没有声称编译器的每个中间文件都位于登记目录。

## 后续发布授权

2026-11-01 用户明确要求 push 并上线。本文件保留迁移阶段的历史边界；本次正式发布方案与目标见 [006-production-release](../006-production-release/000-plan.md)。
