# 登入接入口後台配置說明

本應用已接好前端與 Supabase 認證，以下說明各接入口的後台配置方式，以便「真正關聯帳號」。

## 已接好、需在 Supabase 後台開啟的登入方式

### 1. Google / Apple
- 由 Lovable 與 Supabase 處理，若已能正常登入則無需額外設定。

### 2. Facebook
- **後台**：Supabase Dashboard → Authentication → Providers → Facebook → 啟用。
- **設定**：在 [Facebook for Developers](https://developers.facebook.com/) 建立應用，取得 **App ID** 與 **App Secret**，並在應用中設定「Facebook 登入」、加入 OAuth 重新導向 URI：  
  `https://<你的專案>.supabase.co/auth/v1/callback`
- 將 App ID、App Secret 填入 Supabase 的 Facebook 提供者設定。

### 3. X (Twitter)
- **後台**：Supabase Dashboard → Authentication → Providers → Twitter → 啟用。
- **設定**：在 [X Developer Portal](https://developer.twitter.com/) 建立專案與應用，取得 **API Key** 與 **API Secret**（OAuth 2.0），並設定授權回調 URL：  
  `https://<你的專案>.supabase.co/auth/v1/callback`
- 將上述金鑰填入 Supabase 的 Twitter 提供者設定。

### 4. 手机号（短信验证码）— 目前關閉，等盈利後再開
- **原因**：短信由第三方按條計費，會持續產生成本，現階段不划算。
- **當前**：前端入口顯示為「即將推出」，不發送短信、不產生費用。
- **日後**：若產品盈利或找到低成本方案，再在 Supabase 啟用 Phone、配置 SMS 供應商（Twilio、MessageBird 等），並恢復前端發送/驗證流程（`signInWithOtp` + `verifyOtp`）。

---

## 需額外開發的登入方式（微信、微博、小红书、Line）

Supabase 目前**不內建**以下提供者，要「真正關聯帳號」需要自建 OAuth 流程並與 Supabase 對接：

### 微信（WeChat）
- 在 [微信開放平台](https://open.weixin.qq.com/) 申請網站應用，取得 `appid`、`secret`。
- 實作方式之一：新增 Supabase Edge Function（例如 `oauth-wechat`），在後端用 `appid`/`secret` 完成授權碼換 token、取得用戶資訊，再以 Supabase Admin API 建立或更新用戶並回傳 session（或 redirect 回前端並帶 token）。
- 前端：登入按鈕改為跳轉到該 Edge Function 的授權 URL，回調後由後端完成登入並重導向回站內。

### 微博（Weibo）
- 在 [微博開放平台](https://open.weibo.com/) 建立應用，取得 `client_id`、`client_secret`。
- 同樣可透過 Edge Function 實作 OAuth 回調、用授權碼換 token、取得用戶資訊，再與 Supabase 用戶綁定並回傳 session。

### 小红书（Xiaohongshu）
- 需在 [小红书開放平台](https://open.xiaohongshu.com/) 申請並取得應用金鑰。
- 以 Edge Function 實作 OAuth 2.0 授權與回調，並將登入結果寫入 Supabase（建立/更新用戶、發 session）。

### Line
- 在 [LINE Developers](https://developers.line.biz/) 建立 Channel，取得 Channel ID、Channel Secret。
- 以 Edge Function 實作 LINE Login OAuth 回調，取得用戶資訊後與 Supabase 用戶關聯並回傳 session。

---

## 小結

| 接入口   | 後台狀態           | 要做的動作 |
|----------|--------------------|------------|
| Google   | 已用 Lovable 對接  | 無需改動   |
| Apple    | 已用 Lovable 對接  | 無需改動   |
| Facebook | 前端已接 Supabase  | 在 Supabase 與 Facebook 後台完成上述設定 |
| X        | 前端已接 Supabase  | 在 Supabase 與 X 後台完成上述設定 |
| 手机号   | 暫不啟用（省短信成本） | 等盈利後再在 Supabase 開啟 Phone + SMS 供應商 |
| 微信     | 前端僅 UI          | 申請微信開放平台應用 + 自建 Edge Function OAuth |
| 微博     | 前端僅 UI          | 申請微博開放平台應用 + 自建 Edge Function OAuth |
| 小红书   | 前端僅 UI          | 申請小红书開放平台應用 + 自建 Edge Function OAuth |
| Line     | 前端僅 UI          | 申請 LINE Channel + 自建 Edge Function OAuth |

完成上述對應後台的設定或開發後，各接入口即可真正關聯並登入帳號。
