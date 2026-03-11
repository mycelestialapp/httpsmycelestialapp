# 登入配置檢查清單

按下面逐項打勾，配置完成後，Google / Apple / Facebook / X 才能「一定能登錄」。

**若之前 Google / Apple 登不上：** 已改為全部走 Supabase 登錄（不再經 Lovable）。請在 **Supabase Dashboard** 與 **Google / Apple 開發者後台** 按下面步驟配好回調地址與金鑰，配好後即可登錄。

---

## 通用：先確認這兩點

- [ ] 已打開 **Supabase Dashboard**：https://supabase.com/dashboard → 選中你的專案
- [ ] 知道你的 **Supabase 專案網址**（在 Supabase 專案 Settings → API 裡可看到）

**本專案回調地址（Google/Apple/Facebook/X 後台填這個）：**

```
https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback
```

---

## ⚠️ 必做：Supabase URL 配置（沒做這步 OAuth 一定登不上）

在配 Google/Apple 之前，**必須**先在 Supabase 放行登入後的跳轉網址，否則登完會報錯或跳轉失敗。

- [ ] 打開 **Supabase Dashboard** → 你的專案 → **Authentication** → **URL Configuration**
- [ ] **Site URL** 設為：`https://mycelestial.app`（正式環境用）
- [ ] **Redirect URLs** 裡點「Add URL」，依序加入：
  - `https://mycelestial.app/**`
  - `http://localhost:8080/**`
  - `http://localhost:5173/**`
- [ ] 儲存

說明：登入後 Supabase 會把用戶帶回你設的 `redirectTo`（例如 `https://mycelestial.app/auth` 或 `http://localhost:8080/auth`）。若該網址沒在 Redirect URLs 裡，Supabase 不會放行，登入就會失敗。上面用 `**` 表示該網址下所有路徑都允許。

若之後換了 Supabase 專案，回調地址改為：`https://你的專案ID.supabase.co/auth/v1/callback`

---

## 一、Google 登錄

（已改為直接用 Supabase，不再經 Lovable，照下面配好即可。）

- [ ] **Google Cloud Console**  
  - 打開 https://console.cloud.google.com/  
  - 建立或選擇一個專案 → **APIs & Services** → **Credentials**  
  - 建立 **OAuth 2.0 Client ID**（類型選「Web 應用程式」）  
  - **已授權的重新導向 URI** 裡加上：`https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback`  
  - 若本地開發，可再加：`http://localhost:8080/auth`、`http://localhost:5173/auth`（可選）

- [ ] **Supabase**  
  - Authentication → **Providers** → **Google** → **開啟**  
  - 把 Google 的 **Client ID**、**Client Secret** 貼到 Supabase 對應欄位並儲存  

- [ ] **自測**：在登入頁點「Google」，能跳轉到 Google 並成功登回即為通過  

---

## 二、Apple 登錄

（已改為直接用 Supabase，不再經 Lovable，照下面配好即可。）

- [ ] **Apple Developer**  
  - https://developer.apple.com/ → **Certificates, Identifiers & Profiles**  
  - 建立 **App ID**、**Services ID**（用於 Sign in with Apple）  
  - 在 **Sign in with Apple** 設定裡，把 **Return URL** 設為：`https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback`  
  - 建立 **Key**（Sign in with Apple 用），下載 .p8，記下 Key ID、Team ID、Services ID  

- [ ] **Supabase**  
  - Authentication → **Providers** → **Apple** → **開啟**  
  - 填入 Apple 提供的 **Services ID**、**Secret**（用 Key 生成的 JWT）、**Team ID**、**Key ID** 等（依 Supabase 表單欄位為準）  

- [ ] **自測**：點「Apple」能跳轉 Apple 並成功登回即為通過  

---

## 三、Facebook 登錄

- [ ] **Facebook for Developers**  
  - https://developers.facebook.com/ → **我的應用** → 建立或選擇應用  
  - 產品裡加入 **Facebook 登入** → 選 **網頁**  
  - **Facebook 登入設定** → **有效 OAuth 重新導向 URI** 加上：`https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback`  
  - 到 **設定** → **基本** 裡抄下 **應用程式編號（App ID）**、**應用程式密鑰（App Secret）**  

- [ ] **Supabase**  
  - Authentication → **Providers** → **Facebook** → 開啟  
  - 把 **App ID**、**App Secret** 貼上並儲存  

- [ ] **自測**：點「Facebook」能跳轉 Facebook 並成功登回即為通過  

---

## 四、X（Twitter）登錄

- [ ] **X Developer Portal**  
  - https://developer.twitter.com/ → 專案與應用（用 OAuth 2.0）  
  - **User authentication settings** 裡設定 **Callback URI / Redirect URL**：`https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback`  
  - 抄下 **Client ID**、**Client Secret**（OAuth 2.0 用）  

- [ ] **Supabase**  
  - Authentication → **Providers** → **Twitter** → 開啟  
  - 把 **Client ID**、**Client Secret** 貼上並儲存（Supabase 若寫 API Key / API Secret，對應填 OAuth 2.0 的 Client ID / Client Secret）  

- [ ] **自測**：點「X」能跳轉 X 並成功登回即為通過  

---

## 五、郵箱密碼登錄

- [ ] **Supabase**  
  - Authentication → **Providers** → **Email** 預設為開啟，一般無需改動  
  - 若關閉了，請重新開啟  

- [ ] **自測**：用郵箱註冊/登入一次，能收到郵件並完成登入即為通過  

---

## 六、環境變數（本地與部署都要有）

前端必須能連到你的 Supabase 專案，否則任何登入都會失敗。

- [ ] 專案根目錄有 `.env` 或 `.env.local`（且不要提交到 Git）
- [ ] 裡面有這兩項（值從 Supabase → Settings → API 取得）：
  - `VITE_SUPABASE_URL` = 你的專案 URL（例如 `https://qnlciqqimwzlsvmplskq.supabase.co`）
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = 專案的 `anon` / public key
- [ ] 部署到正式環境時，在託管平台（Vercel / Netlify 等）的環境變數裡同樣設定上述兩項

---

## 總結

| 方式     | 配置完成後才能「一定能登錄」 |
|----------|------------------------------|
| Google   | 打勾「Supabase URL 配置」+ 一、Google + 自測通過 |
| Apple    | 打勾「Supabase URL 配置」+ 二、Apple + 自測通過 |
| Facebook | 打勾「Supabase URL 配置」+ 三、Facebook + 自測通過 |
| X        | 打勾「Supabase URL 配置」+ 四、X + 自測通過 |
| 郵箱     | 確認 Supabase Email 開啟 + 自測通過 |

全部打勾且自測通過後，這幾個入口就是「一定能登錄」的狀態。若某一步不確定，可對照 `docs/AUTH_PROVIDERS.md` 的說明。

---

## 最終核對（確保百分百能登錄）

按順序確認以下幾點，全部通過再測登入：

1. **Supabase URL 配置**
   - [ ] Site URL 已設（正式站用 `https://mycelestial.app`）
   - [ ] Redirect URLs 已加入 `https://mycelestial.app/**` 與本地用的 `http://localhost:8080/**`、`http://localhost:5173/**`

2. **回調地址統一**
   - [ ] Google / Apple / Facebook / X 後台填的「回調 / Redirect URI」都是：  
     `https://qnlciqqimwzlsvmplskq.supabase.co/auth/v1/callback`  
     （不要填成 `https://mycelestial.app/...`，必須是 Supabase 的 callback）

3. **Supabase Providers**
   - [ ] 要用的方式（Google / Apple / Facebook / X / Email）在 Supabase → Authentication → Providers 裡都是「開啟」且 Client ID / Secret 已填

4. **環境變數**
   - [ ] 本地與部署環境都有 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`

5. **自測**
   - [ ] 在無痕視窗打開登入頁，依序點 Google、Apple（或 Facebook、X）各測一次，能跳轉到對應平台並成功回到站內首頁即為通過
   - [ ] 若某一個失敗：看瀏覽器網址列是否被導向 Supabase callback 再回你站；若回調後報錯，多半是 Redirect URLs 沒加或填錯
