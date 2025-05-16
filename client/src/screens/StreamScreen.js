import { useEffect, useState } from 'react';
import {
    Alert,
    BackHandler,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GrpcService from '../api/GrpcService';
import SignalingService from '../api/SignalingService';
import ConnectionStatus from '../components/ConnectionStatus';
import GamepadControls from '../components/GamepadControls';
import StreamView from '../components/StreamView';

const StreamScreen = ({ route, navigation }) => {
  const { serverUrl } = route.params;
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [pingInterval, setPingInterval] = useState(null);
  
  useEffect(() => {
    // Gestionar el botón de retroceso para confirmar la salida
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    // Inicializar servicios
    const initServices = async () => {
      try {
        // Inicializar servicio gRPC
        GrpcService.initialize(serverUrl);
        
        // Iniciar medición de latencia
        startLatencyMeasurement();
        
        // Inicialmente establecer como conectado
        setIsConnected(true);
      } catch (error) {
        console.error('Error inicializando servicios:', error);
        setIsConnected(false);
      }
    };
    
    initServices();
    
    // Ocultar la barra de estado en modo pantalla completa
    StatusBar.setHidden(true);
    
    return () => {
      backHandler.remove();
      
      // Restaurar la barra de estado
      StatusBar.setHidden(false);
      
      // Limpiar servicios
      GrpcService.disconnect();
      SignalingService.disconnect();
      
      // Limpiar intervalo de ping
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, []);
  
  const handleBackPress = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas desconectarte?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => {} },
        { text: 'Desconectar', style: 'destructive', onPress: handleDisconnect }
      ]
    );
    return true;
  };
  
  const handleDisconnect = () => {
    // Limpiar servicios antes de navegar hacia atrás
    GrpcService.disconnect();
    SignalingService.disconnect();
    navigation.goBack();
  };
  
  const startLatencyMeasurement = () => {
    // Simular medición de latencia enviando pings
    const interval = setInterval(async () => {
      try {
        const startTime = Date.now();
        await GrpcService.sendGamepadCommand('PING', 'PING');
        const endTime = Date.now();
        setLatency(endTime - startTime);
      } catch (err) {
        setLatency(null);
        setIsConnected(false);
      }
    }, 3000);
    
    setPingInterval(interval);
  };
  
  const handleConnectionError = (message) => {
    setIsConnected(false);
    Alert.alert(
      'Error de conexión',
      `No se pudo establecer conexión con el servidor: ${message}`,
      [
        { text: 'Reintentar', onPress: () => navigation.replace('Stream', { serverUrl }) },
        { text: 'Volver', onPress: () => navigation.goBack() }
      ]
    );
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <View style={styles.container}>
      <StreamView 
        serverUrl={serverUrl} 
        onError={handleConnectionError}
      />
      
      <View style={styles.controlsContainer}>
        <GamepadControls isConnected={isConnected} />
      </View>
      
      <View style={styles.statusContainer}>
        <ConnectionStatus 
          isConnected={isConnected} 
          latency={latency} 
          serverUrl={serverUrl}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={toggleFullscreen}
          >
            <Text style={styles.actionButtonText}>
              {isFullscreen ? 'Mostrar UI' : 'Pantalla completa'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleDisconnect}
          >
            <Text style={styles.actionButtonText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  controlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  statusContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default StreamScreen;
