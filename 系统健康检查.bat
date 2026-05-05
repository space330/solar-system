@echo off
setlocal
cd /d "%~dp0"

set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" (
  echo Node.js not found at %NODE_EXE%
  echo Please run 检查Node环境.bat first.
  pause
  exit /b 1
)

"%NODE_EXE%" tools\health-check.mjs
echo.
pause
