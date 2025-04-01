@echo off
title PTiLMS Development Server
color 0A
mode con:cols=120 lines=50

:: Set console properties for better scrolling
reg add HKCU\Console /v ScreenBufferSize /t REG_DWORD /d 0x2329001E /f
reg add HKCU\Console /v WindowSize /t REG_DWORD /d 0x001E0078 /f

echo Script started.

:: Set the API port
set PORT=3000
echo Port set to: %PORT%

:: Start ngrok in a new window
start "Ngrok Tunnel" cmd /k ngrok http %PORT%

:: Wait for ngrok initialization
timeout /t 10 /nobreak > nul

:: Get ngrok URL in main window
set RETRY=0
set MAX_RETRY=5
set URL=

:retry
echo Retrieving ngrok URL (Attempt %RETRY%)...
for /f "delims=" %%a in ('powershell -Command "(Invoke-WebRequest -Uri http://localhost:4040/api/tunnels -UseBasicParsing).Content | ConvertFrom-Json | Select -ExpandProperty tunnels | Where {$_.proto -eq 'https'} | Select -First 1 -ExpandProperty public_url"') do set "URL=%%a"

if "%URL%"=="" (
    set /a RETRY+=1
    if %RETRY% LSS %MAX_RETRY% (
        timeout /t 5 /nobreak > nul
        goto :retry
    ) else (
        echo Error: Could not retrieve ngrok URL after %MAX_RETRY% attempts.
        goto :end
    )
)

echo Ngrok URL found: %URL%

:: Update .env with the new URL
echo Updating .env...
node updateEnv.js "%URL%"

:: Start Node.js server in a separate window
start "PTiLMS Server" cmd /k npm run dev

:end
echo Development environment ready. Ngrok and Server running in separate windows.
echo You can now interact with this console normally.
pause