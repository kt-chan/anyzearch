@echo off
SETLOCAL

:: Now that the first script has finished, start the second script in a new process
echo "Starting the collector script..."
START cmd /c "npm run-script win-prod:collector"

ENDLOCAL