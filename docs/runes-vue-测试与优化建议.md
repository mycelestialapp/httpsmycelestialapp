# 符文占卜 Vue 3 版 — 测试说明与可选优化建议

## 一、完整 Vue 单文件组件位置

- **文件路径**：`src/components/runes/RunesPanel.vue`
- 从 `<template>` 到 `</style>` 为完整代码，包含：24 枚符文数据（中英）、音效开关、i18n、历史与分享、后端 AI fallback、粒子与 3D 翻转等全部逻辑与样式。

---

## 二、测试说明

### 2.1 在 Vue 项目中的使用方式

1. **确保项目为 Vue 3**（Composition API + `<script setup>`）。
2. **挂载组件**  
   - 在需要展示符文占卜的页面中引入并渲染，例如：
   ```vue
   <script setup>
   import RunesPanel from '@/components/runes/RunesPanel.vue';
   </script>
   <template>
     <RunesPanel />
   </template>
   ```
   - 若接入路由（如 `/oracle/reading?tool=runes`），在对应路由的 `component` 中使用上述引入即可。
3. **后端接口（可选）**  
   - 组件会向 `/api/rune-reading` 发送 POST，body 为 `getReadingPayload()` 的 JSON。  
   - 若未部署该接口或请求失败，会自动使用原有静态四层解读模板，无需额外配置。

### 2.2 预期效果

- **单符 / 三符 / 五符**：点击后出现对应数量符文石，依次 3D 翻转；若开启音效且页面在前台，每次翻转有短促风铃音（约 0.2–0.3 音量）。
- **快速三符**：直接抽 3 符并延时后自动生成解读（静态或后端返回）。
- **唤醒解读**：若已抽符，先请求 `/api/rune-reading`；成功则用返回的 `mirror / shadow / chain / anchor` 渲染四层；失败则用静态模板。生成后若音效开启会播放一段氛围音；同时写入历史（最近 5 条）。
- **音效开/关**：按钮切换，状态存于 `localStorage`（key: `runes_sound_enabled`）；页面在后台（`document.hidden`）时不播放。
- **语言切换**：中/EN 按钮切换符文名、按钮文案、解读模板等，语言存于 `localStorage`（key: `runes_lang`）。
- **查看历史**：打开浮层显示最近 5 条（时间、阵型、查看）；点击某条可将该次解读再次填入解读区。
- **分享本次结果**：将「当前页面 URL + ?payload=base64(JSON)` 与解读纯文本拼成一段复制到剪贴板，便于分享链接或文本。
- **无障碍与性能**：系统开启「减少动态效果」时翻转动画缩短、粒子不启动；标签页隐藏时通过 `visibilitychange` 暂停粒子动画。

### 2.3 潜在问题及修复

| 现象 | 可能原因 | 修复 |
|------|----------|------|
| 音效无声音 | 浏览器自动播放策略或未用户交互 | 首次点击任意按钮后再试；部分环境需在用户手势后创建 AudioContext。 |
| 音效为简单电子音 | 当前使用 Web Audio 生成正弦波模拟风铃/氛围 | 可替换为自有 CC0 音源：用 `<audio>` 或 AudioContext 解码 base64/URL，在翻转与唤醒时播放（逻辑位置见组件内「优化1」注释）。 |
| 请求 /api/rune-reading 报错 | 未配置后端或 CORS/路径错误 | 属预期；组件会自动 fallback 到静态解读。若需真实 AI，需部署该接口并返回 `{ mirror, shadow, chain, anchor }`。 |
| 历史/语言/音效刷新后丢失 | 仅依赖 localStorage | 若在无痕或清除存储后使用，会恢复默认（音效开、中文、无历史）。 |
| 分享链接打开无状态 | 当前实现仅复制 URL+文本，未在打开时解析 `?payload=` | 若需「打开链接即还原当次解读」，需在路由/根组件中读取 `location.search` 中的 `payload`，解码后写入组件 state 并可选调用一次解读渲染（未在本次实现）。 |

---

## 三、可选未来优化建议（仅建议，不实现）

1. **真实音源**：用 CC0 风铃/环境音替换 Web Audio 正弦波，翻转与唤醒时播放；仍保留「音效开关」与「document.hidden 不播」逻辑。
2. **分享链接还原**：在应用入口解析 URL 中的 `?payload=base64`，解码后预填符文与解读区，实现「打开链接即看到当次结果」。
3. **历史条目删除**：在「查看历史」浮层中为每条增加「删除」按钮，从 localStorage 中移除该条并刷新列表。
4. **后端返回富文本**：若 AI 返回的 `mirror/shadow/chain/anchor` 含简单 HTML（如加粗、列表），当前已用 `v-html` 渲染 shadow/anchor 的 `div`，可约定后端返回安全 HTML 或 Markdown，前端做一次转换后再注入。
5. **SSR/预渲染**：若需 SEO 或首屏直出，可为该页做服务端渲染或预渲染，注意 canvas 粒子与 AudioContext 仅在客户端执行。

---

以上严格按「先完整 Vue 代码、再测试说明、最后仅文字建议」输出，未在代码中实现第三部分的建议。
