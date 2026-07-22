export const hometownChangeQuestionnaire = {
  id: 'hometown_change',
  name: '家乡变迁看制度优势',
  description: '形势与政策课程社会调查报告 · 约5000字',
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
      id: 'hometown_info',
      title: '家乡信息',
      description: '请描述你家乡的基本情况',
      questions: [
        { id: 'hometown_name', type: 'text', label: '家乡所在地', placeholder: '如：湖南省长沙市XX县/区', required: true },
        {
          id: 'area_type', type: 'choice',
          label: '你的家乡属于？',
          options: [
            { value: 'rural', label: '农村/乡镇——经历了较大发展变化' },
            { value: 'small_city', label: '小城市/县城——正在快速发展中' },
            { value: 'big_city', label: '大中城市——城市面貌不断更新' },
          ],
        },
        {
          id: 'focus_angle', type: 'choice',
          label: '你家乡变化最明显的是哪方面？（可多选但选最突出的）',
          options: [
            { value: 'poverty', label: '脱贫攻坚——从贫困到小康的转变' },
            { value: 'rural_revitalization', label: '乡村振兴——基础设施、产业、村容村貌' },
            { value: 'ecology', label: '生态环境——天更蓝水更清山更绿' },
            { value: 'technology', label: '科技创新——数字经济、智慧城市、新基建' },
            { value: 'culture', label: '文化传承——传统文化保护、精神文明' },
            { value: 'transport', label: '交通发展——高铁、高速、村村通' },
          ],
        },
        {
          id: 'has_example', type: 'choice',
          label: '你能举出家乡变化的1-2个具体例子吗？',
          options: [
            { value: 'yes_specific', label: '有——能想起具体的变化（比如某条路、某个产业、某个政策）' },
            { value: 'yes_vague', label: '有一些印象但说不太清楚细节' },
            { value: 'need_help', label: '需要AI帮我构思合理的例子' },
          ],
        },
        {
          id: 'tone', type: 'choice',
          label: '你希望报告的写作风格是？',
          options: [
            { value: 'plain', label: '朴实真诚——平实语言讲真实变化，不刻意拔高' },
            { value: 'elevated', label: '立意高远——充分论述制度优势、党的领导' },
            { value: 'balanced', label: '折中——以具体变化为主体，自然联系到制度层面' },
          ],
        },
      ],
    },
  ],
}
