### Task 1: 项目脚手架

**文件:**
- 创建: `D:\essay-writing\package.json`
- 创建: `D:\essay-writing\vite.config.js`
- 创建: `D:\essay-writing\tailwind.config.js`
- 创建: `D:\essay-writing\postcss.config.js`
- 创建: `D:\essay-writing\index.html`
- 创建: `D:\essay-writing\src\main.jsx`
- 创建: `D:\essay-writing\src\App.jsx`
- 创建: `D:\essay-writing\src\index.css`
- 创建: `D:\essay-writing\.env.example`
- 创建: `D:\essay-writing\.gitignore`

**产出:** 可运行的空Vite+React+Tailwind项目

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "essay-writing",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@supabase/supabase-js": "^2.45.0",
    "@anthropic-ai/sdk": "^0.32.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.10",
    "postcss": "^8.4.41",
    "autoprefixer": "^10.4.20"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

- [ ] **Step 3: 创建 Tailwind 配置**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>写作助手 - AI润色服务</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✍️</text></svg>" />
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建入口文件**

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```jsx
// src/App.jsx
export default function App() {
  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white shadow-sm">
      <h1 className="text-xl font-bold text-center py-8">✍️ 写作助手</h1>
    </div>
  )
}
```

- [ ] **Step 6: 创建 .env.example 和 .gitignore**

```
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-admin-password
CLAUDE_API_KEY=sk-ant-your-key
```

```
# .gitignore
node_modules/
dist/
.env
.env.local
```

- [ ] **Step 7: 安装依赖并验证**

```bash
cd D:\essay-writing && npm install && npm run dev
```

在浏览器打开 http://localhost:5173 ，确认看到"写作助手"标题。

- [ ] **Step 8: 等待进入下一步**

---

