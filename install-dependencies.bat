@echo off
echo ===================================================
echo Instalando dependencias para PokeRemote
echo ===================================================
echo.

echo Instalando dependencias del cliente...
cd %~dp0client
call npm install

echo.
echo Restaurando paquetes NuGet del servidor...
cd %~dp0server
dotnet restore

echo.
echo Todas las dependencias han sido instaladas correctamente.
echo.
pause