# 旧域名边缘跳转与旧仓库退役

状态：用户明确授权迁移跳转服务，验证正常后删除五个旧仓库，仅保留 ajigu-site。服务选择在此范围内委托执行，无需重复确认迁移或删除意图。

## 目标与边界

ajigu.com 的权威 DNS 已在 Cloudflare，优先使用该平台的边缘 301 规则，替代五个 GitHub Pages HTML 跳转入口。保留路径、查询参数及浏览器片段；公共 /studio/ 与 /licenses/ 资源映射到主站同一路径，产品资源映射到对应产品前缀。主域名与其他子域名不受影响，不新增付费服务或变更无关 DNS。

先读取实际 Cloudflare 区域、代理状态与现有规则，保存配置快照并避免覆盖已有规则。无有效账户访问时停止线上变更和仓库删除，准备配置、测试与备份，明确列出所需登录条件。现有跳转继续工作。

仅删除 packages/site-kit/config/publication.json 中已核实的五个旧仓库：huihuisang/typenote-landing、Ajigu-Studio/moodsk-website、huihuisang/snorz-site、huihuisang/dailyapod-site、huihuisang/tutu-site。先备份所有可获取的源码引用、仓库元数据与已发布附件，并记录恢复范围与限制。不删除其他仓库或本地原始项目，不清理其他任务改动。

## 实施顺序

1. 核实账户、区域、域名和仓库权限；保存当前设置与持久备份。
2. 在 ajigu-site 保存规则生成器及校验脚本；新增规则通过独立审核后发布。
3. 为五个子域名启用边缘跳转，核对 HTTPS 证书和 HTTP 状态，验证正常后移除对 GitHub Pages 原点的依赖。
4. 逐一删除白名单中的五个旧仓库；删除后再次验证全部跳转和主站。
5. 退役旧的跨仓库发布流程；记录结果和项目记忆，提交本任务改动并推送。

## 验收

- AC-R1：五个旧域名的 HTTP/HTTPS 请求由独立服务返回 301，目的主机固定为 ajigu.com，路径和重复/空值/编码参数正确；未知路径不造成开放跳转。
- AC-R2：82 个旧 sitemap URL、代表性旧资源、共享资源和实际浏览器片段/中文语言行为正常；主站原规范页面与其他 DNS 记录不变。
- AC-R3：删除前完成持久备份及引用/摘要验证，明确备份所涵盖和无法恢复的平台数据；删除对象严格匹配五个仓库及记录的身份 ID。
- AC-R4：删除后 GitHub API 确认五个仓库不存在，旧域名仍正常，ajigu-site 存在且保留所有现有产品；旧发布脚本和 CI 不再依赖被删除仓库。
- AC-R5：单测、迁移前后实际网络检查、独立边界审核通过，结果及未验证事项如实保存。尚未满足前置条件时禁止删除仓库。

## 官方依据

2026-11-01 核对：Cloudflare Single Redirects 支持动态路径及保留查询字符串，并要求域名代理。实际启用规则、套餐额度、账户权限和证书状态以当前账户为准，不以公开文档代替线上验证。

- https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/
- https://developers.cloudflare.com/rules/url-forwarding/

结果拟记录在 001-action.md 与 evidence。任务登记目录 d7e105b95e4c456aaf7bb4e9ea4c6264 只用于可再生产物，持久仓库备份放在清理范围外。
