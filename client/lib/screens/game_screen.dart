import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:provider/provider.dart';

import '../providers/connection_provider.dart';
import '../providers/orientation_provider.dart';
import '../widgets/virtual_gamepad.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  @override
  Widget build(BuildContext context) {
    final connectionProvider = Provider.of<ConnectionProvider>(context);
    final orientationProvider = Provider.of<OrientationProvider>(context);
    final orientation = MediaQuery.of(context).orientation;

    // Actualizar orientación en el provider
    WidgetsBinding.instance.addPostFrameCallback((_) {
      orientationProvider.updateOrientation(orientation);
    });

    return Scaffold(
      backgroundColor: const Color(0xFF8BC34A), // Color verde GameBoy
      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D32), // Verde oscuro
        title: const Text('PokeRemote', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: () {
              // TODO: Mostrar configuración
            },
          ),
        ],
      ),
      body:
          connectionProvider.isConnected
              ? _buildConnectedLayout(context, orientation)
              : _buildLoadingView(),
    );
  }

  Widget _buildConnectedLayout(BuildContext context, Orientation orientation) {
    final connectionProvider = Provider.of<ConnectionProvider>(context);

    return orientation == Orientation.portrait
        ? _buildPortraitLayout(connectionProvider)
        : _buildLandscapeLayout(connectionProvider);
  }

  Widget _buildPortraitLayout(ConnectionProvider provider) {
    // Inicializar el manejador de entrada para detectar teclas físicas también
    WidgetsBinding.instance.addPostFrameCallback((_) {
      provider.gamepadInputHandler.init();
    });

    return RawKeyboardListener(
      focusNode: provider.gamepadInputHandler.keyboardFocusNode,
      onKey: (RawKeyEvent event) {
        provider.gamepadInputHandler.handleKeyEvent(event);
      },
      child: Column(
        children: [
          Expanded(flex: 3, child: _buildGameScreen(provider)),
          Expanded(flex: 4, child: _buildTouchControls(provider)),
        ],
      ),
    );
  }

  Widget _buildLandscapeLayout(ConnectionProvider provider) {
    return RawKeyboardListener(
      focusNode: provider.gamepadInputHandler.keyboardFocusNode,
      onKey: (RawKeyEvent event) {
        provider.gamepadInputHandler.handleKeyEvent(event);
      },
      child: Center(
        child: AspectRatio(
          aspectRatio: 16 / 9,
          child: _buildGameScreen(provider),
        ),
      ),
    );
  }

  Widget _buildGameScreen(ConnectionProvider provider) {
    // Usamos la API pública del provider
    final remoteVideoRenderer = provider.webRTCService.remoteVideoRenderer;

    return Container(
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF9BBC0F), // Color verde pantalla GameBoy
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.black, width: 2),
      ),
      child:
          remoteVideoRenderer != null
              ? RTCVideoView(
                remoteVideoRenderer,
                objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitContain,
              )
              : const Center(
                child: Text(
                  'SIN SEÑAL',
                  style: TextStyle(
                    color: Color(0xFF0F380F),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
    );
  }

  Widget _buildTouchControls(ConnectionProvider provider) {
    return VirtualGamepad(
      controller: provider.gamepadController,
      dPadSize: 60.0,
      actionButtonSize: 70.0,
    );
  }

  // Los métodos para manejar los botones se han eliminado y reemplazado
  // por la implementación en la clase VirtualGamepad

  Widget _buildLoadingView() {
    final connectionProvider = Provider.of<ConnectionProvider>(context);

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (connectionProvider.isConnecting)
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            )
          else
            const Icon(Icons.error_outline, color: Colors.white, size: 64),
          const SizedBox(height: 20),
          Text(
            connectionProvider.isConnecting
                ? 'Conectando...'
                : 'Error: ${connectionProvider.errorMessage}',
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Volver'),
          ),
        ],
      ),
    );
  }
}
