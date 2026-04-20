@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\Lucas\Downloads\arcademinigame"

echo Creating directory structure...

mkdir src\core 2>nul
mkdir src\components 2>nul
mkdir src\games\pong 2>nul
mkdir src\games\snake 2>nul
mkdir src\games\sinuca 2>nul
mkdir src\styles 2>nul
mkdir src\utils 2>nul
mkdir dist 2>nul
mkdir .vscode 2>nul

echo.
echo ^✓ Directory structure created successfully!
echo.
echo Directories in src:
dir /b src\
echo.
echo Done!
