-- 訂閱標識：為 true 時，星盤/行星/宮位解讀、雷諾曼大師解讀等可直接可見
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS oracle_subscriber BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.oracle_subscriber IS '是否為訂閱用戶：true 時可看星盤宮位/行星解讀、雷諾曼與符文 AI 解讀等';
