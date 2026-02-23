import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Star, Share2, Plus, Users, Search } from 'lucide-react';
import { findTopMatches, type MatchResult } from '@/lib/matchingEngine';
import type { ElementEnergy } from '@/lib/fiveElements';
import Disclaimer from '@/components/Disclaimer';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const elementColors: Record<string, string> = {
  wood: '120, 60%, 40%',
  fire: '0, 75%, 55%',
  earth: '35, 70%, 50%',
  metal: '210, 20%, 70%',
  water: '210, 80%, 55%',
};

interface Profile {
  id: string;
  display_name: string | null;
  mbti: string | null;
  bio: string | null;
  soul_id: string;
  star_dust: number;
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  dominant_element: string | null;
}

const TribePage = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [editingMbti, setEditingMbti] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data as Profile);
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Find matches
  const findMatches = useCallback(async () => {
    if (!profile) return;
    setLoadingMatches(true);
    const { data: candidates } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', profile.id)
      .limit(50);

    if (candidates && candidates.length > 0) {
      const userEnergy: ElementEnergy = {
        wood: profile.wood, fire: profile.fire, earth: profile.earth,
        metal: profile.metal, water: profile.water,
      };
      const results = findTopMatches(userEnergy, profile.mbti || '', profile.id, candidates as any[], 3);
      setMatches(results);
    }
    setLoadingMatches(false);
  }, [profile]);

  useEffect(() => { if (profile) findMatches(); }, [profile, findMatches]);

  // Update MBTI
  const updateMbti = async (mbti: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ mbti }).eq('id', user.id);
    setProfile((p) => p ? { ...p, mbti } : p);
    setEditingMbti(false);
  };

  if (authLoading || !user) return null;

  const domElement = profile?.dominant_element || 'earth';
  const domColor = elementColors[domElement] || elementColors.earth;

  return (
    <div className="max-w-md mx-auto space-y-6 pt-2 page-transition">
      {/* Header with Star Dust */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'hsl(var(--gold))', textShadow: '0 0 24px hsla(var(--gold) / 0.3)' }}>
            {t('tribe.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('tribe.subtitle')}</p>
        </div>
        {/* Star Dust badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{
          background: 'hsla(var(--gold) / 0.1)',
          border: '1px solid hsla(var(--gold) / 0.25)',
        }}>
          <Star size={14} style={{ color: 'hsl(var(--gold))' }} fill="hsl(var(--gold))" />
          <span className="text-xs font-semibold" style={{ color: 'hsl(var(--gold))' }}>{profile?.star_dust ?? 0}</span>
          <button className="ml-1 w-4 h-4 rounded-full flex items-center justify-center" style={{
            background: 'hsla(var(--gold) / 0.2)',
            color: 'hsl(var(--gold))',
          }}>
            <Plus size={10} />
          </button>
        </div>
      </div>

      {/* Soul ID Card */}
      {profile && (
        <div className="glass-card-highlight overflow-hidden">
          {/* Colored top band */}
          <div className="h-2 -mx-6 -mt-6 mb-4" style={{
            background: `linear-gradient(90deg, hsl(${domColor}), hsla(${domColor} / 0.3))`,
          }} />

          <div className="flex items-start gap-4">
            {/* Avatar orb */}
            <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold" style={{
              background: `radial-gradient(circle, hsla(${domColor} / 0.4), hsla(${domColor} / 0.1))`,
              border: `2px solid hsla(${domColor} / 0.5)`,
              color: `hsl(${domColor})`,
              fontFamily: 'var(--font-serif)',
              boxShadow: `0 0 20px hsla(${domColor} / 0.2)`,
            }}>
              {(profile.display_name || 'S').charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground truncate" style={{ fontFamily: 'var(--font-serif)' }}>
                  {profile.display_name || 'Soul'}
                </h3>
                {profile.mbti && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{
                    background: 'hsla(var(--accent) / 0.15)',
                    border: '1px solid hsla(var(--accent) / 0.3)',
                    color: 'hsl(var(--accent))',
                  }}>
                    {profile.mbti}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground tracking-wider mt-0.5">
                SOUL ID: {profile.soul_id}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 italic leading-relaxed">
                {profile.bio || `A ${domElement.charAt(0).toUpperCase() + domElement.slice(1)}-aligned soul navigating the cosmic flow.`}
              </p>
            </div>
          </div>

          {/* Energy bar */}
          <div className="mt-4 grid grid-cols-5 gap-1">
            {(['wood', 'fire', 'earth', 'metal', 'water'] as const).map((el) => (
              <div key={el} className="flex flex-col items-center gap-1">
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'hsla(var(--muted) / 0.3)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${profile[el]}%`,
                      background: `hsl(${elementColors[el]})`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">{t(`oracle.${el}`)}</span>
              </div>
            ))}
          </div>

          {/* MBTI selector */}
          {!profile.mbti && !editingMbti && (
            <button
              onClick={() => setEditingMbti(true)}
              className="mt-3 w-full py-2 rounded-lg text-xs transition-all"
              style={{
                background: 'hsla(var(--accent) / 0.1)',
                border: '1px solid hsla(var(--accent) / 0.2)',
                color: 'hsl(var(--accent))',
              }}
            >
              + Set your MBTI type
            </button>
          )}

          {editingMbti && (
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => updateMbti(type)}
                  className="py-1.5 rounded text-[10px] font-semibold transition-all hover:scale-105"
                  style={{
                    background: 'hsla(var(--card) / 0.5)',
                    border: '1px solid hsla(var(--gold) / 0.15)',
                    color: 'hsl(var(--foreground))',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-all hover:scale-[1.02]"
              style={{
                background: 'hsla(var(--gold) / 0.1)',
                border: '1px solid hsla(var(--gold) / 0.2)',
                color: 'hsl(var(--gold))',
              }}
            >
              <Share2 size={12} /> Share Soul Card
            </button>
          </div>
        </div>
      )}

      {/* Find Your Soul Tribe */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} style={{ color: 'hsl(var(--gold))' }} />
          <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'hsla(var(--gold) / 0.6)', fontFamily: 'var(--font-sans)' }}>
            {t('tribe.findTribe')}
          </h3>
          <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, hsla(var(--gold) / 0.3), transparent)' }} />
        </div>

        {loadingMatches && (
          <div className="text-center py-8">
            <div className="text-2xl animate-spin-slow mb-2">✦</div>
            <p className="text-xs text-muted-foreground">{t('tribe.searching')}</p>
          </div>
        )}

        {!loadingMatches && matches.length === 0 && (
          <div className="glass-card text-center py-8">
            <Users size={28} className="mx-auto mb-3" style={{ color: 'hsla(var(--gold) / 0.4)' }} />
            <p className="text-sm text-muted-foreground">{t('tribe.noMatches')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('tribe.noMatchesHint')}</p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match) => {
              const mDom = match.profile.dominant_element || 'earth';
              const mColor = elementColors[mDom] || elementColors.earth;
              return (
                <div key={match.profile.id} className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold" style={{
                      background: `radial-gradient(circle, hsla(${mColor} / 0.4), hsla(${mColor} / 0.1))`,
                      border: `1px solid hsla(${mColor} / 0.4)`,
                      color: `hsl(${mColor})`,
                      fontFamily: 'var(--font-serif)',
                    }}>
                      {(match.profile.display_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{match.profile.display_name || 'Soul'}</span>
                        {match.profile.mbti && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{
                            background: 'hsla(var(--accent) / 0.1)',
                            color: 'hsl(var(--accent))',
                          }}>
                            {match.profile.mbti}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground italic mt-0.5">{match.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold" style={{ color: 'hsl(var(--gold))', fontFamily: 'var(--font-serif)' }}>
                        {match.compatibility}%
                      </div>
                      <div className="text-[9px] text-muted-foreground">match</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
};

export default TribePage;
