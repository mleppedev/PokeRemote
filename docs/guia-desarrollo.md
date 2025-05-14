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
    A[Flutter UI GameBoy<br/>(vertical)] --> B[WebRTC MediaStream]
    C[RawKeyboardListener<br/>o flutter_gamepad] --> D[WebRTC DataChannel]
    orientationCheck -->|landscape| C
    orientationCheck -->|portrait| A
  end

  subgraph Red
    B <--> E[WebRTC PeerConnection]
    D <--> E
  end

  subgraph Servidor PC (.NET Core)
    E --> F[WebRTC PeerConnection]
    F --> G[VideoCapturer<br/>Graphics.CopyFromScreen]
    F <-- H[InputHandler<br/>SendInput]
  end
```

## 🔧 Componentes y Flujo de Datos

### Establecimiento de la conexión (WebRTC)

- Señalización ligera (p.ej. HTTP + WebSocket o SignalR) para intercambio de offer/answer y candidates.
- Se crea un PeerConnection con:
  - MediaStream para vídeo (captura de pantalla).
  - DataChannel para eventos de teclado.

### Captura y envío de vídeo (PC)

- Cada 100–200 ms Graphics.CopyFromScreen → frame en memoria.
- Codificación y envío por WebRTC MediaStream (H.264/VP8 con perfil ultrafast).

### Recepción y render en Flutter

- Widget RTCVideoView (desde flutter_webrtc) para mostrar la pantalla.
- En vertical (Orientation.portrait), se dibuja dentro de un AspectRatio(160/144) + filtro "pixel art" opcional.

### Detección de controles (cliente)

- Vertical (touch): overlay táctil con GestureDetector en botones D-pad, A/B, Start/Select.
- Horizontal (físico):
  - RawKeyboardListener o paquete flutter_gamepad.
  - OrientationBuilder decide qué método usar.

### Envío de eventos de teclado (WebRTC DataChannel)

- Mensaje JSON { type:"keydown", key:"ArrowUp" } o { type:"keyup", key:"KeyA" }.
- DataChannel garantiza baja latencia y priorización de paquetes.

### Inyección de teclado (PC)

- Recibir JSON en .NET Core.
- Llamar a Win32 API SendInput para simular KEYDOWN/KEYUP.

## 🛠 Stack Tecnológico

| Capa | Tecnología | Comentarios |
|------|------------|-------------|
| Cliente | Flutter (Dart) | Android ≥21, UI responsiva, un solo binario. |
| RTC Cliente | flutter_webrtc | MediaStream + DataChannel integrados. |
| Señalización | WebSocket/SignalR (opcional) | Para intercambio SDP/ICE. |
| Servidor | .NET Core 6+ (C#) | Multiplataforma futura (Linux/Windows). |
| RTC Servidor | MixedReality-WebRTC for .NET | PeerConnection Media & Data channels. |
| Captura Vídeo | System.Drawing.Graphics.CopyFromScreen | Windows nativo. |
| Inyección Key | Win32 API SendInput | Simulación fiable de teclado. |
| Protocolo | WebRTC (UDP/TCP fallback) | Mejora NAT traversal y calidad de vídeo. |

## 📈 Fases de Implementación

### MVP WebRTC básico

- Señalización + PeerConnection funcionando (loopback local).
- Envío de vídeo (dummy) y DataChannel (eco).

### Captura real y UI GameBoy

- Integrar Graphics.CopyFromScreen.
- Diseñar layout Flutter vertical con Stack y botones.

### Controles físicos y lógica

- Añadir RawKeyboardListener y paquete flutter_gamepad.
- Lógica de alternancia UI/controles según orientación.

### Pruebas y ajustes

- Optimizar bitrate y fps en WebRTC.
- Afinar mappings y latencia (aceptable para turnos).

### Mejoras futuras

- Autenticación/seguridad (TLS, tokens).
- Streaming de audio y ratón.
- Soporte iOS / Linux desktop.