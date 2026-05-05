@echo off
chcp 65001 >nul
setlocal EnableExtensions

set "APP_DIR=%~dp0"
set "APP_URL=http://localhost:4173"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
set "LOG_DIR=%APP_DIR%.logs"

cd /d "%APP_DIR%"

if not exist "%NODE_EXE%" (
  echo Node.js not found at %NODE_EXE%
  echo Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "%APP_DIR%node_modules\express" (
  echo express is missing. Running npm install first...
  call "C:\Program Files\nodejs\npm.cmd" install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
  echo localhost:4173 is already running. PID %%P
  start "" "%APP_URL%"
  exit /b 0
)

if "%API_KEY_ENCRYPTION_SECRET%"=="" (
  set "API_KEY_ENCRYPTION_SECRET=local-solar-system-key-store-change-this-secret"
)

if "%AI_BASE_URL%"=="" (
  set "AI_BASE_URL=https://api.deepseek.com/v1"
)

if "%AI_MODEL%"=="" (
  set "AI_MODEL=deepseek-v4-pro"
)

if "%AI_TIMEOUT_MS%"=="" (
  set "AI_TIMEOUT_MS=35000"
)

echo Starting backend in background...
echo Logs:
echo   %LOG_DIR%\server.out.log
echo   %LOG_DIR%\server.err.log

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$env:AI_BASE_URL='%AI_BASE_URL%';" ^
  "$env:AI_MODEL='%AI_MODEL%';" ^
  "$env:AI_TIMEOUT_MS='%AI_TIMEOUT_MS%';" ^
  "$env:API_KEY_ENCRYPTION_SECRET='%API_KEY_ENCRYPTION_SECRET%';" ^
  "Start-Process -WindowStyle Hidden -FilePath '%NODE_EXE%' -ArgumentList 'server.mjs' -WorkingDirectory '%APP_DIR%' -RedirectStandardOutput '%LOG_DIR%\server.out.log' -RedirectStandardError '%LOG_DIR%\server.err.log'"

timeout /t 2 /nobreak >nul
start "" "%APP_URL%"
echo Started. You can close this window.
timeout /t 3 /nobreak >nul
