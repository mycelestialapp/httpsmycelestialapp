import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, UserCircle, Briefcase, Plus, ChevronRight, ChevronDown, Compass, Trash2, BookOpen, GraduationCap, UserX } from 'lucide-react';
import { ARCHIVES_KEY, GROUP_OPTIONS_FOR_DISPLAY, getArchiveBirthDate, GROUP_LABELS } from '@/lib/archives';
import type { ArchiveEntry } from '@/lib/archives';
import { calculateLifePath, getNumerologyCompatibility } from '@/lib/numerology';

const HOUR_LABELS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
/** 時辰對應的鐘點區間（子 23:00–01:00 … 午 11:00–13:00 …） */
const HOUR_RANGES = ['23:00–01:00', '01:00–03:00', '03:00–05:00', '05:00–07:00', '07:00–09:00', '09:00–11:00', '11:00–13:00', '13:00–15:00', '15:00–17:00', '17:00–19:00', '19:00–21:00', '21:00–23:00'];

/** 分組 Tab 圖標：本人 + 與填寫彈窗完全一致 */
const GROUP_TAB_ICONS: Record<string, typeof Heart> = {
  self: UserCircle,
  lover: Heart,
  family: Users,
  classmate: GraduationCap,
  friend: UserCircle,
  client: Briefcase,
  coworker: Briefcase,
  leader: Briefcase,
  ex: UserX,
  affair: Heart,
};
/** 篩選 Tab = 本人 + 填寫彈窗的 10 個分組，與填表分類一致 */
const GROUP_TABS = [
  { key: 'self', label: '本人', icon: UserCircle },
  ...GROUP_OPTIONS_FOR_DISPLAY.map(({ value, label }) => ({
    key: value,
    label,
    icon: GROUP_TAB_ICONS[value] ?? UserCircle,
  })),
];

/** 僅保留可看命盤的工具（八字、占星、大六壬、奇門、紫微），不含占卜類與風水（玄空為風水非命盤） */
const CHART_TOOLS: { tool: string; labelKey: string }[] = [
  { tool: 'bazi', labelKey: 'relationships.chartBazi' },
  { tool: 'astrology', labelKey: 'relationships.chartAstrology' },
  { tool: 'liuren', labelKey: 'relationships.chartLiuren' },
  { tool: 'qimen', labelKey: 'relationships.chartQimen' },
  { tool: 'ziwei', labelKey: 'relationships.chartZiwei' },
];

const RelationshipsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [report, setReport] = useState<{ summary: string; strengths: string[]; risks: string[]; future: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ARCHIVES_KEY);
      if (raw) setArchives(JSON.parse(raw));
    } catch {
      setArchives([]);
    }
  }, []);

  const filteredArchives =
    activeGroup === 'all'
      ? archives
      : archives.filter((a) => a.group === activeGroup);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 2) next.add(id);
      return next;
    });
    setReport(null);
  };

  const generateReport = () => {
    const [idA, idB] = Array.from(selectedIds);
    const a = archives.find((x) => x.id === idA);
    const b = archives.find((x) => x.id === idB);
    if (!a || !b) return;
    setReport({
      summary: `${a.name} 與 ${b.name}：緣分與默契並存，需要共同學習邊界與表達，避免積壓情緒。`,
      strengths: [
        '在重要決策上容易達成共識',
        '彼此能提供情緒上的支持',
        '長期相處會逐漸形成默契',
      ],
      risks: [
        '一方過度付出時容易失衡',
        '對「空間」的需求可能不同',
        '金錢或責任分配需提前溝通',
      ],
      future: '未來一兩年適合一起打基礎、建立共同習慣，不適合在此階段做重大切割或閃電決定。',
    });
  };

  const canGenerate = selectedIds.size === 2;

  const removeArchive = (id: string) => {
    const next = archives.filter((a) => a.id !== id);
    setArchives(next);
    try {
      localStorage.setItem(ARCHIVES_KEY, JSON.stringify(next));
    } catch (_) {}
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setReport(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition pb-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-h2 font-bold tracking-[0.2em] text-gold">
          關係說明書
        </h1>
        <p className="text-body text-muted-foreground">
          選擇兩個人，生成你們的相處藍圖
        </p>
        <button
          type="button"
          onClick={() => navigate('/oracle/pairing')}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-body font-medium border border-gold-strong/50 text-gold-strong hover:bg-gold-soft/50 transition-colors"
        >
          <Heart size={18} />
          {t('relationships.zodiacPairing', { defaultValue: '星座配對' })}
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 命盘档案：标题居中；仅点选分组后下方才显示已存档案 */}
      <div className="space-y-3">
        <h2 className="text-center font-display text-h4 font-semibold tracking-wide text-gold">
          命盘档案
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {GROUP_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveGroup(key)}
              className={`flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl border transition-all ${
                activeGroup === key
                  ? 'border-gold-strong text-gold-strong bg-gold-soft'
                  : 'border-border/60 text-muted-foreground'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="text-body-sm font-medium truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 已存档案：仅当用户点选分组（爱人、家人等）时显示，与填表分类一致（填表有本人+10 分组，本人不存档故此处无本人 Tab） */}
      {activeGroup !== 'all' && (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-body-sm tracking-widest uppercase text-muted-foreground">{t('relationships.savedArchives', { defaultValue: '已存檔案' })}</span>
          <button
            onClick={() => navigate('/', { state: { openBirthModal: true } })}
            className="text-body-sm text-gold-strong flex items-center gap-1"
          >
            <Plus size={14} /> {t('relationships.goToFillData', { defaultValue: '去填寫資料' })}
          </button>
        </div>
        {filteredArchives.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-border/70 p-6 text-center text-body text-muted-foreground"
          >
            此分組下尚無檔案。請在命盤或占卜頁填寫出生資料時選擇對應分組（如愛人、家人等）並提交，即會出現在此。
          </div>
        ) : (
          <div className="space-y-2">
            {filteredArchives.map((entry) => {
              const isSelected = selectedIds.has(entry.id);
              const hasBirthData = getArchiveBirthDate(entry) != null;
              return (
                <motion.div
                  key={entry.id}
                  className={`rounded-xl border px-4 py-3 transition-all ${
                    isSelected ? 'border-gold-strong bg-gold-soft' : 'border-border/60 bg-card/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {hasBirthData ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
                        className="flex-1 text-left min-w-0 py-1 rounded-lg hover:bg-white/5 transition-colors flex flex-col items-start gap-0.5"
                      >
                        <span className="text-body font-medium text-foreground">{entry.name}</span>
                        {entry.birthData && (
                          <span className="text-body-sm text-muted-foreground">
                            {entry.birthData.year}年{String(entry.birthData.month).padStart(2, '0')}月{String(entry.birthData.day).padStart(2, '0')}日
                            {' · '}{HOUR_LABELS[entry.birthData.hourIndex ?? 6]}時（{HOUR_RANGES[entry.birthData.hourIndex ?? 6]}）
                          </span>
                        )}
                        <span className="text-caption text-muted-foreground/80 flex items-center gap-0.5 mt-0.5">
                          {t('relationships.tapToView', { defaultValue: '點開查看' })}
                          <ChevronDown
                            size={12}
                            className={`shrink-0 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </button>
                    ) : (
                      <div className="flex-1 min-w-0 py-1">
                        <span className="font-medium text-foreground">{entry.name}</span>
                        {isSelected && (
                          <span className="ml-2 text-body-sm text-gold-strong">已選</span>
                        )}
                      </div>
                    )}
                    {hasBirthData && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleSelect(entry.id); }}
                        className="shrink-0 px-2 py-1.5 rounded-lg text-caption border border-border/60 text-muted-foreground hover:text-foreground hover:border-gold-strong/50 transition-colors"
                        title={t('relationships.selectForReport', { defaultValue: '選中以生成關係說明書' })}
                      >
                        {isSelected ? t('relationships.selected', { defaultValue: '已選' }) : t('relationships.select', { defaultValue: '選' })}
                      </button>
                    )}
                    {!hasBirthData && (
                      <button
                        type="button"
                        onClick={() => toggleSelect(entry.id)}
                        className="shrink-0 px-2 py-1.5 rounded-lg text-caption border border-border/60 text-muted-foreground"
                      >
                        {isSelected ? t('relationships.selected', { defaultValue: '已選' }) : t('relationships.select', { defaultValue: '選' })}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t('relationships.confirmDeleteArchive', { defaultValue: '確定刪除「{{name}}」的檔案？', name: entry.name }))) removeArchive(entry.id);
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      title={t('relationships.deleteArchive', { defaultValue: '刪除此檔案' })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {hasBirthData ? (
                    expandedId === entry.id ? (
                      <div className="space-y-3 mt-2 pt-2 border-t border-border/50">
                        {/* 先顯示已存的個人信息，再顯示本命/命盤入口 */}
                        <div className="rounded-lg bg-white/[0.04] border border-border/50 px-3 py-2.5 space-y-1.5">
                          <p className="text-caption uppercase tracking-wider text-muted-foreground mb-1.5">
                            {t('relationships.personalInfo', { defaultValue: '個人信息' })}
                          </p>
                          <ul className="text-body-sm text-foreground/90 space-y-1">
                            <li><span className="text-muted-foreground">姓名</span> {entry.name}</li>
                            <li><span className="text-muted-foreground">分組</span> {GROUP_LABELS[entry.group] ?? entry.group}</li>
                            {entry.birthData && (
                              <>
                                <li>
                                  <span className="text-muted-foreground">出生</span>{' '}
                                  {entry.birthData.year}年{String(entry.birthData.month).padStart(2, '0')}月{String(entry.birthData.day).padStart(2, '0')}日
                                  （{entry.birthData.calendarType === 'lunar' ? '阴历' : '公历'}）
                                  {' · '}
                                  {HOUR_LABELS[entry.birthData.hourIndex ?? 6]}時（{HOUR_RANGES[entry.birthData.hourIndex ?? 6]}）
                                </li>
                                {entry.birthData.city && (
                                  <li>
                                    <span className="text-muted-foreground">地點</span>{' '}
                                    {entry.birthData.city.nameZh ?? entry.birthData.city.name ?? '—'}
                                  </li>
                                )}
                                {entry.birthData.gender && (
                                  <li><span className="text-muted-foreground">性別</span> {entry.birthData.gender === 'female' ? '女' : '男'}</li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                        {/* 数字命理存档：有保存的解读则直接展示，并始终提供「点此查看」入口 */}
                        {entry.birthData && (
                          <div className="rounded-lg bg-gold-strong/10 border border-gold-strong/30 px-3 py-3 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-body font-semibold text-gold">数字命理解读</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const b = entry.birthData!;
                                  const hourIndex = b.hourIndex ?? 6;
                                  const birthDate = new Date(Date.UTC(b.year, b.month - 1, b.day)).toISOString();
                                  const birthDateLabel = `${b.year}年${String(b.month).padStart(2, '0')}月${String(b.day).padStart(2, '0')}日 ${HOUR_LABELS[hourIndex]}时`;
                                  navigate('/numerology/result', { state: { name: entry.name, birthDate, hourIndex, birthDateLabel } });
                                }}
                                className="text-body-sm font-medium text-gold border border-gold-strong/50 px-3 py-1.5 rounded-lg hover:bg-gold-strong/20 transition-colors"
                              >
                                点此查看完整结果 →
                              </button>
                            </div>
                            {entry.savedReading?.type === 'numerology' && entry.savedReading.items?.length > 0 ? (
                              <div className="space-y-2 mt-2">
                                {entry.savedReading.items.map((item) => (
                                  <div key={item.key} className="rounded-lg bg-white/[0.04] border border-border/50 p-2.5 space-y-1">
                                    <p className="text-body-sm font-medium text-foreground">
                                      {item.label} {item.value}
                                      {item.title ? ` · ${item.title.split('·')[1]?.trim() || item.title}` : ''}
                                    </p>
                                    {item.core && (
                                      <p className="text-body-sm text-foreground/90 leading-relaxed">{item.core}</p>
                                    )}
                                    {item.oracle && (
                                      <p className="text-body-sm text-gold/90 italic leading-relaxed border-l-2 border-gold-strong/40 pl-2 mt-1">{item.oracle}</p>
                                    )}
                                    {item.advice && (
                                      <p className="text-caption text-muted-foreground mt-0.5">✦ {item.advice}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-body-sm text-muted-foreground mt-1">
                                暂无保存的解读内容，点击上方「点此查看完整结果」可生成并查看此人的数字命理。
                              </p>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate('/oracle/soul', { state: { fromArchive: entry } }); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-medium border border-gold-strong/50 text-gold-strong hover:bg-gold-soft/50 transition-colors"
                          >
                            <BookOpen size={14} className="shrink-0" /> <span className="truncate">{t('relationships.viewSoul', { defaultValue: '靈魂原型' })}</span>
                          </button>
                          {CHART_TOOLS.map(({ tool, labelKey }) => (
                            <button
                              key={tool}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/oracle/reading?tool=${tool}`, { state: { fromArchive: entry } });
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-medium border border-gold-strong/50 text-gold-strong hover:bg-gold-soft/50 transition-colors"
                            >
                              <Compass size={14} className="shrink-0" /> <span className="truncate">{t(labelKey)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ) : (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                      <p className="text-body-sm text-muted-foreground">
                        {t('relationships.noBirthData', { defaultValue: '無出生資料' })} · {t('relationships.noBirthDataHint', { defaultValue: '請在星圖填寫並選擇分組保存' })}
                      </p>
                      <p className="text-body-sm text-gold-strong/90">
                        {t('relationships.addBirthDataTip', { defaultValue: '點下方按鈕補填出生日期後，即可查看此人的靈魂原型與命盤' })}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/', { state: { openBirthModal: true, forArchiveId: entry.id, forArchiveName: entry.name, forArchiveGroup: entry.group } });
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-body-sm font-medium border border-gold-strong bg-gold-soft/40 text-gold-strong hover:bg-gold-soft/60 transition-colors w-full justify-center"
                      >
                        <Plus size={14} /> {t('relationships.addBirthData', { defaultValue: '補充出生資料' })}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* 占卜问题 */}
      <div className="space-y-2">
        <h2 className="text-center font-display text-h4 font-semibold tracking-wide text-gold">
          占卜问题
        </h2>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/readings')}
            className="text-body-sm text-gold-strong flex items-center gap-1"
          >
            <BookOpen size={14} />
            查看
          </button>
        </div>
      </div>

      {/* 数字命理配对：两人已选且均有出生资料时显示 */}
      {canGenerate && (() => {
        const [idA, idB] = Array.from(selectedIds);
        const a = archives.find((x) => x.id === idA);
        const b = archives.find((x) => x.id === idB);
        const dateA = a ? getArchiveBirthDate(a) : null;
        const dateB = b ? getArchiveBirthDate(b) : null;
        if (!a || !b || !dateA || !dateB) return null;
        const birthDateA = new Date(Date.UTC(dateA.year, dateA.month - 1, dateA.day));
        const birthDateB = new Date(Date.UTC(dateB.year, dateB.month - 1, dateB.day));
        const lpA = calculateLifePath(birthDateA).value;
        const lpB = calculateLifePath(birthDateB).value;
        const compat = getNumerologyCompatibility(lpA, lpB);
        return (
          <div className="rounded-xl border border-gold-strong/20 bg-gold-strong/5 px-4 py-3 space-y-1">
            <p className="text-body-sm font-semibold text-gold">数字命理配对</p>
            <p className="text-body-sm text-foreground/90">
              {a.name} 生命路径 {lpA} · {b.name} 生命路径 {lpB}
            </p>
            <p className="text-body-sm text-muted-foreground leading-relaxed">{compat}</p>
          </div>
        );
      })()}

      {/* Generate report CTA */}
      {canGenerate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={generateReport}
            className="w-full py-3 rounded-xl text-body font-semibold flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, hsla(var(--gold) / 0.25), hsla(var(--accent) / 0.15))',
              border: '1px solid hsla(var(--gold) / 0.5)',
              color: 'hsl(var(--gold))',
              fontFamily: 'var(--font-serif)',
            }}
          >
            生成關係說明書 <ChevronRight size={18} />
          </button>
        </motion.div>
      )}

      {/* Report result */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-highlight space-y-4"
        >
          <p className="text-body font-medium text-foreground leading-relaxed">
            {report.summary}
          </p>
          <div>
            <p className="text-body-sm tracking-widest uppercase text-muted-foreground mb-2">相處優勢</p>
            <ul className="space-y-1 text-body text-foreground/90">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gold-strong">·</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-body-sm tracking-widest uppercase text-muted-foreground mb-2">注意與風險</p>
            <ul className="space-y-1 text-body text-foreground/90">
              {report.risks.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-accent">·</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t border-border/50">
            <p className="text-body-sm tracking-widest uppercase text-muted-foreground mb-1">未來一兩年節奏</p>
            <p className="text-body text-foreground/90">{report.future}</p>
          </div>
        </motion.div>
      )}

      {/* 底部免责声明：与全站一致，字号可读 */}
      <footer className="mt-8 pt-6 border-t border-border/50">
        <p className="font-display text-body-sm font-semibold text-foreground/95 mb-1.5">本命盤</p>
        <p className="text-body-sm text-muted-foreground leading-relaxed">
          本頁占星解讀僅供娛樂與自我覺察，不構成醫學、法律、投資或人生決策建議，請以理性判斷與現實情況為準。
        </p>
      </footer>
    </div>
  );
};

export default RelationshipsPage;
