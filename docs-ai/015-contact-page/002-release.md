# 联系页发布

状态：发布进行中。用户于 2026-11-04 明确要求「发布」，授权本轮联系页改动提交、推送与生产上线，取代 [实施结果](001-action.md) 中尚未发布的阶段状态。

范围：五语言联系页、首页导航、页面元数据、构建站点地图及对应回归检查。沿用现有 `main` 快进与 GitHub Pages 流程，不改 DNS，不包含独立的 `GOOGLE-API-REPORT-ajigu.com.md` 和 `memory/seo.md`。

发布前重新核对远端，执行本地格式、类型、单测、生产构建、构建契约及联系页回归；远端 CI 执行现有完整验收。只有部署成功、线上版本标记匹配提交、五种语言联系页与首页导航及站点地图均正确，才记录发布完成。失败时保留产物和证据，不跳过部署前检查。

审核：本次沿用第 000 项局部修复的自检要求，已复查路由、语言上下文、邮箱与外链、测试范围和发布文件边界，无新增权限或数据处理决策。

本轮只发布网站；未将 GSC/Bing 提交或收录声明为本次上线结果。发布完成后在本条目追加构建提交、部署运行和线上验证证据。

本地发布前验收已通过：依赖无冲突、格式正确、类型检查零错误、77 项单测、40 页生产构建及构建契约，以及 30 组联系页浏览器场景。证据见 [构建与检查](evidence-release/release-verify.log)、[联系页](evidence-release/release-contact.log)、[格式](evidence-release/release-format.log) 和 [依赖](evidence-release/release-peers.log)。

首次远端运行 [41701154517](https://github.com/huihuisang/ajigu-site/actions/runs/41701154517) 在 TypeNote 键盘回归中失败，部署未执行。测试只等菜单的展开属性变为关闭，随后立即切换焦点并按 Enter；菜单退场后的异步焦点恢复可能把焦点移回语言按钮，使音符仍为 5 而非 7。针对性重放在 5 次中复现 3 次，且观测到焦点恢复；原始快速重放 20 次未复现，符合时序竞态特征。

修复限定于 `tests/browser.mjs`：等待菜单卸载和语言按钮获得焦点，再测试音符键盘操作，并用可重试的状态断言等待结果。不修改产品交互，也不放宽预期值。该测试文件纳入本轮验证与发布范围。

修复后同一流程连续 20 次通过，未出现焦点被移回菜单或按键无效；77 项单测与格式检查再次通过。对照证据：[竞态复现](evidence-release/focus-restoration-probe.json)、[修复后重放](evidence-release/focus-fixed-probe.json)、[重放摘要](evidence-release/focus-fixed-probe.log) 和 [单测](evidence-release/release-retest.log)。
