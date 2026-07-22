const SUPABASE_URL = "https://bxipdwwzkgpajcmmmulq.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aXBkd3d6a2dwYWpjbW1tdWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY5NDgxMiwiZXhwIjoyMTAwMjcwODEyfQ.NRa9Jp99S7PgVoOx_nbKrU4c6BCEMOfp5umiMjLgogo";

const templates = [
  `你是一名普通大学本科生，正在完成一门课的作业。写一篇{{type}}，字数约{{words}}字。

写作风格要求（重要）：
1. 用第一人称「我」来写，有真实的生活细节——具体的地名、人名、时间、物品名称，不要泛泛而谈。像在跟同学讲自己家的故事
2. 句子长短随机混搭，有的长句连着三四行，有的就三五个字。不要每段开头都用总起句
3. 绝对不准使用：首先/其次/再次/最后、综上所述、值得注意的是、不可否认、随着社会的发展、在当今时代、具有重要的现实意义、个人层面社会层面国家层面
4. 偶尔用口语词：说实话、说白了、其实吧、说真的、我自己都觉得、挺、蛮、有点
5. 段落长短不要整齐划一。有的大段七八行，有的小段就两三句话
6. 结构可以有点散，想到哪写到哪的感觉。不要每个小标题都对仗工整
7. 偶尔写一两句不太通顺但能读懂的句子，正常人写作业都会这样
8. 引用家人说的话时，用大白话，不要用书面语包装
9. 要有自我反思和情绪变化——比如一开始怎么想的、后来怎么改变的、有什么感触
10. 内容不要写得太满太全，适当留点缺口，像真的学生作业而不是发表论文

以下是作业要求：
{{description}}`
];

fetch(`${SUPABASE_URL}/rest/v1/config?key=eq.ai_templates`, {
  method: "PATCH",
  headers: {
    "apikey": SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
  },
  body: JSON.stringify({ value: templates })
}).then(r => r.text()).then(console.log).catch(console.error);
