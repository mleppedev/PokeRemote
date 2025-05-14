import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';

class SignalingService {
  // Singleton
  static final SignalingService _instance = SignalingService._internal();
  factory SignalingService() => _instance;
  SignalingService._internal();
  
  WebSocketChannel? _channel;
  String? _serverUrl;
  bool _isConnected = false;
  
  // Controladores para eventos
  final _offerResponseController = StreamController<Map<String, dynamic>>.broadcast();
  final _iceCandidateController = StreamController<Map<String, dynamic>>.broadcast();
  final _errorController = StreamController<String>.broadcast();
  
  Stream<Map<String, dynamic>> get offerResponseStream => _offerResponseController.stream;
  Stream<Map<String, dynamic>> get iceCandidateStream => _iceCandidateController.stream;
  Stream<String> get errorStream => _errorController.stream;
  
  bool get isConnected => _isConnected;
  
  // Conectar al servidor de señalización
  Future<void> connect(String serverUrl) async {
    try {
      _serverUrl = serverUrl;
      
      // Convertimos la URL HTTP a WebSocket
      final wsUrl = serverUrl.replaceFirst('http', 'ws') + '/signalr/webrtc';
      
      _channel = IOWebSocketChannel.connect(Uri.parse(wsUrl));
      _isConnected = true;
      
      _channel!.stream.listen(
        (message) => _handleMessage(message),
        onError: (error) {
          _isConnected = false;
          _errorController.add('Error de conexión: $error');
        },
        onDone: () {
          _isConnected = false;
          _errorController.add('Conexión cerrada');
        }
      );
    } catch (e) {
      _isConnected = false;
      _errorController.add('Error al conectar: $e');
      rethrow;
    }
  }
  
  // Procesar mensajes recibidos
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      
      if (data['type'] == 'ReceiveAnswer') {
        _offerResponseController.add(data['payload']);
      } else if (data['type'] == 'ReceiveCandidate') {
        _iceCandidateController.add(data['payload']);
      } else if (data['type'] == 'Error') {
        _errorController.add(data['payload']);
      }
    } catch (e) {
      _errorController.add('Error al procesar mensaje: $e');
    }
  }
  
  // Enviar oferta SDP al servidor
  Future<bool> sendOffer(String sdp) async {
    if (!_isConnected || _channel == null) return false;
    
    try {
      final message = {
        'type': 'SendOffer',
        'payload': {
          'type': 'offer',
          'sdp': sdp
        }
      };
      
      _channel!.sink.add(jsonEncode(message));
      return true;
    } catch (e) {
      _errorController.add('Error al enviar oferta: $e');
      return false;
    }
  }
  
  // Enviar candidato ICE al servidor
  Future<bool> sendIceCandidate(
      String candidate, String sdpMid, int sdpMLineIndex) async {
    if (!_isConnected || _channel == null) return false;
    
    try {
      final message = {
        'type': 'SendIceCandidate',
        'payload': {
          'candidate': candidate,
          'sdpMid': sdpMid,
          'sdpMLineIndex': sdpMLineIndex
        }
      };
      
      _channel!.sink.add(jsonEncode(message));
      return true;
    } catch (e) {
      _errorController.add('Error al enviar candidato ICE: $e');
      return false;
    }
  }
  
  // Verificar estado del servidor
  Future<bool> checkServerStatus() async {
    if (_serverUrl == null) return false;
    
    try {
      final response = await http.get(Uri.parse('$_serverUrl/api/status'));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['status'] == 'running';
      }
      
      return false;
    } catch (e) {
      _errorController.add('Error al verificar estado del servidor: $e');
      return false;
    }
  }
  
  // Cerrar conexión
  void disconnect() {
    _channel?.sink.close();
    _isConnected = false;
  }
  
  // Liberar recursos
  void dispose() {
    disconnect();
    _offerResponseController.close();
    _iceCandidateController.close();
    _errorController.close();
  }
}
