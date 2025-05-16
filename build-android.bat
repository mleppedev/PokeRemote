@echo off
echo ===================================================
echo Compilando APK de lanzamiento para PokeRemote
echo ===================================================
echo.

cd %~dp0client

echo Instalando dependencias...
call npm install

echo.
echo Limpiando build anterior...
cd android
call gradlew clean

echo.
echo Compilando APK de Release...
call gradlew assembleRelease

echo.
if exist "app\build\outputs\apk\release\app-release.apk" (
  echo APK generado correctamente en:
  echo %~dp0client\android\app\build\outputs\apk\release\app-release.apk
  
  echo.
  echo Copiando APK al directorio raíz...
  copy "app\build\outputs\apk\release\app-release.apk" "..\..\PokeRemote.apk"
  
  echo.
  echo ¿Deseas instalar la aplicación en un dispositivo conectado? (S/N)
  set /p instalar=
  
  if /i "%instalar%"=="S" (
    echo.
    echo Instalando en el dispositivo...
    adb install -r "app\build\outputs\apk\release\app-release.apk"
  )
) else (
  echo Error: No se pudo generar el APK. Revisa los mensajes de error anteriores.
)

echo.
cd %~dp0
echo Proceso completado.
pause