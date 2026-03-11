import { describe, it, expect } from 'vitest';
import { computeLocalBazi } from './baziLocal';
import { generateBaziReading } from './baziReading';

describe('baziReading', () => {
  it('generates long (paid) reading for 1984-11-26 male 东北', () => {
    const info = {
      year: '1984',
      month: '11',
      day: '26',
      hour: '6',
      longitude: 125,
      useSolarTime: true,
      birthHour: 12,
      birthMinute: 0,
      gender: 'male' as const,
    };
    const baziResult = computeLocalBazi(info);
    const paidText = generateBaziReading(baziResult, { level: 'long', gender: 'male' });
    expect(paidText).toBeTypeOf('string');
    expect(paidText).toContain('一、命局与为人');
    expect(paidText).toContain('七、风水与子女');
    expect(paidText).toContain('二、神煞十神的解读');
    // 方便用户查看：把付费版全文打印到控制台
    if (typeof process !== 'undefined' && process.env?.PRINT_BAZI_LONG === '1') {
      console.log('\n========== 付费版解读（1984-11-26 男 东北）==========\n');
      console.log(paidText);
      console.log('\n============================================\n');
    }
  });
});
