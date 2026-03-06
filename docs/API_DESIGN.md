# AI Filmmaker Studio - API 设计文档

> **版本**: v1.0
> **创建日期**: 2026-03-06

---

## 一、API 概述

### 1.1 基础信息

| 项目 | 值 |
|-----|-----|
| Base URL | `/api/v1` |
| 认证方式 | Bearer Token (JWT) |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |

### 1.2 统一响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 1.3 错误码定义

| 错误码 | HTTP状态码 | 说明 |
|-------|-----------|------|
| AUTH_001 | 401 | 未登录 |
| AUTH_002 | 401 | Token过期 |
| AUTH_003 | 403 | 权限不足 |
| USER_001 | 400 | 用户已存在 |
| USER_002 | 404 | 用户不存在 |
| QUOTA_001 | 403 | 额度不足 |
| QUOTA_002 | 403 | 并发任务数已达上限 |
| TASK_001 | 404 | 任务不存在 |
| TASK_002 | 400 | 任务状态不允许此操作 |
| ASSET_001 | 404 | 素材不存在 |
| PROJECT_001 | 404 | 项目不存在 |
| AI_001 | 500 | AI服务调用失败 |
| AI_002 | 504 | AI服务超时 |

---

## 二、认证接口

### 2.1 用户注册

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nickname": "创作者"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "user@example.com",
      "nickname": "创作者",
      "createdAt": "2026-03-06T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "quota": {
      "imageCount": 10,
      "videoSeconds": 30,
      "storageBytes": 1073741824
    }
  }
}
```

### 2.2 用户登录

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### 2.3 刷新Token

```http
POST /auth/refresh
Authorization: Bearer {token}
```

### 2.4 获取当前用户

```http
GET /auth/me
Authorization: Bearer {token}
```

---

## 三、用户接口

### 3.1 获取用户资料

```http
GET /users/me
Authorization: Bearer {token}
```

### 3.2 更新用户资料

```http
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "https://..."
}
```

### 3.3 获取用户额度

```http
GET /users/me/quota
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "imageCount": 128,
    "videoSeconds": 300,
    "storageBytes": 5368709120,
    "storageUsed": 1073741824,
    "maxConcurrent": 5,
    "currentTasks": 2,
    "expiresAt": "2026-04-06T00:00:00Z"
  }
}
```

---

## 四、项目接口

### 4.1 创建项目

```http
POST /projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "我的第一个短片",
  "description": "一个关于城市的故事"
}
```

### 4.2 获取项目列表

```http
GET /projects?page=1&pageSize=20&status=DRAFT
Authorization: Bearer {token}
```

### 4.3 获取项目详情

```http
GET /projects/:id
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "clx456def",
    "name": "我的第一个短片",
    "description": "一个关于城市的故事",
    "cover": "https://...",
    "status": "DRAFT",
    "workflow": {
      "nodes": [...],
      "edges": [...]
    },
    "timeline": {
      "tracks": [...],
      "duration": 30
    },
    "assets": [...],
    "createdAt": "2026-03-06T10:00:00Z",
    "updatedAt": "2026-03-06T12:00:00Z"
  }
}
```

### 4.4 更新项目

```http
PATCH /projects/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "新名称",
  "workflow": { ... },
  "timeline": { ... }
}
```

### 4.5 删除项目

```http
DELETE /projects/:id
Authorization: Bearer {token}
```

---

## 五、素材接口

### 5.1 获取素材列表

```http
GET /assets?type=IMAGE&projectId=xxx&page=1&pageSize=20
Authorization: Bearer {token}
```

### 5.2 上传素材

```http
POST /assets/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
type: IMAGE
projectId: xxx (可选)
```

### 5.3 获取上传凭证（直传OSS）

```http
POST /assets/upload-token
Authorization: Bearer {token}
Content-Type: application/json

{
  "filename": "my-image.png",
  "type": "IMAGE",
  "projectId": "xxx"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://oss.example.com/...",
    "assetId": "clx789ghi",
    "expiresIn": 3600
  }
}
```

### 5.4 确认上传完成

```http
POST /assets/:id/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "metadata": {
    "width": 1920,
    "height": 1080
  }
}
```

### 5.5 删除素材

```http
DELETE /assets/:id
Authorization: Bearer {token}
```

---

## 六、AI 生成接口

### 6.1 生成图片

```http
POST /ai/generate/image
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "一个繁华的城市街道，夕阳西下，电影感",
  "negativePrompt": "模糊，低质量",
  "imageSize": "1K",
  "aspectRatio": "16:9",
  "referenceImage": "https://... (可选)",
  "referenceStrength": 0.7,
  "projectId": "xxx (可选)",
  "saveToProject": true
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "taskId": "task123",
    "status": "PENDING",
    "estimatedTime": 15
  }
}
```

### 6.2 生成视频（文生视频）

```http
POST /ai/generate/video/text
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "镜头缓缓推进，城市街道上人来人往",
  "resolution": "1080p",
  "duration": 5,
  "generateAudio": true,
  "projectId": "xxx (可选)"
}
```

### 6.3 生成视频（图生视频）

```http
POST /ai/generate/video/image
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstFrame": "https://... 或 assetId",
  "prompt": "人物缓缓转身，微笑",
  "resolution": "1080p",
  "duration": 5,
  "generateAudio": true,
  "projectId": "xxx (可选)"
}
```

### 6.4 生成视频（首尾帧）

```http
POST /ai/generate/video/frames
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstFrame": "https://... 或 assetId",
  "lastFrame": "https://... 或 assetId",
  "prompt": "从白天过渡到黄昏",
  "resolution": "1080p",
  "duration": 8,
  "generateAudio": true,
  "projectId": "xxx (可选)"
}
```

---

## 七、任务接口

### 7.1 获取任务状态

```http
GET /tasks/:id
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "task123",
    "type": "IMAGE_GEN",
    "status": "COMPLETED",
    "progress": 100,
    "result": {
      "assetId": "asset456",
      "url": "https://...",
      "thumbnail": "https://..."
    },
    "createdAt": "2026-03-06T10:00:00Z",
    "completedAt": "2026-03-06T10:00:15Z"
  }
}
```

### 7.2 获取任务列表

```http
GET /tasks?status=RUNNING&projectId=xxx
Authorization: Bearer {token}
```

### 7.3 取消任务

```http
POST /tasks/:id/cancel
Authorization: Bearer {token}
```

### 7.4 WebSocket 任务通知

```javascript
// 连接
ws://api.example.com/ws?token=xxx

// 消息格式
{
  "type": "TASK_UPDATE",
  "data": {
    "taskId": "task123",
    "status": "COMPLETED",
    "progress": 100,
    "result": { ... }
  }
}
```

---

## 八、工作流接口

### 8.1 保存工作流

```http
PUT /projects/:id/workflow
Authorization: Bearer {token}
Content-Type: application/json

{
  "nodes": [
    {
      "id": "node1",
      "type": "INPUT",
      "position": { "x": 100, "y": 100 },
      "data": { "prompt": "..." }
    },
    {
      "id": "node2",
      "type": "IMAGE_GEN",
      "position": { "x": 300, "y": 100 },
      "data": { ... }
    }
  ],
  "edges": [
    { "source": "node1", "target": "node2" }
  ]
}
```

### 8.2 执行工作流

```http
POST /projects/:id/workflow/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "startNode": "node1",
  "inputs": {
    "node1": { "prompt": "..." }
  }
}
```

### 8.3 获取工作流执行状态

```http
GET /projects/:id/workflow/execution/:executionId
Authorization: Bearer {token}
```

---

## 九、时间线接口

### 9.1 保存时间线

```http
PUT /projects/:id/timeline
Authorization: Bearer {token}
Content-Type: application/json

{
  "tracks": [
    {
      "id": "track1",
      "type": "VIDEO",
      "clips": [
        {
          "id": "clip1",
          "assetId": "asset123",
          "startTime": 0,
          "duration": 5,
          "trimStart": 0,
          "trimEnd": 5
        }
      ]
    },
    {
      "id": "track2",
      "type": "AUDIO",
      "clips": [...]
    }
  ],
  "duration": 30
}
```

### 9.2 预览时间线

```http
POST /projects/:id/timeline/preview
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "previewUrl": "https://...",
    "expiresIn": 300
  }
}
```

---

## 十、导出接口

### 10.1 创建导出任务

```http
POST /projects/:id/export
Authorization: Bearer {token}
Content-Type: application/json

{
  "format": "mp4",
  "resolution": "1080p",
  "quality": "high"
}
```

### 10.2 获取导出状态

```http
GET /exports/:id
Authorization: Bearer {token}
```

### 10.3 下载导出文件

```http
GET /exports/:id/download
Authorization: Bearer {token}
```

---

## 十一、Webhook 接口

### 11.1 配置 Webhook

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["TASK_COMPLETED", "EXPORT_COMPLETED"],
  "secret": "your-webhook-secret"
}
```

### 11.2 Webhook 载荷

```json
{
  "event": "TASK_COMPLETED",
  "timestamp": "2026-03-06T10:00:15Z",
  "data": {
    "taskId": "task123",
    "type": "IMAGE_GEN",
    "result": { ... }
  },
  "signature": "sha256=..."
}
```

---

*文档版本: v1.0*
*最后更新: 2026-03-06*
