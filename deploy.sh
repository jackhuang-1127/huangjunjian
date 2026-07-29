#!/bin/bash

# 还款计划查询系统 - 部署脚本
# 使用方法：chmod +x deploy.sh && ./deploy.sh

set -e

echo "===== 开始部署还款计划查询系统 ====="

# 1. 安装依赖
echo "[1/4] 安装依赖..."
npm install -g pnpm pm2
pnpm install --prod

# 2. 构建项目
echo "[2/4] 构建项目..."
pnpm run build

# 3. 启动服务
echo "[3/4] 启动服务..."
pm2 delete repayment-query || true
pm2 start ecosystem.config.js
pm2 save

# 4. 设置开机自启
echo "[4/4] 设置开机自启..."
pm2 startup || true

echo ""
echo "===== 部署完成 ====="
echo "服务已启动，访问地址：http://localhost:3000"
echo ""
echo "常用命令："
echo "  pm2 status              # 查看服务状态"
echo "  pm2 logs repayment-query # 查看日志"
echo "  pm2 restart repayment-query # 重启服务"
echo "  pm2 stop repayment-query    # 停止服务"
