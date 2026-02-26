/**
 * 命盘高清长图（Deep Purple 殿堂级 · 优化版）
 * 深紫渐变+噪点、干支脉冲发光、阶梯排版、二维码裂变、免费水印/付费完整
 */

import React, { memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BaziApiResult } from '@/lib/baziApi';
import type { DivinationInfo } from './InputCard';
import { getCharColor } from '@/lib/baziWuxingColors';
import './BaziChartImage.css';

const BG_GRADIENT = 'linear-gradient(180deg, #1a0b2e 0%, #2a1b4e 100%)';
const TITLE_GOLD = '#ffd700';
const BORDER_GOLD = '#e6c200';
const LABEL_MUTED = 'rgba(232, 224, 208, 0.85)';
const GLOW_CSS = (hex: string) =>
  `0 0 8px ${hex}, 0 0 16px ${hex}, 0 0 24px ${hex}`;

/* 极简噪点纹理 SVG data URL（深紫 0.5px 质感） */
const NOISE_DATA_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E";

function PillarChar({ char }: { char: string }) {
  const color = getCharColor(char);
  return (
    <span
      className="ganzhi-symbol"
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: '10px 12px',
        border: `1px solid ${BORDER_GOLD}`,
        borderRadius: 8,
      }}
    >
      <span style={{ color: LABEL_MUTED, fontSize: 12, width: 36 }}>{label}</span>
      <span style={{ fontFamily: '"Noto Serif SC", serif', fontSize: 18, letterSpacing: 2 }}>
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

function BaziChartImageInner({
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
      className="bazi-chart-export"
      style={{
        width: 375,
        minHeight: 640,
        background: BG_GRADIENT,
        color: '#e8e0d0',
        fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif',
        padding: '24px 20px 28px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* 深紫色噪点纹理叠加 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${NOISE_DATA_URL}")`,
          backgroundSize: '256px 256px',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 顶部标题：思源宋体 Bold Italic 40px + 金色描边 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: LABEL_MUTED, marginBottom: 8 }}>
            ━━ CELESTIAL ORACLE ━━
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              fontStyle: 'italic',
              fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif',
              letterSpacing: 4,
              color: TITLE_GOLD,
              margin: 0,
              WebkitTextStroke: '1px #ffd700',
              textShadow: GLOW_CSS(TITLE_GOLD),
            }}
          >
            天机洞察 · 四柱命盘
          </h1>
        </div>

        {/* 基本信息 */}
        <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${BORDER_GOLD}` }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: TITLE_GOLD }}>{info.name}</div>
          <div style={{ fontSize: 12, color: LABEL_MUTED, marginTop: 4 }}>
            {birthStr} {info.region ? ` · ${info.region}` : ''}
          </div>
        </div>

        {/* 盲派排盘：四柱（每柱 1px 浅金框） */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: LABEL_MUTED, marginBottom: 10 }}>
            四柱 · 干支
          </div>
          <PillarRow label="年柱" value={p.year || '—'} />
          <PillarRow label="月柱" value={p.month || '—'} />
          <PillarRow label="日柱" value={p.day || '—'} />
          <PillarRow label="时柱" value={p.hour || '—'} />
        </div>

        {/* 阶梯式：藏干 2px / 十神 4px / 纳音 6px */}
        <div style={{ marginBottom: 16, fontSize: 13 }}>
          <div style={{ marginBottom: 8, paddingLeft: 2, color: LABEL_MUTED }}>
            <span style={{ marginRight: 8 }}>藏干</span>
            <span style={{ color: 'rgba(232,224,208,0.9)' }}>
              {baziResult.canggan || '地支藏干见四柱，详参站内完整排盘'}
            </span>
          </div>
          {baziResult.dayMaster && (
            <div style={{ marginBottom: 6, paddingLeft: 2 }}>
              <span style={{ color: LABEL_MUTED }}>日主 </span>
              <span
                className="ganzhi-symbol"
                style={{
                  color: getCharColor(baziResult.dayMaster),
                  textShadow: GLOW_CSS(getCharColor(baziResult.dayMaster)),
                  fontWeight: 700,
                }}
              >
                {baziResult.dayMaster}
              </span>
            </div>
          )}
          {baziResult.xiyongshen && (
            <div style={{ marginBottom: 6, paddingLeft: 4 }}>
              <span style={{ color: LABEL_MUTED }}>喜用神 </span>
              <span style={{ color: '#00ffcc' }}>{baziResult.xiyongshen}</span>
            </div>
          )}
          {baziResult.nayin && (
            <div style={{ marginBottom: 6, paddingLeft: 6 }}>
              <span style={{ color: LABEL_MUTED }}>纳音 </span>
              <span>{baziResult.nayin}</span>
            </div>
          )}
          {baziResult.shishen && (
            <div style={{ paddingLeft: 6 }}>
              <span style={{ color: LABEL_MUTED }}>十神 </span>
              <span>{baziResult.shishen}</span>
            </div>
          )}
        </div>

        {/* 盲派核心断语：背景 #0d0618，思源黑体 Light 14px 行高 1.8 */}
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            background: '#0d0618',
            borderRadius: 8,
            border: `1px solid rgba(230,194,0,0.3)`,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: 2, color: TITLE_GOLD, marginBottom: 10 }}>
            盲派核心断语
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              margin: 0,
              color: '#e0e0e0',
              fontFamily: '"Noto Sans SC", "Source Han Sans SC", sans-serif',
              fontWeight: 300,
            }}
          >
            {baziResult.summary || '命盘已显，宜顺势而为，修心养性。'}
          </p>
        </div>

        {/* 免费用户水印：半透明金色 */}
        {!premium && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'rgba(255, 215, 0, 0.35)',
              marginBottom: 16,
              fontFamily: '"Noto Sans SC", sans-serif',
            }}
          >
            仅展示基础排盘，解锁完整报告需升级高级版
          </div>
        )}

        {/* 付费：流年详批 + 财富等级 */}
        {premium && (
          <div
            style={{
              marginBottom: 20,
              padding: 14,
              background: 'rgba(0,255,204,0.06)',
              borderRadius: 8,
              border: '1px solid rgba(0,255,204,0.25)',
            }}
          >
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

        {/* 底部：矢量二维码(SVG) + 金框 + 吸粉文案 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 16,
            borderTop: `1px solid ${BORDER_GOLD}`,
          }}
        >
          <div className="bazi-qr-wrap">
            <QRCodeSVG
              value="https://mycelestial.app"
              size={140}
              level="H"
              includeMargin={false}
              fgColor="#ffd700"
              bgColor="transparent"
            />
          </div>
          {showQrCaption && (
            <div className="bazi-qr-caption" style={{ marginTop: 14 }}>
              扫码解锁专属天机报告
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const BaziChartImage = memo(BaziChartImageInner);
export default BaziChartImage;
