@echo off
echo Script started.

REM Set the API port
set PORT=3000
echo Port set to: %PORT%

REM Start ngrok in the background
echo Attempting to start ngrok...
start "Ngrok" /B ngrok http %PORT%

REM Wait and retry to get the ngrok URL
set RETRY=0
set MAX_RETRY=5
set URL=

:retry
echo Waiting for ngrok to initialize (Attempt %RETRY%)...
timeout /t 5 > nul

echo Retrieving ngrok URL from API...
for /f "delims=" %%a in ('powershell -Command "(Invoke-WebRequest -Uri http://localhost:4040/api/tunnels -UseBasicParsing).Content | ConvertFrom-Json | Select -ExpandProperty tunnels | Where {$_.proto -eq 'https'} | Select -First 1 -ExpandProperty public_url"') do set "URL=%%a"

if "%URL%"=="" (
    set /a RETRY+=1
    if %RETRY% LSS %MAX_RETRY% (
        goto :retry
    ) else (
        echo Error: Could not retrieve ngrok URL after %MAX_RETRY% attempts.
        goto :end
    )
)

echo ngrok URL found: %URL%

REM Update .env with the new URL
echo Updating .env with new ngrok URL: %URL%
node updateEnv.js "%URL%"
echo .env updated.

REM Start the Node.js server
echo Starting Node.js server with npm run dev...
start "PTiLMS API" /B npm run dev

:end
pause