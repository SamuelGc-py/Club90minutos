@echo off
cd /d "%~dp0.."
git add .
if "%~1"=="" (
  git commit -m "fix: panel admin con cuadro futbolero y descargas por fecha"
) else (
  git commit -m "%~1"
)
git push origin main
