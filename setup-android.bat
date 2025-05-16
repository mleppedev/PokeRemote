@echo off
echo ===================================================
echo Configurando entorno para desarrollo Android
echo ===================================================
echo.

set JAVA_HOME_TARGET=C:\dev\JDK\17
set ANDROID_HOME_TARGET=D:\dev\SdkAndroid

echo Verificando instalación de Java...
if exist "%JAVA_HOME_TARGET%" (
  echo Java JDK encontrado en: %JAVA_HOME_TARGET%
  setx JAVA_HOME "%JAVA_HOME_TARGET%"
  echo Variable JAVA_HOME configurada.
) else (
  echo ERROR: Java JDK no encontrado en: %JAVA_HOME_TARGET%
  echo Por favor instala Java JDK en la ubicación especificada.
)

echo.
echo Verificando instalación de Android SDK...
if exist "%ANDROID_HOME_TARGET%" (
  echo Android SDK encontrado en: %ANDROID_HOME_TARGET%
  setx ANDROID_HOME "%ANDROID_HOME_TARGET%"
  echo Variable ANDROID_HOME configurada.
) else (
  echo ERROR: Android SDK no encontrado en: %ANDROID_HOME_TARGET%
  echo Por favor instala Android Studio y el Android SDK.
)

echo.
echo Instalando dependencias de React Native WebRTC...
cd %~dp0client
call npm install --save react-native-webrtc

echo.
echo Verificando dispositivos Android conectados...
adb devices

echo.
echo Configuración completada. Para solucionar problemas comunes consulta:
echo docs\solucion-problemas-android.md
echo.
pause