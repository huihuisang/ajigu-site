# 单站合并与旧域名跳转

状态：用户已确认统一到 ajigu.com，旧域名保留跳转；实施已授权，并沿用本会话的上线授权。

## 架构与范围

只保留 apps/ajigu 一个 Astro 应用和一次网站构建。五个产品的组件、内容与专属演示迁入 src/products，静态资源归入 public/<product>，共享 UI/site-kit 不变。旧产品的独立应用配置与构建入口退役，保留历史记录和共享缓存，不删除原 GitHub 仓库或源码分支。

五个规范路径为 /typenote/、/moodsk/、/gosleep/、/dailyapod/、/tutu/；原语言与深层路径附加在产品前缀下。TypeNote 继续 query 语言，桌牌 /nameplate/ 与 /nameplate/about/ 保持。首页、语言、支持/教程/隐私、canonical、hreflang、JSON-LD 与内部资源引用均映射到主域名。站点地图合为一份。

旧五域名继续使用现有 Pages 仓库，但只提供兼容跳转入口，不再渲染产品应用或独立构建 Astro。生成逐页即时 meta refresh、canonical 与 location.replace；脚本保留 query/hash，禁脚本提供可读链接和即时跳转。当前 Pages 没有服务器 301 配置，此方案不宣称 HTTP 301。保留已发布的旧二进制/公共资源 URL，避免原生应用或嵌入图片失效；未知旧页面跳到对应新路径并接受主站正常 404。

先发布主站并验证新路径，再发布旧站跳转产物，最后逐站确认实际行为。不改 DNS，不保存跨仓库 token。产品原仓库的 main/master 保留历史内容，专用产物分支快进更新。

## 取舍

采用单应用路由和产品模块，不采用六次 Astro 构建后拼接输出。生成阶段用 HTML parser 重写旧静态页 URL，CSS/JS 只处理已知 URL 字面量；保留冻结内容合同用于区分资源移动与正文变更。统一 URL 映射函数同时用于结构化内容、静态文档和旧域名跳转，避免三套规则漂移。

## 验收

- AC-S1：一次 Astro 构建产出一个 ajigu 网站；五旧应用不再是 workspace 项目，只有主站部署。
- AC-S2：所有 91 个原 sitemap 页面在新规范位置可访问；首页/语言/教程/隐私/支持/桌牌/TypeNote query 与关键资源正常，无双重前缀、资源冲突或内部旧域名依赖。
- AC-S3：页面 canonical/hreflang/JSON-LD/站点地图统一主域名，保留合法外部 App Store/下载链接和正文内容。
- AC-S4：旧域名已知页面跳转到准确的新路径，正常脚本保留 query/hash，禁脚本仍能抵达可读内容；旧公共资产继续可访问。明确 HTML 跳转的 HTTP 200 边界，不虚称 301。
- AC-S5：六产品专属演示、语言/存储边界、FAQ/布局、键盘/触屏、无脚本、reduced motion 与原编辑器导出均回归通过。
- AC-S6：格式/类型/单测/构建/URL 合同、独立源码复审、CI 及实际线上新路径/旧域名跳转全部通过，必要证据归档后才报告完成。

独立审核覆盖 URL/兼容边界、单站路由/组件与发布脚本。移除旧应用时只迁移本任务相关源码与配置，不清理旧依赖缓存或历史产物。保护 GOOGLE-API-REPORT-ajigu.com.md 和 memory/seo.md 的未提交改动。

## 官方依据与限制

2026-11-01 已核对 GitHub Pages custom-domain 文档（一个 CNAME 只能一个域名），以及 Google redirects 文档（即时 meta refresh 可表达永久迁移信号；服务器跳转优先）。本次在现有 GitHub Pages 上实现兼容入口，不新增 CDN/付费服务，不承诺排名变化。参考：

- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages
- https://developers.google.com/search/docs/crawling-indexing/301-redirects

结果拟记录在 001-action.md 与 evidence。任务临时目录已登记为 e821c78994044cd398d3184a6b2a2675，运行中的旧预览与共享缓存不在清理范围。
