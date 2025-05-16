@echo off
echo ======================================
echo       PokeRemote Server Launcher
echo ======================================
echo.

:: Verificar si .NET está instalado
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: .NET SDK no encontrado. Por favor instala .NET 8.0 o superior.
    echo Visita https://dotnet.microsoft.com/download para descargar e instalar.
    pause
    exit /b 1
)

:: Cambiar al directorio del servidor
cd /d %~dp0server

:: Comprobar si hay errores de compilación
echo Compilando el proyecto...
dotnet build PokeRemote.Server
if %errorlevel% neq 0 (
    echo ERROR: Error en la compilación. Revisa los errores anteriores.
    pause
    exit /b 1
)

:: Obtener la dirección IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP:~1%

echo.
echo ======================================
echo Dirección IP local: %IP%
echo Puerto: 5000
echo.
echo Para conectar desde un dispositivo Android:
echo %IP%:5000
echo ======================================
echo.

:: Ejecutar el servidor
echo Iniciando servidor PokeRemote...
echo Presiona Ctrl+C para detener el servidor.
echo.
dotnet run --project PokeRemote.Server --urls=http://*:5000

pause
