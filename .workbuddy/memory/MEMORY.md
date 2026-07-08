# Portfolio_2 — 项目记忆

## 项目概述
个人作品集网站（马守坤 / 全链路设计师），React 18 + Vite 5 + Tailwind CSS 3 单页应用。

## 技术栈
- **框架**：React 18 + Vite 5
- **样式**：Tailwind CSS 3（自定义暗色科技风主题）
- **动画**：GSAP + ScrollTrigger + @gsap/react + motion
- **组件库**：ReactBits（手动复制源码，非 npm 包），位于 `src/components/reactbits/`
- **图片压缩**：sharp（上传时自动 resize ≤1920px + mozjpeg q82 / PNG palette / WebP q82，仅 dev server）
- **字体**：Space Grotesk + Inter + JetBrains Mono

## 设计系统
- **品牌色**：橙色 #FF6B00（主）/ #FF8A33（浅）/ #FFB066（更浅）
- **背景色**：#0A0A0A（底色）/ #141414（面板）/ #1A1A1A（面板悬停）
- **文字**：#FFFFFF（主）/ #999999（辅）/ #666666（弱）
- **面板**：毛玻璃 rgba(20,20,20,0.6) + backdrop-blur
- **版心**：max-w-[1700px]

## 当前进度
- 第 1 步（含第 3 步）✅：基础版本 + ReactBits T1+T2 动画集成（DotField 已移除 2026-06-30）
- 对抗审查 ✅：14 缺陷 → 13 已修复（2026-06-30）
- 第 2 步 ✅：参考图调风格（2026-06-30）— 紫色系 → 橙色系
- 第 4 步 ✅：GSAP 进场动画（2026-06-30）— 首屏 opening + 滚动模块动画 + 图片 reveal/parallax
- 第 6 步 ✅：项目详情页 & 交互补全（2026-06-30）— ProjectModal 视频混排 / 回到顶部 / 联系面板 / 404
- 对抗审查 ✅：14 缺陷 → 12 已修复 + 1 驳回 + 1 暂缓（2026-06-30）
- 第 5 步 ✅：性能审查优化（2026-06-30）
- 第 7 步 ✅：移动端适配（2026-06-30）— 汉堡菜单 / 视频降级 / parallax 守卫 / touch 反馈
- 第 8 步 ✅：SEO + 元数据（2026-06-30）— OG/Twitter/JSON-LD/robots/sitemap/manifest/favicon
- 第 9 步 ✅：构建 & 部署（2026-07-01）— Cloudflare Pages 已上线 max-portfolio-7i0.pages.dev
- 管理面板 ✅：Admin CMS 7 tab 可视化编辑 + 实时预览 + 导出部署（2026-07-01）

## GitHub 自动更新日志规则
- **README.md** 包含「更新日志」区域（`<!-- WORKBUDDY_UPDATE_LOG -->` 标记之间）
- **每次通过 WorkBuddy 做实质性修改并推送后**，必须自动在 `<!-- END_WORKBUDDY_UPDATE_LOG -->` 上方追加一条记录
- 格式：`### YYYY-MM-DD — 简述` + 本次更新的具体内容列表
- 这是硬性规则，不可跳过

## 已集成动画
| 组件 | 来源 | 应用位置 |
|------|------|----------|
| Opening Animation | GSAP Timeline | Hero 首屏开场（标题缩放+去模糊入场，统一 expo.out）|
| SplitText | ReactBits T1 | Hero 主标题逐字入场 |
| CountUp | ReactBits T1 | About 数据卡片数字滚动 |
| GradientText | ReactBits T2 | Hero 英文名流动渐变 |
| SpotlightCard | ReactBits T2 | Projects + Expertise 卡片光晕 |
| ScrollTrigger | GSAP | 所有模块滚动进场（英文标题大幅位移 + 卡片 stagger）|
| ImageReveal | GSAP ClipPath | Projects 图片 reveal 效果 |
| ImageParallax | GSAP ScrollTrigger | Projects 图片视差滚动 |
| TiltedCard | ReactBits T2 | 已就绪，待图片到位后集成 |

## 项目结构
```
src/
├── components/
│   ├── Navbar.jsx          # 固定导航栏（IntersectionObserver 滚动高亮）
│   ├── Hero.jsx            # 首屏（rAF 批处理 mousemove 视差）
│   ├── About.jsx           # 个人经历（空数组守卫）
│   ├── Projects.jsx        # 精选项目
│   ├── Expertise.jsx       # 个人优势
│   ├── Contact.jsx         # 底部联系（邮箱复制+微信/公众号二维码弹窗）
│   ├── ProjectModal.jsx     # 项目详情弹窗（图片+视频混排画廊）
│   ├── ErrorBoundary.jsx   # 错误边界（6 个 section 独立包裹）
│   └── reactbits/          # 6 个 ReactBits 动画组件
├── utils/
│   └── scrollTo.js         # 滚动工具函数
│   └── bodyScrollLock.js   # 页面滚动锁（引用计数，防模态框争用）
├── data/profile.js         # 数据源（集中管理）
├── App.jsx                 # 主入口（Ambient Grid 背景 + ErrorBoundary 包裹）
├── main.jsx
└── index.css
```

## 关键约定
- 内容资产初期用占位符，现已逐步替换为真实素材（头像 / Hero 视频 / 项目图片）
- 设计系统由 AI 根据项目类型自行决定，未手动定义 token 表
- 品牌色已确定：橙色系 #FF6B00
- 浏览器预览端口：不固定（当前 5175，取决于占用情况）
- 所有 section 组件 GSAP useEffect 必须有 cleanup（`stModule.getAll().kill()`）
- body scroll 锁必须用 `src/utils/bodyScrollLock.js` 引用计数，禁止直接设 `body.style.overflow`
- 项目素材目录约定：项目内图片+视频统一放 `public/projects/<projectDir>/`（由 admin 字段 `projectDir` 控制）；全局素材（头像 / Hero 视频 / 能力图标 / 二维码）维持 `public/images/`、`public/videos/`，不按项目分

## 审查修复纪要（2026-06-30）
- ErrorBoundary 覆盖全部 6 个 section（单 section 崩溃不影响整站）
- Navbar 滚动高亮已修复（IntersectionObserver）
- Canvas 绘图已批处理（~10,800 → 1 draw call/frame）
- 提取 scrollTo 工具函数，消除 Navbar/Hero 代码重复
- DotField 组件已移除（2026-06-30 用户要求），保留源码 `src/components/DotField.jsx` 备用
- SplitText 添加 document.fonts 特性检测守卫
- 列表 key 统一使用稳定标识符

## 风格调整纪要（2026-06-30）
- 参考图：花瓣网 5416231531（黑底 + 橙色强调，左上角大标题，左对齐内容）
- 品牌色：紫色 #A855F7 → 橙色 #FF6B00
- 背景：#0A0A0B → #0A0A0A（更深的纯黑）
- 面板：#141416 → #141414，悬停 #1A1A1D
- 已更新文件：tailwind.config.js、index.css、Hero.jsx、About.jsx、Projects.jsx、Expertise.jsx、Contact.jsx、Navbar.jsx

## Hero 视频背景（2026-06-30）
- 视频文件：public/videos/hero-bg.mp4（1.8MB，已从 10.46MB 压缩）
- 播放：autoPlay + muted + loop + playsInline
- 遮罩：bg-surface-base/75 半透明层确保文字可读性

## Step 6 交互补全（2026-06-30）
- ProjectModal：图片+视频混排画廊，项目说明+标签重组布局
- 视频支持：横版宽度对齐、竖版居中+模糊背景
- 回到顶部按钮：右下角固定，scrollY > 60 淡入淡出
- 联系面板：邮箱一键复制+Toast、微信/公众号二维码弹窗
- 404 页面：public/404.html，纯静态零依赖

## Hero 动画调整（2026-06-30）
- 与 Contact 标题动画对齐：scale 2.5→1.5、blur 30→20px、去掉 y:80 位移
- 全局 easing 从 power3.inOut 统一为 expo.out

## 管理面板（2026-07-01）
- 纯后台管理，无预览面板（第一性原理：编辑=后台，预览=独立标签页打开 /）
- Tab 居中排列，编辑器全宽 960px 居中
- 能力图标：48×48 实时预览 + emoji/路径输入 + 📁 文件上传 + ✕ 清除
- 项目媒体：本地文件上传（非 URL），经 Vite 中间件 `POST /__media-upload` **真正写入** `public/`；项目素材统一 `public/projects/<projectDir>/`（图片+视频混放，字段 `projectDir` 控制），全局素材维持 images/videos；仅 dev server 生效（admin 本地工具）
- 联系模块：动态列表，支持增删改类型（微信→QQ、站酷→公众号），双重模式(链接跳转/二维码上传)
- 数据源：profile.js 运行时检测 sessionStorage（支持预览覆盖），admin 通过 parseProfileFromSource 双策略解析
- **实时预览**：admin 头部「👁 实时预览」按钮 → 写 sessionStorage → 新标签打开 / （即时生效，不依赖文件）
- **Vite 缓存防护**：vite.config.js 已配置 `server.watch: { usePolling: true, interval: 500 }`
- **工作流**：编辑→实时预览(sessionStorage) → 导出 profile.js(文件) → 部署，两条路径分离

## 交互增强（2026-07-08）
- ProjectModal 图片点击放大（Lightbox）：点击图片全屏放大，点击图片外区域 / Esc 关闭
- Lightbox 滚轮缩放（scale 0.5–5，每格 ±0.15，原生非被动监听阻止背景滚动），底部显示当前百分比
