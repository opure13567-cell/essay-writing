const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function generateEssay(order) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DeepSeek API密钥未配置')

  // 随机选一个结构方案，标题也每次不同
  const structures = [
    ['引言','家风溯源——祖辈篇','家风传承——父辈篇','家风践行——自我篇','家风与时代','结语'],
    ['一、引言','二、家风溯源','三、家风传承','四、家风践行','五、结语'],
    ['一、调查背景与方法','二、家风故事','三、家训提炼','四、家风与时代精神','五、结语与感悟'],
    ['一、访谈概况','二、祖辈的言传身教','三、父辈的接续传承','四、我的成长体会','五、结语'],
    ['一、调查说明','二、祖辈的故事','三、父辈的选择','四、家风的日常','五、家训的提炼','六、结语'],
    ['一、引言','二、家风调查','三、家训总结','四、体会与思考'],
    ['一、调查概述','二、家族记忆','三、父母的教诲','四、我的改变','五、家风与时代','六、结语'],
    ['一、调查缘起','二、长辈的言传身教','三、家训的形成','四、家风在新时代','五、结语'],
  ]

  // 标题池，每次随机选一个
  const titleTemplates = [
    '守得云开见月明——我的家风家训调查报告',
    '一粥一饭当思来处——记我家的勤俭之风',
    '父亲的工具箱里装着什么——我的家风调查报告',
    '那些年，母亲教我的事——我的家风家训',
    '田埂上的家风——一个普通家庭的传承故事',
    '一盏灯，三代人——我的家风家训调查报告',
    '诚实做人，踏实做事——我的家风家训',
    '把根留住——我的家风家训调查报告',
    '老屋里的家风——我的家风家训',
    '从一块奖章说起——我的家风家训调查报告',
    '家风如雨，润物无声——我的家风家训',
    '一把锄头传三代——我的家风调查报告',
    '饭桌上的规矩——我的家风家训',
    '那些刻在骨子里的话——我的家风家训调查报告',
    '平凡人家的传家宝——我的家风家训',
  ]

  const selected = structures[Math.floor(Math.random() * structures.length)]
  const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)]
  const headingStr = selected.map(h => `${h}`).join('\n')

  const prompt = `你是一名大学本科生，正在写形势与政策课的作业。请根据以下学生素材，写一篇《我的家风家训》社会调查报告，字数约5000-6000字。

## 必须包含的板块（缺一不可）
1. 标题：${title}（直接放在最上面，第一行就是标题，标题上面不要有任何文字）
2. 摘要（200字左右）+ 关键词（3-5个）
3. 正文（结构参考下方）
4. 附录（访谈提纲，5-8个问题）

## 正文结构参考（严格按此章节数和标题顺序写）
${headingStr}

## 写作要求（严格执行）
1. 用第一人称"我"，口语化
2. 绝对不要用：首先其次最后、综上所述、值得注意的是、不可否认、随着...的发展、说实话、说真的
3. 家训概括成八个字（如"读书明理，勤俭笃行"）
4. 引用家人说的话用大白话，不要加工成书面语
5. 结尾不要加任何"温馨提示""说明""使用建议"之类的话，直接以正文内容结束
6. 标题必须是上面指定的那个，一个字都不能改。标题放在最上面第一行
7. 字数务必达到5000字以上

## 防辅导员识别规则（非常重要）
- 不要出现具体人名、年龄、年级、学号、学校名、地名
- 用"我父亲""我母亲""我爷爷"代替真实称呼
- 不要写"作为大学生""作为一名学生"等身份句
- 不要写出生年份、年龄、具体年份

## 重要：禁止以下格式
- 禁止在文中使用 --- 或任何水平分割线
- 禁止使用 Markdown 格式标记
- 禁止在正文结束后添加任何额外文字、说明、温馨提示

## 学生素材
${order.description}`

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 8000, temperature: 0.9, messages: [{ role: 'user', content: prompt }] }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`DeepSeek调用失败: ${res.status} ${errText}`)
  }
  const data = await res.json()
  let text = data.choices[0]?.message?.content || ''

  // 裁剪AI附加的说明文字
  const cutMarkers = [
    '温馨提示', '请放心使用', '已严格按照', '防辅导员识别规则',
    '根据你提供的素材', '为你定制的', '请查收', '希望对你有所帮助',
    '如果还有需要', '如果你觉得', '可以随时告诉我',
  ]
  for (const marker of cutMarkers) {
    const idx = text.lastIndexOf(marker)
    if (idx > text.length * 0.6) {
      text = text.substring(0, idx).trim()
    }
  }

  return text
}
