@echo off
title Blu OSINT - Cyber Intelligence Command Center
echo.
echo   =====================================================
echo     BLU OSINT - Starting Cyber Intelligence Platform
echo   =====================================================
echo.

echo [1/2] Starting backend on http://localhost:3001 ...
start "Blu OSINT - API Server" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend on http://localhost:5174 ...
start "Blu OSINT - Command Center" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 2 /nobreak >nul
start "" http://localhost:5174

echo.
echo   Blu OSINT is now running. Close the two console windows to stop it.
echo.