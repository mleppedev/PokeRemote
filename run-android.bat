@echo off
echo ===================================================
echo Ejecutando aplicación Android en modo debug
echo ===================================================
echo.

echo Verificando dispositivos Android conectados...
adb devices -l

echo.
echo Ejecutando aplicación en modo debug...
cd %~dp0client
call npm run android

echo.
echo Para ver los logs de la aplicación, ejecuta:
echo npx react-native log-android
echo.
pause