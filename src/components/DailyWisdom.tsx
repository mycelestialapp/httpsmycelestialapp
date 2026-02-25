import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const WISDOMS: Record<string, string[]> = {
  en: [
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
  ],
  zh: [
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
  ],
  ja: [
    "今日は大胆に行動を——すべてのチャンスを掴め。",
    "静かな内省の日——心の声に耳を傾けて。",
    "創造エネルギーが満ち溢れる——自分を表現しよう。",
    "人とのつながりに集中——意味ある絆が待っている。",
    "今日の超能力は忍耐——プロセスを信じて。",
    "冒険が呼んでいる——快適な領域を飛び出そう。",
    "自分を大切にする日——休息も生産性のうち。",
    "変容が近い——変化を受け入れよう。",
    "直感が冴えわたる——心の声に従って。",
    "寛大さは十倍になって返ってくる——今日は惜しみなく与えよう。",
  ],
  fr: [
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
  ],
  ko: [
    "오늘은 과감한 행동의 날 — 모든 기회를 잡아라.",
    "조용한 성찰의 날 — 내면의 목소리에 귀 기울여라.",
    "창조 에너지가 흐른다 — 자신을 표현하라.",
    "인연에 집중하라 — 의미 있는 만남이 기다린다.",
    "인내가 오늘의 초능력 — 과정을 믿어라.",
    "모험이 부른다 — 안전지대를 벗어나라.",
    "자신을 돌보는 날 — 쉼도 생산적이다.",
    "변화가 가까이 — 변화를 받아들여라.",
    "직감이 날카롭다 — 감을 따르라.",
    "관대함은 열 배로 돌아온다 — 오늘 아낌없이 베풀어라.",
  ],
  es: [
    "Hoy es para la Acción audaz — aprovecha cada oportunidad.",
    "Un día de Reflexión tranquila — escucha tu voz interior.",
    "La Energía creativa fluye fuerte — exprésate.",
    "Enfócate en las Conexiones — vínculos profundos te esperan.",
    "La Paciencia es tu superpoder hoy — confía en el proceso.",
    "La Aventura llama — sal de tu zona de confort.",
    "Un día para cuidarte — descansar también es productivo.",
    "La Transformación está cerca — abraza el cambio.",
    "Tu intuición está afilada — sigue tu instinto.",
    "La Generosidad vuelve multiplicada — da libremente hoy.",
  ],
};

function getWisdomList(lang: string): string[] {
  if (lang.startsWith('zh')) return WISDOMS.zh;
  if (lang.startsWith('ja')) return WISDOMS.ja;
  if (lang.startsWith('ko')) return WISDOMS.ko;
  if (lang.startsWith('fr')) return WISDOMS.fr;
  if (lang.startsWith('es')) return WISDOMS.es;
  return WISDOMS.en;
}

function getDailyScore(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.floor((x - Math.floor(x)) * 61) + 40;
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
  const wisdom = getWisdomList(i18n.language)[idx];

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
