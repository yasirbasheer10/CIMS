@echo off
echo ================================================
echo  CIMS - Deploy to Railway (One URL, No GitHub)
echo ================================================
echo.

echo [1/4] Building React frontend...
cd ..\client
call npm run build
if errorlevel 1 (echo BUILD FAILED && pause && exit /b 1)

echo.
echo [2/4] Copying frontend build into server/public...
cd ..\server
if exist public rmdir /s /q public
xcopy /E /I /Y ..\client\dist public >nul
echo Done.

echo.
echo [3/4] Deploying to Railway...
call railway up

echo.
echo [4/4] Done! Your app is live on Railway.
echo       Check your URL in the Railway dashboard.
echo.
pause
