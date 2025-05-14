import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../services/webrtc_service.dart';
import '../widgets/virtual_gamepad.dart';

class GamepadInputHandler {
  final WebRTCService webRTCService;
  final VirtualGamepadController virtualController;

  // Para procesar eventos de teclado físico
  final FocusNode keyboardFocusNode = FocusNode();
  StreamSubscription<GamepadEvent>? _controllerSubscription;

  // Mapeo de teclas físicas a comandos del juego
  final Map<LogicalKeyboardKey, String> keyMapping = {
    LogicalKeyboardKey.arrowUp: 'UP',
    LogicalKeyboardKey.arrowDown: 'DOWN',
    LogicalKeyboardKey.arrowLeft: 'LEFT',
    LogicalKeyboardKey.arrowRight: 'RIGHT',
    LogicalKeyboardKey.keyZ: 'A', // Z para botón A
    LogicalKeyboardKey.keyX: 'B', // X para botón B
    LogicalKeyboardKey.enter: 'START',
    LogicalKeyboardKey.space: 'SELECT',

    // Keypad numérico alternativo
    LogicalKeyboardKey.numpad8: 'UP', // 8 - arriba
    LogicalKeyboardKey.numpad2: 'DOWN', // 2 - abajo
    LogicalKeyboardKey.numpad4: 'LEFT', // 4 - izquierda
    LogicalKeyboardKey.numpad6: 'RIGHT', // 6 - derecha
  };

  GamepadInputHandler({
    required this.webRTCService,
    required this.virtualController,
  }) {
    // Suscribirse a eventos del gamepad virtual
    _controllerSubscription = virtualController.eventStream.listen(
      _handleVirtualGamepadEvent,
    );
  }

  // Iniciar escucha de eventos de teclado
  void init() {
    keyboardFocusNode.requestFocus();
  }

  // Procesar eventos del gamepad virtual
  void _handleVirtualGamepadEvent(GamepadEvent event) {
    final buttonText = VirtualGamepadController.buttonToString(event.button);
    final eventType = event.state == ButtonState.pressed ? 'keydown' : 'keyup';

    webRTCService.sendControlEvent(eventType, buttonText);
  }

  // Procesar eventos de teclado físico
  bool handleKeyEvent(RawKeyEvent event) {
    // Obtener la tecla presionada
    final key = event.logicalKey;

    // Verificar si esta tecla está en nuestro mapeo
    if (keyMapping.containsKey(key)) {
      final command = keyMapping[key]!;

      if (event is RawKeyDownEvent) {
        webRTCService.sendControlEvent('keydown', command);
      } else if (event is RawKeyUpEvent) {
        webRTCService.sendControlEvent('keyup', command);
      }

      // Consumir el evento para evitar que se propague
      return true;
    }

    // No consumir otros eventos
    return false;
  }

  // Liberar recursos
  void dispose() {
    _controllerSubscription?.cancel();
    keyboardFocusNode.dispose();
  }
}
