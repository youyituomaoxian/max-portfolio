// Allow admin preview to override profile data via sessionStorage
const _previewData = typeof window !== 'undefined' && window.sessionStorage
  ? (() => {
      try {
        const raw = sessionStorage.getItem('admin_preview_profile');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })()
  : null;

const _baseProfile = {
  "name": "马守坤",
  "nameEn": "Max",
  "heroVideo": "/videos/hero-bg.mp4",
  "roles": [
    "视觉设计师",
    "AI设计师",
    "品牌设计师"
  ],
  "bio": "拥有多领域背景的全链路设计师。过去10年，跨越品牌设计、UI/UX设计、三维可视化、空间规划与数字产品设计等多个领域，积累了从前期概念到最终落地的完整设计经验。相信好的设计不止于美观——它应该传递价值、解决问题，并在商业与艺术之间找到平衡。",
  "stats": [
    {
      "value": "10+",
      "numericValue": 10,
      "suffix": "+",
      "label": "年设计经验"
    },
    {
      "value": "200+",
      "numericValue": 200,
      "suffix": "+",
      "label": "完成项目"
    },
    {
      "value": "5",
      "numericValue": 5,
      "suffix": "",
      "label": "专业领域"
    },
    {
      "value": "1",
      "numericValue": 1,
      "suffix": "",
      "label": "长期合作伙伴"
    }
  ],
  "expertise": [
    {
      "id": "visual",
      "title": "视觉设计",
      "icon": "🎨",
      "description": "深耕品牌视觉系统，涵盖平面设计、版式构成、色彩理论及视觉叙事，为品牌建立独特的视觉语言。",
      "tags": [
        "海报与物料设计",
        "版式与字体排印",
        "视觉叙事与概念"
      ]
    },
    {
      "id": "brand",
      "title": "品牌设计",
      "icon": "⚡",
      "description": "从市场洞察到品牌策略，从视觉系统到数字触点，提供完整的品牌解决方案，帮助品牌建立一致的识别体系。",
      "tags": [
        "VI系统设计",
        "品牌触点管理",
        "数字媒体传播"
      ]
    },
    {
      "id": "uiux",
      "title": "UI/UX 设计",
      "icon": "✦",
      "description": "以用户为中心，从信息架构到高保真界面，构建直观、高效的数字产品体验，连接品牌与用户。",
      "tags": [
        "用户研究与洞察",
        "信息架构设计",
        "交互与界面设计",
        "设计系统搭建"
      ]
    },
    {
      "id": "threeD",
      "title": "3D 建模与渲染",
      "icon": "◆",
      "description": "运用 Cinema 4D、3DMAX等工具进行高精度建模与场景渲染，为品牌提供具有冲击力的三维视觉资产。",
      "tags": [
        "产品建模渲染",
        "场景搭建与灯光",
        "材质与纹理绘制",
        "动态视觉与动画"
      ]
    },
    {
      "id": "space",
      "title": "展会展场空间",
      "icon": "◈",
      "description": "结合品牌策略与空间设计，规划具有沉浸感和交互性的展陈空间，创造令人难忘的品牌体验场景。",
      "tags": [
        "空间概念规划",
        "动线与体验设计",
        "材质与灯光方案"
      ]
    }
  ],
  "experience": {
    "education": {
      "school": "西安理工大学",
      "degree": "动画专业 本科学士",
      "year": "2013"
    },
    "work": [
      {
        "company": "弘讯科技",
        "period": "2014 — 至今",
        "duration": "12 年",
        "roles": [
          {
            "title": "视觉设计",
            "description": "负责公司视觉系统，产品类海报与物料设计，公司活动类主题的策划，新媒体传播、公司形象、产品宣传等方向的视频设计。"
          },
          {
            "title": "UI/UX 设计",
            "description": "负责公司软件Web端、移动端（小程序、APP）的设计。包含用户研究、低保真交互原型、高保真交互与界面设计，同时搭建相对应平台的设计系统。"
          },
          {
            "title": "展会展场空间",
            "description": "2014-2023年负责公司展览展厅空间设计，结合统一的公司视觉系统，完整策划设计公司展厅空间，布局合理动线及参观导引，使用3D工具创建展厅空间模型，渲染真实展厅效果图。"
          },
          {
            "title": "3D 建模与渲染",
            "description": "负责对公司产品进行高精度建模与适配的场景渲染，为产品提供具备视觉冲击力的视觉视频和3D数字资料。"
          }
        ]
      }
    ]
  },
  "projects": [
    {
      "id": 1,
      "title": "品牌视觉体系",
      "category": "品牌设计",
      "date": "2026-06",
      "description": "弘讯科技于集团40周年庆的时机，集团统一规范、更新VI手册，有利于更好的适应现在集团的状况，并增强集团形象的宣传。",
      "image": null,
      "tags": [
        "VI系统",
        "Logo设计",
        "品牌策略"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/brand1/1200/675",
          "caption": "品牌色彩系统 — 以橙色为主色调构建完整的品牌视觉语言，从Logo图形到UI组件的色彩映射，确保各触点视觉一致。"
        },
        {
          "video": "/videos/hero-bg.mp4",
          "aspect": "portrait",
          "image": "https://picsum.photos/seed/brand-v/900/1600",
          "caption": "竖版视频示例 — 居中显示，背景自动模糊填充，保持视觉对齐。"
        }
      ]
    },
    {
      "id": 2,
      "title": "TM PLAS CLOUD 产品界面",
      "category": "UI/UX 设计",
      "date": "2026-03",
      "description": "注塑机工业互联网平台的整体交互设计，包含Web端仪表盘、设备监控、数据可视化与移动端小程序。以工业美学为基调，融合深色模式与数据可视化最佳实践，打造专业且易用的操作体验。",
      "image": null,
      "tags": [
        "SaaS平台",
        "数据可视化",
        "设计系统"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/dash1/1600/900",
          "caption": "主仪表盘 — 采用深色背景降低视觉疲劳，核心指标通过卡片式布局清晰呈现，实时数据以动态图表形式展示，支持自定义看板布局。"
        },
        {
          "image": "https://picsum.photos/seed/dash2/900/1200",
          "aspect": "portrait",
          "caption": "移动端小程序 — 竖版长图展示从扫码登录到设备监控的完整操作流程，单手操作热区经过拇指可达性优化。"
        },
        {
          "video": "/videos/hero-bg.mp4",
          "image": "https://picsum.photos/seed/dash3/2000/800",
          "caption": "横版视频示例 — 支持 controls 控制条、loop 循环播放，poster 在视频未加载时显示占位图。"
        }
      ]
    },
    {
      "id": 3,
      "title": "注塑机产品3D可视化",
      "category": "3D 建模与渲染",
      "date": "2025-11",
      "description": "高精度注塑机产品建模与场景渲染，用于产品宣传视频、展会展示与数字资料。",
      "image": null,
      "tags": [
        "C4D",
        "Redshift",
        "产品渲染"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/threeD1/1200/675",
          "caption": "产品渲染 — 以Redshift渲染器为核心，通过精细材质与灯光设计，呈现注塑机产品的工业质感与结构细节。"
        }
      ]
    },
    {
      "id": 4,
      "title": "弘讯科技展厅设计",
      "category": "展场空间",
      "date": "2025-08",
      "description": "从空间概念到落地实施，完整策划设计弘讯科技展览展厅，包括动线规划、视觉物料与交互体验。",
      "image": null,
      "tags": [
        "空间设计",
        "展览策划",
        "交互体验"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/exhibit1/1200/675",
          "caption": "展厅空间规划 — 以品牌叙事为主线串联各功能分区，通过灯光、材质与色彩引导参观动线，创造层层递进的空间体验。"
        }
      ]
    },
    {
      "id": 5,
      "title": "注塑机产品系列海报",
      "category": "视觉设计",
      "date": "2025-05",
      "description": "为全系列注塑机产品打造统一视觉风格的海报系统，涵盖产品特写、场景展示与参数信息排版。",
      "image": null,
      "tags": [
        "海报设计",
        "版式构成",
        "视觉叙事"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/poster1/1200/675",
          "caption": "系列海报 — 统一网格系统确保品牌一致性，每款产品通过差异化色彩和光影处理突出各自定位。"
        }
      ]
    },
    {
      "id": 6,
      "title": "年度品牌形象片策划",
      "category": "品牌设计",
      "date": "2025-03",
      "description": "主导年度品牌形象片的创意策划与视觉执行，整合三维渲染与实拍素材，传递品牌技术实力。",
      "image": null,
      "tags": [
        "视频策划",
        "品牌传播",
        "创意指导"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/brand2/1200/675",
          "caption": "形象片分镜设计 — 从概念草图到最终成片，每帧画面围绕\"科技温度\"核心主张进行视觉编排，实现品牌叙事与产品展示的平衡。"
        }
      ]
    },
    {
      "id": 7,
      "title": "智能工厂数据看板",
      "category": "UI/UX 设计",
      "date": "2024-12",
      "description": "为智能工厂管理系统设计实时数据监控看板，融合工业美学与信息可视化，提升生产决策效率。",
      "image": null,
      "tags": [
        "数据可视化",
        "工业设计",
        "Dashboard"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/dashb1/1200/675",
          "caption": "监控看板 — 信息层级采用\"概览→明细→预警\"三阶递进，顶部关键指标区配合中部趋势图与底部异常列表，一目了然。"
        }
      ]
    },
    {
      "id": 8,
      "title": "企业社会责任报告设计",
      "category": "视觉设计",
      "date": "2024-09",
      "description": "年度CSR报告的视觉设计与排版，将枯燥数据转化为有感染力的信息图表与阅读体验。",
      "image": null,
      "tags": [
        "报告设计",
        "信息图表",
        "排版设计"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/report1/1200/675",
          "caption": "CSR报告内页 — 以数据故事化为主线，将碳排放、公益投入等指标转化为直观的渐变图表与图标系统，降低阅读门槛。"
        }
      ]
    },
    {
      "id": 9,
      "title": "国际橡塑展展台设计",
      "category": "展场空间",
      "date": "2024-05",
      "description": "CHINAPLAS 国际橡塑展主展台空间设计，整合产品陈列、交互体验与品牌叙事于一体的沉浸式展陈。",
      "image": null,
      "tags": [
        "展览设计",
        "空间规划",
        "品牌体验"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/exhibit2/1200/675",
          "caption": "CHINAPLAS展台 — 主入口以大型LED屏作视觉锚点，产品陈列按\"原料→加工→成品\"逻辑线展开，互动区设置触控体验台。"
        }
      ]
    },
    {
      "id": 10,
      "title": "工业产品手绘速写集",
      "category": "手绘稿",
      "date": "2024-02",
      "description": "注塑机及周边设备的快速手绘速写，以线条和光影捕捉工业产品的形态美感与结构层次。",
      "image": null,
      "tags": [
        "工业速写",
        "产品线稿",
        "结构表达"
      ],
      "gallery": [
        {
          "image": "https://picsum.photos/seed/sketch1/1200/675",
          "caption": "产品速写 — 以0.3mm针管笔快速勾勒主体结构，辅以马克笔淡彩表现体块光影，每幅控制在15分钟内完成以保持笔触的流动感。"
        }
      ]
    }
  ],
  "tools": [
    {
      "category": "平面与品牌",
      "items": [
        "Illustrator",
        "Photoshop",
        "Figma"
      ]
    },
    {
      "category": "3D 与渲染",
      "items": [
        "Cinema 4D",
        "3DMAX",
        "Redshift",
        "Octane",
        "Rhino",
        "SketchUp"
      ]
    },
    {
      "category": "空间设计",
      "items": [
        "SketchUp",
        "Rhino",
        "AutoCAD"
      ]
    },
    {
      "category": "UI/UX",
      "items": [
        "Figma",
        "Ardot",
        "Pixso",
        "After Effects"
      ]
    },
    {
      "category": "视频与动效",
      "items": [
        "After Effects",
        "Premiere"
      ]
    },
    {
      "category": "AI 技能",
      "items": [
        "Codex",
        "WorkBuddy",
        "Cherry Studio"
      ]
    }
  ],
  "contact": {
    "email": "youyituomaoxian@163.com",
    "items": [
      {
        "type": "wechat",
        "mode": "qrcode",
        "value": "/images/wachat-qr.png"
      },
      {
        "type": "official",
        "mode": "qrcode",
        "value": "/images/微信公众号.jpg"
      }
    ]
  },
  "avatar": "/images/max.png"
};

export const profile = _previewData || _baseProfile;

export const navItems = [
  {
    "id": "about",
    "label": "About",
    "labelZh": "关于"
  },
  {
    "id": "projects",
    "label": "Work",
    "labelZh": "作品"
  },
  {
    "id": "expertise",
    "label": "Expertise",
    "labelZh": "能力"
  },
  {
    "id": "contact",
    "label": "Contact",
    "labelZh": "联系"
  }
];
