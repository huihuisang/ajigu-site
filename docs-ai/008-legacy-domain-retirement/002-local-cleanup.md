# 五个本地旧网站目录清理

实施状态：已完成。用户于 2026-11-01 明确授权，在确认迁移完整并保留备份后清理五个旧网站的本地目录。本条扩展 000-plan.md 的边界，仅针对下列本地工作副本，不改动原有远端退役结果。

## 范围与方案

- TypeNote：GitHub/App/MusicKeyBoard/typenote-landing。
- Moodsk：GitHub/网站/moodsk-website。
- Go Sleep：GitHub/网站/SnorzSite。
- DailyApod：GitHub/网站/dailyapod-site。
- TUTU：GitHub/网站/tutu-site。

所有路径均位于 /Volumes/Samsung SSD 990 PRO 2T/SSD/Documents。TypeNote 的上层 MusicKeyBoard 应用项目不在清理范围，已确认旧网站路径由父仓库忽略且没有被跟踪。ajigu-site 和同级其他目录保持原样。

五个工作副本均有本地重构改动，原远端 Git bundle 不能代表完整本地状态。先清点普通文件、模式、链接及忽略内容，补存完整本地归档（含 .git、.jj、未提交、未跟踪及忽略文件），再在任务目录独立恢复并逐项核对文件摘要、模式和 Git 对象。备份保存到原持久目录的 local-checkouts 子目录，不放入临时清理范围，不上传私有备份内容。

比对现行产品 compatibility.json、实际静态资源、教程、支持/隐私页面、营销内容及专属交互。旧实现、生成脚本、历史文档/截图和缓存可以仅存档，必须明确区分，不能宣称其全部进入新站。发现业务内容缺口时先补迁移或停止相关目录的删除。删除前重新确认路径身份、文件摘要和进程占用；只处理固定五个绝对路径。

## 验收

- AC-L1：五个目录的来源、状态、文件清单与迁移差异已核实；业务内容无未解释缺口。
- AC-L2：五份完整本地备份已独立恢复，文件/模式/链接逐项一致，Git 对象检查通过；原持久备份未改变。
- AC-L3：独立审核迁移覆盖与删除边界后，五个原目录均不存在，ajigu-site、父应用与同级其他项目保持原样。
- AC-L4：实际迁移回归测试、备份/清理结果校验通过；记录提交并推送后才清理本任务可再生产物。

结果与证据记录于本条后续章节及 evidence-local-cleanup/。本次临时任务 ID：0777ce502cd247028e256d69196db814。

## 调查与备份结果

业务内容独立核对通过：233 个兼容目标摘要一致；本地可对应其中 232 个，另一个是主仓库新增的 TypeNote favicon。133 个非历史文档素材在主仓库有相同字节。Moodsk 六篇教程源片段、DailyApod 五种语言的 20 篇指南及 TypeNote 全部 339 个翻译叶节点均有对应内容；四产品 22 个语言首页的 786 条正文和 123 条首页文案也已迁入。六篇 TypeNote / Go Sleep 指南仅头部修复不同，正文摘要一致。旧展示实现、生成器、文档、截图和缓存仅完整存档，不宣称都进入现行运行时代码。细项见 evidence-local-cleanup/migration-review.json。

原远端备份之外，新增 local-checkouts 五份 tar.gz，包含 2,878 个文件、84,705,645 字节的本地内容。每份已独立解压，逐项核对文件字节、大小、模式及扩展属性，并通过 Git fsck、全部 refs 和工作区状态比对。macOS 会重新分配 com.apple.provenance 和 com.apple.quarantine，恢复比较明确排除这两项系统属性；其他属性一致。归档使用 BSD tar 的 ACL/xattr 选项，不声称这两项系统属性恢复后位级一致。完整私有清单和恢复说明保存在持久备份 local-checkouts/manifest.json 与 README.md，公开摘要见 evidence-local-cleanup/local-backups.json。原有 94 份备份文件的摘要未改变。

初次恢复校验发现 umask 会限制恢复权限，现已使用 tar -p 恢复原模式；macOS 系统属性重建的差异另行记录。最终恢复检查通过后才允许进入删除审核。没有在恢复失败时删除源目录。

删除 dry-run 已通过：固定五路径、归档摘要、根目录设备/inode、全部源内容、迁移审核摘要和无打开文件均已检查。正式执行还须核对独立审核绑定的脚本与备份摘要。

## 实际结果

实施、验证和独立审核均通过。实际删除结果见 evidence-local-cleanup/cleanup-result.json；五个原路径及其临时 staging 路径均不存在。目录身份在删除前逐一重检，先原子重命名，再复核并使用防符号链接攻击的目录删除实现。

首次 staging 被安全检查阻止：macOS 在同卷重命名时改写了 TypeNote 根目录的 com.apple.provenance。未删除文件，已恢复原路径。复审后的 guard 只对根目录该单项属性作比较豁免；文件内容、文件模式、子级属性以及根目录其他属性仍严格匹配。六项负向边界测试通过，最终 guard 摘要 4038b66774687c0064155fe68531bfd21caf7da8683f87982844984608db6282。首次阻止与恢复证据在 staging-rollback.json、staging-blocked.log；最终独立审核在 cleanup-review.json。该变更处理系统标记差异，没有放宽业务内容验收。

| 验收 | 结果 | 证据 |
| --- | --- | --- |
| AC-L1 | 通过：业务内容及素材未发现迁移缺口；历史实现和记录明确仅存档 | migration-review.json |
| AC-L2 | 通过：五份本地归档完整恢复，2,878 个文件核对通过，原有 94 份备份不变 | local-backups.json、preservation.log、私有 manifest.json |
| AC-L3 | 通过：五个旧目录均已移除；父应用 64 个已跟踪文件、清理窗口内主仓库 34 个无关改动、17 个同级目录身份不变 | cleanup-review.json、cleanup-result.json、私有 protected-state.json |
| AC-L4 | 通过：pnpm test 的 59 项检查通过；最终复核同时校验归档、迁移证明、路径缺失与受保护项目 | final-unit.log、source-sha256.json、本任务 task-artifacts 验证收据 |

备份位置：/Volumes/Samsung SSD 990 PRO 2T/SSD/Documents/Repository Backups/ajigu-site/2026-11-01-legacy-domains/local-checkouts。五份 tar.gz 包含原目录名，恢复时解压到新的空父目录，不覆盖现行项目。原远端 bundle 与元数据仍保留在上一层。两处备份均不属于临时清理范围。

本次没有修改网站运行时代码、DNS 或线上部署，也未重新执行构建和浏览器测试；回归与验收范围是本地迁移内容、备份可恢复性和目录清理边界。文档及记忆沿用 jj 提交与 main 同步流程；仅在验证记录、远端提交和占用检查均通过后，清理本次 task-artifacts 目录。

最终复核与并行编辑：删除执行时保护快照包含 34 个无关改动文件，较审核前的 29 个增加了并行产品接入工作。删除 guard 对执行窗口内全部 34 个文件反复核对并通过。清理完成后，integration.md 和 memory/product-onboarding.md 又出现后续编辑；其修改时间晚于清理完成时间。本任务未写入或回滚这些文件。后续复核仍严格检查父应用和同级目录，并以已绑定的完成收据证明清理窗口内的文件保护，不要求并行任务停止后续编辑。细项见 post-cleanup-observations.json。
