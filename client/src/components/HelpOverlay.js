import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const HelpOverlay = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.helpContent}>
          <Text style={styles.helpTitle}>Ayuda de PokeRemote</Text>
          
          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Conexión al servidor</Text>
            <Text style={styles.helpText}>
              1. Inicia el servidor PokeRemote en tu PC Windows.
              2. Introduce la dirección IP y puerto en la pantalla principal (ejemplo: 192.168.1.100:5000).
              3. Pulsa "Conectar" para iniciar la sesión remota.
            </Text>
            
            <Text style={styles.sectionTitle}>Controles de juego</Text>
            <Text style={styles.helpText}>
              • D-Pad (cruceta): Movimiento en 4 direcciones
              • Botón A: Acción principal (Z en teclado)
              • Botón B: Acción secundaria (X en teclado)
              • START: Menú principal o pausa (Enter en teclado)
              • SELECT: Menú secundario (Espacio en teclado)
            </Text>
            
            <Text style={styles.sectionTitle}>Calidad de streaming</Text>
            <Text style={styles.helpText}>
              Si experimentas problemas de rendimiento:
              1. Ve a Configuración → Video
              2. Reduce la calidad a "Media" o "Baja"
              3. Asegúrate de tener una conexión WiFi estable
            </Text>
            
            <Text style={styles.sectionTitle}>Problemas de conexión</Text>
            <Text style={styles.helpText}>
              Si no puedes conectar al servidor:
              • Verifica que el servidor esté en ejecución
              • Comprueba que estés en la misma red WiFi
              • Asegúrate de que el puerto no esté bloqueado por el firewall
              • Reinicia el servidor y la aplicación cliente
            </Text>

            <Text style={styles.sectionTitle}>Atajos y consejos</Text>
            <Text style={styles.helpText}>
              • Presiona el botón de pantalla completa para ocultar la interfaz
              • En orientación horizontal obtendrás mejor visualización
              • Los servidores recientes se guardan automáticamente
              • Para juegos rápidos, ajusta la configuración de conexión para optimizar la latencia
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4477ee',
    marginTop: 15,
    marginBottom: 5,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#4477ee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HelpOverlay;
