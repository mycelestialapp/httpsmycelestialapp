@echo off
cd /d "%~dp0"
set PYTHONPATH=%CD%
echo 当前目录: %CD%
echo PYTHONPATH=%PYTHONPATH%
echo.
echo 正在启动符文 API（端口 8000）...
echo 启动成功后请用浏览器打开: http://localhost:8000/docs
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
