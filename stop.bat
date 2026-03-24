@echo off
chcp 65001 >nul
title TikTok Live Manager - Stopping...
color 0C

echo.
echo =====================================================
echo        TikTok Live Viewer Manager
echo        Stopping...
echo =====================================================
echo.

echo Stopping Backend (uvicorn)...
taskkill /F /IM uvicorn.exe >nul 2>&1

echo Stopping Frontend (node/next)...
for /f "tokens=1 delims=," %%p in ('tasklist /fi "IMAGENAME eq node.exe" /fo csv /nh 2^>nul') do (
    taskkill /F /FI "IMAGENAME eq node.exe" >nul 2>&1
    goto node_done
)
:node_done

echo Closing terminal windows...
taskkill /F /FI "WINDOWTITLE eq TikTok Live Manager*" >nul 2>&1

echo.
echo =====================================================
echo  Done! TikTok Live Manager has been stopped.
echo =====================================================
echo.
timeout /t 2 /nobreak >nul
exit /b 0
