-- 出生資料儲存時一併保存的姓名（本人可填暱稱，換裝置登入可還原）
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_chart_name TEXT;
