@echo off
chcp 65001 >nul
setlocal EnableExtensions

set "APP_DIR=%~dp0"
set "APP_URL=http://localhost:4173"
set "NODE_EXE="
set "NPM_CMD="

cd /d "%APP_DIR%"

echo ================================================
echo  Solar System AI Model - Node.js Launcher
echo ================================================
echo.

call :find_node
call :find_npm

if not defined NODE_EXE (
  echo Node.js was not found.
  echo.
  echo Fix:
  echo   1. Install Node.js LTS from https://nodejs.org/
  echo   2. Close this window
  echo   3. Double-click this launcher again
  echo.
  echo Opening Node.js download page...
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

if not defined NPM_CMD (
  echo npm was not found.
  echo.
  echo Fix:
  echo   Reinstall Node.js LTS and make sure "npm package manager" is selected.
  echo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

echo Node:
"%NODE_EXE%" --version
echo npm:
call "%NPM_CMD%" --version
echo.

if not exist "%APP_DIR%node_modules\express" (
  echo First launch: installing backend dependency express...
  echo This requires internet access.
  call "%NPM_CMD%" install
  if errorlevel 1 (
    echo.
    echo npm install failed. Check your network or npm installation.
    pause
    exit /b 1
  )
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

echo Starting backend at %APP_URL%
echo AI endpoint: %AI_BASE_URL%
echo AI model: %AI_MODEL%
echo AI timeout: %AI_TIMEOUT_MS% ms
echo Keep this window open. Closing it stops localhost:4173.
echo.

start "" "%APP_URL%"
"%NODE_EXE%" server.mjs

echo.
echo Backend stopped.
pause
exit /b 0

:find_node
for %%P in (
  "%ProgramFiles%\nodejs\node.exe"
  "%ProgramFiles(x86)%\nodejs\node.exe"
  "%LocalAppData%\Programs\nodejs\node.exe"
) do (
  if exist "%%~P" (
    set "NODE_EXE=%%~P"
    exit /b 0
  )
)

for /f "delims=" %%P in ('where node 2^>nul') do (
  echo %%P | findstr /i "OpenAI.Codex" >nul
  if errorlevel 1 (
    set "NODE_EXE=%%P"
    exit /b 0
  )
)
exit /b 0

:find_npm
for %%P in (
  "%ProgramFiles%\nodejs\npm.cmd"
  "%ProgramFiles(x86)%\nodejs\npm.cmd"
  "%LocalAppData%\Programs\nodejs\npm.cmd"
) do (
  if exist "%%~P" (
    set "NPM_CMD=%%~P"
    exit /b 0
  )
)

for /f "delims=" %%P in ('where npm.cmd 2^>nul') do (
  echo %%P | findstr /i "OpenAI.Codex" >nul
  if errorlevel 1 (
    set "NPM_CMD=%%P"
    exit /b 0
  )
)

for /f "delims=" %%P in ('where npm 2^>nul') do (
  echo %%P | findstr /i "OpenAI.Codex" >nul
  if errorlevel 1 (
    set "NPM_CMD=%%P"
    exit /b 0
  )
)
exit /b 0
