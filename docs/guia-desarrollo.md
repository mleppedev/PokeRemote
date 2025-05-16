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