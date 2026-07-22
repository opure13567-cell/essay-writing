### Task 9: 部署到 Vercel

**文件:**
- 创建/修改: `D:\essay-writing\vercel.json`

**产出:** 应用在 Vercel 上线，可通过公开 URL 访问

- [ ] **Step 1: 确保 vercel.json 完整**

```json
{
  "rewrites": [
    {
      "source": "/api/orders/:path*",
      "destination": "/api/orders"
    },
    {
      "source": "/api/admin/:path*",
      "destination": "/api/admin"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

- [ ] **Step 2: 将代码推送到 GitHub**

```bash
cd D:\essay-writing
git init
git add .
git commit -m "feat: AI写作服务初始版本"
```

在 GitHub 创建新仓库，然后：
```bash
git remote add origin https://github.com/YOUR_USERNAME/essay-writing.git
git push -u origin main
```

- [ ] **Step 3: Vercel 部署**

1. 去 https://vercel.com 注册/登录（用 GitHub 账号）
2. 点 "New Project" → 导入 essay-writing 仓库
3. 框架自动识别为 Vite
4. 在 Environment Variables 中设置：
   - `VITE_SUPABASE_URL` — Supabase项目URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key
   - `ADMIN_PASSWORD` — 你的管理后台口令
   - `CLAUDE_API_KEY` — Claude API key
5. 点 "Deploy"

- [ ] **Step 4: 部署后验证**

1. 打开 Vercel 给的域名（如 `xxx.vercel.app`）
2. 验证首页正常显示
3. 验证下单流程
4. 验证管理后台 `/admin`
5. 测试 AI 生成功能

- [ ] **Step 5: 生成二维码**

用任意在线二维码生成器，把 `https://xxx.vercel.app` 生成二维码，打印或用手机展示给学生扫码。

---

## 验证清单

部署完成后逐项验证：

- [ ] 学生打开网页，看到首页和定价
- [ ] 学生可以提交作业要求（填写文字）
- [ ] 系统正确显示报价
- [ ] 支付页显示收款码（需在后台配置中上传）
- [ ] 学生上传付款截图后状态变为"已付款"
- [ ] 管理后台可登录
- [ ] 管理后台看到所有订单
- [ ] 点击"AI生成"能成功调用Claude API并显示文章
- [ ] 运营可编辑生成的文章
- [ ] 点"发稿"后，学生刷新订单页可看到完成稿
- [ ] 学生可一键复制完成稿
