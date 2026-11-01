# 旧域名迁移与仓库退役结果

实施状态：Cloudflare 迁移已完成；五个旧仓库尚未删除，等待最终删除凭据权限。
验证状态：迁移、备份恢复、浏览器、单测、删除 dry-run、完整 CI 与主站部署通过；删除后验收尚未执行。
审核状态：规则、备份、删除 guard 与 CI 清理的最终源码独立审核通过；完整范围和摘要见 evidence/review.json。

## 结果与验收

| 编号 | 状态 | 证据 |
| --- | --- | --- |
| AC-R1 | 通过：五个旧域名由 Cloudflare 返回真实 301，路径和查询参数正确 | evidence/edge-before-deletion.json，共 184 项 HTTP/HTTPS 检查 |
| AC-R2 | 通过：82 个旧 sitemap 页面、代表资源、共享图标与五个真实浏览器的参数/锚点/中文正常；仅修改五条 DNS | browser-before-deletion.json、dns-cutover.json、cloudflare-rules.jpg |
| AC-R3 | 通过：五个持久 Git bundle 在独立目录恢复，fsck、全部源 refs 与 PR commits 校验通过；无 LFS、子模块、发布附件、Wiki 或 Discussions 内容 | backup-restoration.json、backup-manifest.json |
| AC-R4 | 部分通过：跨仓库 publisher 与五份 CI 产物上传已退役，旧仓库仍存在，删除及删除后网络检查尚未执行 | 本次脚本/配置改动，retirement-dry-run.json |
| AC-R5 | 本地与现场迁移通过；删除后的必要验收未执行 | final-unit.log、final-retirement-optimized.log、独立审核与后续 CI/发布记录 |

## Cloudflare 配置

六条增量 Single Redirects 与原有 www 规则合计使用免费额度 7/10。共享 /studio、/licenses 路径规则先于五条产品主机规则。目标固定为 https://ajigu.com，状态 301，preserve_query_string=true。五条旧域名 CNAME 的目标改为 ajigu.com 并开启代理，不再以旧仓库的 GitHub Pages 主机作为原点。其他 18 条 DNS 完整记录保持一致。

完整的两份 23 行 DNS 快照保存在持久备份目录，公开证据仅记录五条产品域名与原始快照摘要，避免发布其他服务的源站配置。审核曾发现按主机名去重会漏掉同名的 TXT/MX 等记录，现已改为完整行多重集合比较，复核 23 条总记录与 18 条非目标记录。首次过渡期部分本机请求命中旧路由；传播后全部 184 项检查通过，并等待初始 300 秒缓冲后才允许删除预检。

## 备份与恢复边界

持久目录：/Volumes/Samsung SSD 990 PRO 2T/SSD/Documents/Repository Backups/ajigu-site/2026-11-01-legacy-domains。该目录不属于 task-artifacts 清理范围。内含每仓库的 Git bundle、源 refs、仓库/Pages/标签/里程碑/issue/PR 元数据及逐文件摘要。实际有 5 个已合并 PR，已导出会话、评审、文件和 commit 数据。未发现需要另行导出的 LFS、子模块、发布附件或 Wiki。

GitHub 原始身份、URL、星标和 issue 编号不能精确重建；Actions 日志/缓存、凭据和账户级 Projects 不在备份范围。恢复时在新目录使用 jj git clone 对应 bundle，按 refs.txt 恢复所有分支与标签；JSON 元数据供人工恢复参考。备份是源码及指定元数据的恢复副本，不宣称能完整恢复 GitHub 平台状态。

## 删除保护与权限

默认 dry-run。固定核对五个名称与数字 ID，拒绝 ajigu-site 或额外目标。删除前校验持久备份摘要、恢复证书、源 refs、issue/评论/PR/release 等元数据是否变化、五个浏览器验收、精确 DNS 范围及现场 184 项边缘跳转。每次删除前再次核对身份、refs 与元数据。输出必须是任务临时目录内的新文件，禁止覆盖备份或输入证据。删除后逐仓库确认 404，并再次执行全部边缘检查。

现有 gh CLI OAuth 授权没有 delete_repo。1Password 中另有可用的细粒度 GitHub 凭据，但访问组织旧仓库返回 403，不能作为本次五仓库统一删除凭据。不会在凭据不完整时先删部分仓库，也不会写入或公开密码、token。删除需要先补齐现有 CLI 的授权。

2026-11-01 已核对：[GitHub 删除仓库接口](https://docs.github.com/en/rest/repos/repos#delete-a-repository)要求管理员权限；经典 OAuth/PAT 需要 delete_repo，细粒度 PAT 需要 Administration(write)。本次将使用通过实际权限检查的凭据，不以账号角色代替 token 权限判断。

旧 HTML 兼容输出继续作为离线回归测试夹具，不再上传或发布到旧仓库。生产跳转唯一来源为 Cloudflare 的已审核规则。

## 发布与当前阻塞

实现提交 f15e3aed7decca0f1b9a1cb938d339ec467ec523 已推送主分支，[CI 41318404261](https://github.com/huihuisang/ajigu-site/actions/runs/41318404261) 全部检查及主站 Pages 部署成功。发布后再次执行的 184 项边缘检查见 edge-after-publication.json；主站版本标记应对应该实现提交。文档同步提交包含实现提交，无需重复部署相同运行时代码。

在明确请求临时增加 CLI 权限后，尚未收到用户确认。待授权的设备流程已停止，没有授予新权限；现有 CLI scope 与五个仍存在的仓库身份见 deletion-pending.json。当前没有删除仓库。迁移已经独立于旧仓库运行，确认权限后只需重新核验备份/源数据、取得临时授权、执行已审查的删除 guard、检查删除后跳转，再移除临时 delete_repo 权限。

本任务临时目录 d7e105b95e4c456aaf7bb4e9ea4c6264 保留，原因是删除及删除后验收尚未完成。持久仓库备份不在临时目录内，始终保留。其他页面任务的未提交源码和截图没有纳入本次提交，也没有还原或清理。
