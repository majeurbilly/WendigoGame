import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🎮 Wendigo Game</Text>
          
          <Text style={styles.subtitle}>
            Bienvenue dans Wendigo Game !
          </Text>
          
          <Text style={styles.description}>
            Un jeu de société mystérieux et passionnant
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => navigation.navigate('Game')}
            >
              <Text style={styles.buttonText}>🎯 Commencer une partie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Lobby')}
            >
              <Text style={styles.buttonText}>🏠 Rejoindre un lobby</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.infoButton]}
              onPress={() => navigation.navigate('BackendTest')}
            >
              <Text style={styles.buttonText}>🔧 Test Backend</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>✨ Fonctionnalités :</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎭</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>29 Rôles Uniques</Text>
                <Text style={styles.featureDescription}>
                  Chaque partie offre une expérience différente
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⚡</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Gestion Automatique</Text>
                <Text style={styles.featureDescription}>
                  Phases, pouvoirs et équilibrage automatiques
                </Text>
              </View>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌐</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Multijoueur</Text>
                <Text style={styles.featureDescription}>
                  Jouez avec vos amis en ligne
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>ℹ️ Informations :</Text>
            <Text style={styles.infoText}>
              Version Mobile - React Native
            </Text>
            <Text style={styles.infoText}>
              Connecté au backend C# .NET
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 40,
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  infoButton: {
    backgroundColor: '#f39c12',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 30,
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default HomeScreen;
