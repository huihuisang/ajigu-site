# 单站合并实施结果

实施状态：本地实现已完成，线上切换待执行。
验证状态：本地通过；远端 CI 与线上验收待执行。
审核状态：最终源码独立审核通过，见 evidence/review-studio.json 与 review-products.json。

## 改动

只保留 apps/ajigu 一个 Astro 应用。五个产品迁入 src/products，原静态内容与资源迁入 public/<product>。统一 URL 映射处理结构化元数据、旧静态文档、语言脚本与兼容跳转；91 个规范页面合用主域名站点地图。只在构建期使用 Cheerio 解析 HTML，不进入客户端 bundle。

五个旧域名使用现有产物分支发布轻量跳转页，保留原二进制资源；不修改 DNS 或原源码分支。发布顺序为主站验证成功后切换旧域名。HTTP 200 页面内使用即时 meta refresh 与 location.replace，不宣称服务器 301。脚本保留 query/hash，禁脚本有固定跳转目标与可读链接。

## 验收与证据

| 编号 | 本地结果 | 证据与线上状态 |
| --- | --- | --- |
| AC-S1 | 通过：单次 Astro 构建产出 30 个营销页面，静态文档合并后共 91 个规范 URL | build.log、contracts.log；线上待验证 |
| AC-S2 | 通过：资源、原静态正文、语言路径及编辑器回归正常 | contracts.log、browser-results.json；线上待验证 |
| AC-S3 | 通过：91 个规范 URL 与元数据合同通过 | contracts.log、URLs/output 单测；线上待验证 |
| AC-S4 | 通过：171 项旧域名、禁脚本、参数、未知路径与语言切换检查 | redirects-results.json；线上待验证 |
| AC-S5 | 通过：228 项页面/视口检查，174 组本地化布局，144 次章节展开，14 组禁脚本布局；动画、导出、存储与触屏交互通过 | browser/layout/design-results.json；IAB 本地截图 |
| AC-S6 | 本地通过：格式、类型、57 项单测、构建与两份独立审核 | format/check/unit/build.log、审核摘要；CI/线上待执行 |

本地浏览器实际确认 TypeNote 的 ?lang=zh 仍使用简体中文；Moodsk 六章节存在，390px 视口无横向溢出，FAQ 左边距 20px。持久截图为 local-home、local-typenote、local-moodsk、local-moodsk-mobile.jpg。

## 修正与限制

审核发现语言 adapter 会丢失重复查询参数，已改为按目标初始键集合合并，增加重复值、空值与编码值回归。跳转矩阵的偏好污染通过测试隔离修正，产品偏好逻辑保留。完整浏览器检查发现 /favicon.ico 缺失，现将主站现有 PNG 原字节包入 ICO，并校验头信息及 payload，不修改图像像素。

审核基线由两份审核文件的逐文件 SHA256 确定：23 文件路由/发布范围摘要 9357c1f802252f785da5cc80bf16438561b0a1fe33f54fe55eb61ea448403d3d；254 文件兼容范围摘要 c4720b26eae642c4ca222510598ee35a3590718db4538a6773750b115362c8ea。规格版本为 000-plan.md 的审核摘要；证据版本由最终源码清单与发布提交绑定。

本任务不承诺搜索排名变化，不新增平台或付费服务。旧预览产物和共享缓存保留；只清理本次登记目录中的可再生产物。用户 SEO 报告与 memory/seo.md 不纳入本次提交，按既有摘要保护。
