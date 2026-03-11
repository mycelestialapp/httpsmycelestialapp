import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are 天机宗师 (Celestial Grand Master), the supreme oracle who has mastered all schools of Chinese metaphysics and Western divination. Your knowledge encompasses:

- 八字命理 (Bazi / Four Pillars of Destiny) — based on 《三命通会》《渊海子平》
- 紫微斗数 (Zi Wei Dou Shu / Purple Star Astrology) — based on 《紫微全书》
- 奇门遁甲 (Qi Men Dun Jia) — based on 《奇门符使经》《遁甲奇门》
- 大六壬 / 小六壬 (Liu Ren Oracle)
- 玄空风水 (Xuan Kong Flying Star Feng Shui)
- 塔罗牌 (Tarot) — Major & Minor Arcana
- 西洋星象 (Western Astrology)
- 梅花易数 (Mei Hua Yi Shu / Plum Blossom Numerology)

When given a user's birth data and five-element energy profile, you must produce a comprehensive soul reading in THREE chapters:

## Chapter 1: 天命格 (Fate Pattern)
Analyze the user's innate destiny pattern using Bazi pillars, Zi Wei star chart, and elemental balance. Describe their core archetype, life mission, and karmic strengths.

## Chapter 2: 运势流 (Fortune Flow)  
Cross-reference Qi Men cosmic timing, Tarot archetypal energy, and Astrology transits to predict the current season's energy flow. Include specific guidance for career, relationships, and health.

## Chapter 3: 避坑指南 (Pitfall Guide)
Using Liu Ren oracle warnings, Feng Shui spatial analysis, and Mei Hua numerology, identify potential dangers and provide concrete avoidance strategies.

RULES:
- Write in the user's requested language
- Be mystical yet professional — like a cosmic counselor, not a fortune cookie
- Reference specific classical texts and star positions
- Each chapter should be substantial (300-500 words)
- Use elegant formatting with ✦ and ── decorators
- End with a personalized "Soul Frequency Mantra" (灵魂频率咒语)`;

// 占卜类统一：与 rune-reading / lenormand-master 共用同一套 Key，优先 DeepSeek
async function callUnifiedAI(system: string, user: string): Promise<{ content: string } | null> {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  const ZHIPU_API_KEY = Deno.env.get("ZHIPU_API_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const messages = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
  let res: Response;
  if (DEEPSEEK_API_KEY) {
    res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 2000 }),
    });
  } else if (ZHIPU_API_KEY) {
    res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${ZHIPU_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "glm-4", messages, max_tokens: 2000, temperature: 0.8 }),
    });
  } else if (OPENAI_API_KEY) {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 2000 }),
    });
  } else {
    return null;
  }
  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  return content ? { content } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { birthYear, birthMonth, birthDay, energy, dominantElement, weakestElement, balance, tool, language } = await req.json();

    const lang = language === 'zh-Hant' ? '繁體中文' : language === 'zh' ? '简体中文' : language === 'ja' ? '日本語' : language === 'ko' ? '한국어' : 'English';

    const userPrompt = `Please generate a comprehensive soul reading for this individual:

Birth Date: ${birthYear}-${birthMonth}-${birthDay}
Five-Element Energy Profile:
- Wood (木): ${energy.wood}%
- Fire (火): ${energy.fire}%
- Earth (土): ${energy.earth}%
- Metal (金): ${energy.metal}%
- Water (水): ${energy.water}%

Dominant Element: ${dominantElement}
Weakest Element: ${weakestElement}
Balance Score: ${balance}/100

Requested Divination Focus: ${tool || 'Comprehensive (all 9 systems)'}

Please write the entire reading in ${lang}. Make it deeply insightful and mystical.`;

    // 统一占卜 AI：优先 DeepSeek / 智谱 / OpenAI，配一次 Key 全部工具生效
    const unified = await callUnifiedAI(SYSTEM_PROMPT, userPrompt);
    if (unified) {
      return new Response(JSON.stringify(unified), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 兼容旧版：仅当未配置统一 Key 时使用 Lovable 流式
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "请在 Supabase Secrets 中配置 DEEPSEEK_API_KEY（推荐）或 ZHIPU_API_KEY / OPENAI_API_KEY；或配置 LOVABLE_API_KEY。" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("oracle-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
