@echo off
chcp 65001 >nul
title TikTok Live Manager — กำลังปิดโปรแกรม...
color 0C

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║        TikTok Live Viewer Manager               ║
echo ║        กำลังปิดโปรแกรม...                      ║
echo ╚══════════════════════════════════════════════════╝
echo.

echo กำลังหยุด Backend (uvicorn)...
taskkill /F /FI "WINDOWTITLE eq TikTok Live Manager — Backend*" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1

echo กำลังหยุด Frontend (next dev)...
taskkill /F /FI "WINDOWTITLE eq TikTok Live Manager — Frontend*" >nul 2>&1

:: kill node processes ที่รัน next dev อยู่
for /f "tokens=2" %%p in ('tasklist /fi "IMAGENAME eq node.exe" /fo csv /nh 2^>nul') do (
    wmic process where "ProcessId=%%~p" get CommandLine 2>nul | findstr /i "next" >nul 2>&1
    if not errorlevel 1 (
        taskkill /F /PID %%~p >nul 2>&1
    )
)

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  ✅  ปิดโปรแกรมเรียบร้อยแล้ว                   ║
echo ║                                                  ║
echo ║  ขอบคุณที่ใช้งาน TikTok Live Manager            ║
echo ╚══════════════════════════════════════════════════╝
echo.
timeout /t 3 /nobreak >nul
exit /b 0
