# 占卜类云函数统一 AI 配置

所有占卜解读（符文、雷诺曼、神谕卡/天机宗师）共用**同一套 Key**，在 Supabase 里配一次即可统一生效。

## 配置方式

**Supabase 项目** → **Project Settings** → **Edge Functions** → **Secrets** 中添加：

| Secret 名称 | 说明 | 推荐 |
|------------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek 开放平台 API Key | ✅ 优先使用，成本低、效果稳 |
| `ZHIPU_API_KEY` | 智谱 GLM API Key | 备选 |
| `OPENAI_API_KEY` | OpenAI API Key | 备选 |

**只需配置其中至少一个**，三个云函数会按统一顺序使用：**DeepSeek → 智谱 → OpenAI**。

## 涉及的云函数

| 函数名 | 用途 | 统一后行为 |
|--------|------|------------|
| `rune-reading` | 符文解读（四层结构 + 灵性解读） | 优先用 DEEPSEEK_API_KEY |
| `lenormand-master` | 雷诺曼大师解读 | 优先用 DEEPSEEK_API_KEY，其次智谱/OpenAI，最后 LOVABLE |
| `oracle-reading` | 神谕卡/天机宗师综合解读 | 优先用 DEEPSEEK_API_KEY，无则用 LOVABLE_API_KEY（流式） |

## 统一操作的好处

- **一次配置**：只配 `DEEPSEEK_API_KEY`，符文、雷诺曼、神谕卡全部走同一套 AI。
- **统一计费**：所有占卜的 AI 调用都走你选的厂商（如 DeepSeek），方便对账。
- **便于切换**：想换模型时，只改 Secrets 或调整优先级即可，无需改代码。

## 部署

可以等**所有占卜工具都接好云函数后，再一次性统一部署**，不必每做一个就部署一次。

```bash
# 按需逐个部署，或一次性部署多个
npx supabase functions deploy rune-reading
npx supabase functions deploy lenormand-master
npx supabase functions deploy oracle-reading
# 后续新增的占卜云函数同理
npx supabase functions deploy <其他占卜函数名>
```

部署前在 Supabase Secrets 里配好 `DEEPSEEK_API_KEY`（或智谱/OpenAI）即可，配一次、所有占卜工具共用。
