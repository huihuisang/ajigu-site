# 六站正式发布结果

实施：完成。验证：通过。独立源码审核：通过。日期：2026-11-01。

正式产物的源提交为 `fe121d25d2392fc3f3e88937cdcbebbf0e67de17`。主站 CI 与 Pages 部署 [41274821205](https://github.com/huihuisang/ajigu-site/actions/runs/41274821205) 成功；五产品均发布同一运行的对应 artifact。六个线上 site-release.json 都匹配该源提交。源码已推送，发布证据随本记录归档；后续文档提交只更新证据，不重新构建网站。

## 实际结果

主仓库 main 沿远端 b170cc94 快进，保留 BingSiteAuth.xml。先提交六站迁移与发布配置，再以独立修复提交修正候选工作流的 runner 上下文。两份无关本地改动 GOOGLE-API-REPORT-ajigu.com.md 与 memory/seo.md 未进入发布提交，内容摘要与发布前一致。

主站使用 GitHub Actions Pages artifact 部署。五个产品保留原有域名，在各自的 ajigu-site-production 分支承载静态产物，原 main/master 分支 SHA 与发布前一致；没有修改 DNS 或保存跨仓库令牌。

| 产品 | 发布仓库 | 产物提交 |
| --- | --- | --- |
| TypeNote | huihuisang/typenote-landing | a90ee1ca46ae1649d44cb9102e83bd085131b21c |
| Moodsk | Ajigu-Studio/moodsk-website | 4f997f8d9b6245f43aa8389904018c9d0766cfa1 |
| Go Sleep | huihuisang/snorz-site | 93002bf698105a37d818cc585b0097de15f8e9da |
| DailyApod | huihuisang/dailyapod-site | be7da81dd430dec6371b0bb6acfb31bf1cbe8ffd |
| TUTU | huihuisang/tutu-site | b8420994f4aee6c6612d1fd5bec1f2d3bc73c84b |

首次通过 API 切换产品 Pages source 后，没有自动产生新构建；因此逐站显式 POST pages/builds。随后五站 latest build 都为 built，commit 精确匹配上表。记录见 evidence/build-requests.json、production-builds.json 与 publication-results.json。后续仍需核对实际构建 SHA，不能仅用 Published 日志判定上线。

## 验收

| 编号 | 状态 | 证据 |
| --- | --- | --- |
| AC-P1 | 通过 | 初始十文件及两文件 CI 修正均独立复审通过；review.json / review-final.json 保留摘要。8 项独立单测/语法检查与 5 项增量工作区测试通过。发布器直接下载指定成功 main CI 的固定 artifact，校验 revision/CNAME/目标，固定旧 marker SHA 并检查 fetch tip。 |
| AC-P2 | 通过 | 本地格式、50 单测、六站类型/构建/兼容契约通过；actionlint v1.7.12 检查通过。真实 CI 又执行同一验证与 228 项页面/视口、174 组布局、144 次展开、14 组无脚本检查。Bing 文件已在构建及线上保留。 |
| AC-P3 | 通过 | main 快进推送成功，源码提交 fe121d25；CI-run.json 记录 verify/deploy 两 job 成功；主站实际域名显示新版六产品画廊。 |
| AC-P4 | 通过 | 五份产物由发布器直接从同一成功 CI 下载，专用分支推送成功；各站构建 SHA 与产物提交一致，原源码分支未变。 |
| AC-P5 | 通过 | 六个 HTTPS 域名 marker 匹配源提交；91 个 sitemap 页面 URL、canonical/H1、六份样式表及 Bing 文件检查通过。真实浏览器检查主站、桌牌详情与 Moodsk 桌面/手机；390px 无溢出，FAQ/正文左边界均为 20px，六章控件仍在。 |

线上检查由 evidence/probe-live.py 实际执行，输出见 live-results.json。线上截图为 live-home.jpg、live-nameplate.jpg、live-moodsk.jpg、live-moodsk-mobile.jpg。不将本次 HTTP 验证等同于生产用户全环境测试；交互、声音选择、存储失败、原编辑器导出与动效边界由同一源提交的 CI 回归覆盖。

## 发布中修正

初次源提交 8fc3ade4 的 workflow 校验失败，尚未进入部署 job。GitHub annotation 明确指出 job.env 不能引用 runner.temp。修正为前置 shell step 写 GITHUB_ENV，保留上传步骤中合法的 runner.temp；增量单测、actionlint 与重跑的完整 CI 均通过。没有绕过验证发布失败候选。

拆分未提交改动时，旧忽略规则曾将本地缓存纳入临时快照。已从精确快照恢复依赖、类型缓存与原预览目录，再恢复为 ignored；源码与两份 SEO 改动摘要一致，格式/单测/契约重新验证。发布提交没有 node_modules 或 dist 路径，缓存快照未推送。

本地未发布试验构建曾用父提交 SHA 测试 marker 格式；这份试验目录没有用于生产。实际生产只使用 CI 对 fe121d25 生成的六份产物。

## 回滚与后续发布

首发前的六站 Pages source、域名和原分支 SHA 保存在 previous-pages.json。产品回滚可将 Pages source 恢复到记录的原分支，再请求 build；旧 main/master 保持原样。主站旧源提交和发布历史仍在，回滚应选择已知构建或审核过的回退提交，不强推历史、不改 DNS。

主站后续 main 代码推送自动验证并部署；纯文档路径更新不重建。五产品后续从成功 main CI 运行使用受保护发布器更新，发布后检查 Pages build commit 和线上 marker。首次 source 切换需要显式 build 请求的观察应保留在操作流程中。

## 产物与清理

本轮任务 ID 为 b48c9deb68cd4d3289e03756ada94759。必要线上结果、审核、构建记录和截图已经归档到本目录 evidence。最终文档提交后，重新执行真实格式/单测/源码摘要检查，确认远端 main 包含已验证提交，再按 task-artifacts 的检查结果清理本轮可再生产物。原预览 dist、共享缓存及旧任务目录不在本轮清理范围。旧任务因源码版本变化或保留录像索引继续保留，不以本次授权批量清理历史目录。
