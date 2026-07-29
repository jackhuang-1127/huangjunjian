# 还款计划查询系统 - 部署指南

## 快速部署

### 1. 上传项目到服务器

```bash
# 在本地打包项目
cd /workspace/projects
tar -czf repayment-query.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# 上传到服务器
scp repayment-query.tar.gz root@你的服务器IP:/opt/repayment-query/
```

### 2. 在服务器上部署

```bash
# SSH 登录服务器
ssh root@你的服务器IP

# 进入项目目录
cd /opt/repayment-query

# 解压（如果上传的是压缩包）
tar -xzf repayment-query.tar.gz

# 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 3. 配置 Nginx（可选，用于域名访问）

```bash
# 复制 Nginx 配置
sudo cp nginx.conf.example /etc/nginx/sites-available/repayment-query

# 编辑配置，替换域名
sudo nano /etc/nginx/sites-available/repayment-query

# 创建软链接
sudo ln -s /etc/nginx/sites-available/repayment-query /etc/nginx/sites-enabled/

# 测试并重启 Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 4. 配置防火墙

```bash
# 开放 3000 端口（直接访问）
sudo ufw allow 3000/tcp

# 或开放 80 端口（通过 Nginx）
sudo ufw allow 80/tcp
```

## 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs repayment-query

# 重启服务
pm2 restart repayment-query

# 停止服务
pm2 stop repayment-query

# 删除服务
pm2 delete repayment-query
```

## 数据持久化（重要）

当前版本数据存储在内存中，服务重启后数据会丢失。

### 方案 1：使用 Supabase（推荐）

1. 访问 https://supabase.com 创建项目
2. 获取数据库连接信息
3. 安装 Supabase SDK：`pnpm add @supabase/supabase-js`
4. 改造 API 路由使用数据库存储

### 方案 2：使用 SQLite（简单）

1. 安装：`pnpm add better-sqlite3`
2. 改造 API 路由使用 SQLite 存储

## 故障排查

### 服务无法启动
```bash
# 查看日志
pm2 logs repayment-query

# 检查端口占用
lsof -i:3000

# 手动启动测试
pnpm run start
```

### 无法访问
```bash
# 检查服务是否运行
pm2 status

# 检查防火墙
sudo ufw status

# 测试本地访问
curl http://localhost:3000
```

## 更新部署

```bash
# 上传新代码后
cd /opt/repayment-query
./deploy.sh
```
