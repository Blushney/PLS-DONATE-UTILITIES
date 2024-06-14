@echo off

:check_node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js to proceed.
    pause
    exit /b
)

:extract_dependencies
echo Extracting node_modules.zip...
powershell -command "Expand-Archive -Path 'node_modules.zip' -DestinationPath '.'"
if %errorlevel% neq 0 (
    echo Failed to extract node_modules.zip.
    pause
    exit /b
)
del node_modules.zip
if %errorlevel% neq 0 (
    echo Failed to delete node_modules.zip.
    pause
    exit /b
)

goto main_menu

:main_menu
cls
echo Main Menu
echo.
echo Options select
echo.
echo [1] Configure Gamepasses
echo [2] Setup Gamepasses
echo [3] Robux Amount
echo.
set /p option=
if %option% == 1 goto configure_gamepass
if %option% == 2 goto setup_gamepass
if %option% == 3 goto robux_amount
pause
goto main_menu

:configure_gamepass
cls
echo Configure Gamepasses
echo.

set /p UniverseId=Enter Universe ID: 
set /p GamepassesPrice=Enter Prices (comma-separated): 

echo Running configureGamepasses.js with UniverseId=%UniverseId% and GamepassesPrice=%GamepassesPrice%...

rem Run the Node.js script and capture its output
node ./utilities/configureGamepasses.js %UniverseId% %GamepassesPrice%
set ExitCode=%errorlevel%

if %ExitCode% == 0 (
    echo Configure Gamepasses completed successfully.
) else (
    echo Configure Gamepasses failed. Error code: %ExitCode%
)
pause
goto main_menu

:setup_gamepass
cls
echo Setup Gamepasses
echo.

set /p PlaceId=Enter PlaceId:
set /p NumberOfGamePasses=Enter Number of Game Passes:
echo.
echo enter the image link (leave blank to use Donation.png)
echo.
set /p imageLink=

echo Running gamepass.js

rem Run the Node.js script and capture its output
node ./utilities/gamepass.js %PlaceId% %NumberOfGamePasses% "%imageLink%"
set ExitCode=%errorlevel%

if %ExitCode% == 0 (
    echo Setup Gamepasses completed successfully.
) else (
    echo Setup Gamepasses failed. Error code: %ExitCode%
)
pause
goto main_menu

:robux_amount
cls
echo Robux Amount
echo.

echo Running robuxAmount.js

rem Run the Node.js script and capture its output
node ./utilities/robuxAmount.js
set ExitCode=%errorlevel%

if %ExitCode% == 0 (
    echo Robux Amount completed successfully.
) else (
    echo Robux Amount failed. Error code: %ExitCode%
)
pause
goto main_menu

:end
pause
