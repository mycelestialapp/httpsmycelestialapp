import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import GoldParticles from './GoldParticles';
import { toast } from 'sonner';

const DailyCheckin = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [checkedToday, setCheckedToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    // Check if already checked in today + get recent streak
    const load = async () => {
      const { data } = await supabase
        .from('checkins')
        .select('checked_at, streak')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false })
        .limit(7);

      if (data && data.length > 0) {
        if (data[0].checked_at === today) {
          setCheckedToday(true);
          setStreak(data[0].streak);
        } else {
          // Calculate if yesterday was checked in for streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().slice(0, 10);
          if (data[0].checked_at === yesterdayStr) {
            setStreak(data[0].streak);
          } else {
            setStreak(0);
          }
        }
      }
    };
    load();
  }, [user, today]);

  const handleCheckin = async () => {
    if (!user || checkedToday || loading) return;
    setLoading(true);

    const newStreak = streak + 1;
    const reward = newStreak >= 7 ? 20 : 10; // Double on day 7

    const { error } = await supabase.from('checkins').insert({
      user_id: user.id,
      checked_at: today,
      streak: newStreak > 7 ? 1 : newStreak, // Reset after 7
      reward,
    });

    if (!error) {
      // Update star_dust directly
      const { data: profile } = await supabase.from('profiles').select('star_dust').eq('id', user.id).single();
      if (profile) {
        await supabase.from('profiles').update({ star_dust: profile.star_dust + reward }).eq('id', user.id);
      }

      setCheckedToday(true);
      setStreak(newStreak > 7 ? 1 : newStreak);
      setShowParticles(true);
      toast.success(`+${reward} Star Dust ✦`);
      setTimeout(() => setShowParticles(false), 3000);
    }

    setLoading(false);
  };

  if (!user) return null;

  const streakDots = Array.from({ length: 7 }, (_, i) => i < (checkedToday ? streak : streak));

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <GoldParticles active={showParticles} count={30} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck size={16} style={{ color: 'hsl(var(--gold))' }} />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'hsla(var(--gold) / 0.7)' }}
          >
            {t('checkin.title')}
          </span>
        </div>
        <button
          onClick={handleCheckin}
          disabled={checkedToday || loading}
          className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: checkedToday
              ? 'hsla(var(--gold) / 0.1)'
              : 'linear-gradient(135deg, hsla(var(--gold) / 0.2), hsla(var(--gold) / 0.1))',
            border: '1px solid hsla(var(--gold) / 0.3)',
            color: 'hsl(var(--gold))',
          }}
        >
          {checkedToday ? t('checkin.done') : t('checkin.claim')}
        </button>
      </div>

      {/* 7-day streak */}
      <div className="flex items-center gap-1.5">
        {streakDots.map((filled, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
              style={{
                background: filled
                  ? 'linear-gradient(135deg, hsla(var(--gold) / 0.3), hsla(var(--gold) / 0.15))'
                  : 'hsla(var(--gold) / 0.05)',
                border: `1px solid hsla(var(--gold) / ${filled ? '0.4' : '0.1'})`,
                color: filled ? 'hsl(var(--gold))' : 'hsla(var(--gold) / 0.3)',
              }}
            >
              {i === 6 ? <Star size={12} /> : i + 1}
            </div>
          </div>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {streak}/7
        </span>
      </div>

      {streak >= 6 && !checkedToday && (
        <p className="text-xs mt-2 text-center animate-pulse" style={{ color: 'hsl(var(--gold))' }}>
          {t('checkin.bonusHint')}
        </p>
      )}
    </div>
  );
};

export default DailyCheckin;
