# 独立审核：正面设备成品图

状态：通过，无阻塞问题。审核针对本轮最终生产源码与图片，未修改项目文件。

## 实际核对

| 维度 | 结果 |
| --- | --- |
| 设备角度 | 六格均为正面模板，页面无旋转、透视或设备分层 |
| 布局与留白 | 1440／768／390px 三／二／一列正确，无横向溢出 |
| 截图真实性 | TypeNote、DailyApod 新构建与实际视图代码匹配，Daily 未使用错误文章夹具 |
| 比例与遮罩 | contain 保留完整比例；模板屏幕透明、mask 正确；TUTU 未拉伸 |
| 图片与图标 | 六格各一张完整 1600×1200 WebP，图标规格保持，三尺寸显示正常 |
| 来源与许可 | 模板原下载、截图、mask 与输出摘要均通过；署名符合 MockUPhone 官方说明 |

独立浏览器补测三个视口：全部成品加载，计算样式均为 `transform: none`；键盘进入 TypeNote 保留中文，无控制台或页面错误。gallery 单测及六站产物契约通过。未将主执行者完整 228 项矩阵计为独立执行结果。

## 审核基线

审核覆盖 35 个文件，聚合摘要：

```text
09a15769ee1596c9f71f7a6cdf6b1e5022e59baa118071569fd4f896dfd4e17d
```

关键 SHA-256：

```text
d672506dbf06371fd8972d42797fd2c9a7576b3cd97d602d8ee38eb9490ea61a  apps/ajigu/src/components/GalleryVisual.astro
45c118900bd4196c5985720aeaac6b5dbbb78d7f47cf98e608c41eaa69a9f7ad  apps/ajigu/src/styles/gallery.css
6099bf7124de69237f72715023e0aa743e92b336668642701882e229c7698023  scripts/render-mockups.py
7e50ca3aca747f6fdb8814cfbd7a1ac96ba4d72b1b466fc025bdfb14a087ed25  design/mockups/templates.json
a945665e3e9bb3427eced66f1cc3ea5384295356a3b5546c7e392199f4a387f1  design/mockups/screens.json
5aa7dacaf8f1f68ec69fa3cab7d305ee4795c1fcabe6c8c89ffa9f822ed1223a  design/mockups/outputs.json
7da8f133dd8ae32f8442a32f2b8d966f88f0d4cba7d5e7312700b58362afa86a  docs-ai/004-device-mockups/evidence/source-sha256.json
```

逐文件清单见 [source-sha256.json](evidence/source-sha256.json)。审核后仅更新结果、审核记录及规格状态，生产代码和图片保持该基线。最终源码绑定由主执行者通过 task-artifacts 完成。
