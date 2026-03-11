/**
 * 八字命盘 · 终极版（玄黑鎏金 + 宣纸肌理）
 * 完全贴合 baziChartConfig 参数化配置，适配高清导出与 AI 调用
 */

import React, { memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { BaziApiResult } from '@/lib/baziApi';
import type { DivinationInfo } from './InputCard';
import { getCharColor } from '@/lib/baziWuxingColors';
import { BAZI_CHART_CONFIG as C } from '@/lib/baziChartConfig';
import './BaziChartImage.css';

const GLOW_CSS = (hex: string) =>
  `0 0 8px ${hex}, 0 0 16px ${hex}`;

/* 宣纸肌理 30% 透明 */
const XUAN_PAPER_URL =
  "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E";

function PillarChar({ char, interactive }: { char: string; interactive?: boolean }) {
  const color = getCharColor(char);
  return (
    <span
      className={interactive ? 'ganzhi-symbol interactive' : 'ganzhi-symbol'}
      style={{
        color,
        textShadow: GLOW_CSS(color),
        fontWeight: 700,
        fontSize: 20,
      }}
    >
      {char}
    </span>
  );
}

export interface BaziChartImageProps {
  info: DivinationInfo;
  baziResult: BaziApiResult;
  premium?: boolean;
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
  const pillars: { label: string; value: string }[] = [
    { label: '年柱', value: p.year || '—' },
    { label: '月柱', value: p.month || '—' },
    { label: '日柱', value: p.day || '—' },
    { label: '时柱', value: p.hour || '—' },
  ];

  return (
    <div
      id="bazi-chart"
      className="bazi-chart-export"
      style={{
        width: 375,
        minHeight: 640,
        background: C.background.color,
        color: '#e0e0e0',
        fontFamily: C.font.content,
        padding: C.container.padding,
        boxSizing: 'border-box',
        position: 'relative',
        borderRadius: C.container.border_radius,
        border: C.container.border,
        boxShadow: C.container.shadow,
      }}
    >
      {/* 宣纸肌理 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${XUAN_PAPER_URL}")`,
          backgroundSize: '256px 256px',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />
      {/* 网格 */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${C.background.grid.color} ${C.background.grid.opacity}, transparent 1px),
            linear-gradient(90deg, ${C.background.grid.color} ${C.background.grid.opacity}, transparent 1px)
          `,
          backgroundSize: `${C.background.grid.size}px ${C.background.grid.size}px`,
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 标题：思源宋体 Bold Italic 48px */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontStyle: 'italic',
              fontFamily: C.font.title,
              letterSpacing: 4,
              color: C.duanyu.text_color,
              margin: 0,
            }}
          >
            天机洞察 · 四柱命盘
          </h1>
        </div>

        {/* 基本信息 */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.qrcode.color}` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.qrcode.text_color }}>{info.name}</div>
          <div style={{ fontSize: 14, color: '#c0c0c0', marginTop: 6 }}>
            {birthStr} {info.region ? ` · ${info.region}` : ''}
          </div>
        </div>

        {/* 四列命盘核心区：天干(28px 脉冲) + 地支(24px) */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          {pillars.map(({ label, value }) => (
            <div
              key={label}
              className="bazi-pillar-column"
              style={{
                width: 84,
                minWidth: 84,
              }}
            >
              <div style={{ fontSize: 12, color: '#909090', marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: C.font.title, letterSpacing: 2 }}>
                {value && value.length >= 2 ? (
                  <>
                    <PillarChar char={value[0]} interactive />
                    <span style={{ fontSize: 16, color: C.columns.elements.earthly_branch.color, marginLeft: 4, marginTop: C.columns.elements.earthly_branch.margin_top, fontFamily: C.font.content }}>{value[1]}</span>
                  </>
                ) : (
                  value.split('').map((c, i) => <PillarChar key={i} char={c} interactive />)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 藏干 / 十神 / 纳音：阶梯式 */}
        <div style={{ marginBottom: 20, fontSize: C.font.content_size }}>
          <div style={{ paddingLeft: C.columns.elements.hidden_stems.indent, color: C.columns.elements.hidden_stems.color, marginBottom: 8, fontSize: C.columns.elements.hidden_stems.font_size }}>
            <span style={{ marginRight: 8 }}>藏干</span>
            {baziResult.canggan || '地支藏干见四柱'}
          </div>
          {baziResult.dayMaster && (
            <div style={{ paddingLeft: C.columns.elements.hidden_stems.indent, marginBottom: 6 }}>
              <span style={{ color: '#909090' }}>日主 </span>
              <span style={{ color: getCharColor(baziResult.dayMaster), textShadow: GLOW_CSS(getCharColor(baziResult.dayMaster)), fontWeight: 700 }}>
                {baziResult.dayMaster}
              </span>
            </div>
          )}
          {baziResult.xiyongshen && (
            <div style={{ paddingLeft: C.columns.elements.ten_gods.indent, marginBottom: 6, color: '#00ffcc' }}>
              <span style={{ color: '#909090' }}>喜用神 </span>
              {baziResult.xiyongshen}
            </div>
          )}
          <div style={{ paddingLeft: C.columns.elements.ten_gods.indent, color: C.columns.elements.ten_gods.color, fontSize: 12, marginBottom: 6, borderBottom: `${C.columns.elements.ten_gods.underline_thickness}px solid ${C.columns.elements.ten_gods.underline_color}`, paddingBottom: 4 }}>
            <span style={{ marginRight: 8 }}>十神</span>
            {baziResult.shishen || '—'}
          </div>
          <div
            style={{
              paddingLeft: C.columns.elements.na_yin.indent,
              color: C.columns.elements.na_yin.color,
              fontSize: 11,
              background: 'linear-gradient(90deg, transparent, rgba(230,194,0,0.1))',
              padding: '8px 0',
            }}
          >
            <span style={{ marginRight: 8 }}>纳音</span>
            {baziResult.nayin || '—'}
          </div>
        </div>

        {/* 断语区：dashed border-top, line-height 2, text #e6c200 */}
        <div
          style={{
            marginTop: C.duanyu.margin_top,
            borderTop: C.duanyu.border_top,
            padding: C.duanyu.padding,
            lineHeight: C.duanyu.line_height,
            textIndent: C.duanyu.first_line_indent,
            color: C.duanyu.text_color,
            fontFamily: C.font.content,
            fontSize: 14,
            fontWeight: 300,
          }}
        >
          {baziResult.summary || '命盘已显，宜顺势而为，修心养性。'}
        </div>

        {!premium && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(230,194,0,0.4)', marginTop: 16 }}>
            仅展示基础排盘，解锁完整报告需升级高级版
          </div>
        )}

        {premium && (
          <div style={{ marginTop: 20, padding: 14, background: 'rgba(0,255,204,0.06)', borderRadius: 8, border: '1px solid rgba(0,255,204,0.25)' }}>
            <div style={{ fontSize: 12, color: '#00ffcc', marginBottom: 6 }}>盲派流年详批</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: '#c0c0c0' }}>近年运势起伏已显于四柱大运，宜把握贵人流年。完整流年可于站内「深度完整版」查看。</p>
            <div style={{ fontSize: 12, color: '#ffcc33', marginTop: 10, marginBottom: 4 }}>一生财富等级</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: '#c0c0c0' }}>财星得地者中上，食伤生财者多利技艺求财。完整层级见深度报告。</p>
          </div>
        )}

        <div style={{ fontSize: 10, color: 'rgba(224,224,224,0.5)', fontStyle: 'italic', marginTop: 20 }}>
          命理结果仅供参考，请勿迷信。
        </div>

        {/* 二维码 + 文案：size 120, border 2px #e6c200, 思源黑体 Medium 14px */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: C.qrcode.margin_top,
            paddingTop: 20,
            borderTop: `1px solid ${C.qrcode.color}`,
          }}
        >
          <div
            className="bazi-qr-wrap"
            style={{
              border: C.qrcode.border,
              borderRadius: 12,
              padding: 8,
              display: 'inline-block',
            }}
          >
            <QRCodeSVG
              value={C.qrcode.url}
              size={88}
              level="H"
              includeMargin={false}
              fgColor={C.qrcode.color}
              bgColor={C.qrcode.bg_color}
            />
          </div>
          {showQrCaption && (
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                fontWeight: C.qrcode.text_weight,
                color: C.qrcode.text_color,
                fontFamily: C.qrcode.text_font,
                textAlign: 'center',
                whiteSpace: 'pre-line',
              }}
            >
              {C.qrcode.text}
            </div>
          )}
        </div>

        {/* 水印：bottom_right, opacity 0.15, angle -15 */}
        <div
          aria-hidden
          className="bazi-watermark"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 16,
            fontSize: C.watermark.font_size,
            color: C.watermark.color,
            fontFamily: C.watermark.font,
            opacity: C.watermark.opacity,
            transform: `rotate(${C.watermark.angle}deg)`,
            pointerEvents: 'none',
          }}
        >
          {C.watermark.text}
        </div>
      </div>
    </div>
  );
}

const BaziChartImage = memo(BaziChartImageInner);
export default BaziChartImage;
