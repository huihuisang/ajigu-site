# 六站正式发布

状态：用户已明确授权 push 并上线；实施中。

## 决策与范围

主仓库为 huihuisang/ajigu-site，原远端 main 最新为 b170cc94，新增 BingSiteAuth.xml；本地改动基于其父提交。保留该验证文件并纳入构建，不覆盖远端历史。

主站切换 GitHub Pages workflow 模式，从 main 的 CI 构建产物发布。保留只读候选工作流，增加可复用入口和生产发布工作流；生产主站仅使用通过类型、单测、构建、浏览器和布局检查的 ajigu-com 产物。Pages/OIDC 写权限限于部署 job，不新增跨仓库令牌或长期凭据。

五个产品保持现有 Pages 仓库及域名，在专用 ajigu-site-production 分支存放从同一成功 CI 下载的静态产物，由发布器按固定 artifact 名直接从成功 CI 下载；原 main/master 源码不覆盖。首次切换 Pages source 到该产物分支，后续使用快进发布。发布器固定仓库/域名映射，校验产物 revision/CNAME/既有 Pages 域名，默认只检查，只有 --apply 才写入。全部本地版本操作使用 jj；不使用额外 worktree、不强推、不改 DNS。

- TypeNote：huihuisang/typenote-landing
- Moodsk：Ajigu-Studio/moodsk-website
- Go Sleep：huihuisang/snorz-site
- DailyApod：huihuisang/dailyapod-site
- TUTU：huihuisang/tutu-site

本次提交包含此前授权的迁移、白色画廊及精修。独立的 GOOGLE-API-REPORT-ajigu.com.md 和 memory/seo.md 保持本地原样，不随上线提交发布。历史验收录像需要随其证据归档，使用单次 jj 快照大小选项，不改变仓库全局限制。

## 验收

- AC-P1：发布配置及目标校验经独立源码审核；错误域名、revision、未知站点和只读 CI 边界有测试。
- AC-P2：最终源码通过格式、类型、单测、六站构建、原有兼容契约，原验证文件与内容保留。
- AC-P3：主仓库 main 快进推送，远端包含已验证提交，CI 与主站部署成功。
- AC-P4：五产品产物均来自同一成功 CI；发布分支推送及各站部署成功，原源码分支不改变。
- AC-P5：六个现有域名、代表性语言/详情/指南/编辑器 URL 线上可访问，release marker 对应本次源提交，实际浏览器验证部署页面。

上线结果与回滚边界拟记录在 001-action.md。检查前保存 Pages 设置与旧分支 SHA。若失败，保留现有产物与诊断，不以代码已推送冒充上线成功。新发布器和权限边界需要独立复审。

## 官方依据

2026-11-01 核对 GitHub 官方 Pages publishing-source/custom-workflow 文档，以及 actions/upload-pages-artifact v5.0.0、actions/deploy-pages v5.0.1 的 action.yml。主站按官方 artifact + Pages/OIDC 模式，产品使用现有 Pages branch 模式。此前文档中的“未授权发布”是历史边界，本轮已由用户明确授权。
