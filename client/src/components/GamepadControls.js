import { useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import GrpcService from '../api/GrpcService';

const GamepadControls = ({ isConnected }) => {
  const [activeButtons, setActiveButtons] = useState({});
  const buttonOpacity = useRef(new Animated.Value(1)).current;

  // Simular el efecto de presionar botón
  const pulseAnimation = () => {
    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Manejar eventos de botón
  const handleButtonPress = (buttonId) => {
    if (!isConnected) {
      Alert.alert('No conectado', 'Por favor, conecta al servidor primero');
      return;
    }

    pulseAnimation();
    setActiveButtons({ ...activeButtons, [buttonId]: true });
    
    // Enviar comando al servidor
    GrpcService.sendGamepadCommand(buttonId, 'PRESSED')
      .then(response => {
        console.log(`Botón ${buttonId} presionado:`, response);
      })
      .catch(error => {
        console.error(`Error al presionar botón ${buttonId}:`, error);
      });
  };

  const handleButtonRelease = (buttonId) => {
    if (!isConnected) return;
    
    setActiveButtons({ ...activeButtons, [buttonId]: false });
    
    // Enviar comando de liberación al servidor
    GrpcService.sendGamepadCommand(buttonId, 'RELEASED')
      .then(response => {
        console.log(`Botón ${buttonId} liberado:`, response);
      })
      .catch(error => {
        console.error(`Error al liberar botón ${buttonId}:`, error);
      });
  };

  // Renderizado del D-Pad (Cruceta direccional)
  const renderDPad = () => {
    return (
      <View style={styles.dpadContainer}>
        {/* Arriba */}
        <TouchableOpacity
          style={[styles.dpadButton, styles.upButton, activeButtons.UP && styles.activeButton]}
          onPressIn={() => handleButtonPress('UP')}
          onPressOut={() => handleButtonRelease('UP')}
        >
          <Text style={styles.buttonText}>▲</Text>
        </TouchableOpacity>
        
        {/* Fila central (izquierda, centro, derecha) */}
        <View style={styles.dpadRow}>
          <TouchableOpacity
            style={[styles.dpadButton, styles.leftButton, activeButtons.LEFT && styles.activeButton]}
            onPressIn={() => handleButtonPress('LEFT')}
            onPressOut={() => handleButtonRelease('LEFT')}
          >
            <Text style={styles.buttonText}>◀</Text>
          </TouchableOpacity>
          
          <View style={styles.dpadCenter} />
          
          <TouchableOpacity
            style={[styles.dpadButton, styles.rightButton, activeButtons.RIGHT && styles.activeButton]}
            onPressIn={() => handleButtonPress('RIGHT')}
            onPressOut={() => handleButtonRelease('RIGHT')}
          >
            <Text style={styles.buttonText}>▶</Text>
          </TouchableOpacity>
        </View>
        
        {/* Abajo */}
        <TouchableOpacity
          style={[styles.dpadButton, styles.downButton, activeButtons.DOWN && styles.activeButton]}
          onPressIn={() => handleButtonPress('DOWN')}
          onPressOut={() => handleButtonRelease('DOWN')}
        >
          <Text style={styles.buttonText}>▼</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderizado de los botones de acción
  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtonsContainer}>
        {/* Botones A y B */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buttonB, activeButtons.B && styles.activeButton]}
            onPressIn={() => handleButtonPress('B')}
            onPressOut={() => handleButtonRelease('B')}
          >
            <Animated.Text style={[styles.buttonText, { opacity: buttonOpacity }]}>B</Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.buttonA, activeButtons.A && styles.activeButton]}
            onPressIn={() => handleButtonPress('A')}
            onPressOut={() => handleButtonRelease('A')}
          >
            <Animated.Text style={[styles.buttonText, { opacity: buttonOpacity }]}>A</Animated.Text>
          </TouchableOpacity>
        </View>
        
        {/* Botones START y SELECT */}
        <View style={styles.menuButtonsContainer}>
          <TouchableOpacity
            style={[styles.menuButton, activeButtons.SELECT && styles.activeButton]}
            onPressIn={() => handleButtonPress('SELECT')}
            onPressOut={() => handleButtonRelease('SELECT')}
          >
            <Text style={styles.menuButtonText}>SELECT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuButton, activeButtons.START && styles.activeButton]}
            onPressIn={() => handleButtonPress('START')}
            onPressOut={() => handleButtonRelease('START')}
          >
            <Text style={styles.menuButtonText}>START</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Controlador completo */}
      <View style={styles.gamepadContainer}>
        {renderDPad()}
        {renderActionButtons()}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');
const buttonSize = Math.min(width, height) * 0.12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  gamepadContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // D-Pad styles
  dpadContainer: {
    width: buttonSize * 3.2,
    height: buttonSize * 3.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadButton: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: 8,
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: buttonSize * 3.2,
  },
  dpadCenter: {
    width: buttonSize,
    height: buttonSize,
  },
  upButton: {
    marginBottom: 5,
  },
  downButton: {
    marginTop: 5,
  },
  leftButton: {},
  rightButton: {},
  
  // Action button styles
  actionButtonsContainer: {
    alignItems: 'center',
  },
  actionButtons: {
    width: buttonSize * 2.5,
    height: buttonSize * 2.5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    width: buttonSize * 1.2,
    height: buttonSize * 1.2,
    borderRadius: buttonSize * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonA: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
  },
  buttonB: {
    backgroundColor: 'rgba(0, 0, 255, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  // Menu button styles
  menuButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  menuButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  menuButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Active state
  activeButton: {
    backgroundColor: 'rgba(100, 200, 100, 0.9)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default GamepadControls;
