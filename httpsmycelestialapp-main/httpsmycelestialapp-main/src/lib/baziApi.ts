/**
 * 八字命理 API 对接
 * 通过 Supabase Edge Function 代理请求，appkey 不暴露在前端。
 */

import { supabase } from "@/integrations/supabase/client";
import type { DivinationInfo } from "@/components/InputCard";

/** 四柱 */
export interface BaziPillars {
  year: string;   // 年柱
  month: string;  // 月柱
  day: string;    // 日柱
  hour: string;   // 时柱
}

/** 五行（得分或描述） */
export interface BaziWuxing {
  wood?: number | string;
  fire?: number | string;
  earth?: number | string;
  metal?: number | string;
  water?: number | string;
}

/** API 返回的标准化结构 */
export interface BaziApiResult {
  pillars: BaziPillars;
  wuxing?: BaziWuxing;
  dayMaster?: string;   // 日主
  xiyongshen?: string;  // 喜用神
  summary?: string;     // 运势/命理解读
  nayin?: string;       // 纳音（可选）
  shishen?: string;     // 十神简述（可选）
  canggan?: string;     // 藏干（可选）
}

/** 请求体：与对接文档一致，出生年月日时、性别、出生地 */
export interface BaziApiRequest {
  birthdatetime: string;  // YYYY-MM-DD HH:MM 或 YYYY年MM月DD日 HH:MM
  gender: 'male' | 'female';
  birthplace?: string;    // 省市，如 北京、台北
}

/** 将 DivinationInfo 转为 API 请求参数 */
export function buildBaziRequest(info: DivinationInfo): BaziApiRequest {
  const hourIndex = info.hour !== '' ? parseInt(info.hour, 10) : 12;
  const hourMap: Record<number, string> = {
    0: '00:00', 1: '02:00', 2: '04:00', 3: '06:00', 4: '08:00',
    5: '10:00', 6: '12:00', 7: '14:00', 8: '16:00', 9: '18:00',
    10: '20:00', 11: '22:00', 12: '12:00',
  };
  const timeStr = hourMap[hourIndex] ?? '12:00';
  const birthdatetime = `${info.year}-${info.month.padStart(2, '0')}-${info.day.padStart(2, '0')} ${timeStr}`;
  return {
    birthdatetime,
    gender: info.gender,
    birthplace: info.region?.trim() || undefined,
  };
}

/** 调用八字 API（经 Edge Function 代理），返回标准化结果或抛错 */
export async function fetchBaziResult(info: DivinationInfo): Promise<BaziApiResult> {
  const body = buildBaziRequest(info);
  const { data, error } = await supabase.functions.invoke<{ data?: BaziApiResult; error?: string; code?: number }>('bazi-api', {
    body: { ...body },
  });

  if (error) {
    throw new Error(error.message || '八字解读服务准备中，敬请期待');
  }

  if (data?.error) {
    const code = data.code;
    if (code === 400) throw new Error('出生信息有误，请检查日期与时辰');
    if (code === 401) throw new Error('服务授权失败，请稍后再试');
    if (code === 500) throw new Error('命理服务繁忙，请稍后再试');
    throw new Error(data.error || '八字解析失败');
  }

  if (!data?.data?.pillars) {
    throw new Error('未返回有效命盘，请稍后再试');
  }

  return data.data;
}
