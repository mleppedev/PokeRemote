# PokeRemote - Cliente React Native

## Estructura del Proyecto

```
client/
├── android/
├── ios/
├── src/
│   ├── api/
│   │   ├── SignalingService.js
│   │   └── GrpcService.js
│   ├── components/
│   │   ├── GamepadControls.js
│   │   ├── StreamView.js
│   │   └── ConnectionStatus.js
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── StreamScreen.js
│   │   └── SettingsScreen.js
│   ├── utils/
│   │   └── WebRTCHelper.js
│   ├── App.js
│   └── navigation.js
└── package.json
```

## Requisitos

- Node.js 14+
- React Native CLI
- Android Studio para compilar en Android

## Configuración

1. Instala las dependencias:

```bash
npm install
```

2. Instala las dependencias específicas para WebRTC y gRPC:

```bash
npm install react-native-webrtc grpc-web react-native-grpc-client
```

3. Enlaza las bibliotecas nativas:

```bash
npx react-native link
```

4. Ejecuta la aplicación:

```bash
npx react-native run-android
```

## Funcionalidades

- Configuración de conexión al servidor
- Visualización del streaming de video desde PC
- Controles de gamepad virtuales
- Adaptación a diferentes orientaciones de pantalla

## Implementación Pendiente

- Interfaz de gamepad con controles táctiles
- Cliente WebRTC para recepción de video
- Cliente gRPC para envío de comandos
- Gestión de errores y reconexión
