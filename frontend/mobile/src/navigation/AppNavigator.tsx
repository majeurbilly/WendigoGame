import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import BackendTestScreen from '../screens/BackendTestScreen';

// Types pour la navigation
export type RootStackParamList = {
  Home: undefined;
  BackendTest: undefined;
  Game: undefined;
  Lobby: undefined;
  Login: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Écrans temporaires pour les fonctionnalités à développer
const GameScreen = () => (
  <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <h2>🎮 Écran de Jeu</h2>
    <p>En cours de développement...</p>
  </div>
);

const LobbyScreen = () => (
  <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <h2>🏠 Lobby</h2>
    <p>En cours de développement...</p>
  </div>
);

const LoginScreen = () => (
  <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <h2>🔐 Connexion</h2>
    <p>En cours de développement...</p>
  </div>
);

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Wendigo Game' }}
        />
        <Stack.Screen 
          name="BackendTest" 
          component={BackendTestScreen}
          options={{ title: 'Test Backend' }}
        />
        <Stack.Screen 
          name="Game" 
          component={GameScreen}
          options={{ title: 'Partie en cours' }}
        />
        <Stack.Screen 
          name="Lobby" 
          component={LobbyScreen}
          options={{ title: 'Lobby' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Connexion' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
