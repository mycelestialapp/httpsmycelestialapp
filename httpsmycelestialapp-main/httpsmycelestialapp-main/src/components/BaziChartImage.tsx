/**
 * 命盘高清长图（Deep Purple 殿堂级）
 * 专供 html2canvas 导出：背景 #1a0b2e，干支发光分色，底部二维码裂变
 */

import { QRCodeCanvas } from 'qrcode.react';
import type { BaziApiResult } from '@/lib/baziApi';
import type { DivinationInfo } from './InputCard';
import { getCharColor } from '@/lib/baziWuxingColors';

const BG = '#1a0b2e';
const TITLE_GOLD = '#d4af37';
const LABEL_MUTED = 'rgba(232, 224, 208, 0.85)';
const GLOW_CSS = (hex: string) =>
  `0 0 8px ${hex}, 0 0 16px ${hex}, 0 0 24px ${hex}`;

function PillarChar({ char }: { char: string }) {
  const color = getCharColor(char);
  return (
    <span
      style={{
        color,
        textShadow: GLOW_CSS(color),
        fontWeight: 700,
      }}
    >
      {char}
    </span>
  );
}

function PillarRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color: LABEL_MUTED, fontSize: 12, width: 32 }}>{label}</span>
      <span style={{ fontFamily: 'serif', fontSize: 18, letterSpacing: 2 }}>
        {value.split('').map((c, i) => (
          <PillarChar key={i} char={c} />
        ))}
      </span>
    </div>
  );
}

export interface BaziChartImageProps {
  info: DivinationInfo;
  baziResult: BaziApiResult;
  /** 是否包含付费内容：盲派流年详批、一生财富等级 */
  premium?: boolean;
  /** 导出用：隐藏二维码旁文案在部分场景可省 */
  showQrCaption?: boolean;
}

export default function BaziChartImage({
  info,
  baziResult,
  premium = false,
  showQrCaption = true,
}: BaziChartImageProps) {
  const p = baziResult.pillars;
  const birthStr = `${info.year}-${info.month}-${info.day}`;

  return (
    <div
      id="bazi-chart-export"
      style={{
        width: 375,
        minHeight: 640,
        background: BG,
        color: '#e8e0d0',
        fontFamily: 'var(--font-serif), "Noto Serif SC", serif',
        padding: '24px 20px 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: LABEL_MUTED, marginBottom: 6 }}>
          ━━ CELESTIAL ORACLE ━━
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            color: TITLE_GOLD,
            textShadow: GLOW_CSS(TITLE_GOLD),
            margin: 0,
          }}
        >
          天机洞察 · 四柱命盘
        </h1>
      </div>

      {/* 基本信息 */}
      <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: TITLE_GOLD }}>{info.name}</div>
        <div style={{ fontSize: 12, color: LABEL_MUTED, marginTop: 4 }}>
          {birthStr} {info.region ? ` · ${info.region}` : ''}
        </div>
      </div>

      {/* 盲派排盘：四柱 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: LABEL_MUTED, marginBottom: 10 }}>
          四柱 · 干支
        </div>
        <PillarRow label="年柱" value={p.year || '—'} />
        <PillarRow label="月柱" value={p.month || '—'} />
        <PillarRow label="日柱" value={p.day || '—'} />
        <PillarRow label="时柱" value={p.hour || '—'} />
      </div>

      {/* 藏干（盲派排盘） */}
      <div style={{ marginBottom: 12, fontSize: 12, color: LABEL_MUTED }}>
        <span style={{ marginRight: 8 }}>藏干</span>
        <span style={{ color: 'rgba(232,224,208,0.8)' }}>
          {baziResult.canggan || '地支藏干见四柱，详参站内完整排盘'}
        </span>
      </div>

      {/* 日主、喜用神、纳音、十神 */}
      <div style={{ marginBottom: 16, fontSize: 13 }}>
        {baziResult.dayMaster && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: LABEL_MUTED }}>日主 </span>
            <span style={{ color: getCharColor(baziResult.dayMaster), textShadow: GLOW_CSS(getCharColor(baziResult.dayMaster)) }}>
              {baziResult.dayMaster}
            </span>
          </div>
        )}
        {baziResult.xiyongshen && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: LABEL_MUTED }}>喜用神 </span>
            <span style={{ color: '#00ffcc' }}>{baziResult.xiyongshen}</span>
          </div>
        )}
        {baziResult.nayin && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ color: LABEL_MUTED }}>纳音 </span>
            <span>{baziResult.nayin}</span>
          </div>
        )}
        {baziResult.shishen && (
          <div>
            <span style={{ color: LABEL_MUTED }}>十神 </span>
            <span>{baziResult.shishen}</span>
          </div>
        )}
      </div>

      {/* 盲派核心断语 */}
      <div style={{ marginBottom: 20, padding: 14, background: 'rgba(212,175,55,0.08)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.2)' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: TITLE_GOLD, marginBottom: 8 }}>
          盲派核心断语
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: 'rgba(232,224,208,0.95)' }}>
          {baziResult.summary || '命盘已显，宜顺势而为，修心养性。'}
        </p>
      </div>

      {/* 付费：流年详批 + 财富等级 */}
      {premium && (
        <div style={{ marginBottom: 20, padding: 14, background: 'rgba(0,255,204,0.06)', borderRadius: 8, border: '1px solid rgba(0,255,204,0.25)' }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#00ffcc', marginBottom: 8 }}>
            盲派流年详批
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: LABEL_MUTED }}>
            近年运势起伏已显于四柱大运，宜把握贵人流年，规避刑冲岁运。具体流年吉凶可于站内「深度完整版」查看。
          </p>
          <div style={{ fontSize: 11, letterSpacing: 2, color: '#ffcc33', marginTop: 12, marginBottom: 6 }}>
            一生财富等级
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: LABEL_MUTED }}>
            财星得地者中上，食伤生财者多利技艺与口才求财；官杀护财者易得权贵之助。完整财富层级见深度报告。
          </p>
        </div>
      )}

      {/* 免责 */}
      <div style={{ fontSize: 10, color: 'rgba(232,224,208,0.5)', fontStyle: 'italic', marginBottom: 24 }}>
        命理结果仅供参考，请勿迷信。
      </div>

      {/* 底部：二维码 + 吸粉文案 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          borderTop: '1px solid rgba(212,175,55,0.2)',
        }}
      >
        <QRCodeCanvas
          value="https://mycelestial.app"
          size={88}
          level="H"
          includeMargin={false}
          style={{ display: 'block' }}
          bgColor="#1a0b2e"
          fgColor="#e8e0d0"
        />
        {showQrCaption && (
          <div
            style={{
              marginTop: 12,
              fontSize: 14,
              fontWeight: 600,
              color: TITLE_GOLD,
              textShadow: `0 0 10px ${TITLE_GOLD}`,
              letterSpacing: 2,
            }}
          >
            扫码窥探你的天机报告
          </div>
        )}
      </div>
    </div>
  );
}
