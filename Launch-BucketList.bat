@echo off
title DayDream Local Server
cd /d "%~dp0"

echo ========================================================
echo   Starting DayDream App Locally...
echo ========================================================

:: Check if port 3000 is listening
netstat -ano | find "LISTENING" | find ":3000" >nul 2>nul
if %errorlevel% neq 0 (
    echo Starting development server...
    start "DayDream Server" cmd /c "npm run dev"
    timeout /t 4 /nobreak >nul
)

:: Open in Chrome App Mode if available
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
    exit
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://localhost:3000
    exit
)

:: Try Edge App Mode
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
    exit
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3000
    exit
)

:: Default browser fallback
start http://localhost:3000
exit

