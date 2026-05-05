# 星航太阳系 AI Lab

一个支持 AI 问答、手势识别、鼠标/触控交互和单星球展示的太阳系 3D 科普演示系统。

项目使用原生 Canvas 绘制粒子化太阳系模型，配合 Node.js + Express 后端代理外部 AI 模型 API。API Key 只保存在本机后端，不暴露在前端代码中。

## 功能特性

- 太阳系八大行星 3D 粒子交互模型
- 鼠标拖拽、滚轮缩放、触屏滑动和双指缩放
- 单个星球独立展示模式
- 摄像头手势识别控制视角和缩放
- 右侧抽屉式导航菜单，减少对模型画面的遮挡
- 右下角 AI 小精灵问答窗口
- 支持 DeepSeek、通义千问 DashScope 或其他 OpenAI 兼容接口
- 后端加密保存 API Key，前端只显示脱敏信息
- 内置健康检查脚本，便于维护和发布前自检

## 技术栈

- 前端：HTML、CSS、原生 JavaScript、Canvas
- 后端：Node.js、Express
- AI 接入：OpenAI-compatible Chat Completions HTTP API
- 本地安全：CSRF token、same-origin 检查、AES-256-GCM 加密存储

## 快速启动

安装依赖：

```powershell
npm install
```

启动服务：

```powershell
npm start
```

打开：

```text
http://localhost:4173
```

Windows 用户也可以直接双击：

```text
启动太阳系AI模型.bat
```

或后台启动：

```text
后台启动太阳系AI模型.bat
```

## AI 模型配置

进入页面后，点击右下角 AI 小精灵，再点击窗口右上角的 `Key` 按钮，可以配置：

- 模型服务商
- API Endpoint
- 模型名称
- API Key

当前支持的常用配置：

### DeepSeek

```text
Endpoint: https://api.deepseek.com/v1
Model: deepseek-v4-pro
```

### 通义千问 DashScope

```text
Endpoint: https://dashscope.aliyuncs.com/compatible-mode/v1
Model: qwen-plus
```

### 自定义 OpenAI 兼容接口

只要服务兼容 `/chat/completions`，即可填写对应的 Endpoint 和模型名。

## 环境变量配置

也可以通过环境变量启动：

```powershell
$env:API_KEY_ENCRYPTION_SECRET="use_a_long_random_secret"
$env:AI_PROVIDER="qwen"
$env:AI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
$env:AI_MODEL="qwen-plus"
npm start
```

环境变量说明：

```text
PORT=4173
AI_PROVIDER=qwen
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
AI_MODEL=qwen-plus
AI_API_KEY=your_api_key
AI_TIMEOUT_MS=35000
AI_AUTH_HEADER=Authorization
AI_AUTH_PREFIX=Bearer
AI_KEY_STORE_FILE=.data/ai-key.enc.json
API_KEY_ENCRYPTION_SECRET=long_random_secret_for_local_encryption
```

`AI_ENDPOINT` 可选。如果不设置，后端默认使用：

```text
AI_BASE_URL + /chat/completions
```

## 安全说明

- 不要把真实 API Key 写进前端代码。
- `.data/` 已被 `.gitignore` 忽略，里面保存的是本地加密后的 API 配置。
- 如果设置了 `API_KEY_ENCRYPTION_SECRET`，API Key 会用 AES-256-GCM 加密保存。
- 如果没有设置加密密钥，通过页面保存的 Key 只会保存在当前 Node.js 进程内存里。
- 本项目默认作为本机演示工具使用，不建议直接暴露到公网。

## 维护命令

语法检查：

```powershell
npm run check
```

完整健康检查：

```powershell
npm run health
```

Windows 用户也可以双击：

```text
系统健康检查.bat
```

健康检查会验证：

- 前后端 JavaScript 语法
- 页面关键 DOM id 是否存在
- 是否存在重复 id
- 本地服务是否能访问
- `/api/key-status` 是否正常返回

## 项目结构

```text
.
├─ index.html                  # 主应用入口
├─ index-optimized.html        # 优化实验入口
├─ server.mjs                  # Express 后端
├─ server/
│  ├─ AIService.mjs            # AI API 统一调用层
│  └─ ApiKeyStore.mjs          # API Key 加密存储
├─ src/
│  ├─ app.js                   # 主交互逻辑
│  ├─ styles.css               # UI 与布局样式
│  ├─ compat.js                # 浏览器兼容补丁
│  └─ renderer.js              # 渲染实验模块
├─ workers/
│  └─ particle-worker.js       # 粒子生成实验 Worker
├─ tools/
│  └─ health-check.mjs         # 项目健康检查
└─ .data/                      # 本地加密配置，已忽略
```

## API 接口

获取 CSRF token：

```http
GET /api/csrf-token
```

查看 Key 和模型配置状态：

```http
GET /api/key-status
```

保存 API 配置：

```http
POST /api/set-api-key
Content-Type: application/json
X-CSRF-Token: <token>

{
  "provider": "qwen",
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "model": "qwen-plus",
  "apiKey": "your_api_key"
}
```

验证 API Key：

```http
POST /api/verify-api-key
X-CSRF-Token: <token>
```

AI 问答：

```http
POST /api/ai
Content-Type: application/json
X-CSRF-Token: <token>

{
  "question": "火星为什么是红色的？",
  "planet": {
    "id": "mars",
    "name": "火星"
  }
}
```

## 发布状态

当前 GitHub 仓库：

```text
https://github.com/space330/solar-system
```
