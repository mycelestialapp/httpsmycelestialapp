@echo off
chcp 65001 >nul
cd /d "d:\Dmy-projects"

echo.
echo 正在新視窗啟動開發伺服器，請稍候...
echo.

start "Vite 開發伺服器" cmd /k "cd /d d:\Dmy-projects && npm run dev:stable"

echo 已開啟一個新視窗，該視窗會一直開著並顯示伺服器狀態。
echo.
echo 請在該視窗裡查看網址，通常是 http://localhost:8081
echo 然後用 Chrome 或 Edge 瀏覽器打開該網址。
echo.
echo 按任意鍵關閉本提示視窗，不會關閉伺服器。
pause >nul
