@echo off
echo ===================================================
echo Verificando entorno de desarrollo Android
echo ===================================================
echo.

echo 1. Verificando variables de entorno...
echo ANDROID_HOME: %ANDROID_HOME%
echo JAVA_HOME: %JAVA_HOME%
echo PATH: %PATH%

echo.
echo 2. Verificando herramientas Android...
echo SDK Tools:
if exist "%ANDROID_HOME%\tools\bin\sdkmanager.bat" (
  echo  - sdkmanager [OK]
) else (
  echo  - sdkmanager [NO ENCONTRADO]
)

if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
  echo  - adb [OK]
) else (
  echo  - adb [NO ENCONTRADO]
)

echo.
echo 3. Verificando dispositivos conectados...
adb devices -l

echo.
echo 4. Verificando configuración React Native...
cd /d %~dp0client
echo Versión de React Native:
cmd /c npm list react-native
echo Versión de react-native-webrtc:
cmd /c npm list react-native-webrtc

echo.
echo 5. Verificando configuración del proyecto...
if exist "%~dp0client\android\app\src\main\AndroidManifest.xml" (
  echo AndroidManifest.xml [OK]
) else (
  echo AndroidManifest.xml [NO ENCONTRADO]
)

echo.
echo 6. Estado del Metro Bundler:
netstat -ano | findstr "8081"

echo.
echo Verificación completada. Consulta los manuales si necesitas resolver problemas.
echo.
pause