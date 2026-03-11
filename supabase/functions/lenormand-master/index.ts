import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** 校驗為付費用戶（profiles.oracle_subscriber）後才允許調用 AI */
async function requireOracleSubscriber(req: Request): Promise<{ ok: false; status: number; body: string } | { ok: true }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 402, body: JSON.stringify({ error: "需要登入並訂閱後使用詳細解讀" }) };
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
    return { ok: false, status: 402, body: JSON.stringify({ error: "需要訂閱後使用詳細解讀" }) };
  }
  return { ok: true };
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

    const { system, user } = await req.json();

    if (!system || !user) {
      return new Response(
        JSON.stringify({ error: "Missing system or user prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 占卜类统一：与 rune-reading / oracle-reading 共用同一套 Key，优先 DeepSeek
    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    const ZHIPU_API_KEY = Deno.env.get("ZHIPU_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const messages = [
      { role: "system" as const, content: system },
      { role: "user" as const, content: user },
    ];

    let response: Response;
    if (DEEPSEEK_API_KEY) {
      response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 1500 }),
      });
    } else if (ZHIPU_API_KEY) {
      response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ZHIPU_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "glm-4", messages, max_tokens: 1500, temperature: 0.8 }),
      });
    } else if (OPENAI_API_KEY) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 1500 }),
      });
    } else if (LOVABLE_API_KEY) {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
      });
    } else {
      throw new Error(
        "请在 Supabase 边缘函数 Secrets 中配置 DEEPSEEK_API_KEY（推荐）或 ZHIPU_API_KEY / OPENAI_API_KEY。"
      );
    }

    if (!response.ok) {
      const text = await response.text();
      console.error("lenormand-master AI error:", response.status, text);
      const status = response.status === 429 ? 429 : 500;
      return new Response(
        JSON.stringify({ error: "AI service unavailable", detail: text }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lenormand-master error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

