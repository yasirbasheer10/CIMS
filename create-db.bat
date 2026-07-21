@echo off
set PGPASSWORD=admin1234
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE cims_db;"
echo Done! Exit code: %errorlevel%
