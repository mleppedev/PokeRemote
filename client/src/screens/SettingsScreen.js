import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Configuración de conexión
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [keepAwake, setKeepAwake] = useState(true);
  
  // Configuración de video
  const [videoQuality, setVideoQuality] = useState('medium'); // low, medium, high
  const [adaptiveQuality, setAdaptiveQuality] = useState(true);
  
  // Configuración de controles
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showScreenControls, setShowScreenControls] = useState(true);
  const [controlOpacity, setControlOpacity] = useState(0.8);

  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        
        // Aplicar configuración guardada
        setAutoReconnect(parsedSettings.autoReconnect ?? true);
        setKeepAwake(parsedSettings.keepAwake ?? true);
        setVideoQuality(parsedSettings.videoQuality ?? 'medium');
        setAdaptiveQuality(parsedSettings.adaptiveQuality ?? true);
        setHapticFeedback(parsedSettings.hapticFeedback ?? true);
        setShowScreenControls(parsedSettings.showScreenControls ?? true);
        setControlOpacity(parsedSettings.controlOpacity ?? 0.8);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };
  
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      const settings = {
        autoReconnect,
        keepAwake,
        videoQuality,
        adaptiveQuality,
        hapticFeedback,
        showScreenControls,
        controlOpacity,
      };
      
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      Alert.alert('Éxito', 'Configuración guardada correctamente');
      
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetSettings = () => {
    Alert.alert(
      'Restablecer configuración',
      '¿Estás seguro de que deseas restablecer toda la configuración a los valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restablecer', style: 'destructive', onPress: confirmReset }
      ]
    );
  };
  
  const confirmReset = async () => {
    setIsLoadingSettings(true);
    
    try {
      await AsyncStorage.removeItem('userSettings');
      
      // Restablecer valores predeterminados
      setAutoReconnect(true);
      setKeepAwake(true);
      setVideoQuality('medium');
      setAdaptiveQuality(true);
      setHapticFeedback(true);
      setShowScreenControls(true);
      setControlOpacity(0.8);
      
      Alert.alert('Éxito', 'Configuración restablecida correctamente');
    } catch (error) {
      console.error('Error restableciendo configuraciones:', error);
      Alert.alert('Error', 'No se pudo restablecer la configuración');
    } finally {
      setIsLoadingSettings(false);
    }
  };
  
  if (isLoadingSettings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4477ee" />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/settings.png')} 
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>Configuración de PokeRemote</Text>
      </View>
      
      {/* Sección de Conexión */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conexión</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Reconexión automática</Text>
            <Text style={styles.settingDescription}>Intentar reconectar automáticamente si se pierde la conexión</Text>
          </View>
          <Switch
            value={autoReconnect}
            onValueChange={setAutoReconnect}
            trackColor={{ false: '#ddd', true: '#66bb6a' }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Mantener pantalla activa</Text>
            <Text style={styles.settingDescription}>Evitar que la pantalla se apague durante la transmisión</Text>
          </View>
          <Switch
            value={keepAwake}
            onValueChange={setKeepAwake}
            trackColor={{ false: '#ddd', true: '#66bb6a' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      {/* Sección de Video */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Calidad de video</Text>
            <Text style={styles.settingDescription}>Selecciona la calidad de transmisión de video</Text>
          </View>
          <View style={styles.pickerContainer}>
            {['low', 'medium', 'high'].map(quality => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityOption,
                  videoQuality === quality && styles.selectedQuality
                ]}
                onPress={() => setVideoQuality(quality)}
              >
                <Text 
                  style={[
                    styles.qualityText,
                    videoQuality === quality && styles.selectedQualityText
                  ]}
                >
                  {quality === 'low' ? 'Baja' : quality === 'medium' ? 'Media' : 'Alta'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Calidad adaptativa</Text>
            <Text style={styles.settingDescription}>Ajustar automáticamente la calidad según la conexión</Text>
          </View>
          <Switch
            value={adaptiveQuality}
            onValueChange={setAdaptiveQuality}
            trackColor={{ false: '#ddd', true: '#66bb6a' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      {/* Sección de Controles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controles</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Vibración al pulsar</Text>
            <Text style={styles.settingDescription}>Vibrar al pulsar los botones del gamepad</Text>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: '#ddd', true: '#66bb6a' }}
            thumbColor="#fff"
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Mostrar controles en pantalla</Text>
            <Text style={styles.settingDescription}>Mostrar controles superpuestos sobre el video</Text>
          </View>
          <Switch
            value={showScreenControls}
            onValueChange={setShowScreenControls}
            trackColor={{ false: '#ddd', true: '#66bb6a' }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar configuración</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetSettings}
        >
          <Text style={styles.buttonText}>Restablecer valores</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>PokeRemote v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
  },
  pickerContainer: {
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  qualityOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  selectedQuality: {
    backgroundColor: '#4477ee',
  },
  qualityText: {
    fontSize: 14,
    color: '#666',
  },
  selectedQualityText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4477ee',
  },
  resetButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#aaaaaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
