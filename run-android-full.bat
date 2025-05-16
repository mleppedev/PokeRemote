@echo off
echo ===================================================
echo Iniciando el proyecto PokeRemote (Cliente Android)
echo ===================================================
echo.

cd %~dp0client

echo Verificando instalación de paquetes...
if not exist node_modules (
  echo Instalando dependencias de Node.js...
  call npm install
) else (
  echo Las dependencias ya están instaladas.
)

echo.
echo Verificando dispositivo Android...
adb devices

echo.
echo Iniciando Metro Bundler en una nueva ventana...
start cmd /k "title Metro Bundler && npm start"

echo.
echo Esperando 5 segundos para que Metro Bundler inicie...
timeout /t 5 /nobreak > nul

echo.
echo Compilando e instalando la aplicación en el dispositivo Android...
call npm run android

echo.
echo Si la aplicación no se inicia automáticamente, búscala en tu dispositivo Android con el nombre "PokeRemote"
echo.