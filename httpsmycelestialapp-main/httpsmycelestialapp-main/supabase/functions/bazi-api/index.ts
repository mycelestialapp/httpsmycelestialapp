/**
 * 八字 API 代理：在服务端携带 appkey 请求第三方八字接口，避免密钥暴露在前端。
 * 环境变量：BAZI_API_URL（必填）、BAZI_APPKEY（必填）
 * 若未配置则返回 503，前端可降级为本地展示。
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BaziRequestBody {
  birthdatetime: string;
  gender: "male" | "female";
  birthplace?: string;
}

interface BaziPillars {
  year: string;
  month: string;
  day: string;
  hour: string;
}

interface BaziApiResult {
  pillars: BaziPillars;
  wuxing?: Record<string, number | string>;
  dayMaster?: string;
  xiyongshen?: string;
  summary?: string;
  nayin?: string;
  shishen?: string;
}

function normalizePillars(raw: Record<string, unknown>): BaziPillars {
  const get = (keys: string[]): string => {
    for (const k of keys) {
      const v = raw[k];
      if (typeof v === "string") return v;
    }
    return "";
  };
  return {
    year: get(["year_pillar", "年柱", "year", "nianzhu"]),
    month: get(["month_pillar", "月柱", "month", "yuezhu"]),
    day: get(["day_pillar", "日柱", "day", "rizhu"]),
    hour: get(["hour_pillar", "时柱", "hour", "shizhu"]),
  };
}

function normalizeResult(raw: Record<string, unknown>): BaziApiResult {
  const pillars = normalizePillars(
    (raw.pillars as Record<string, unknown>) || raw
  );
  const result: BaziApiResult = { pillars };

  const wuxing = raw.wuxing ?? raw.五行 ?? raw.wuxing_scores;
  if (wuxing && typeof wuxing === "object" && !Array.isArray(wuxing)) {
    result.wuxing = wuxing as Record<string, number | string>;
  }

  const dayMaster = raw.day_master ?? raw.日主 ?? raw.rizhu;
  if (typeof dayMaster === "string") result.dayMaster = dayMaster;

  const xiyongshen = raw.xiyongshen ?? raw.喜用神 ?? raw.xiyong;
  if (typeof xiyongshen === "string") result.xiyongshen = xiyongshen;

  const summary = raw.summary ?? raw.命理解读 ?? raw.运势 ?? raw.analysis;
  if (typeof summary === "string") result.summary = summary;

  const nayin = raw.nayin ?? raw.纳音;
  if (typeof nayin === "string") result.nayin = nayin;

  const shishen = raw.shishen ?? raw.十神;
  if (typeof shishen === "string") result.shishen = shishen;

  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiUrl = Deno.env.get("BAZI_API_URL");
  const appkey = Deno.env.get("BAZI_APPKEY");

  if (!apiUrl?.trim() || !appkey?.trim()) {
    return new Response(
      JSON.stringify({
        error: "八字服务未配置",
        code: 503,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const body = (await req.json()) as BaziRequestBody;
    const { birthdatetime, gender, birthplace } = body;

    if (!birthdatetime?.trim()) {
      return new Response(
        JSON.stringify({ error: "缺少出生时间", code: 400 }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const genderStr = gender === "female" ? "女" : "男";
    const payload = {
      birthdatetime: birthdatetime.trim(),
      gender: genderStr,
      birthplace: birthplace?.trim() || "",
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appkey}`,
        "X-API-Key": appkey,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({
          error: "八字接口返回格式异常",
          code: 502,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!res.ok) {
      const code = res.status === 401 ? 401 : res.status >= 500 ? 500 : 400;
      const errMsg =
        (json as { message?: string }).message ??
        (json as { error?: string }).error ??
        `请求失败 ${res.status}`;
      return new Response(
        JSON.stringify({ error: String(errMsg), code }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = (json.data ?? json.result ?? json) as Record<string, unknown>;
    const normalized = normalizeResult(data);

    if (
      !normalized.pillars.year &&
      !normalized.pillars.month &&
      !normalized.pillars.day &&
      !normalized.pillars.hour
    ) {
      return new Response(
        JSON.stringify({
          error: "接口未返回有效四柱",
          code: 502,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ data: normalized }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "八字服务异常";
    return new Response(
      JSON.stringify({ error: message, code: 500 }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
