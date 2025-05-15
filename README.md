# Proyecto PokeRemote

Este repositorio contiene un sistema cliente-servidor para jugar remotamente a juegos por turnos en PC desde dispositivos Android, utilizando una interfaz tipo GameBoy con controles táctiles y físicos. La comunicación se realiza mediante WebRTC para garantizar una experiencia de baja latencia.

## Entorno de desarrollo

Para el desarrollo de este proyecto, necesitarás configurar correctamente el entorno de Flutter y .NET. A continuación se describen los pasos necesarios para configurar el entorno de desarrollo.

### Requisitos para el desarrollo:

- **Flutter SDK**: Instala la versión 3.0 o superior desde [flutter.dev](https://flutter.dev/docs/get-started/install)
- **Android SDK**: Instala Android Studio o el SDK de forma independiente
- **VS Code**: Recomendado con las extensiones Flutter y Dart
- **Git**: Para control de versiones
- **.NET SDK**: Versión 8.0 o superior para el servidor

### Preparación del entorno Flutter:

1. Ejecuta `flutter doctor` para verificar que todas las dependencias están correctamente instaladas
2. Asegúrate de que tu dispositivo Android está habilitado para depuración USB
3. Configura las variables de entorno adecuadamente (ANDROID_HOME, JAVA_HOME)

### Tareas de VS Code:

Se añadirán próximamente tareas específicas para facilitar el desarrollo sin Docker, como:
- Compilación de APK
- Ejecución del servidor .NET
- Tareas de depuración

## Características principales

- **Streaming de pantalla en tiempo real**: Visualiza juegos de PC en dispositivos Android con baja latencia
- **Gamepad virtual personalizado**: Interfaz de control tipo GameBoy con botones D-Pad, A/B, START/SELECT
- **Soporte para controles físicos**: Compatible con teclado físico conectado al dispositivo Android
- **Comunicación WebRTC**: Transmisión eficiente de video y eventos de control
- **Diseño responsivo**: Adaptable a diferentes orientaciones y tamaños de pantalla
- **Inyección de teclas en Windows**: Emulación de teclado en el servidor para controlar juegos

## Estructura del proyecto

```
poke/
├── docs/                           # Documentación adicional
│   └── guia-desarrollo.md          # Guía de desarrollo general
├── server/                         # Servidor .NET Core
│   ├── PokeRemote.Server/          # Proyecto principal del servidor
│   │   ├── Program.cs              # Punto de entrada de la aplicación
│   │   ├── Hubs/                   # Comunicación SignalR para WebRTC
│   │   └── Models/                 # Modelos de datos del servidor
│   ├── PokeRemote.Core/            # Biblioteca compartida del servidor
│   │   ├── Capture/                # Captura de pantalla
│   │   ├── Input/                  # Inyección de teclado
│   │   └── WebRTC/                 # Implementación de WebRTC
│   └── PokeRemote.Tests/           # Pruebas del servidor
├── client/                         # Cliente Flutter para Android
│   ├── lib/                        # Código fuente de Flutter
│   │   ├── main.dart               # Punto de entrada de la aplicación
│   │   ├── models/                 # Modelos de datos
│   │   ├── providers/              # Gestión de estado (Provider)
│   │   ├── screens/                # Pantallas de la aplicación
│   │   ├── services/               # Servicios (WebRTC, señalización)
│   │   └── widgets/                # Componentes reutilizables
│   │       └── virtual_gamepad.dart # Implementación del gamepad virtual
│   ├── android/                    # Configuración específica para Android
│   └── test/                       # Pruebas del cliente
├── tools/                          # Scripts y herramientas de desarrollo
└── README.md                       # Este archivo
```

## Componentes técnicos

### Servidor (.NET)
- **WebRTC Server**: Gestiona conexiones WebRTC para transmitir video y recibir eventos
- **Screen Capture**: Captura la pantalla a alta velocidad de fotogramas
- **Keyboard Injector**: Simula pulsaciones de teclas en el sistema Windows
- **SignalR Hub**: Facilita la señalización inicial para WebRTC

### Cliente (Flutter)
- **Virtual Gamepad Controller**: Sistema de controles táctiles personalizado
- **WebRTC Client**: Maneja el streaming de video y envío de eventos
- **Physical Key Handling**: Soporte para teclas físicas
- **Responsive UI**: Interfaz adaptativa para diferentes orientaciones

## Requisitos

### Servidor
- .NET 8.0 o superior
- Windows 10/11 (para captura de pantalla e inyección de teclado nativo)
- Conexión a internet con puertos accesibles o configuración STUN/TURN

### Cliente
- Flutter SDK 3.0 o superior
- Dart 3.0 o superior
- Android Studio / VS Code con extensiones Flutter
- Dispositivo Android con API ≥21 (Android 5.0+)

## Cómo empezar

### Configurar el Servidor
1. Navegar al directorio del servidor: `cd server`
2. Restaurar paquetes NuGet: `dotnet restore`
3. Compilar el proyecto: `dotnet build`
4. Ejecutar el servidor: `dotnet run --project PokeRemote.Server`

### Configurar el Cliente
1. Navegar al directorio del cliente: `cd client`
2. Obtener dependencias: `flutter pub get`
3. Ejecutar en modo debug: `flutter run`
4. Compilar APK para distribución: `flutter build apk --debug` o `flutter build apk --release`

#### Solución de problemas de flutter_webrtc

Si encuentras problemas al compilar la aplicación cliente, especialmente relacionados con la biblioteca flutter_webrtc, consulta nuestra [guía de compatibilidad](docs/compatibilidad-flutter-webrtc.md) que incluye soluciones para los problemas más comunes.

### Conectar Cliente y Servidor
1. Iniciar el servidor en un PC con Windows
2. Conectar el dispositivo Android a la misma red WiFi
3. Ingresar la dirección IP del servidor en la pantalla de conexión del cliente
4. ¡Disfrutar de la experiencia de control remoto!

## Implementación del Gamepad Virtual

El cliente utiliza un sistema de gamepad virtual personalizado con las siguientes características:

- Controlador basado en Streams para emisión de eventos de botones
- Soporte para múltiples estados (presionado/liberado)
- Diseño visual inspirado en GameBoy con botones D-Pad, A/B, START/SELECT
- Integración con WebRTC para enviar comandos al servidor
- Soporte para control con teclado físico conectado al dispositivo

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## Contribuciones

Las contribuciones son bienvenidas. Consulta la [guía de desarrollo](docs/guia-desarrollo.md) para obtener información detallada sobre la arquitectura y las fases de implementación.
