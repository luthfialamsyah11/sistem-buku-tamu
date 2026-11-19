@echo off
title Menjalankan Aplikasi Buku Tamu dan Rapat

echo 1. Memeriksa Database MySQL (Port 3306)...
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="1" (
    echo    Menjalankan MySQL...
    start "" /B "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.4.3-winx64\my.ini"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo    MySQL sudah aktif.
)

echo 2. Memeriksa Backend Laravel (Port 8000)...
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="1" (
    echo    Menjalankan Backend Laravel...
    start "Laravel API (8000)" cmd /k "cd /d "%~dp0backend" && "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan serve --host=0.0.0.0 --port=8000"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo    Backend Laravel sudah aktif.
)

echo 3. Memeriksa Frontend Ionic (Port 8100)...
netstat -ano | findstr ":8100" | findstr "LISTENING" >nul
if "%ERRORLEVEL%"=="1" (
    echo    Menjalankan Frontend Ionic...
    start "Ionic Frontend (8100)" cmd /k "cd /d "%~dp0frontend" && npm.cmd start -- --host 0.0.0.0 --port 8100"
    ping 127.0.0.1 -n 5 >nul
) else (
    echo    Frontend Ionic sudah aktif.
)

echo.
echo Membuka aplikasi di browser...
start http://127.0.0.1:8100
