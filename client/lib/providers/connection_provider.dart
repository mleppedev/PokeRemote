import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

import '../services/gamepad_input_handler.dart';
import '../services/webrtc_service.dart';
import '../widgets/virtual_gamepad.dart';

class ConnectionProvider extends ChangeNotifier {
  final WebRTCService _webRTCService = WebRTCService();
  final VirtualGamepadController _gamepadController =
      VirtualGamepadController();
  late final GamepadInputHandler _gamepadInputHandler;

  bool _isConnecting = false;
  bool _isConnected = false;
  String _errorMessage = '';

  bool get isConnecting => _isConnecting;
  bool get isConnected => _isConnected;
  String get errorMessage => _errorMessage;
  VirtualGamepadController get gamepadController => _gamepadController;
  GamepadInputHandler get gamepadInputHandler => _gamepadInputHandler;
  WebRTCService get webRTCService => _webRTCService;

  ConnectionProvider() {
    _gamepadInputHandler = GamepadInputHandler(
      webRTCService: _webRTCService,
      virtualController: _gamepadController,
    );
    _initializeService();
  }

  Future<void> _initializeService() async {
    await _webRTCService.initialize();
    // Escuchar cambios en el estado de la conexión
    _webRTCService.connectionStateStream.listen((state) {
      if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnected) {
        _isConnected = true;
        _isConnecting = false;
        _errorMessage = '';
      } else if (state ==
              RTCPeerConnectionState.RTCPeerConnectionStateDisconnected ||
          state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
        _isConnected = false;
        _isConnecting = false;
        _errorMessage = 'Conexión perdida';
      }
      notifyListeners();
    });
  }

  Future<void> connectToServer(String serverUrl) async {
    _isConnecting = true;
    _errorMessage = '';
    notifyListeners();

    try {
      await _webRTCService.connectToServer(serverUrl);
      // El estado se actualizará a través del listener
    } catch (e) {
      _isConnecting = false;
      _isConnected = false;
      _errorMessage = 'Error al conectar: ${e.toString()}';
      notifyListeners();
    }
  }

  void disconnect() async {
    await _webRTCService.disconnect();
    _isConnected = false;
    _isConnecting = false;
    notifyListeners();
  }

  void sendControlEvent(String type, String key) {
    if (_isConnected) {
      _webRTCService.sendControlEvent(type, key);
    }
  }

  @override
  void dispose() {
    _webRTCService.dispose();
    _gamepadController.dispose();
    _gamepadInputHandler.dispose();
    super.dispose();
  }
}
