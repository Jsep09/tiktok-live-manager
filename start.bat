@echo off
chcp 65001 >nul
title TikTok Live Manager — กำลังเริ่มต้น...
color 0A

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║        TikTok Live Viewer Manager               ║
echo ║        กำลังเริ่มต้นโปรแกรม...                 ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: ─── ตรวจสอบ Python ───────────────────────────────────────
echo [1/5] ตรวจสอบ Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌  ไม่พบ Python บนเครื่องนี้!
    echo.
    echo     กรุณาดาวน์โหลดและติดตั้ง Python จาก:
    echo     https://www.python.org/downloads/
    echo.
    echo     ⚠️  อย่าลืมติ๊ก "Add Python to PATH" ตอนติดตั้งด้วย!
    echo.
    start https://www.python.org/downloads/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo     ✅  พบ %%v
echo.

:: ─── ตรวจสอบ Node.js ──────────────────────────────────────
echo [2/5] ตรวจสอบ Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌  ไม่พบ Node.js บนเครื่องนี้!
    echo.
    echo     กรุณาดาวน์โหลดและติดตั้ง Node.js จาก:
    echo     https://nodejs.org/
    echo.
    echo     ⚠️  เลือกเวอร์ชัน LTS และติ๊ก "Add to PATH" ตอนติดตั้งด้วย!
    echo.
    start https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo     ✅  พบ Node.js %%v
echo.

:: ─── ติดตั้ง Backend (ครั้งแรกเท่านั้น) ──────────────────
echo [3/5] เตรียม Backend (Python)...
if not exist "backend\venv" (
    echo     กำลังสร้าง virtual environment ครั้งแรก...
    echo     (ใช้เวลาสักครู่ กรุณารอ)
    python -m venv backend\venv
    if errorlevel 1 (
        echo ❌  สร้าง virtual environment ไม่สำเร็จ
        pause
        exit /b 1
    )
    echo     กำลังติดตั้ง Python libraries...
    backend\venv\Scripts\pip install -r backend\requirements.txt --quiet
    if errorlevel 1 (
        echo ❌  ติดตั้ง Python libraries ไม่สำเร็จ
        echo     ลองรัน: backend\venv\Scripts\pip install -r backend\requirements.txt
        pause
        exit /b 1
    )
    echo     ✅  ติดตั้ง Backend เรียบร้อย
) else (
    echo     ✅  Backend พร้อมแล้ว
)
echo.

:: ─── ติดตั้ง Frontend (ครั้งแรกเท่านั้น) ─────────────────
echo [4/5] เตรียม Frontend (Node.js)...
if not exist "frontend\node_modules" (
    echo     กำลังติดตั้ง Node.js packages ครั้งแรก...
    echo     (ใช้เวลาสักครู่ กรุณารอ)
    cd frontend
    npm install --silent
    if errorlevel 1 (
        echo ❌  ติดตั้ง Node.js packages ไม่สำเร็จ
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo     ✅  ติดตั้ง Frontend เรียบร้อย
) else (
    echo     ✅  Frontend พร้อมแล้ว
)
echo.

:: ─── เปิด Backend ─────────────────────────────────────────
echo [5/5] กำลังเปิดโปรแกรม...
echo     เปิด Backend server...
start "TikTok Live Manager — Backend" /min cmd /k "cd /d %~dp0backend && ..\backend\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

:: ─── เปิด Frontend ────────────────────────────────────────
echo     เปิด Frontend server...
start "TikTok Live Manager — Frontend" /min cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  ✅  โปรแกรมกำลังเริ่มต้น กรุณารอสักครู่...     ║
echo ║                                                  ║
echo ║  หน้าต่างสีดำ 2 หน้าต่างจะปรากฏขึ้น            ║
echo ║  (Backend และ Frontend) — อย่าปิดนะ!            ║
echo ║                                                  ║
echo ║  จะเปิด Chrome ไปที่ http://localhost:3000       ║
echo ║  ใน 5 วินาที...                                  ║
echo ╚══════════════════════════════════════════════════╝
echo.

timeout /t 5 /nobreak

:: ─── เปิด Chrome ──────────────────────────────────────────
start chrome "http://localhost:3000"
if errorlevel 1 (
    :: ถ้าไม่มี Chrome ให้เปิด default browser แทน
    start "" "http://localhost:3000"
)

echo.
echo ✅  เสร็จแล้ว! โปรแกรมพร้อมใช้งานที่ http://localhost:3000
echo.
echo     เมื่อต้องการปิดโปรแกรม ให้ดับเบิ้ลคลิก stop.bat
echo.
exit /b 0
