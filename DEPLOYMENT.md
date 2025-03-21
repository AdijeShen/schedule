# 日程计划助手部署指南

本文档提供了将日程计划助手应用部署到生产环境的详细说明。

## 目录

1. [环境准备](#环境准备)
2. [前端部署](#前端部署)
3. [后端部署](#后端部署)
4. [环境变量配置](#环境变量配置)
5. [部署到不同平台](#部署到不同平台)
6. [常见问题](#常见问题)

## 环境准备

部署应用前，确保具备以下条件：

- Node.js 18.x 或更高版本
- NPM 8.x 或更高版本
- MongoDB 5.x 或更高版本(后端数据库)
- 支持 HTTPS 的域名和证书(生产环境)

## 前端部署

### 1. 构建前端应用

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build:production
```

构建完成后，`dist` 目录包含所有静态资源文件。

### 2. 环境变量配置

在前端部署之前，确保创建以下环境变量文件：

- `.env.production` - 生产环境配置

请参考[环境变量配置](#环境变量配置)部分了解更多细节。

### 3. 静态资源服务

将 `dist` 目录部署到静态资源服务器或 CDN。常用选项包括：

- Nginx
- Apache
- Firebase Hosting
- Vercel
- Netlify

## 后端部署

### 1. 准备后端代码

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install --production
```

### 2. 配置环境变量

创建 `.env` 文件并设置以下内容：

```
PORT=3001
MONGODB_URI=mongodb://<用户名>:<密码>@<主机>:<端口>/<数据库名>
JWT_SECRET=<你的安全密钥>
CORS_ORIGIN=https://你的前端域名.com
NODE_ENV=production
```

### 3. 启动服务

推荐使用 PM2 管理 Node.js 应用：

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/index.js --name "schedule-app-backend"

# 设置开机自启
pm2 startup
pm2 save
```

## 环境变量配置

### 前端环境变量 (.env.production)

```
VITE_API_URL=https://你的后端域名.com/api
VITE_ENV=production
```

### 后端环境变量 (.env)

```
PORT=3001
MONGODB_URI=mongodb://<用户名>:<密码>@<主机>:<端口>/<数据库名>
JWT_SECRET=<你的安全密钥>
CORS_ORIGIN=https://你的前端域名.com
NODE_ENV=production
```

## 部署到不同平台

### Firebase 部署

1. 安装 Firebase CLI:
```bash
npm install -g firebase-tools
```

2. 登录 Firebase:
```bash
firebase login
```

3. 初始化项目:
```bash
firebase init
```
   - 选择 Hosting
   - 选择项目
   - 指定 `dist` 为公共目录
   - 配置为单页应用
   - 设置重写规则

4. 部署:
```bash
npm run deploy:firebase
```

### Vercel 部署

1. 安装 Vercel CLI:
```bash
npm install -g vercel
```

2. 部署项目:
```bash
vercel
```

3. 根据提示完成配置

## 常见问题

### 1. API 连接错误

确保在 `.env.production` 中正确设置了 `VITE_API_URL`，并且后端服务器正常运行。

### 2. CORS 问题

确保后端 `.env` 文件中的 `CORS_ORIGIN` 设置为前端的实际域名。

### 3. 数据库连接问题

验证 MongoDB 连接字符串是否正确，并确保数据库服务器可以从后端服务器访问。

### 4. 通知功能不工作

确保生产环境使用 HTTPS，因为通知功能需要安全上下文。

### 5. Service Worker 更新问题

如果部署后 Service Worker 未更新，请尝试在构建前增加版本号或清除浏览器缓存。

### 6. 环境变量未加载

确保在构建前正确设置了所有必要的环境变量，并且 Vite 配置文件正确引用这些变量。

---

如有其他部署问题，请提交 issue 到项目仓库。 