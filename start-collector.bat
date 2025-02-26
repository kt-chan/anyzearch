@echo off
SETLOCAL

:: Similarly, start the third script in a new process
echo "Starting the server script..."
START cmd /c "npm run-script win-prod:server"

ENDLOCAL