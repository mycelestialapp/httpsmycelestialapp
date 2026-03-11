# 頭像功能：Supabase 後台配置

要讓「更換頭像」生效，需在 Supabase 完成以下兩步。

## 1. 為 profiles 表增加頭像欄位

在 Supabase Dashboard → SQL Editor 執行：

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;
```

## 2. 建立頭像儲存桶（Storage）

- 進入 **Storage** → **New bucket**
- Name: `avatars`
- **Public bucket**: 勾選（頭像需對外可讀）
- 建立後進入 `avatars` → **Policies** → **New policy**
- 策略範例（允許登入用戶上傳/更新自己的頭像）：
  - Policy name: `Users can upload own avatar`
  - Allowed operation: INSERT, UPDATE
  - Target: `avatars`
  - USING / WITH CHECK 表達式（依你現有 RLS 習慣調整），例如：
    - `auth.uid()::text = (storage.foldername(name))[1]`
- 再新增一條允許公開讀取（Public read）的 policy，或桶設為 Public 後預設即可讀。

完成後，應用內「更換頭像」會上傳到 `avatars/{user_id}/xxx.jpg` 並把網址寫入 `profiles.avatar_url`。
