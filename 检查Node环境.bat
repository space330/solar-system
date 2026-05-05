@echo off
chcp 65001 >nul
setlocal

echo ================================================
echo  Node.js environment diagnostic
echo ================================================
echo.

echo PATH candidates:
where node 2>nul
if errorlevel 1 echo   node not found in PATH
where npm 2>nul
if errorlevel 1 echo   npm not found in PATH
echo.

echo Standard install locations:
if exist "%ProgramFiles%\nodejs\node.exe" echo   Found: "%ProgramFiles%\nodejs\node.exe"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" echo   Found: "%ProgramFiles(x86)%\nodejs\node.exe"
if exist "%LocalAppData%\Programs\nodejs\node.exe" echo   Found: "%LocalAppData%\Programs\nodejs\node.exe"
echo.

echo Important:
echo   If only OpenAI.Codex node.exe appears, that is not a system Node.js install.
echo   Install Node.js LTS from https://nodejs.org/
echo.

pause
