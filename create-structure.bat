@echo off
REM Create directory structure for Arcade Mini Game 2.0

setlocal enabledelayedexpansion

set "base_path=%CD%"

REM Create directories
if not exist "src" mkdir "src"
if not exist "src\core" mkdir "src\core"
if not exist "src\components" mkdir "src\components"
if not exist "src\games" mkdir "src\games"
if not exist "src\games\pong" mkdir "src\games\pong"
if not exist "src\games\snake" mkdir "src\games\snake"
if not exist "src\games\sinuca" mkdir "src\games\sinuca"
if not exist "src\styles" mkdir "src\styles"
if not exist "src\utils" mkdir "src\utils"
if not exist "dist" mkdir "dist"
if not exist ".vscode" mkdir ".vscode"

echo.
echo ✓ Project structure created successfully!
echo.
echo Directories:
echo - src/core
echo - src/components
echo - src/games/{pong,snake,sinuca}
echo - src/styles
echo - src/utils
echo - dist
echo - .vscode
echo.
pause
