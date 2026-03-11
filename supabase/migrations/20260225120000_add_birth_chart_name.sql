-- 儲存「填寫資料」時用戶輸入的姓名（與 birthday 一併保存，換裝置登入可還原）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_chart_name TEXT;

COMMENT ON COLUMN public.profiles.birth_chart_name IS '用戶填寫的出生資料姓名/暱稱，與 birthday 一併保存';
