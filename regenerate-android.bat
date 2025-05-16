@echo off
echo ===================================================
echo Regenerando archivos nativos de Android
echo ===================================================
echo.

cd %~dp0client

echo Limpiando archivos generados...
cd android
if exist app\build\generated (
  rmdir /s /q app\build\generated
  echo - Archivos generados eliminados
)

echo.
echo Regenerando archivos de codegen...
call gradlew generateCodegenArtifactsFromSchema
echo - Codegen regenerado

echo.
echo Regenerando Protos gRPC...
if exist ..\src\api\proto (
  echo - Regenerando archivos gRPC desde definiciones .proto
  cd ..
  call npm run generate-grpc
) else (
  echo - No se encontró directorio de protos
)

cd %~dp0

echo.
echo Proceso de regeneración completado.
echo.
pause