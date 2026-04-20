@echo off
cd /d C:\Users\Lucas\Downloads\arcademinigame
(
  for %%D in ("src" "src\core" "src\components" "src\games" "src\games\pong" "src\games\snake" "src\games\sinuca" "src\styles" "src\utils" "dist" ".vscode") do (
    if not exist "%%D" mkdir "%%D"
  )
  echo Directory structure created!
) & pause
