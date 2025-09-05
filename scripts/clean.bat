@echo off
SETLOCAL

:: List all processes with 'node' in their name
for /f "tokens=2 delims=," %%i in ('tasklist /nh /fo csv /fi "imagename eq node.exe"') do (
    echo Killing process: %%i
    taskkill /f /pid %%i
)

ENDLOCAL