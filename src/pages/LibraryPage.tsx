import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Video, Sparkles, Heart, Share2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Disclaimer from '@/components/Disclaimer';

type ContentType = 'all' | 'article' | 'video' | 'prompt';

interface FeedItem {
  id: string;
  type: 'article' | 'video' | 'prompt';
  title: string;
  subtitle: string;
  emoji: string;
  category: string;
  readTime?: string;
}

const FEED_DATA: FeedItem[] = [
  { id: '1', type: 'prompt', title: '"The stars incline, but do not compel."', subtitle: '— Ancient Astrologers', emoji: '✨', category: 'Daily Wisdom' },
  { id: '2', type: 'article', title: 'Understanding Your Five Elements Blueprint', subtitle: 'How Wood, Fire, Earth, Metal, and Water shape your cosmic destiny and daily life energy flow.', emoji: '🌿', category: 'Bazi & Five Elements', readTime: '5 min read' },
  { id: '3', type: 'video', title: 'Mercury Retrograde Survival Guide 2026', subtitle: 'Essential tips for navigating communication chaos during retrograde periods.', emoji: '☿️', category: 'Western Astrology', readTime: '3 min' },
  { id: '4', type: 'article', title: 'MBTI × Astrology: The Hidden Connection', subtitle: 'Discover how your Myers-Briggs type aligns with your zodiac placements for deeper self-awareness.', emoji: '🧠', category: 'MBTI Deep Dive', readTime: '8 min read' },
  { id: '5', type: 'prompt', title: '"Know the masculine, keep to the feminine."', subtitle: '— Tao Te Ching', emoji: '☯️', category: 'Eastern Philosophy' },
  { id: '6', type: 'article', title: 'Feng Shui for Your Home Office', subtitle: 'Optimize your workspace energy with these ancient spatial harmony techniques for modern productivity.', emoji: '🏠', category: 'Feng Shui', readTime: '6 min read' },
  { id: '7', type: 'video', title: 'Full Moon Ritual for Release & Renewal', subtitle: 'A guided ceremony to let go of what no longer serves your highest path.', emoji: '🌕', category: 'Rituals & Practice', readTime: '7 min' },
  { id: '8', type: 'article', title: 'The I-Ching as Life Compass', subtitle: 'How to consult the Book of Changes for clarity in times of uncertainty and transition.', emoji: '📖', category: 'I-Ching Wisdom', readTime: '10 min read' },
];

const FILTERS: { key: ContentType; icon: typeof FileText }[] = [
  { key: 'all', icon: Sparkles },
  { key: 'article', icon: FileText },
  { key: 'video', icon: Video },
  { key: 'prompt', icon: Sparkles },
];

const LibraryPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ContentType>('all');

  const filtered = filter === 'all' ? FEED_DATA : FEED_DATA.filter((item) => item.type === filter);

  return (
    <div className="max-w-md mx-auto space-y-4 pt-2 page-transition">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
          {t('library.title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('library.subtitle')}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 justify-center">
        {FILTERS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === key ? 'hsla(var(--gold) / 0.15)' : 'hsla(var(--muted) / 0.3)',
              color: filter === key ? 'hsl(var(--gold))' : 'hsl(var(--muted-foreground))',
              border: `1px solid ${filter === key ? 'hsla(var(--gold) / 0.3)' : 'transparent'}`,
            }}
          >
            <Icon size={12} />
            {t(`library.filter.${key}`)}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            {item.type === 'prompt' ? (
              /* Daily Prompt — full-width quote card */
              <div
                className="glass-card-highlight text-center py-8 px-6"
                style={{ borderColor: 'hsla(var(--accent) / 0.25)' }}
              >
                <div className="text-2xl mb-3">{item.emoji}</div>
                <p className="text-base italic text-foreground leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{item.subtitle}</p>
                <div className="flex justify-center gap-6 mt-4">
                  <button className="text-muted-foreground hover:text-primary transition-colors"><Heart size={16} /></button>
                  <button className="text-muted-foreground hover:text-primary transition-colors"><Share2 size={16} /></button>
                </div>
              </div>
            ) : (
              /* Article / Video card */
              <div className="glass-card p-4">
                <div className="flex gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: 'hsla(var(--gold) / 0.08)' }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: item.type === 'video' ? 'hsla(var(--accent) / 0.12)' : 'hsla(var(--gold) / 0.1)',
                          color: item.type === 'video' ? 'hsl(var(--accent))' : 'hsl(var(--gold))',
                        }}
                      >
                        {item.type === 'video' ? '▶ Video' : '📄 Article'}
                      </span>
                      {item.readTime && (
                        <span className="text-[10px] text-muted-foreground">{item.readTime}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid hsla(var(--gold) / 0.08)' }}>
                  <span className="text-[10px] text-muted-foreground">{item.category}</span>
                  <div className="flex gap-4">
                    <button className="text-muted-foreground hover:text-primary transition-colors"><Heart size={14} /></button>
                    <button className="text-muted-foreground hover:text-primary transition-colors"><MessageCircle size={14} /></button>
                    <button className="text-muted-foreground hover:text-primary transition-colors"><Share2 size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
};

export default LibraryPage;
