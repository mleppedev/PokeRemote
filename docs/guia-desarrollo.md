# Guía de Desarrollo

## 🚩 Alcance (Scope)

**Objetivo principal**: permitir jugar por turnos a tu PC desde Android (smartphone o RG353V Android) con UI "GameBoy" en vertical y controles físicos en horizontal.

**Usuarios**: un único cliente activo por sesión (no multijugador simultáneo).

**Plataformas cliente**: Android API ≥21 (teléfono y RG353V Android).

**Plataforma servidor**: Windows con .NET Core (para captura de pantalla e inyección de teclado).

### Limitaciones:

- Latencia aceptable pero no para acción en tiempo real (solo juegos por turnos).
- No contempla autenticación avanzada (MVP); se puede añadir más adelante.
- No incluye audio ni streaming de ratón (solo vídeo de pantalla y teclado).

## 🎯 Arquitectura General

```mermaid
flowchart LR
  subgraph Cliente Android
    A[React Native UI GameBoy<br/>(vertical)] --> B[WebRTC MediaStream]
    C[NativeKeyboardEvent<br/>o react-native-gamepad] --> D[gRPC CommandStream]
    orientationCheck -->|landscape| C
    orientationCheck -->|portrait| A
  end

  subgraph Red
    B <--> E[WebRTC PeerConnection]
    D <--> G[gRPC StreamingConnection]
  end

  subgraph Servidor PC (.NET Core)
    E --> F[WebRTC PeerConnection]
    F --> H[VideoCapturer<br/>SharpDX.CaptureScreen]
    G --> I[gRPC Service<br/>InputHandler]
    I --> J[SendInput]
  end
```

## 🔧 Componentes y Flujo de Datos

### Establecimiento de la conexión (WebRTC + gRPC)

- **WebRTC para video**:
  - Señalización mediante SignalR Core para intercambio de offer/answer y candidates.
  - Se crea un PeerConnection dedicado exclusivamente para MediaStream de video.

- **gRPC para comandos**:
  - Conexión gRPC independiente para transmisión bidireccional de comandos.
  - Mayor fiabilidad y menor latencia para controles de juego.

### Captura y envío de vídeo (PC)

- Cada 60-100 ms SharpDX.CaptureScreen → frame en memoria.
- Codificación y envío por WebRTC MediaStream (H.264/VP8 con perfil ultrafast).

### Recepción y render en React Native

- Componente RTCView (desde react-native-webrtc) para mostrar la pantalla.
- En vertical (Orientation.portrait), se renderiza dentro de un componente AspectRatio con formato GameBoy (160/144) + filtros visuales opcionales.

### Detección de controles (cliente)

- Vertical (touch): overlay táctil con componentes TouchableOpacity en botones D-pad, A/B, Start/Select.
- Horizontal (físico):
  - KeyboardEvent para teclas físicas o react-native-game-controller para gamepads.
  - Detección de orientación para alternar entre modos.

### Envío de eventos de teclado (gRPC)

- Mensaje serializado con Protocol Buffers: `{ buttonId: "UP", state: "PRESSED" }`
- Servicio gRPC bidireccional para alta fiabilidad y baja latencia
- WebRTC DataChannel como fallback si gRPC falla

### Inyección de teclado (PC)

- Recibir mensajes gRPC en servicio .NET Core.
- Procesamiento de alta prioridad para los comandos recibidos.
- Llamar a Win32 API SendInput para simular KEYDOWN/KEYUP.

## 🛠 Stack Tecnológico

| Capa | Tecnología | Comentarios |
|------|------------|-------------|
| Cliente | React Native (JavaScript/TypeScript) | Android ≥21, UI responsiva, desarrollo eficiente. |
| RTC Cliente | react-native-webrtc | MediaStream para streaming de video. |
| Protocolo de Control | gRPC/Protocol Buffers | Comunicación de comandos con alta fiabilidad. |
| Señalización | SignalR Core | Para intercambio SDP/ICE de WebRTC. |
| Servidor | .NET 8+ (C#) | Alto rendimiento, compatible con Windows. |
| RTC Servidor | SIPSorcery o Microsoft.MixedReality.WebRTC | PeerConnection para streaming de video. |
| Captura Vídeo | SharpDX.CaptureScreen | Capturas de alta velocidad en Windows. |
| Inyección Key | Win32 API SendInput | Simulación fiable de teclado. |
| Protocolo Streaming | WebRTC (UDP/TCP fallback) | Streaming de video optimizado para baja latencia. |

## 📈 Fases de Implementación

### Fase 1: MVP WebRTC y gRPC básico

- Configurar servidor SignalR para la señalización WebRTC.
- Implementar PeerConnection funcional (loopback local).
- Configurar servicio gRPC para comandos del gamepad.

### Fase 2: Captura de pantalla y UI GameBoy

- Integrar SharpDX.CaptureScreen para captura de alta frecuencia.
- Diseñar interfaz React Native con componentes para gamepad virtual.
- Implementar visualización WebRTC en cliente React Native.

### Fase 3: Controles físicos y lógica

- Añadir soporte para eventos de teclado nativo y controladores físicos.
- Implementar lógica de alternancia UI según orientación del dispositivo.
- Conectar gRPC para transmisión de comandos al servidor.

### Fase 4: Optimización y pruebas

- Optimizar configuración de WebRTC (bitrate, fps, codecs).
- Ajustar latencia y manejo de pérdida de paquetes.
- Pruebas en diferentes redes y dispositivos Android.

### Fase 5: Mejoras futuras

- Autenticación/seguridad (TLS, tokens JWT).
- Streaming de audio bidireccional.
- Soporte para iOS y adaptación para otros dispositivos.
- Implementación de modo multijugador colaborativo.

# Checklist de desarrollo progresivo

Este checklist está diseñado para avanzar paso a paso, desde lo más básico hasta pruebas avanzadas y mejoras futuras. Se recomienda seguirlo de forma iterativa y con calma, validando cada etapa antes de continuar.

## 1. Preparación del entorno
- [x] Instalar Node.js (≥18) y NPM
  ```
  # Verificar versiones
  node --version
  npm --version
  ```
- [x] Instalar React Native CLI globalmente
  ```
  npm install -g react-native-cli
  react-native --version
  ```
- [x] Instalar Android Studio o SDK y configurar variables ANDROID_HOME/JAVA_HOME
  - Configurar variables de entorno en Windows:
    - ANDROID_HOME → ruta al SDK (ej: D:\dev\SdkAndroid)
    - Path → añadir %ANDROID_HOME%\platform-tools
- [x] Instalar .NET SDK 8.0 o superior
  ```
  # Verificar versión
  dotnet --version
  ```
- [x] Clonar el repositorio y abrir en VS Code o Cursor

## 1.1 Inicialización de proyectos
- [x] Inicializar proyecto cliente (React Native)
  ```
  # Crear estructura de carpetas
  mkdir client
  mkdir client\src
  mkdir client\src\components
  mkdir client\src\screens
  mkdir client\src\services
  mkdir client\src\utils
  
  # Inicializar proyecto React Native
  cd client
  npx react-native init PokeRemoteClient
  # Mover archivos generados al directorio actual (en Windows)
  xcopy /E /H /C /I PokeRemoteClient\* .
  rmdir /S /Q PokeRemoteClient
  
  # Instalar dependencias necesarias
  npm install react-native-webrtc
  npm install @react-native-community/async-storage
  npm install react-native-orientation
  npm install grpc-web google-protobuf
  ```

- [x] Inicializar proyecto servidor (.NET)
  ```
  # Crear estructura de carpetas
  mkdir server
  cd server
  mkdir PokeRemote.Server
  mkdir PokeRemote.Core
  mkdir PokeRemote.Tests
  
  # Crear solución
  dotnet new sln -n PokeRemote
  
  # Crear proyectos
  cd PokeRemote.Server
  dotnet new web
  cd ..\PokeRemote.Core
  dotnet new classlib
  cd ..\PokeRemote.Tests
  dotnet new xunit
  cd ..
  
  # Añadir proyectos a la solución
  dotnet sln add PokeRemote.Server\PokeRemote.Server.csproj
  dotnet sln add PokeRemote.Core\PokeRemote.Core.csproj
  dotnet sln add PokeRemote.Tests\PokeRemote.Tests.csproj
  
  # Añadir referencias entre proyectos
  dotnet add PokeRemote.Server\PokeRemote.Server.csproj reference PokeRemote.Core\PokeRemote.Core.csproj
  dotnet add PokeRemote.Tests\PokeRemote.Tests.csproj reference PokeRemote.Core\PokeRemote.Core.csproj
  dotnet add PokeRemote.Tests\PokeRemote.Tests.csproj reference PokeRemote.Server\PokeRemote.Server.csproj
  
  # Instalar paquetes necesarios (servidor)
  cd PokeRemote.Server
  dotnet add package Microsoft.AspNetCore.SignalR
  dotnet add package Grpc.AspNetCore
  dotnet add package Microsoft.AspNetCore.Cors
  dotnet add package SharpDX
  dotnet add package SharpDX.Direct3D11
  cd ..
  
  # Instalar paquetes necesarios (core)
  cd PokeRemote.Core
  dotnet add package SharpDX
  dotnet add package SharpDX.Direct3D11
  cd ..
  ```

- [x] Estructura básica cliente (React Native)
  - Crear archivos iniciales:
    - `client\src\App.js` - Punto de entrada
    - `client\src\screens\ConnectionScreen.js` - Pantalla conexión
    - `client\src\screens\GamepadScreen.js` - Pantalla gamepad
    - `client\src\components\VirtualGamepad.js` - Componente gamepad
    - `client\src\services\WebRTCService.js` - Servicio WebRTC
    - `client\src\services\GrpcService.js` - Servicio gRPC

- [x] Estructura básica servidor (.NET)
  - Crear archivos iniciales:
    - `server\PokeRemote.Server\Hubs\SignalingHub.cs`
    - `server\PokeRemote.Server\Services\GamepadService.cs`
    - `server\PokeRemote.Core\Capture\ScreenCapture.cs`
    - `server\PokeRemote.Core\Input\KeyboardEmulator.cs`
    - `server\PokeRemote.Core\WebRTC\PeerConnectionManager.cs`

## 2. Verificación de cliente Android (React Native)
- [ ] Navegar a `client/`
- [ ] Ejecutar `npm install` para instalar dependencias
- [ ] Conectar un dispositivo Android con depuración USB activada
- [ ] Ejecutar `react-native run-android` y verificar que la app inicia en el dispositivo
- [ ] Probar la UI básica: que la pantalla principal y los controles virtuales aparecen

## 3. Verificación de servidor (.NET)
- [ ] Navegar a `server/`
- [ ] Ejecutar `dotnet restore` para restaurar paquetes
- [ ] Ejecutar `dotnet build` para compilar
- [ ] Ejecutar `dotnet run --project PokeRemote.Server` y verificar que el servidor inicia sin errores

## 4. Conexión básica cliente-servidor
- [ ] Conectar ambos dispositivos a la misma red WiFi
- [ ] Ingresar la IP del servidor en la app cliente
- [ ] Verificar que la app cliente puede conectarse al servidor (aunque no haya streaming aún)

## 5. Prueba de streaming de video (WebRTC)
- [ ] Verificar que el servidor transmite la pantalla correctamente
- [ ] Ver en el cliente la pantalla del PC en tiempo real (RTCView)
- [ ] Probar diferentes orientaciones y tamaños de pantalla

## 6. Prueba de controles virtuales (gRPC)
- [ ] Pulsar botones en el gamepad virtual y verificar que los comandos llegan al servidor
- [ ] Confirmar que el servidor inyecta correctamente las teclas en Windows

## 7. Prueba de controles físicos
- [ ] Conectar un teclado físico o gamepad al dispositivo Android
- [ ] Verificar que los eventos físicos se detectan y envían al servidor

## 8. Iteración y pruebas avanzadas
- [ ] Probar en diferentes redes y dispositivos Android
- [ ] Ajustar parámetros de WebRTC (bitrate, fps, codecs) para optimizar latencia/calidad
- [ ] Realizar pruebas de estabilidad y manejo de errores

## 9. (Opcional) Mejoras futuras
- [ ] Añadir autenticación y seguridad (TLS, JWT)
- [ ] Implementar streaming de audio
- [ ] Adaptar para iOS y otros dispositivos
- [ ] Explorar modo multijugador