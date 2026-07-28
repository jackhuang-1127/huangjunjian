# AGENTS.md

## 项目概览
还款计划查询系统 — 支持管理端上传Excel解析还款计划并生成二维码，客户端扫码查询还款明细。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- xlsx (SheetJS) — Excel文件解析
- qrcode — 二维码生成
- API Routes — 数据存储与读取

## 目录结构
```
src/
├── app/
│   ├── page.tsx                    # 管理端 - 上传页面（首页）
│   ├── query/[batchId]/page.tsx    # 客户端 - 查询页面
│   ├── api/
│   │   └── batches/
│   │       ├── route.ts            # POST - 存储批次数据
│   │       └── [id]/route.ts       # GET - 获取批次数据
│   ├── layout.tsx                  # 根布局
│   └── globals.css                 # 全局样式
├── lib/
│   ├── types.ts                    # 类型定义
│   ├── storage.ts                  # 存储管理（localStorage + API）
│   ├── excel-parser.ts             # Excel 解析逻辑
│   └── utils.ts                    # 通用工具函数
└── components/ui/                  # shadcn/ui 组件库
```

## 核心功能
1. **管理端** (`/`): 上传Excel → 前端解析 → 调用API存储 → 生成二维码
2. **客户端** (`/query/[batchId]`): 扫码进入 → 调用API获取数据 → 输入企业名 → 匹配展示还款记录

## 数据流
- Excel解析后数据通过POST请求存储到服务端内存
- 二维码内容为客户端查询页URL: `{domain}/query/{batchId}`
- 客户端通过batchId调用GET接口获取数据并过滤匹配

## API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/batches | 存储批次数据，返回 { success, batchId } |
| GET | /api/batches/[id] | 根据批次ID获取数据，返回 BatchData |

## 开发命令
- 安装依赖: `pnpm install`
- 开发: `pnpm run dev`
- 构建: `pnpm run build`
- 启动: `pnpm run start`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
