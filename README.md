# 学习规划平台前端 (Learning Planner Frontend)

## 项目简介

这是一个基于 Vue 3 + Vite + TypeScript 的学习规划平台前端项目，名为"学路规划"，主要功能包括：

- **职业探索**: AI 辅助职业规划与探索
- **技能分析**: 个人技能评估与分析
- **知识库存**: 学习笔记与知识管理
- **个人中心**: 用户个人信息管理
- **AI 对话**: 智能助手交互功能

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建工具 | Vite 7 |
| 状态管理 | Pinia 3 + persistedstate plugin |
| UI 库 | Element Plus 2.13 |
| HTTP 客户端 | Axios |
| 路由 | Vue Router 5 |
| 代码检查 | ESLint + Oxlint |
| 代码格式化 | Prettier |

## 项目结构

```
src/
├── api/               # API 接口模块
│   ├── agent/         # AI 代理相关接口
│   ├── token/         # Token 刷新接口
│   ├── user/          # 用户相关接口
│   └── index.ts       # API 导出入口
├── components/        # Vue 组件
│   ├── ai/            # AI 对话组件
│   └── layout/         # 布局组件
├── constants/          # 常量定义
├── router/             # Vue Router 配置
├── stores/             # Pinia 状态管理
│   ├── career.ts       # 职业/技能选择状态
│   └── user.ts         # 用户认证状态
├── utils/              # 工具函数
│   └── request.ts      # Axios 封装
└── views/              # 页面组件
    ├── CareerPage.vue   # 职业探索页
    ├── HomePage.vue     # 首页
    ├── KnowledgePage.vue # 知识库页
    ├── LoginPage.vue    # 登录页
    ├── MePage.vue       # 个人中心页
    └── SkillPage.vue    # 技能分析页
```

## 主要页面

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/` | 默认落地页（需登录） |
| 登录页 | `/login` | 手机号+验证码/密码登录 |
| 职业探索 | `/user/career` | 输入专业获取 AI 职业推荐 |
| 技能分析 | `/user/skill` | 基于职业展示技能，支持 AI 问答和测验 |
| 知识库 | `/user/knowledge` | 知识管理 |
| 个人中心 | `/user/me` | 用户个人信息管理 |

## 核心组件

### AI 组件 (`src/components/ai/`)
- **AIDialog.vue**: 可复用的 AI 对话组件，支持消息气泡、输入框、加载状态

### 布局组件 (`src/components/layout/`)
- **AiAssistant.vue**: 浮动 AI 助手按钮（可拖拽，移动端友好）
- **NavBar.vue**: 顶部导航栏
- **GeoAvatar.vue**: 头像组件
- **ChatInput.vue**: 聊天输入组件

## API 接口

### 用户接口 (`src/api/user/`)
- `sendCode(phone)`: 发送验证码
- `phoneLogin(phone, code)`: 手机号+验证码登录
- `accountLogin(phone, password)`: 手机号+密码登录
- `sendUser(...)`: 用户注册
- `logout()`: 登出

### AI 代理接口 (`src/api/agent/`)
- `sendChatMessage()`: 发送聊天消息获取职业推荐
- `saveJobAndSearchRAG()`: 保存职业并查询技能
- `saveSelectedJobs()`: 保存选中的职业
- `answerUserQuestion()`: 回答用户问题（含测验）
- `getUserJobData()`: 获取用户的职业和技能数据

### Token 接口 (`src/api/token/`)
- `refreshToken()`: 刷新访问令牌

## 状态管理

### user store (`src/stores/user.ts`)
- 管理用户认证状态
- 持久化存储: `playerInfo`（id, nickname）、`accessToken`

### career store (`src/stores/career.ts`)
- 管理职业/技能选择状态
- 存储: `selectedJobNames`、`jobToken`、`hasCalledSaveJob`
- LocalStorage 存储，7 天过期

## 工具函数

### request.ts (`src/utils/request.ts`)
- Axios 封装，主要特性：
  - 自动注入 Token 到请求头
  - 自动刷新 Token（30 分钟阈值）
  - 防止并发刷新
  - 401/404 自动跳转登录页
  - 开发环境 API 代理配置

## 路由配置

- 使用 Hash 模式 (`createWebHashHistory`)
- 路由守卫：
  - 未登录用户访问受保护路由 → 重定向到 `/login`
  - 已登录用户访问 `/login` → 重定向到首页
- 页面组件懒加载
