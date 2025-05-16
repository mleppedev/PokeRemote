@echo off
echo ===================================================
echo Limpieza y reconstrucción completa del proyecto Android
echo ===================================================
echo.

cd %~dp0client

echo Limpiando node_modules...
if exist node_modules (
  rmdir /s /q node_modules
  echo - node_modules eliminado
)

echo.
echo Limpiando caché de npm...
call npm cache clean --force
echo - Caché de npm limpiado

echo.
echo Limpiando directorio android/build...
cd android
if exist app\build (
  rmdir /s /q app\build
  echo - app\build eliminado
)
if exist build (
  rmdir /s /q build
  echo - build eliminado
)
if exist .gradle (
  rmdir /s /q .gradle
  echo - .gradle eliminado
)

echo.
echo Ejecutando gradle clean...
call gradlew clean
echo - Gradle limpiado

cd ..

echo.
echo Reinstalando dependencias...
call npm install
echo - Dependencias instaladas

echo.
echo Verificando archivos generados...
if exist android\app\build\generated (
  echo - Archivos generados correctamente
) else (
  echo - No se encontraron archivos generados, ejecutando jetifier...
  call npx jetify
)

echo.
echo Reconstrucción completa finalizada.
echo Para compilar el proyecto, ejecuta build-android.bat
echo Para ejecutar la aplicación en modo debug, ejecuta run-android.bat
echo.
pause