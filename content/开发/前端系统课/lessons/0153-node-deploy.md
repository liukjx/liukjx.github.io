---
title: 第153课：项目部署
description: Node.js 项目部署、PM2 进程管理、Nginx 反向代理
date: 2026-08-06
tags:
  - Node.js
  - 部署
  - PM2
  - Nginx
  - DevOps
---

# 项目部署

## 学习目标

- 掌握 PM2 进程管理
- 掌握 Nginx 反向代理配置
- 了解部署流程和 CI/CD

---

## PM2 进程管理

```bash
# 安装
npm install -g pm2

# 启动
pm2 start app.js --name my-app
pm2 start app.js -i max    # 多进程模式

# 管理
pm2 list                    # 查看进程列表
pm2 logs                    # 查看日志
pm2 monit                   # 监控面板
pm2 restart my-app          # 重启
pm2 stop my-app             # 停止
pm2 delete my-app           # 删除

# 保存和恢复
pm2 save                    # 保存进程列表
pm2 startup                 # 设置开机启动

# 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '200M',
    autorestart: true
  }]
};
```

---

## Nginx 配置

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name example.com;

    # 静态文件
    location /static/ {
        alias /var/www/myapp/static/;
        expires 30d;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 支持
    location /ws/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# HTTPS 配置
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/ssl/example.com.pem;
    ssl_certificate_key /etc/ssl/example.com.key;

    # API 代理
    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

---

## Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
```

---

## 自测题

### 问题 1
PM2 的 cluster 模式和 fork 模式有什么区别？

<details>
<summary>查看答案</summary>
fork 模式：单进程模式，适合单核环境或不需要多进程的应用。cluster 模式：利用 Node.js 的 cluster 模块启动多个工作进程，自动负载均衡到多核 CPU。配置 instances: 'max' 会在所有 CPU 核心上启动进程。cluster 模式提高了应用的吞吐量和可用性，某个进程崩溃后 PM2 会自动重启。
</details>

### 问题 2
Nginx 反向代理解决了什么场景的问题？

<details>
<summary>查看答案</summary>
1）负载均衡：将请求分发到多个 Node.js 进程；2）静态文件服务：Nginx 处理静态文件效率远高于 Node.js；3）HTTPS 终结：Nginx 处理 SSL/TLS，后端应用无需处理；4）安全防护：隐藏后端服务器信息、限流、IP 黑白名单；5）统一入口：多个应用共享 80/443 端口，通过 location 分发。
</details>