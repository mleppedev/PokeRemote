@echo off
REM Script para compilar la APK con la configuración correcta del SDK de Android
echo Configurando variables de entorno...
set ANDROID_HOME=D:\dev\SdkAndroid
set ANDROID_SDK_ROOT=D:\dev\SdkAndroid

echo Limpiando el proyecto...
cd /d D:\src\poke\client
call flutter clean

echo Obteniendo dependencias...
call flutter pub get

echo Compilando APK...
call flutter build apk --debug

echo Compilación finalizada.
pause
