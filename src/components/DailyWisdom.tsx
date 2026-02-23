import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WISDOMS_EN = [
  "Today is for bold Action — seize every opportunity.",
  "A day of quiet Reflection — listen to your inner voice.",
  "Creative Energy flows strongly — express yourself.",
  "Focus on Connections — meaningful bonds await.",
  "Patience is your superpower today — trust the process.",
  "Adventure calls — step outside your comfort zone.",
  "A day to nurture yourself — rest is productive too.",
  "Transformation is near — embrace the change.",
  "Your intuition is razor-sharp — follow your gut.",
  "Generosity returns tenfold — give freely today.",
];

const WISDOMS_ZH = [
  "今日宜大膽行動——抓住每一個機會。",
  "今日宜靜心反思——傾聽內在的聲音。",
  "創造能量充沛——盡情表達自己。",
  "專注人際連結——有意義的緣分正在等你。",
  "耐心是你今天的超能力——相信過程。",
  "冒險在召喚——踏出舒適區吧。",
  "今日宜自我關懷——休息也是一種力量。",
  "蛻變將至——擁抱改變。",
  "你的直覺如刀鋒般銳利——跟隨你的感覺。",
  "慷慨必有回報——今天就大方付出。",
];

const WISDOMS_FR = [
  "Aujourd'hui est fait pour l'Action — saisissez chaque opportunité.",
  "Un jour de Réflexion tranquille — écoutez votre voix intérieure.",
  "L'Énergie créative coule fort — exprimez-vous.",
  "Concentrez-vous sur les Connexions — des liens profonds vous attendent.",
  "La Patience est votre superpouvoir — faites confiance au processus.",
  "L'Aventure appelle — sortez de votre zone de confort.",
  "Un jour pour prendre soin de vous — le repos est aussi productif.",
  "La Transformation approche — accueillez le changement.",
  "Votre intuition est aiguisée — suivez votre instinct.",
  "La Générosité revient au centuple — donnez librement aujourd'hui.",
];

function getDailyScore(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Simple hash
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.floor((x - Math.floor(x)) * 61) + 40; // 40-100
}

function getDailyWisdomIndex(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const x = Math.sin(seed * 1237 + 7919) * 10000;
  return Math.floor(Math.abs(x) % 10);
}

const DailyWisdom = () => {
  const { t, i18n } = useTranslation();
  const score = getDailyScore();
  const idx = getDailyWisdomIndex();

  const lang = i18n.language;
  const wisdom = lang.startsWith('zh')
    ? WISDOMS_ZH[idx]
    : lang.startsWith('fr')
    ? WISDOMS_FR[idx]
    : WISDOMS_EN[idx];

  const scoreColor =
    score >= 80 ? 'hsl(43 85% 55%)' : score >= 60 ? 'hsl(43 60% 50%)' : 'hsl(43 40% 45%)';

  return (
    <div className="glass-card p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'hsl(var(--gold))' }} />
          <h3
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'hsla(var(--gold) / 0.7)', fontFamily: 'var(--font-sans)' }}
          >
            {t('oracle.dailyWisdom')}
          </h3>
        </div>
        <span
          className="text-2xl font-bold"
          style={{ color: scoreColor, fontFamily: 'var(--font-serif)' }}
        >
          {score}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('oracle.cosmicScore')}</span>
          <span>{score}/100</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      <p
        className="text-sm italic leading-relaxed text-muted-foreground"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        "{wisdom}"
      </p>
    </div>
  );
};

export default DailyWisdom;
