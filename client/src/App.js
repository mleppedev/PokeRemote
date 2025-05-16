import { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet
} from 'react-native';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import StreamScreen from './screens/StreamScreen';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [serverAddress, setServerAddress] = useState('192.168.1.100');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onConnect={(address) => {
              setServerAddress(address);
              setCurrentScreen('stream');
            }}
            onSettingsPress={() => setCurrentScreen('settings')}
          />
        );
      case 'stream':
        return (
          <StreamScreen
            serverAddress={serverAddress}
            onDisconnect={() => setCurrentScreen('home')}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen('home')}
          />
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {renderScreen()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default App;