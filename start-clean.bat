@echo off
echo Nettoyage des processus Node...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 3 /nobreak >nul

echo Demarrage du serveur de developpement...
npm run dev
