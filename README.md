# 枫转 MapleZhuan

加拿大华人本地闲置 & 转租平台。支持二手商品发布、转租房源、实时聊天与交易流程管理。

---

## 本地开发

### 1. 克隆并安装依赖

```bash
git clone <repo-url>
cd maplezhuan
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

打开 `.env.local`，填入以下来自 **Firebase Console → Project Settings → Your apps → Web app → SDK config** 的值：

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> ⚠️ 永远不要把 `.env.local` 提交到 git（已在 `.gitignore` 中排除）。

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

---

## 目录结构

```
src/
├── app/                    # Next.js App Router 路由
│   ├── page.tsx            # 浏览页（闲置 + 转租）
│   ├── listing/[id]/       # 商品详情页
│   ├── sublet/[id]/        # 转租详情页
│   ├── messages/           # 消息 / 聊天页
│   ├── publish/            # 发布商品 / 房源
│   ├── profile/            # 个人主页
│   ├── seller/             # 卖家中心
│   ├── favorites/          # 收藏列表
│   └── seller-onboarding/  # 卖家入驻流程
│
├── components/
│   ├── app/                # 全局 UI 组件（Shell、Sidebar、卡片等）
│   ├── auth/               # 认证 / 保护路由
│   ├── chat/               # 聊天 UI 组件
│   ├── layout/             # Header、Footer
│   ├── modals/             # 对话框
│   ├── sections/           # Landing page sections
│   └── ui/                 # 通用 UI 原子组件
│
├── hooks/                  # 自定义 React hooks（数据获取）
├── lib/
│   ├── firebase/           # Firebase 配置 + Firestore / Storage helpers
│   ├── browseFilters.ts    # 筛选逻辑 & 常量
│   └── listingCities.ts    # 城市提取工具
└── store/                  # Zustand stores（auth、publish 草稿）
```

---

## 常用指令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建 production bundle
npm run start    # 启动 production 服务器（需先 build）
npm run lint     # ESLint 检查
```

---

## 部署

推荐使用 [Vercel](https://vercel.com)。在 Vercel 项目设置中填入与 `.env.local` 相同的环境变量即可。

详见 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)。
