@echo off
SETLOCAL

:: Set the NODE_ENV environment variable
SET NODE_ENV=development

:: List all processes with 'node' in their name
for /f "tokens=2 delims=," %%i in ('tasklist /nh /fo csv /fi "imagename eq node.exe"') do (
    echo Killing process: %%i
    taskkill /f /pid %%i
)

echo "build script..."
CALL npm run-script build-windows

echo "Starting the frontend build script..."
CALL npm run-script win-prod:frontend

if %ERRORLEVEL% NEQ 0 (
    echo The frontend script failed with error code %ERRORLEVEL%.
    EXIT /B %ERRORLEVEL%
)

echo "The frontend script finished successfully."

:: Now that the frontend script has finished, run the next steps
echo "Starting the collector script..."
START cmd /c "npm run-script win-prod:collector"

echo "Starting the Server script..."
START cmd /c "npm run-script win-prod:server"
ENDLOCAL