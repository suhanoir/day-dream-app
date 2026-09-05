@echo off
title Repair Git Index
cd /d "%~dp0\.."

echo ========================================================
echo   Repairing Git Index (Fixing OneDrive Conflict)...
echo ========================================================

if exist ".git\index.lock" (
    echo Removing stale index.lock...
    del /f /q ".git\index.lock" 2>nul
)

if exist ".git\index" (
    echo Resetting corrupted index...
    del /f /q ".git\index" 2>nul
)

git reset >nul 2>nul
attrib +P -U .git\index >nul 2>nul

echo.
git status
echo.
echo ========================================================
echo   Git Index Repaired Successfully!
echo ========================================================
pause
