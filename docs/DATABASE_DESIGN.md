# AI Filmmaker Studio - 数据库设计文档

> **版本**: v1.0
> **创建日期**: 2026-03-06

---

## 一、数据库概述

### 1.1 技术选型

| 组件     | 技术           | 说明                 |
| -------- | -------------- | -------------------- |
| 主数据库 | PostgreSQL 15+ | 关系型数据存储       |
| ORM      | Prisma         | 类型安全的数据库访问 |
| 缓存     | Redis 7+       | 会话、缓存、任务队列 |
| 文件存储 | OSS/MinIO      | 图片、视频文件存储   |

### 1.2 数据库命名规范

- 表名：小写下划线（snake_case），复数形式
- 字段名：小写下划线（snake_case）
- 索引：`idx_{表名}_{字段名}`
- 外键：`fk_{表名}_{关联表名}`

---

## 二、ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Quota    │       │ Subscription│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │   ┌───│ id          │
│ email       │   │   │ userId      │◀──┘   │ userId      │
│ phone       │   │   │ imageCount  │       │ planId      │
│ password    │   │   │ videoSeconds│       │ status      │
│ nickname    │   │   │ storageBytes│       │ startDate   │
│ avatar      │   │   │ ...         │       │ endDate     │
│ role        │   │   └─────────────┘       └─────────────┘
│ ...         │   │
└─────────────┘   │
      │           │
      │           │
      ▼           │
┌─────────────┐   │
│   Project   │   │
├─────────────┤   │
│ id          │◀──┘
│ userId      │
│ name        │──────────────┐
│ description │              │
│ cover       │              │
│ status      │              │
│ workflow    │              │
│ timeline    │              │
└─────────────┘              │
      │                      │
      │                      │
      ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Task     │       │    Asset    │       │   Export    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ userId      │       │ userId      │       │ projectId   │
│ projectId   │       │ projectId   │       │ format      │
│ type        │       │ type        │       │ resolution  │
│ status      │       │ name        │       │ url         │
│ params      │──────▶│ url         │       │ status      │
│ result      │       │ taskId      │◀──────│ ...         │
│ ...         │       │ ...         │       └─────────────┘
└─────────────┘       └─────────────┘
```

---

## 三、数据表设计

### 3.1 用户表 (users)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?   @unique
  password      String    // bcrypt hash
  nickname      String
  avatar        String?
  bio           String?   @db.Text

  // 角色
  role          UserRole  @default(USER)

  // 状态
  status        UserStatus @default(ACTIVE)
  emailVerified DateTime?
  phoneVerified DateTime?

  // 关联
  quota         Quota?
  subscriptions Subscription[]
  projects      Project[]
  assets        Asset[]
  tasks         Task[]
  apiKeys       ApiKey[]
  webhooks      Webhook[]

  // 时间戳
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  @@index([email])
  @@index([phone])
  @@index([createdAt])
}

enum UserRole {
  USER        // 普通用户
  CREATOR     // 创作者（付费用户）
  ENTERPRISE  // 企业用户
  ADMIN       // 管理员
}

enum UserStatus {
  ACTIVE      // 正常
  SUSPENDED   // 暂停
  BANNED      // 封禁
}
```

### 3.2 额度表 (quotas)

```prisma
model Quota {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 图片额度
  imageCount      Int       @default(0)    // 剩余图片生成次数
  imageUsed       Int       @default(0)    // 已使用次数
  imageTotal      Int       @default(10)   // 总额度

  // 视频额度（按秒计算）
  videoSeconds    Int       @default(0)    // 剩余视频秒数
  videoUsed       Int       @default(0)    // 已使用秒数
  videoTotal      Int       @default(30)   // 总秒数

  // 🎵 音乐额度（按秒计算）NEW!
  musicSeconds    Int       @default(0)    // 剩余音乐秒数
  musicUsed       Int       @default(0)    // 已使用秒数
  musicTotal      Int       @default(60)   // 总秒数

  // 存储额度
  storageBytes    Int       @default(0)    // 剩余存储空间
  storageUsed     Int       @default(0)    // 已使用空间
  storageTotal    Int       @default(1073741824) // 1GB

  // 并发限制
  maxConcurrent   Int       @default(1)    // 最大并发任务数

  // 订阅相关
  planType        PlanType  @default(FREE)
  expiresAt       DateTime?               // 过期时间

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([expiresAt])
}

enum PlanType {
  FREE        // 免费版
  BASIC       // 基础版
  PRO         // 专业版
  ENTERPRISE  // 企业版
}
```

### 3.3 订阅表 (subscriptions)

```prisma
model Subscription {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 订阅计划
  planId          String
  planName        String
  planType        PlanType

  // 订阅状态
  status          SubscriptionStatus @default(ACTIVE)

  // 时间
  startDate       DateTime
  endDate         DateTime
  cancelledAt     DateTime?

  // 付款信息
  paymentMethod   String?         // alipay, wechat, stripe
  paymentId       String?         // 第三方支付ID
  amount          Decimal         @db.Decimal(10, 2)
  currency        String          @default("CNY")

  // 自动续费
  autoRenew       Boolean         @default(false)
  nextBillingDate DateTime?

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([userId])
  @@index([status])
  @@index([endDate])
}

enum SubscriptionStatus {
  ACTIVE      // 活跃
  PAST_DUE    // 逾期
  CANCELLED   // 已取消
  EXPIRED     // 已过期
}
```

### 3.4 项目表 (projects)

```prisma
model Project {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 基本信息
  name        String
  description String?       @db.Text
  cover       String?       // 封面图URL

  // 状态
  status      ProjectStatus @default(DRAFT)

  // 工作流数据
  workflow    Json?         // React Flow 格式的工作流定义
  workflowVersion Int       @default(1)

  // 时间线数据
  timeline    Json?         // 时间线数据
  duration    Int           @default(0)  // 总时长（秒）

  // 统计
  assetCount  Int           @default(0)
  taskCount   Int           @default(0)

  // 设置
  settings    Json?         // 项目设置

  // 关联
  assets      Asset[]
  tasks       Task[]
  exports     Export[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum ProjectStatus {
  DRAFT       // 草稿
  IN_PROGRESS // 进行中
  COMPLETED   // 已完成
  ARCHIVED    // 已归档
}
```

### 3.5 素材表 (assets)

```prisma
model Asset {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 所属项目（可选）
  projectId   String?
  project     Project?    @relation(fields: [projectId], references: [id], onDelete: SetNull)

  // 素材类型
  type        AssetType

  // 基本信息
  name        String
  originalName String?    // 原始文件名

  // 存储信息
  url         String      // OSS URL
  thumbnail   String?     // 缩略图 URL
  fileSize    Int         // 文件大小（字节）
  mimeType    String?     // MIME类型

  // 元数据
  metadata    Json?       // 宽高、时长、帧率等
  /**
   * metadata 字段说明：
   *
   * 图片：
   * - width: 宽度
   * - height: 高度
   * - format: 格式 (png, jpg, webp)
   *
   * 视频：
   * - width: 宽度
   * - height: 高度
   * - duration: 时长（秒）
   * - fps: 帧率
   * - hasAudio: 是否有音频
   *
   * 🎵 音乐（NEW!）：
   * - duration: 时长（秒）
   * - title: 歌曲名称
   * - style: 风格标签数组 ["pop", "ballad"]
   * - mood: 情绪
   * - vocalGender: 人声性别 (m/f/null)
   * - instrumental: 是否纯音乐
   * - lyrics: 歌词（可选）
   * - model: 生成模型 (suno-v4/v4.5/v5)
   */

  // 来源
  source      AssetSource
  taskId      String?     // 如果是AI生成的，关联任务
  task        Task?       @relation(fields: [taskId], references: [id], onDelete: SetNull)

  // 标签
  tags        String[]    // 用户自定义标签

  // 状态
  isFavorite  Boolean     @default(false)
  isPublic    Boolean     @default(false)  // 是否公开

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  @@index([userId])
  @@index([projectId])
  @@index([type])
  @@index([source])
  @@index([createdAt])
}

enum AssetType {
  IMAGE       // 图片
  VIDEO       // 视频
  AUDIO       // 🎵 音频（NEW!）
}

enum AssetSource {
  GENERATE    // AI生成
  UPLOAD      // 用户上传
  EDIT        // 编辑产生
  IMPORT      // 外部导入
}
```

### 3.6 任务表 (tasks)

```prisma
model Task {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 所属项目（可选）
  projectId   String?
  project     Project?    @relation(fields: [projectId], references: [id], onDelete: SetNull)

  // 任务类型
  type        TaskType

  // 状态
  status      TaskStatus  @default(PENDING)
  progress    Int         @default(0)  // 0-100

  // 参数
  params      Json        // 任务输入参数

  // 结果
  result      Json?       // 任务输出结果
  error       String?     @db.Text

  // 资源消耗
  costImage   Int         @default(0)  // 消耗图片次数
  costVideo   Int         @default(0)  // 消耗视频秒数

  // 关联
  asset       Asset?

  // 时间
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  startedAt   DateTime?
  completedAt DateTime?
  expiresAt   DateTime?   // 任务过期时间

  @@index([userId])
  @@index([projectId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

enum TaskType {
  // 图片生成
  IMAGE_GEN_TEXT       // 文生图
  IMAGE_GEN_IMAGE      // 图生图

  // 视频生成
  VIDEO_GEN_TEXT       // 文生视频
  VIDEO_GEN_IMAGE      // 图生视频
  VIDEO_GEN_FRAMES     // 首尾帧生视频

  // 🎵 音乐生成（NEW!）
  MUSIC_GEN_SIMPLE     // 文生音乐（简单模式）
  MUSIC_GEN_CUSTOM     // 自定义歌词生成
  MUSIC_GEN_INSTRUMENTAL // 纯音乐生成

  // 编辑
  IMAGE_EDIT           // 图片编辑
  VIDEO_EDIT           // 视频编辑
  VIDEO_MERGE          // 视频合并

  // 导出
  PROJECT_EXPORT       // 项目导出
}

enum TaskStatus {
  PENDING     // 等待中
  QUEUED      // 已入队
  RUNNING     // 运行中
  COMPLETED   // 已完成
  FAILED      // 失败
  CANCELLED   // 已取消
  EXPIRED     // 已过期
}
```

### 3.7 导出表 (exports)

```prisma
model Export {
  id          String        @id @default(cuid())
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // 格式
  format      String        // mp4, webm, gif
  resolution  String        // 1080p, 720p, 480p
  quality     String        // high, medium, low

  // 结果
  url         String?       // 导出文件 URL
  fileSize    Int?          // 文件大小

  // 状态
  status      ExportStatus  @default(PENDING)
  progress    Int           @default(0)
  error       String?       @db.Text

  // 下载信息
  downloadCount Int         @default(0)
  expiresAt   DateTime?     // 下载链接过期时间

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([projectId])
  @@index([status])
}
```

### 3.8 API Key 表 (api_keys)

```prisma
model ApiKey {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 密钥信息
  name        String
  key         String      @unique  // API Key (前缀 + 随机字符串)
  keyHash     String              // 哈希后的密钥

  // 权限
  scopes      String[]    // 权限范围

  // 状态
  isActive    Boolean     @default(true)

  // 使用限制
  rateLimit   Int         @default(100)  // 每小时请求限制

  // 时间
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([key])
}
```

### 3.9 Webhook 表 (webhooks)

```prisma
model Webhook {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 端点信息
  name        String
  url         String
  secret      String      // 签名密钥

  // 事件
  events      String[]    // 订阅的事件类型

  // 状态
  isActive    Boolean     @default(true)

  // 统计
  successCount Int        @default(0)
  failCount   Int         @default(0)
  lastTriggeredAt DateTime?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
}
```

---

## 四、索引策略

### 4.1 主要索引

```sql
-- 用户查询
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 项目查询
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- 素材查询
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_source ON assets(source);

-- 任务查询
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
```

### 4.2 复合索引

```sql
-- 获取用户进行中的任务
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

-- 获取项目下的素材
CREATE INDEX idx_assets_project_type ON assets(project_id, type);

-- 查询即将过期的订阅
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date) WHERE status = 'ACTIVE';
```

---

## 五、数据迁移策略

### 5.1 初始迁移

```sql
-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('USER', 'CREATOR', 'ENTERPRISE', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
-- ... 其他枚举
```

### 5.2 种子数据

```typescript
// prisma/seed.ts

async function main() {
  // 创建默认计划
  const plans = [
    {
      name: '免费版',
      type: 'FREE',
      price: 0,
      imageCount: 10,
      videoSeconds: 30,
      storageGB: 1,
      maxConcurrent: 1,
    },
    // ... 其他计划
  ];

  for (const plan of plans) {
    await prisma.plan.create({data: plan});
  }
}
```

---

## 六、数据备份策略

### 6.1 备份频率

| 备份类型 | 频率          | 保留时间 |
| -------- | ------------- | -------- |
| 全量备份 | 每天凌晨 2:00 | 30 天    |
| 增量备份 | 每小时        | 7 天     |
| WAL 归档 | 实时          | 3 天     |

### 6.2 恢复测试

- 每周进行一次恢复测试
- 确保 RTO < 1 小时
- 确保 RPO < 5 分钟

---

_文档版本: v1.0_
_最后更新: 2026-03-06_
