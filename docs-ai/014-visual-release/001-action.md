# 网站更新上线结果

实施：已完成。验证：本地检查、远端 CI、Pages 部署与线上验收通过。审核：最终发布源码独立复核通过。

生产构建提交为 `7857e5f15be305696eb1444c48657a5388c0c006`。[CI 与部署运行](https://github.com/huihuisang/ajigu-site/actions/runs/41397513359)全部成功，线上 `site-release.json` 与此提交一致。沿用既有 main 快进与 Pages 工作流，没有修改 DNS、旧仓库、上架地区或价格配置。

本次发布包含当前预览中的视觉常量、本地字体、官方吉祥物、真实产品素材、透明卡片图片、大图标与信息层级、稳定导航、自动语言匹配，以及 Go Sleep/TUTU 的全部正式版下载入口。独立复核补齐 TypeNote 的兼容边界：共享语言不被支持时继续检查旧的手动偏好，并新增对应浏览器回归。CI 一并归档导航、语言、下载的专项证据。

本地依赖、格式、类型、77 项单测、35 页构建、构建契约与 28 组语言场景通过。远端再次通过完整检查，包含 248 组浏览器、布局与展开及无脚本检查、40 组视觉、78 组导航、28 组语言、39 组下载和 171 组旧域名跳转。详情见 [evidence/ci-result.json](evidence/ci-result.json) 与 [evidence/ci-summary.log](evidence/ci-summary.log)。

线上 HTTP 验收通过 96 个规范页面及 canonical、9 份吉祥物和卡片资源摘要、8 份样式与 13 个正式版下载页面。实际浏览器确认根地址自动进入简体中文、七张作品卡片、64px 图标、透明预览容器、900px 导航，以及两款产品的三处正式下载入口；TUTU 没有旧测试版文案。浏览器首次产品页连接出现本地 SSL 协议错误，新标签页复验两款产品均成功。见 [evidence/live-results.json](evidence/live-results.json)、[evidence/live-browser.json](evidence/live-browser.json) 和 `live-*.jpg`。

`GOOGLE-API-REPORT-ajigu.com.md` 与 `memory/seo.md` 保持原始摘要，未纳入提交。发布结果以文档提交补充，不改变运行时代码或再次触发部署。发布前的版本标记保留于 `previous-live.json`，此前生产构建为 `0beb4a7f9d277d059a3be0f1613a05964c0c2609`；需要回退时使用已验证版本的新部署，不重写远端历史。

Apple 大陆区下载可用性仍沿用第 013 项已披露的限制。本任务没有购买、安装或变更 App Store 状态。当前本地预览仍使用上一内容任务的构建，其关联产物继续保留；本轮发布的可再生产物仅在结果归档、最终验证及远端提交匹配后清理。
