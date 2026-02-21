# Ask for Help – 智能求助信息撰写工具

> English version: [README.md](README.md) · Version française: [README_fr.md](README_fr.md)

一款完全离线、隐私优先的 Web 工具，引导学生和职场人士写出清晰、有上下文支撑的求助信息 —— 内置启发式伪 AI 引擎、Markov n-gram 变体生成、五维评分，以及本地历史记录与导出功能。

无服务器。无需登录。数据永不离开你的浏览器。

---

## 功能特性

| 功能 | 说明 |
|---|---|
| **10步引导向导** | 起点 → 目标 → 背景 → 已尝试 → 卡住原因 → 问题 → 时限 → 附件 → 渠道/语气 → 审阅 |
| **离线伪 AI** | 10条基于规则的启发式检测：模糊表达、缺少上下文、问题不清晰等 |
| **Markov 三元模型** | 从精选语料库生成备选措辞，无需任何 API |
| **五维评分** | 清晰度·努力程度·具体性·礼貌度·简洁度（0–100，颜色编码） |
| **多格式输出** | 标准版 / 简短版（≤7行）/ 超短版（≤3行）× 4种渠道（邮件、聊天、论坛、面谈） |
| **三语支持（中/英/法）** | 中文、英文、法文完整支持 —— 短语库、18套模板、全界面文案 |
| **全局语言与主题切换** | 顶栏统一管理语言（EN/ZH/FR）与亮色/暗色切换，应用范围全局生效 |
| **延迟验证** | 表单验证仅在步骤提交后触发，避免未完成输入时出现干扰提示 |
| **SVG 图标系统** | 内联 SVG 图标替代 emoji，语义清晰、无障碍友好、显示一致 |
| **18套预置模板** | 涵盖中文、英文、法文场景，覆盖学术与职场用途 |
| **响应式布局** | 移动端 / 平板 / 宽屏自适应（审阅步骤宽屏下双栏显示） |
| **本地历史与导出** | 证据日志存储于 `localStorage`；支持导出为 JSON 或 CSV |
| **无障碍访问** | 符合 WCAG 2.1 AA —— 字号滑块、高对比度模式、减少动效切换、焦点可见环 |
| **MD3 设计风格** | Material Design 3 设计令牌，亮色/暗色主题切换 |

---

## 快速开始

```bash
# 安装依赖（仅需一次）
npm install

# 启动开发服务器，访问 http://localhost:5173
npm run dev
```

用浏览器打开 `http://localhost:5173`。开发阶段无需构建。

---

## 生产环境构建

```bash
npm run build
# → 输出至 dist/
```

构建产物为自包含静态包（无后端）。将 `dist/` 目录部署到任意静态托管服务即可。

### 部署到 GitHub Pages

```bash
npm run build
# 然后将 dist/ 推送到 gh-pages 分支，或使用 gh-pages 包：
npx gh-pages -d dist
```

在仓库设置中将 **Pages 来源** 设置为 `gh-pages` 分支。

---

## 项目结构

```
app/
├── index.html
├── vite.config.ts
├── src/
│   ├── App.tsx                 # 哈希路由（5个路由）
│   ├── main.tsx                # 入口文件 + CSS 导入
│   ├── core/
│   │   ├── schema.ts           # 所有 TypeScript 类型
│   │   ├── machine.ts          # 向导状态机 reducer
│   │   ├── heuristics.ts       # 伪 AI 建议规则 + 改写辅助函数
│   │   ├── markov.ts           # Markov 三元链
│   │   ├── generator.ts        # 多格式输出生成器
│   │   ├── scoring.ts          # 五维评分
│   │   └── storage.ts          # localStorage 持久化 + CSV/JSON 导出
│   ├── data/
│   │   ├── templates.json      # 18套预置模板（中/英/法）
│   │   ├── phrase_bank_en.json # 英文短语库
│   │   ├── phrase_bank_zh.json # 中文短语库
│   │   ├── phrase_bank_fr.json # 法文短语库
│   │   ├── markov_corpus_en.txt
│   │   └── markov_corpus_zh.txt
│   ├── styles/
│   │   ├── tokens.css          # MD3 设计令牌
│   │   ├── themes.css          # 亮色/暗色/高对比度主题（含顶栏 CSS 变量）
│   │   └── components.css      # 组件样式（含响应式断点）
│   ├── routes/
│   │   ├── Home.tsx
│   │   ├── Builder.tsx         # 主向导页面
│   │   ├── Library.tsx         # 模板 + 短语库浏览
│   │   ├── History.tsx         # 证据日志
│   │   └── About.tsx           # 方法说明 + 无障碍设置
│   └── ui/
│       ├── AppShell.tsx        # 全局顶栏（语言/主题切换）
│       ├── Icons.tsx           # 内联 SVG 图标系统
│       ├── Wizard.tsx          # 引导向导（延迟验证）
│       ├── FieldCard.tsx
│       ├── PreviewPane.tsx
│       ├── SuggestionsPanel.tsx
│       ├── TemplatePicker.tsx
│       ├── HistoryTable.tsx
│       └── Accessibility.tsx
└── dist/                       # 生产构建输出（已添加到 .gitignore）
```

---

## 可用脚本

| 命令 | 功能 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run typecheck` | 仅执行 TypeScript 检查（不输出文件） |

---

## 技术栈

- **Vite 7** —— 构建工具与开发服务器
- **React 19** —— UI 渲染
- **TypeScript 5.9** —— 静态类型检查
- **CSS 自定义属性** —— Material Design 3 令牌，无 CSS 框架
- **localStorage** —— 所有数据持久化；无 Cookie，无网络请求

---

## 隐私声明

所有处理均在你的浏览器本地完成。任何数据不会发送到任何服务器。草稿数据仅通过 `localStorage` 存储在**你的**设备上。清除浏览器数据或使用应用内的"清空历史"按钮即可删除。

---

## 许可证

MIT
