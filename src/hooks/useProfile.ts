import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MinimalProfile = { display_name: string | null; avatar_url?: string | null };

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<MinimalProfile | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
      .then(({ data }) => setProfile(data ?? null))
      .catch(() => setProfile(null));

    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url != null) setProfile((p) => (p ? { ...p, avatar_url: data.avatar_url } : { display_name: null, avatar_url: data.avatar_url }));
      })
      .catch(() => {});
  }, [userId]);

  return profile;
}
