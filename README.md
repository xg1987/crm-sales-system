<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 一宸国学文化 CRM

Cloudflare 版本的 CRM 项目。

## 本地运行

1. 安装依赖
   `npm install`
2. 配置前端环境变量
   复制 `.env.example` 为 `.env.local`
3. 启动前端
   `npm run dev`
4. 启动 Cloudflare Worker
   `npm run cf:dev`

## Cloudflare 准备

1. 创建 D1 数据库
2. 把数据库 ID 填入 `wrangler.toml`
3. 执行 `worker/schema.sql` 初始化表结构
4. 部署 Worker
   `npm run cf:deploy`

## 前端接口

前端通过 `VITE_API_BASE_URL` 指向 Worker API，例如：
`http://127.0.0.1:8787/api`
