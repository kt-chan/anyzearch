@echo off
SETLOCAL

:: List all processes with 'node' in their name
for /f "tokens=2 delims=," %%i in ('tasklist /nh /fo csv /fi "imagename eq node.exe"') do (
    echo Killing process: %%i
    taskkill /f /pid %%i
)

:: Now that the frontend script has finished, run the next steps
echo "Starting the collector script..."
START cmd /c "npm run-script win-prod:collector"

echo "Starting the Server script..."
START cmd /c "npm run-script win-prod:server"
ENDLOCAL