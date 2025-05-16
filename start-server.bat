@echo off
echo ===================================================
echo Iniciando el servidor PokeRemote (.NET 8)
echo ===================================================
echo.

cd %~dp0server

echo Restaurando paquetes NuGet...
dotnet restore

echo.
echo Compilando el proyecto...
dotnet build

echo.
echo Iniciando el servidor PokeRemote...
dotnet run --project PokeRemote.Server

echo.
echo El servidor se ha detenido.
echo.