# AI Filmmaker Studio - UI 设计文档

> **版本**: v1.0
> **创建日期**: 2026-03-06
> **设计系统**: design-system/ai-filmmaker-studio/MASTER.md

---

## 一、设计系统概览

### 1.1 设计风格

**风格名称**: Dark Mode (OLED) 暗黑电影风格

**设计理念**: 为专业影视创作者打造的深色主题界面，减少眼部疲劳，突出视觉内容，营造专业电影制作氛围。

**关键词**:

- 深色主题、高对比度、深黑、午夜蓝
- 护眼、OLED 优化、夜间模式
- 专业、创意工具、电影感

### 1.2 配色方案

| 角色               | 色值      | CSS 变量                 | 用途               |
| ------------------ | --------- | ------------------------ | ------------------ |
| **Primary**        | `#0F0F23` | `--color-primary`        | 主色调、品牌色     |
| **Secondary**      | `#1E1B4B` | `--color-secondary`      | 次要元素、卡片背景 |
| **CTA/Accent**     | `#E11D48` | `--color-cta`            | 行动按钮、强调元素 |
| **Background**     | `#000000` | `--color-background`     | 页面背景           |
| **Text Primary**   | `#F8FAFC` | `--color-text`           | 主要文字           |
| **Text Secondary** | `#94A3B8` | `--color-text-secondary` | 次要文字           |
| **Border**         | `#1E293B` | `--color-border`         | 边框、分割线       |
| **Success**        | `#22C55E` | `--color-success`        | 成功状态           |
| **Warning**        | `#F59E0B` | `--color-warning`        | 警告状态           |
| **Error**          | `#EF4444` | `--color-error`          | 错误状态           |

**配色说明**: 影院级深黑 + 播放红，突出内容的专业电影制作氛围

### 1.3 字体系统

**字体选择**: Inter

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

**字阶系统**:

| 级别    | 大小 | 行高 | 字重 | 用途     |
| ------- | ---- | ---- | ---- | -------- |
| Display | 48px | 1.1  | 700  | 首屏标题 |
| H1      | 36px | 1.2  | 700  | 页面标题 |
| H2      | 28px | 1.3  | 600  | 区块标题 |
| H3      | 22px | 1.4  | 600  | 卡片标题 |
| H4      | 18px | 1.4  | 600  | 小标题   |
| Body    | 16px | 1.5  | 400  | 正文     |
| Small   | 14px | 1.5  | 400  | 辅助文字 |
| Caption | 12px | 1.4  | 400  | 说明文字 |

### 1.4 间距系统

| Token         | 值   | 用途               |
| ------------- | ---- | ------------------ |
| `--space-xs`  | 4px  | 紧凑间距           |
| `--space-sm`  | 8px  | 图标间距、行内间距 |
| `--space-md`  | 16px | 标准内边距         |
| `--space-lg`  | 24px | 区块内边距         |
| `--space-xl`  | 32px | 大间距             |
| `--space-2xl` | 48px | 区块间距           |
| `--space-3xl` | 64px | 首屏内边距         |

### 1.5 阴影系统

| 级别            | 值                                | 用途               |
| --------------- | --------------------------------- | ------------------ |
| `--shadow-sm`   | `0 1px 2px rgba(0,0,0,0.3)`       | 轻微浮起           |
| `--shadow-md`   | `0 4px 6px rgba(0,0,0,0.4)`       | 卡片、按钮         |
| `--shadow-lg`   | `0 10px 15px rgba(0,0,0,0.5)`     | 弹窗、下拉菜单     |
| `--shadow-xl`   | `0 20px 25px rgba(0,0,0,0.6)`     | 首屏图片、特色卡片 |
| `--shadow-glow` | `0 0 20px rgba(225, 29, 72, 0.3)` | CTA 按钮发光效果   |

### 1.6 圆角系统

| Token           | 值     | 用途                 |
| --------------- | ------ | -------------------- |
| `--radius-sm`   | 4px    | 小元素（标签、徽章） |
| `--radius-md`   | 8px    | 按钮、输入框         |
| `--radius-lg`   | 12px   | 卡片                 |
| `--radius-xl`   | 16px   | 大卡片、弹窗         |
| `--radius-full` | 9999px | 圆形元素             |

---

## 二、组件规范

### 2.1 按钮

#### Primary Button（主要按钮）

```tsx
// 用于主要操作：生成、保存、导出等
<button className="btn-primary">生成视频</button>
```

```css
.btn-primary {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(225, 29, 72, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button（次要按钮）

```tsx
// 用于次要操作：取消、预览等
<button className="btn-secondary">预览</button>
```

```css
.btn-secondary {
  background: transparent;
  color: #f8fafc;
  border: 1px solid #1e293b;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: #1e293b;
  border-color: #334155;
}
```

#### Icon Button（图标按钮）

```tsx
// 用于工具栏操作
<button className="btn-icon" aria-label="添加">
  <PlusIcon />
</button>
```

```css
.btn-icon {
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #1e293b;
  color: #f8fafc;
}
```

### 2.2 卡片

#### 基础卡片

```tsx
<div className="card">
  <div className="card-header">
    <h3>场景 1</h3>
  </div>
  <div className="card-body">{/* 内容 */}</div>
</div>
```

```css
.card {
  background: #0f0f23;
  border: 1px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  transition: all 200ms ease;
}

.card:hover {
  border-color: #334155;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #1e293b;
}

.card-body {
  padding: 20px;
}
```

#### 素材卡片

```tsx
<div className="asset-card">
  <div className="asset-thumbnail">
    <img src="..." alt="场景预览" />
    <div className="asset-overlay">
      <button className="btn-icon">
        <PlayIcon />
      </button>
    </div>
  </div>
  <div className="asset-info">
    <span className="asset-name">城市黄昏.mp4</span>
    <span className="asset-meta">5秒 • 1080p</span>
  </div>
</div>
```

```css
.asset-card {
  background: #0f0f23;
  border: 1px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 200ms ease;
}

.asset-card:hover {
  border-color: #e11d48;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.asset-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
}

.asset-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 200ms ease;
}

.asset-card:hover .asset-overlay {
  opacity: 1;
}

.asset-info {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-name {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
}

.asset-meta {
  color: #64748b;
  font-size: 12px;
}
```

### 2.3 输入框

#### 文本输入

```tsx
<div className="input-group">
  <label className="input-label">提示词</label>
  <textarea className="input textarea" placeholder="描述你想要的画面..." />
</div>
```

```css
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
}

.input {
  background: #0f0f23;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px 16px;
  color: #f8fafc;
  font-size: 16px;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: #e11d48;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.2);
}

.input::placeholder {
  color: #475569;
}

.input.textarea {
  min-height: 120px;
  resize: vertical;
}
```

#### 选择器

```tsx
<div className="select-wrapper">
  <select className="select">
    <option value="1K">1K (1024px)</option>
    <option value="2K">2K (2048px)</option>
    <option value="4K">4K (4096px)</option>
  </select>
  <ChevronDownIcon className="select-icon" />
</div>
```

```css
.select-wrapper {
  position: relative;
}

.select {
  appearance: none;
  background: #0f0f23;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 12px 40px 12px 16px;
  color: #f8fafc;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.select:focus {
  outline: none;
  border-color: #e11d48;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}
```

### 2.4 进度条

```tsx
<div className="progress-bar">
  <div className="progress-fill" style={{ width: '65%' }} />
</div>
<span className="progress-text">生成中... 65%</span>
```

```css
.progress-bar {
  height: 8px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e11d48, #f43f5e);
  border-radius: 4px;
  transition: width 300ms ease;
}

.progress-text {
  color: #94a3b8;
  font-size: 14px;
}
```

### 2.5 标签页

```tsx
<div className="tabs">
  <button className="tab active">工作流</button>
  <button className="tab">时间线</button>
  <button className="tab">预览</button>
</div>
```

```css
.tabs {
  display: flex;
  border-bottom: 1px solid #1e293b;
  gap: 0;
}

.tab {
  background: transparent;
  border: none;
  padding: 12px 20px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 200ms ease;
}

.tab:hover {
  color: #f8fafc;
}

.tab.active {
  color: #f8fafc;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e11d48;
}
```

---

## 三、页面设计

### 3.1 首页（Landing Page）

#### 设计模式: Video-First Hero

**转化策略**: 86% 更高视频参与度。添加字幕以提高可访问性。压缩视频以优化性能。

**CTA 位置**: 视频覆盖层（中心/底部）+ 底部区块

**区块顺序**:

1. 视频背景首屏
2. 关键功能覆盖层
3. 优势区块
4. 行动号召

#### 首屏设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   [Logo]  AI Filmmaker Studio        [功能] [定价] [登录] [开始创作]│
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                                                             │  │
│   │                    [视频背景：AI 生成的短片片段]             │  │
│   │                                                             │  │
│   │          ╔═══════════════════════════════════════════╗      │  │
│   │          ║                                           ║      │  │
│   │          ║   用 AI 创作你的电影                      ║      │  │
│   │          ║   从创意到成片，一站式短片制作平台        ║      │  │
│   │          ║                                           ║      │  │
│   │          ║   [🎨 开始创作]    [观看演示 ▶]           ║      │  │
│   │          ║                                           ║      │  │
│   │          ╚═══════════════════════════════════════════╝      │  │
│   │                                                             │  │
│   │   暗色覆盖层 60% 透明度                                     │  │
│   │                                                             │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ↓ 滚动                                                            │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                      核心功能                               │  │
│   │                                                             │  │
│   │   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │  │
│   │   │ 🎨      │   │ 🎬      │   │ ✂️      │   │ 🎞️      │   │  │
│   │   │AI 生图  │   │AI 生视频│   │智能剪辑 │   │一键导出 │   │  │
│   │   │         │   │         │   │         │   │         │   │  │
│   │   │文生图   │   │文生视频 │   │时间线   │   │多种格式 │   │  │
│   │   │图生图   │   │图生视频 │   │编辑器   │   │高清输出 │   │  │
│   │   └─────────┘   └─────────┘   └─────────┘   └─────────┘   │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 工作台（Dashboard）

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  AI Filmmaker Studio                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  欢迎回来，创作者！                    [头像] [通知] [设置]│    │
│  │                                                            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │    │
│  │  │ 📊 额度  │ │ 🎬 项目  │ │ ⏱️ 任务  │                   │    │
│  │  │          │ │          │ │          │                   │    │
│  │  │ 图片: 128│ │ 进行中: 3│ │ 运行中: 2│                   │    │
│  │  │ 视频: 5分│ │ 已完成:12│ │ 队列: 5  │                   │    │
│  │  └──────────┘ └──────────┘ └──────────┘                   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  我的项目                              [+ 新建项目]        │    │
│  │                                                            │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │    │
│  │  │[缩略图] │  │[缩略图] │  │[缩略图] │  │[缩略图] │      │    │
│  │  │         │  │         │  │         │  │         │      │    │
│  │  │城市故事 │  │产品展示 │  │品牌短片 │  │实验动画 │      │    │
│  │  │进行中   │  │已完成   │  │草稿     │  │已完成   │      │    │
│  │  │3天前    │  │1周前    │  │2周前    │  │1月前    │      │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  最近任务                                                  │    │
│  │                                                            │    │
│  │  ● 图生视频 - 场景3动画     ████████████░░░░  75%  [查看]│    │
│  │  ● 文生图 - 主角形象        ████████████████  完成  [查看]│    │
│  │  ○ 视频导出 - 完整短片      ░░░░░░░░░░░░░░░░  队列中      │    │
│  │                                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 生图界面

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  AI Filmmaker Studio    [工作台] [素材库]          [头像]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐│
│  │       创作面板                   │  │     预览区               ││
│  │                                  │  │                          ││
│  │  提示词                          │  │  ┌────────────────────┐  ││
│  │  ┌────────────────────────────┐  │  │  │                    │  ││
│  │  │ 一个繁忙的城市街道，夕阳   │  │  │  │                    │  ││
│  │  │ 西下，电影感，温暖的光线   │  │  │  │   [生成的图片]     │  ││
│  │  │ 铺在建筑上...             │  │  │  │                    │  ││
│  │  └────────────────────────────┘  │  │  │                    │  ││
│  │                                  │  │  └────────────────────┘  ││
│  │  负向提示词（可选）              │  │                          ││
│  │  ┌────────────────────────────┐  │  │  [下载] [收藏] [编辑]   ││
│  │  │ 模糊，低质量，变形         │  │  │  [生成视频]             ││
│  │  └────────────────────────────┘  │  │                          ││
│  │                                  │  └──────────────────────────┘│
│  │  ──────────────────────────────│                              │
│  │                                  │  ┌──────────────────────────┐│
│  │  参考图（可选）                  │  │     历史记录             ││
│  │  ┌────────────────────────────┐  │  │                          ││
│  │  │   [拖拽上传或点击选择]     │  │  │  ┌────┐ ┌────┐ ┌────┐  ││
│  │  │                            │  │  │  │    │ │    │ │    │  ││
│  │  └────────────────────────────┘  │  │  └────┘ └────┘ └────┘  ││
│  │                                  │  │                          ││
│  │  ──────────────────────────────│  └──────────────────────────┘│
│  │                                  │                              │
│  │  生成设置                        │                              │
│  │  ┌─────────────────────────────┐│                              │
│  │  │ 分辨率:  [1K ▼]             ││                              │
│  │  │ 宽高比:  [16:9 ▼]           ││                              │
│  │  │ 风格:    [电影感 ▼]         ││                              │
│  │  └─────────────────────────────┘│                              │
│  │                                  │                              │
│  │  ┌────────────────────────────┐  │                              │
│  │  │      🎨 生成图片            │  │                              │
│  │  └────────────────────────────┘  │                              │
│  │                                  │                              │
│  │  剩余额度: 128 张               │                              │
│  └──────────────────────────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.4 工作流编辑器

```
┌─────────────────────────────────────────────────────────────────────┐
│  项目: 城市故事               [工作流] [时间线] [预览]    [导出 ▼] │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐                                                    │
│  │  节点库   │    ┌──────────────────────────────────────────────┐ │
│  │           │    │                                              │ │
│  │  📝 输入   │    │      ┌───────┐                              │ │
│  │  🎨 生图   │    │      │ 输入  │                              │ │
│  │  🎬 生视频 │    │      │故事板 │                              │ │
│  │  ✂️ 编辑   │    │      └───┬───┘                              │ │
│  │  🎵 音频   │    │          │                                  │ │
│  │  🔗 合并   │    │    ┌─────┴─────┐                            │ │
│  │  📤 导出   │    │    ▼           ▼                            │ │
│  │           │    │ ┌───────┐ ┌───────┐                          │ │
│  │  ───────  │    │ │ 生图1 │ │ 生图2 │                          │ │
│  │  预设     │    │ │场景A  │ │场景B  │                          │ │
│  │  ▫ 场景   │    │ └───┬───┘ └───┬───┘                          │ │
│  │  ▫ 转场   │    │     │         │                              │ │
│  │  ▫ 片头   │    │     ▼         ▼                              │ │
│  │  ▫ 片尾   │    │ ┌───────┐ ┌───────┐                          │ │
│  │           │    │ │生视频 │ │生视频 │                          │ │
│  │           │    │ │场景A  │ │场景B  │                          │ │
│  │           │    │ └───┬───┘ └───┬───┘                          │ │
│  │           │    │     │         │                              │ │
│  │           │    │     └────┬────┘                              │ │
│  │           │    │          ▼                                   │ │
│  │           │    │     ┌───────┐                                │ │
│  │           │    │     │ 合并  │                                │ │
│  │           │    │     └───┬───┘                                │ │
│  │           │    │         ▼                                    │ │
│  │           │    │     ┌───────┐                                │ │
│  │           │    │     │ 导出  │                                │ │
│  │           │    │     └───────┘                                │ │
│  │           │    │                                              │ │
│  └───────────┘    └──────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  节点属性: 生图1 - 场景A                             [×]    │  │
│  │  ──────────────────────────────────────────────────────────│  │
│  │  提示词: [一个繁忙的城市街道，夕阳西下...]                  │  │
│  │  分辨率: [1K ▼]    宽高比: [16:9 ▼]                        │  │
│  │                                               [应用更改]    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 时间线编辑器

```
┌─────────────────────────────────────────────────────────────────────┐
│  项目: 城市故事               [工作流] [时间线] [预览]    [导出 ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                          预览窗口                              ││
│  │                                                                ││
│  │                     [视频预览区域]                             ││
│  │                       16:9                                    ││
│  │                                                                ││
│  │  ◀◀  ◀  ▶  ▶▶      00:00:05 / 00:00:30      🔊 ────●        ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │  时间线                                    [+] 添加轨道       ││
│  ├────────────────────────────────────────────────────────────────┤│
│  │  🎬 视频  │████████│████████│      │████████████│             ││
│  │           │ 场景A  │ 场景B  │      │   场景C    │             ││
│  │           │ 0-5秒  │ 5-10秒 │      │  15-25秒   │             ││
│  ├────────────────────────────────────────────────────────────────┤│
│  │  🎵 音频  │████████████████████████████████████████│          ││
│  │           │           背景音乐                      │          ││
│  ├────────────────────────────────────────────────────────────────┤│
│  │  📝 字幕  │        │████████│          │████████│             ││
│  │           │        │ 字幕1  │          │ 字幕2  │             ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  缩放: [━━━━●━━━━━━━]  网格: [1秒 ▼]    时间: 00:00:05            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 四、响应式设计

### 4.1 断点

| 断点    | 宽度            | 用途     |
| ------- | --------------- | -------- |
| Mobile  | < 768px         | 移动设备 |
| Tablet  | 768px - 1024px  | 平板     |
| Desktop | 1024px - 1440px | 桌面     |
| Large   | > 1440px        | 大屏     |

### 4.2 响应式布局

```css
/* Mobile First */
.container {
  padding: 0 16px;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 0 24px;
    max-width: 768px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 0 32px;
    max-width: 1200px;
  }
}

/* Large */
@media (min-width: 1440px) {
  .container {
    max-width: 1440px;
  }
}
```

---

## 五、动画规范

### 5.1 过渡时间

| 类型   | 时长      | 用途               |
| ------ | --------- | ------------------ |
| Fast   | 150ms     | 按钮悬停、焦点状态 |
| Normal | 200-300ms | 卡片悬停、模态框   |
| Slow   | 400-500ms | 页面过渡、大型动画 |

### 5.2 缓动函数

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 5.3 减少动画

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 六、图标规范

### 6.1 图标库

使用 **Lucide Icons** 或 **Heroicons**

```tsx
import {Play, Pause, Plus, Trash2, Download, Upload, Settings, ChevronDown, X, Check, Loader2} from 'lucide-react';
```

### 6.2 图标大小

| 大小 | 像素 | 用途     |
| ---- | ---- | -------- |
| sm   | 16px | 行内图标 |
| md   | 20px | 按钮图标 |
| lg   | 24px | 导航图标 |
| xl   | 32px | 功能图标 |

---

## 七、可访问性

### 7.1 对比度

- 主要文字与背景：≥ 7:1 (WCAG AAA)
- 次要文字与背景：≥ 4.5:1 (WCAG AA)
- CTA 按钮与背景：≥ 3:1

### 7.2 焦点状态

```css
:focus-visible {
  outline: 2px solid #e11d48;
  outline-offset: 2px;
}
```

### 7.3 键盘导航

- Tab: 顺序导航
- Enter/Space: 激活按钮
- Escape: 关闭模态框
- Arrow keys: 列表导航

---

## 八、设计交付清单

### 8.1 每次交付前检查

- [ ] 未使用 emoji 作为图标（使用 SVG: Heroicons/Lucide）
- [ ] 所有可点击元素有 `cursor: pointer`
- [ ] 悬停状态有平滑过渡 (150-300ms)
- [ ] 文字对比度 ≥ 4.5:1
- [ ] 焦点状态可见
- [ ] 支持 `prefers-reduced-motion`
- [ ] 响应式支持 375px, 768px, 1024px, 1440px
- [ ] 内容未被固定导航栏遮挡
- [ ] 移动端无横向滚动

### 8.2 避免的反模式

- ❌ 使用 emoji 作为图标
- ❌ 可点击元素缺少 `cursor: pointer`
- ❌ 悬停导致布局偏移
- ❌ 低对比度文字
- ❌ 瞬间状态变化（无过渡）
- ❌ 不可见的焦点状态
- ❌ 音频播放器设计不佳
- ❌ 布局杂乱

---

_文档版本: v1.0_
_最后更新: 2026-03-06_
_设计系统: design-system/ai-filmmaker-studio/MASTER.md_
