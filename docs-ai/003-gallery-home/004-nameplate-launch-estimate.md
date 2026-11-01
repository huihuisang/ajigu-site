# Nameplate 首次上线日期推测

日期：2026-11-02。实施完成；自检通过，未独立审核。本记录补充并替代 [003-card-metadata.md](003-card-metadata.md) 中 Nameplate 日期待确认的处理。

## 授权与判断

用户明确要求依据 Git 记录推测日期。以首次公开部署为上线依据，初版源码提交只作为下界；卡片显示 `≈ 2026-09-04`，提示文字说明日期根据部署历史推测。估计标记保存在 `releaseDateEstimated`，不把推测升级为已确认事实。

| 记录 | 北京时间 | 依据 |
| --- | --- | --- |
| 初版源码 | 2026-09-02 09:37:43 | 原仓库提交 `10a694e530bb359747bdb245dd1a40138ecbc431`，标题为 `Initial release of nameplate studio`，包含可运行编辑器 |
| 首次保留的成功部署 | 2026-09-04 00:33:11 | Actions 运行 `33779283912`；Pages 部署步骤成功，UTC 时间为 2026-09-03 16:33:11 |
| 主站引入编辑器 | 2026-09-04 09:26:27 | 主站提交 `5d533789c2e593e8e6fdbb49b8691bc0f630d9d0`，新增 `nameplate/index.html` 等编辑器文件 |

推荐上线日期为 2026-09-04。初版源码日期为 9 月 2 日，不能直接证明当天已公开服务；保留的部署历史也不能排除更早上线，因此日期必须带估计标记。本项按 Asia/Shanghai 解释部署时间，避免 UTC 跨日带来的 9 月 3 日歧义。

来源响应：`evidence-card-metadata/nameplate-initial-commit.json` 与 `nameplate-first-deployment.json`。可继续使用原资料中的 GitHub 链接核查。收费状态仍为免费。

## 验收

- AC-N01：源码日期早于成功部署；按 Asia/Shanghai 转换部署时间得到 2026-09-04。新增单元测试核对保留响应和产品资料。
- AC-N02：五语言首页均显示日期、近似符号和本地化推测提示。320/688/1440px 共 15 组浏览器检查通过，无横向溢出或文字越界。记录：`evidence-card-metadata/nameplate-estimate-layout.json`；截图：`nameplate-estimate.jpg`。
- AC-N03：运行 `pnpm verify`，覆盖类型、67 项单元测试、构建和产物检查；最终文件通过 task-artifacts 真实验证绑定。旧版 248 组浏览器回归不作为本次变更后重新执行的证据。

未提交、推送或部署。任务 `f833f1c99da646f2a4fe04fed11a55d7` 保留可再生产物，因为没有已发布提交。
