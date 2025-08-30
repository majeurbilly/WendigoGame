import React, { useState } from 'react';
import { apiService } from '../services/api';
import './BackendTest.css';

// Interface pour les réponses de test
interface TestResponse {
  message?: string;
  timestamp?: string;
  status?: string;
  [key: string]: any;
}

// Composant pour tester la communication avec le backend C#
function BackendTest() {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backend-test">
      <h3>🔧 Test de Communication Backend</h3>
      
      <div className="test-buttons">
        <button 
          onClick={testBackendConnection}
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? '⏳ Test...' : '🔌 Tester la connexion'}
        </button>
        
        <button 
          onClick={testPing}
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? '⏳ Ping...' : '🏓 Tester Ping'}
        </button>
      </div>

      <div className="message">
        <p>{message}</p>
      </div>

      {response && (
        <div className="response">
          <h4>📡 Réponse du Backend :</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      <div className="info">
        <h4>ℹ️ Informations :</h4>
        <ul>
          <li><strong>Frontend :</strong> http://localhost:3000</li>
          <li><strong>Backend C# :</strong> https://localhost:7001</li>
          <li><strong>Endpoint testé :</strong> /api/test</li>
        </ul>
      </div>
    </div>
  );
}

export default BackendTest;
