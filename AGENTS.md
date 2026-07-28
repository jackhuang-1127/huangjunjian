# AGENTS.md

## 项目概览
还款计划查询系统 — 纯前端应用，支持管理端上传Excel解析还款计划并生成二维码，客户端扫码查询还款明细。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- xlsx (SheetJS) — Excel文件解析
- qrcode — 二维码生成
- localStorage — 数据存储

## 目录结构
```
src/
├── app/
│   ├── page.tsx              # 管理端 - 上传页面（首页）
│   ├── query/[batchId]/page.tsx  # 客户端 - 查询页面
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── lib/
│   ├── types.ts              # 类型定义
│   ├── storage.ts            # localStorage 存储管理
│   ├── excel-parser.ts       # Excel 解析逻辑
│   └── utils.ts              # 通用工具函数
└── components/ui/            # shadcn/ui 组件库
```

## 核心功能
1. **管理端** (`/`): 上传Excel → 前端解析 → 存localStorage → 生成二维码
2. **客户端** (`/query/[batchId]`): 扫码进入 → 输入企业名 → 匹配展示还款记录

## 数据流
- Excel解析后数据以批次ID为key存入localStorage
- 二维码内容为客户端查询页URL: `{domain}/query/{batchId}`
- 客户端通过batchId从localStorage读取数据并过滤匹配

## 开发命令
- 安装依赖: `pnpm install`
- 开发: `pnpm run dev`
- 构建: `pnpm run build`
- 启动: `pnpm run start`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
