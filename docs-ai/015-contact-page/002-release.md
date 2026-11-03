# 联系页发布

状态：已发布；本地验收、完整远端 CI、生产部署与线上验收通过。用户于 2026-11-04 明确要求「发布」，授权本轮联系页改动提交、推送与生产上线，取代 [实施结果](001-action.md) 中尚未发布的阶段状态。

范围：五语言联系页、首页导航、页面元数据、构建站点地图及对应回归检查。沿用现有 `main` 快进与 GitHub Pages 流程，不改 DNS，不包含独立的 `GOOGLE-API-REPORT-ajigu.com.md` 和 `memory/seo.md`。

发布前重新核对远端，执行本地格式、类型、单测、生产构建、构建契约及联系页回归；远端 CI 执行现有完整验收。只有部署成功、线上版本标记匹配提交、五种语言联系页与首页导航及站点地图均正确，才记录发布完成。失败时保留产物和证据，不跳过部署前检查。

审核：本次沿用第 000 项局部修复的自检要求，已复查路由、语言上下文、邮箱与外链、测试范围和发布文件边界，无新增权限或数据处理决策。

本轮只发布网站；未将 GSC/Bing 提交或收录声明为本次上线结果。发布完成后在本条目追加构建提交、部署运行和线上验证证据。

本地发布前验收已通过：依赖无冲突、格式正确、类型检查零错误、77 项单测、40 页生产构建及构建契约，以及 30 组联系页浏览器场景。证据见 [构建与检查](evidence-release/release-verify.log)、[联系页](evidence-release/release-contact.log)、[格式](evidence-release/release-format.log) 和 [依赖](evidence-release/release-peers.log)。

首次远端运行 [41701154517](https://github.com/huihuisang/ajigu-site/actions/runs/41701154517) 在 TypeNote 键盘回归中失败，部署未执行。测试只等菜单的展开属性变为关闭，随后立即切换焦点并按 Enter；菜单退场后的异步焦点恢复可能把焦点移回语言按钮，使音符仍为 5 而非 7。针对性重放在 5 次中复现 3 次，且观测到焦点恢复；原始快速重放 20 次未复现，符合时序竞态特征。

修复限定于 `tests/browser.mjs`：等待菜单卸载和语言按钮获得焦点，再测试音符键盘操作，并用可重试的状态断言等待结果。不修改产品交互，也不放宽预期值。该测试文件纳入本轮验证与发布范围。

修复后同一流程连续 20 次通过，未出现焦点被移回菜单或按键无效；77 项单测与格式检查再次通过。对照证据：[竞态复现](evidence-release/focus-restoration-probe.json)、[修复后重放](evidence-release/focus-fixed-probe.json)、[重放摘要](evidence-release/focus-fixed-probe.log) 和 [单测](evidence-release/release-retest.log)。

## 最终发布结果

生产构建提交为 `e9946705ed960ec7557b01c8a5939f65d0220260`。[最终发布运行 41702881138](https://github.com/huihuisang/ajigu-site/actions/runs/41702881138) 的验证任务与部署任务均成功；远端完成依赖、格式、类型、单测、构建、构建契约，以及浏览器、布局、视觉、导航、联系页、语言、下载和旧域名跳转全部回归。状态及步骤证据见 [CI 结果](evidence-release/ci-result.json)。

线上 `site-release.json` 与构建提交一致。五语言首页与五语言联系页均返回 200；顶部入口、邮箱、外链、作品返回入口、canonical、分享 URL、语言替代链接与站点地图均验证通过。见 [线上结果](evidence-release/live-results.json) 和 [验收摘要](evidence-release/live-check.log)。发布前版本为 `663a5e84111ccf6c378b74b9bdc1aa1069d0d36f`，标记保留于 [原线上版本](evidence-release/previous-live.json)；需要回退时重新部署该已验证版本，不重写远端历史。

实际浏览器从中文首页点击「联系」成功进入 `/zh-hans/contact/`，再切换日语进入 `/ja/contact/`，点击「作品」返回 `/ja/#apps`；联系页未记录控制台错误。见 [浏览器记录](evidence-release/live-browser.json) 与 [线上截图](evidence-release/live-contact.png)。原有 320、390、1440px 及无脚本验收由本地 30 组联系页回归和远端对应步骤覆盖，本次线上截图为桌面视口。没有测试或执行真实邮件发送、GitHub 反馈提交、GSC/Bing 提交或收录请求。

审核：按第 000 项约定完成自检，未独立审核。最终实现未改变产品交互或验收预期，仅追加了前述测试时序修复。结果与证据以文档提交同步，运行时代码不变，不触发重复部署。独立的 SEO 报告及 `memory/seo.md` 摘要与发布前一致，保持本地未提交状态。
