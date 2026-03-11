import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * 占星解讀（行星/宮位）是否已訂閱可見。
 * 未訂閱：僅顯示「訂閱可見」；訂閱：直接顯示完整解讀並允許下載。
 * 後端可於 profiles 加 oracle_subscriber 等欄位，在此 select 並 setHasAccess(data.oracle_subscriber)。
 */
export function useOracleAccess(): boolean {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setHasAccess(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('oracle_subscriber')
          .eq('id', user.id)
          .maybeSingle();
        if (cancelled) return;
        setHasAccess(Boolean(data?.oracle_subscriber));
      } catch {
        if (!cancelled) setHasAccess(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return hasAccess;
}
