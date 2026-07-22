# 交互式问卷重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将写作助手从"粘贴文本框"改造为交互式选择题问卷工作流，首期面向《我的家风家训》社会调查报告。

**Architecture:** 前端新增 QuestionFlow 通用问卷引擎（逐题渲染，支持文本输入和单选题），问卷配置独立文件；后端新增结构化AI模板，接收问卷JSON生成符合排版规范的5000字报告；统一定价¥5。

**Tech Stack:** React 18 + TailwindCSS + Vite + React Router DOM v6 · DeepSeek API · Supabase · Vercel serverless functions

## Global Constraints

- 不动现有技术栈和Supabase表结构
- `description` 字段改存问卷JSON字符串，兼容旧订单
- 统一定价 ¥5/篇
- DeepSeek `max_tokens` 提升至 10000
- 报告格式：标题宋体三号加粗、摘要关键词楷体小四号、正文宋体四号、行距25、页边距2.5
- 文件命名规范：学号+姓名.docx

## File Structure Map

| 文件 | 职责 | 状态 |
|------|------|------|
| `src/data/questionnaires/family-tradition.js` | 家风家训问卷配置（题目、选项、标签） | 新建 |
| `src/components/ChoiceQuestion.jsx` | 单选题组件——渲染选项按钮，点击选中 | 新建 |
| `src/components/PersonalInfoForm.jsx` | 个人信息表单——文本输入+下拉选择 | 新建 |
| `src/components/QuestionFlow.jsx` | 问卷引擎——分阶段逐题展示、进度条、导航 | 新建 |
| `src/components/PriceTag.jsx` | 价格标签（保留，简化） | 修改 |
| `api/lib/templates/family-tradition.js` | 家风家训AI提示词模板函数 | 新建 |
| `src/pages/Home.jsx` | 首页——作业类型选择卡片 | 修改 |
| `src/pages/NewOrder.jsx` | 下单页——加载QuestionFlow，提交问卷答案 | 修改 |
| `src/pages/PayOrder.jsx` | 付款页——统一定价¥5 | 修改 |
| `src/pages/OrderDetail.jsx` | 订单详情——增强报告展示 | 修改 |
| `api/lib/ai.js` | AI调用——支持问卷答案+模板+10000 tokens | 修改 |
| `api/orders.js` | 订单API——适配问卷数据 | 修改 |
| `api/admin.js` | 管理后台API——自动触发生成 | 修改 |
| `src/components/OrderForm.jsx` | 旧表单 | 删除 |

---

### Task 1: 创建家风家训问卷配置文件

**Files:**
- Create: `src/data/questionnaires/family-tradition.js`

**Interfaces:**
- Produces: `export const familyTraditionQuestionnaire` — `{ id, name, description, stages: Stage[] }`

- [ ] **Step 1: 创建目录并写入问卷配置**

```bash
mkdir -p src/data/questionnaires
```

- [ ] **Step 2: 写入完整问卷配置**

```js
// src/data/questionnaires/family-tradition.js

export const familyTraditionQuestionnaire = {
  id: 'family_tradition',
  name: '我的家风家训',
  description: '形势与政策课程社会调查报告 · 约5000字',
  stages: [
    {
      id: 'personal_info',
      title: '个人信息',
      description: '以下信息将用于报告封面，请如实填写',
      questions: [
        {
          id: 'name',
          type: 'text',
          label: '姓名',
          placeholder: '请输入你的姓名',
          required: true,
        },
        {
          id: 'school',
          type: 'text',
          label: '学校/学院',
          placeholder: '如：XX大学XX学院',
          required: true,
        },
        {
          id: 'major',
          type: 'text',
          label: '专业',
          placeholder: '请输入你的专业全称',
          required: true,
        },
        {
          id: 'grade',
          type: 'select',
          label: '年级',
          options: ['2024级', '2025级', '2026级', '其他'],
          required: true,
        },
        {
          id: 'class_name',
          type: 'text',
          label: '班级',
          placeholder: '如：1班',
          required: true,
        },
        {
          id: 'student_id',
          type: 'text',
          label: '学号',
          placeholder: '用于文件命名（学号+姓名）',
          required: true,
        },
        {
          id: 'title',
          type: 'text',
          label: '报告标题',
          placeholder: '可自拟，留空则由AI自动生成',
          required: false,
        },
      ],
    },
    {
      id: 'family_materials',
      title: '家风素材',
      description: '请根据你的家庭情况，选择最接近的选项',
      questions: [
        {
          id: 'interviewee',
          type: 'choice',
          label: '你的主要访谈对象是？',
          options: [
            { value: 'parents', label: '父母都健谈，能讲出不少故事和道理' },
            { value: 'mother', label: '主要靠妈妈，妈妈对家族的事记得更清楚' },
            { value: 'father', label: '主要靠爸爸，爸爸有比较清晰的家族记忆' },
            { value: 'grandparents', label: '需要祖辈参与，爷爷奶奶/外公外婆才有真正的家族故事' },
          ],
        },
        {
          id: 'red_background',
          type: 'choice',
          label: '家族中是否有以下背景？（选最接近的一项）',
          options: [
            { value: 'party_member', label: '党员/党务工作者——有人是中共党员或担任过党务工作' },
            { value: 'military', label: '军人/军属——有亲人参过军、当过兵' },
            { value: 'public_servant', label: '基层干部/公职人员——在政府、村委会、学校、医院等单位工作' },
            { value: 'model_worker', label: '劳动模范/先进工作者——获过表彰或行业内有突出贡献' },
            { value: 'entrepreneur', label: '创业/奋斗典型——经历改革开放、下岗再就业、白手起家' },
            { value: 'ordinary', label: '普通劳动者——没有特别突出的标签，但勤勤恳恳' },
          ],
        },
        {
          id: 'core_value',
          type: 'choice',
          label: '父母最常念叨你的那句话是？',
          options: [
            { value: 'honesty', label: '做人要诚实/老实——诚信为本' },
            { value: 'hardwork', label: '吃得苦中苦，方为人上人——吃苦耐劳' },
            { value: 'education', label: '多读书才有出息/知识改变命运——崇文重教' },
            { value: 'harmony', label: '家和万事兴/一家人要团结——和睦孝悌' },
            { value: 'tolerance', label: '吃亏是福/别跟人计较——宽厚忍让' },
          ],
        },
        {
          id: 'artifacts',
          type: 'choice',
          label: '家里有没有保留一些"实物证据"？',
          options: [
            { value: 'heirlooms', label: '有老物件/奖章/军功章——至少1-2件有分量的' },
            { value: 'photos_certs', label: '有一些照片/证书——如党费证、毕业照、工作照' },
            { value: 'none', label: '基本没有——没刻意保留过这类东西' },
            { value: 'unsure', label: '不确定——需要回家翻翻看' },
          ],
        },
        {
          id: 'has_story',
          type: 'choice',
          label: '关于"家风传承"，你家里有具体的转折性故事吗？',
          options: [
            { value: 'detailed', label: '有详细故事——比如祖辈/父辈靠读书走出农村、或因为没文化留下遗憾' },
            { value: 'vague', label: '有大概印象——知道是这么回事，但细节模糊' },
            { value: 'none', label: '没什么特别的故事——就是单纯觉得读书/诚实/勤奋重要' },
            { value: 'unsure', label: '不确定——需要回去跟父母聊了才知道' },
          ],
        },
        {
          id: 'tone',
          type: 'choice',
          label: '你希望报告的写作风格是？',
          options: [
            { value: 'plain', label: '朴实真诚——平实语言讲真实故事，不刻意拔高' },
            { value: 'elevated', label: '立意高远——更多呼应中华传统美德、红色家风、核心价值观' },
            { value: 'balanced', label: '折中——以真实故事为主体，关键处自然升华' },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 3: 验证文件语法正确**

```bash
node -e "import('./src/data/questionnaires/family-tradition.js').then(m => console.log(JSON.stringify(m.familyTraditionQuestionnaire.stages.length, null, 2)))"
```

Expected: `2`（两个阶段）

- [ ] **Step 4: Commit**

```bash
git add src/data/questionnaires/family-tradition.js
git commit -m "feat: add family tradition questionnaire config"
```

---

### Task 2: 创建单选题组件 ChoiceQuestion

**Files:**
- Create: `src/components/ChoiceQuestion.jsx`

**Interfaces:**
- Consumes: 问卷配置中的 question 对象（含 `label`, `options` 数组）
- Produces: `<ChoiceQuestion>` 组件 — `{ question, value, onSelect }`

- [ ] **Step 1: 写入组件**

```jsx
// src/components/ChoiceQuestion.jsx

export default function ChoiceQuestion({ question, value, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium text-gray-800">{question.label}</h3>
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm leading-relaxed ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                  : 'border-gray-150 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证组件可被导入**

```bash
node -e "console.log('Component file created')"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ChoiceQuestion.jsx
git commit -m "feat: add ChoiceQuestion component"
```

---

### Task 3: 创建个人信息表单组件 PersonalInfoForm

**Files:**
- Create: `src/components/PersonalInfoForm.jsx`

**Interfaces:**
- Consumes: 问卷配置中的 stage.questions 数组（text/select 类型）
- Produces: `<PersonalInfoForm>` — `{ questions, answers, onChange, onNext }`

- [ ] **Step 1: 写入组件**

```jsx
// src/components/PersonalInfoForm.jsx
import { useState } from 'react'

export default function PersonalInfoForm({ question, value, onChange }) {
  if (question.type === 'select') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {question.label}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">请选择</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {question.label}
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PersonalInfoForm.jsx
git commit -m "feat: add PersonalInfoForm component"
```

---

### Task 4: 创建问卷流引擎 QuestionFlow

**Files:**
- Create: `src/components/QuestionFlow.jsx`

**Interfaces:**
- Consumes: `questionnaire` 对象（来自Task 1）、`onComplete(answers)` 回调
- Produces: `<QuestionFlow>` — 完整的逐题问答UI，完成时调用 `onComplete`

- [ ] **Step 1: 写入组件**

```jsx
// src/components/QuestionFlow.jsx
import { useState } from 'react'
import ChoiceQuestion from './ChoiceQuestion'
import PersonalInfoForm from './PersonalInfoForm'

export default function QuestionFlow({ questionnaire, onComplete }) {
  // 展开所有阶段为扁平题目列表
  const allQuestions = questionnaire.stages.flatMap((stage, stageIdx) =>
    stage.questions.map((q) => ({ ...q, stageIdx, stageTitle: stage.title }))
  )

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [stageStartIdx, setStageStartIdx] = useState(0)

  const totalQuestions = allQuestions.length
  const currentQuestion = allQuestions[currentIdx]
  const progress = Math.round(((currentIdx) / totalQuestions) * 100)
  const isLast = currentIdx === totalQuestions - 1

  // 检测是否进入新阶段
  if (currentIdx > 0 && allQuestions[currentIdx].stageIdx !== allQuestions[currentIdx - 1].stageIdx) {
    // 新阶段开始
  }

  const handleSelect = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (isLast) {
      // 组织答案结构
      const personalInfo = {}
      const materialAnswers = {}
      questionnaire.stages.forEach((stage) => {
        stage.questions.forEach((q) => {
          if (stage.id === 'personal_info') {
            personalInfo[q.id] = answers[q.id] || ''
          } else {
            materialAnswers[q.id] = answers[q.id] || ''
          }
        })
      })
      onComplete({
        assignment_type: questionnaire.id,
        personal_info: personalInfo,
        answers: materialAnswers,
      })
      return
    }
    setCurrentIdx((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
    }
  }

  const canAdvance = currentQuestion.required
    ? answers[currentQuestion.id] && answers[currentQuestion.id].trim() !== ''
    : true

  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            {allQuestions[currentQuestion].stageTitle}
          </span>
          <span>{currentIdx + 1} / {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目 */}
      <div className="min-h-[200px]">
        {currentQuestion.type === 'choice' ? (
          <ChoiceQuestion
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onSelect={(v) => handleSelect(currentQuestion.id, v)}
          />
        ) : (
          <PersonalInfoForm
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(v) => handleSelect(currentQuestion.id, v)}
          />
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {currentIdx > 0 && (
          <button
            onClick={handlePrev}
            className="px-6 py-3 text-gray-500 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all"
          >
            ← 上一题
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all ${
            canAdvance
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLast ? '✓ 提交，开始生成' : '下一题 →'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QuestionFlow.jsx
git commit -m "feat: add QuestionFlow survey engine component"
```

---

### Task 5: 创建家风家训AI提示词模板

**Files:**
- Create: `api/lib/templates/family-tradition.js`

**Interfaces:**
- Produces: `export function buildPrompt(questionnaireData)` — 返回完整 prompt 字符串

- [ ] **Step 1: 创建目录并写入模板**

```bash
mkdir -p api/lib/templates
```

- [ ] **Step 2: 写入提示词模板**

```js
// api/lib/templates/family-tradition.js

/**
 * 根据问卷答案构建DeepSeek提示词
 * @param {Object} data - 问卷数据 { personal_info, answers }
 * @returns {string} 完整的prompt
 */
export function buildPrompt(data) {
  const { personal_info, answers } = data

  // 选项值到中文描述的映射
  const optionLabels = {
    // interviewee
    parents: '父母都健谈，能提供丰富素材',
    mother: '主要来自母亲的讲述和记忆',
    father: '主要来自父亲的讲述和记忆',
    grandparents: '祖辈的故事是核心素材来源',

    // red_background
    party_member: '家族中有中共党员，体现了对党忠诚、服务人民的红色家风',
    military: '家族中有军人背景，体现了保家卫国、纪律严明的红色家风',
    public_servant: '家族中有基层干部/公职人员，体现了为民服务、清正廉洁的作风',
    model_worker: '家族中有劳动模范/先进工作者，体现了爱岗敬业、争创一流的精神',
    entrepreneur: '家族中有创业奋斗典型，体现了改革开放后的拼搏进取精神',
    ordinary: '家族成员虽为普通劳动者，但勤勤恳恳、踏实做人',

    // core_value
    honesty: '诚实守信，以诚待人',
    hardwork: '吃苦耐劳，艰苦奋斗',
    education: '崇文重教，知识改变命运',
    harmony: '和睦孝悌，家和万事兴',
    tolerance: '宽厚忍让，吃亏是福',

    // artifacts
    heirlooms: '家中有老物件、奖章等实物佐证',
    photos_certs: '家中有老照片、证书等材料',
    none: '家中未刻意保留实物材料',
    unsure: '家中可能有材料但需进一步整理',

    // has_story
    detailed: '家族中有清晰的转折性故事，细节丰富',
    vague: '家族故事有大概印象，细节待补充',
    none: '家族中虽无戏剧性故事，但家风在日常中潜移默化',
    unsure: '家族故事需进一步访谈挖掘',

    // tone
    plain: '文风朴实真诚，用平实语言讲述真实故事',
    elevated: '文风立意高远，充分呼应中华传统美德、红色家风和社会主义核心价值观',
    balanced: '文风以真实故事为主，在关键处自然升华到传统美德和红色家风',
  }

  const title = personal_info.title || '读书明理，勤俭笃行——我的家风家训调查报告'

  return `你是一名大学本科生，正在完成"形势与政策"课程的暑假作业。请根据以下信息，撰写一篇《我的家风家训》社会调查报告。

## 个人信息（用于报告封面）
- 姓名：${personal_info.name}
- 学校/学院：${personal_info.school}
- 专业：${personal_info.major}
- 年级：${personal_info.grade}
- 班级：${personal_info.class_name}
- 学号：${personal_info.student_id}

## 家风素材（基于访谈问卷）
- 访谈对象：${optionLabels[answers.interviewee] || answers.interviewee}
- 家族红色背景：${optionLabels[answers.red_background] || answers.red_background}
- 核心家训方向：${optionLabels[answers.core_value] || answers.core_value}
- 实物佐证情况：${optionLabels[answers.artifacts] || answers.artifacts}
- 家族故事丰富度：${optionLabels[answers.has_story] || answers.has_story}
- 写作风格：${optionLabels[answers.tone] || answers.tone}

## 报告要求

### 格式规范
- 报告标题：${title}（宋体三号加粗，居中）
- 个人信息行：姓名、学院、专业、年级、班级、学号（宋体小四号，居中）
- 摘要+关键词：楷体小四号，约200字摘要，3-5个关键词
- 正文：宋体四号，固定行距25磅，页边距上下左右2.5cm
- 字数：约5000字

### 报告结构
一、引言（约500字）——调查背景、目的、方法（访谈对象、时间、实物来源），引出核心家训
二、家风溯源——祖辈篇（约1000字）——祖辈的生活经历、家训起源
三、家风传承——父辈篇（约1200字）——父辈如何继承和践行家风，对"我"的教育
四、家风践行——自我篇（约800字）——家风在"我"身上的烙印，进入大学后的体悟
五、家风与时代（约800字）——从家风看中华传统美德、红色家风与社会主义核心价值观
六、结语（约300字）——总结家训，展望传承
附录：访谈提纲

### 写作要求
1. 以第一人称"我"来写，模拟真实大学生的口吻
2. 结合中华传统美德（如仁义礼智信、勤俭、孝道）和红色优良家风（艰苦奋斗、忠诚奉献）
3. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"、"不可否认"、"随着...的发展"等AI套话
4. 句式长短交错，偶尔用口语化的短句，像真人学生写的
5. 适当加入一个不完美但合理的表达（如轻微的重复、口语化转折）
6. 保持自然的学术+生活混杂风格，不要太工整
7. 不要用分点列举，用自然段落
8. 在正文中恰当引用一两处中华传统文化经典（如《朱子家训》《颜氏家训》等）作为理论支撑
9. 根据用户提供的素材信息展开合理的文学性描写和场景还原

## 重要提醒
- 这是一份调查报告，不是小说，要有调查感和真实感
- 在提到访谈内容时，可以用"父亲回忆说""母亲反复强调"等表述
- 附录的访谈提纲请列出5-8个核心访谈问题`
}
```

- [ ] **Step 3: Commit**

```bash
git add api/lib/templates/family-tradition.js
git commit -m "feat: add family tradition AI prompt template"
```

---

### Task 6: 改造首页为作业类型选择

**Files:**
- Modify: `src/pages/Home.jsx`

**Interfaces:**
- Produces: 渲染作业类型卡片，点击跳转 `/order/new?type=xxx`

- [ ] **Step 1: 替换首页内容**

```jsx
// src/pages/Home.jsx — 完整替换
import { useNavigate } from 'react-router-dom'

const ASSIGNMENT_TYPES = [
  {
    id: 'family_tradition',
    title: '我的家风家训',
    subtitle: '形势与政策 · 社会调查报告',
    desc: '结合中华传统美德与红色家风，通过访谈梳理家风家训',
    icon: '🏠',
    words: '约5000字',
  },
  {
    id: 'hometown_change',
    title: '家乡变迁看制度优势',
    subtitle: '形势与政策 · 备选选题',
    desc: '从脱贫、乡村振兴、生态、科创等角度论述中国特色社会主义制度优势',
    icon: '🏙️',
    words: '约5000字',
    coming: true,
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✍️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">形势与政策写作助手</h1>
        <p className="text-gray-500 text-sm">
          选择题式作答 · AI智能生成 · 5元/篇
        </p>
      </div>

      {/* 作业类型选择 */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">选择作业类型</h2>
        {ASSIGNMENT_TYPES.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (!item.coming) navigate(`/order/new?type=${item.id}`)
            }}
            disabled={item.coming}
            className={`w-full text-left bg-white border-2 rounded-xl p-5 transition-all ${
              item.coming
                ? 'border-gray-100 opacity-50 cursor-not-allowed'
                : 'border-gray-100 hover:border-blue-300 hover:shadow-sm active:scale-[0.99]'
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  {item.coming && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      即将上线
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>
                <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {item.words}
                  </span>
                  {!item.coming && (
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      ¥5
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
        <p>📝 <strong>如何使用：</strong>选择题作答 → 付款¥5 → AI自动生成报告</p>
        <p>🤖 <strong>AI生成：</strong>根据你的答案定制化生成，非套模板</p>
        <p>📋 <strong>格式规范：</strong>自动遵循课程排版要求（宋体/行距/页边距）</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Home.jsx
git commit -m "feat: redesign Home page with assignment type cards"
```

---

### Task 7: 改造下单页使用 QuestionFlow

**Files:**
- Modify: `src/pages/NewOrder.jsx`

**Interfaces:**
- Consumes: `familyTraditionQuestionnaire` from Task 1, `QuestionFlow` from Task 4
- Produces: 加载问卷，完成时创建订单

- [ ] **Step 1: 替换 NewOrder 内容**

```jsx
// src/pages/NewOrder.jsx — 完整替换
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QuestionFlow from '../components/QuestionFlow'
import { familyTraditionQuestionnaire } from '../data/questionnaires/family-tradition'
import { api } from '../utils/api'

const QUESTIONNAIRES = {
  family_tradition: familyTraditionQuestionnaire,
}

export default function NewOrder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const type = searchParams.get('type') || 'family_tradition'
  const questionnaire = QUESTIONNAIRES[type]

  if (!questionnaire) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">未知的作业类型</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 text-sm">
          返回首页
        </button>
      </div>
    )
  }

  const handleComplete = async (questionnaireData) => {
    setLoading(true)
    setError('')
    try {
      // 将问卷数据JSON作为description存储
      const order = await api.createOrder({
        type: questionnaireData.assignment_type,
        description: JSON.stringify(questionnaireData),
      })
      navigate(`/order/${order.id}/pay`)
    } catch (err) {
      setError(err.message || '提交失败，请重试')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">正在创建订单...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          ← 返回
        </button>
        <h2 className="text-lg font-bold text-gray-800">{questionnaire.name}</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm mb-4">{error}</div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <QuestionFlow
          questionnaire={questionnaire}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/NewOrder.jsx
git commit -m "feat: replace OrderForm with QuestionFlow in NewOrder page"
```

---

### Task 8: 简化付款页（统一定价¥5）

**Files:**
- Modify: `src/pages/PayOrder.jsx`

- [ ] **Step 1: 将价格展示改为固定¥5**

修改 PayOrder.jsx 中价格相关部分。需要修改的文件内容：将 `order.price` 改为固定显示 `5`，移除加急相关显示。

```jsx
// src/pages/PayOrder.jsx — 修改价格展示区域

// 找到 PriceTag 使用处，确保价格统一显示为 ¥5
// 将 <PriceTag price={order.price} isRush={order.isRush} />
// 改为固定价格显示：

// 修改：在 return 的 JSX 中，将价格区改为：
;<div className="bg-blue-50 rounded-lg p-4 text-center">
  <div className="text-3xl font-bold text-blue-600">¥5</div>
  <div className="text-xs text-blue-500 mt-1">统一定价 · 含AI生成</div>
</div>

// 另外将付款二维码文字改为：
// <p className="font-medium text-blue-800">请扫码付款 ¥5</p>
```

精确修改：替换 PriceTag 部分和价格显示。

- [ ] **Step 2: 直接写入修改后的完整 PayOrder.jsx**

由于改动较多，直接读取原文件做精准替换：

**替换1：** 将 `import PriceTag from '../components/PriceTag'` 删除。

**替换2：** 将价格展示区块 `{/* 价格展示 */}` 下的 `<PriceTag ... />` 替换为固定价格：

```jsx
{/* 价格展示 */}
<div className="bg-blue-50 rounded-lg p-4 text-center">
  <div className="text-3xl font-bold text-blue-600">¥5</div>
  <div className="text-xs text-blue-500 mt-1">统一定价 · 含AI智能生成</div>
</div>
```

**替换3：** 付款二维码处的金额提示从 `¥{order.price}` 改为 `¥5`。

- [ ] **Step 3: Commit**

```bash
git add src/pages/PayOrder.jsx
git commit -m "feat: simplify pricing to flat ¥5"
```

---

### Task 9: 增强订单详情页展示

**Files:**
- Modify: `src/pages/OrderDetail.jsx`

**Interfaces:**
- Consumes: order 对象（含 `description` JSON 字符串）
- Produces: 解析问卷JSON显示用户作答信息，增强报告展示

- [ ] **Step 1: 在 "作业要求" 区域增加问卷答案的友好展示**

在 OrderDetail.jsx 中，修改 "作业要求" 部分，尝试解析 JSON 并以结构化方式展示：

```jsx
{/* 作业要求 */}
<div>
  <h3 className="font-medium text-gray-700 mb-2">作业信息</h3>
  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
    {(() => {
      try {
        const qData = JSON.parse(order.description)
        if (qData.personal_info) {
          return (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">姓名</span>
                <span>{qData.personal_info.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">学校</span>
                <span>{qData.personal_info.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">学号</span>
                <span>{qData.personal_info.student_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">类型</span>
                <span>我的家风家训</span>
              </div>
            </>
          )
        }
      } catch {}
      return <div className="whitespace-pre-wrap">{order.description}</div>
    })()}
  </div>
</div>
```

- [ ] **Step 2: 在"完成稿"区域增加字数统计**

在最终内容展示前加一个字数统计：

```jsx
{finalContent && (
  <p className="text-xs text-gray-400 mb-2">
    共 {finalContent.replace(/[\s\n\r]/g, '').length} 字
  </p>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/OrderDetail.jsx
git commit -m "feat: enhance OrderDetail with questionnaire data display"
```

---

### Task 10: 改造 AI 调用支持问卷模板

**Files:**
- Modify: `api/lib/ai.js`

**Interfaces:**
- Consumes: `order` 对象（含 `description` JSON 字符串），`template` 字符串
- Produces: AI 生成的文本内容

- [ ] **Step 1: 替换 ai.js 内容**

```js
// api/lib/ai.js — 完整替换
import { buildPrompt } from './templates/family-tradition.js'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function generateEssay(order) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置')
  }

  let prompt

  // 尝试解析问卷数据
  try {
    const qData = JSON.parse(order.description)
    if (qData.assignment_type === 'family_tradition') {
      prompt = buildPrompt(qData)
    }
  } catch {
    // 兼容旧订单：纯文本description
  }

  if (!prompt) {
    // 旧订单兼容
    const typeMap = {
      'essay': '课程论文', 'report': '实验/实习报告',
      'reflection': '读后感', 'speech': '演讲稿', 'other': '文章',
    }
    const typeName = typeMap[order.type] || '文章'
    const typeLabel = order.type === 'family_tradition' ? '我的家风家训调查报告' : typeName
    prompt = `你是一名大学本科生。请根据以下要求写一篇${typeLabel}。

重要要求：
1. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"、"不可否认"、"随着...的发展"等AI常用套话
2. 句式长短交错，偶尔用口语化的短句，像真人学生写的
3. 适当加入一个不完美但合理的表达
4. 保持自然的学术+生活混杂风格，不要太工整
5. 不要用分点列举，用自然段落

以下是作业要求：
${order.description}`
  }

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 10000,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`DeepSeek调用失败: ${res.status} ${errText}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}
```

- [ ] **Step 2: Commit**

```bash
git add api/lib/ai.js
git commit -m "feat: AI engine supports questionnaire-based template prompts"
```

---

### Task 11: 适配订单 API

**Files:**
- Modify: `api/orders.js`

**Interfaces:**
- 接收 `description` 为 JSON 字符串（问卷数据）
- 定价固定为 ¥5

- [ ] **Step 1: 修改 orders.js——移除旧import，固定价格¥5**

首先，将文件顶部的 import 行：

```js
import { supabaseAdmin } from './lib/supabase.js'
import { countWords, calculatePrice } from './lib/pricing.js'
```

改为：

```js
import { supabaseAdmin } from './lib/supabase.js'
```

然后，将 `createOrder` 函数中的价格计算部分替换为：
async function createOrder(req, res, userToken) {
  const { type, description, deadline, isRush } = req.body

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: '请完成问卷后再提交' })
  }

  // 统一定价 ¥5
  const price = 5

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_token: userToken,
      type: type || 'other',
      description: description.trim(),
      word_count: 5000, // 固定字数目标
      price: price,
      status: 'pending_pay',
      deadline: deadline || null,
      is_rush: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Create order error:', error)
    return res.status(500).json({ error: '创建订单失败' })
  }

  return res.status(201).json(data)
}
```

- [ ] **Step 2: 验证修改没有语法错误**

```bash
node --check api/orders.js
```

- [ ] **Step 3: Commit**

```bash
git add api/orders.js
git commit -m "feat: flat ¥5 pricing, accept JSON questionnaire data"
```

---

### Task 12: 改造管理员 API——自动生成

**Files:**
- Modify: `api/admin.js`

**Interfaces:**
- `handleConfirmPayment` 确认收款后**自动触发AI生成**，无需管理员手动点击

- [ ] **Step 1: 修改 handleConfirmPayment——确认后自动生成**

将 `handleConfirmPayment` 从仅更新状态改为确认+自动生成：

```js
// api/admin.js — 替换 handleConfirmPayment 函数

async function handleConfirmPayment(password, orderId) {
  mustAuth(password)

  // 1. 先更新状态为 writing
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'writing' })
    .eq('id', orderId)
    .eq('status', 'paid')

  if (updateError) throw new Error('确认失败')

  // 2. 立即异步生成AI内容
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (order) {
      const content = await generateEssay(order)
      await supabaseAdmin
        .from('orders')
        .update({ ai_content: content })
        .eq('id', orderId)
    }
  } catch (genErr) {
    console.error('AI auto-generate error:', genErr)
    // 不抛出错误——即使生成失败也返回成功，管理员可手动重试
  }

  return { success: true, auto_generated: true }
}
```

注意 `generateEssay` 已在文件顶部导入，无需额外修改 import。

- [ ] **Step 2: 同时更新 handleGenerate——适配新 generateEssay 签名**

`handleGenerate` 也需改为调用 `generateEssay(order)` 而非 `generateEssay(order, template)`：

```js
// api/admin.js — 在 handleGenerate 函数中，替换从 configRow 查询到 generateEssay 调用的部分

async function handleGenerate(password, orderId) {
  mustAuth(password)
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (!order) throw new Error('订单不存在')

  // 新: 直接调用 generateEssay，模板由 ai.js 内部选择
  const content = await generateEssay(order)

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ ai_content: content })
    .eq('id', orderId)

  if (error) throw new Error('保存失败')

  return { content }
}
```

同时，移除 admin.js 顶部不再需要的 `DEFAULT_TEMPLATE` 导入：

```js
// 将
import { generateEssay, DEFAULT_TEMPLATE } from './lib/ai.js'
// 改为
import { generateEssay } from './lib/ai.js'
```

- [ ] **Step 3: Commit**

```bash
git add api/admin.js
git commit -m "feat: auto-trigger AI generation on payment confirmation"
```

---

### Task 13: 删除旧组件 OrderForm

**Files:**
- Delete: `src/components/OrderForm.jsx`

- [ ] **Step 1: 删除文件**

```bash
rm src/components/OrderForm.jsx
```

- [ ] **Step 2: 验证没有其他地方引用它**

```bash
grep -r "OrderForm" src/ --include="*.jsx" --include="*.js"
```

Expected: 无输出（已无引用）。

- [ ] **Step 3: Commit**

```bash
git rm src/components/OrderForm.jsx
git commit -m "refactor: remove deprecated OrderForm component"
```

---

### Task 14: 集成验证

**Files:**
- 无新建，验证全部修改

- [ ] **Step 1: 前端构建验证**

```bash
cd D:/essay-writing && npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 2: 后端语法验证**

```bash
node --check api/orders.js && node --check api/admin.js && node --check api/lib/ai.js && node --check api/lib/templates/family-tradition.js && echo "All API files OK"
```

Expected: `All API files OK`

- [ ] **Step 3: 检查所有 import 链接正确**

```bash
grep -rn "from.*OrderForm" src/ || echo "No OrderForm references found (good)"
grep -rn "from.*QuestionFlow" src/ && echo "QuestionFlow referenced (good)"
grep -rn "family-tradition" src/ api/ && echo "family-tradition referenced (good)"
```

- [ ] **Step 4: 验证 dev server 启动**

```bash
cd D:/essay-writing && timeout 10 npm run dev 2>&1 || true
```

Expected: Vite 正常启动，无报错。

- [ ] **Step 5: Commit 最终验证**

```bash
git add -A
git status
```

确认所有文件已提交。
```

