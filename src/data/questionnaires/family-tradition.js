export const familyTraditionQuestionnaire = {
  id: 'family_tradition',
  name: '我的家风家训',
  description: '形势与政策课程社会调查报告 · 约5000字',
  stages: [
    {
      id: 'family_materials',
      title: '家风素材',
      description: '请根据你的家庭情况，选择最接近的选项',
      questions: [
        {
          id: 'interviewee', type: 'choice',
          label: '你的主要访谈对象是？',
          options: [
            { value: 'parents', label: '父母都健谈，能讲出不少故事和道理' },
            { value: 'mother', label: '主要靠妈妈，妈妈对家族的事记得更清楚' },
            { value: 'father', label: '主要靠爸爸，爸爸有比较清晰的家族记忆' },
            { value: 'grandparents', label: '需要祖辈参与，爷爷奶奶/外公外婆才有真正的家族故事' },
          ],
        },
        {
          id: 'red_background', type: 'choice',
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
          id: 'core_value', type: 'choice',
          label: '父母最常念叨你的那句话是？',
          options: [
            { value: 'honesty', label: '做人要诚实/老实——诚信为本' },
            { value: 'hardwork', label: '吃得苦中苦，方为人上人——吃苦耐劳' },
            { value: 'education', label: '多读书才有出息/知识改变命运——崇文重教' },
            { value: 'harmony', label: '家和万事兴/一家人要团结——和睦孝悌' },
            { value: 'tolerance', label: '吃亏是福/别跟人计较——宽厚忍让' },
            { value: 'diligence', label: '笨鸟先飞/勤能补拙——勤奋努力' },
            { value: 'gratitude', label: '做人要懂得感恩——知恩图报' },
            { value: 'independence', label: '靠人不如靠己/自己的事情自己做——独立自强' },
            { value: 'thrift', label: '钱要省着花/不要乱花钱——勤俭节约' },
            { value: 'honor', label: '做人要有骨气/别让人看不起——自尊自爱' },
            { value: 'kindness', label: '要与人为善/多帮帮别人——善良仁爱' },
            { value: 'down_to_earth', label: '做事要踏实/一步一个脚印——脚踏实地' },
            { value: 'filial', label: '要对长辈孝顺——孝老爱亲' },
            { value: 'persistence', label: '做事不能半途而废——坚持不懈' },
          ],
        },
        {
          id: 'artifacts', type: 'choice',
          label: '家里有没有保留一些"实物证据"？',
          options: [
            { value: 'heirlooms', label: '有老物件/奖章/军功章——至少1-2件有分量的' },
            { value: 'photos_certs', label: '有一些照片/证书——如党费证、毕业照、工作照' },
            { value: 'no_artifacts', label: '基本没有——没刻意保留过这类东西' },
            { value: 'unsure_artifacts', label: '不确定——需要回家翻翻看' },
          ],
        },
        {
          id: 'has_story', type: 'choice',
          label: '关于"家风传承"，你家里有具体的转折性故事吗？',
          options: [
            { value: 'detailed', label: '有详细故事——比如祖辈/父辈靠读书走出农村、或因为没文化留下遗憾' },
            { value: 'vague', label: '有大概印象——知道是这么回事，但细节模糊' },
            { value: 'no_story', label: '没什么特别的故事——就是单纯觉得读书/诚实/勤奋重要' },
            { value: 'unsure_story', label: '不确定——需要回去跟父母聊了才知道' },
          ],
        },
        {
          id: 'tone', type: 'choice',
          label: '你希望报告的写作风格是？',
          options: [
            { value: 'plain', label: '朴实真诚——平实语言讲真实故事，不刻意拔高' },
            { value: 'elevated', label: '立意高远——更多呼应中华传统美德、红色家风、核心价值观' },
            { value: 'balanced', label: '折中——以真实故事为主体，关键处自然升华' },
          ],
        },
      ],
    },
    {
      id: 'personal_info',
      title: '个人信息',
      description: '以下信息将用于报告封面和文件命名',
      questions: [
        {
          id: 'name_id', type: 'group',
          label: '姓名 & 学号',
          fields: [
            { id: 'name', label: '姓名', placeholder: '请输入姓名', width: 'half' },
            { id: 'student_id', label: '学号', placeholder: '用于文件命名', width: 'half' },
          ],
        },
        {
          id: 'school_info', type: 'group',
          label: '学校 & 专业信息',
          fields: [
            { id: 'school', label: '学校/学院', placeholder: '如：XX大学XX学院', width: 'full' },
            { id: 'major', label: '专业及班级', placeholder: '如：计算机科学1班', width: 'full' },
            { id: 'grade', label: '年级', type: 'select', options: ['2023级', '2024级', '2025级', '其他'], width: 'half' },
            { id: 'hometown', label: '家乡所在地', placeholder: '如：湖南长沙', width: 'half' },
          ],
        },
      ],
    },
  ],
}
