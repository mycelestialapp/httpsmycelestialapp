import React from 'react';
import type { LenormandCardEntry } from '@/lib/lenormandCards';
import { LENORMAND_MASTER_DB } from '@/lib/lenormandMasterDb';

interface SelectedCardOverlayProps {
  card: LenormandCardEntry;
  onClose: () => void;
}

const SelectedCardOverlay: React.FC<SelectedCardOverlayProps> = ({ card, onClose }) => {
  const master = LENORMAND_MASTER_DB[String(card.id)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 磨砂玻璃背景：營造神聖感 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-12 px-6">
        {/* 3D 翻轉後的全息牌面（使用符號作為能量核心） */}
        <div className="w-52 h-80 md:w-64 md:h-96 rounded-xl border border-gold shadow-[0_0_40px_rgba(212,175,55,0.35)] bg-obsidian flex items-center justify-center">
          <div className="flex items-center justify-center text-gold text-6xl md:text-7xl">
            {card.symbol}
          </div>
        </div>

        {/* 側邊流沙解讀文字 */}
        <div
          className="max-w-md text-gold font-serif space-y-5 animate-reveal"
          style={{
            animation: 'sandFlux 1.8s ease-out',
            letterSpacing: '0.16em',
          }}
        >
          <p className="text-sm opacity-55 tracking-[0.3em] uppercase">
            The Message
          </p>
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.16em]">
            {master?.name ?? card.nameZh}
          </h2>

          {master ? (
            <div className="space-y-4 leading-relaxed opacity-90 text-sm md:text-base">
              <p className="opacity-75 text-sm uppercase tracking-[0.2em]">
                鏡像
              </p>
              <p>{master.mirror}</p>

              <p className="mt-3 opacity-75 text-sm uppercase tracking-[0.2em]">
                相位
              </p>
              <p>{master.reality}</p>

              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-gold">
                陰影
              </p>
              <p>{master.shadow}</p>

              <p className="mt-3 opacity-75 text-sm uppercase tracking-[0.2em]">
                微禪
              </p>
              <p>{master.zen}</p>
            </div>
          ) : (
            <p className="text-sm md:text-base leading-relaxed opacity-85">
              {card.shortMeaning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectedCardOverlay;

