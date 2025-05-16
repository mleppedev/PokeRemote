# Guía de Ejecución de PokeRemote

Esta guía detalla los pasos para ejecutar correctamente el proyecto PokeRemote, incluyendo la configuración del entorno, inicio del servidor y cliente, y solución de problemas comunes.

## Requisitos previos

Antes de comenzar, asegúrate de que tienes instalado:

- **Para el servidor**:
  - .NET 8.0 SDK o superior
  - Windows 10/11 (necesario para captura de pantalla e inyección de teclado)
  
- **Para el cliente**:
  - Node.js 18.0 o superior
  - React Native CLI
  - Android SDK con herramientas de plataforma (ubicado en D:\dev\SdkAndroid)
  - JDK 17 (ubicado en C:\dev\JDK\17)
  - Dispositivo Android con API 21+ (Android 5.0 o superior)

## Configuración inicial

### 1. Verificar el entorno

Ejecuta el script `verify-android.bat` para comprobar que tu entorno está correctamente configurado:

```cmd
verify-android.bat
```

Si encuentras algún problema, consulta la sección correspondiente en la [guía de solución de problemas](solucion-problemas-android.md).

### 2. Instalar dependencias

Ejecuta el script `install-dependencies.bat` para instalar todas las dependencias necesarias:

```cmd
install-dependencies.bat
```

Este comando instalará:
- Paquetes NuGet para el servidor .NET
- Dependencias npm para el cliente React Native

## Ejecución del servidor

### Opción 1: Usando VS Code Terminal Keeper

1. Abre VS Code en el directorio del proyecto
2. Usa el comando `Ctrl+Shift+P` y selecciona **Terminal Keeper: Show Sessions**
3. Selecciona la sesión **default**
4. Haz clic en la terminal **Server (.NET)** para iniciar el servidor

### Opción 2: Usando script batch

Ejecuta:

```cmd
start-server.bat
```

El servidor se iniciará y estará listo para recibir conexiones. Verás mensajes indicando el estado de inicialización y la dirección IP y puerto donde está escuchando.

## Ejecución del cliente

### Opción 1: Ejecución completa

Para iniciar el Metro Bundler y desplegar la aplicación en un dispositivo Android en un solo paso:

```cmd
run-android-full.bat
```

### Opción 2: Ejecución por pasos (VS Code Terminal Keeper)

1. En VS Code, utiliza Terminal Keeper para mostrar la sesión **default**
2. Haz clic en la terminal **React-Native Metro** para iniciar el bundler
3. Una vez que Metro esté en ejecución, haz clic en la terminal **Android Deploy** para compilar e instalar la aplicación en el dispositivo

### Opción 3: Ejecución manual por pasos

```cmd
cd client
npm start
```

Y en otra terminal:

```cmd
cd client
npm run android
```

## Conectar la aplicación al servidor

Una vez que el servidor y la aplicación cliente estén en ejecución:

1. Asegúrate de que el dispositivo Android esté en la misma red WiFi que el servidor
2. En la pantalla de inicio de la app, introduce la dirección IP del servidor (puedes verla en la consola del servidor cuando arranca)
3. Presiona "Conectar"
4. Si la conexión es exitosa, verás la pantalla de streaming con el gamepad virtual

## Uso del gamepad virtual

- En orientación vertical: usa los controles táctiles tipo GameBoy
- En orientación horizontal: puedes usar un teclado físico conectado al dispositivo
- Los botones D-Pad controlan la dirección
- Los botones A/B corresponden a acciones
- START/SELECT para opciones de menú

## Construir una versión de lanzamiento

Para crear un APK que puedas distribuir:

```cmd
build-android.bat
```

El APK resultante se generará en:
- `client/android/app/build/outputs/apk/release/app-release.apk`
- Y se copiará a `PokeRemote.apk` en el directorio raíz

## Solución de problemas comunes

### No se puede conectar al servidor

- Verifica que el servidor esté en ejecución (mira la consola del servidor)
- Asegúrate de que el dispositivo y el servidor estén en la misma red
- Comprueba cualquier firewall que pueda estar bloqueando las conexiones
- Verifica la dirección IP correcta (usa `ipconfig` en el servidor para ver su IP)

### La aplicación se cierra inesperadamente

- Revisa los logs de la aplicación:
  ```cmd
  cd client
  npx react-native log-android
  ```
- Consulta la [guía de solución de problemas](solucion-problemas-android.md) para soluciones específicas

### Problemas de rendimiento o latencia

- Cierra otras aplicaciones que consuman ancho de banda
- Acerca el dispositivo al router WiFi para mejorar la señal
- Ajusta la calidad de video en la configuración de la aplicación

Para problemas más específicos, consulta:
- [Documentación de compatibilidad WebRTC](compatibilidad-react-native-webrtc.md)
- [Guía de desarrollo](guia-desarrollo.md)
- [Solución de problemas Android](solucion-problemas-android.md)