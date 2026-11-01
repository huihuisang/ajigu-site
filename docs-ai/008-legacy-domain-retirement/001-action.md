# 旧域名迁移与仓库退役结果

实施状态：已完成。五个旧域名由 Cloudflare 独立提供跳转，五个旧仓库已删除，仅保留 ajigu-site 承载网站源码。
验证状态：通过。迁移、备份恢复、浏览器、单测、删除预检、完整 CI 与主站部署通过；删除后 184 项现场检查和五个浏览器检查通过，临时凭据已撤销，CLI 原有权限已恢复。
审核状态：规则、备份、删除 guard 与 CI 清理的最终源码独立审核通过；完整范围和摘要见 evidence/review.json。

## 结果与验收

| 编号 | 状态 | 证据 |
| --- | --- | --- |
| AC-R1 | 通过：五个旧域名由 Cloudflare 返回真实 301，路径和查询参数正确 | evidence/edge-before-deletion.json，共 184 项 HTTP/HTTPS 检查 |
| AC-R2 | 通过：82 个旧 sitemap 页面、代表资源、共享图标与五个真实浏览器的参数/锚点/中文正常；仅修改五条 DNS | browser-before-deletion.json、dns-cutover.json、cloudflare-rules.jpg |
| AC-R3 | 通过：五个持久 Git bundle 在独立目录恢复，fsck、全部源 refs 与 PR commits 校验通过；无 LFS、子模块、发布附件、Wiki 或 Discussions 内容 | backup-restoration.json、backup-manifest.json |
| AC-R4 | 通过：跨仓库 publisher 与五份 CI 产物上传已退役；五个固定 ID 仓库删除后均返回 404，ajigu-site ID 保持不变 | retirement-result.json、retirement-result.log |
| AC-R5 | 通过：删除后全部 184 项 HTTP/HTTPS 检查及五个浏览器的路径、参数、锚点与中文检查正常；临时删除权限收回 | retirement-result.json 的 edgeAfter、browser-after-deletion.json、scope-restored.json、CI 与独立审核 |

## Cloudflare 配置

六条增量 Single Redirects 与原有 www 规则合计使用免费额度 7/10。共享 /studio、/licenses 路径规则先于五条产品主机规则。目标固定为 https://ajigu.com，状态 301，preserve_query_string=true。五条旧域名 CNAME 的目标改为 ajigu.com 并开启代理，不再以旧仓库的 GitHub Pages 主机作为原点。其他 18 条 DNS 完整记录保持一致。

完整的两份 23 行 DNS 快照保存在持久备份目录，公开证据仅记录五条产品域名与原始快照摘要，避免发布其他服务的源站配置。审核曾发现按主机名去重会漏掉同名的 TXT/MX 等记录，现已改为完整行多重集合比较，复核 23 条总记录与 18 条非目标记录。首次过渡期部分本机请求命中旧路由；传播后全部 184 项检查通过，并等待初始 300 秒缓冲后才允许删除预检。

## 备份与恢复边界

持久目录：/Volumes/Samsung SSD 990 PRO 2T/SSD/Documents/Repository Backups/ajigu-site/2026-11-01-legacy-domains。该目录不属于 task-artifacts 清理范围。内含每仓库的 Git bundle、源 refs、仓库/Pages/标签/里程碑/issue/PR 元数据及逐文件摘要。实际有 5 个已合并 PR，已导出会话、评审、文件和 commit 数据。未发现需要另行导出的 LFS、子模块、发布附件或 Wiki。

GitHub 原始身份、URL、星标和 issue 编号不能精确重建；Actions 日志/缓存、凭据和账户级 Projects 不在备份范围。恢复时在新目录使用 jj git clone 对应 bundle，按 refs.txt 恢复所有分支与标签；JSON 元数据供人工恢复参考。备份是源码及指定元数据的恢复副本，不宣称能完整恢复 GitHub 平台状态。

## 删除保护与权限

默认 dry-run。固定核对五个名称与数字 ID，拒绝 ajigu-site 或额外目标。删除前校验持久备份摘要、恢复证书、源 refs、issue/评论/PR/release 等元数据是否变化、五个浏览器验收、精确 DNS 范围及现场 184 项边缘跳转。每次删除前再次核对身份、refs 与元数据。输出必须是任务临时目录内的新文件，禁止覆盖备份或输入证据。删除后逐仓库确认 404，并再次执行全部边缘检查。

用户授权使用 1Password CLI 登录并临时增加 delete_repo。1Password 桌面解锁后，TTY 下的 op signin 和一次性验证码读取成功；现有 CLI 获得所需权限，组织角色实际核对为 admin，随后执行已审核的删除 guard。密码、一次性验证码与 token 未写入项目证据。

2026-11-01 已核对：[GitHub 删除仓库接口](https://docs.github.com/en/rest/repos/repos#delete-a-repository)要求管理员权限；经典 OAuth/PAT 需要 delete_repo，细粒度 PAT 需要 Administration(write)。本次将使用通过实际权限检查的凭据，不以账号角色代替 token 权限判断。

旧 HTML 兼容输出继续作为离线回归测试夹具，不再上传或发布到旧仓库。生产跳转唯一来源为 Cloudflare 的已审核规则。

## 发布与最终结果

实现提交 f15e3aed7decca0f1b9a1cb938d339ec467ec523 已推送主分支，[CI 41318404261](https://github.com/huihuisang/ajigu-site/actions/runs/41318404261) 全部检查及主站 Pages 部署成功。发布后再次执行的 184 项边缘检查见 edge-after-publication.json；主站版本标记应对应该实现提交。文档同步提交包含实现提交，无需重复部署相同运行时代码。

2026-11-01 执行删除 guard 的 --apply 模式，全部五个目标的备份、身份、refs、元数据及现场跳转重新验证后才开始删除。retirement-result.json 记录五个数字 ID、逐仓库的 404 证明和保留仓库 ID 1339651478。删除后全量 184 项检查再次通过；五个真实浏览器也重新验证了完整查询参数、锚点与中文页面。历史阻塞检查点 deletion-pending.json 保留供追溯，不代表最终状态。

权限收尾先执行 gh auth refresh --remove-scopes delete_repo，换发凭据恢复原有 gist、read:org、repo、workflow，但实测旧临时凭据仍有删除权限。随后通过 [GitHub 凭据撤销接口](https://docs.github.com/en/rest/credentials/revoke) 只提交该临时 token，响应 202；临时凭据与刚换发的凭据均实测返回 401。最后重新完成仅含原有四项权限的 CLI 登录，/user 返回 200、身份 huihuisang 且无 delete_repo。该撤销操作使同一授权下的换发凭据也失效，已恢复本机 CLI；未验证其他设备上同一 OAuth 授权的会话。完整无密钥证明见 scope-restored.json。

独立审核覆盖最终运行时代码，基线摘要为 12c616f66d210cd86c37727135c283b4e6cae48b80a8840c9bfbded1129c6c5f；后续仅追加实际删除与权限收尾证据，没有改动审核基线内的代码。最终本地复核会同时核对源码摘要、审核基线、CI 版本、删除后现场证据、备份与权限状态。

持久备份始终保留。任务临时目录 d7e105b95e4c456aaf7bb4e9ea4c6264 仅在最终验证、文档提交和远端同步确认后，按 task-artifacts 的发布及占用检查清理；清理收据位于该工具的全局状态目录。其他页面任务的未提交源码和截图没有纳入本次提交，也没有还原或清理。
