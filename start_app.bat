@echo off

REM Start Flask server
start /min dist\api.exe

REM Open browser to React frontend URL
timeout /t 10 /nobreak >nul 2>&1
start http://localhost:3000