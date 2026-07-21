@echo off
echo ================================================
echo  CIMS - Database Setup Script
echo ================================================
echo.

REM Check if psql is available
where psql >nul 2>&1
if errorlevel 1 (
    echo ERROR: psql not found. Make sure PostgreSQL is installed and in PATH.
    echo Try restarting this terminal after PostgreSQL installation.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.
echo Creating database "cims_db"...
psql -U postgres -c "CREATE DATABASE cims_db;" 2>&1

if errorlevel 1 (
    echo NOTE: Database may already exist - that's OK!
) else (
    echo Database created successfully!
)

echo.
echo ================================================
echo  Now update server\.env with your password:
echo  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cims_db
echo ================================================
echo.
pause
