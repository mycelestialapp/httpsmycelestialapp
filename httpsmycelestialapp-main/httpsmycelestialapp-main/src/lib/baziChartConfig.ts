/**
 * 八字命盘 · 终极版视觉与交互配置（AI 可调用的参数化指令）
 * 玄黑鎏金 + 宣纸肌理
 */

export const BAZI_CHART_CONFIG = {
  background: {
    color: '#0d0618',
    texture: 'xuan_paper_30_transparent',
    grid: {
      color: '#e6c200',
      opacity: 0.1,
      size: 10,
    },
  },
  font: {
    title: '"Noto Serif SC", "Source Han Serif SC", serif',
    title_size: 48,
    content: '"Noto Sans SC", "Source Han Sans SC", sans-serif',
    content_size: 16,
  },
  container: {
    border_radius: 24,
    border: '3px solid #e6c200',
    shadow: '0 0 20px rgba(230,194,0,0.3)',
    padding: 30,
  },
  columns: {
    width: 240,
    gap: 15,
    elements: {
      heavenly_stem: { font_size: 28, pulse_duration: 1500 },
      earthly_branch: { font_size: 24, color: '#e0e0e0', margin_top: 8 },
      hidden_stems: { font_size: 18, color: '#c0c0c0', indent: 3 },
      ten_gods: { font_size: 16, color: '#909090', indent: 6, underline_color: '#e6c200', underline_thickness: 1 },
      na_yin: { font_size: 14, color: '#666666', indent: 9 },
    },
  },
  duanyu: {
    margin_top: 20,
    border_top: '1px dashed #e6c200',
    padding: 20,
    line_height: 2.0,
    first_line_indent: 2,
    text_color: '#e6c200',
  },
  qrcode: {
    url: 'https://mycelestial.app',
    size: 120,
    color: '#e6c200',
    bg_color: '#0d0618',
    border: '2px solid #e6c200',
    margin_top: 20,
    text: '扫码关注 Celestial Insights\n获取专属天机报告',
    text_color: '#e0e0e0',
    text_font: '"Noto Sans SC", "Source Han Sans SC", sans-serif',
    text_size: 14,
    text_weight: 500,
  },
  watermark: {
    text: 'Celestial Insights · 版权所有',
    position: 'bottom_right' as const,
    opacity: 0.15,
    color: '#e0e0e0',
    font: '"Noto Serif SC", "Source Han Serif SC", serif',
    font_size: 10,
    angle: -15,
  },
} as const;
