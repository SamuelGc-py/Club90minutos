@echo off
cd /d "%~dp0.."
git add .
git commit --allow-empty -m "deploy: forzar nueva compilacion completa en vercel"
git push origin main
