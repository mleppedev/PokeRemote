import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const ConnectionStatus = ({ isConnected, latency, serverUrl }) => {
  const [statusAnimation] = React.useState(new Animated.Value(0));
  
  React.useEffect(() => {
    // Animación pulsante para el indicador de estado
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statusAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(statusAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    if (!isConnected) {
      pulse.start();
    } else {
      pulse.stop();
      Animated.timing(statusAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    return () => pulse.stop();
  }, [isConnected, statusAnimation]);
  
  const getLatencyColor = () => {
    if (!latency) return '#999';
    if (latency < 100) return '#4caf50';
    if (latency < 300) return '#ff9800';
    return '#f44336';
  };
  
  const indicatorScale = statusAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <Animated.View 
          style={[
            styles.statusIndicator, 
            { 
              backgroundColor: isConnected ? '#4caf50' : '#f44336',
              transform: [{ scale: isConnected ? 1 : indicatorScale }]
            }
          ]} 
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </Text>
        
        {isConnected && latency && (
          <View style={styles.latencyContainer}>
            <Text style={[styles.latencyText, { color: getLatencyColor() }]}>
              {latency} ms
            </Text>
          </View>
        )}
      </View>
      
      {serverUrl && (
        <Text style={styles.serverUrlText} numberOfLines={1} ellipsizeMode="middle">
          {serverUrl}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  latencyContainer: {
    marginLeft: 'auto',
  },
  latencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serverUrlText: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 4,
    maxWidth: 150,
  },
});

export default ConnectionStatus;
