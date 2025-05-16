@echo off
:: Restaura las rutas correctas en local.properties antes de compilar
echo Restaurando configuración correcta de local.properties...
echo sdk.dir=D:\\dev\\SdkAndroid> d:\src\poke\client\android\local.properties
echo ndk.dir=D:\\dev\\SdkAndroid\\ndk\\27.0.12077973>> d:\src\poke\client\android\local.properties
echo flutter.sdk=C:\\dev\\flutter>> d:\src\poke\client\android\local.properties
echo flutter.buildMode=debug>> d:\src\poke\client\android\local.properties
echo flutter.versionName=1.0.0>> d:\src\poke\client\android\local.properties
echo flutter.versionCode=1>> d:\src\poke\client\android\local.properties
echo Configuración restaurada.

:: Continuar con el comando de compilación de flutter
cd d:\src\poke\client
flutter build apk --debug

echo Compilación finalizada.
