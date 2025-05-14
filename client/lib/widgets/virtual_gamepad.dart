import 'dart:async';

import 'package:flutter/material.dart';

/// Tipos de botones que pueden enviarse como eventos
enum GamepadButtons { up, down, left, right, a, b, start, select }

/// Estados de los botones
enum ButtonState { pressed, released }

/// Clase para representar un evento de botón del gamepad
class GamepadEvent {
  final GamepadButtons button;
  final ButtonState state;

  GamepadEvent(this.button, this.state);
}

/// Controlador para manejar los eventos del gamepad virtual
class VirtualGamepadController {
  // Stream controller para emitir eventos del gamepad
  final StreamController<GamepadEvent> _eventController =
      StreamController<GamepadEvent>.broadcast();

  // Exponer el stream para que los oyentes puedan suscribirse
  Stream<GamepadEvent> get eventStream => _eventController.stream;

  // Método para enviar un evento de botón presionado
  void sendButtonPressed(GamepadButtons button) {
    _eventController.add(GamepadEvent(button, ButtonState.pressed));
  }

  // Método para enviar un evento de botón liberado
  void sendButtonReleased(GamepadButtons button) {
    _eventController.add(GamepadEvent(button, ButtonState.released));
  }

  // Liberar recursos
  void dispose() {
    _eventController.close();
  }

  // Convertir de GamepadButtons a cadena para enviar al servidor
  static String buttonToString(GamepadButtons button) {
    switch (button) {
      case GamepadButtons.up:
        return 'UP';
      case GamepadButtons.down:
        return 'DOWN';
      case GamepadButtons.left:
        return 'LEFT';
      case GamepadButtons.right:
        return 'RIGHT';
      case GamepadButtons.a:
        return 'A';
      case GamepadButtons.b:
        return 'B';
      case GamepadButtons.start:
        return 'START';
      case GamepadButtons.select:
        return 'SELECT';
    }
  }
}

/// Widget para el D-Pad (cruceta direccional)
class DPad extends StatelessWidget {
  final VirtualGamepadController controller;
  final double buttonSize;
  final double spacing;

  const DPad({
    super.key,
    required this.controller,
    this.buttonSize = 60,
    this.spacing = 5,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: buttonSize * 3 + spacing * 2,
      height: buttonSize * 3 + spacing * 2,
      child: Stack(
        children: [
          // Botón Arriba
          Positioned(
            left: buttonSize + spacing,
            top: 0,
            child: _buildDirectionButton(Icons.arrow_upward, GamepadButtons.up),
          ),

          // Botón Izquierda
          Positioned(
            left: 0,
            top: buttonSize + spacing,
            child: _buildDirectionButton(Icons.arrow_back, GamepadButtons.left),
          ),

          // Centro (decorativo)
          Positioned(
            left: buttonSize + spacing,
            top: buttonSize + spacing,
            child: Container(
              width: buttonSize,
              height: buttonSize,
              decoration: BoxDecoration(
                color: const Color(0xFF303030),
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),

          // Botón Derecha
          Positioned(
            left: 2 * (buttonSize + spacing),
            top: buttonSize + spacing,
            child: _buildDirectionButton(
              Icons.arrow_forward,
              GamepadButtons.right,
            ),
          ),

          // Botón Abajo
          Positioned(
            left: buttonSize + spacing,
            top: 2 * (buttonSize + spacing),
            child: _buildDirectionButton(
              Icons.arrow_downward,
              GamepadButtons.down,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDirectionButton(IconData icon, GamepadButtons button) {
    return GestureDetector(
      onTapDown: (_) => controller.sendButtonPressed(button),
      onTapUp: (_) => controller.sendButtonReleased(button),
      onTapCancel: () => controller.sendButtonReleased(button),
      child: Container(
        width: buttonSize,
        height: buttonSize,
        decoration: BoxDecoration(
          color: const Color(0xFF303030),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              offset: const Offset(0, 4),
              blurRadius: 5,
            ),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: buttonSize * 0.6),
      ),
    );
  }
}

/// Widget para los botones de acción (A/B)
class ActionButtons extends StatelessWidget {
  final VirtualGamepadController controller;
  final double buttonSize;
  final double spacing;

  const ActionButtons({
    super.key,
    required this.controller,
    this.buttonSize = 70,
    this.spacing = 20,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: buttonSize * 2 + spacing,
      height: buttonSize * 2,
      child: Stack(
        children: [
          // Botón B
          Positioned(
            left: 0,
            top: buttonSize / 2,
            child: _buildActionButton('B', Colors.blue, GamepadButtons.b),
          ),

          // Botón A
          Positioned(
            left: buttonSize + spacing,
            top: 0,
            child: _buildActionButton('A', Colors.red, GamepadButtons.a),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(String label, Color color, GamepadButtons button) {
    return GestureDetector(
      onTapDown: (_) => controller.sendButtonPressed(button),
      onTapUp: (_) => controller.sendButtonReleased(button),
      onTapCancel: () => controller.sendButtonReleased(button),
      child: Container(
        width: buttonSize,
        height: buttonSize,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              offset: const Offset(0, 4),
              blurRadius: 5,
            ),
          ],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: buttonSize * 0.4,
            ),
          ),
        ),
      ),
    );
  }
}

/// Widget para los botones de sistema (Start/Select)
class SystemButtons extends StatelessWidget {
  final VirtualGamepadController controller;

  const SystemButtons({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildSystemButton('SELECT', GamepadButtons.select),
        const SizedBox(width: 40),
        _buildSystemButton('START', GamepadButtons.start),
      ],
    );
  }

  Widget _buildSystemButton(String label, GamepadButtons button) {
    return GestureDetector(
      onTapDown: (_) => controller.sendButtonPressed(button),
      onTapUp: (_) => controller.sendButtonReleased(button),
      onTapCancel: () => controller.sendButtonReleased(button),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF303030),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              offset: const Offset(0, 3),
              blurRadius: 4,
            ),
          ],
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

/// Widget completo de gamepad virtual con todos los controles
class VirtualGamepad extends StatelessWidget {
  final VirtualGamepadController controller;
  final double dPadSize;
  final double actionButtonSize;

  const VirtualGamepad({
    super.key,
    required this.controller,
    this.dPadSize = 60,
    this.actionButtonSize = 70,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // D-Pad
          Center(child: DPad(controller: controller, buttonSize: dPadSize)),

          const SizedBox(height: 20),

          // Botones A/B
          Center(
            child: ActionButtons(
              controller: controller,
              buttonSize: actionButtonSize,
            ),
          ),

          const SizedBox(height: 20),

          // Botones Start/Select
          SystemButtons(controller: controller),
        ],
      ),
    );
  }
}
