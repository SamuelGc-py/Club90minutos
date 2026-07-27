@echo off
cd /d "%~dp0.."
if exist git-last.txt del /f /q git-last.txt
if exist git-status.txt del /f /q git-status.txt
if exist scripts\deploy.cmd del /f /q scripts\deploy.cmd
if exist scripts\check-git.cmd del /f /q scripts\check-git.cmd
if exist scripts\do-push.bat del /f /q scripts\do-push.bat
if exist scripts\force-deploy.bat del /f /q scripts\force-deploy.bat
if exist scripts\git-deploy.cmd del /f /q scripts\git-deploy.cmd
if exist scripts\git-push.js del /f /q scripts\git-push.js
git add .
git commit -m "chore: limpieza de temporales y configuracion de despliegue automatico"
git push origin main
