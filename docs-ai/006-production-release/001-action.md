# 六站发布记录

实施：发布配置已完成，生产发布待执行。验证：本地 50 项单测、六站类型/构建/兼容契约通过；线上与 CI 待执行。独立审核：通过，最终 10 文件摘要为 eaa1ac2a7a89016c8240f29f30c0b39922f1e234820c745125408671b3e230da，记录见 evidence/review.json。

用户于 2026-11-01 授权 push 与上线；方案见 000-plan.md。发布前各站 Pages 配置、原源码分支 SHA 记录在 evidence/previous-pages.json。无关 SEO 报告和 memory/seo.md 的摘要记录在 local-preservation.json，只保留本地，不随本轮上线提交。

发布器已改为自行从指定成功 main CI 下载固定 artifact，校验源 SHA、站点、域名及原 Pages 域名。生产部署 job 显式限制 main；旧产物分支 marker 固定到预审 SHA，fetch 后检查 tip 未改变。本机 jj 0.46 采用 --bookmark 推送，不使用已移除的 --allow-new。三个一次性本地 jj 仓库已真实验证首次推送及后续 tracking/快进；没有用远端试错代替验证。

主站 build 保留远端新增的 BingSiteAuth.xml；产物增加 site-release.json，记录源仓库、提交、站点与域名。主站使用官方 upload-pages-artifact v5.0.0 与 deploy-pages v5.0.1，产品产物发布不覆盖原 main/master、不保存跨仓库凭据、不改 DNS。只读候选工作流仍独立可运行。

临时目录为 /Users/ajigu/.local/share/task-artifacts/work/b48c9deb68cd4d3289e03756ada94759。发布成功前保留全部产物；本地运行中的预览目录不属于本轮清理范围。旧任务的证据摘要若与后续源码不同，仅代表旧版本，不能据此清理。
