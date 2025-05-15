@echo off
echo ======================================================
echo Limpiando archivos de compilación locales
echo ======================================================

echo Eliminando carpetas de compilación local y archivos de configuración Gradle...

REM Eliminar carpetas de compilación de Flutter
if exist "client\build" (
    echo - Eliminando client\build
    rmdir /s /q "client\build"
)
if exist "client\.dart_tool" (
    echo - Eliminando client\.dart_tool
    rmdir /s /q "client\.dart_tool"
)

REM Eliminar archivos de configuración Gradle en la raíz y plugins
if exist "build\gradle.properties" (
    echo - Eliminando build\gradle.properties
    del /q "build\gradle.properties"
)
if exist "build\build.gradle" (
    echo - Eliminando build\build.gradle
    del /q "build\build.gradle"
)
if exist "build\settings.gradle" (
    echo - Eliminando build\settings.gradle
    del /q "build\settings.gradle"
)

REM Eliminar configuraciones específicas de plugins
echo - Limpiando configuraciones de plugins...
for %%p in (path_provider_android flutter_webrtc shared_preferences_android) do (
    if exist "build\%%p\local.properties" (
        echo   - Eliminando build\%%p\local.properties
        del /q "build\%%p\local.properties"
    )
    if exist "build\%%p\build.gradle" (
        echo   - Eliminando build\%%p\build.gradle
        del /q "build\%%p\build.gradle"
    )
    if exist "build\%%p\settings.gradle" (
        echo   - Eliminando build\%%p\settings.gradle
        del /q "build\%%p\settings.gradle"
    )
    if exist "build\%%p\.gradle" (
        echo   - Eliminando build\%%p\.gradle
        rmdir /s /q "build\%%p\.gradle"
    )
)

REM Conservar las configuraciones importantes en android/ pero eliminar carpetas de compilación
echo - Conservando configuraciones importantes de Android pero eliminando compilaciones...
if exist "client\android\.gradle" (
    echo   - Eliminando client\android\.gradle
    rmdir /s /q "client\android\.gradle"
)
if exist "client\android\.idea" (
    echo   - Eliminando client\android\.idea
    rmdir /s /q "client\android\.idea"
)
if exist "client\android\app\build" (
    echo   - Eliminando client\android\app\build
    rmdir /s /q "client\android\app\build"
)

echo.
echo ======================================================
echo Limpieza completa
echo ======================================================
echo.
echo Ahora puedes usar los scripts Docker para compilar tu proyecto:
echo   .\build-with-docker.bat      - Para compilar el APK
echo   .\dev-shell.bat              - Para desarrollo interactivo
echo.
