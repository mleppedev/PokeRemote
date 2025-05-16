import {
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription
} from 'react-native-webrtc';

class WebRTCHelper {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.localStream = null;
    this.remoteStream = null;
    
    // Callbacks
    this.onRemoteStreamCallback = null;
    this.onDataChannelMessageCallback = null;
    this.onConnectionStateChangeCallback = null;
    this.onIceCandidateCallback = null;
  }
  
  // Inicializar la conexión WebRTC
  initialize() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
    
    this.peerConnection = new RTCPeerConnection(configuration);
    
    // Configurar eventos
    this.setupPeerConnectionEvents();
    
    return true;
  }
  
  // Configurar eventos para la conexión peer
  setupPeerConnectionEvents() {
    if (!this.peerConnection) return;
    
    // Evento para obtener candidatos ICE
    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(candidate);
      }
    };
    
    // Evento para obtener el stream remoto
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };
    
    // Eventos de estado de conexión
    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
      }
    };
    
    // Evento para recibir canal de datos
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };
  }
  
  // Configurar eventos para el canal de datos
  setupDataChannelEvents() {
    if (!this.dataChannel) return;
    
    this.dataChannel.onopen = () => {
      console.log('Canal de datos abierto');
    };
    
    this.dataChannel.onclose = () => {
      console.log('Canal de datos cerrado');
    };
    
    this.dataChannel.onmessage = (event) => {
      if (this.onDataChannelMessageCallback) {
        this.onDataChannelMessageCallback(event.data);
      }
    };
  }
  
  // Crear un canal de datos
  createDataChannel(label = 'gamepad') {
    if (!this.peerConnection) return null;
    
    this.dataChannel = this.peerConnection.createDataChannel(label);
    this.setupDataChannelEvents();
    
    return this.dataChannel;
  }
  
  // Crear y enviar una oferta SDP
  async createOffer() {
    if (!this.peerConnection) return null;
    
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      return offer;
    } catch (error) {
      console.error('Error creando oferta:', error);
      throw error;
    }
  }
  
  // Establecer la descripción remota (respuesta del servidor)
  async setRemoteDescription(sdp) {
    if (!this.peerConnection) return false;
    
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp })
      );
      return true;
    } catch (error) {
      console.error('Error estableciendo descripción remota:', error);
      return false;
    }
  }
  
  // Agregar candidato ICE recibido
  async addIceCandidate(candidate) {
    if (!this.peerConnection) return false;
    
    try {
      const iceCandidate = new RTCIceCandidate({
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      });
      
      await this.peerConnection.addIceCandidate(iceCandidate);
      return true;
    } catch (error) {
      console.error('Error agregando candidato ICE:', error);
      return false;
    }
  }
  
  // Enviar mensaje a través del canal de datos
  sendMessage(message) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }
    
    try {
      this.dataChannel.send(message);
      return true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return false;
    }
  }
  
  // Registrar callback para stream remoto
  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
    // Si ya tenemos un stream remoto, llamar al callback inmediatamente
    if (this.remoteStream && callback) {
      callback(this.remoteStream);
    }
  }
  
  // Registrar callback para mensajes del canal de datos
  onDataChannelMessage(callback) {
    this.onDataChannelMessageCallback = callback;
  }
  
  // Registrar callback para cambios en el estado de conexión
  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallback = callback;
  }
  
  // Registrar callback para candidatos ICE
  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }
  
  // Cerrar la conexión
  close() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
  }
}

export default new WebRTCHelper();
