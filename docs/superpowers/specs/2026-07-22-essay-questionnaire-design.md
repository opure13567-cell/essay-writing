# 写作助手 - 交互式问卷重构设计

## 概述

将现有"粘贴文本框"式写作助手，改造为**交互式选择题问卷工作流**，用户逐题作答后AI自动生成符合格式要求的完整报告。首期面向"形势与政策"课程《我的家风家训》社会调查报告。

## 核心改动

### 1. 问卷工作流引擎

**新建：** `src/components/QuestionFlow.jsx`

- 通用问卷渲染引擎，接收 JSON 配置，逐题展示
- 支持题型：单选题（按钮选择）、文本输入题、下拉选择题
- 每次只显示一题，带进度条
- 用户可返回修改之前的答案
- 支持多阶段：个人信息阶段 → 素材收集阶段

**问卷配置文件：** `src/data/questionnaires/`

- `family-tradition.js` — 家风家训问卷
- `hometown-change.js` — 家乡变迁问卷（备选）
- 每种问卷导出 `{ stages, questions }` 结构

### 2. AI 生成引擎改造

**新建：** `api/lib/templates/`

- `family-tradition.js` — 家风家训完整提示词模板
- 模板包含：报告结构、排版规范、字数分配、答案插入点
- 生成约束：约5000字、宋体格式说明、结构完整

**改造：** `api/lib/ai.js`

- `generateEssay()` → 接收问卷答案 + 模板名，而非原始描述
- `max_tokens` 提升至 10000（5000字中文需要）
- 支持文件命名：`学号+姓名.docx`

### 3. 页面改造

| 页面 | 改前 | 改后 |
|------|------|------|
| Home | 定价卡片+"立即下单" | 作业类型选择卡片（家风家训/家乡变迁） |
| NewOrder | OrderForm（文本框+加急） | **替换为** QuestionFlow 问卷组件 |
| PayOrder | 收款码+上传截图 | 简化：统一定价¥5，保留支付确认 |
| OrderDetail | 状态+复制 | 增强：展示完整报告 + 一键复制 + 下载提示 |
| Admin | 手动触发生成 | AI自动生成，管理员只审核 |

### 4. 定价简化

- 旧：按字数分档（¥2/¥5/¥10）+ 加急×1.5，封顶¥30
- 新：**统一 ¥5/篇**

## 数据模型

### 问卷答案 JSON（替代原 `description` 字段）

```json
{
  "assignment_type": "family_tradition",
  "personal_info": {
    "name": "张三",
    "school": "XX大学",
    "college": "XX学院",
    "major": "计算机科学",
    "grade": "2025级",
    "class": "1班",
    "student_id": "20250001",
    "title": ""
  },
  "answers": {
    "interviewee": "parents",
    "red_background": "party_member",
    "core_value": "education",
    "artifacts": "photos_certs",
    "has_story": "yes_detailed",
    "tone": "elevated"
  },
  "custom_notes": ""
}
```

### 订单表（Supabase）不动

`description` 字段改为存 JSON 字符串，兼容旧订单。

## 家风家训问卷内容

### 第一阶段：个人信息（7题，文本输入）

1. 姓名
2. 学校/学院
3. 专业
4. 年级（选择：2024级/2025级/其他）
5. 班级
6. 学号
7. 报告标题（可自拟，可留空由AI代拟）

### 第二阶段：家风素材（6题，单选）

1. 主要访谈对象？A.父母都健谈 B.主要靠妈妈 C.主要靠爸爸 D.需祖辈参与
2. 家族红色背景？A.党员 B.军人 C.基层干部 D.劳模 E.创业奋斗 F.普通
3. 父母最常念叨的？A.诚实守信 B.吃苦耐劳 C.读书改变命运 D.家和万事兴 E.吃亏是福
4. 有实物佐证吗？A.有老物件/奖章 B.有照片证书 C.基本没有 D.不确定
5. 有具体故事吗？A.有详细故事 B.大概印象 C.没什么 D.不确定
6. 写作风格偏好？A.朴实真诚 B.立意高远 C.折中

## 生成报告结构

```
标题（自拟或AI代拟，宋体三号加粗）
个人信息（姓名、学院、专业、年级、班级、学号）
摘要（200字，楷体小四号）
关键词（3-5个，楷体小四号）
正文（宋体四号，固定行距25）：
  一、引言（~500字）
  二、家风溯源——祖辈篇（~1000字）
  三、家风传承——父辈篇（~1200字）
  四、家风践行——自我篇（~800字）
  五、时代升华（~800字）
  六、结语（~300字）
附录（访谈提纲、调查问卷）
```

## 技术要点

- **前端**：React 18 + TailwindCSS + Vite，不动现有技术栈
- **AI**：DeepSeek API（已有key），`max_tokens: 10000`
- **后端**：Vercel serverless functions，不动架构
- **文件命名**：`学号+姓名.docx` 由前端拼接文件名提示
- **问题组件**：纯受控组件，状态提升到 QuestionFlow，每一步存储答案

## 文件改动清单

### 新建
- `src/data/questionnaires/family-tradition.js`
- `src/data/questionnaires/hometown-change.js`
- `src/components/QuestionFlow.jsx`
- `src/components/PersonalInfoForm.jsx`
- `src/components/ChoiceQuestion.jsx`
- `api/lib/templates/family-tradition.js`

### 修改
- `src/pages/Home.jsx` — 改为作业类型选择
- `src/pages/NewOrder.jsx` — 改用 QuestionFlow
- `src/pages/PayOrder.jsx` — 统一定价¥5
- `src/pages/OrderDetail.jsx` — 增强展示
- `api/lib/ai.js` — 支持问卷答案+模板
- `api/orders.js` — 适配JSON格式description
- `api/admin.js` — generate接口传入问卷答案

### 删除
- `src/components/OrderForm.jsx` — 被 QuestionFlow 替代
