import 'dart:async';
import 'dart:convert';

import 'package:flutter_webrtc/flutter_webrtc.dart';

class WebRTCService {
  // Singleton
  static final WebRTCService _instance = WebRTCService._internal();
  factory WebRTCService() => _instance;
  WebRTCService._internal();

  RTCPeerConnection? _peerConnection;
  RTCVideoRenderer? _remoteVideoRenderer;
  RTCDataChannel? _dataChannel;

  // Controladores de eventos para usar con Streams
  final _connectionStateController =
      StreamController<RTCPeerConnectionState>.broadcast();
  Stream<RTCPeerConnectionState> get connectionStateStream =>
      _connectionStateController.stream;

  bool get isConnected =>
      _peerConnection?.connectionState ==
      RTCPeerConnectionState.RTCPeerConnectionStateConnected;
  RTCVideoRenderer? get remoteVideoRenderer => _remoteVideoRenderer;

  Future<void> initialize() async {
    _remoteVideoRenderer = RTCVideoRenderer();
    await _remoteVideoRenderer!.initialize();
  }

  Future<void> connectToServer(String serverUrl) async {
    try {
      // Configuración de WebRTC
      final Map<String, dynamic> configuration = {
        'iceServers': [
          {'urls': 'stun:stun.l.google.com:19302'},
        ],
        'sdpSemantics': 'unified-plan',
      };

      final Map<String, dynamic> offerConstraints = {
        'mandatory': {
          'OfferToReceiveAudio': false,
          'OfferToReceiveVideo': true,
        },
        'optional': [],
      };

      // Crear conexión
      _peerConnection = await createPeerConnection(configuration);

      // Configurar evento de cambio de estado
      _peerConnection!.onConnectionState = (RTCPeerConnectionState state) {
        _connectionStateController.add(state);
      };

      // Configurar canal de datos para enviar controles
      _dataChannel = await _peerConnection!.createDataChannel(
        'controls',
        RTCDataChannelInit()..ordered = true,
      );

      _dataChannel!.onMessage = (RTCDataChannelMessage message) {
        print('Mensaje recibido del servidor: ${message.text}');
        // TODO: Procesar respuestas del servidor si es necesario
      };

      // Configurar stream de video remoto
      _peerConnection!.onTrack = (RTCTrackEvent event) {
        if (event.track.kind == 'video') {
          _remoteVideoRenderer!.srcObject = event.streams[0];
        }
      };

      // TODO: Implementar la señalización HTTP o WebSocket para intercambiar SDP
      // Aquí iría el código para conectarse al servidor de señalización
      // y realizar el intercambio de SDP y candidatos ICE
    } catch (e) {
      print('Error al conectar: $e');
      throw Exception('No se pudo conectar al servidor: $e');
    }
  }

  // Enviar eventos de control al servidor
  void sendControlEvent(String type, String key) {
    if (_dataChannel?.state == RTCDataChannelState.RTCDataChannelOpen) {
      final Map<String, dynamic> event = {
        'type': type, // 'keydown' o 'keyup'
        'key': key, // 'UP', 'A', etc.
      };
      // Convertir a formato JSON correctamente
      _dataChannel!.send(RTCDataChannelMessage(jsonEncode(event)));
    }
  }

  // Cerrar conexión
  Future<void> disconnect() async {
    await _dataChannel?.close();
    await _peerConnection?.close();
    await _remoteVideoRenderer?.dispose();

    _dataChannel = null;
    _peerConnection = null;
    _remoteVideoRenderer = null;
  }

  // Liberar recursos
  void dispose() {
    disconnect();
    _connectionStateController.close();
  }
}
