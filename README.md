# Proyecto PokeRemote

Este repositorio contiene un sistema cliente-servidor para jugar remotamente a juegos por turnos en PC desde dispositivos Android, utilizando una interfaz tipo GameBoy con controles táctiles y físicos. La comunicación se realiza mediante una arquitectura híbrida que combina WebRTC para streaming de video de baja latencia y gRPC para los comandos del gamepad, garantizando una experiencia fluida y responsiva.

## Entorno de desarrollo

Para el desarrollo de este proyecto, necesitarás configurar correctamente el entorno de desarrollo para React Native y .NET. A continuación se describen los pasos necesarios.

### Requisitos para el desarrollo:

- **Node.js**: Versión 18.0 o superior
- **React Native CLI**: Para desarrollo del cliente móvil
- **Android SDK**: Instala Android Studio o el SDK de forma independiente
- **VS Code**: Recomendado con extensiones para React Native y .NET
- **Git**: Para control de versiones
- **.NET SDK**: Versión 8.0 o superior para el servidor

### Preparación del entorno React Native:

1. Instala Node.js y NPM desde [nodejs.org](https://nodejs.org/)
2. Instala React Native CLI: `npm install -g react-native-cli`
3. Configura el entorno Android siguiendo la [guía oficial](https://reactnative.dev/docs/environment-setup)
4. Asegúrate de que tu dispositivo Android está habilitado para depuración USB
5. Configura las variables de entorno adecuadamente (ANDROID_HOME, JAVA_HOME)

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
- **Integración con gRPC**: Comunicación de comandos del gamepad con alta fiabilidad
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
│   │   ├── Services/               # Servicios gRPC para comandos
│   │   └── Models/                 # Modelos de datos del servidor
│   ├── PokeRemote.Core/            # Biblioteca compartida del servidor
│   │   ├── Capture/                # Captura de pantalla
│   │   ├── Input/                  # Inyección de teclado
│   │   └── WebRTC/                 # Implementación de WebRTC
│   └── PokeRemote.Tests/           # Pruebas del servidor
├── client/                         # Cliente React Native para Android
│   ├── src/                        # Código fuente de React Native
│   │   ├── App.js                  # Punto de entrada de la aplicación
│   │   ├── components/             # Componentes reutilizables
│   │   ├── screens/                # Pantallas de la aplicación
│   │   ├── services/               # Servicios (WebRTC, señalización)
│   │   └── utils/                  # Utilidades generales
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
- **Servicios gRPC**: Maneja la comunicación de comandos del gamepad con alta fiabilidad

### Cliente (React Native)
- **Virtual Gamepad Controller**: Sistema de controles táctiles personalizado
- **WebRTC Client**: Maneja el streaming de video y envío de eventos
- **Physical Key Handling**: Soporte para teclas físicas
- **Responsive UI**: Interfaz adaptativa para diferentes orientaciones
- **Cliente gRPC**: Comunicación eficiente para transmisión de comandos

## Requisitos

### Servidor
- .NET 8.0 o superior
- Windows 10/11 (para captura de pantalla e inyección de teclado nativo)
- Conexión a internet con puertos accesibles o configuración STUN/TURN

### Cliente
- Node.js 18.0 o superior
- React Native CLI
- Android Studio / VS Code con extensiones React Native
- Dispositivo Android con API ≥21 (Android 5.0+)

## Cómo empezar

### Configurar el Servidor
1. Navegar al directorio del servidor: `cd server`
2. Restaurar paquetes NuGet: `dotnet restore`
3. Compilar el proyecto: `dotnet build`
4. Ejecutar el servidor: `dotnet run --project PokeRemote.Server`

### Configurar el Cliente
1. Navegar al directorio del cliente: `cd client`
2. Instalar dependencias: `npm install`
3. Ejecutar en modo debug: `react-native run-android`
4. Compilar APK para distribución: `react-native build`

#### Solución de problemas de react-native-webrtc

Si encuentras problemas al compilar la aplicación cliente, especialmente relacionados con la biblioteca react-native-webrtc, consulta nuestra [guía de compatibilidad](docs/compatibilidad-react-native-webrtc.md) que incluye soluciones para los problemas más comunes.

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
- Comunicación gRPC para transmitir comandos con alta fiabilidad
- Soporte para control con teclado físico conectado al dispositivo

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## Contribuciones

Las contribuciones son bienvenidas. Consulta la [guía de desarrollo](docs/guia-desarrollo.md) para obtener información detallada sobre la arquitectura y las fases de implementación.
