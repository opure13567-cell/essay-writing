export const industryInterviewQuestionnaire = {
  id: 'industry_interview',
  name: '行业人物访谈报告',
  description: '形势与政策课程社会调查报告 · 2023级 · 约5000-10000字',
  stages: [
    {
      id: 'personal_info',
      title: '个人信息',
      description: '以下信息将用于报告封面，请如实填写',
      questions: [
        { id: 'name', type: 'text', label: '姓名', placeholder: '请输入你的姓名', required: true },
        { id: 'school', type: 'text', label: '学校/学院', placeholder: '如：XX大学XX学院', required: true },
        { id: 'major', type: 'text', label: '专业及班级', placeholder: '如：计算机科学1班', required: true },
        { id: 'grade', type: 'select', label: '年级', options: ['2023级', '2024级', '2025级', '其他'], required: true },
        { id: 'student_id', type: 'text', label: '学号', placeholder: '用于文件命名（学号+姓名）', required: true },
        { id: 'title', type: 'text', label: '报告标题', placeholder: '可自拟，留空则由AI自动生成', required: false },
      ],
    },
    {
      id: 'industry_info',
      title: '行业信息',
      description: '请描述你要访谈的目标行业',
      questions: [
        { id: 'industry', type: 'text', label: '目标行业/领域', placeholder: '如：互联网/人工智能、金融、教育、医疗、制造业等', required: true },
        { id: 'career_goal', type: 'text', label: '你的职业目标方向', placeholder: '如：软件工程师、产品经理、教师、医生等', required: false },
        {
          id: 'industry_level', type: 'choice',
          label: '你对这个行业的了解程度？',
          options: [
            { value: 'familiar', label: '比较熟悉——有亲戚朋友在相关行业工作' },
            { value: 'somewhat', label: '有一些了解——通过课程、网络、实习接触过' },
            { value: 'curious', label: '不太了解但很感兴趣——想通过这次访谈深入了解' },
          ],
        },
        {
          id: 'focus_areas', type: 'choice',
          label: '你最关注访谈的哪些方面？（选最看重的）',
          options: [
            { value: 'career_path', label: '职业发展路径——怎么一步步走到今天的' },
            { value: 'industry_prospect', label: '行业前景——未来5-10年的发展趋势' },
            { value: 'work_content', label: '工作内容——每天具体做什么、需要什么技能' },
            { value: 'salary_welfare', label: '薪酬福利——收入水平、福利待遇、晋升空间' },
            { value: 'work_life', label: '工作感悟——工作的苦与乐、成就感与挑战' },
            { value: 'entry_advice', label: '入行建议——对应届生/新人的建议和忠告' },
          ],
        },
        {
          id: 'tone', type: 'choice',
          label: '你希望报告的写作风格是？',
          options: [
            { value: 'professional', label: '专业客观——偏正式的调查报告风格' },
            { value: 'storytelling', label: '故事叙述——以访谈故事为主线，生动可读' },
            { value: 'balanced', label: '折中——既有专业分析也有生动故事' },
          ],
        },
      ],
    },
  ],
}
