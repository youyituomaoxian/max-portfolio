# Max Portfolio — 个人作品集网站

> 马守坤 / 全链路设计师（视觉设计 · AI 设计 · 品牌设计）

**线上地址**：https://max-portfolio-7i0.pages.dev/

---

## 当前进度：全部完成 ✅（2026-07-01）

- [x] 基础版本 + ReactBits T1+T2 动画 + 对抗审查修复
- [x] 参考图调风格（紫色 → 橙色系）
- [x] GSAP 进场动画（Hero opening + ScrollTrigger + 图片 reveal/parallax）
- [x] 项目详情弹窗（图片+视频混排画廊）
- [x] 交互补全（回到顶部、邮箱复制+Toast、二维码弹窗、404 页面）
- [x] 性能审查优化
- [x] 移动端适配（汉堡菜单、视频降级、parallax 守卫、touch 反馈）
- [x] SEO + 元数据（OG/Twitter/JSON-LD/robots/sitemap/manifest/favicon）
- [x] 后台管理面板（Admin CMS — 7 tab 可视化编辑 + 实时预览 + 导出部署）
- [x] 构建 & 部署（Cloudflare Pages: max-portfolio-7i0.pages.dev）

---

## 更新日志

<!-- WORKBUDDY_UPDATE_LOG: 每次通过 WorkBuddy 更新后，在此区域上方追加一条记录 -->
<!-- 格式：### YYYY-MM-DD — 简述 -->
<!-- 内容：本次更新的具体内容 -->

### 2026-07-01 — 内容更新：英文名、头像、公众号二维码
- 英文名：Ma Shoukun → Max
- 头像：新增 `/images/max.png`
- 个人简介：补充 UI/UX 设计能力
- 项目：WorkBuddy 品牌视觉 → 品牌视觉体系（弘讯科技 VI 更新）
- 联系方式：精简为微信公众号二维码，移除 Behance/站酷空占位

### 2026-07-01 — README + 后台补全 + 移动端修复
- 新增 README.md：项目概述、进度清单、更新日志区域、技术栈、项目结构
- 后台「信息」tab 标签修正（简介→信息）
- Admin InfoTab 新增头像上传字段、About 组件支持动态头像渲染
- ProjectModal 移动端全面适配：返回按钮 + 底部导航 + 字号/间距缩小
- 建立 WorkBuddy 自动更新日志规则

> *后续每次通过 WorkBuddy 修改并推送后，将在上方自动追加日志条目。*

<!-- END_WORKBUDDY_UPDATE_LOG -->

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + Vite 5 |
| 样式 | Tailwind CSS 3（暗色科技风主题） |
| 动画 | GSAP + ScrollTrigger + motion |
| 特效 | ReactBits（T1+T2 动画组件） |
| 字体 | Space Grotesk / Inter / JetBrains Mono |
| 部署 | Cloudflare Pages（免费 CDN） |

---

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:5175 （作品集首页）
# → http://localhost:5175/admin.html （后台管理）

# 构建生产版本
npm run build
```

---

## 项目结构

```
src/
├── components/          # 页面组件
│   ├── Navbar.jsx       # 固定导航栏
│   ├── Hero.jsx         # 首屏（视频背景 + 标题动画）
│   ├── About.jsx        # 个人经历
│   ├── Projects.jsx     # 精选项目
│   ├── Expertise.jsx    # 个人优势
│   ├── Contact.jsx      # 联系方式
│   ├── ProjectModal.jsx # 项目详情弹窗
│   └── reactbits/       # ReactBits 动画组件
├── data/profile.js      # 数据源（集中管理）
├── admin.jsx            # 后台管理面板
├── App.jsx              # 主入口
└── index.css            # 全局样式
```
