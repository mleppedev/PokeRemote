import { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription,
    RTCView
} from 'react-native-webrtc';
import SignalingService from '../api/SignalingService';

const StreamView = ({ serverUrl, onError }) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Referencias a objetos WebRTC
  const peerConnection = useRef(null);
  const connectionTimeout = useRef(null);
  
  useEffect(() => {
    // Inicializar la conexión WebRTC
    setupWebRTC();
    
    return () => {
      // Limpieza al desmontar
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        setRemoteStream(null);
      }
      
      SignalingService.disconnect();
      
      if (connectionTimeout.current) {
        clearTimeout(connectionTimeout.current);
      }
    };
  }, [serverUrl]);
  
  const setupWebRTC = async () => {
    try {
      // Configuración de ICE servers (STUN/TURN)
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };
      
      // Crear conexión peer
      peerConnection.current = new RTCPeerConnection(configuration);
      
      // Configurar evento para detectar candidatos ICE
      peerConnection.current.onicecandidate = ({ candidate }) => {
        if (candidate) {
          SignalingService.sendIceCandidate({
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          });
        }
      };
      
      // Configurar evento para detectar el stream remoto
      peerConnection.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          setIsLoading(false);
          
          // Detectar dimensiones del stream para ajustar aspect ratio
          if (event.track.kind === 'video') {
            setTimeout(() => {
              const videoTrack = event.streams[0].getVideoTracks()[0];
              if (videoTrack && videoTrack.getSettings) {
                const { width, height } = videoTrack.getSettings();
                if (width && height) {
                  setAspectRatio(width / height);
                }
              }
            }, 1000);
          }
        }
      };
      
      // Conectar al servidor de señalización
      const connected = await SignalingService.connect(serverUrl);
      
      if (!connected) {
        throw new Error('No se pudo conectar al servidor de señalización');
      }
      
      // Configurar callbacks para mensajes de señalización
      SignalingService.onAnswer((sdp) => {
        peerConnection.current.setRemoteDescription(
          new RTCSessionDescription({ type: 'answer', sdp })
        );
      });
      
      SignalingService.onIceCandidate((candidate) => {
        const iceCandidate = new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        });
        peerConnection.current.addIceCandidate(iceCandidate);
      });
      
      // Crear y enviar oferta SDP
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await peerConnection.current.setLocalDescription(offer);
      await SignalingService.sendOffer(offer.sdp);
      
      setIsConnected(true);
      
      // Establecer timeout para conexión
      connectionTimeout.current = setTimeout(() => {
        if (isLoading) {
          setError('Tiempo de espera agotado. No se recibió transmisión.');
          onError?.('Tiempo de conexión agotado');
          setIsLoading(false);
        }
      }, 15000);
      
    } catch (err) {
      console.error('Error en la configuración WebRTC:', err);
      setError(`Error: ${err.message}`);
      onError?.(err.message);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setupWebRTC();
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Conectando al servidor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.streamContainer, { aspectRatio: aspectRatio }]}>
          {remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.streamView}
              objectFit="contain"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4477ee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  streamContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  streamView: {
    flex: 1,
  },
});

export default StreamView;
