import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import SignalingService from '../api/SignalingService';

const HomeScreen = ({ navigation }) => {
  const [serverAddress, setServerAddress] = useState('');
  const [savedServers, setSavedServers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  
  // Cargar servidores guardados al iniciar
  useEffect(() => {
    loadSavedServers();
  }, []);
  
  const loadSavedServers = async () => {
    try {
      const serversJson = await AsyncStorage.getItem('savedServers');
      if (serversJson) {
        const servers = JSON.parse(serversJson);
        setSavedServers(servers);
      }
      
      // Cargar último servidor usado
      const lastServer = await AsyncStorage.getItem('lastServer');
      if (lastServer) {
        setServerAddress(lastServer);
      }
    } catch (error) {
      console.error('Error cargando servidores guardados:', error);
    } finally {
      setIsLoadingServers(false);
    }
  };
  
  const saveServer = async (server) => {
    try {
      // Verificar si ya existe
      const exists = savedServers.some(s => s.address === server.address);
      
      let updatedServers = [...savedServers];
      if (!exists) {
        updatedServers = [server, ...savedServers].slice(0, 5); // Mantener solo 5 servidores
        setSavedServers(updatedServers);
        await AsyncStorage.setItem('savedServers', JSON.stringify(updatedServers));
      }
      
      // Guardar como último servidor usado
      await AsyncStorage.setItem('lastServer', server.address);
    } catch (error) {
      console.error('Error guardando servidor:', error);
    }
  };
  
  const handleConnect = async () => {
    if (!serverAddress || serverAddress.trim() === '') {
      Alert.alert('Error', 'Por favor introduce la dirección del servidor');
      return;
    }
    
    // Validar formato de URL
    const serverUrl = serverAddress.startsWith('http://') || serverAddress.startsWith('https://') 
      ? serverAddress
      : `http://${serverAddress}`;
    
    setIsLoading(true);
    
    try {
      // Intentar conectar al servidor
      const connected = await SignalingService.connect(serverUrl);
      
      if (connected) {
        // Guardar el servidor
        await saveServer({ 
          address: serverUrl, 
          lastUsed: new Date().toISOString() 
        });
        
        // Desconectar el servicio de señalización
        SignalingService.disconnect();
        
        // Navegar a la pantalla de streaming
        navigation.navigate('Stream', { serverUrl });
      } else {
        Alert.alert('Error de conexión', 'No se pudo conectar al servidor. Verifica la dirección e intenta de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', `No se pudo conectar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectServer = (server) => {
    setServerAddress(server.address);
  };
  
  const handleSettings = () => {
    navigation.navigate('Settings');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>PokeRemote</Text>
        <Text style={styles.subtitle}>Control remoto para juegos</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dirección del servidor</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 192.168.1.100:5000"
          value={serverAddress}
          onChangeText={setServerAddress}
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          style={[
            styles.connectButton, 
            isLoading ? styles.connectButtonDisabled : {}
          ]}
          onPress={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>Conectar</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.savedServersContainer}>
        <Text style={styles.savedServersTitle}>Servidores recientes</Text>
        
        {isLoadingServers ? (
          <ActivityIndicator style={styles.loadingIndicator} />
        ) : savedServers.length === 0 ? (
          <Text style={styles.noServersText}>No hay servidores guardados</Text>
        ) : (
          <ScrollView style={styles.serversList}>
            {savedServers.map((server, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serverItem}
                onPress={() => handleSelectServer(server)}
              >
                <Text style={styles.serverAddress}>{server.address}</Text>
                <Text style={styles.serverLastUsed}>
                  {new Date(server.lastUsed).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={handleSettings}
      >
        <Text style={styles.settingsButtonText}>Configuración</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectButton: {
    backgroundColor: '#4477ee',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  connectButtonDisabled: {
    backgroundColor: '#aaa',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedServersContainer: {
    flex: 1,
  },
  savedServersTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  noServersText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  serversList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
  },
  serverItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  serverAddress: {
    fontSize: 16,
    color: '#333',
  },
  serverLastUsed: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  settingsButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  settingsButtonText: {
    color: '#4477ee',
    fontSize: 16,
  },
});

export default HomeScreen;
