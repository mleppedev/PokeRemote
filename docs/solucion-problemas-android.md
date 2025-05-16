# Solución de problemas de desarrollo Android

Esta guía contiene soluciones para los problemas más comunes que pueden surgir durante el desarrollo de la aplicación PokeRemote para Android.

## Índice
1. [Problemas de configuración del entorno](#problemas-de-configuración-del-entorno)
2. [Errores de compilación](#errores-de-compilación)
3. [Errores de React Native](#errores-de-react-native)
4. [Problemas con WebRTC](#problemas-con-webrtc)
5. [Problemas con gRPC](#problemas-con-grpc)
6. [Errores en tiempo de ejecución](#errores-en-tiempo-de-ejecución)

## Problemas de configuración del entorno

### Variables de entorno mal configuradas

**Síntoma:** Errores como "ANDROID_HOME no está configurado" o "JAVA_HOME no está configurado"

**Solución:** 
1. Ejecuta `setup-android.bat` que configura automáticamente las variables
2. O configúralas manualmente:
   ```cmd
   setx ANDROID_HOME "D:\dev\SdkAndroid"
   setx JAVA_HOME "C:\dev\JDK\17"
   ```

### No se encuentran las herramientas de Android SDK

**Síntoma:** Errores como "adb no se reconoce como un comando interno o externo"

**Solución:**
1. Instala Android Studio con Android SDK: [https://developer.android.com/studio](https://developer.android.com/studio)
2. Agrega las rutas a PATH:
   ```cmd
   setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
   ```

## Errores de compilación

### Error de Gradle durante la compilación

**Síntoma:** Errores como "Failed to install the app" o "Could not find tools.jar"

**Solución:**
1. Verifica que estás usando la versión correcta de JDK (JDK 17 en este caso, pero asegúrate de que es compatible con tu versión de Gradle)
2. Ejecuta `rebuild-android.bat` para limpiar y reconstruir el proyecto
3. Modifica `android/gradle.properties` añadiendo:
   ```
   org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
   ```

### Error con las bibliotecas nativas

**Síntoma:** Errores como "native libraries missing" o "library not found"

**Solución:**
1. Ejecuta `regenerate-android.bat` para regenerar los archivos nativos
2. Verifica que NDK está instalado en Android Studio:
   - Abre Android Studio → SDK Manager → SDK Tools
   - Marca "NDK (Side by side)" y "CMake"

## Errores de React Native

### Metro Bundler no se inicia

**Síntoma:** "Cannot start Metro bundler" o "Error: Cannot connect to Metro"

**Solución:**
1. Verifica que el puerto 8081 está disponible:
   ```cmd
   netstat -ano | findstr "8081"
   ```
2. Mata cualquier proceso usando ese puerto:
   ```cmd
   taskkill /PID [número_de_proceso] /F
   ```
3. Ejecuta con puerto alternativo:
   ```cmd
   npx react-native start --port 8088
   ```

### Errores de JavaScript

**Síntoma:** Excepciones de JavaScript en la aplicación o pantalla roja de error

**Solución:**
1. Verifica los registros:
   ```cmd
   npx react-native log-android
   ```
2. Activa el modo de desarrollo al agitar el dispositivo
3. Ejecuta el debugger de JavaScript (Dev Menu → Debug)

## Problemas con WebRTC

### Error al inicializar WebRTC

**Síntoma:** "Failed to initialize PeerConnection" o "getUserMedia failed"

**Solución:**
1. Verifica permisos en AndroidManifest.xml:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
   ```

2. Solicita permisos en tiempo de ejecución:
   ```javascript
   import { PermissionsAndroid } from 'react-native';
   
   const requestPermissions = async () => {
     try {
       const granted = await PermissionsAndroid.requestMultiple([
         PermissionsAndroid.PERMISSIONS.CAMERA,
         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
       ]);
       // Verificar resultados
     } catch (err) {
       console.error(err);
     }
   };
   ```

### Problemas de conectividad WebRTC

**Síntoma:** "ICE connection failed" o "Cannot connect to peer"

**Solución:**
1. Verifica la configuración de los servidores STUN/TURN:
   ```javascript
   const configuration = {
     iceServers: [
       {
         urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
       },
     ],
     iceCandidatePoolSize: 10,
   };
   ```

2. Comprueba los firewall y NAT:
   ```cmd
   ping stun.l.google.com
   ```

## Problemas con gRPC

### Error de conexión gRPC

**Síntoma:** "Cannot connect to gRPC service" o "Deadline exceeded"

**Solución:**
1. Verifica que el servidor .NET está en ejecución
2. Comprueba que la dirección IP y puerto son correctos
3. Asegúrate de que no hay firewall bloqueando conexiones

### Error de serialización gRPC

**Síntoma:** "Cannot deserialize message" o "Unknown field"

**Solución:**
1. Verifica que las definiciones .proto son idénticas en cliente y servidor
2. Regenera los archivos de cliente:
   ```cmd
   cd client
   npm run generate-grpc
   ```

## Errores en tiempo de ejecución

### Crash al girar la pantalla

**Síntoma:** La aplicación se cierra al cambiar orientación

**Solución:**
1. Usa react-native-orientation-locker para gestionar los cambios:
   ```javascript
   import Orientation from 'react-native-orientation-locker';
   
   // Bloquear en orientación específica
   Orientation.lockToPortrait();
   
   // O escuchar cambios
   Orientation.addOrientationListener((orientation) => {
     console.log(`Orientation changed to: ${orientation}`);
   });
   ```

### Problemas de rendimiento

**Síntoma:** Latencia alta o vídeo entrecortado

**Solución:**
1. Ajusta la configuración de WebRTC:
   ```javascript
   // Reducir resolución
   const videoConstraints = {
     mandatory: {
       minWidth: 640,
       minHeight: 360,
       minFrameRate: 30,
     }
   };
   
   // Optimizar codecs
   pc.addTransceiver('video', {
     direction: 'recvonly',
     sendEncodings: [
       { maxBitrate: 1500000, maxFramerate: 30 },
     ],
   });
   ```

2. Monitoriza métricas:
   ```javascript
   setInterval(async () => {
     const stats = await pc.getStats();
     stats.forEach(report => {
       if (report.type === 'inbound-rtp' && report.kind === 'video') {
         console.log(`Frames decoded: ${report.framesDecoded}`);
         console.log(`Packets lost: ${report.packetsLost}`);
       }
     });
   }, 1000);
   ```

Para más información, consulta la [guía de desarrollo](guia-desarrollo.md) y la [documentación de compatibilidad](compatibilidad-react-native-webrtc.md).