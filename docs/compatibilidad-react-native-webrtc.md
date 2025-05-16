# Guía de compatibilidad de react-native-webrtc

Este documento contiene soluciones para los problemas más comunes al trabajar con la biblioteca react-native-webrtc en el proyecto PokeRemote.

## Requisitos previos

- React Native 0.68.0 o superior
- Node.js 18.0 o superior
- Android SDK con API level 21 o superior
- WebRTC nativo actualizado

## Problemas comunes y soluciones

### Error durante la compilación: JNI DETECTED ERROR IN APPLICATION

**Problema:** La aplicación se cierra con un error de JNI durante la inicialización de WebRTC.

**Solución:**
```bash
# Actualizar la dependencia de react-native-webrtc a la última versión
npm install --save react-native-webrtc@latest

# Limpiar la caché y reinstalar
cd android
./gradlew clean
cd ..
react-native start --reset-cache
```

### Error de permisos de cámara o micrófono

**Problema:** La aplicación no puede acceder a la cámara o micrófono necesarios para la señalización WebRTC.

**Solución:**
Asegúrate de añadir los siguientes permisos en tu `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

Y solicitar los permisos en tiempo de ejecución:

```javascript
import { PermissionsAndroid } from 'react-native';

const requestPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    if (
      granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('Permisos de cámara y micrófono concedidos');
    } else {
      console.log('Algunos permisos denegados');
    }
  } catch (err) {
    console.warn(err);
  }
};
```

### Error de incompatibilidad de Gradle

**Problema:** Errores relacionados con versiones de Gradle al compilar la aplicación.

**Solución:**
Asegúrate de que tu archivo `android/build.gradle` tiene la configuración correcta:

```gradle
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.8.0"
    }
}
```

### Error: WebRTC no se conecta correctamente

**Problema:** La conexión WebRTC no se establece o se cae frecuentemente.

**Solución:**

1. Verifica la configuración de los servidores ICE:

```javascript
const configuration = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(configuration);
```

2. Asegúrate de manejar todos los eventos WebRTC:

```javascript
pc.onicecandidate = (event) => {
  // Manejar candidatos ICE
};

pc.oniceconnectionstatechange = (event) => {
  console.log('ICE Connection State:', pc.iceConnectionState);
};

pc.onconnectionstatechange = (event) => {
  console.log('Connection State:', pc.connectionState);
};
```

### Error: Alta latencia en el streaming de video

**Problema:** El video llega con retardo significativo al dispositivo cliente.

**Solución:**

1. Ajustar la configuración de codificación de video:

```javascript
const videoConstraints = {
  mandatory: {
    minWidth: 640,
    minHeight: 360,
    minFrameRate: 30,
  },
  facingMode: 'user',
};

// Para optimizar la latencia
const offerOptions = {
  offerToReceiveAudio: false,  // Desactiva audio si no es necesario
  offerToReceiveVideo: true,
  voiceActivityDetection: false,
};

// Configuración de codecs optimizada para baja latencia
pc.addTransceiver('video', {
  direction: 'recvonly',
  sendEncodings: [
    { maxBitrate: 1500000, maxFramerate: 30 },
  ],
});
```

2. Configurar el descriptor SDP para priorizar VP8 con menor latencia:

```javascript
function preferCodec(sdp, codecName, codecType) {
  const sections = sdp.split('\r\nm=');
  const newSDP = sections.map((section) => {
    if (section.startsWith(codecType)) {
      const lines = section.split('\r\n');
      const payloadTypes = [];
      const regex = new RegExp('a=rtpmap:(\\d+) ' + codecName + '\\/\\d+');
      
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(regex);
        if (match && match.length > 1) {
          payloadTypes.push(match[1]);
        }
      }
      
      if (payloadTypes.length > 0) {
        // Reordenar los códecs
        const line = lines.find(line => line.startsWith('m=' + codecType));
        if (line) {
          const parts = line.split(' ');
          const newParts = parts.slice(0, 3);
          payloadTypes.forEach(pt => newParts.push(pt));
          
          for (let i = 3; i < parts.length; i++) {
            if (!payloadTypes.includes(parts[i])) {
              newParts.push(parts[i]);
            }
          }
          
          lines[lines.indexOf(line)] = newParts.join(' ');
        }
      }
      
      return lines.join('\r\n');
    } else {
      return section;
    }
  });
  
  return newSDP.join('\r\nm=');
}
```

### Error al integrar gRPC con React Native

**Problema:** Dificultades al configurar o utilizar gRPC en React Native.

**Solución:**

1. Usar la biblioteca `grpc-web` o `@grpc/grpc-js` con adaptadores para React Native:

```bash
npm install --save grpc-web google-protobuf
```

2. Configurar la implementación del cliente:

```javascript
import { GrpcWebClientBase } from 'grpc-web';
import { GamepadClient } from './generated/GamepadServiceClientPb';

const client = new GamepadClient('http://192.168.1.100:50051', null, null);

// Implementar los métodos para enviar comandos
const sendCommand = (buttonId, buttonState) => {
  const request = new CommandRequest();
  request.setButtonId(buttonId);
  request.setState(buttonState);
  
  client.sendCommand(request, {}, (err, response) => {
    if (err) {
      console.error('Error al enviar comando:', err);
      return;
    }
    console.log('Comando enviado correctamente');
  });
};
```

## Optimización de rendimiento

Para obtener el mejor rendimiento con react-native-webrtc en el proyecto PokeRemote:

1. Utiliza RON (React Optimized Native) para componentes críticos de renderización
2. Implementa el control por gRPC para reducir la latencia de comandos
3. Ajusta la calidad del video según la red disponible
4. Utiliza la versión más reciente de WebRTC compilada con optimizaciones específicas para móvil
5. Considera utilizar un hilo de trabajo dedicado para procesar frames de video

## Recursos adicionales

- [Documentación oficial de react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc)
- [Guía de WebRTC para React Native](https://webrtc.org/getting-started/firebase-rtc-codelab)
- [Optimización de rendimiento en React Native](https://reactnative.dev/docs/performance)
