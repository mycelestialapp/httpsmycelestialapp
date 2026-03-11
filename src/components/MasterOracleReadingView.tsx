import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Lock } from 'lucide-react';
import type { OracleReading } from '@/lib/oracleMasterReading';
import { GlassCard } from '@/components/ui/glass-card';

interface MasterOracleReadingViewProps {
  reading: OracleReading;
  /** 是否已成功解鎖付費層（目前先用假資料開關） */
  isUnlocked: boolean;
  /** 點擊解鎖按鈕時呼叫，之後可接 Supabase 付款流程 */
  onUnlock: () => void | Promise<void>;
  /** 正在解鎖中的 loading 狀態（例如等待付款回傳） */
  unlocking?: boolean;
  /** 存檔/解讀記錄頁使用：跳過打字機動畫，直接顯示完整文字 */
  archiveView?: boolean;
  /** 付費區塊位置：inline=緊接免費層下方（預設）；bottom=由呼叫方放在最底部（如牌陣總結之後） */
  paidSectionPosition?: 'inline' | 'bottom';
}

const ReadingText = ({ mirroring }: { mirroring: string }) => (
  <div className="max-w-full font-serif text-gold-strong tracking-[0.08em] leading-[1.75] sand-flux-reveal">
    <p className="text-base sm:text-lg mb-2">[ 鏡像復述 ]</p>
    <p className="text-base sm:text-lg whitespace-pre-line">{mirroring}</p>
  </div>
);

export default function MasterOracleReadingView({
  reading,
  isUnlocked,
  onUnlock,
  unlocking = false,
  archiveView = false,
  paidSectionPosition = 'inline',
}: MasterOracleReadingViewProps) {
  const { t } = useTranslation();
  const [typedMirroring, setTypedMirroring] = useState('');

  // 存檔頁：直接顯示全文；否則用打字機效果
  useEffect(() => {
    const full = reading.freeTier.mirroring ?? '';
    if (!full) {
      setTypedMirroring('');
      return;
    }
    if (archiveView) {
      setTypedMirroring(full);
      return;
    }
    setTypedMirroring('');
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedMirroring(full.slice(0, index));
      if (index >= full.length) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [reading.freeTier.mirroring, archiveView]);

  const premium = reading.premiumTier;
  const isMultiCard = reading.cards.length > 1;

  const premiumPreview =
    premium.shadowWork?.slice(0, 42) ||
    premium.dynamics?.slice(0, 42) ||
    '';

  return (
    <GlassCard className="mt-5 space-y-5" tone="surface1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center rounded-full px-3 py-1.5 bg-black/40 border border-gold-strong/60">
            <Sparkles size={18} className="text-gold-strong mr-1" />
            <span className="text-[15px] font-semibold tracking-[0.16em] text-gold-strong uppercase">
              {t('oracle.basicReadingTitle', { defaultValue: '基本解讀' })}
            </span>
          </div>
        </div>
        <p className="text-sm sm:text-base text-[color:var(--ui-text-weak)]">
          {isUnlocked
            ? t('oracle.basicReadingFull', { defaultValue: '基本解讀 · 完整內容' })
            : t('oracle.basicReadingFreeFirst', { defaultValue: '基本解讀 · 先顯示免費部分' })}
        </p>
      </div>

      {/* 免費層：鏡像 + 靈魂核心，分段小標題 + 留白呼吸感 */}
      <div className="space-y-4">
        <GlassCard tone="surface2" density="compact" hoverEffect={false} className="flex justify-center">
          <ReadingText mirroring={typedMirroring || reading.freeTier.mirroring} />
        </GlassCard>

        <GlassCard tone="surface1" density="compact" hoverEffect={false} className="space-y-2">
          <p className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-[color:var(--ui-text-weak)]">
            {t('oracle.soulCoreTitle', { defaultValue: '靈魂核心啟示' })}
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-body whitespace-pre-line">
            {reading.freeTier.soulCore}
          </p>
        </GlassCard>

        {reading.freeTier.cardMeaning && (
          <GlassCard tone="surface1" density="compact" hoverEffect={false} className="space-y-2">
            <p className="text-sm sm:text-base font-semibold tracking-[0.18em] uppercase text-[color:var(--ui-text-weak)]">
              {t('oracle.cardMeaningTitle', { defaultValue: '牌面解讀' })}
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-body whitespace-pre-line">
              {reading.freeTier.cardMeaning}
            </p>
          </GlassCard>
        )}
      </div>

      {/* 付費層：inline 時緊接在免費層下方；bottom 時由呼叫方放在最底部（牌陣總結之後） */}
      {paidSectionPosition === 'inline' && (
        <PaidSectionBlock
          reading={reading}
          isUnlocked={isUnlocked}
          onUnlock={onUnlock}
          unlocking={unlocking}
          premium={premium}
          isMultiCard={isMultiCard}
          premiumPreview={premiumPreview}
        />
      )}
    </GlassCard>
  );
}

/** 深度轉化區（付費解鎖）區塊，可單獨放在頁面最底部使用 */
export function MasterOracleReadingPaidSection({
  reading,
  isUnlocked,
  onUnlock,
  unlocking = false,
}: {
  reading: OracleReading;
  isUnlocked: boolean;
  onUnlock: () => void | Promise<void>;
  unlocking?: boolean;
}) {
  const premium = reading.premiumTier;
  const isMultiCard = reading.cards.length > 1;
  const premiumPreview =
    premium.shadowWork?.slice(0, 42) ||
    premium.dynamics?.slice(0, 42) ||
    '';
  return (
    <PaidSectionBlock
      reading={reading}
      isUnlocked={isUnlocked}
      onUnlock={onUnlock}
      unlocking={unlocking}
      premium={premium}
      isMultiCard={isMultiCard}
      premiumPreview={premiumPreview}
    />
  );
}

function PaidSectionBlock({
  reading: _reading,
  isUnlocked,
  onUnlock,
  unlocking,
  premium,
  isMultiCard,
  premiumPreview,
}: {
  reading: OracleReading;
  isUnlocked: boolean;
  onUnlock: () => void | Promise<void>;
  unlocking?: boolean;
  premium: OracleReading['premiumTier'];
  isMultiCard: boolean;
  premiumPreview: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="relative mt-2 rounded-2xl overflow-hidden border shadow-inner"
      style={{
        borderColor: 'hsla(var(--gold) / 0.55)',
        background:
          'linear-gradient(135deg, rgba(22,14,40,0.90), rgba(10,8,28,0.98))',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(circle at 0 0, rgba(250,230,200,0.18) 0, transparent 55%), ' +
            'radial-gradient(circle at 100% 100%, rgba(180,160,255,0.25) 0, transparent 55%)',
        }}
      />

      <div className="relative px-4 py-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-semibold tracking-widest uppercase text-gold-strong">
            深度轉化區（付費解鎖）
          </p>
          {!isUnlocked && (
            <div className="flex items-center gap-1.5 text-base text-gold-strong/90">
              <Lock size={18} />
              <span>磨砂保護：解鎖後才會顯示全文</span>
            </div>
          )}
        </div>

        {isUnlocked ? (
          <div className="space-y-3 text-[16px] leading-relaxed text-body">
            <Section title="陰影察覺">{premium.shadowWork}</Section>
            <Section title={isMultiCard ? '多牌能量對話' : '牌面的能量視角'}>
              {premium.dynamics}
            </Section>
            <Section title="本週微習慣">{premium.microAction}</Section>
            <Section title="給靈魂的最後提問">
              {premium.finalQuestion}
            </Section>
          </div>
        ) : (
          <div className="space-y-2 text-[15px] text-subtitle/95">
            <p className="leading-relaxed">
              這一區會更直接切入你的盲點、關係動能，以及可以立刻開始的小習慣。
            </p>
            <div className="rounded-xl border border-gold-strong/50 bg-black/35 px-4 py-3">
              <p className="text-[15px] text-gold-strong mb-1">
                預覽（已模糊處理）
              </p>
              <p className="text-[15px] text-body/80 blur-[2px] select-none">
                {premiumPreview || '解鎖後，這裡會具體描述你的陰影模式與轉化方向。'}
              </p>
            </div>
          </div>
        )}

        {!isUnlocked && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => onUnlock()}
              disabled={unlocking}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[15px] font-semibold tracking-wide border border-gold-strong/70 bg-black/40 text-gold-strong hover:bg-gold-soft/15 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              {unlocking
                ? t('oracle.unlocking', { defaultValue: '解鎖中…' })
                : t('oracle.shadowCta', { defaultValue: '感知你的陰影，收回被困的能量' })}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-medium tracking-widest uppercase text-subtitle">
        {title}
      </p>
      <p className="text-[16px] leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}

