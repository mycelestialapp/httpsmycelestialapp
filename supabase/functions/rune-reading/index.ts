import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** 校验为付费用户（profiles.oracle_subscriber）后才允许调用 AI */
async function requireOracleSubscriber(req: Request): Promise<{ ok: false; status: number; body: string } | { ok: true }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 402, body: JSON.stringify({ error: "需要登入並訂閱後使用靈性解讀" }) };
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnon) {
    return { ok: false, status: 500, body: JSON.stringify({ error: "Server config missing" }) };
  }
  const client = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.slice(7);
  const { data: { user }, error: userError } = await client.auth.getUser(token);
  if (userError || !user) {
    return { ok: false, status: 401, body: JSON.stringify({ error: "請先登入" }) };
  }
  const { data: profile } = await client.from("profiles").select("oracle_subscriber").eq("id", user.id).maybeSingle();
  if (!profile?.oracle_subscriber) {
    return { ok: false, status: 402, body: JSON.stringify({ error: "需要訂閱後使用靈性解讀" }) };
  }
  return { ok: true };
}

// 古弗薩克 24 符（与 backend/runes_data.py、rune.html 一致）
const RUNES_24: Array<{ id: number; name: string; symbol: string; interpretive: string; reversible: boolean }> = [
  { id: 0, name: "Fehu", symbol: "ᚠ", interpretive: "财富涌入、丰盛起点。象征流动的财富与生命力。", reversible: true },
  { id: 1, name: "Uruz", symbol: "ᚢ", interpretive: "原始力量、身体恢复、耐力与野性。", reversible: true },
  { id: 2, name: "Thurisaz", symbol: "ᚦ", interpretive: "防护屏障、突破荆棘、雷击与混沌之力。", reversible: true },
  { id: 3, name: "Ansuz", symbol: "ᚨ", interpretive: "神圣启示、清晰沟通、智慧与神启。", reversible: true },
  { id: 4, name: "Raidho", symbol: "ᚱ", interpretive: "旅程、移动、抉择与宇宙秩序。", reversible: true },
  { id: 5, name: "Kenaz", symbol: "ᚲ", interpretive: "光明、启蒙、热情与洞察。", reversible: true },
  { id: 6, name: "Gebo", symbol: "ᚷ", interpretive: "馈赠、伙伴、平衡与收获。", reversible: false },
  { id: 7, name: "Wunjo", symbol: "ᚹ", interpretive: "喜悦、和谐、祝福与圆满。", reversible: true },
  { id: 8, name: "Hagalaz", symbol: "ᚺ", interpretive: "考验、延迟、纪律与自然之力。", reversible: false },
  { id: 9, name: "Nauthiz", symbol: "ᚾ", interpretive: "需求、渴望、困境与内在之火。", reversible: true },
  { id: 10, name: "Isa", symbol: "ᛁ", interpretive: "静止、等待、专注与冰封。", reversible: true },
  { id: 11, name: "Jera", symbol: "ᛃ", interpretive: "收获、周期、转折与因果。", reversible: false },
  { id: 12, name: "Eihwaz", symbol: "ᛇ", interpretive: "依赖、防御、根基与世界之树。", reversible: true },
  { id: 13, name: "Perthro", symbol: "ᛈ", interpretive: "奥秘、直觉、隐藏与命运之轮。", reversible: true },
  { id: 14, name: "Algiz", symbol: "ᛉ", interpretive: "保护、庇护、界限与神圣守护。", reversible: true },
  { id: 15, name: "Sowilo", symbol: "ᛋ", interpretive: "太阳、胜利、光明与生命力。", reversible: true },
  { id: 16, name: "Tiwaz", symbol: "ᛏ", interpretive: "正义、指引、勇气与真理。", reversible: true },
  { id: 17, name: "Berkanan", symbol: "ᛒ", interpretive: "成长、新生、孕育与滋养。", reversible: true },
  { id: 18, name: "Ehwaz", symbol: "ᛖ", interpretive: "伙伴、信任、共行与默契。", reversible: true },
  { id: 19, name: "Mannaz", symbol: "ᛗ", interpretive: "自我、心智、身份与人性。", reversible: true },
  { id: 20, name: "Laguz", symbol: "ᛚ", interpretive: "水、流动、直觉与潜意识。", reversible: true },
  { id: 21, name: "Ingwaz", symbol: "ᛜ", interpretive: "丰饶、完成、种子与内在潜能。", reversible: false },
  { id: 22, name: "Dagaz", symbol: "ᛞ", interpretive: "黎明、突破、觉醒与转化。", reversible: false },
  { id: 23, name: "Othala", symbol: "ᛟ", interpretive: "祖产繁荣、精神家园与传承。", reversible: true },
];

const POSITIONS: Record<string, string[]> = {
  single: ["当下"],
  three_norns: ["乌尔德之井", "薇儿丹蒂之织", "诗蔻蒂之剪"],
  five_cross: ["中心", "上方", "下方", "左方", "右方"],
  seven_worlds: ["阿斯加德", "华纳海姆", "亚尔夫海姆", "中庭", "约顿海姆", "海姆冥界", "尼福尔海姆"],
};

function getRuneById(id: number) {
  return RUNES_24.find((r) => r.id === id);
}

function randomInt(max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function drawRunes(count: number): Array<{ rune: typeof RUNES_24[0]; reversed: boolean }> {
  const out: Array<{ rune: typeof RUNES_24[0]; reversed: boolean }> = [];
  for (let i = 0; i < count; i++) {
    const rune = RUNES_24[randomInt(RUNES_24.length)];
    const reversed = rune.reversible && randomInt(100) < 35;
    out.push({ rune, reversed });
  }
  return out;
}

function buildRuleAdvice(
  question: string,
  drawn: Array<{ rune: typeof RUNES_24[0]; reversed: boolean }>,
  positions: string[]
): string {
  let s = `针对您的问题：「${question}」\n\n`;
  for (let i = 0; i < drawn.length; i++) {
    const { rune, reversed } = drawn[i];
    const pos = positions[i] ?? "核心";
    s += `• ${pos}：${rune.name} ${reversed ? "逆位" : "正位"}\n`;
  }
  const first = drawn[0];
  s += `\n✨ 核心指引：${first.reversed ? "⚠️ 逆位提醒：" : ""}${first.rune.interpretive}\n\n`;
  if (drawn.length > 1) {
    s += "能量场分析：符文能量交织，请综合各位置含义。\n";
  }
  s += "\n🌙 请记住：符文揭示的是能量与可能，而非注定。";
  return s;
}

const RUNE_SYSTEM_PROMPT = `你是一位精通北欧符文的智者，必须严格遵守以下规则：
1. 只基于给定的符文事实进行解读，不得编造任何符文含义。
2. 禁止：将 Fehu 与奥丁错误关联（正确是弗雷）；将 Uruz 描述为水元素（正确是土）；与基督教、佛教等无关宗教混用；声称可预测生死或绝对化表达。
3. 建议部分须包含「你的选择始终自由」类表述。
4. 用诗意的语言，结合北欧神话，给出 200–300 字的指引。`;

/** 按「我们的板块」四层结构生成解读，AI 必须按此格式输出 */
const FOUR_LAYER_SYSTEM = `你是北欧符文大师，必须严格基于给定的符文事实，按以下四块结构为用户讲解，不得编造符文含义。
禁止：Fehu 与奥丁错误关联（应为弗雷）、Uruz 说成水元素（应为土）、绝对化预测、无关宗教混用。
必须用以下四个标题逐段输出，每段 80–150 字，结尾可加「你的选择始终自由」类表述。

请严格按此格式输出，不要多写标题或漏写：
【全景镜像】
（这里写：整体画面、符文脉络、北欧神话意象，与用户问题/主题的关联）
【阴影瓶颈】
（这里写：可能的内在阻碍、需要留意的阴影面或瓶颈）
【动力链条】
（这里写：能量如何流动、可借力的动力与因果链条）
【转化锚点】
（这里写：心理 + 行动 + 掌控，三条具体可执行的锚点，用「心理：」「行动：」「掌控：」分点）`;

function parseFourLayer(text: string): { mirror: string; shadow: string; chain: string; anchor: string } | null {
  const mirror = text.match(/【全景镜像】\s*([\s\S]*?)(?=【阴影瓶颈】|$)/)?.[1]?.trim();
  const shadow = text.match(/【阴影瓶颈】\s*([\s\S]*?)(?=【动力链条】|$)/)?.[1]?.trim();
  const chain = text.match(/【动力链条】\s*([\s\S]*?)(?=【转化锚点】|$)/)?.[1]?.trim();
  const anchor = text.match(/【转化锚点】\s*([\s\S]*?)$/)?.[1]?.trim();
  if (mirror && shadow && chain && anchor) return { mirror, shadow, chain, anchor };
  return null;
}

async function callLLM(
  userPrompt: string,
  apiKey: string,
  provider: "zhipu" | "openai" | "deepseek",
  systemPrompt?: string,
  maxTokens = 600
): Promise<string> {
  const system = systemPrompt ?? RUNE_SYSTEM_PROMPT;
  if (provider === "zhipu") {
    const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "glm-4",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.8,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  }
  // deepseek
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const check = await requireOracleSubscriber(req);
    if (!check.ok) {
      return new Response(check.body, {
        status: check.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const question: string = body.question ?? "我想了解当下的整体指引";
    const theme: string = body.theme ?? "general";
    const spread_type: string = body.spread_type ?? "three_norns";
    const style: string = body.style ?? "balanced"; // traditional | balanced | spiritual
    const drawn_runes: Array<{ rune_id: number; reversed: boolean; position?: string }> | undefined = body.drawn_runes;

    const positions = POSITIONS[spread_type] ?? POSITIONS.three_norns;
    let drawn: Array<{ rune: typeof RUNES_24[0]; reversed: boolean }>;

    if (Array.isArray(drawn_runes) && drawn_runes.length === positions.length) {
      drawn = [];
      for (let i = 0; i < drawn_runes.length; i++) {
        const r = getRuneById(drawn_runes[i].rune_id);
        if (!r) {
          drawn = drawRunes(positions.length);
          break;
        }
        drawn.push({ rune: r, reversed: !!drawn_runes[i].reversed });
      }
      if (drawn.length !== positions.length) drawn = drawRunes(positions.length);
    } else {
      drawn = drawRunes(positions.length);
    }

    const interpretations: string[] = drawn.map(
      (d, i) =>
        `【${d.rune.name} ${d.rune.symbol} ${d.reversed ? "逆位" : "正位"}】\n位置：${positions[i] ?? "核心"}\n核心含义：${d.rune.interpretive}`
    );

    let overall_advice = buildRuleAdvice(question, drawn, positions);

    const ZHIPU_API_KEY = Deno.env.get("ZHIPU_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    const hasLLM = !!(ZHIPU_API_KEY || OPENAI_API_KEY || DEEPSEEK_API_KEY);

    // 按「我们的板块」四层结构让 AI 生成解读（全景镜像、阴影瓶颈、动力链条、转化锚点）
    let master_sections: { mirror: string; shadow: string; chain: string; anchor: string } | null = null;
    const fourLayerUserPrompt = `【符文抽取结果】（请严格基于以下事实，不得编造）
${drawn.map((d, i) => `- ${d.rune.name}（${d.reversed ? "逆位" : "正位"}），位于 ${positions[i] ?? "核心"}，核心含义：${d.rune.interpretive}`).join("\n")}

用户问题：${question}
主题：${theme}
（主题对应：general=综合, love=爱情, wealth=财运, career=事业, health=健康）

请按四块结构【全景镜像】【阴影瓶颈】【动力链条】【转化锚点】逐段输出，每段 80–150 字。`;

    // 优先使用 DeepSeek 讲解（若已配置 DEEPSEEK_API_KEY），其次智谱、OpenAI
    if (hasLLM && style !== "traditional") {
      try {
        let aiFourText = "";
        if (DEEPSEEK_API_KEY) {
          aiFourText = await callLLM(fourLayerUserPrompt, DEEPSEEK_API_KEY, "deepseek", FOUR_LAYER_SYSTEM, 1000);
        } else if (ZHIPU_API_KEY) {
          aiFourText = await callLLM(fourLayerUserPrompt, ZHIPU_API_KEY, "zhipu", FOUR_LAYER_SYSTEM, 1000);
        } else if (OPENAI_API_KEY) {
          aiFourText = await callLLM(fourLayerUserPrompt, OPENAI_API_KEY, "openai", FOUR_LAYER_SYSTEM, 1000);
        }
        if (aiFourText) master_sections = parseFourLayer(aiFourText);
      } catch (e) {
        console.error("rune-reading four-layer LLM error:", e);
      }
    }

    // 若有 AI 四层结果：灵性解读用「全景镜像」，大师解读四块用 AI 内容
    if (master_sections) {
      overall_advice =
        master_sections.mirror +
        "\n\n🌙 请记住：符文揭示的是能量与可能，你的选择始终自由。";
    } else {
      // 无 AI 时保留原规则摘要，并可选补一段短 AI 指引（原逻辑简化）
      const userPrompt = `【符文抽取结果】（请严格基于以下事实，不得编造）
${drawn.map((d, i) => `- ${d.rune.name}（${d.reversed ? "逆位" : "正位"}），位于 ${positions[i] ?? "核心"}，核心含义：${d.rune.interpretive}`).join("\n")}

用户问题：${question}
主题：${theme}

请用诗意的语言，结合北欧神话，给出 200–300 字的指引。`;
      let aiText = "";
      if (hasLLM && style !== "traditional") {
        try {
          if (DEEPSEEK_API_KEY) aiText = await callLLM(userPrompt, DEEPSEEK_API_KEY, "deepseek");
          else if (ZHIPU_API_KEY) aiText = await callLLM(userPrompt, ZHIPU_API_KEY, "zhipu");
          else if (OPENAI_API_KEY) aiText = await callLLM(userPrompt, OPENAI_API_KEY, "openai");
        } catch (e) {
          console.error("rune-reading LLM error:", e);
        }
      }
      if (aiText && aiText.length > 50) {
        const ratio = style === "spiritual" ? 0.3 : 0.6;
        if (ratio <= 0.05) {
          overall_advice = aiText + "\n\n🌙 请记住：符文揭示的是能量与可能，你的选择始终自由。";
        } else {
          overall_advice = overall_advice.slice(0, 300) + "……\n\n" + aiText + "\n\n🌙 请记住：符文揭示的是能量与可能，你的选择始终自由。";
        }
      }
    }

    let ethical_note: string | null = null;
    if (theme === "health" && /生死|癌症|手术/.test(question)) {
      ethical_note = "⚠️ 涉及重大健康问题，请务必咨询专业医生。符文仅作心灵支持。";
    }
    if (/自杀|自伤/.test(question)) {
      ethical_note = "⚠️ 如您或他人有自伤风险，请立即联系专业心理援助。";
    }

    const runes = drawn.map((d, i) => ({
      id: d.rune.id,
      name: d.rune.name,
      symbol: d.rune.symbol,
      interpretive: d.rune.interpretive,
      reversed: d.reversed,
      position: positions[i] ?? null,
    }));

    const result: Record<string, unknown> = {
      id: crypto.randomUUID(),
      question,
      theme,
      spread_type,
      runes,
      interpretations,
      overall_advice,
      ethical_note,
      timestamp: new Date().toISOString(),
    };
    if (master_sections) result.master_sections = master_sections;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rune-reading error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
