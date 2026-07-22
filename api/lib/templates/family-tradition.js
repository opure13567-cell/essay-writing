/**
 * 根据问卷答案构建DeepSeek提示词
 */
export function buildPrompt(data) {
  const { personal_info, answers } = data

  const optionLabels = {
    parents: '父母都健谈，能提供丰富素材',
    mother: '主要来自母亲的讲述和记忆',
    father: '主要来自父亲的讲述和记忆',
    grandparents: '祖辈的故事是核心素材来源',

    party_member: '家族中有中共党员，体现了对党忠诚、服务人民的红色家风',
    military: '家族中有军人背景，体现了保家卫国、纪律严明的红色家风',
    public_servant: '家族中有基层干部/公职人员，体现了为民服务、清正廉洁的作风',
    model_worker: '家族中有劳动模范/先进工作者，体现了爱岗敬业、争创一流的精神',
    entrepreneur: '家族中有创业奋斗典型，体现了改革开放后的拼搏进取精神',
    ordinary: '家族成员虽为普通劳动者，但勤勤恳恳、踏实做人',

    honesty: '诚实守信，以诚待人',
    hardwork: '吃苦耐劳，艰苦奋斗',
    education: '崇文重教，知识改变命运',
    harmony: '和睦孝悌，家和万事兴',
    tolerance: '宽厚忍让，吃亏是福',

    heirlooms: '家中有老物件、奖章等实物佐证',
    photos_certs: '家中有老照片、证书等材料',
    none: '家中未刻意保留实物材料，但家风在言传身教中传承',
    unsure: '家中可能有材料但需进一步整理',

    detailed: '家族中有清晰的转折性故事，细节丰富',
    vague: '家族故事有大概印象，细节待补充和完善',
    none: '家族中虽无戏剧性故事，但家风在日常生活的点滴中潜移默化',
    unsure: '家族故事需进一步访谈和挖掘',

    plain: '文风朴实真诚，用平实语言讲述真实故事，不刻意拔高',
    elevated: '文风立意高远，充分呼应中华传统美德、红色家风和社会主义核心价值观',
    balanced: '文风以真实故事为主体，在关键处自然升华到传统美德和红色家风',
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
- 总字数：约5000字

### 报告结构
一、引言（约500字）——调查背景和目的、调查方法（本次调查采用访谈法，主要访谈了${personal_info.name}的${answers.interviewee === 'grandparents' ? '祖辈和父辈' : answers.interviewee === 'mother' ? '母亲' : answers.interviewee === 'father' ? '父亲' : '父母'}等直系亲属）、实物来源说明，引出核心家训
二、家风溯源——祖辈篇（约1000字）——祖辈的生活经历、家训起源，祖辈如何以言传身教奠定家风基础
三、家风传承——父辈篇（约1200字）——父辈如何在各自的人生道路上继承和践行家风，结合红色背景的具体表现，对"我"的教育理念和方式
四、家风践行——自我篇（约800字）——家风在"我"身上的烙印，进入大学后对家庭教育的新理解，家风对个人成长的塑造
五、家风与时代（约800字）——从家风看中华传统美德（如仁义礼智信、勤俭节约、孝老爱亲），联系红色优良家风（艰苦奋斗、忠诚奉献），探讨家风与社会主义核心价值观的内在关联
六、结语（约300字）——总结家训精神，展望家风在新时代的传承与发展
附录：访谈提纲

### 写作要求
1. 以第一人称"我"来写，模拟真实大学生的口吻
2. 不要使用"首先其次最后"、"综上所述"、"值得注意的是"、"不可否认"、"随着...的发展"等AI常用套话
3. 句式长短交错，偶尔用口语化的短句，像真人学生写的
4. 适当加入一个不完美但合理的表达（如轻微的重复、口语化转折）
5. 保持自然的学术+生活混杂风格，不要太工整
6. 不要用分点列举，用自然段落
7. 在正文中恰当引用一两处中华传统文化经典（如《朱子家训》《颜氏家训》等）作为理论支撑
8. 根据用户提供的素材信息展开合理的文学性描写和场景还原

## 重要提醒
- 这是一份调查报告，不是小说，要有调查感和真实感
- 在提到访谈内容时，用"父亲回忆说""母亲反复强调"等表述
- 附录的访谈提纲请列出5-8个核心访谈问题`
}
