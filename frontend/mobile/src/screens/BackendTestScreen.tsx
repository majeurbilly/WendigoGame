import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiService, TestResponse } from '../services/api';

// Écran pour tester la communication avec le backend C#
const BackendTestScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TestResponse | { error: string } | null>(null);

  // Test de connexion au backend
  const testBackendConnection = async () => {
    setIsLoading(true);
    setMessage('🔄 Test de connexion au backend C#...');
    
    try {
      // Test simple GET vers votre backend
      const result = await apiService.get<TestResponse>('/api/test');
      setResponse(result);
      setMessage('✅ Connexion réussie ! Le backend C# répond.');
    } catch (error) {
      setMessage('❌ Erreur de connexion au backend C#');
      setResponse({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
      Alert.alert('Erreur', 'Impossible de se connecter au backend C#');
    } finally {
      setIsLoading(false);
    }
  };

  // Test ping
  const testPing = async () => {
    setIsLoading(true);
    setMessage('🏓 Envoi d\'un ping...');
    
    try {
      const result = await apiService.get<TestResponse>('/api/test/ping');
      setResponse(result);
      setMessage('✅ Ping réussi !');
    } catch (error) {
      setMessage('❌ Erreur de ping');
      setResponse({ error: error instanceof Error ? error.message : 'Erreur inconnue' });
      Alert.alert('Erreur', 'Erreur lors du ping');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔧 Test de Communication Backend</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={testBackendConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '⏳ Test...' : '🔌 Tester la connexion'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={testPing}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '⏳ Ping...' : '🏓 Tester Ping'}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Test en cours...</Text>
          </View>
        )}

        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>📡 Réponse du Backend :</Text>
            <View style={styles.responseBox}>
              <Text style={styles.responseText}>
                {JSON.stringify(response, null, 2)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Informations :</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Frontend :</Text> http://localhost:3000
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Backend C# :</Text> https://localhost:7001
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Endpoint testé :</Text> /api/test
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  messageContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  responseContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  responseBox: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  responseText: {
    fontSize: 12,
    color: '#495057',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
});

export default BackendTestScreen;
